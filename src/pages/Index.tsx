import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/db7d005f-b0c0-456f-a491-f85ce8247fa3";
const CHAT_URL = "https://functions.poehali.dev/edaf2059-1bc0-41c1-a668-0a0bae69faf3";
const AVATAR_URL = "https://functions.poehali.dev/a6908e4a-96f8-4d74-a8c6-fea073d3d01b";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: string;
  token: string;
}

interface ChatUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: string;
  time: string;
  out: boolean;
  is_read?: boolean;
}

interface Dialog {
  partner_id: number;
  last_text: string;
  last_time: string;
  last_sender_id: number;
  partner_name: string;
  partner_avatar: string;
  partner_status: string;
  unread: number;
}

type Tab = "chats" | "contacts" | "search" | "profile" | "settings";

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
}

const AVATAR_COLORS = [
  "from-purple-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-teal-500",
  "from-yellow-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-purple-500",
  "from-teal-500 to-cyan-500",
];

function getColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function Avatar({ name, id, size = "md", status, avatar }: { name: string; id: number; size?: "sm" | "md" | "lg" | "xl"; status?: string; avatar?: string }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };
  const dotSizes = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3", xl: "w-3.5 h-3.5" };
  const statusColors: Record<string, string> = { online: "bg-green-400", offline: "bg-gray-500", away: "bg-yellow-400" };
  return (
    <div className="relative flex-shrink-0">
      {avatar ? (
        <img src={avatar} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${getColor(id)} flex items-center justify-center font-semibold text-white`}>
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-background ${statusColors[status] ?? "bg-gray-500"}`} />
      )}
    </div>
  );
}

/* ─── AUTH SCREEN ─── */
function AuthScreen({ onAuth }: { onAuth: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    const body: Record<string, string> = { email, password };
    if (mode === "register") body.name = name;

    const res = await fetch(`${AUTH_URL}/?action=${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Ошибка. Попробуйте снова."); return; }
    const user = { ...data.user, token: data.token };
    localStorage.setItem("pulse_user", JSON.stringify(user));
    onAuth(user);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/25 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-4 glow-purple">
            <Icon name="Zap" size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Pulse</h1>
          <p className="text-muted-foreground text-sm mt-1">Мессенджер нового поколения</p>
        </div>
        <div className="glass-strong rounded-3xl p-6 space-y-4">
          <div className="flex glass rounded-2xl p-1">
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${mode === m ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white" : "text-muted-foreground hover:text-foreground"}`}>
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>
          {mode === "register" && (
            <div className="relative animate-fade-in">
              <Icon name="User" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-muted-foreground" />
            </div>
          )}
          <div className="relative">
            <Icon name="Mail" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-muted-foreground" />
          </div>
          <div className="relative">
            <Icon name="Lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Пароль" className="w-full bg-muted/50 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-muted-foreground" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name={showPw ? "EyeOff" : "Eye"} size={16} />
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-3 py-2 animate-fade-in">
              <Icon name="AlertCircle" size={14} /> {error}
            </div>
          )}
          <button onClick={submit} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition-all glow-purple disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{mode === "login" ? "Входим..." : "Создаём..."}</> : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">Нажимая продолжить, вы соглашаетесь с условиями использования</p>
      </div>
    </div>
  );
}

