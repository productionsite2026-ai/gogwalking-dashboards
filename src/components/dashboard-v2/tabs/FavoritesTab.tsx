import { Heart, Star, MapPin, MessageCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import avatarWalker from "@/assets/avatar-walker.jpg";
import StarRating from "../StarRating";
import { toast } from "sonner";

const DEMO_FAVORITES = [
  { id: "1", name: "Lucas M.", rating: 4.9, reviews: 89, avatar: null, city: "Paris", price: 15, verified: true },
  { id: "2", name: "Sophie B.", rating: 4.7, reviews: 34, avatar: null, city: "Lyon", price: 12, verified: true },
  { id: "3", name: "Emma P.", rating: 4.5, reviews: 21, avatar: null, city: "Marseille", price: 18, verified: false },
];

const FavoritesTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("favorites")
        .select("*, walker:walker_id(id, user_id)")
        .eq("user_id", user.id);
      if (!data || data.length === 0) return [];
      const walkerIds = data.map((f: any) => f.walker_id);
      const { data: profiles } = await supabase
        .from("walker_profiles")
        .select("*, profiles:user_id(first_name, last_name, avatar_url, city)")
        .in("user_id", walkerIds);
      return (profiles || []).map((p: any) => ({
        id: p.user_id,
        name: `${p.profiles?.first_name || "Promeneur"} ${(p.profiles?.last_name || "")[0] || ""}.`,
        rating: Number(p.rating || 0),
        reviews: p.total_reviews || 0,
        avatar: p.profiles?.avatar_url,
        city: p.profiles?.city || "",
        price: p.hourly_rate || 15,
        verified: p.verified || false,
      }));
    },
    enabled: !!user,
  });

  const removeFavorite = useMutation({
    mutationFn: async (walkerId: string) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("walker_id", walkerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Retiré des favoris");
    },
  });

  const list = !user || favorites.length === 0 ? DEMO_FAVORITES : favorites;

  return (
    <div className="px-4 py-6 space-y-4 pb-24">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[hsl(var(--heart))]" />
          <h2 className="text-lg font-black text-foreground">Mes Favoris</h2>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{list.length}</span>
        </div>
        <button onClick={() => navigate("/find-walkers")} className="text-xs font-bold text-primary">
          Découvrir +
        </button>
      </div>

      {list.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-semibold">Aucun favori pour le moment</p>
          <p className="text-xs text-muted-foreground mt-1">Ajoutez des promeneurs en favoris depuis la recherche</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/find-walkers")}
            className="mt-4 px-4 py-2 rounded-full gradient-primary text-white text-xs font-bold">
            🔍 Trouver des promeneurs
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {list.map((w: any, i: number) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-2xl shadow-card p-4 flex items-center gap-3"
            >
              <div className="relative shrink-0">
                <img
                  src={w.avatar || avatarWalker}
                  alt={w.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                  loading="lazy"
                />
                {w.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full gradient-primary border-2 border-card flex items-center justify-center">
                    <span className="text-[6px] text-white">✓</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-foreground">{w.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StarRating rating={Math.round(w.rating)} />
                  <span className="text-[10px] text-muted-foreground">({w.reviews})</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {w.city}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-sm font-black text-foreground">{w.price}€<span className="text-[9px] text-muted-foreground font-normal">/h</span></span>
                <div className="flex gap-1.5">
                  {user && (
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => removeFavorite.mutate(w.id)}
                      className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Heart className="w-3 h-3 text-destructive fill-destructive" />
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(`/book/${w.id}`)}
                    className="px-3 py-1.5 rounded-full gradient-primary text-white text-[10px] font-bold"
                  >
                    Réserver
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;
