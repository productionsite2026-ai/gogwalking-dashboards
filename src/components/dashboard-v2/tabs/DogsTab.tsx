import { Plus, Dog, Weight, Ruler, Syringe, Camera, RefreshCw, Trash2, Edit3, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useDogs, useAddDog, useDeleteDog } from "@/hooks/useNewDogs";
import { mockDogs } from "@/data/demoData";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import dogGolden from "@/assets/dog-golden.jpg";

const DogsTab = () => {
  const { user } = useAuth();
  const { data: realDogs = [] } = useDogs();
  const addDog = useAddDog();
  const deleteDog = useDeleteDog();
  const queryClient = useQueryClient();
  const isDemo = !user;
  const dogs = isDemo ? mockDogs : realDogs;
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [uploadingDogId, setUploadingDogId] = useState<string | null>(null);
  const [deletingDogId, setDeletingDogId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!user) return toast.error("Connectez-vous");
    if (!name.trim()) return toast.error("Nom requis");
    try {
      await addDog.mutateAsync({
        name,
        breed: breed || null,
        age: age ? Number(age) : null,
        weight: weight ? Number(weight) : null,
        special_needs: specialNeeds || null,
      });
      toast.success(`${name} ajouté !`);
      setName(""); setBreed(""); setAge(""); setWeight(""); setSpecialNeeds(""); setShowForm(false);
    } catch { toast.error("Erreur lors de l'ajout"); }
  };

  const handleDelete = async (dogId: string, dogName: string) => {
    if (!user) return;
    setDeletingDogId(dogId);
    try {
      await deleteDog.mutateAsync(dogId);
      toast.success(`${dogName} supprimé`);
    } catch { toast.error("Erreur de suppression"); }
    finally { setDeletingDogId(null); }
  };

  const handlePhotoUpload = async (file: File, dogId: string, dogName: string) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) { toast.error("Format non supporté"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image trop volumineuse (max 5MB)"); return; }

    setUploadingDogId(dogId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${dogId}/photo_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('dog-photos').getPublicUrl(fileName);

      await supabase.from('dogs').update({
        photo_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      }).eq('id', dogId);

      queryClient.invalidateQueries({ queryKey: ["dogs"] });
      toast.success(`Photo de ${dogName} mise à jour !`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingDogId(null);
    }
  };

  return (
    <div className="px-4 py-6 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dog className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-black text-foreground">Mes Chiens</h2>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{dogs.length}</span>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full gradient-primary text-white text-xs font-bold shadow-card">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Fermer" : "Ajouter"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-2xl shadow-card p-4 space-y-2 overflow-hidden">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du chien *"
              className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={breed} onChange={e => setBreed(e.target.value)} placeholder="Race (ex: Labrador)"
              className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="grid grid-cols-2 gap-2">
              <input value={age} onChange={e => setAge(e.target.value)} placeholder="Âge (ans)" type="number" min="0"
                className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="Poids (kg)" type="number" min="0"
                className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <input value={specialNeeds} onChange={e => setSpecialNeeds(e.target.value)} placeholder="Besoins spéciaux (optionnel)"
              className="w-full px-3 py-2.5 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted/50 transition-colors">Annuler</button>
              <button onClick={handleAdd} disabled={addDog.isPending}
                className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold disabled:opacity-50">
                {addDog.isPending ? "Ajout..." : "✓ Ajouter"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && selectedDogId) {
            const dog = dogs.find((d: any) => d.id === selectedDogId);
            handlePhotoUpload(f, selectedDogId, dog?.name || "Chien");
          }
          e.target.value = '';
        }}
      />

      {dogs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Dog className="w-8 h-8 text-primary/40" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Ajoutez votre premier chien</p>
          <p className="text-xs text-muted-foreground mt-1">Cliquez sur "Ajouter" pour commencer</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {dogs.map((dog: any, i: number) => (
            <motion.div key={dog.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="flex">
                {/* Photo with upload */}
                <div className="relative w-28 h-28 shrink-0 group">
                  <img src={dog.photo_url || dogGolden} alt={dog.name}
                    className="w-full h-full object-cover" loading="lazy" />
                  {uploadingDogId === dog.id ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    </div>
                  ) : !isDemo && (
                    <button
                      onClick={() => { setSelectedDogId(dog.id); fileInputRef.current?.click(); }}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors"
                    >
                      <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">{dog.name}</h3>
                      {!isDemo && (
                        <button
                          onClick={() => handleDelete(dog.id, dog.name)}
                          disabled={deletingDogId === dog.id}
                          className="text-destructive/60 hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{dog.breed || "Race inconnue"}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
                    {dog.age && <span className="flex items-center gap-0.5 bg-muted rounded-full px-2 py-0.5"><Ruler className="w-3 h-3" /> {dog.age} ans</span>}
                    {dog.weight && <span className="flex items-center gap-0.5 bg-muted rounded-full px-2 py-0.5"><Weight className="w-3 h-3" /> {dog.weight} kg</span>}
                    {dog.vaccinations_up_to_date && (
                      <span className="flex items-center gap-0.5 bg-primary/10 text-primary rounded-full px-2 py-0.5"><Syringe className="w-3 h-3" /> Vacciné</span>
                    )}
                  </div>
                  {dog.special_needs && (
                    <p className="text-[9px] text-amber-600 mt-1 bg-amber-500/10 rounded-lg px-2 py-1">⚠️ {dog.special_needs}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DogsTab;
