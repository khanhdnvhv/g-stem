import { useState } from "react";
import { Pin, Plus, Search, Send, Paperclip, CheckCircle2, X, Heart, MessageCircle } from "lucide-react";
import { useGradeLevel } from "../../GradeLevelContext";

/* ─── Types ──────────────────────────────────────────────────────── */
type PostType = "question" | "discussion" | "announcement";
type Role = "teacher" | "student";

interface Reply {
  id: number; author: string; role: Role; initials: string;
  content: string; time: string; image?: string;
}
interface Thread {
  id: number; type: PostType; title: string; body?: string;
  author: string; role: Role; initials: string;
  time: string; isPinned: boolean; isResolved: boolean;
  likes: number; image?: string;
  replies: Reply[];
}
interface CourseSection {
  id: number; name: string; color: string; emoji: string;
  threads: Thread[];
}

/* ─── Type meta ──────────────────────────────────────────────────── */
const TM: Record<PostType, { label: string; color: string; bg: string; icon: string }> = {
  question:     { label: "Câu hỏi",   color: "#d97706", bg: "#fffbeb", icon: "❓" },
  discussion:   { label: "Thảo luận", color: "#2563eb", bg: "#eff6ff", icon: "💬" },
  announcement: { label: "Thông báo", color: "#990803", bg: "#fef2f2", icon: "📢" },
};

