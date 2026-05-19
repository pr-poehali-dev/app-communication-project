import { useState } from "react";
import Icon from "@/components/ui/icon";

const CONTACTS = [
  { id: 1, name: "Алексей Морозов", status: "online", avatar: "АМ", color: "from-purple-500 to-pink-500", lastSeen: "В сети" },
  { id: 2, name: "Дарья Иванова", status: "online", avatar: "ДИ", color: "from-cyan-500 to-blue-500", lastSeen: "В сети" },
  { id: 3, name: "Игорь Петров", status: "offline", avatar: "ИП", color: "from-orange-500 to-red-500", lastSeen: "1 ч назад" },
  { id: 4, name: "Мария Соколова", status: "online", avatar: "МС", color: "from-green-500 to-teal-500", lastSeen: "В сети" },
  { id: 5, name: "Николай Волков", status: "away", avatar: "НВ", color: "from-yellow-500 to-orange-500", lastSeen: "15 мин назад" },
  { id: 6, name: "Елена Кузнецова", status: "offline", avatar: "ЕК", color: "from-pink-500 to-rose-500", lastSeen: "вчера" },
];

const CHATS = [
  { id: 1, contact: CONTACTS[0], lastMsg: "Окей, завтра тогда!", time: "14:32", unread: 2, messages: [
    { id: 1, text: "Привет! Как дела?", out: false, time: "14:20" },
    { id: 2, text: "Всё хорошо, спасибо! А у тебя?", out: true, time: "14:22" },
    { id: 3, text: "Тоже отлично. Встретимся завтра?", out: false, time: "14:30" },
    { id: 4, text: "Окей, завтра тогда!", out: false, time: "14:32" },
  ]},
  { id: 2, contact: CONTACTS[1], lastMsg: "Отправила файлы на почту", time: "12:15", unread: 0, messages: [
    { id: 1, text: "Даша, можешь отправить презентацию?", out: true, time: "12:10" },
    { id: 2, text: "Конечно, сейчас сделаю", out: false, time: "12:12" },
    { id: 3, text: "Отправила файлы на почту", out: false, time: "12:15" },
  ]},
  { id: 3, contact: CONTACTS[3], lastMsg: "👍", time: "Вчера", unread: 1, messages: [
    { id: 1, text: "Проект готов!", out: false, time: "вчера" },
    { id: 2, text: "👍", out: false, time: "вчера" },
  ]},
  { id: 4, contact: CONTACTS[4], lastMsg: "Понял, спасибо за инфо", time: "Пн", unread: 0, messages: [
    { id: 1, text: "Совещание перенесли на пятницу", out: false, time: "пн" },
    { id: 2, text: "Понял, спасибо за инфо", out: true, time: "пн" },
  ]},
];

const NOTIFICATIONS = [
  { id: 1, type: "message", text: "Алексей Морозов написал вам", time: "2 мин", icon: "MessageCircle", color: "text-purple-400" },
  { id: 2, type: "call", text: "Пропущенный вызов от Дарьи Ивановой", time: "15 мин", icon: "Phone", color: "text-red-400" },
  { id: 3, type: "contact", text: "Мария Соколова добавила вас в контакты", time: "1 ч", icon: "UserPlus", color: "text-cyan-400" },
  { id: 4, type: "message", text: "Николай Волков упомянул вас", time: "3 ч", icon: "AtSign", color: "text-yellow-400" },
  { id: 5, type: "system", text: "Обновление приложения доступно", time: "вчера", icon: "Download", color: "text-green-400" },
];

type Tab = "chats" | "contacts" | "search" | "notifications" | "profile" | "settings";
type Contact = typeof CONTACTS[0];
type Chat = typeof CHATS[0];

