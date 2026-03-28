import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, ArrowLeft, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRealtimeMessages, Conversation } from "@/hooks/useRealtimeMessages";
import { cn } from "@/lib/utils";

const MessagesTab = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    conversations,
    loading,
    currentUserId,
    sendMessage,
    startTyping,
    stopTyping,
    isUserTyping,
    isUserOnline,
  } = useRealtimeMessages(selectedConversation?.otherParticipant?.id);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const filtered = conversations.filter(c =>
    c.otherParticipant?.first_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation?.otherParticipant?.id) return;
    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);
    stopTyping(selectedConversation.otherParticipant.id);
    const { success } = await sendMessage(content, selectedConversation.otherParticipant.id);
    if (!success) setNewMessage(content);
    setSending(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (selectedConversation?.otherParticipant?.id && e.target.value) {
      startTyping(selectedConversation.otherParticipant.id);
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Maintenant";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  // Conversation list view
  if (!selectedConversation) {
    return (
      <div className="px-4 py-6 pb-24 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-black text-foreground">Messages</h2>
          {conversations.some(c => c.unreadCount > 0) && (
            <span className="text-[10px] font-bold text-white bg-destructive rounded-full px-1.5 py-0.5">
              {conversations.reduce((s, c) => s + c.unreadCount, 0)}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <motion.div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">Aucune conversation</p>
            <p className="text-xs text-muted-foreground mt-1">Vos échanges apparaîtront ici</p>
          </motion.div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((conv, i) => {
              const online = isUserOnline(conv.id);
              const typing = isUserTyping(conv.id);
              return (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setSelectedConversation(conv); setTimeout(() => inputRef.current?.focus(), 100); }}
                  className={cn(
                    "w-full bg-card rounded-2xl shadow-card p-3 flex items-center gap-3 text-left transition-all hover:shadow-card-hover",
                    conv.unreadCount > 0 && "border border-primary/20"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.otherParticipant?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {conv.otherParticipant?.first_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{conv.otherParticipant?.first_name || "Utilisateur"}</span>
                      <span className="text-[9px] text-muted-foreground">{formatTime(conv.lastMessage?.created_at || null)}</span>
                    </div>
                    {typing ? (
                      <p className="text-xs text-primary italic">Écrit...</p>
                    ) : (
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage?.sender_id === currentUserId && "Vous : "}
                        {conv.lastMessage?.content || "Démarrer la conversation"}
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Chat view
  const partner = selectedConversation.otherParticipant;
  const partnerTyping = partner?.id ? isUserTyping(partner.id) : false;
  const partnerOnline = partner?.id ? isUserOnline(partner.id) : false;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pb-16">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b bg-card flex items-center gap-3">
        <button onClick={() => setSelectedConversation(null)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <Avatar className="w-9 h-9">
            <AvatarImage src={partner?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{partner?.first_name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {partnerOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />}
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">{partner?.first_name || "Utilisateur"}</p>
          <p className="text-[10px] text-muted-foreground">
            {partnerTyping ? <span className="text-primary italic">Écrit...</span> : partnerOnline ? <span className="text-green-600">En ligne</span> : "Hors ligne"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Commencez la conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div className={cn(
                  "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm",
                  isOwn
                    ? "gradient-primary text-white rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={cn("text-[9px] mt-1", isOwn ? "text-white/60" : "text-muted-foreground")}>
                    {new Date(msg.created_at || "").toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {isOwn && msg.read && " ✓✓"}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        {partnerTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-3 py-2">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/30"
                animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t bg-card">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Écrire un message..."
            className="flex-1 px-4 py-2.5 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={sending}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default MessagesTab;
