import React from "react";
import { copyToClipboard } from "../utils/clipboard";
import {
  MessageCircle, Search, Send, Paperclip, Smile, MoreVertical,
  Phone, Video, Pin, Users, Plus, Check, CheckCheck,
  Image, File, ChevronLeft, Trash2,
  Reply, Forward, Copy, Bookmark, Mic, MicOff,
  X, Info, Clock, AtSign, Zap,
  UserPlus, Shield, Volume2, VolumeX,
  Download, Megaphone, MessageSquare, Sparkles,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

// ─── Types ───
interface Contact {
  id: string;
  name: string;
  role: "admin" | "instructor" | "learner";
  subsidiary: string;
  position: string;
  initials: string;
  online: boolean;
  lastSeen?: string;
  unread: number;
  pinned: boolean;
  muted: boolean;
  avatar?: string;
  email?: string;
  phone?: string;
  status?: "available" | "busy" | "away" | "offline";
  statusText?: string;
}

interface Reaction {
  emoji: string;
  userId: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  type: "text" | "file" | "image" | "system" | "voice" | "reply";
  fileName?: string;
  fileSize?: string;
  reactions?: Reaction[];
  pinned?: boolean;
  starred?: boolean;
  replyTo?: { id: string; text: string; senderName: string };
  edited?: boolean;
  scheduledAt?: string;
}

interface Conversation {
  contactId: string;
  messages: Message[];
  lastMessage: string;
  lastTime: string;
  isGroup: boolean;
  groupName?: string;
  groupMembers?: string[];
  draft?: string;
}

type RightPanel = "none" | "info" | "starred" | "pinned" | "search" | "files";
type ContactFilter = "all" | "unread" | "pinned" | "groups" | "online";

// ─── Mock Data ───
const CONTACTS: Contact[] = [
  { id: "U001", name: "Nguyễn Văn Minh", role: "admin", subsidiary: "VP Tập đoàn", position: "GĐ Đào tạo", initials: "NM", online: true, unread: 2, pinned: true, muted: false, email: "minh.nv@geleximco.vn", phone: "0912 345 678", status: "available", statusText: "Sẵn sàng hỗ trợ" },
  { id: "U002", name: "Phạm Anh Tuấn", role: "instructor", subsidiary: "BĐS Geleximco", position: "GV Digital Marketing", initials: "PT", online: true, unread: 0, pinned: true, muted: false, email: "tuan.pa@geleximco.vn", status: "available" },
  { id: "U003", name: "Lê Hoàng Nam", role: "learner", subsidiary: "ABBank", position: "CV Phân tích Tín dụng", initials: "LN", online: false, lastSeen: "2 giờ trước", unread: 0, pinned: false, muted: false, email: "nam.lh@abbank.vn", status: "offline" },
  { id: "C004", name: "Trần Thị Hương", role: "instructor", subsidiary: "VP Tập đoàn", position: "GV Tài chính", initials: "TH", online: true, unread: 3, pinned: false, muted: false, email: "huong.tt@geleximco.vn", status: "busy", statusText: "Đang dạy" },
  { id: "C005", name: "Lê Quốc Vương", role: "instructor", subsidiary: "Geleximco Land", position: "GV Quản lý DA", initials: "LV", online: false, lastSeen: "30 phút trước", unread: 0, pinned: false, muted: false, status: "away", statusText: "Sẽ trả lời sau 14h" },
  { id: "C006", name: "Hoàng Đức Em", role: "learner", subsidiary: "Energy", position: "CV Vận hành", initials: "HE", online: true, unread: 1, pinned: false, muted: true, status: "available" },
  { id: "C007", name: "Vũ Thị Phương", role: "instructor", subsidiary: "ABBank", position: "GV Pháp luật", initials: "VP", online: false, lastSeen: "1 ngày trước", unread: 0, pinned: false, muted: false, status: "offline" },
  { id: "C008", name: "Đặng Minh Quân", role: "learner", subsidiary: "Xi măng Thăng Long", position: "Kỹ sư QC", initials: "DQ", online: true, unread: 0, pinned: false, muted: false, status: "available" },
  { id: "G01", name: "Nhóm: Marketing Team", role: "admin", subsidiary: "", position: "5 thành viên", initials: "MT", online: true, unread: 5, pinned: true, muted: false },
  { id: "G02", name: "Nhóm: Giảng viên Q1/2026", role: "admin", subsidiary: "", position: "12 thành viên", initials: "GV", online: true, unread: 0, pinned: false, muted: false },
  { id: "G03", name: "Nhóm: ATLĐ 2026", role: "admin", subsidiary: "", position: "8 thành viên", initials: "AT", online: false, unread: 0, pinned: false, muted: true },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "#990803",
  instructor: "#c8a84e",
  learner: "#2563eb",
};

const STATUS_COLORS: Record<string, string> = {
  available: "#16a34a",
  busy: "#dc2626",
  away: "#f59e0b",
  offline: "#9ca3af",
};

const QUICK_EMOJIS = ["👍", "❤️", "😊", "🎉", "👏", "🔥", "💯", "🙏"];

const QUICK_TEMPLATES = [
  { label: "Chào hỏi", text: "Chào bạn, tôi có thể hỗ trợ gì cho bạn?" },
  { label: "Xác nhận", text: "Đã nhận được thông tin, tôi sẽ phản hồi trong ngày." },
  { label: "Tài liệu", text: "Tài liệu đã được upload lên hệ thống. Bạn kiểm tra trong tab Nội dung nhé." },
  { label: "Deadline", text: "Nhắc nhở: hạn nộp bài là cuối ngày hôm nay." },
  { label: "Hẹn lịch", text: "Mình có thể hẹn thảo luận vào lúc nào phù hợp?" },
  { label: "Cảm ơn", text: "Cảm ơn bạn! Chúc bạn học tập hiệu quả." },
];

const AI_SUGGESTIONS = [
  "Dạ, em sẽ hoàn thành trước thời hạn.",
  "Em cảm ơn thầy/cô!",
  "Em hiểu rồi ạ, em sẽ xem lại.",
  "Cho em hỏi thêm ạ.",
];

function generateMessages(contactId: string, currentUserId: string): Message[] {
  const msgs: Record<string, Message[]> = {
    "U001": [
      { id: "m1", senderId: "U001", text: "Chào anh, báo cáo Q1/2026 đã sẵn sàng để xuất chưa?", timestamp: "09:15", read: true, type: "text" },
      { id: "m2", senderId: currentUserId, text: "Dạ em đang hoàn thiện phần thống kê từ 14 đơn vị, chiều nay sẽ gửi cho anh.", timestamp: "09:20", read: true, type: "text", reactions: [{ emoji: "👍", userId: "U001" }] },
      { id: "m3", senderId: "U001", text: "OK, nhớ gửi trước 5h nhé. Ban GĐ cần review sáng mai.", timestamp: "09:22", read: false, type: "text", pinned: true },
      { id: "m4", senderId: "U001", text: "Thêm một việc nữa: kiểm tra tỷ lệ compliance của ABBank, có vẻ thấp hơn target.", timestamp: "09:25", read: false, type: "text" },
    ],
    "U002": [
      { id: "m5", senderId: currentUserId, text: "Anh Tuấn ơi, bài giảng tuần 6 về SEO On-page đã upload chưa ạ?", timestamp: "08:30", read: true, type: "text" },
      { id: "m6", senderId: "U002", text: "Rồi em, đã upload lên hệ thống. Em check tab Nội dung khóa Marketing số nhé.", timestamp: "08:45", read: true, type: "text" },
      { id: "m7", senderId: "U002", text: "📎 Slide_SEO_OnPage_W6.pptx", timestamp: "08:46", read: true, type: "file", fileName: "Slide_SEO_OnPage_W6.pptx", fileSize: "15.2 MB" },
      { id: "m8", senderId: currentUserId, text: "Em nhận được rồi, cảm ơn anh! 👍", timestamp: "08:50", read: true, type: "text", reactions: [{ emoji: "❤️", userId: "U002" }] },
    ],
    "U003": [
      { id: "m9", senderId: "U003", text: "Thầy ơi, em có thắc mắc về bài Phân tích dòng tiền FCF ạ.", timestamp: "Hôm qua", read: true, type: "text" },
      { id: "m10", senderId: currentUserId, text: "Em hỏi đi nhé, thầy sẽ giải đáp.", timestamp: "Hôm qua", read: true, type: "text" },
      { id: "m11", senderId: "U003", text: "Cách tính Free Cash Flow từ Operating Cash Flow có cần trừ Capital Expenditure không ạ?", timestamp: "Hôm qua", read: true, type: "text", starred: true },
      { id: "m12", senderId: currentUserId, text: "Đúng rồi em. FCF = OCF - CapEx. Em xem lại slide bài 4 phần 2 nhé, có ví dụ cụ thể.", timestamp: "Hôm qua", read: true, type: "text", reactions: [{ emoji: "🙏", userId: "U003" }, { emoji: "💯", userId: "U003" }] },
    ],
    "C004": [
      { id: "m13", senderId: "C004", text: "Anh/chị ơi, em muốn tạo thêm 1 bài kiểm tra cho module Tài chính nâng cao, được không ạ?", timestamp: "10:00", read: false, type: "text" },
      { id: "m14", senderId: "C004", text: "Đề thi gồm 30 câu trắc nghiệm + 2 câu tự luận, thời gian 60 phút.", timestamp: "10:02", read: false, type: "text" },
      { id: "m15", senderId: "C004", text: "Em gửi file đề cương trước để anh/chị review.", timestamp: "10:05", read: false, type: "text" },
      { id: "m16f", senderId: "C004", text: "📎 De_cuong_TC_Nang_cao.docx", timestamp: "10:06", read: false, type: "file", fileName: "De_cuong_TC_Nang_cao.docx", fileSize: "2.1 MB" },
    ],
    "G01": [
      { id: "m16", senderId: "U002", text: "Team ơi, chiến dịch Q2 focus vào kênh TikTok nhé!", timestamp: "08:00", read: true, type: "text", reactions: [{ emoji: "🔥", userId: "U001" }, { emoji: "👏", userId: "C005" }] },
      { id: "m17", senderId: "C005", text: "Đồng ý! Budget cho Q2 đã được duyệt chưa?", timestamp: "08:15", read: true, type: "text" },
      { id: "m18", senderId: "U001", text: "Đã duyệt. 150 triệu cho digital marketing, 50 triệu cho events.", timestamp: "08:30", read: true, type: "text", pinned: true },
      { id: "m19", senderId: "U002", text: "📊 Q2_Marketing_Plan.xlsx", timestamp: "09:00", read: false, type: "file", fileName: "Q2_Marketing_Plan.xlsx", fileSize: "3.4 MB" },
      { id: "m20", senderId: "C006", text: "Ý tưởng hay! Mình có thể kết hợp training nội bộ về TikTok Marketing.", timestamp: "09:30", read: false, type: "text" },
    ],
  };
  return msgs[contactId] || [
    { id: `def1_${contactId}`, senderId: contactId, text: "Xin chào! Tôi có thể giúp gì cho bạn?", timestamp: "Hôm qua", read: true, type: "text" },
  ];
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function Messaging() {
  const { user } = useAuth();
  const role = user?.legacyRole || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";

  const [contacts, setContacts] = React.useState(CONTACTS);
  const [selectedId, setSelectedId] = React.useState<string | null>("U001");
  const [searchContact, setSearchContact] = React.useState("");
  const [newMessage, setNewMessage] = React.useState("");
  const [showMobileList, setShowMobileList] = React.useState(true);
  const [contactFilter, setContactFilter] = React.useState<ContactFilter>("all");
  const [rightPanel, setRightPanel] = React.useState<RightPanel>("none");
  const [extraMessages, setExtraMessages] = React.useState<Record<string, Message[]>>({});
  const [replyingTo, setReplyingTo] = React.useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [showAISuggest, setShowAISuggest] = React.useState(false);
  const [searchInChat, setSearchInChat] = React.useState("");
  const [showSearchInChat, setShowSearchInChat] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [msgActionId, setMsgActionId] = React.useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = React.useState(false);
  const [showBroadcast, setShowBroadcast] = React.useState(false);
  const [myStatus, setMyStatus] = React.useState<"available" | "busy" | "away">("available");
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const currentUserId = user?.id || "ME";

  const selectedContact = contacts.find(c => c.id === selectedId);
  const baseMessages = selectedId ? generateMessages(selectedId, currentUserId) : [];
  const allMessages = [...baseMessages, ...(selectedId && extraMessages[selectedId] ? extraMessages[selectedId] : [])];

  // Search in chat filter
  const messages = showSearchInChat && searchInChat
    ? allMessages.filter(m => m.text.toLowerCase().includes(searchInChat.toLowerCase()))
    : allMessages;

  const filteredContacts = React.useMemo(() => {
    let result = contacts.filter(c => {
      if (searchContact && !c.name.toLowerCase().includes(searchContact.toLowerCase()) && !c.position.toLowerCase().includes(searchContact.toLowerCase())) return false;
      switch (contactFilter) {
        case "unread": return c.unread > 0;
        case "pinned": return c.pinned;
        case "groups": return c.id.startsWith("G");
        case "online": return c.online;
        default: return true;
      }
    });
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.unread && !b.unread) return -1;
      return 0;
    });
  }, [contacts, searchContact, contactFilter]);

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);
  const onlineCount = contacts.filter(c => c.online && !c.id.startsWith("G")).length;

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, extraMessages]);

  // Simulate typing indicator
  React.useEffect(() => {
    if (!selectedId) return;
    const timeout = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2500);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [selectedId]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedId) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const msg: Message = {
      id: `sent_${Date.now()}`,
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: timeStr,
      read: false,
      type: replyingTo ? "reply" : "text",
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id,
          text: replyingTo.text.slice(0, 80),
          senderName: CONTACTS.find(c => c.id === replyingTo.senderId)?.name || "Bạn",
        },
      }),
    };
    setExtraMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), msg] }));
    setNewMessage("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowTemplates(false);
    setShowAISuggest(false);
    setDrafts(prev => { const n = { ...prev }; delete n[selectedId]; return n; });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const selectContact = (id: string) => {
    // Save draft for current contact
    if (selectedId && newMessage.trim()) {
      setDrafts(prev => ({ ...prev, [selectedId]: newMessage }));
    }
    setSelectedId(id);
    setShowMobileList(false);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setReplyingTo(null);
    setMsgActionId(null);
    setShowSearchInChat(false);
    setSearchInChat("");
    // Restore draft
    setNewMessage(drafts[id] || "");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    if (!selectedId) return;
    setExtraMessages(prev => {
      const existing = [...(prev[selectedId] || [])];
      const idx = existing.findIndex(m => m.id === msgId);
      if (idx >= 0) {
        const msg = { ...existing[idx] };
        const reactions = [...(msg.reactions || [])];
        const existingR = reactions.findIndex(r => r.userId === currentUserId && r.emoji === emoji);
        if (existingR >= 0) reactions.splice(existingR, 1);
        else reactions.push({ emoji, userId: currentUserId });
        msg.reactions = reactions;
        existing[idx] = msg;
      }
      return { ...prev, [selectedId]: existing };
    });
    setMsgActionId(null);
  };

  const togglePin = (contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, pinned: !c.pinned } : c));
  };

  const toggleMute = (contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, muted: !c.muted } : c));
    toast.success(contacts.find(c => c.id === contactId)?.muted ? "Đã bật thông báo" : "Đã tắt thông báo");
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      if (!selectedId) return;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const msg: Message = {
        id: `voice_${Date.now()}`,
        senderId: currentUserId,
        text: "🎤 Tin nhắn thoại (0:05)",
        timestamp: timeStr,
        read: false,
        type: "voice",
      };
      setExtraMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), msg] }));
      toast.success("Đã gửi tin nhắn thoại");
    } else {
      setIsRecording(true);
      toast.info("Đang ghi âm... Nhấn lần nữa để gửi");
    }
  };

  // ─── RENDER ───
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#990803]" />
          <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Tin nhắn</h1>
          {totalUnread > 0 && (
            <span className="px-2 py-0.5 bg-[#990803] text-white rounded-full" style={{ fontSize: "11px", fontWeight: 600 }}>{totalUnread}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Status button */}
          <div className="relative">
            <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "11px" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[myStatus] }} />
              <span className="text-gray-600" style={{ fontWeight: 500 }}>{myStatus === "available" ? "Sẵn sàng" : myStatus === "busy" ? "Bận" : "Vắng"}</span>
            </button>
            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
                  {([
                    { s: "available" as const, label: "Sẵn sàng", c: "#16a34a" },
                    { s: "busy" as const, label: "Bận", c: "#dc2626" },
                    { s: "away" as const, label: "Vắng", c: "#f59e0b" },
                  ]).map(st => (
                    <button key={st.s} onClick={() => { setMyStatus(st.s); setShowStatusMenu(false); toast.success(`Trạng thái: ${st.label}`); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px" }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.c }} />
                      <span className="text-gray-600">{st.label}</span>
                      {myStatus === st.s && <Check className="w-3 h-3 text-green-500 ml-auto" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Create group */}
          <button onClick={() => setShowCreateGroup(true)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" title="Tạo nhóm"><UserPlus className="w-4 h-4 text-gray-500" /></button>
          {/* Broadcast (admin) */}
          {isAdmin && (
            <button onClick={() => setShowBroadcast(true)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" title="Gửi thông báo hàng loạt"><Megaphone className="w-4 h-4 text-gray-500" /></button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex" style={{ height: "calc(100vh - 190px)", minHeight: "520px" }}>
        {/* ═══════ CONTACT LIST ═══════ */}
        <div className={`w-80 shrink-0 border-r border-gray-200 flex flex-col ${!showMobileList ? "hidden lg:flex" : "flex"}`}>
          {/* Search */}
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input value={searchContact} onChange={e => setSearchContact(e.target.value)} placeholder="Tìm người, nhóm..." className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "12px" }} />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {([
                { id: "all" as const, label: "Tất cả", count: contacts.length },
                { id: "unread" as const, label: "Chưa đọc", count: contacts.filter(c => c.unread > 0).length },
                { id: "online" as const, label: "Online", count: onlineCount },
                { id: "groups" as const, label: "Nhóm", count: contacts.filter(c => c.id.startsWith("G")).length },
                { id: "pinned" as const, label: "Ghim", count: contacts.filter(c => c.pinned).length },
              ]).map(f => (
                <button key={f.id} onClick={() => setContactFilter(f.id)} className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer flex items-center gap-1 ${contactFilter === f.id ? "bg-[#990803] text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`} style={{ fontSize: "10px", fontWeight: contactFilter === f.id ? 600 : 400 }}>
                  {f.label}
                  {f.count > 0 && contactFilter !== f.id && <span className="opacity-60">({f.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {filteredContacts.length === 0 && (
              <div className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400" style={{ fontSize: "12px" }}>Không có cuộc trò chuyện</p>
              </div>
            )}
            {filteredContacts.map(contact => {
              const lastMsg = generateMessages(contact.id, currentUserId);
              const lastText = lastMsg[lastMsg.length - 1]?.text || "";
              const lastTime = lastMsg[lastMsg.length - 1]?.timestamp || "";
              const hasDraft = !!drafts[contact.id];
              const statusColor = contact.status ? STATUS_COLORS[contact.status] : undefined;

              return (
                <div key={contact.id} onClick={() => selectContact(contact.id)} className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors border-l-2 ${selectedId === contact.id ? "bg-[#990803]/5 border-[#990803]" : "border-transparent hover:bg-gray-50"}`}>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ fontSize: "11px", fontWeight: 700, background: contact.id.startsWith("G") ? "linear-gradient(145deg, #7c3aed, #5b21b6)" : `linear-gradient(145deg, ${ROLE_COLORS[contact.role]}, ${ROLE_COLORS[contact.role]}cc)` }}>
                      {contact.id.startsWith("G") ? <Users className="w-4 h-4" /> : contact.initials}
                    </div>
                    {!contact.id.startsWith("G") && statusColor && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: statusColor }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`truncate ${contact.unread > 0 ? "text-gray-800" : "text-gray-600"}`} style={{ fontSize: "12px", fontWeight: contact.unread > 0 ? 600 : 500 }}>
                        {contact.name}
                      </span>
                      <span className="text-gray-300 shrink-0 ml-1" style={{ fontSize: "9px" }}>{lastTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {contact.pinned && <Pin className="w-2.5 h-2.5 text-gray-300 shrink-0" />}
                      {contact.muted && <VolumeX className="w-2.5 h-2.5 text-gray-300 shrink-0" />}
                      {hasDraft && <span className="text-red-400 shrink-0" style={{ fontSize: "9px", fontWeight: 600 }}>Nháp</span>}
                      <p className={`truncate flex-1 ${contact.unread > 0 ? "text-gray-500" : "text-gray-400"}`} style={{ fontSize: "10px", fontWeight: contact.unread > 0 ? 500 : 400 }}>
                        {hasDraft ? drafts[contact.id] : lastText.slice(0, 50)}
                      </p>
                    </div>
                  </div>
                  {contact.unread > 0 && (
                    <span className="w-5 h-5 bg-[#990803] text-white rounded-full flex items-center justify-center shrink-0" style={{ fontSize: "9px", fontWeight: 700 }}>{contact.unread}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Online summary */}
          <div className="p-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1" style={{ fontSize: "10px" }}>
              <div className="w-2 h-2 rounded-full bg-green-500" /> {onlineCount} đang online
            </span>
            <span className="text-gray-300" style={{ fontSize: "10px" }}>{contacts.length} liên hệ</span>
          </div>
        </div>

        {/* ═══════ CHAT AREA ═══════ */}
        {selectedContact ? (
          <div className={`flex-1 flex flex-col min-w-0 ${showMobileList ? "hidden lg:flex" : "flex"}`}>
            {/* Chat header */}
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setShowMobileList(true)} className="lg:hidden p-1 hover:bg-gray-100 rounded cursor-pointer"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ fontSize: "10px", fontWeight: 700, background: selectedContact.id.startsWith("G") ? "linear-gradient(145deg, #7c3aed, #5b21b6)" : `linear-gradient(145deg, ${ROLE_COLORS[selectedContact.role]}, ${ROLE_COLORS[selectedContact.role]}cc)` }}>
                  {selectedContact.id.startsWith("G") ? <Users className="w-4 h-4" /> : selectedContact.initials}
                </div>
                {!selectedContact.id.startsWith("G") && selectedContact.status && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: STATUS_COLORS[selectedContact.status] }} />
                )}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setRightPanel(rightPanel === "info" ? "none" : "info")}>
                <p className="text-gray-700 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{selectedContact.name}</p>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>
                  {selectedContact.id.startsWith("G")
                    ? selectedContact.position
                    : selectedContact.online
                    ? (selectedContact.statusText || "Đang hoạt động")
                    : `Truy cập ${selectedContact.lastSeen || "gần đây"}`}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => { setShowSearchInChat(!showSearchInChat); setSearchInChat(""); }} className={`p-2 rounded-lg cursor-pointer ${showSearchInChat ? "bg-[#990803]/10 text-[#990803]" : "hover:bg-gray-100 text-gray-400"}`}><Search className="w-4 h-4" /></button>
                <button onClick={() => toast.info("Đang kết nối cuộc gọi thoại...")} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"><Phone className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => toast.info("Đang kết nối cuộc gọi video...")} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"><Video className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => setRightPanel(rightPanel === "pinned" ? "none" : "pinned")} className={`p-2 rounded-lg cursor-pointer ${rightPanel === "pinned" ? "bg-[#990803]/10 text-[#990803]" : "hover:bg-gray-100 text-gray-400"}`}><Pin className="w-4 h-4" /></button>
                <button onClick={() => setRightPanel(rightPanel === "info" ? "none" : "info")} className={`p-2 rounded-lg cursor-pointer ${rightPanel === "info" ? "bg-[#990803]/10 text-[#990803]" : "hover:bg-gray-100 text-gray-400"}`}><Info className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Search in chat bar */}
            {showSearchInChat && (
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input value={searchInChat} onChange={e => setSearchInChat(e.target.value)} placeholder="Tìm trong cuộc trò chuyện..." autoFocus className="flex-1 bg-transparent text-gray-700 focus:outline-none" style={{ fontSize: "12px" }} />
                {searchInChat && <span className="text-gray-400 shrink-0" style={{ fontSize: "10px" }}>{messages.length} kết quả</span>}
                <button onClick={() => { setShowSearchInChat(false); setSearchInChat(""); }} className="p-1 hover:bg-gray-200 rounded cursor-pointer"><X className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 flex">
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50/50" style={{ scrollbarWidth: "thin" }}>
                {/* Date separator */}
                <div className="flex items-center gap-3 justify-center py-1">
                  <span className="px-3 py-0.5 bg-gray-100 text-gray-400 rounded-full" style={{ fontSize: "10px" }}>Hôm nay</span>
                </div>

                {messages.map(msg => {
                  const isOwn = msg.senderId === currentUserId;
                  const senderContact = CONTACTS.find(c => c.id === msg.senderId);
                  const isGroup = selectedContact.id.startsWith("G");
                  const showAction = msgActionId === msg.id;

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} group relative`}>
                      {/* Message actions trigger */}
                      {!isOwn && !showAction && (
                        <div className="absolute -right-2 top-0 hidden group-hover:flex items-center gap-0.5 z-10">
                          <button onClick={() => setReplyingTo(msg)} className="p-1 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50 cursor-pointer"><Reply className="w-3 h-3 text-gray-400" /></button>
                          <button onClick={() => setMsgActionId(msg.id)} className="p-1 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50 cursor-pointer"><MoreVertical className="w-3 h-3 text-gray-400" /></button>
                        </div>
                      )}
                      {isOwn && !showAction && (
                        <div className="absolute -left-2 top-0 hidden group-hover:flex items-center gap-0.5 z-10">
                          <button onClick={() => setMsgActionId(msg.id)} className="p-1 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50 cursor-pointer"><MoreVertical className="w-3 h-3 text-gray-400" /></button>
                          <button onClick={() => setReplyingTo(msg)} className="p-1 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50 cursor-pointer"><Reply className="w-3 h-3 text-gray-400" /></button>
                        </div>
                      )}

                      <div className="max-w-[70%]">
                        {/* Reply reference */}
                        {msg.replyTo && (
                          <div className={`px-3 py-1.5 mb-0.5 rounded-t-xl border-l-2 ${isOwn ? "bg-[#7a0602] border-[#c8a84e]" : "bg-gray-100 border-[#990803]"}`}>
                            <p style={{ fontSize: "9px", fontWeight: 600 }} className={isOwn ? "text-white/70" : "text-[#990803]"}>{msg.replyTo.senderName}</p>
                            <p style={{ fontSize: "10px" }} className={isOwn ? "text-white/60" : "text-gray-500"}>{msg.replyTo.text}</p>
                          </div>
                        )}

                        {/* Voice message */}
                        {msg.type === "voice" ? (
                          <div className={`rounded-xl px-3 py-2.5 ${isOwn ? "bg-[#990803] text-white" : "bg-white border border-gray-200"}`}>
                            <div className="flex items-center gap-2">
                              <Mic className={`w-4 h-4 shrink-0 ${isOwn ? "text-white/70" : "text-[#990803]"}`} />
                              {/* Waveform SVG */}
                              <svg width="120" height="20" viewBox="0 0 120 20">
                                {Array.from({ length: 20 }, (_, i) => {
                                  const h = 4 + Math.random() * 14;
                                  return <rect key={i} x={i * 6} y={10 - h / 2} width="3" height={h} rx="1" fill={isOwn ? "rgba(255,255,255,0.5)" : "#990803"} opacity={0.6 + Math.random() * 0.4} />;
                                })}
                              </svg>
                              <span style={{ fontSize: "10px" }} className={isOwn ? "text-white/60" : "text-gray-400"}>0:05</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span className={isOwn ? "text-white/50" : "text-gray-300"} style={{ fontSize: "9px" }}>{msg.timestamp}</span>
                              {isOwn && <CheckCheck className={`w-3 h-3 ${msg.read ? "text-blue-300" : "text-white/40"}`} />}
                            </div>
                          </div>
                        ) : msg.type === "file" ? (
                          <div className={`rounded-xl px-3 py-2.5 ${isOwn ? "bg-[#990803] text-white" : "bg-white border border-gray-200"}`}>
                            {!isOwn && isGroup && senderContact && (
                              <p style={{ fontSize: "10px", fontWeight: 600, color: ROLE_COLORS[senderContact.role] }} className="mb-1">{senderContact.name}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isOwn ? "bg-white/15" : "bg-gray-100"}`}>
                                <File className={`w-4 h-4 ${isOwn ? "text-white/80" : "text-gray-400"}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{msg.fileName}</p>
                                <p className={isOwn ? "text-white/60" : "text-gray-400"} style={{ fontSize: "9px" }}>{msg.fileSize}</p>
                              </div>
                              <button className={`p-1.5 rounded-lg cursor-pointer ${isOwn ? "hover:bg-white/10" : "hover:bg-gray-100"}`} onClick={() => toast.success("Đang tải xuống...")}>
                                <Download className={`w-3.5 h-3.5 ${isOwn ? "text-white/70" : "text-gray-400"}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className={isOwn ? "text-white/50" : "text-gray-300"} style={{ fontSize: "9px" }}>{msg.timestamp}</span>
                              {isOwn && <CheckCheck className={`w-3 h-3 ${msg.read ? "text-blue-300" : "text-white/40"}`} />}
                            </div>
                          </div>
                        ) : (
                          /* Text message */
                          <div className={`rounded-xl px-3 py-2 ${isOwn ? "bg-[#990803] text-white rounded-br-sm" : "bg-white border border-gray-200 rounded-bl-sm"} ${msg.pinned ? "ring-1 ring-[#c8a84e]/50" : ""}`}>
                            {!isOwn && isGroup && senderContact && (
                              <p style={{ fontSize: "10px", fontWeight: 600, color: ROLE_COLORS[senderContact.role] }} className="mb-0.5">{senderContact.name}</p>
                            )}
                            {msg.pinned && (
                              <div className="flex items-center gap-1 mb-0.5">
                                <Pin className={`w-2.5 h-2.5 ${isOwn ? "text-[#c8a84e]" : "text-[#c8a84e]"}`} />
                                <span style={{ fontSize: "8px", color: "#c8a84e", fontWeight: 600 }}>Đã ghim</span>
                              </div>
                            )}
                            <p style={{ fontSize: "13px", lineHeight: 1.5 }}>{msg.text}</p>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              {msg.edited && <span className={isOwn ? "text-white/40" : "text-gray-300"} style={{ fontSize: "8px" }}>đã sửa</span>}
                              <span className={isOwn ? "text-white/50" : "text-gray-300"} style={{ fontSize: "9px" }}>{msg.timestamp}</span>
                              {isOwn && <CheckCheck className={`w-3 h-3 ${msg.read ? "text-blue-300" : "text-white/40"}`} />}
                            </div>
                          </div>
                        )}

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`flex gap-0.5 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                            {Object.entries(msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([emoji, count]) => (
                              <span key={emoji} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-full cursor-pointer hover:bg-gray-50" style={{ fontSize: "11px" }} onClick={() => toggleReaction(msg.id, emoji)}>
                                {emoji} {count > 1 && <span className="text-gray-400" style={{ fontSize: "9px" }}>{count}</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Message action menu */}
                      {showAction && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setMsgActionId(null)} />
                          <div className={`absolute ${isOwn ? "right-0" : "left-0"} top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-40 py-1.5 w-48`}>
                            {/* Quick emoji row */}
                            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-100 mb-1">
                              {QUICK_EMOJIS.slice(0, 6).map(e => (
                                <button key={e} onClick={() => toggleReaction(msg.id, e)} className="p-1 hover:bg-gray-100 rounded cursor-pointer" style={{ fontSize: "14px" }}>{e}</button>
                              ))}
                            </div>
                            {[
                              { icon: Reply, label: "Trả lời", onClick: () => { setReplyingTo(msg); setMsgActionId(null); } },
                              { icon: Forward, label: "Chuyển tiếp", onClick: () => { toast.success("Đã chuyển tiếp tin nhắn"); setMsgActionId(null); } },
                              { icon: Copy, label: "Sao chép", onClick: () => { copyToClipboard(msg.text); toast.success("Đã sao chép"); setMsgActionId(null); } },
                              { icon: Pin, label: msg.pinned ? "Bỏ ghim" : "Ghim tin nhắn", onClick: () => { toast.success(msg.pinned ? "Đã bỏ ghim" : "Đã ghim tin nhắn"); setMsgActionId(null); } },
                              { icon: Bookmark, label: "Đánh dấu sao", onClick: () => { toast.success("Đã đánh dấu sao"); setMsgActionId(null); } },
                              { icon: Trash2, label: "Xóa", onClick: () => { toast.success("Đã xóa tin nhắn"); setMsgActionId(null); } },
                            ].map(a => (
                              <button key={a.label} onClick={a.onClick} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px" }}>
                                <a.icon className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-gray-600">{a.label}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && selectedContact && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>{selectedContact.name.split(" ").pop()} đang nhập</span>
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animation: `bounce 1.2s infinite ${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ═══════ RIGHT PANEL ═══════ */}
              {rightPanel !== "none" && (
                <div className="w-72 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-y-auto hidden lg:flex" style={{ scrollbarWidth: "thin" }}>
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>
                      {rightPanel === "info" ? "Thông tin" : rightPanel === "pinned" ? "Tin ghim" : rightPanel === "starred" ? "Đánh dấu" : rightPanel === "search" ? "Tìm kiếm" : "File chia sẻ"}
                    </span>
                    <button onClick={() => setRightPanel("none")} className="p-1 hover:bg-gray-100 rounded cursor-pointer"><X className="w-3.5 h-3.5 text-gray-400" /></button>
                  </div>

                  {rightPanel === "info" && selectedContact && (
                    <div className="p-4 space-y-4">
                      {/* Avatar */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-2" style={{ fontSize: "18px", fontWeight: 700, background: selectedContact.id.startsWith("G") ? "linear-gradient(145deg, #7c3aed, #5b21b6)" : `linear-gradient(145deg, ${ROLE_COLORS[selectedContact.role]}, ${ROLE_COLORS[selectedContact.role]}cc)` }}>
                          {selectedContact.id.startsWith("G") ? <Users className="w-7 h-7" /> : selectedContact.initials}
                        </div>
                        <p className="text-gray-800" style={{ fontSize: "15px", fontWeight: 600 }}>{selectedContact.name}</p>
                        <p className="text-gray-400" style={{ fontSize: "11px" }}>{selectedContact.position}</p>
                        {selectedContact.statusText && (
                          <p className="text-gray-500 mt-0.5" style={{ fontSize: "10px", fontStyle: "italic" }}>"{selectedContact.statusText}"</p>
                        )}
                      </div>
                      {/* Quick actions */}
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => toast.info("Gọi thoại...")} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><Phone className="w-4 h-4 text-gray-500" /><span className="text-gray-400" style={{ fontSize: "9px" }}>Gọi</span></button>
                        <button onClick={() => toast.info("Gọi video...")} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><Video className="w-4 h-4 text-gray-500" /><span className="text-gray-400" style={{ fontSize: "9px" }}>Video</span></button>
                        <button onClick={() => togglePin(selectedContact.id)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><Pin className={`w-4 h-4 ${selectedContact.pinned ? "text-[#990803]" : "text-gray-500"}`} /><span className="text-gray-400" style={{ fontSize: "9px" }}>{selectedContact.pinned ? "Bỏ ghim" : "Ghim"}</span></button>
                        <button onClick={() => toggleMute(selectedContact.id)} className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">{selectedContact.muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-gray-500" />}<span className="text-gray-400" style={{ fontSize: "9px" }}>{selectedContact.muted ? "Bật" : "Tắt"}</span></button>
                      </div>
                      {/* Details */}
                      {!selectedContact.id.startsWith("G") && (
                        <div className="space-y-2">
                          {selectedContact.email && (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <AtSign className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-600" style={{ fontSize: "11px" }}>{selectedContact.email}</span>
                            </div>
                          )}
                          {selectedContact.phone && (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-600" style={{ fontSize: "11px" }}>{selectedContact.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Shield className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-600" style={{ fontSize: "11px" }}>{selectedContact.subsidiary || "VP Tập đoàn"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: ROLE_COLORS[selectedContact.role], backgroundColor: ROLE_COLORS[selectedContact.role] + "15" }}>
                              {selectedContact.role === "admin" ? "Quản trị viên" : selectedContact.role === "instructor" ? "Giảng viên" : "Học viên"}
                            </span>
                          </div>
                        </div>
                      )}
                      {/* Shared files */}
                      <div>
                        <p className="text-gray-500 mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>File đã chia sẻ</p>
                        {allMessages.filter(m => m.type === "file").length > 0 ? allMessages.filter(m => m.type === "file").map(m => (
                          <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-1">
                            <File className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-gray-600 truncate" style={{ fontSize: "11px" }}>{m.fileName}</p>
                              <p className="text-gray-300" style={{ fontSize: "9px" }}>{m.fileSize} • {m.timestamp}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-gray-300 text-center py-2" style={{ fontSize: "11px" }}>Chưa có file nào</p>
                        )}
                      </div>
                    </div>
                  )}

                  {rightPanel === "pinned" && (
                    <div className="p-3 space-y-2">
                      {allMessages.filter(m => m.pinned).length > 0 ? allMessages.filter(m => m.pinned).map(m => (
                        <div key={m.id} className="p-2.5 bg-gray-50 rounded-lg border-l-2 border-[#c8a84e]">
                          <p className="text-gray-600" style={{ fontSize: "12px" }}>"{m.text}"</p>
                          <p className="text-gray-400 mt-1" style={{ fontSize: "9px" }}>{CONTACTS.find(c => c.id === m.senderId)?.name} • {m.timestamp}</p>
                        </div>
                      )) : (
                        <div className="text-center py-6">
                          <Pin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-gray-400" style={{ fontSize: "12px" }}>Chưa có tin nhắn ghim</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reply bar */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <div className="w-0.5 h-8 bg-[#990803] rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>{CONTACTS.find(c => c.id === replyingTo.senderId)?.name || "Bạn"}</p>
                  <p className="text-gray-500 truncate" style={{ fontSize: "11px" }}>{replyingTo.text}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded cursor-pointer"><X className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
            )}

            {/* AI Suggestions */}
            {showAISuggest && (
              <div className="px-4 py-2 bg-purple-50 border-t border-purple-100 flex items-center gap-2 overflow-x-auto">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                {AI_SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => { setNewMessage(s); setShowAISuggest(false); }} className="px-2.5 py-1 bg-white border border-purple-200 rounded-full text-purple-600 hover:bg-purple-50 cursor-pointer whitespace-nowrap shrink-0" style={{ fontSize: "11px" }}>{s}</button>
                ))}
                <button onClick={() => setShowAISuggest(false)} className="p-1 hover:bg-purple-100 rounded cursor-pointer shrink-0"><X className="w-3 h-3 text-purple-400" /></button>
              </div>
            )}

            {/* Quick templates */}
            {showTemplates && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2 overflow-x-auto">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {QUICK_TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => { setNewMessage(t.text); setShowTemplates(false); }} className="px-2.5 py-1 bg-white border border-amber-200 rounded-full text-amber-700 hover:bg-amber-50 cursor-pointer whitespace-nowrap shrink-0" style={{ fontSize: "11px" }}>{t.label}</button>
                ))}
                <button onClick={() => setShowTemplates(false)} className="p-1 hover:bg-amber-100 rounded cursor-pointer shrink-0"><X className="w-3 h-3 text-amber-400" /></button>
              </div>
            )}

            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="px-4 py-2 bg-white border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {["😊", "😂", "❤️", "👍", "👏", "🎉", "🔥", "💯", "🙏", "😍", "🤔", "😅", "👌", "💪", "✅", "📌", "📎", "⭐", "🎯", "📚", "💡", "🚀", "✨", "🏆"].map(e => (
                    <button key={e} onClick={() => { setNewMessage(prev => prev + e); setShowEmojiPicker(false); }} className="p-1.5 hover:bg-gray-100 rounded cursor-pointer" style={{ fontSize: "18px" }}>{e}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-1.5">
                <button onClick={() => toast.info("Chọn file đính kèm...")} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"><Paperclip className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => toast.info("Chọn hình ảnh...")} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"><Image className="w-4 h-4 text-gray-400" /></button>
                {(isAdmin || isInstructor) && (
                  <button onClick={() => { setShowTemplates(!showTemplates); setShowAISuggest(false); setShowEmojiPicker(false); }} className={`p-2 rounded-lg cursor-pointer ${showTemplates ? "bg-amber-100 text-amber-600" : "hover:bg-gray-100 text-gray-400"}`} title="Mẫu nhanh"><Zap className="w-4 h-4" /></button>
                )}
                <button onClick={() => { setShowAISuggest(!showAISuggest); setShowTemplates(false); setShowEmojiPicker(false); }} className={`p-2 rounded-lg cursor-pointer ${showAISuggest ? "bg-purple-100 text-purple-600" : "hover:bg-gray-100 text-gray-400"}`} title="AI Gợi ý"><Sparkles className="w-4 h-4" /></button>
                <input
                  ref={inputRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={replyingTo ? "Nhập trả lời..." : "Nhập tin nhắn..."}
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-[#990803]/20"
                  style={{ fontSize: "13px" }}
                />
                <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowTemplates(false); setShowAISuggest(false); }} className={`p-2 rounded-lg cursor-pointer ${showEmojiPicker ? "bg-gray-200" : "hover:bg-gray-100"}`}><Smile className="w-4 h-4 text-gray-400" /></button>
                {newMessage.trim() ? (
                  <button onClick={handleSend} className="p-2.5 bg-[#990803] text-white rounded-lg cursor-pointer hover:bg-[#7a0602] transition-colors"><Send className="w-4 h-4" /></button>
                ) : (
                  <button onClick={handleVoiceRecord} className={`p-2.5 rounded-lg cursor-pointer transition-colors ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex items-center justify-center bg-gray-50/50 ${showMobileList ? "hidden lg:flex" : "flex"}`}>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-500 mb-1" style={{ fontSize: "16px", fontWeight: 600 }}>Chào mừng đến Tin nhắn</p>
              <p className="text-gray-400" style={{ fontSize: "12px", maxWidth: "280px", margin: "0 auto", lineHeight: 1.5 }}>
                {isAdmin ? "Quản lý liên lạc với giảng viên, học viên và gửi thông báo hàng loạt." :
                 isInstructor ? "Hỗ trợ học viên, trao đổi với đồng nghiệp và sử dụng mẫu trả lời nhanh." :
                 "Đặt câu hỏi cho giảng viên, trao đổi với bạn học và nhận gợi ý từ AI."}
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={() => setShowCreateGroup(true)} className="px-4 py-2 bg-[#990803] text-white rounded-lg cursor-pointer flex items-center gap-1.5 hover:bg-[#7a0602]" style={{ fontSize: "12px", fontWeight: 500 }}>
                  <Plus className="w-3.5 h-3.5" /> Tạo nhóm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ MODALS ═══════ */}
      {/* Create Group Modal */}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} contacts={contacts.filter(c => !c.id.startsWith("G"))} />}

      {/* Broadcast Modal */}
      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} />}

      {/* Typing animation keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CREATE GROUP MODAL
   ═══════════════════════════════════════════════════════════ */
function CreateGroupModal({ onClose, contacts }: { onClose: () => void; contacts: Contact[] }) {
  const [groupName, setGroupName] = React.useState("");
  const [selectedMembers, setSelectedMembers] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");

  const filtered = contacts.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedMembers.size === 0) {
      toast.error("Vui lòng nhập tên nhóm và chọn ít nhất 1 thành viên");
      return;
    }
    toast.success(`Đã tạo nhóm "${groupName}" với ${selectedMembers.size} thành viên`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>Tạo nhóm mới</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Tên nhóm *</label>
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="VD: Nhóm Dự án ABC" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
          </div>
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Thêm thành viên ({selectedMembers.size} đã chọn)</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm người..." className="w-full pl-9 pr-3 py-1.5 bg-gray-50 rounded-lg border-0 focus:outline-none" style={{ fontSize: "12px" }} />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1" style={{ scrollbarWidth: "thin" }}>
              {filtered.map(c => (
                <button key={c.id} onClick={() => toggleMember(c.id)} className={`w-full flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${selectedMembers.has(c.id) ? "bg-[#990803]/5 border border-[#990803]/20" : "hover:bg-gray-50 border border-transparent"}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{ fontSize: "9px", fontWeight: 700, background: `linear-gradient(145deg, ${ROLE_COLORS[c.role]}, ${ROLE_COLORS[c.role]}cc)` }}>{c.initials}</div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{c.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>{c.position}</p>
                  </div>
                  {selectedMembers.has(c.id) && <Check className="w-4 h-4 text-[#990803] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
          <button onClick={handleCreate} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "13px", fontWeight: 600 }}>Tạo nhóm</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BROADCAST MODAL (Admin only)
   ═══════════════════════════════════════════════════════════ */
function BroadcastModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = React.useState("");
  const [target, setTarget] = React.useState("all");
  const [schedule, setSchedule] = React.useState(false);

  const handleSend = () => {
    if (!message.trim()) { toast.error("Vui lòng nhập nội dung thông báo"); return; }
    const targetLabel = target === "all" ? "toàn bộ" : target === "instructors" ? "giảng viên" : "học viên";
    toast.success(`Đã gửi thông báo đến ${targetLabel} nhân sự`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#990803]" />
            <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>Gửi thông báo hàng loạt</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Đối tượng</label>
            <select value={target} onChange={e => setTarget(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "13px" }}>
              <option value="all">Tất cả (6,610 người)</option>
              <option value="instructors">Giảng viên (45 người)</option>
              <option value="learners">Học viên (6,520 người)</option>
            </select>
          </div>
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Nội dung thông báo *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Nhập nội dung thông báo..." rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none" style={{ fontSize: "13px" }} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600" style={{ fontSize: "12px" }}>Hẹn giờ gửi</span>
            </div>
            <button onClick={() => setSchedule(!schedule)} className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${schedule ? "bg-[#990803]" : "bg-gray-200"}`}>
              <div className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-sm top-[3px] transition-all" style={{ left: schedule ? "18px" : "3px" }} />
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
          <button onClick={handleSend} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Send className="w-3.5 h-3.5" /> {schedule ? "Hẹn gửi" : "Gửi ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
