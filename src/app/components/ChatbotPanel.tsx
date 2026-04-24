import { useState, useRef, useEffect, useCallback } from "react";
import { copyToClipboard } from "../utils/clipboard";
import {
  X, Send, Sparkles, RotateCcw, ChevronDown, ThumbsUp, ThumbsDown,
  Copy, Check, Paperclip, Mic, MicOff, Image, FileText, Minimize2,
  Maximize2, Volume2, VolumeX, Bookmark, BookmarkCheck, Search,
  Zap, ArrowRight, ExternalLink, BarChart3, Users, Award, Clock,
  AlertTriangle, TrendingUp, BookOpen, MessageSquare,
} from "lucide-react";
import { useAuth } from "./AuthContext";

/* ================================================================ */
/*  OWL MASCOT SVG — with emotion states                            */
/* ================================================================ */
type OwlMood = "default" | "happy" | "thinking" | "explaining" | "alert";

function OwlMascotMini({ size = 48, animated = true, mood = "default" }: { size?: number; animated?: boolean; mood?: OwlMood }) {
  // Eye pupil positions based on mood
  const leftPupilX = mood === "thinking" ? 84 : mood === "happy" ? 86 : 86;
  const leftPupilY = mood === "thinking" ? 82 : mood === "happy" ? 85 : 84;
  const rightPupilX = mood === "thinking" ? 116 : mood === "happy" ? 114 : 114;
  const rightPupilY = mood === "thinking" ? 82 : mood === "happy" ? 85 : 84;
  const pupilR = mood === "happy" ? 3.5 : 4.5;

  // Eyebrow curves
  const leftBrow = mood === "happy" ? "M72 78 Q80 72 92 77" : mood === "alert" ? "M72 74 Q80 68 92 73" : "M72 76 Q80 70 92 75";
  const rightBrow = mood === "happy" ? "M128 78 Q120 72 108 77" : mood === "alert" ? "M128 74 Q120 68 108 73" : "M128 76 Q120 70 108 75";

  // Beak (smile for happy)
  const beakPath = mood === "happy"
    ? "M94 94 Q97 98 100 100 Q103 98 106 94 Z"
    : "M96 94 L100 103 L104 94 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={animated ? { animation: "owlBounce 3s ease-in-out infinite" } : undefined}
    >
      <defs>
        <radialGradient id="cb-owlBody" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#b81a12" />
          <stop offset="60%" stopColor="#990803" />
          <stop offset="100%" stopColor="#5c0401" />
        </radialGradient>
        <linearGradient id="cb-owlGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8c84e" />
          <stop offset="50%" stopColor="#c8a84e" />
          <stop offset="100%" stopColor="#a68630" />
        </linearGradient>
        <radialGradient id="cb-owlEye" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="100%" stopColor="#f0d68a" />
        </radialGradient>
        <linearGradient id="cb-owlShine" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="cb-wingShade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7a0602" />
          <stop offset="100%" stopColor="#4a0301" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="155" rx="36" ry="8" fill="rgba(0,0,0,0.08)" />
      <ellipse cx="100" cy="108" rx="42" ry="48" fill="url(#cb-owlBody)" />
      <ellipse cx="100" cy="118" rx="26" ry="30" fill="#690502" opacity="0.3" />
      <ellipse cx="100" cy="120" rx="22" ry="26" fill="url(#cb-owlGold)" opacity="0.15" />
      <ellipse cx="92" cy="90" rx="28" ry="35" fill="url(#cb-owlShine)" />

      {/* Wings — animate for explaining mood */}
      <g style={mood === "explaining" ? { animation: "owlWingWave 1.5s ease-in-out infinite" } : undefined}>
        <path d="M58 100 Q38 108 42 135 Q46 145 60 148 Q64 135 62 115 Z" fill="url(#cb-wingShade)" />
        <path d="M58 100 Q42 106 45 128 Q54 118 58 108 Z" fill="rgba(255,255,255,0.08)" />
      </g>
      <g style={mood === "explaining" ? { animation: "owlWingWave 1.5s ease-in-out 0.3s infinite" } : undefined}>
        <path d="M142 100 Q162 108 158 135 Q154 145 140 148 Q136 135 138 115 Z" fill="url(#cb-wingShade)" />
        <path d="M142 100 Q158 106 155 128 Q146 118 142 108 Z" fill="rgba(255,255,255,0.08)" />
      </g>

      <path d="M72 68 Q68 45 78 55 Q74 62 76 70 Z" fill="#7a0602" />
      <path d="M72 68 Q70 52 76 58 Z" fill="url(#cb-owlGold)" opacity="0.3" />
      <path d="M128 68 Q132 45 122 55 Q126 62 124 70 Z" fill="#7a0602" />
      <path d="M128 68 Q130 52 124 58 Z" fill="url(#cb-owlGold)" opacity="0.3" />

      <ellipse cx="100" cy="88" rx="30" ry="28" fill="#5c0401" opacity="0.4" />

      {/* Eyes with mood-based pupils */}
      <circle cx="86" cy="84" r="14" fill="#3a0200" opacity="0.5" />
      <circle cx="86" cy="84" r="12" fill="url(#cb-owlEye)" />
      <circle cx="86" cy="84" r="7" fill="#8a6e12" />
      <circle cx={leftPupilX} cy={leftPupilY} r={pupilR} fill="#2d0806">
        {mood === "thinking" && <animate attributeName="cx" values="84;88;84" dur="2s" repeatCount="indefinite" />}
      </circle>
      <circle cx={leftPupilX - 3} cy={leftPupilY - 3} r="2.5" fill="white" opacity="0.9" />
      {mood === "happy" && <path d="M80 86 Q86 90 92 86" fill="none" stroke="#8a6e12" strokeWidth="1.5" opacity="0.5" />}

      <circle cx="114" cy="84" r="14" fill="#3a0200" opacity="0.5" />
      <circle cx="114" cy="84" r="12" fill="url(#cb-owlEye)" />
      <circle cx="114" cy="84" r="7" fill="#8a6e12" />
      <circle cx={rightPupilX} cy={rightPupilY} r={pupilR} fill="#2d0806">
        {mood === "thinking" && <animate attributeName="cx" values="116;112;116" dur="2s" repeatCount="indefinite" />}
      </circle>
      <circle cx={rightPupilX - 3} cy={rightPupilY - 3} r="2.5" fill="white" opacity="0.9" />
      {mood === "happy" && <path d="M108 86 Q114 90 120 86" fill="none" stroke="#8a6e12" strokeWidth="1.5" opacity="0.5" />}

      {/* Beak */}
      <path d={beakPath} fill="url(#cb-owlGold)" />

      {/* Eyebrows */}
      <path d={leftBrow} fill="none" stroke="#5c0401" strokeWidth="2.5" strokeLinecap="round" />
      <path d={rightBrow} fill="none" stroke="#5c0401" strokeWidth="2.5" strokeLinecap="round" />

      <path d="M82 148 L78 155 L82 153 L86 156 L88 148" fill="url(#cb-owlGold)" />
      <path d="M112 148 L114 156 L118 153 L122 155 L118 148" fill="url(#cb-owlGold)" />

      <path d="M66 62 L100 50 L134 62 L100 72 Z" fill="#2d0806" />
      <path d="M66 62 L100 50 L100 72 Z" fill="#3d0f0a" />
      <ellipse cx="100" cy="58" rx="12" ry="8" fill="#2d0806" />
      <ellipse cx="100" cy="57" rx="10" ry="6" fill="#3d0f0a" />
      <line x1="134" y1="62" x2="140" y2="78" stroke="url(#cb-owlGold)" strokeWidth="2" />
      <circle cx="140" cy="80" r="3" fill="url(#cb-owlGold)" />
      <circle cx="100" cy="55" r="2.5" fill="url(#cb-owlGold)" />

      {/* Alert exclamation */}
      {mood === "alert" && (
        <g>
          <circle cx="150" cy="50" r="10" fill="#e74c3c" />
          <text x="150" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">!</text>
        </g>
      )}

      {/* Thinking dots */}
      {mood === "thinking" && (
        <g>
          <circle cx="148" cy="60" r="3" fill="#c8a84e" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="156" cy="52" r="4" fill="#c8a84e" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="162" cy="42" r="5" fill="#c8a84e" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Sparkle for happy/default */}
      {(mood === "default" || mood === "happy") && (
        <path d="M148 48 L150 44 L152 48 L156 50 L152 52 L150 56 L148 52 L144 50 Z" fill="#c8a84e" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}

/* ================================================================ */
/*  TYPING INDICATOR                                                */
/* ================================================================ */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] flex items-center justify-center shrink-0 overflow-hidden">
        <OwlMascotMini size={22} animated={false} mood="thinking" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#990803]/50" style={{ animation: "typingDot 1.2s ease-in-out infinite" }} />
          <div className="w-2 h-2 rounded-full bg-[#990803]/50" style={{ animation: "typingDot 1.2s ease-in-out 0.2s infinite" }} />
          <div className="w-2 h-2 rounded-full bg-[#990803]/50" style={{ animation: "typingDot 1.2s ease-in-out 0.4s infinite" }} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TYPES                                                           */
/* ================================================================ */
interface ActionButton { label: string; icon?: string; action: string }
interface FollowUp { label: string; prompt: string }

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mood?: OwlMood;
  actions?: ActionButton[];
  followUps?: FollowUp[];
  feedback?: "up" | "down" | null;
  bookmarked?: boolean;
  category?: string;
}

/* ================================================================ */
/*  ROLE-BASED QUICK ACTIONS                                        */
/* ================================================================ */
function getQuickActions(role: string): { label: string; prompt: string; icon: React.ReactNode }[] {
  const ic = "w-3.5 h-3.5";
  switch (role) {
    case "admin":
      return [
        { label: "Tổng quan hệ thống", prompt: "Cho tôi tóm tắt tình hình hoạt động hệ thống LMS hôm nay", icon: <BarChart3 className={ic} /> },
        { label: "Chứng chỉ sắp hết hạn", prompt: "Những chứng chỉ nào sắp hết hạn trong 30 ngày tới?", icon: <Award className={ic} /> },
        { label: "Phân tích KPI Q1", prompt: "Phân tích KPI đào tạo quý 1 năm 2026", icon: <TrendingUp className={ic} /> },
        { label: "So sánh công ty", prompt: "So sánh hiệu quả đào tạo giữa các công ty thành viên", icon: <Users className={ic} /> },
        { label: "Nhân sự cần nhắc nhở", prompt: "Danh sách nhân sự chưa hoàn thành khóa học bắt buộc", icon: <AlertTriangle className={ic} /> },
        { label: "Thống kê lượt truy cập", prompt: "Thống kê lượt truy cập và thời gian sử dụng hệ thống tuần này", icon: <Clock className={ic} /> },
      ];
    case "instructor":
      return [
        { label: "Bài nộp chờ chấm", prompt: "Tóm tắt các bài nộp đang chờ chấm điểm", icon: <FileText className={ic} /> },
        { label: "Học viên tụt tiến độ", prompt: "Danh sách học viên có tiến độ thấp trong khóa của tôi", icon: <AlertTriangle className={ic} /> },
        { label: "Cải thiện khóa học", prompt: "Gợi ý cách cải thiện tỷ lệ hoàn thành khóa học", icon: <TrendingUp className={ic} /> },
        { label: "Tạo câu hỏi", prompt: "Giúp tôi tạo 5 câu hỏi trắc nghiệm cho chủ đề Digital Marketing", icon: <BookOpen className={ic} /> },
        { label: "Phân tích điểm số", prompt: "Phân tích phân bổ điểm số lớp Marketing số", icon: <BarChart3 className={ic} /> },
        { label: "Soạn thông báo", prompt: "Giúp tôi soạn thông báo nhắc nhở học viên hoàn thành bài tập", icon: <MessageSquare className={ic} /> },
      ];
    case "learner":
      return [
        { label: "Tiến độ của tôi", prompt: "Tóm tắt tiến độ học tập hiện tại của tôi", icon: <TrendingUp className={ic} /> },
        { label: "Gợi ý khóa học", prompt: "Gợi ý khóa học phù hợp với vị trí và mục tiêu của tôi", icon: <BookOpen className={ic} /> },
        { label: "Ôn tập nhanh", prompt: "Giúp tôi ôn tập cho bài kiểm tra Tuân thủ Pháp luật", icon: <Zap className={ic} /> },
        { label: "Giải thích thuật ngữ", prompt: "Giải thích khái niệm Dòng tiền tự do (FCF) một cách đơn giản", icon: <MessageSquare className={ic} /> },
        { label: "Deadline sắp tới", prompt: "Tôi có những deadline nào trong 2 tuần tới?", icon: <Clock className={ic} /> },
        { label: "Hỏi bài tập", prompt: "Tôi cần trợ giúp với bài tập phân tích dòng tiền chiết khấu DCF", icon: <AlertTriangle className={ic} /> },
      ];
    default:
      return [];
  }
}

/* ================================================================ */
/*  WELCOME & MOCK REPLY SYSTEM                                     */
/* ================================================================ */
function getWelcomeMessage(role: string, name: string): ChatMessage {
  const base = {
    id: "welcome",
    role: "assistant" as const,
    timestamp: new Date(),
    mood: "happy" as OwlMood,
    feedback: null,
    bookmarked: false,
  };

  switch (role) {
    case "admin":
      return {
        ...base,
        content: `Xin chào anh/chị **${name}**! 🦉\n\nTôi là **GelBot** — trợ lý AI của Geleximco LMS. Tôi có thể hỗ trợ anh/chị:\n\n• Xem tổng quan & báo cáo hệ thống\n• Phân tích KPI đào tạo theo phòng ban/công ty\n• Cảnh báo chứng chỉ, tiến độ & nhân sự\n• Tạo báo cáo nhanh & xuất dữ liệu\n\nAnh/chị cần tôi hỗ trợ gì ạ?`,
        category: "Chào mừng",
      };
    case "instructor":
      return {
        ...base,
        content: `Xin chào thầy/cô **${name}**! 🦉\n\nTôi là **GelBot** — trợ lý AI hỗ trợ giảng dạy. Tôi có thể giúp:\n\n• Theo dõi tiến độ học viên & chấm điểm\n• Tạo câu hỏi kiểm tra & nội dung\n• Phân tích kết quả giảng dạy\n• Soạn thông báo & nhắc nhở\n\nThầy/cô cần hỗ trợ gì ạ?`,
        category: "Chào mừng",
      };
    case "learner":
      return {
        ...base,
        content: `Xin chào bạn **${name}**! 🦉\n\nTôi là **GelBot** — bạn đồng hành học tập tại Geleximco. Tôi có thể giúp bạn:\n\n• Kiểm tra tiến độ & deadline khóa học\n• Gợi ý khóa học & lộ trình phù hợp\n• Giải đáp thắc mắc bài học\n• Ôn tập & luyện thi trắc nghiệm\n\nBạn muốn tôi giúp gì nào?`,
        category: "Chào mừng",
      };
    default:
      return { ...base, content: "Xin chào! Tôi là GelBot, trợ lý AI của Geleximco LMS." };
  }
}

interface MockReplyResult {
  content: string;
  mood: OwlMood;
  actions?: ActionButton[];
  followUps?: FollowUp[];
  category?: string;
}

function getMockReply(prompt: string, role: string, conversationContext: string[]): MockReplyResult {
  const lower = prompt.toLowerCase();
  const isQuizAnswer = /^[abcd]$/i.test(lower.trim());

  // Quiz follow-up tracking
  if (isQuizAnswer && conversationContext.some(c => c.includes("Câu 1:") || c.includes("ôn tập"))) {
    const answer = lower.trim().toUpperCase();
    if (answer === "B") {
      return {
        content: "✅ **Chính xác!** Đáp án B — 01/01/2021 là đúng.\n\nLuật Doanh nghiệp 2020 (số 59/2020/QH14) được Quốc hội thông qua ngày 17/06/2020 và có hiệu lực từ **01/01/2021**.\n\n---\n\n**Câu 2:** Ai có quyền triệu tập họp Đại hội đồng cổ đông bất thường?\nA. Giám đốc/Tổng giám đốc\nB. **Hội đồng quản trị**\nC. Ban kiểm soát\nD. Cả B và C\n\nBạn chọn đáp án nào?",
        mood: "happy",
        followUps: [
          { label: "Chọn A", prompt: "A" },
          { label: "Chọn B", prompt: "B" },
          { label: "Chọn C", prompt: "C" },
          { label: "Chọn D", prompt: "D" },
        ],
        category: "Ôn tập",
      };
    }
    return {
      content: `❌ Chưa chính xác. Đáp án đúng là **B — 01/01/2021**.\n\n💡 **Giải thích:** Luật Doanh nghiệp 2020 được QH thông qua tháng 6/2020 nhưng có hiệu lực thi hành từ ngày 01/01/2021, thay thế Luật DN 2014.\n\n---\n\n**Câu 2:** Ai có quyền triệu tập họp ĐHĐCĐ bất thường?\nA. Giám đốc/Tổng giám đốc\nB. **Hội đồng quản trị**\nC. Ban kiểm soát\nD. Cả B và C\n\nBạn chọn đáp án nào?`,
      mood: "explaining",
      followUps: [
        { label: "Chọn A", prompt: "A" },
        { label: "Chọn B", prompt: "B" },
        { label: "Chọn C", prompt: "C" },
        { label: "Chọn D", prompt: "D" },
      ],
      category: "Ôn tập",
    };
  }

  if (lower.includes("tiến độ") || lower.includes("tóm tắt") || lower.includes("báo cáo") || lower.includes("tổng quan")) {
    if (role === "admin") return {
      content: "📊 **Báo cáo nhanh hôm nay (09/03/2026):**\n\n• **Tổng nhân sự toàn TĐ:** 6,610 (14 đơn vị, 10 lĩnh vực)\n• **Người dùng hoạt động:** 5,280/6,610 (79.9%)\n• **Khóa mới hoàn thành:** 48 lượt\n• **Giờ học hôm nay:** 682 giờ\n• **Bài nộp mới:** 93 bài\n• **Chứng chỉ sắp hết hạn:** 78 (trong 30 ngày)\n\n⚠️ **Cảnh báo:** Khối BĐS (3 KĐT) đang **dưới mục tiêu** — TB 76% vs mục tiêu 85%.\n📍 **Điểm sáng:** Xi măng Thăng Long & Khoáng sản đạt >90% hoàn thành.\n🏗️ **Lưu ý:** Nhiệt điện Thăng Long có 12 NV chưa gia hạn chứng chỉ ATLĐ.",
      mood: "explaining",
      actions: [
        { label: "Gửi nhắc nhở", icon: "send", action: "send_reminder" },
        { label: "Xem chi tiết", icon: "detail", action: "view_detail" },
        { label: "Xuất Excel", icon: "export", action: "export_excel" },
      ],
      followUps: [
        { label: "Chi tiết khối Kỹ thuật", prompt: "Phân tích chi tiết tình hình đào tạo khối Kỹ thuật" },
        { label: "Top phòng ban", prompt: "Top 5 phòng ban có hiệu quả đào tạo tốt nhất" },
        { label: "So sánh tuần trước", prompt: "So sánh chỉ số hôm nay với tuần trước" },
      ],
      category: "Báo cáo",
    };
    if (role === "instructor") return {
      content: "📋 **Tóm tắt bài nộp chờ chấm:**\n\n| Khóa học | Số bài | Quá hạn |\n|----------|--------|---------|\n| Marketing số | 8 bài | 4 bài (>48h) |\n| SEO Nâng cao | 3 bài | 0 bài |\n| Content Marketing | 5 bài | 1 bài (>24h) |\n\n⏰ **Ưu tiên:** 4 bài Marketing số đã quá hạn chấm. Tôi khuyến nghị xử lý sớm để học viên nhận phản hồi kịp thời.\n\n📈 **Tổng kết tuần:** Tỷ lệ chấm đúng hạn: 78% (↓5% so với tuần trước)",
      mood: "alert",
      actions: [
        { label: "Mở bài chấm", icon: "grade", action: "open_grading" },
        { label: "Gửi nhắc HV", icon: "notify", action: "notify_students" },
      ],
      followUps: [
        { label: "Học viên tiến độ thấp", prompt: "Danh sách học viên có tiến độ thấp trong khóa của tôi" },
        { label: "Thống kê điểm số", prompt: "Phân tích phân bổ điểm số lớp Marketing số" },
        { label: "Lịch dạy tuần này", prompt: "Lịch giảng dạy của tôi tuần này" },
      ],
      category: "Chấm bài",
    };
    return {
      content: "📚 **Tiến độ học tập — Lê Hoàng Nam (ABBank):**\n\n| Khóa học | Tiến độ | Deadline | Bắt buộc |\n|----------|---------|----------|----------|\n| Phân tích Tài chính DN | 45% | 15/03/2026 | ❌ |\n| Tuân thủ Pháp luật DN | 88% | 20/03/2026 | ✅ |\n| Quản trị Rủi ro Tín dụng | 30% | 05/04/2026 | ✅ |\n| Teamwork & Giao tiếp | 60% | 30/03/2026 | ❌ |\n\n⚡ **Gợi ý:** Ưu tiên hoàn thành **Tuân thủ PL** (chỉ còn 12%) và **Phân tích TC** (deadline 6 ngày)!\n\n🔥 **Streak:** 7 ngày liên tiếp — Cố lên!\n🏦 **ABBank yêu cầu:** Tối thiểu 2 khóa bắt buộc/quý.",
      mood: "explaining",
      actions: [
        { label: "Học tiếp Tuân thủ PL", icon: "play", action: "continue_course" },
        { label: "Xem lộ trình", icon: "path", action: "view_path" },
      ],
      followUps: [
        { label: "Gợi ý khóa tiếp theo", prompt: "Gợi ý khóa học phù hợp với vị trí và mục tiêu của tôi" },
        { label: "Deadline 2 tuần tới", prompt: "Tôi có những deadline nào trong 2 tuần tới?" },
        { label: "Ôn tập Tuân thủ PL", prompt: "Giúp tôi ôn tập cho bài kiểm tra Tuân thủ Pháp luật" },
      ],
      category: "Tiến độ",
    };
  }

  if (lower.includes("chứng chỉ") || lower.includes("hết hạn")) {
    return {
      content: "🏆 **Chứng chỉ sắp hết hạn (30 ngày tới):**\n\n| Chứng chỉ | Đơn vị | Số NV | Hạn cuối |\n|------------|--------|-------|----------|\n| ATLĐ Khai khoáng | Khoáng sản GX | 35 NV | 20/04/2026 |\n| ATLĐ Xây dựng | 3 KĐT BĐS | 28 NV | 15/04/2026 |\n| Vận hành NM Điện | NĐ Thăng Long | 12 NV | 10/04/2026 |\n| Tuân thủ PL DN | Toàn tập đoàn | 15 NV | 08/04/2026 |\n| PCCC | Xi măng T.Long | 8 NV | 05/04/2026 |\n\n📌 **Đề xuất:** Gửi nhắc nhở hàng loạt, ưu tiên Khoáng sản & Nhiệt điện.\n⚠️ **Nghiêm trọng:** 12 NV Nhiệt điện Thăng Long — vận hành NMĐ 2x300MW, thiếu chứng chỉ = vi phạm quy chuẩn Bộ Công Thương.",
      mood: "alert",
      actions: [
        { label: "Gửi email nhắc nhở", icon: "mail", action: "send_bulk_email" },
        { label: "Mở lịch thi", icon: "calendar", action: "schedule_exam" },
        { label: "Xuất danh sách", icon: "export", action: "export_list" },
      ],
      followUps: [
        { label: "Soạn email mẫu", prompt: "Soạn email mẫu nhắc nhở gia hạn chứng chỉ" },
        { label: "Chi tiết ATLĐ", prompt: "Danh sách 45 nhân viên cần gia hạn chứng chỉ An toàn Lao động" },
      ],
      category: "Chứng chỉ",
    };
  }

  if (lower.includes("gợi ý") || lower.includes("khóa học") || lower.includes("đăng ký")) {
    return {
      content: "🎯 **Gợi ý khóa học cho bạn:**\n\nDựa trên vị trí *Chuyên viên Phân tích Tín dụng — ABBank* và lộ trình phát triển:\n\n**1. Quản trị Rủi ro Tín dụng Nâng cao**\nPhù hợp lộ trình lên Phó phòng Tín dụng • 20 giờ • ⭐ 4.8\n\n**2. Kỹ năng Lãnh đạo cho Quản lý Cấp trung**\nChuẩn bị cho bước thăng tiến 2026 • 24 giờ • ⭐ 4.8\n\n**3. AI trong Quản trị Doanh nghiệp**\nXu hướng mới — FPT Education h��p tác • 20 giờ • ⭐ 4.9\n\n💡 Khóa #1 phù hợp nhất — bổ trợ trực tiếp cho nghiệp vụ tín dụng tại ABBank.",
      mood: "happy",
      actions: [
        { label: "Đăng ký khóa #1", icon: "enroll", action: "enroll_course_1" },
        { label: "Xem chi tiết", icon: "detail", action: "view_courses" },
      ],
      followUps: [
        { label: "So sánh 3 khóa", prompt: "So sánh chi tiết 3 khóa học này về nội dung và thời lượng" },
        { label: "Khóa học miễn phí", prompt: "Có khóa học miễn phí nào phù hợp không?" },
        { label: "Lộ trình Tài chính", prompt: "Xem lộ trình phát triển nghề nghiệp cho vị trí Tài chính" },
      ],
      category: "Gợi ý",
    };
  }

  if (lower.includes("kpi") || lower.includes("phân tích")) {
    return {
      content: "📈 **Phân tích KPI Đào tạo Q1/2026 — Toàn Tập đoàn:**\n\n| Chỉ số | Mục tiêu | Thực tế | Trạng thái |\n|--------|----------|---------|------------|\n| Tỷ lệ hoàn thành | 85% | 83.4% | ⚠️ Gần đạt |\n| Giờ học/người | 10h/Q | 9.6h | ⚠️ Gần đạt |\n| NV hoạt động | 80% | 85% | ✅ Vượt |\n| Chứng chỉ mới | 450 | 512 | ✅ Vượt |\n| Tỷ lệ bỏ dở | <10% | 7.3% | ✅ Đạt |\n| Đơn vị đạt KPI | 14/14 | 9/14 | ⚠️ 5 đơn vị chưa đạt |\n\n🔍 **Top 3 yếu nhất:** BĐS Dương Nội (74%), BĐS Lê Trọng Tấn (76%), Bảo hiểm AAA (78%)\n🏆 **Top 3 mạnh nhất:** Khoáng sản (93%), Xi măng T.Long (91%), Giáo dục (90%)\n📊 **Nhận xét:** Khối SX/Năng lượng vượt trội nhờ cơ chế ATLĐ bắt buộc. Khối BĐS & Tài chính cần đẩy mạnh.",
      mood: "explaining",
      actions: [
        { label: "Xem chi tiết", icon: "detail", action: "kpi_detail" },
        { label: "Xuất báo cáo", icon: "export", action: "export_kpi" },
        { label: "So sánh Q4/2025", icon: "compare", action: "compare_q4" },
      ],
      followUps: [
        { label: "Chi tiết khối Kỹ thuật", prompt: "Phân tích chi tiết tình hình đào tạo khối Kỹ thuật" },
        { label: "Dự báo Q2/2026", prompt: "Dự báo KPI đào tạo Q2/2026 dựa trên xu hướng hiện tại" },
      ],
      category: "KPI",
    };
  }

  if (lower.includes("câu hỏi") || lower.includes("tạo")) {
    return {
      content: "📝 **5 câu hỏi trắc nghiệm Digital Marketing:**\n\n**Câu 1.** KPI quan trọng nhất đo ROI chiến dịch quảng cáo số?\nA. Impressions  B. **ROAS**  C. Reach  D. CTR\n\n**Câu 2.** SEO on-page bao gồm yếu tố nào?\nA. Backlinks  B. **Meta tags**  C. Social signals  D. Domain age\n\n**Câu 3.** Tỷ lệ Conversion Rate = ?\nA. Clicks/Views  B. **Conversions/Clicks**  C. Revenue/Cost  D. Leads/Traffic\n\n**Câu 4.** Kênh có CPA thấp nhất thường là?\nA. Facebook Ads  B. Google Display  C. **Email Marketing**  D. TikTok Ads\n\n**Câu 5.** A/B Testing trong marketing dùng để?\nA. Test server  B. **So sánh 2 phiên bản**  C. Debug code  D. Test API",
      mood: "happy",
      actions: [
        { label: "Thêm 5 câu nữa", icon: "add", action: "add_questions" },
        { label: "Điều chỉnh độ khó", icon: "edit", action: "adjust_difficulty" },
        { label: "Xuất file Word", icon: "export", action: "export_word" },
      ],
      followUps: [
        { label: "Thêm câu nâng cao", prompt: "Tạo 5 câu hỏi nâng cao hơn về Digital Marketing" },
        { label: "Tạo cho chủ đề khác", prompt: "Tạo 5 câu hỏi về Content Marketing" },
        { label: "Tạo đề thi hoàn chỉnh", prompt: "Tạo đề thi hoàn chỉnh 20 câu cho khóa Digital Marketing" },
      ],
      category: "Nội dung",
    };
  }

  if (lower.includes("giải thích") || lower.includes("fcf") || lower.includes("thuật ngữ") || lower.includes("trợ giúp") || lower.includes("dcf")) {
    return {
      content: "💡 **Dòng tiền tự do (Free Cash Flow — FCF):**\n\nĐơn giản nhất, FCF là **số tiền mặt còn lại** sau khi doanh nghiệp đã:\n- Trả hết chi phí hoạt động\n- Đầu tư vào tài sản cố định (CapEx)\n\n**Công thức:**\n`FCF = Dòng tiền hoạt động (OCF) − Chi đầu tư vốn (CapEx)`\n\n**Ví dụ thực tế từ Geleximco:**\n• ABBank thu 500 tỷ từ hoạt động, chi 200 tỷ mua thiết bị\n• → FCF = 300 tỷ ✅ (khỏe mạnh)\n\n**Tại sao quan trọng?**\nFCF dương → DN có tiền trả cổ tức, mua lại cổ phiếu, hoặc đầu tư mở rộng mà không cần vay thêm 💪",
      mood: "explaining",
      followUps: [
        { label: "Giải thích DCF", prompt: "Giải thích phương pháp chiết khấu dòng tiền DCF" },
        { label: "Bài tập tính FCF", prompt: "Cho tôi một bài tập tính FCF với số liệu cụ thể" },
        { label: "So sánh FCF & EBITDA", prompt: "So sánh FCF với EBITDA, khi nào dùng cái nào?" },
      ],
      category: "Kiến thức",
    };
  }

  if (lower.includes("so sánh") || lower.includes("công ty")) {
    return {
      content: "🏢 **So sánh hiệu quả đào tạo Q1/2026 — 14 đơn vị:**\n\n| Đơn vị | Lĩnh vực | HT (%) | Giờ/người | Hạng |\n|--------|----------|--------|-----------|------|\n| Khoáng sản GX | Khoáng sản | 93% | 9.2h | 🥇 |\n| Xi măng Thăng Long | VLXD | 91% | 8.8h | 🥈 |\n| Geleximco Giáo dục | Giáo dục | 90% | 8.6h | 🥉 |\n| NĐ Thăng Long | Năng lượng | 89% | 8.4h | 4 |\n| VP Tập đoàn | Holding | 87% | 8.5h | 5 |\n| NL Tái tạo | Năng lượng | 85% | 7.8h | 6 |\n| KCN Quang Minh | Hạ tầng | 83% | 7.5h | 7 |\n| ABBank | Tài chính | 82% | 7.8h | 8 |\n| TM & XNK | Thương mại | 81% | 7.2h | 9 |\n| CK An Bình (ABS) | Tài chính | 80% | 7.0h | 10 |\n| BĐS An Khánh | BĐS | 79% | 7.0h | 11 |\n| Bảo hiểm AAA | Tài chính | 78% | 6.8h | 12 |\n| BĐS Lê Trọng Tấn | BĐS | 76% | 6.5h | 13 |\n| BĐS Dương Nội | BĐS | 74% | 6.2h | 14 |\n\n🏆 **Khoáng sản GX** dẫn đầu nhờ ATLĐ bắt buộc theo Luật Khoáng sản.\n⚠️ **Khối BĐS** (3 KĐT) đều dưới 80% — cần chiến dịch đẩy mạnh.\n📊 **Tổng nhân sự toàn TĐ:** ~6,610 người trên 14 đơn vị.",
      mood: "explaining",
      actions: [
        { label: "Xuất báo cáo", icon: "export", action: "export_comparison" },
        { label: "Gửi cho BGĐ", icon: "share", action: "share_report" },
      ],
      followUps: [
        { label: "Chi tiết khối BĐS", prompt: "Phân tích nguyên nhân khối BĐS có hiệu quả đào tạo thấp" },
        { label: "Bài học từ Khoáng sản", prompt: "Phân tích mô hình đào tạo thành công của Khoáng sản GX" },
        { label: "So sánh theo lĩnh vực", prompt: "So sánh hiệu quả đào tạo theo lĩnh vực kinh doanh chính" },
      ],
      category: "So sánh",
    };
  }

  if (lower.includes("ôn tập") || lower.includes("luyện") || lower.includes("quiz")) {
    return {
      content: "📖 **Ôn tập nhanh: Tuân thủ Pháp luật Doanh nghiệp**\n\nTôi sẽ hỏi bạn từng câu một nhé! Sẵn sàng chưa? 🦉\n\n---\n\n**Câu 1:** Luật Doanh nghiệp 2020 có hiệu lực từ ngày nào?\n\nA. 01/01/2020\nB. 01/01/2021\nC. 01/07/2020\nD. 01/07/2021\n\n💡 *Gợi ý: Luật được thông qua tháng 6/2020 nhưng không có hiệu lực ngay.*",
      mood: "happy",
      followUps: [
        { label: "A", prompt: "A" },
        { label: "B", prompt: "B" },
        { label: "C", prompt: "C" },
        { label: "D", prompt: "D" },
      ],
      category: "Ôn tập",
    };
  }

  if (lower.includes("deadline") || lower.includes("hạn")) {
    return {
      content: "📅 **Deadline 2 tuần tới — Lê Hoàng Nam (ABBank):**\n\n🔴 **Gấp (6 ngày)**\n• Phân tích Tài chính DN — Bài tập dòng tiền (15/03)\n\n🟡 **Sắp tới (11 ngày)**\n• Tuân thủ Pháp luật DN — Thi cuối khóa online (20/03)\n\n🟢 **Còn thời gian (3 tuần)**\n• Teamwork & Giao tiếp — Bài thuyết trình nhóm (30/03)\n• Quản trị Rủi ro Tín dụng — Module 3 (05/04)\n\n⏰ **Gợi ý lịch học (ABBank giờ hành chính):**\n• T2-T4: Tập trung Phân tích TC, 1.5h/ngày (trưa 12h-13h30)\n• T5-T6: Ôn thi Tuân thủ PL, 1h/ngày\n• Tuần sau: Chuẩn bị thuyết trình nhóm (liên hệ 3 thành viên ABBank)",
      mood: "alert",
      actions: [
        { label: "Thêm vào lịch", icon: "calendar", action: "add_calendar" },
        { label: "Đặt nhắc nhở", icon: "bell", action: "set_reminder" },
      ],
      followUps: [
        { label: "Bắt đầu Phân tích TC", prompt: "Giúp tôi ôn tập phần phân tích dòng tiền" },
        { label: "Ôn thi Tuân thủ PL", prompt: "Giúp tôi ôn tập cho bài kiểm tra Tuân thủ Pháp luật" },
      ],
      category: "Deadline",
    };
  }

  if (lower.includes("nhân sự") || lower.includes("nhắc nhở") || lower.includes("chưa hoàn thành")) {
    return {
      content: "⚠️ **Nhân sự chưa hoàn thành khóa bắt buộc:**\n\n**ATLĐ Khai khoáng (hạn: 31/03) — 18 NV**\n• Khoáng sản GX: 10 NV (tiến độ TB: 55%)\n• Xi măng Thăng Long: 8 NV (tiến độ TB: 62%)\n\n**ATLĐ Xây dựng (hạn: 31/03) — 22 NV**\n• BĐS Lê Trọng Tấn: 9 NV (tiến độ TB: 40%)\n• BĐS Dương Nội: 8 NV (tiến độ TB: 35%)\n• BĐS An Khánh: 5 NV (tiến độ TB: 48%)\n\n**Tuân thủ PL (hạn: 15/04) — 31 NV**\n• ABBank: 12 NV | CK An Bình: 6 NV\n• Bảo hiểm AAA: 8 NV | TM & XNK: 5 NV\n\n**Vận hành NMĐ (hạn: 20/03) — 12 NV**\n• Nhiệt điện Thăng Long: 12 NV (**KHẨN CẤP** — vi phạm quy chuẩn)\n\n📧 **Đề xuất:** Ưu tiên Nhiệt điện Thăng Long (rủi ro pháp lý cao).",
      mood: "alert",
      actions: [
        { label: "Gửi nhắc nhở", icon: "send", action: "send_reminder" },
        { label: "Xuất danh sách", icon: "export", action: "export_list" },
        { label: "Báo cáo quản lý", icon: "report", action: "report_manager" },
      ],
      followUps: [
        { label: "Chi tiết khối SX CN", prompt: "Danh sách 12 nhân viên SX CN chưa hoàn thành An toàn LĐ" },
        { label: "Soạn email nhắc nhở", prompt: "Soạn email mẫu nhắc nhở hoàn thành khóa học bắt buộc" },
      ],
      category: "Nhân sự",
    };
  }

  if (lower.includes("soạn") || lower.includes("email") || lower.includes("thông báo")) {
    return {
      content: "✉️ **Email nhắc nhở mẫu:**\n\n---\n\n**Tiêu đề:** [GELEXIMCO LMS] Nhắc nhở hoàn thành khóa học bắt buộc\n\nKính gửi anh/chị [Tên],\n\nHệ thống LMS ghi nhận anh/chị chưa hoàn thành khóa học **[Tên khóa]** (tiến độ hiện tại: **[X]%**).\n\n⏰ **Hạn hoàn thành:** [Ngày]\n\n📌 Vui lòng truy cập hệ thống và hoàn thành trước thời hạn.\n\nTrân trọng,\nBan Đào tạo — Tập đoàn Geleximco\n\n---\n\n💡 Tôi đã thêm biến **[Tên]**, **[Tên khóa]**, **[X]%**, **[Ngày]** để hệ thống tự thay khi gửi hàng loạt.",
      mood: "happy",
      actions: [
        { label: "Sao chép email", icon: "copy", action: "copy_email" },
        { label: "Gửi hàng loạt", icon: "send", action: "send_bulk" },
        { label: "Chỉnh sửa", icon: "edit", action: "edit_email" },
      ],
      followUps: [
        { label: "Bản tiếng Anh", prompt: "Dịch email nhắc nhở sang tiếng Anh" },
        { label: "Thêm giọng gấp gáp", prompt: "Viết lại email với giọng văn khẩn cấp hơn cho nhóm sắp hết hạn" },
      ],
      category: "Soạn thảo",
    };
  }

  if (lower.includes("thống kê") || lower.includes("truy cập") || lower.includes("lượt")) {
    return {
      content: "📊 **Thống kê truy cập tuần này (03-09/03/2026):**\n\n| Ngày | Lượt truy cập | TG TB | Top đơn vị |\n|------|--------------|-------|------------|\n| T2 (03/03) | 4,580 | 42p | ABBank (1,240) |\n| T3 (04/03) | 4,850 | 45p | ABBank (1,380) |\n| T4 (05/03) | 4,320 | 38p | Xi măng TL (680) |\n| T5 (06/03) | 3,980 | 35p | Khoáng sản (520) |\n| T6 (07/03) | 3,650 | 30p | VP Tập đoàn (450) |\n| T7 (08/03) | 1,520 | 22p | ABBank (580) |\n| CN (09/03) | 1,250 | 18p | NĐ Thăng Long (280) |\n\n📈 **Xu hướng:** Đầu tuần tăng 12% so với tuần trước (deadline ATLĐ).\n🏦 **ABBank** chiếm 28% tổng lượt truy cập (quy mô NV lớn nhất).\n🕐 **Giờ cao điểm:** 9h-11h & 14h-16h (khối VP); ca 6h-8h (khối SX).",
      mood: "explaining",
      followUps: [
        { label: "So sánh tháng trước", prompt: "So sánh lượt truy cập tháng 3 với tháng 2" },
        { label: "Phòng ban tích cực nhất", prompt: "Phòng ban nào có lượt truy cập LMS nhiều nhất?" },
      ],
      category: "Thống kê",
    };
  }

  if (lower.includes("học viên") && (lower.includes("thấp") || lower.includes("tụt"))) {
    return {
      content: "⚠️ **Học viên tiến độ thấp — Khóa Marketing số:**\n\n| Học viên | Tiến độ | Lần cuối online | Ghi chú |\n|----------|---------|----------------|--------|\n| Nguyễn Thị Hà | 25% | 12 ngày trước | ❌ Không vào |\n| Trần Đức Anh | 35% | 8 ngày trước | ⚠️ Bỏ 3 bài |\n| Lê Minh Châu | 40% | 5 ngày trước | ⚠️ Điểm thấp |\n| Phạm Hồng Sơn | 42% | 7 ngày trước | ⚠️ Bỏ 2 bài |\n\n📌 **Nguyễn Thị Hà** cần liên hệ gấp — 12 ngày không truy cập.\n💡 **Gợi ý:** Gửi tin nhắn cá nhân kèm đường link trực tiếp đến bài tiếp theo.",
      mood: "alert",
      actions: [
        { label: "Gửi nhắc nhở", icon: "send", action: "send_reminder" },
        { label: "Liên hệ trực tiếp", icon: "contact", action: "contact_student" },
      ],
      followUps: [
        { label: "Soạn tin nhắn", prompt: "Soạn tin nhắn nhắc nhở học viên Nguyễn Thị Hà quay lại học" },
        { label: "Nguyên nhân bỏ học", prompt: "Phân tích nguyên nhân học viên bỏ dở khóa Marketing số" },
      ],
      category: "Học viên",
    };
  }

  // Default fallback
  return {
    content: "Cảm ơn bạn đã hỏi! 🦉\n\nTôi đã ghi nhận câu hỏi của bạn. Trong hệ thống thực tế, tôi sẽ truy vấn cơ sở dữ liệu LMS để đưa ra câu trả lời chính xác và cá nhân hóa.\n\n💡 **Mẹo:** Bạn có thể thử các chủ đề như:\n• Tiến độ học tập / báo cáo\n• Gợi ý khóa học\n• Ôn tập & luyện thi\n• Giải thích thuật ngữ\n• Deadline & lịch học\n\nHoặc chọn từ các gợi ý bên dưới!",
    mood: "default",
    followUps: getQuickActions("learner").slice(0, 3).map(a => ({ label: a.label, prompt: a.prompt })),
    category: "Chung",
  };
}

/* ================================================================ */
/*  MARKDOWN RENDERER — enhanced with tables                        */
/* ================================================================ */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const processInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-[#990803]" style="font-size:11.5px">$1</code>');
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1).filter(r => !r.every(c => /^[-:]+$/.test(c.trim())));
      elements.push(
        <div key={`tbl-${elements.length}`} className="my-2 overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full" style={{ fontSize: "12px" }}>
            <thead>
              <tr className="bg-gray-50">
                {header.map((h, i) => (
                  <th key={i} className="px-2.5 py-1.5 text-left text-gray-600 whitespace-nowrap" style={{ fontWeight: 600 }}>{h.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-t border-gray-50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2.5 py-1.5 text-gray-700 whitespace-nowrap" dangerouslySetInnerHTML={{ __html: processInline(cell.trim()) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  lines.forEach((line, i) => {
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      const cells = line.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableRows.push(cells);
      return;
    }

    if (inTable) {
      flushTable();
      inTable = false;
    }

    if (line.trim() === "---") {
      elements.push(<hr key={`hr-${i}`} className="my-2 border-gray-100" />);
      return;
    }
    if (line.trim() === "") {
      elements.push(<div key={`br-${i}`} className="h-1.5" />);
      return;
    }

    const processed = processInline(line);
    if (line.startsWith("•") || line.startsWith("-")) {
      elements.push(<p key={i} className="ml-2 text-gray-700" style={{ fontSize: "13px", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: processed }} />);
    } else {
      elements.push(<p key={i} className="text-gray-700" style={{ fontSize: "13px", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: processed }} />);
    }
  });

  if (inTable) flushTable();
  return elements;
}

/* ================================================================ */
/*  MAIN CHATBOT PANEL                                              */
/* ================================================================ */
export function ChatbotPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !hasOpened && user) {
      setHasOpened(true);
      setMessages([getWelcomeMessage(user.legacyRole, user.name.split(" ").pop() || user.name)]);
      setUnreadCount(0);
    }
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, hasOpened, user]);

  useEffect(() => {
    if (searchMode) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchMode]);

  const conversationContext = messages.filter(m => m.role === "assistant").map(m => m.content);

  const sendMessage = (text: string) => {
    if (!text.trim() || !user || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
      feedback: null,
      bookmarked: false,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowAttachMenu(false);

    const delay = 1000 + Math.random() * 1500;
    setTimeout(() => {
      const result = getMockReply(text, user.legacyRole, conversationContext);
      const reply: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: result.content,
        timestamp: new Date(),
        mood: result.mood,
        actions: result.actions,
        followUps: result.followUps,
        feedback: null,
        bookmarked: false,
        category: result.category,
      };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  const handleReset = () => {
    setMessages([]);
    setHasOpened(false);
    setSearchMode(false);
    setSearchQuery("");
    setTimeout(() => {
      if (user) {
        setMessages([getWelcomeMessage(user.legacyRole, user.name.split(" ").pop() || user.name)]);
        setHasOpened(true);
      }
    }, 100);
  };

  const handleFeedback = (msgId: string, type: "up" | "down") => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m));
  };

  const handleBookmark = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, bookmarked: !m.bookmarked } : m));
  };

  const handleCopy = (msgId: string, content: string) => {
    copyToClipboard(content.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, ""));
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInput("Tóm tắt tiến độ học tập hiện tại của tôi");
      }, 2000);
    }
  };

  const quickActions = user ? getQuickActions(user.legacyRole) : [];

  const filteredMessages = searchQuery
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const bookmarkedCount = messages.filter(m => m.bookmarked).length;

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes owlBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes owlWingWave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-5deg); } }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
        @keyframes fabPulse { 0%, 100% { box-shadow: 0 4px 20px rgba(153,8,3,0.3); } 50% { box-shadow: 0 4px 30px rgba(153,8,3,0.5), 0 0 40px rgba(200,168,78,0.15); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fabIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes recording { 0%, 100% { box-shadow: 0 0 0 0 rgba(153,8,3,0.4); } 50% { box-shadow: 0 0 0 8px rgba(153,8,3,0); } }
        @keyframes miniPanelIn { from { transform: translateY(20px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>

      {/* ============ FLOATING ACTION BUTTON ============ */}
      {!isOpen && !isMinimized && (
        <button
          onClick={() => { setIsOpen(true); setUnreadCount(0); }}
          className="fixed bottom-6 right-6 z-[60] w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{ background: "linear-gradient(145deg, #990803, #7a0602)", animation: "fabPulse 3s ease-in-out infinite, fabIn 0.3s ease-out" }}
          title="Hỏi GelBot"
        >
          <OwlMascotMini size={42} animated mood="default" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#c8a84e] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-white" style={{ fontSize: "10px", fontWeight: 700 }}>{unreadCount}</span>
            </div>
          )}
        </button>
      )}

      {/* ============ MINIMIZED FLOATING WIDGET ============ */}
      {isMinimized && (
        <div
          className="fixed bottom-6 right-6 z-[60] bg-white rounded-2xl shadow-xl border border-gray-200 cursor-pointer overflow-hidden"
          style={{ width: 280, animation: "miniPanelIn 0.3s ease-out" }}
          onClick={() => { setIsMinimized(false); setIsOpen(true); }}
        >
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "linear-gradient(135deg, #990803, #7a0602)" }}>
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(200,168,78,0.3)" }}>
              <OwlMascotMini size={26} animated={false} mood="default" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white truncate" style={{ fontSize: "13px", fontWeight: 600 }}>GelBot</p>
              <p className="text-white/50" style={{ fontSize: "10px" }}>Nhấn để mở lại...</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
          {messages.length > 1 && (
            <div className="px-4 py-2.5 bg-gray-50">
              <p className="text-gray-500 truncate" style={{ fontSize: "11px" }}>
                {messages[messages.length - 1].content.replace(/\*\*/g, "").substring(0, 60)}...
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============ FULL CHAT PANEL ============ */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[60] lg:bg-transparent" onClick={() => setIsOpen(false)} />
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] w-full sm:w-[440px] flex flex-col bg-white"
            style={{ animation: "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
          >
            {/* ---- HEADER ---- */}
            <div className="shrink-0" style={{ background: "linear-gradient(135deg, #990803 0%, #7a0602 50%, #5c0401 100%)" }}>
              <div className="px-5 py-3.5 flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))", border: "2px solid rgba(200,168,78,0.4)" }}>
                    <OwlMascotMini size={36} animated={false} mood={isTyping ? "thinking" : "default"} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#990803]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white" style={{ fontSize: "15px", fontWeight: 700 }}>GelBot</h3>
                    <span className="px-1.5 py-0.5 rounded-full text-[#c8a84e]" style={{ fontSize: "9px", fontWeight: 600, background: "rgba(200,168,78,0.15)", border: "1px solid rgba(200,168,78,0.3)" }}>AI</span>
                    {bookmarkedCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-white/70" style={{ fontSize: "9px", background: "rgba(255,255,255,0.12)" }}>
                        <BookmarkCheck className="w-3 h-3 inline" /> {bookmarkedCount}
                      </span>
                    )}
                  </div>
                  <p className="text-white/50" style={{ fontSize: "10.5px" }}>
                    {isTyping ? "Đang soạn tin..." : `Trợ lý AI • ${messages.length - 1} tin nhắn`}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => setSearchMode(!searchMode)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${searchMode ? "bg-white/20" : "hover:bg-white/10"}`} title="Tìm kiếm">
                    <Search className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => setSoundOn(!soundOn)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title={soundOn ? "Tắt âm" : "Bật âm"}>
                    {soundOn ? <Volume2 className="w-4 h-4 text-white/70" /> : <VolumeX className="w-4 h-4 text-white/40" />}
                  </button>
                  <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title="Hội thoại mới">
                    <RotateCcw className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => { setIsOpen(false); setIsMinimized(true); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title="Thu nhỏ">
                    <Minimize2 className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title="Đóng">
                    <X className="w-4 h-4 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Search bar */}
              {searchMode && (
                <div className="px-5 pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm trong hội thoại..."
                      className="w-full pl-9 pr-4 py-2 bg-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:bg-white/15 transition-colors"
                      style={{ fontSize: "12px", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                    {searchQuery && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" style={{ fontSize: "10px" }}>
                        {filteredMessages.length} kết quả
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ---- MESSAGES ---- */}
            <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: "linear-gradient(180deg, #f8f5f0 0%, #faf8f5 50%, #f5f2ed 100%)" }}>
              {filteredMessages.map((msg) => (
                <div key={msg.id} className={`group ${msg.role === "user" ? "flex justify-end" : "flex items-start gap-2"} mb-4`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] flex items-center justify-center shrink-0 shadow-sm overflow-hidden mt-0.5">
                      <OwlMascotMini size={22} animated={false} mood={msg.mood || "default"} />
                    </div>
                  )}
                  <div className="max-w-[85%]">
                    {/* Category badge */}
                    {msg.role === "assistant" && msg.category && msg.id !== "welcome" && (
                      <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-[#990803]/8 text-[#990803]/70" style={{ fontSize: "10px", fontWeight: 500 }}>
                        {msg.category}
                      </span>
                    )}

                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-[#990803] text-white rounded-br-md shadow-md"
                        : "bg-white border border-gray-100 rounded-bl-md shadow-sm"
                    }`}>
                      {msg.role === "user" ? (
                        <p style={{ fontSize: "13px", lineHeight: 1.6 }}>{msg.content}</p>
                      ) : (
                        <div>{renderMarkdown(msg.content)}</div>
                      )}

                      {/* Action buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-gray-100">
                          {msg.actions.map((action) => (
                            <button
                              key={action.label}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803]/8 text-[#990803] rounded-lg hover:bg-[#990803]/15 transition-colors cursor-pointer"
                              style={{ fontSize: "11.5px", fontWeight: 500 }}
                              onClick={() => {/* mock action */}}
                            >
                              {action.icon === "send" && <Send className="w-3 h-3" />}
                              {action.icon === "detail" && <ExternalLink className="w-3 h-3" />}
                              {action.icon === "export" && <FileText className="w-3 h-3" />}
                              {action.icon === "calendar" && <Clock className="w-3 h-3" />}
                              {action.icon === "grade" && <FileText className="w-3 h-3" />}
                              {action.icon === "play" && <ArrowRight className="w-3 h-3" />}
                              {action.icon === "path" && <ArrowRight className="w-3 h-3" />}
                              {action.icon === "enroll" && <BookOpen className="w-3 h-3" />}
                              {action.icon === "copy" && <Copy className="w-3 h-3" />}
                              {action.icon === "edit" && <FileText className="w-3 h-3" />}
                              {action.icon === "add" && <Sparkles className="w-3 h-3" />}
                              {action.icon === "mail" && <Send className="w-3 h-3" />}
                              {action.icon === "share" && <ExternalLink className="w-3 h-3" />}
                              {action.icon === "report" && <BarChart3 className="w-3 h-3" />}
                              {action.icon === "compare" && <TrendingUp className="w-3 h-3" />}
                              {action.icon === "notify" && <Send className="w-3 h-3" />}
                              {action.icon === "contact" && <Users className="w-3 h-3" />}
                              {action.icon === "bell" && <AlertTriangle className="w-3 h-3" />}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <p className={`mt-1.5 ${msg.role === "user" ? "text-white/40" : "text-gray-300"}`} style={{ fontSize: "10px" }}>
                        {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {/* Message toolbar — assistant only */}
                    {msg.role === "assistant" && msg.id !== "welcome" && (
                      <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleFeedback(msg.id, "up")}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${msg.feedback === "up" ? "bg-green-100 text-green-600" : "hover:bg-gray-100 text-gray-400"}`}
                          title="Hữu ích"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, "down")}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${msg.feedback === "down" ? "bg-red-100 text-red-500" : "hover:bg-gray-100 text-gray-400"}`}
                          title="Chưa tốt"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
                          title="Sao chép"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleBookmark(msg.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${msg.bookmarked ? "bg-[#c8a84e]/15 text-[#c8a84e]" : "hover:bg-gray-100 text-gray-400"}`}
                          title={msg.bookmarked ? "Bỏ ghim" : "Ghim"}
                        >
                          {msg.bookmarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                        </button>
                      </div>
                    )}

                    {/* Follow-up suggestions */}
                    {msg.role === "assistant" && msg.followUps && msg.followUps.length > 0 && msg.id === messages[messages.length - 1]?.id && !isTyping && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.followUps.map((fu) => (
                          <button
                            key={fu.label}
                            onClick={() => sendMessage(fu.prompt)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#990803]/30 hover:bg-[#990803]/5 hover:text-[#990803] transition-all cursor-pointer shadow-sm"
                            style={{ fontSize: "11px", fontWeight: 500 }}
                          >
                            <ArrowRight className="w-3 h-3" /> {fu.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && <TypingIndicator />}

              {/* Initial quick actions */}
              {messages.length <= 1 && !isTyping && (
                <div className="mt-2 mb-4">
                  <p className="text-gray-400 mb-2.5 flex items-center gap-1.5" style={{ fontSize: "11px", fontWeight: 500 }}>
                    <Zap className="w-3 h-3" /> Câu hỏi gợi ý
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => sendMessage(action.prompt)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-[#990803]/30 hover:bg-[#990803]/5 hover:text-[#990803] transition-all cursor-pointer shadow-sm text-left"
                        style={{ fontSize: "11.5px", fontWeight: 500 }}
                      >
                        <span className="shrink-0 text-[#990803]/60">{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ---- INPUT AREA ---- */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
              {/* Attachment menu */}
              {showAttachMenu && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-xl">
                  <button onClick={() => { import("sonner").then(m => m.toast.info("Chọn hình ảnh để gửi cho GelBot phân tích...")); setShowAttachMenu(false); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                    <Image className="w-3.5 h-3.5 text-blue-500" /> Hình ảnh
                  </button>
                  <button onClick={() => { import("sonner").then(m => m.toast.info("Chọn tài liệu để GelBot trích xuất nội dung...")); setShowAttachMenu(false); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                    <FileText className="w-3.5 h-3.5 text-green-500" /> Tài liệu
                  </button>
                  <button onClick={() => setShowAttachMenu(false)} className="p-1 ml-auto cursor-pointer text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${showAttachMenu ? "bg-[#990803]/10 text-[#990803]" : "hover:bg-gray-100 text-gray-400"}`}
                  title="Đính kèm"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isRecording ? "Đang nghe..." : "Nhập câu hỏi cho GelBot..."}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803]/30 transition-all"
                    style={{ fontSize: "13px" }}
                    disabled={isTyping || isRecording}
                  />
                </div>

                {/* Voice button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    isRecording ? "bg-[#990803] text-white" : "hover:bg-gray-100 text-gray-400"
                  }`}
                  style={isRecording ? { animation: "recording 1.5s ease-in-out infinite" } : undefined}
                  title={isRecording ? "Dừng ghi âm" : "Nói"}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  style={{ background: input.trim() && !isTyping ? "linear-gradient(145deg, #990803, #7a0602)" : "#e5e7eb" }}
                >
                  <Send className={`w-4 h-4 ${input.trim() && !isTyping ? "text-white" : "text-gray-400"}`} />
                </button>
              </form>

              <p className="text-center text-gray-300 mt-2 flex items-center justify-center gap-1" style={{ fontSize: "10px" }}>
                <Sparkles className="w-3 h-3" /> GelBot AI — Powered by Geleximco LMS
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
