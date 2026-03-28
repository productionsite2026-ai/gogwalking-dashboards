import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Play, Square, Camera, MessageCircle, Clock, CheckCircle, 
  AlertTriangle, PawPrint, Timer, Upload, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type WalkPhase = 'idle' | 'starting' | 'in_progress' | 'ending' | 'completed';

interface WalkManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeMission?: {
    id: string;
    dogName: string;
    dogPhoto?: string;
    ownerName: string;
    duration: number;
    status: string;
  } | null;
}

const WalkManagementSheet = ({ open, onOpenChange, activeMission }: WalkManagementSheetProps) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<WalkPhase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [endCode, setEndCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (phase === 'in_progress') {
      interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartWalk = () => {
    setPhase('starting');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeMission) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${activeMission.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('walk-proofs')
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      toast({ title: "Erreur upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    // Save proof record
    const photoType = phase === 'starting' ? 'start' : 'during';
    await supabase.from('walk_proofs').insert({
      booking_id: activeMission.id,
      walker_id: user.id,
      photo_url: path,
      photo_type: photoType,
      status: 'pending',
    });

    setPhotoUrls(prev => [...prev, path]);
    toast({ title: "Photo enregistrée ✓", description: `${photoUrls.length + 1} photo(s)` });
    setUploading(false);
  };

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  // Simulate photo for demo mode (no user)
  const handleDemoPhoto = () => {
    const fakeUrl = `demo_photo_${Date.now()}`;
    setPhotoUrls(prev => [...prev, fakeUrl]);
    toast({ title: "Photo ajoutée (démo)", description: `${photoUrls.length + 1} photo(s)` });
  };

  const handleConfirmStart = async () => {
    if (photoUrls.length === 0) {
      toast({ title: "📸 Photo obligatoire", description: "Prenez une photo de prise en charge du chien avant de démarrer", variant: "destructive" });
      return;
    }

    // Update booking status to in_progress
    if (user && activeMission) {
      await supabase.from('bookings').update({ status: 'in_progress' }).eq('id', activeMission.id);
    }

    setPhase('in_progress');
    setElapsed(0);
    toast({ title: "🚀 Mission démarrée !", description: "Le chronomètre est lancé. Bonne promenade !" });
  };

  const handleEndWalk = () => {
    if (!message.trim()) {
      toast({ title: "💬 Message obligatoire", description: "Rédigez un compte-rendu de la promenade avant de terminer", variant: "destructive" });
      return;
    }
    if (photoUrls.length < 2) {
      toast({ title: "📸 Photo supplémentaire requise", description: "Ajoutez au moins une photo pendant la promenade", variant: "destructive" });
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setEndCode(code);
    setPhase('ending');
  };

  const handleConfirmEnd = async () => {
    if (user && activeMission) {
      await supabase.from('bookings').update({
        status: 'completed',
        notes: message,
      }).eq('id', activeMission.id);

      // Send notification to owner
      const { data: booking } = await supabase.from('bookings').select('owner_id').eq('id', activeMission.id).single();
      if (booking) {
        await supabase.from('notifications').insert({
          user_id: booking.owner_id,
          title: 'Mission terminée ✅',
          message: `La promenade de ${activeMission.dogName} est terminée. Code de fin : ${endCode}`,
          type: 'booking',
          link: `/bookings/${activeMission.id}`,
        });
      }
    }

    setPhase('completed');
    toast({ title: "🎉 Mission terminée !", description: `Code de fin : ${endCode}. Le propriétaire sera notifié.` });
  };

  const handleReset = () => {
    setPhase('idle');
    setElapsed(0);
    setMessage('');
    setPhotoUrls([]);
    setEndCode('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0" aria-describedby="walk-sheet-desc">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-5 pb-3 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <PawPrint className="h-5 w-5 text-primary" />
                Gestion de Promenade
              </SheetTitle>
              <Badge variant={phase === 'in_progress' ? 'default' : 'secondary'} className="font-semibold">
                {phase === 'idle' && '⏳ En attente'}
                {phase === 'starting' && '📷 Prise en charge'}
                {phase === 'in_progress' && '🏃 En cours'}
                {phase === 'ending' && '✅ Finalisation'}
                {phase === 'completed' && '🎉 Terminée'}
              </Badge>
            </div>
            <SheetDescription id="walk-sheet-desc" className="sr-only">
              Gérez le déroulement de votre promenade étape par étape
            </SheetDescription>
          </SheetHeader>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {/* IDLE */}
              {phase === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-6">
                  {activeMission ? (
                    <>
                      <div className="text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-primary/20">
                          <AvatarImage src={activeMission.dogPhoto} />
                          <AvatarFallback className="bg-primary/10 text-3xl">🐕</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold">{activeMission.dogName}</h3>
                        <p className="text-sm text-muted-foreground">Propriétaire : {activeMission.ownerName}</p>
                        <p className="text-sm text-muted-foreground">{activeMission.duration} minutes</p>
                      </div>
                      <Button onClick={handleStartWalk} size="lg" className="w-full max-w-xs h-14 text-lg font-bold rounded-2xl shadow-lg gradient-primary text-white">
                        <Play className="h-6 w-6 mr-2" /> Démarrer la mission
                      </Button>
                    </>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <PawPrint className="h-10 w-10 text-primary/40" />
                      </div>
                      <h3 className="text-lg font-semibold">Aucune mission active</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Acceptez une réservation depuis votre planning pour démarrer une mission ici.
                      </p>
                      <div className="bg-muted/50 rounded-2xl p-4 text-left space-y-2 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">📋 Comment ça marche :</p>
                        <p>1. 📸 Photo obligatoire au départ</p>
                        <p>2. ⏱ Chronomètre automatique</p>
                        <p>3. 📸 Photos pendant la promenade</p>
                        <p>4. 💬 Compte-rendu obligatoire</p>
                        <p>5. 🔑 Code unique de fin de service</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STARTING */}
              {phase === 'starting' && (
                <motion.div key="starting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Photo de prise en charge</h3>
                    <p className="text-sm text-muted-foreground">Prenez une photo du chien au départ <span className="text-destructive font-bold">(obligatoire)</span></p>
                  </div>

                  {photoUrls.length > 0 && (
                    <div className="flex gap-2 justify-center flex-wrap">
                      {photoUrls.map((_, i) => (
                        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/30">
                          <CheckCircle className="h-6 w-6 text-primary" />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={user ? handleTakePhoto : handleDemoPhoto}
                    variant="outline"
                    className="w-full h-14 text-base border-dashed border-2 gap-3"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <><Upload className="h-5 w-5 animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><Camera className="h-5 w-5" /> Prendre une photo</>
                    )}
                  </Button>

                  <Button onClick={handleConfirmStart} className="w-full h-12 text-base font-bold rounded-xl gradient-primary text-white" disabled={photoUrls.length === 0}>
                    <Play className="h-5 w-5 mr-2" /> Confirmer le départ
                  </Button>
                </motion.div>
              )}

              {/* IN_PROGRESS */}
              {phase === 'in_progress' && (
                <motion.div key="progress" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="text-center py-4">
                    <motion.div
                      className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center mx-auto mb-4 relative"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-primary/20"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div>
                        <Timer className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-2xl font-mono font-bold text-foreground">{formatTime(elapsed)}</p>
                      </div>
                    </motion.div>
                    <Badge className="text-sm font-semibold gradient-primary text-white border-0">🏃 Promenade en cours</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={user ? handleTakePhoto : handleDemoPhoto}
                      variant="outline"
                      className="h-14 flex-col gap-1"
                      disabled={uploading}
                    >
                      <Camera className="h-5 w-5 text-primary" />
                      <span className="text-xs font-bold">Photo ({photoUrls.length})</span>
                    </Button>
                    <Button variant="outline" className="h-14 flex-col gap-1 border-destructive/30 hover:bg-destructive/10">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="text-xs font-bold text-destructive">Incident</span>
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      Compte-rendu <span className="text-destructive">(obligatoire)</span>
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Comment s'est passée la promenade ? Comportement du chien, lieux visités..."
                      className="min-h-[100px] rounded-xl"
                    />
                  </div>

                  <Button onClick={handleEndWalk} variant="destructive" className="w-full h-12 text-base font-bold rounded-xl">
                    <Square className="h-5 w-5 mr-2" /> Terminer la promenade
                  </Button>
                </motion.div>
              )}

              {/* ENDING */}
              {phase === 'ending' && (
                <motion.div key="ending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold">Code de fin de mission</h3>
                    <p className="text-sm text-muted-foreground">Communiquez ce code au propriétaire pour valider</p>
                  </div>
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
                    <p className="text-4xl font-mono font-bold tracking-[0.3em] text-primary">{endCode}</p>
                  </motion.div>
                  <div className="text-left bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                    <p>📸 <strong>{photoUrls.length}</strong> photo(s) envoyée(s)</p>
                    <p>⏱ Durée : <strong>{formatTime(elapsed)}</strong></p>
                    <p>💬 Compte-rendu : <strong>envoyé</strong></p>
                  </div>
                  <Button onClick={handleConfirmEnd} className="w-full h-12 text-base font-bold rounded-xl gradient-primary text-white">
                    ✅ Confirmer la fin de mission
                  </Button>
                </motion.div>
              )}

              {/* COMPLETED */}
              {phase === 'completed' && (
                <motion.div key="completed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="h-12 w-12 text-primary" />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-1">Mission terminée ! 🎉</h3>
                    <p className="text-sm text-muted-foreground mb-2">Le propriétaire a été notifié.</p>
                    <p className="text-xs text-muted-foreground">Le paiement sera crédité sous 48h après validation.</p>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Code de fin</p>
                    <p className="text-xl font-mono font-bold text-primary tracking-wider">{endCode}</p>
                  </div>
                  <Button onClick={handleReset} className="w-full max-w-xs h-12 text-base rounded-xl">
                    Fermer
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WalkManagementSheet;