/* ─── THCS data ──────────────────────────────────────────────────── */
const THCS_COURSES: CourseSection[] = [
  {
    id: 101, name: "Toán 8 – Đại số", color: "#990803", emoji: "🔢",
    threads: [
      {
        id: 1, type: "announcement", title: "Lịch kiểm tra HK2 – Toán 8",
        body: "Các em xem đề cương đính kèm nhé. Kiểm tra 1 tiết vào thứ Tư tuần sau, thi từ chương 3 đến chương 5. 7 hằng đẳng thức là phải thuộc lòng! 😊",
        author: "Cô Ngọc Hà", role: "teacher", initials: "NH",
        time: "08:00 · 18/05", isPinned: true, isResolved: false, likes: 5,
        replies: [
          { id: 1, author: "Minh An",    role: "student", initials: "MA", content: "Cô ơi thi từ chương mấy ạ?", time: "08:15" },
          { id: 2, author: "Cô Ngọc Hà", role: "teacher", initials: "NH", content: "Các em xem đề cương cô gửi nhé, thi từ chương 3 đến chương 5.", time: "08:30" },
          { id: 3, author: "Lan Phương", role: "student", initials: "LP", content: "Cô ơi có thi phần hằng đẳng thức không ạ?", time: "08:45" },
          { id: 4, author: "Cô Ngọc Hà", role: "teacher", initials: "NH", content: "Có em, 7 hằng đẳng thức là phải thuộc lòng nhé! 😊", time: "09:00" },
        ],
      },
      {
        id: 2, type: "question", title: "Bài 14: Δ âm thì phương trình có nghiệm không ạ?",
        author: "Trần Bảo", role: "student", initials: "TB",
        time: "Hôm qua", isPinned: false, isResolved: true, likes: 3,
        replies: [
          { id: 1, author: "Cô Ngọc Hà", role: "teacher", initials: "NH", content: "Khi Δ < 0, phương trình bậc hai vô nghiệm thực em nhé. Đồ thị parabol không cắt trục Ox.", time: "09:10" },
          { id: 2, author: "Minh An",    role: "student", initials: "MA", content: "Cảm ơn cô! Vậy nghĩa là không tìm được x nào thỏa mãn ạ?", time: "09:12" },
          { id: 3, author: "Cô Ngọc Hà", role: "teacher", initials: "NH", content: "Đúng rồi An, không có x thực nào thỏa mãn phương trình đó.", time: "09:15" },
        ],
      },
      {
        id: 3, type: "discussion", title: "Chia sẻ cách học thuộc 7 hằng đẳng thức",
        body: "Mình nhớ bằng cách ghép tên: Bình tổng → Bình hiệu → Tổng bình... Học theo thứ tự dễ nhớ hơn! Các bạn có cách nào hay hơn không?",
        author: "Lan Phương", role: "student", initials: "LP",
        time: "2 ngày trước", isPinned: false, isResolved: false, likes: 8,
        replies: [
          { id: 1, author: "Hoàng Nam", role: "student", initials: "HN", content: "Mình nhớ bằng cách ghép tên: Bình tổng → Bình hiệu → Tổng bình...", time: "14:00" },
          { id: 2, author: "Lan Phương", role: "student", initials: "LP", content: "Hay quá, cảm ơn bạn! Mình sẽ thử cách này.", time: "14:20" },
          { id: 3, author: "Cô Ngọc Hà", role: "teacher", initials: "NH", content: "Các em có thể dùng thêm sơ đồ tư duy để hệ thống lại nhé, rất hiệu quả!", time: "15:00" },
        ],
      },
    ],
  },
  {
    id: 102, name: "Vật lý 8", color: "#2563eb", emoji: "⚡",
    threads: [
      {
        id: 4, type: "announcement", title: "Thực hành đo điện trở – chuẩn bị dụng cụ",
        body: "Buổi thực hành thứ 5 tuần sau: mỗi nhóm chuẩn bị 1 đồng hồ vạn năng, dây dẫn và điện trở mẫu nhé. Trường có cung cấp cho mỗi nhóm, các em không cần mua riêng đâu!",
        author: "Thầy Quang", role: "teacher", initials: "QG",
        time: "15/05", isPinned: true, isResolved: false, likes: 4,
        replies: [
          { id: 1, author: "Quốc Bảo",  role: "student", initials: "QB", content: "Thầy ơi, đồng hồ vạn năng mua ở đâu ạ?", time: "07:30" },
          { id: 2, author: "Thầy Quang", role: "teacher", initials: "QG", content: "Trường có cung cấp cho mỗi nhóm, các em không cần mua riêng đâu nhé!", time: "08:00" },
        ],
      },
      {
        id: 5, type: "question", title: "Điện trở mắc song song tính thế nào ạ?",
        author: "Quốc Bảo", role: "student", initials: "QB",
        time: "2 giờ trước", isPinned: false, isResolved: true, likes: 6,
        replies: [
          { id: 1, author: "Thầy Quang", role: "teacher", initials: "QG", content: "Với mạch song song: 1/R_tổng = 1/R₁ + 1/R₂ + ...\nVí dụ R₁=6Ω, R₂=3Ω thì 1/R = 1/6 + 1/3 = 1/2 → R = 2Ω", time: "02:30" },
          { id: 2, author: "Quốc Bảo",  role: "student", initials: "QB", content: "Em hiểu rồi ạ, cảm ơn thầy! Nghịch đảo rồi cộng rồi nghịch đảo lại.", time: "02:40" },
        ],
      },
    ],
  },
  {
    id: 103, name: "Hóa học 8", color: "#16a34a", emoji: "🧪",
    threads: [
      {
        id: 6, type: "question", title: "Cân bằng phương trình: Fe + HCl → ?",
        author: "Thu Thảo", role: "student", initials: "TT",
        time: "3 giờ trước", isPinned: false, isResolved: true, likes: 2,
        replies: [
          { id: 1, author: "Thầy Trung Nam", role: "teacher", initials: "TN", content: "Fe + 2HCl → FeCl₂ + H₂↑\nEm nhớ Fe hóa trị II khi phản ứng với axit loãng nhé!", time: "03:30" },
          { id: 2, author: "Thu Thảo",      role: "student", initials: "TT", content: "Em hiểu rồi ạ, cảm ơn thầy! 🙏", time: "03:45" },
        ],
      },
      {
        id: 7, type: "discussion", title: "Video thí nghiệm Fe + HCl mình tự làm tại nhà",
        body: "Mình làm thí nghiệm Fe + HCl tại nhà, mọi người xem thử nhé! Nhớ đeo kính bảo hộ nha 🥽",
        image: "thi-nghiem-fe-hcl.jpg",
        author: "Bảo Long", role: "student", initials: "BL",
        time: "Hôm qua", isPinned: false, isResolved: false, likes: 12,
        replies: [
          { id: 1, author: "Thầy Trung Nam", role: "teacher", initials: "TN", content: "Bạn Bảo Long làm rất cẩn thận! Nhớ đeo kính bảo hộ khi làm thí nghiệm nhé. 👍", time: "16:30" },
          { id: 2, author: "Thu Thảo",      role: "student", initials: "TT", content: "Bạn giỏi quá, dám làm tại nhà luôn! Mình chỉ dám xem thôi 😄", time: "17:00" },
        ],
      },
    ],
  },
  {
    id: 107, name: "Tin học 8 – Python", color: "#6366f1", emoji: "💻",
    threads: [
      {
        id: 8, type: "question", title: "Vòng lặp while True thoát ra bằng cách nào?",
        author: "Minh Hải", role: "student", initials: "MH",
        time: "1 giờ trước", isPinned: false, isResolved: true, likes: 4,
        replies: [
          { id: 1, author: "Thầy Minh Đức", role: "teacher", initials: "MD", content: "Dùng lệnh `break` khi điều kiện thoát thỏa mãn:\n\nwhile True:\n    n = int(input('Nhập số: '))\n    if n == 0:\n        break\nprint('Thoát!')", time: "01:15" },
          { id: 2, author: "Minh Hải",      role: "student", initials: "MH", content: "Aha! Em quên mất lệnh break. Cảm ơn thầy ạ!", time: "01:20" },
        ],
      },
      {
        id: 9, type: "discussion", title: "Chia sẻ project nhỏ viết bằng Python của mình",
        body: "Mình viết chương trình đoán số từ 1-100, AI 'nghĩ' số và mình đoán. Dùng binary search chỉ cần tối đa 7 lần! Ai muốn xem code không?",
        author: "Gia Hân", role: "student", initials: "GH",
        time: "3 ngày trước", isPinned: false, isResolved: false, likes: 9,
        replies: [
          { id: 1, author: "Thầy Minh Đức", role: "teacher", initials: "MD", content: "Xuất sắc! Binary search là thuật toán rất hay. Lần sau thử đo số lần đoán trung bình xem nhé 😄", time: "20:45" },
        ],
      },
    ],
  },
];

