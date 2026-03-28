import { Home, Heart, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import WalkManagementSheet from "@/components/dashboard/shared/WalkManagementSheet";

interface BottomNavProps {
  role: "owner" | "walker";
  activeMission?: {
    id: string;
    dogName: string;
    dogPhoto?: string;
    ownerName: string;
    duration: number;
    status: string;
  } | null;
}

const BottomNav = ({ role, activeMission }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [walkSheetOpen, setWalkSheetOpen] = useState(false);

  const basePath = role === "owner" ? "/dashboard" : "/walker/dashboard";

  const ownerItems = [
    { icon: Home, label: "Accueil", path: basePath },
    { icon: Heart, label: "Favoris", path: `${basePath}?tab=favoris` },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: User, label: "Profil", path: `${basePath}?tab=profil` },
  ];

  const walkerItems = [
    { icon: Home, label: "Accueil", path: basePath },
    { icon: Home, label: "Missions", path: `${basePath}?tab=missions` },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: User, label: "Profil", path: `${basePath}?tab=profil` },
  ];

  const items = role === "owner" ? ownerItems : walkerItems;

  const isActive = (path: string) => {
    if (path === basePath && location.pathname === basePath && !location.search) return true;
    if (path.includes("?") && location.pathname + location.search === path) return true;
    if (path === "/messages" && location.pathname === "/messages") return true;
    return false;
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex items-center justify-around relative h-16">
          {items.slice(0, 2).map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-3 px-4 transition-all duration-200 relative ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="bottomnav-indicator"
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full gradient-primary"
                  />
                )}
              </button>
            );
          })}

          {/* GO button - opens WalkManagementSheet */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => setWalkSheetOpen(true)}
            className={`absolute -top-7 left-1/2 -translate-x-1/2 w-[60px] h-[60px] rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-glow-primary border-4 border-card ${
              activeMission ? "animate-pulse" : ""
            }`}
          >
            <span className="text-lg font-black tracking-tight">GO</span>
          </motion.button>
          <div className="w-16" />

          {items.slice(2).map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-3 px-4 transition-all duration-200 relative ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="bottomnav-indicator"
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full gradient-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <WalkManagementSheet
        open={walkSheetOpen}
        onOpenChange={setWalkSheetOpen}
        activeMission={activeMission}
      />
    </>
  );
};

export default BottomNav;