/* ─── CALL MODAL ─── */
function CallModal({ name, userId, type, onClose }: { name: string; userId: number; type: "voice" | "video"; onClose: () => void }) {
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong rounded-3xl p-8 w-80 flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-cyan-900/20 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className={`relative ${active ? "animate-call-pulse" : ""}`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 scale-125 animate-pulse" />
            <Avatar name={name} id={userId} size="xl" />
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{name}</div>
            <div className="text-muted-foreground text-sm">
              {active ? <div className="flex items-center gap-1.5 justify-center">{[1,2,3,4,5,6].map(i => <div key={i} className="wave-bar w-0.5 bg-cyan-400 rounded-full" style={{height:"4px"}} />)}</div> : type === "voice" ? "Голосовой вызов..." : "Видеозвонок..."}
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => setMuted(!muted)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${muted ? "bg-red-500/20 text-red-400" : "glass text-foreground hover:bg-white/10"}`}><Icon name={muted ? "MicOff" : "Mic"} size={18} /></button>
          {type === "video" && <button onClick={() => setCameraOff(!cameraOff)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${cameraOff ? "bg-red-500/20 text-red-400" : "glass text-foreground hover:bg-white/10"}`}><Icon name={cameraOff ? "VideoOff" : "Video"} size={18} /></button>}
          <button onClick={() => setActive(!active)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${active ? "bg-green-500 hover:bg-green-600" : "bg-gradient-to-br from-purple-500 to-cyan-500 hover:opacity-90"}`}><Icon name={active ? "PhoneCall" : "Phone"} size={22} className="text-white" /></button>
          <button onClick={() => setSpeakerOff(!speakerOff)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${speakerOff ? "bg-red-500/20 text-red-400" : "glass text-foreground hover:bg-white/10"}`}><Icon name={speakerOff ? "VolumeX" : "Volume2"} size={18} /></button>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all"><Icon name="PhoneOff" size={18} /></button>
        </div>
      </div>
    </div>
  );
}