function Avatar({ name, color, size = "md", status }: { name: string; color: string; size?: "sm" | "md" | "lg" | "xl"; status?: string }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };
  const dotSizes = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3", xl: "w-3.5 h-3.5" };
  const statusColors: Record<string, string> = { online: "bg-green-400", offline: "bg-gray-500", away: "bg-yellow-400" };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-semibold text-white`}>
        {name}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-background ${statusColors[status] ?? "bg-gray-500"}`} />
      )}
    </div>
  );
}

function CallModal({ contact, type, onClose }: { contact: Contact; type: "voice" | "video"; onClose: () => void }) {
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
            <Avatar name={contact.avatar} color={contact.color} size="xl" />
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{contact.name}</div>
            <div className="text-muted-foreground text-sm">
              {active ? (
                <div className="flex items-center gap-1.5 justify-center">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="wave-bar w-0.5 bg-cyan-400 rounded-full" style={{ height: '4px' }} />
                  ))}
                </div>
              ) : (
                type === "voice" ? "Голосовой вызов..." : "Видеозвонок..."
              )}
            </div>
          </div>
        </div>

        {type === "video" && active && (
          <div className="relative z-10 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 aspect-video flex items-center justify-center">
            <div className="text-muted-foreground text-sm">Камера активна</div>
            <div className="absolute bottom-2 right-2 w-16 h-12 rounded-lg bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center text-xs text-white">Вы</div>
          </div>
        )}

        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => setMuted(!muted)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${muted ? "bg-red-500/20 text-red-400" : "glass text-foreground hover:bg-white/10"}`}>
            <Icon name={muted ? "MicOff" : "Mic"} size={18} />
          </button>
          {type === "video" && (
            <button onClick={() => setCameraOff(!cameraOff)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${cameraOff ? "bg-red-500/20 text-red-400" : "glass text-foreground hover:bg-white/10"}`}>
              <Icon name={cameraOff ? "VideoOff" : "Video"} size={18} />
            </button>
          )}
          <button onClick={() => setActive(!active)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all glow-cyan ${active ? "bg-green-500 hover:bg-green-600" : "bg-gradient-to-br from-purple-500 to-cyan-500 hover:opacity-90"}`}>
            <Icon name={active ? "PhoneCall" : "Phone"} size={22} className="text-white" />
          </button>
          <button onClick={() => setSpeakerOff(!speakerOff)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${speakerOff ? "bg-red-500/20 text-red-400" : "glass text-foreground hover:bg-white/10"}`}>
            <Icon name={speakerOff ? "VolumeX" : "Volume2"} size={18} />
          </button>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all">
            <Icon name="PhoneOff" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatsTab({ onOpenChat }: { onOpenChat: (chat: Chat) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h1 className="text-2xl font-bold text-gradient">Сообщения</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{CHATS.reduce((a, c) => a + c.unread, 0)} непрочитанных</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {CHATS.map((chat, i) => (
          <button key={chat.id} onClick={() => onOpenChat(chat)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-left group animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
            <Avatar name={chat.contact.avatar} color={chat.contact.color} size="md" status={chat.contact.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate">{chat.contact.name}</span>
                <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-muted-foreground text-xs truncate">{chat.lastMsg}</span>
                {chat.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-xs flex items-center justify-center font-bold">{chat.unread}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatView({ chat, onBack, onCall }: { chat: Chat; onBack: () => void; onCall: (type: "voice" | "video") => void }) {
  const [message, setMessage] = useState("");
  const [msgs, setMsgs] = useState(chat.messages);

  const send = () => {
    if (!message.trim()) return;
    setMsgs(prev => [...prev, { id: Date.now(), text: message, out: true, time: "Сейчас" }]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full" style={{ animation: "slideInRight 0.3s ease-out forwards" }}>
      <div className="glass border-b border-border flex items-center gap-3 px-4 py-3 flex-shrink-0">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <Avatar name={chat.contact.avatar} color={chat.contact.color} size="sm" status={chat.contact.status} />
        <div className="flex-1">
          <div className="font-semibold text-sm">{chat.contact.name}</div>
          <div className="text-xs text-green-400">{chat.contact.lastSeen}</div>
        </div>
        <button onClick={() => onCall("voice")} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-cyan-400 transition-colors">
          <Icon name="Phone" size={16} />
        </button>
        <button onClick={() => onCall("video")} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-colors">
          <Icon name="Video" size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {msgs.map((msg) => (
          <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${msg.out ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-sm" : "glass text-foreground rounded-bl-sm"}`}>
              <p>{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.out ? "text-purple-200" : "text-muted-foreground"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 flex-shrink-0 border-t border-border">
        <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2">
          <button className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="Paperclip" size={18} /></button>
          <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Сообщение..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          <button className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="Smile" size={18} /></button>
          <button onClick={send} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center hover:opacity-90 transition-all">
            <Icon name="Send" size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactsTab({ onCall }: { onCall: (contact: Contact, type: "voice" | "video") => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h1 className="text-2xl font-bold text-gradient">Контакты</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{CONTACTS.filter(c => c.status === "online").length} онлайн</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {CONTACTS.map((contact, i) => (
          <div key={contact.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
            <Avatar name={contact.avatar} color={contact.color} size="md" status={contact.status} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{contact.name}</div>
              <div className={`text-xs ${contact.status === "online" ? "text-green-400" : "text-muted-foreground"}`}>{contact.lastSeen}</div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onCall(contact, "voice")} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-cyan-400 transition-colors"><Icon name="Phone" size={14} /></button>
              <button onClick={() => onCall(contact, "video")} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-colors"><Icon name="Video" size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchTab() {
  const [query, setQuery] = useState("");
  const filtered = query.length > 0 ? CONTACTS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h1 className="text-2xl font-bold text-gradient">Поиск</h1>
      </div>
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Имя, сообщение..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
          {query && <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors"><Icon name="X" size={14} /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {query.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center">
              <Icon name="Search" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm text-center">Начните вводить для поиска<br/>по контактам и сообщениям</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48"><p className="text-muted-foreground text-sm">Ничего не найдено</p></div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1">Контакты</p>
            {filtered.map((contact, i) => (
              <div key={contact.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                <Avatar name={contact.avatar} color={contact.color} size="md" status={contact.status} />
                <div>
                  <div className="font-semibold text-sm">{contact.name}</div>
                  <div className={`text-xs ${contact.status === "online" ? "text-green-400" : "text-muted-foreground"}`}>{contact.lastSeen}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Уведомления</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{NOTIFICATIONS.length} новых</p>
        </div>
        <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Очистить</button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {NOTIFICATIONS.map((notif, i) => (
          <div key={notif.id} className="flex items-start gap-3 p-3.5 rounded-2xl glass hover:bg-white/5 transition-all animate-fade-in cursor-pointer" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
            <div className={`w-9 h-9 rounded-full glass flex items-center justify-center flex-shrink-0 ${notif.color}`}>
              <Icon name={notif.icon} fallback="Bell" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug">{notif.text}</p>
              <p className="text-xs text-muted-foreground mt-1">{notif.time} назад</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative">
        <div className="h-28 bg-gradient-to-br from-purple-900/60 via-purple-800/40 to-cyan-900/60" />
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white border-4 border-background">ЮА</div>
        </div>
      </div>
      <div className="pt-12 px-4 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Юрий Алексеев</h2>
            <p className="text-muted-foreground text-sm">@yura_dev</p>
          </div>
          <button className="glass rounded-xl px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5">
            <Icon name="Edit2" size={12} />
            Изменить
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-3">🚀 Разработчик · Москва</p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[{ label: "Контакты", value: "234" }, { label: "Чаты", value: "18" }, { label: "Группы", value: "7" }].map(stat => (
            <div key={stat.label} className="glass rounded-2xl p-3 text-center">
              <div className="text-xl font-bold text-gradient">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[{ icon: "Phone", label: "+7 (999) 123-45-67" }, { icon: "Mail", label: "yura@example.com" }, { icon: "MapPin", label: "Москва, Россия" }].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 glass rounded-2xl">
              <Icon name={item.icon} fallback="Circle" size={16} className="text-purple-400" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const sections = [
    { title: "Уведомления", items: [
      { label: "Push-уведомления", desc: "Получать уведомления о новых сообщениях", value: notifications, set: setNotifications },
      { label: "Звуки", desc: "Звуки при получении сообщений", value: sounds, set: setSounds },
    ]},
    { title: "Приватность", items: [
      { label: "Прочитано", desc: "Показывать галочки о прочтении", value: readReceipts, set: setReadReceipts },
    ]},
    { title: "Внешний вид", items: [
      { label: "Тёмная тема", desc: "Использовать тёмный интерфейс", value: darkMode, set: setDarkMode },
    ]},
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 pb-2">
        <h1 className="text-2xl font-bold text-gradient">Настройки</h1>
      </div>
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
        <div className="glass rounded-2xl divide-y divide-border overflow-hidden animate-fade-in" style={{ animationDelay: "0.32s", opacity: 0 }}>
          {[{ icon: "Shield", label: "Безопасность", color: "text-green-400" }, { icon: "HelpCircle", label: "Помощь", color: "text-cyan-400" }, { icon: "Info", label: "О приложении", color: "text-purple-400" }].map(item => (
            <button key={item.label} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left">
              <Icon name={item.icon} fallback="Circle" size={18} className={item.color} />
              <span className="text-sm font-medium">{item.label}</span>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground ml-auto" />
            </button>
          ))}
        </div>
        <button className="w-full glass rounded-2xl p-4 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: "0.4s", opacity: 0 }}>
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

const NAV_ITEMS: { id: Tab; icon: string; label: string; badge?: number }[] = [
  { id: "chats", icon: "MessageCircle", label: "Чаты", badge: 3 },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "notifications", icon: "Bell", label: "Оповещения", badge: 5 },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Настройки" },
];

const Index = () => {
  const [tab, setTab] = useState<Tab>("chats");
  const [openChat, setOpenChat] = useState<Chat | null>(null);
  const [call, setCall] = useState<{ contact: Contact; type: "voice" | "video" } | null>(null);

  const handleCall = (contact: Contact, type: "voice" | "video") => setCall({ contact, type });

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
          <button key={item.id} onClick={() => { setTab(item.id); setOpenChat(null); }} className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${tab === item.id ? "bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-purple-400" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`} title={item.label}>
            <Icon name={item.icon} fallback="Circle" size={18} />
            {item.badge && <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[9px] flex items-center justify-center font-bold">{item.badge}</span>}
          </button>
        ))}
      </div>

      {/* Основная область */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <div className="flex-1 overflow-hidden">
          {openChat ? (
            <ChatView chat={openChat} onBack={() => setOpenChat(null)} onCall={(type) => openChat && handleCall(openChat.contact, type)} />
          ) : (
            <div className="h-full">
              {tab === "chats" && <ChatsTab onOpenChat={setOpenChat} />}
              {tab === "contacts" && <ContactsTab onCall={handleCall} />}
              {tab === "search" && <SearchTab />}
              {tab === "notifications" && <NotificationsTab />}
              {tab === "profile" && <ProfileTab />}
              {tab === "settings" && <SettingsTab />}
            </div>
          )}
        </div>

        {/* Нижняя навигация (мобайл) */}
        <div className="md:hidden border-t border-border glass flex items-center justify-around px-2 py-2 flex-shrink-0">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setOpenChat(null); }} className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${tab === item.id ? "text-purple-400" : "text-muted-foreground"}`}>
              <Icon name={item.icon} fallback="Circle" size={20} />
              <span className="text-[9px] font-medium">{item.label}</span>
              {item.badge && <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[9px] flex items-center justify-center font-bold">{item.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {call && <CallModal contact={call.contact} type={call.type} onClose={() => setCall(null)} />}
    </div>
  );
};

export default Index;