/* ─── TH data ────────────────────────────────────────────────────── */
const TH_COURSES: CourseSection[] = [
  {
    id: 1, name: "Toán lớp 3", color: "#990803", emoji: "🔢",
    threads: [
      {
        id: 1, type: "announcement", title: "Bài tập tuần này – Bảng cửu chương 6, 7, 8",
        body: "Các em học thuộc bảng cửu chương 6, 7, 8 trước thứ Tư nhé! Cô sẽ kiểm tra miệng đầu giờ 🌟",
        author: "Cô Lan Anh", role: "teacher", initials: "LA",
        time: "08:00 · 18/05", isPinned: true, isResolved: false, likes: 6,
        replies: [
          { id: 1, author: "Bé Hoa", role: "student", initials: "BH", content: "Con học rồi cô ơi! 😊", time: "08:30" },
        ],
      },
      {
        id: 2, type: "question", title: "47 × 8 em tính mãi không được ạ 😢",
        author: "Bé Nam", role: "student", initials: "BN",
        time: "Hôm qua", isPinned: false, isResolved: true, likes: 4,
        replies: [
          { id: 1, author: "Cô Lan Anh", role: "teacher", initials: "LA", content: "Em tách ra nhé: 47×8 = 40×8 + 7×8 = 320 + 56 = 376 ✨", time: "10:00" },
          { id: 2, author: "Bé Nam", role: "student", initials: "BN", content: "Ôi hay quá cô ơi! Em hiểu rồi ạ 🎉", time: "10:10" },
        ],
      },
    ],
  },
  {
    id: 2, name: "Tiếng Việt lớp 3", color: "#d4183d", emoji: "📖",
    threads: [
      {
        id: 3, type: "discussion", title: "Kể chuyện về con vật em yêu thích nào!",
        body: "Cô muốn nghe các em kể về con vật yêu thích nhé! Tuần sau sẽ viết thành đoạn văn 📝",
        author: "Cô Thu Hoa", role: "teacher", initials: "TH",
        time: "09:00 · 17/05", isPinned: false, isResolved: false, likes: 10,
        replies: [
          { id: 1, author: "Bé An",      role: "student", initials: "BA", content: "Em thích con mèo vì nó rất dễ thương và hay nằm trong lòng em ạ! 🐱", time: "09:30" },
          { id: 2, author: "Bé Hoa",     role: "student", initials: "BH", content: "Em thích con chó! Con chó nhà em tên Mochi hay vẫy đuôi mỗi khi em về 🐶", time: "09:45" },
          { id: 3, author: "Cô Thu Hoa", role: "teacher", initials: "TH", content: "Các em kể hay quá! Tuần sau viết thành đoạn văn nhé 😊", time: "10:00" },
        ],
      },
    ],
  },
  {
    id: 7, name: "Lập Trình Scratch", color: "#7c3aed", emoji: "💻",
    threads: [
      {
        id: 4, type: "question", title: "Nhân vật của em không chịu chạy cô ơi!",
        author: "Bé Minh", role: "student", initials: "BM",
        time: "3 giờ trước", isPinned: false, isResolved: true, likes: 2,
        replies: [
          { id: 1, author: "Thầy Minh Đức", role: "teacher", initials: "MD", content: "Em kiểm tra xem đã kéo khối 'when green flag clicked' chưa nhé! Đó là nút bắt đầu đó em 🚩", time: "09:00" },
          { id: 2, author: "Bé Minh", role: "student", initials: "BM", content: "Em quên mất! Cảm ơn thầy, chạy được rồi ạ! 🎉", time: "09:05" },
        ],
      },
    ],
  },
];