/* ─── CHAT VIEW ─── */
function ChatView({ me, partner, onBack }: { me: AuthUser; partner: ChatUser; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [call, setCall] = useState<"voice" | "video" | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<string>("");

  const headers = { "Content-Type": "application/json", "X-User-Id": String(me.id) };

  const fetchHistory = useCallback(async (initial = false) => {
    const url = initial
      ? `${CHAT_URL}/?action=history&with=${partner.id}`
      : `${CHAT_URL}/?action=history&with=${partner.id}${lastTimeRef.current ? `&since=${encodeURIComponent(lastTimeRef.current)}` : ""}`;

    const res = await fetch(url, { headers });
    if (!res.ok) return;
    const data = await res.json();
    const msgs: Message[] = data.messages || [];

    if (msgs.length > 0) {
      lastTimeRef.current = msgs[msgs.length - 1].time;
      if (initial) {
        setMessages(msgs);
      } else {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          const newMsgs = msgs.filter(m => !ids.has(m.id));
          return newMsgs.length ? [...prev, ...newMsgs] : prev;
        });
      }
    }
  }, [partner.id, me.id]);

  useEffect(() => {
    fetchHistory(true);
    const interval = setInterval(() => fetchHistory(false), 2000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText("");

    const optimistic: Message = { id: Date.now(), sender_id: me.id, receiver_id: partner.id, text: t, time: new Date().toISOString(), out: true };
    setMessages(prev => [...prev, optimistic]);

    await fetch(`${CHAT_URL}/?action=send`, {
      method: "POST",
      headers,
      body: JSON.stringify({ receiver_id: partner.id, text: t }),
    });
    setSending(false);
    fetchHistory(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="glass border-b border-border flex items-center gap-3 px-4 py-3 flex-shrink-0">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <Avatar name={partner.name} id={partner.id} size="sm" status={partner.status} avatar={partner.avatar} />
        <div className="flex-1">
          <div className="font-semibold text-sm">{partner.name}</div>
          <div className={`text-xs ${partner.status === "online" ? "text-green-400" : "text-muted-foreground"}`}>
            {partner.status === "online" ? "В сети" : "Не в сети"}
          </div>
        </div>
        <button onClick={() => setCall("voice")} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-cyan-400 transition-colors"><Icon name="Phone" size={16} /></button>
        <button onClick={() => setCall("video")} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-colors"><Icon name="Video" size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            <Avatar name={partner.name} id={partner.id} size="lg" avatar={partner.avatar} />
            <p className="text-sm text-muted-foreground">Начните диалог с {partner.name}</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${msg.out ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-sm" : "glass text-foreground rounded-bl-sm"}`}>
              <p className="break-words">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.out ? "text-purple-200" : "text-muted-foreground"}`}>{fmtTime(msg.time)}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 flex-shrink-0 border-t border-border">
        <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Сообщение..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          <button onClick={send} disabled={!text.trim() || sending} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40">
            <Icon name="Send" size={14} className="text-white" />
          </button>
        </div>
      </div>

      {call && <CallModal name={partner.name} userId={partner.id} type={call} onClose={() => setCall(null)} />}
    </div>
  );
}

/* ─── CHATS TAB ─── */
function ChatsTab({ me, onOpenChat }: { me: AuthUser; onOpenChat: (u: ChatUser) => void }) {
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { "X-User-Id": String(me.id) };

  const fetchDialogs = useCallback(async () => {
    const res = await fetch(`${CHAT_URL}/?action=dialogs`, { headers });
    if (res.ok) { const d = await res.json(); setDialogs(d.dialogs || []); }
  }, [me.id]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [ru, rl] = await Promise.all([
        fetch(`${CHAT_URL}/?action=users`, { headers }),
        fetch(`${CHAT_URL}/?action=dialogs`, { headers }),
      ]);
      if (ru.ok) { const d = await ru.json(); setUsers(d.users || []); }
      if (rl.ok) { const d = await rl.json(); setDialogs(d.dialogs || []); }
      setLoading(false);
    };
    fetchAll();
    const interval = setInterval(fetchDialogs, 3000);
    return () => clearInterval(interval);
  }, [fetchDialogs]);

  const getUserById = (id: number) => users.find(u => u.id === id);

  const handleOpen = (partnerId: number, name: string, avatar: string, status: string) => {
    const u = getUserById(partnerId) || { id: partnerId, name, email: "", avatar, status };
    onOpenChat(u);
  };

  if (loading) return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2"><h1 className="text-2xl font-bold text-gradient">Сообщения</h1></div>
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
    </div>
  );

  const totalUnread = dialogs.reduce((a, d) => a + (d.unread || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Сообщения</h1>
          {totalUnread > 0 && <p className="text-muted-foreground text-sm mt-0.5">{totalUnread} непрочитанных</p>}
        </div>
        <button onClick={() => onOpenChat(users[0])} className="w-8 h-8 rounded-full glass flex items-center justify-center text-purple-400 hover:bg-white/10 transition-colors">
          <Icon name="PenSquare" size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {dialogs.length === 0 && users.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center"><Icon name="MessageCircle" size={28} className="text-muted-foreground" /></div>
            <p className="text-muted-foreground text-sm text-center">Нет сообщений.<br/>Начните переписку в разделе Контакты</p>
          </div>
        )}
        {dialogs.map((d, i) => (
          <button key={d.partner_id} onClick={() => handleOpen(d.partner_id, d.partner_name, d.partner_avatar, d.partner_status)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-left animate-fade-in" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
            <Avatar name={d.partner_name} id={d.partner_id} size="md" status={d.partner_status} avatar={d.partner_avatar || undefined} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate">{d.partner_name}</span>
                <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">{fmtTime(d.last_time)}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-muted-foreground text-xs truncate">{d.last_sender_id === me.id ? "Вы: " : ""}{d.last_text}</span>
                {d.unread > 0 && <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-xs flex items-center justify-center font-bold">{d.unread}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── CONTACTS TAB ─── */
function ContactsTab({ me, onOpenChat, onCall }: { me: AuthUser; onOpenChat: (u: ChatUser) => void; onCall: (u: ChatUser, t: "voice" | "video") => void }) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${CHAT_URL}/?action=users`, { headers: { "X-User-Id": String(me.id) } })
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [me.id]);

  const online = users.filter(u => u.status === "online").length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h1 className="text-2xl font-bold text-gradient">Контакты</h1>
        {!loading && <p className="text-muted-foreground text-sm mt-0.5">{online} онлайн · {users.length} всего</p>}
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {loading && <div className="flex justify-center pt-16"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>}
        {!loading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center"><Icon name="Users" size={28} className="text-muted-foreground" /></div>
            <p className="text-muted-foreground text-sm">Пока нет других пользователей</p>
          </div>
        )}
        {users.map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
            <Avatar name={u.name} id={u.id} size="md" status={u.status} avatar={u.avatar || undefined} />
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenChat(u)}>
              <div className="font-semibold text-sm">{u.name}</div>
              <div className={`text-xs ${u.status === "online" ? "text-green-400" : "text-muted-foreground"}`}>{u.status === "online" ? "В сети" : "Не в сети"}</div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onOpenChat(u)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-colors"><Icon name="MessageCircle" size={14} /></button>
              <button onClick={() => onCall(u, "voice")} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-cyan-400 transition-colors"><Icon name="Phone" size={14} /></button>
              <button onClick={() => onCall(u, "video")} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-colors"><Icon name="Video" size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SEARCH TAB ─── */
function SearchTab({ me, onOpenChat }: { me: AuthUser; onOpenChat: (u: ChatUser) => void }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    fetch(`${CHAT_URL}/?action=users`, { headers: { "X-User-Id": String(me.id) } })
      .then(r => r.json()).then(d => setUsers(d.users || []));
  }, [me.id]);

  const filtered = query.length > 0 ? users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2"><h1 className="text-2xl font-bold text-gradient">Поиск</h1></div>
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Имя или email..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
          {query && <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="X" size={14} /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {query.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center"><Icon name="Search" size={28} className="text-muted-foreground" /></div>
            <p className="text-muted-foreground text-sm text-center">Начните вводить для поиска<br/>по пользователям</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48"><p className="text-muted-foreground text-sm">Ничего не найдено</p></div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1">Пользователи</p>
            {filtered.map((u, i) => (
              <button key={u.id} onClick={() => onOpenChat(u)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-left animate-fade-in" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                <Avatar name={u.name} id={u.id} size="md" status={u.status} avatar={u.avatar || undefined} />
                <div>
                  <div className="font-semibold text-sm">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PROFILE TAB ─── */
function ProfileTab({ user, onLogout, onAvatarUpdate }: { user: AuthUser; onLogout: () => void; onAvatarUpdate: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Файл слишком большой (макс. ${maxMb} МБ)`);
      return;
    }

    setError("");
    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      const res = await fetch(AVATAR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(user.id) },
        body: JSON.stringify({ image: base64, ext }),
      });
      const data = await res.json();
      setUploading(false);
      if (res.ok && data.avatar) {
        onAvatarUpdate(data.avatar);
      } else {
        setError(data.error || "Ошибка загрузки");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative">
        <div className="h-28 bg-gradient-to-br from-purple-900/60 via-purple-800/40 to-cyan-900/60" />
        <div className="absolute -bottom-8 left-4">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-4 border-background" />
            ) : (
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getColor(user.id)} flex items-center justify-center text-xl font-bold text-white border-4 border-background`}>
                {getInitials(user.name)}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icon name="Camera" size={18} className="text-white" />
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </div>
      </div>
      <div className="pt-12 px-4 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="mt-3 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50">
          <Icon name="Camera" size={14} />
          {uploading ? "Загружаем..." : user.avatar ? "Сменить фото" : "Добавить фото"}
        </button>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-xl px-3 py-2 animate-fade-in">
            <Icon name="AlertCircle" size={12} /> {error}
          </div>
        )}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 p-3 glass rounded-2xl">
            <Icon name="Mail" fallback="Circle" size={16} className="text-purple-400" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 p-3 glass rounded-2xl">
            <Icon name="Hash" fallback="Circle" size={16} className="text-cyan-400" />
            <span className="text-sm font-mono text-muted-foreground">ID: {user.id}</span>
          </div>
        </div>
        <button onClick={onLogout} className="w-full mt-4 glass rounded-2xl p-4 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium flex items-center justify-center gap-2">
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

/* ─── SETTINGS TAB ─── */
function SettingsTab() {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  const sections = [
    { title: "Уведомления", items: [
      { label: "Push-уведомления", desc: "Получать уведомления о новых сообщениях", value: notifications, set: setNotifications },
      { label: "Звуки", desc: "Звуки при получении сообщений", value: sounds, set: setSounds },
    ]},
    { title: "Приватность", items: [
      { label: "Прочитано", desc: "Показывать галочки о прочтении", value: readReceipts, set: setReadReceipts },
    ]},
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 pb-2"><h1 className="text-2xl font-bold text-gradient">Настройки</h1></div>
      <div className="px-3 pb-4 space-y-4">
        {sections.map((section, si) => (
          <div key={section.title} className="animate-fade-in" style={{ animationDelay: `${si * 0.08}s`, opacity: 0 }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider px-2 mb-2">{section.title}</p>
            <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                  </div>
                  <button onClick={() => item.set(!item.value)} className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${item.value ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${item.value ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── NAV ─── */
const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "chats", icon: "MessageCircle", label: "Чаты" },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Настройки" },
];

/* ─── MAIN ─── */
const Index = () => {
  const [tab, setTab] = useState<Tab>("chats");
  const [openChat, setOpenChat] = useState<ChatUser | null>(null);
  const [call, setCall] = useState<{ user: ChatUser; type: "voice" | "video" } | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pulse_user");
    if (saved) { try { setUser(JSON.parse(saved)); } catch (e) { console.error(e); } }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pulse_user");
    setUser(null); setTab("chats"); setOpenChat(null);
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    if (!user) return;
    const updated = { ...user, avatar: avatarUrl };
    setUser(updated);
    localStorage.setItem("pulse_user", JSON.stringify(updated));
  };

  const openChatWith = (u: ChatUser) => { setOpenChat(u); setTab("chats"); };

  if (!authChecked) return null;
  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/15 rounded-full blur-3xl" />
      </div>

      {/* Сайдбар (десктоп) */}
      <div className="hidden md:flex flex-col w-16 border-r border-border bg-background/80 backdrop-blur-xl z-10 py-4 items-center gap-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-4 glow-purple">
          <Icon name="Zap" size={18} className="text-white" />
        </div>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); setOpenChat(null); }} className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${tab === item.id && !openChat ? "bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-purple-400" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`} title={item.label}>
            <Icon name={item.icon} fallback="Circle" size={18} />
          </button>
        ))}
        <div className="mt-auto">
          <button onClick={handleLogout} className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all" title="Выйти">
            <Icon name="LogOut" size={18} />
          </button>
        </div>
      </div>

      {/* Основная область */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <div className="flex-1 overflow-hidden">
          {openChat ? (
            <ChatView me={user} partner={openChat} onBack={() => setOpenChat(null)} />
          ) : (
            <div className="h-full">
              {tab === "chats" && <ChatsTab me={user} onOpenChat={openChatWith} />}
              {tab === "contacts" && <ContactsTab me={user} onOpenChat={openChatWith} onCall={(u, t) => setCall({ user: u, type: t })} />}
              {tab === "search" && <SearchTab me={user} onOpenChat={openChatWith} />}
              {tab === "profile" && <ProfileTab user={user} onLogout={handleLogout} onAvatarUpdate={handleAvatarUpdate} />}
              {tab === "settings" && <SettingsTab />}
            </div>
          )}
        </div>

        {/* Нижняя навигация (мобайл) */}
        <div className="md:hidden border-t border-border glass flex items-center justify-around px-2 py-2 flex-shrink-0">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setOpenChat(null); }} className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${tab === item.id && !openChat ? "text-purple-400" : "text-muted-foreground"}`}>
              <Icon name={item.icon} fallback="Circle" size={20} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {call && <CallModal name={call.user.name} userId={call.user.id} type={call.type} onClose={() => setCall(null)} />}
    </div>
  );
};

export default Index;