/* ─── THPT data ──────────────────────────────────────────────────── */
const THPT_COURSES: CourseSection[] = [
  {
    id: 201, name: "Toán 12 – Giải tích", color: "#990803", emoji: "📈",
    threads: [
      {
        id: 1, type: "announcement", title: "Đề cương ôn tập THPTQG môn Toán 2026",
        body: "Các em tải đề cương đính kèm, tập trung vào: Giải tích (40%), Hình học không gian (30%), Đại số–Tổ hợp (30%). Phần tích phân sẽ có câu vận dụng cao.",
        author: "Cô Ngọc Hà", role: "teacher", initials: "NH",
        time: "07:30 · 18/05", isPinned: true, isResolved: false, likes: 15,
        replies: [
          { id: 1, author: "Minh Tuấn",  role: "student", initials: "MT", content: "Cô ơi phần tích phân có nâng cao không ạ?", time: "07:45" },
          { id: 2, author: "Cô Ngọc Hà", role: "teacher", initials: "NH", content: "Có, nhưng chỉ ở mức vận dụng cao. Tập trung tích phân từng phần và đổi biến nhé.", time: "08:00" },
        ],
      },
      {
        id: 2, type: "question", title: "Tìm cực trị y = x³ – 3x + 2, em làm mãi sai",
        author: "Bảo Châu", role: "student", initials: "BC",
        time: "2 giờ trước", isPinned: false, isResolved: true, likes: 7,
        replies: [
          { id: 1, author: "Cô Ngọc Hà", role: "teacher", initials: "NH", content: "y' = 3x² – 3 = 0 → x = ±1\nBảng biến thiên: x = –1 là cực đại y = 4, x = 1 là cực tiểu y = 0.", time: "02:20" },
          { id: 2, author: "Bảo Châu",   role: "student", initials: "BC", content: "Em bị sai ở bước tính y'! Cảm ơn cô ạ 🙏", time: "02:25" },
          { id: 3, author: "Minh Tuấn",  role: "student", initials: "MT", content: "Bạn nhớ y' = 3x² – 3 chứ không phải 3x² – 3x nhé!", time: "02:28" },
        ],
      },
      {
        id: 3, type: "discussion", title: "Chia sẻ chiến lược ôn thi THPTQG hiệu quả",
        body: "Mình lên kế hoạch: sáng làm đề, chiều xem lý thuyết điểm yếu, tối ôn lại bằng flashcard. Ai có chiến lược hay thì chia sẻ cùng nhé!",
        author: "Hải Yến", role: "student", initials: "HY",
        time: "3 ngày trước", isPinned: false, isResolved: false, likes: 20,
        replies: [
          { id: 1, author: "Minh Tuấn", role: "student", initials: "MT", content: "Mình thêm: làm đề thi các năm trước theo thời gian thực, đặt đồng hồ 90 phút!", time: "21:15" },
          { id: 2, author: "Cô Ngọc Hà", role: "teacher", initials: "NH", content: "Rất hay! Cô sẽ tổ chức buổi thi thử vào cuối tháng, các em đăng ký nhé.", time: "22:00" },
        ],
      },
    ],
  },
  {
    id: 202, name: "Vật lý 12", color: "#2563eb", emoji: "⚡",
    threads: [
      {
        id: 4, type: "question", title: "Mạch LC: năng lượng điện cực đại khi nào?",
        author: "Quốc Anh", role: "student", initials: "QA",
        time: "5 giờ trước", isPinned: false, isResolved: true, likes: 5,
        replies: [
          { id: 1, author: "Thầy Quang", role: "teacher", initials: "QG", content: "Năng lượng điện cực đại khi q = Q₀ (điện tích tụ cực đại), tức khi i = 0. Ngược lại, năng lượng từ cực đại khi i = I₀, q = 0.", time: "05:30" },
          { id: 2, author: "Quốc Anh",  role: "student", initials: "QA", content: "Aha! Giống con lắc lò xo — động năng max khi vận tốc max. Cảm ơn thầy!", time: "05:40" },
        ],
      },
    ],
  },
  {
    id: 207, name: "Tin học 12 – Python", color: "#6366f1", emoji: "💻",
    threads: [
      {
        id: 5, type: "discussion", title: "Chia sẻ project phân tích dữ liệu của mình",
        body: "Mình dùng pandas + matplotlib phân tích dữ liệu nhiệt độ Hà Nội 10 năm. Kết quả: xu hướng tăng ~0.3°C/năm! Ai muốn xem code và biểu đồ?",
        image: "nhiet-do-plot.png",
        author: "Minh Khoa", role: "student", initials: "MK",
        time: "Hôm qua", isPinned: false, isResolved: false, likes: 14,
        replies: [
          { id: 1, author: "Thầy Minh Đức", role: "teacher", initials: "MD", content: "Rất tốt Khoa! Lần sau thử dùng seaborn cho biểu đồ đẹp hơn, và tính hệ số tương quan Pearson nhé.", time: "20:30" },
          { id: 2, author: "Hải Yến",       role: "student", initials: "HY", content: "Bạn cho mình xin code với, mình muốn làm tương tự cho dữ liệu mưa!", time: "21:00" },
        ],
      },
    ],
  },
];

/* ─── Mầm non (parent-teacher) ───────────────────────────────────── */
const MN_COURSES: CourseSection[] = [
  {
    id: 901, name: "Lớp Búp Bê 1", color: "#f59e0b", emoji: "🌸",
    threads: [
      {
        id: 1, type: "announcement", title: "Thông báo: Hoạt động tham quan thứ 6 tuần này",
        body: "Phụ huynh cho bé mang áo khoác và giày thể thao nhé. Xe đón lúc 7:30 sáng, về trước 11:00. Trường đã chuẩn bị bữa trưa cho các bé rồi ạ!",
        author: "Cô Minh Châu", role: "teacher", initials: "MC",
        time: "07:00 · 18/05", isPinned: true, isResolved: false, likes: 8,
        replies: [
          { id: 1, author: "Phụ huynh Minh", role: "student", initials: "PM", content: "Cô ơi cho hỏi bé có cần mang cơm trưa không ạ?", time: "07:30" },
          { id: 2, author: "Cô Minh Châu",   role: "teacher", initials: "MC", content: "Không cần phụ huynh ơi, trường đã chuẩn bị bữa trưa cho các bé rồi ạ!", time: "07:45" },
        ],
      },
      {
        id: 2, type: "question", title: "Bé nhà tôi hỏi về buổi học STEM, cô có thể chia sẻ thêm?",
        author: "Phụ huynh Hoa", role: "student", initials: "PH",
        time: "Hôm qua", isPinned: false, isResolved: true, likes: 3,
        replies: [
          { id: 1, author: "Cô Minh Châu", role: "teacher", initials: "MC", content: "Hôm qua các bé học về màu sắc và hỗn hợp — pha màu đỏ + vàng = cam! Bé nhà mình rất hứng thú, xung phong làm trước lớp ạ 🌈", time: "08:00" },
          { id: 2, author: "Phụ huynh Hoa", role: "student", initials: "PH", content: "Ôi tuyệt quá! Về nhà bé còn kể mãi đấy cô ơi, cảm ơn cô nhiều ạ!", time: "08:15" },
        ],
      },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
const AVATAR_COLORS = ["#2563eb","#7c3aed","#16a34a","#d97706","#0891b2","#db2777","#059669","#6366f1"];
function avatarColor(initials: string, role: Role) {
  if (role === "teacher") return "#990803";
  const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

/* ─── New post modal ─────────────────────────────────────────────── */
function NewPostModal({ courses, onClose }: { courses: CourseSection[]; onClose: () => void }) {
  const [type, setType] = useState<PostType>("question");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? 0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, width:520, maxHeight:"85vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"18px 20px", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#1c1d1f" }}>Tạo bài đăng mới</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", padding:4 }}>
            <X style={{ width:18, height:18 }} />
          </button>
        </div>

        <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:8 }}>Loại bài đăng</label>
            <div style={{ display:"flex", gap:8 }}>
              {(["question","discussion","announcement"] as PostType[]).map(t => {
                const meta = TM[t];
                const isActive = type === t;
                return (
                  <button key={t} onClick={() => setType(t)} style={{ flex:1, padding:"8px 4px", borderRadius:8, border:`1.5px solid ${isActive ? meta.color : "#e5e7eb"}`, background: isActive ? meta.bg : "#fff", color: isActive ? meta.color : "#6b7280", fontSize:12, fontWeight: isActive ? 700 : 500, cursor:"pointer" }}>
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:8 }}>Môn học</label>
            <select value={courseId} onChange={e => setCourseId(Number(e.target.value))} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:13, color:"#374151", outline:"none", background:"#fff" }}>
              {courses.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:8 }}>Tiêu đề</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tiêu đề bài đăng..." style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:13, color:"#374151", outline:"none", boxSizing:"border-box" }} />
          </div>

          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:8 }}>Nội dung</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Mô tả chi tiết câu hỏi hoặc chủ đề thảo luận..." rows={4} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:13, color:"#374151", outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6, boxSizing:"border-box" }} />
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8, border:"1.5px dashed #d1d7dc", background:"#f7f9fa", cursor:"pointer" }}>
            <Paperclip style={{ width:14, height:14, color:"#9ca3af" }} />
            <span style={{ fontSize:12, color:"#6b7280" }}>Đính kèm ảnh hoặc file (tối đa 5MB)</span>
          </div>

          <button
            disabled={!title.trim()}
            onClick={onClose}
            style={{ padding:"11px", borderRadius:10, fontSize:13, fontWeight:700, border:"none", background: title.trim() ? "linear-gradient(135deg,#7a0602,#990803)" : "#f3f4f6", color: title.trim() ? "#fff" : "#9ca3af", cursor: title.trim() ? "pointer" : "not-allowed", boxShadow: title.trim() ? "0 4px 12px rgba(153,8,3,0.25)" : "none" }}
          >
            Đăng bài
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function StudentForum() {
  const { level } = useGradeLevel();

  const courses =
    level === "thpt"    ? THPT_COURSES :
    level === "thcs"    ? THCS_COURSES :
    level === "tieuhoc" ? TH_COURSES   : MN_COURSES;

  const [search,           setSearch]           = useState("");
  const [filterCourses,    setFilterCourses]    = useState<Set<number>>(new Set());
  const [filterTypes,      setFilterTypes]      = useState<Set<PostType>>(new Set());
  const [likedPosts,       setLikedPosts]       = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [replyTexts,       setReplyTexts]       = useState<Record<string, string>>({});
  const [showNew,          setShowNew]          = useState(false);

  const allPosts = courses.flatMap(c =>
    c.threads.map(t => ({ ...t, courseColor: c.color, courseName: c.name, courseEmoji: c.emoji, courseId: c.id }))
  );

  const filtered = allPosts.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !(p.body?.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterCourses.size > 0 && !filterCourses.has(p.courseId)) return false;
    if (filterTypes.size > 0 && !filterTypes.has(p.type)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const pinnedPosts = allPosts.filter(p => p.isPinned);
  const hotPosts = [...allPosts].sort((a, b) => b.replies.length - a.replies.length).slice(0, 3);

  const pageTitle = level === "mamnon" ? "Hỏi đáp phụ huynh – GV" : "Diễn đàn lớp";

  const toggleCourse = (id: number) => {
    setFilterCourses(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleType = (t: PostType) => {
    setFilterTypes(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  };

  return (
    <div style={{ margin:"-24px", display:"flex", height:"calc(100vh - 56px - 48px)", background:"#f0f2f5", overflow:"hidden" }}>

      {/* ── Left: Filter panel ── */}
      <div style={{ width:240, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", flexShrink:0, overflow:"auto" }}>
        <div style={{ padding:"16px", borderBottom:"1px solid #f3f4f6" }}>
          <div style={{ fontSize:14, fontWeight:800, color:"#1c1d1f", marginBottom:12 }}>{pageTitle}</div>

          {/* Search */}
          <div style={{ position:"relative" }}>
            <Search style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", width:13, height:13, color:"#9ca3af" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              style={{ width:"100%", paddingLeft:28, height:34, borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:12, outline:"none", boxSizing:"border-box", color:"#374151" }}
            />
          </div>
        </div>

        <div style={{ padding:"14px 16px", flex:1, overflow:"auto" }}>
          {/* Course filter */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Môn học</div>
            {courses.map(c => (
              <label key={c.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", cursor:"pointer" }}>
                <input
                  type="checkbox" checked={filterCourses.has(c.id)} onChange={() => toggleCourse(c.id)}
                  style={{ accentColor:c.color, width:14, height:14, cursor:"pointer" }}
                />
                <span style={{ fontSize:14 }}>{c.emoji}</span>
                <span style={{ fontSize:12, color:"#374151", flex:1 }}>{c.name}</span>
                <span style={{ fontSize:10, fontWeight:700, color:c.color, background:`${c.color}18`, padding:"1px 6px", borderRadius:99 }}>{c.threads.length}</span>
              </label>
            ))}
          </div>

          {/* Type filter */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Loại bài viết</div>
            {(["question","discussion","announcement"] as PostType[]).map(t => {
              const meta = TM[t];
              return (
                <label key={t} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", cursor:"pointer" }}>
                  <input
                    type="checkbox" checked={filterTypes.has(t)} onChange={() => toggleType(t)}
                    style={{ accentColor:meta.color, width:14, height:14, cursor:"pointer" }}
                  />
                  <span style={{ fontSize:12, color: filterTypes.has(t) ? meta.color : "#374151", fontWeight: filterTypes.has(t) ? 700 : 400 }}>
                    {meta.icon} {meta.label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Clear filters */}
          {(filterCourses.size > 0 || filterTypes.size > 0 || search) && (
            <button
              onClick={() => { setFilterCourses(new Set()); setFilterTypes(new Set()); setSearch(""); }}
              style={{ width:"100%", padding:"6px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#f7f9fa", color:"#6b7280", fontSize:11, fontWeight:600, cursor:"pointer" }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* New post button */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid #f3f4f6" }}>
          <button
            onClick={() => setShowNew(true)}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px", borderRadius:8, background:"linear-gradient(135deg,#7a0602,#990803)", color:"#fff", border:"none", fontSize:12, fontWeight:700, cursor:"pointer" }}
          >
            <Plus style={{ width:13, height:13 }} /> Tạo bài đăng mới
          </button>
        </div>
      </div>

      {/* ── Center: Feed ── */}
      <div style={{ flex:1, overflow:"auto", padding:"16px 12px" }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 24px", color:"#9ca3af" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:14, fontWeight:600, color:"#374151", marginBottom:6 }}>Không tìm thấy kết quả</div>
            <div style={{ fontSize:12 }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
          </div>
        ) : sorted.map(post => {
          const postKey = `${post.courseId}-${post.id}`;
          const isLiked = likedPosts.has(postKey);
          const isExpanded = expandedComments.has(postKey);
          const replyText = replyTexts[postKey] || "";
          const meta = TM[post.type];

          return (
            <div key={postKey} style={{ background:"#fff", borderRadius:12, border:"1px solid #e4e6eb", marginBottom:12, overflow:"hidden" }}>

              {/* Pinned banner */}
              {post.isPinned && (
                <div style={{ background:`${post.courseColor}0d`, borderBottom:`1px solid ${post.courseColor}20`, padding:"6px 16px", display:"flex", alignItems:"center", gap:5 }}>
                  <Pin style={{ width:11, height:11, color:post.courseColor }} />
                  <span style={{ fontSize:11, fontWeight:700, color:post.courseColor }}>Bài được ghim</span>
                </div>
              )}

              {/* Post header */}
              <div style={{ padding:"14px 16px 0", display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:42, height:42, borderRadius:"50%", flexShrink:0, background:avatarColor(post.initials, post.role), display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>
                  {post.initials}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:14, fontWeight:700, color: post.role === "teacher" ? "#990803" : "#1c1d1f" }}>
                      {post.author}
                    </span>
                    {post.role === "teacher" && (
                      <span style={{ fontSize:9, fontWeight:800, color:"#fff", background:"#990803", padding:"1px 5px", borderRadius:3 }}>GV</span>
                    )}
                    <span style={{ fontSize:11, fontWeight:600, color:meta.color, background:meta.bg, padding:"1px 8px", borderRadius:99 }}>
                      {meta.icon} {meta.label}
                    </span>
                    {post.isResolved && (
                      <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:600, color:"#16a34a", background:"#f0fdf4", padding:"1px 8px", borderRadius:99 }}>
                        <CheckCircle2 style={{ width:10, height:10 }} /> Đã giải đáp
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:11, color:"#65676b", marginTop:2 }}>
                    <span style={{ fontWeight:600, color:post.courseColor }}>{post.courseEmoji} {post.courseName}</span>
                    <span> · {post.time}</span>
                  </div>
                </div>
              </div>

              {/* Post title */}
              <div style={{ padding:"10px 16px 0", fontSize:15, fontWeight:700, color:"#1c1d1f", lineHeight:1.45 }}>
                {post.title}
              </div>

              {/* Post body */}
              {post.body && (
                <div style={{ padding:"6px 16px 0", fontSize:13, color:"#374151", lineHeight:1.7 }}>
                  {post.body}
                </div>
              )}

              {/* Image placeholder */}
              {post.image && (
                <div style={{ margin:"12px 16px 0", background:"linear-gradient(135deg,#e8eaf6,#e3f2fd)", borderRadius:10, height:180, display:"flex", alignItems:"center", justifyContent:"center", gap:10, border:"1px solid #e0e0e0" }}>
                  <span style={{ fontSize:40 }}>🖼️</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{post.image}</div>
                    <div style={{ fontSize:11, color:"#9ca3af" }}>Nhấn để xem ảnh</div>
                  </div>
                </div>
              )}

              {/* Action bar */}
              <div style={{ padding:"10px 16px 0", display:"flex", alignItems:"center", gap:4 }}>
                {/* Like count display */}
                {(post.likes + (isLiked ? 1 : 0)) > 0 && (
                  <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#65676b", flex:1 }}>
                    <span style={{ background:"#e11d48", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>❤️</span>
                    {post.likes + (isLiked ? 1 : 0)}
                  </div>
                )}
                <div style={{ flex:1 }} />
                <button
                  onClick={() => setExpandedComments(prev => { const n = new Set(prev); isExpanded ? n.delete(postKey) : n.add(postKey); return n; })}
                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#65676b", padding:"4px 6px", borderRadius:4 }}
                >
                  {post.replies.length} bình luận
                </button>
              </div>

              {/* Divider + action buttons */}
              <div style={{ margin:"8px 16px 0", borderTop:"1px solid #e4e6eb" }} />
              <div style={{ padding:"4px 8px", display:"flex", gap:4 }}>
                <button
                  onClick={() => setLikedPosts(prev => { const n = new Set(prev); isLiked ? n.delete(postKey) : n.add(postKey); return n; })}
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"6px 10px", borderRadius:8, border:"none", background:"none", cursor:"pointer", color: isLiked ? "#e11d48" : "#65676b", fontSize:13, fontWeight:600 }}
                >
                  <Heart style={{ width:16, height:16, fill: isLiked ? "#e11d48" : "none", color: isLiked ? "#e11d48" : "#65676b" }} />
                  Thích
                </button>
                <button
                  onClick={() => setExpandedComments(prev => { const n = new Set(prev); isExpanded ? n.delete(postKey) : n.add(postKey); return n; })}
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"6px 10px", borderRadius:8, border:"none", background:"none", cursor:"pointer", color:"#65676b", fontSize:13, fontWeight:600 }}
                >
                  <MessageCircle style={{ width:16, height:16 }} />
                  Bình luận
                </button>
              </div>

              {/* Comments section */}
              {isExpanded && (
                <div style={{ padding:"0 16px 8px", borderTop:"1px solid #e4e6eb" }}>
                  {post.replies.map(reply => {
                    const isTeacher = reply.role === "teacher";
                    return (
                      <div key={reply.id} style={{ display:"flex", gap:8, marginTop:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0, background:avatarColor(reply.initials, reply.role), display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff" }}>
                          {reply.initials}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ background: isTeacher ? "#fff5f5" : "#f0f2f5", border:`1px solid ${isTeacher ? "#fecaca" : "transparent"}`, borderRadius:"4px 16px 16px 16px", padding:"8px 12px", display:"inline-block", maxWidth:"100%" }}>
                            <div style={{ fontSize:12, fontWeight:700, color: isTeacher ? "#990803" : "#1c1d1f", marginBottom:2, display:"flex", alignItems:"center", gap:4 }}>
                              {reply.author}
                              {isTeacher && <span style={{ fontSize:8, fontWeight:800, color:"#fff", background:"#990803", padding:"1px 4px", borderRadius:3 }}>GV</span>}
                            </div>
                            <div style={{ fontSize:12, color:"#374151", lineHeight:1.5, whiteSpace:"pre-wrap" }}>{reply.content}</div>
                          </div>
                          {reply.image && (
                            <div style={{ marginTop:6, background:"#e8eaf6", borderRadius:8, padding:"10px 14px", display:"inline-flex", alignItems:"center", gap:6 }}>
                              <span style={{ fontSize:18 }}>🖼️</span>
                              <span style={{ fontSize:11, color:"#374151" }}>{reply.image}</span>
                            </div>
                          )}
                          <div style={{ fontSize:10, color:"#65676b", marginTop:3, paddingLeft:4 }}>{reply.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Comment input */}
              <div style={{ padding:"10px 16px 14px", borderTop: isExpanded ? "none" : "1px solid #e4e6eb", display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0, background:"#d1d5db", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff" }}>
                  Tôi
                </div>
                <div style={{ flex:1, display:"flex", alignItems:"center", background:"#f0f2f5", borderRadius:20, padding:"7px 14px", gap:8 }}>
                  <input
                    value={replyText}
                    onChange={e => setReplyTexts(prev => ({ ...prev, [postKey]: e.target.value }))}
                    onFocus={() => { if (!isExpanded) setExpandedComments(prev => { const n = new Set(prev); n.add(postKey); return n; }); }}
                    placeholder="Viết bình luận..."
                    style={{ flex:1, border:"none", background:"transparent", fontSize:13, color:"#374151", outline:"none" }}
                  />
                  {replyText.trim() && (
                    <button
                      onClick={() => setReplyTexts(prev => ({ ...prev, [postKey]: "" }))}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#990803", padding:0, display:"flex" }}
                    >
                      <Send style={{ width:15, height:15 }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Right: Sidebar ── */}
      <div style={{ width:260, background:"#fff", borderLeft:"1px solid #e4e6eb", overflow:"auto", flexShrink:0, padding:"16px" }}>

        {/* Pinned posts */}
        {pinnedPosts.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"#374151", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
              <Pin style={{ width:13, height:13, color:"#990803" }} /> Bài ghim
            </div>
            {pinnedPosts.map(p => (
              <div key={`pin-${p.courseId}-${p.id}`} style={{ padding:"10px 12px", borderRadius:10, background:"#fef2f2", border:"1px solid #fecaca", marginBottom:8, cursor:"pointer" }}>
                <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>{p.courseEmoji} {p.courseName}</div>
                <div style={{ fontSize:12, fontWeight:700, color:"#1c1d1f", lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                  {p.title}
                </div>
                <div style={{ fontSize:10, color:"#9ca3af", marginTop:4 }}>{p.time}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:16 }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#374151", marginBottom:10 }}>
            🔥 Thảo luận sôi nổi
          </div>
          {hotPosts.map((p, i) => (
            <div key={`hot-${i}`} style={{ padding:"10px 12px", borderRadius:10, background:"#f7f9fa", border:"1px solid #e5e7eb", marginBottom:8, cursor:"pointer" }}>
              <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>
                {p.courseEmoji} {p.courseName}
                <span style={{ color:"#d97706", fontWeight:700, marginLeft:6 }}>· {p.replies.length} bình luận</span>
              </div>
              <div style={{ fontSize:12, fontWeight:600, color:"#1c1d1f", lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                {p.title}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:16, marginTop:4 }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#374151", marginBottom:10 }}>📊 Tổng quan</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { label: "Tổng bài đăng", value: allPosts.length, color:"#2563eb" },
              { label: "Đã giải đáp",   value: allPosts.filter(p => p.isResolved).length, color:"#16a34a" },
              { label: "Đang thảo luận", value: allPosts.filter(p => !p.isResolved && p.replies.length > 0).length, color:"#d97706" },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 10px", borderRadius:8, background:"#f7f9fa" }}>
                <span style={{ fontSize:12, color:"#6b7280" }}>{s.label}</span>
                <span style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showNew && <NewPostModal courses={courses} onClose={() => setShowNew(false)} />}
    </div>
  );
}
