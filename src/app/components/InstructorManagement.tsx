import { useState, useRef, useEffect } from "react";
import {
  GraduationCap, Search, Users, Star, Clock, BookOpen,
  Award, Filter, Eye, ChevronRight, BarChart3,
  Calendar, Mail, Phone,
  Plus, Pencil, CheckCircle,
  MessageCircle, Target,
  MoreVertical, Trash2, X, Download, UserCheck, UserX,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { InstructorFormModal } from "./InstructorFormModal";
import type { InstructorFormData } from "./InstructorFormModal";
import { toast } from "sonner";

// ─── Types ───
interface Instructor {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  subsidiary: string;
  department: string;
  title: string;
  specializations: string[];
  rating: number;
  totalReviews: number;
  coursesActive: number;
  coursesCompleted: number;
  totalStudents: number;
  totalHours: number;
  status: "active" | "on-leave" | "inactive" | "pending";
  availability: "available" | "busy" | "unavailable";
  certifications: string[];
  joinDate: string;
  lastActive: string;
  bio: string;
  monthlyRatings: number[];
  topSkills: { name: string; level: number }[];
  assignedCourses: { id: string; title: string; students: number; progress: number }[];
  feedbacks: { user: string; rating: number; date: string; comment: string }[];
}

// ─── Mock Data ───
const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: "INS01", name: "Đỗ Thanh Hương", initials: "TH", email: "huong.dt@geleximco.vn", phone: "0912-xxx-xxx",
    subsidiary: "Tập đoàn Geleximco", department: "Ban Nhân sự Tập đoàn", title: "CHRO Tập đoàn",
    specializations: ["Leadership", "HR Management", "Coaching", "Talent Development"],
    rating: 4.9, totalReviews: 342, coursesActive: 4, coursesCompleted: 18, totalStudents: 1245, totalHours: 520,
    status: "active", availability: "available", certifications: ["Certified Executive Coach (ICF)", "SHRM-SCP"],
    joinDate: "15/01/2020", lastActive: "12/03/2026",
    bio: "15 năm kinh nghiệm quản trị nhân sự, chuyên gia coaching lãnh đạo cấp cao tại Geleximco.",
    monthlyRatings: [4.7, 4.8, 4.8, 4.9, 4.9, 4.9, 4.85, 4.9, 4.92, 4.88, 4.9, 4.9],
    topSkills: [{ name: "Leadership", level: 98 }, { name: "Coaching", level: 95 }, { name: "HR Strategy", level: 92 }, { name: "Change Mgmt", level: 88 }, { name: "Presentation", level: 90 }],
    assignedCourses: [
      { id: "C001", title: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung", students: 145, progress: 72 },
      { id: "C009", title: "Coaching & Mentoring Excellence", students: 80, progress: 45 },
      { id: "C010", title: "Strategic HR for Business Partners", students: 62, progress: 88 },
      { id: "C011", title: "Talent Pipeline Development", students: 95, progress: 30 },
    ],
    feedbacks: [
      { user: "Trần Thị Hương", rating: 5, date: "10/03/2026", comment: "Cô Hương truyền đạt rất sâu sắc, nhiều case study thực tế từ Geleximco. Rất hữu ích!" },
      { user: "Nguyễn Văn Đức", rating: 5, date: "08/03/2026", comment: "Khóa coaching thay đổi hoàn toàn cách tôi quản lý team. Highly recommend!" },
      { user: "Lê Hoàng Nam", rating: 4, date: "01/03/2026", comment: "Nội dung tốt, mong có thêm bài tập tình huống thực hành." },
    ],
  },
  {
    id: "INS02", name: "Dr. Trần Hùng", initials: "TH", email: "hung.t@geleximco.vn", phone: "0903-xxx-xxx",
    subsidiary: "Tập đoàn Geleximco", department: "Ban CNTT & Chuyển đổi số", title: "CTO",
    specializations: ["AI/ML", "Cloud Computing", "Data Science", "Digital Transformation"],
    rating: 4.8, totalReviews: 256, coursesActive: 3, coursesCompleted: 12, totalStudents: 890, totalHours: 380,
    status: "active", availability: "busy", certifications: ["AWS Solutions Architect", "Google Cloud Professional", "PhD Computer Science"],
    joinDate: "01/06/2021", lastActive: "12/03/2026",
    bio: "Tiến sĩ CNTT, 12 năm kinh nghiệm về AI và Cloud, dẫn dắt chuyển đổi số toàn tập đoàn.",
    monthlyRatings: [4.6, 4.7, 4.7, 4.8, 4.75, 4.8, 4.8, 4.85, 4.8, 4.8, 4.82, 4.8],
    topSkills: [{ name: "AI/ML", level: 96 }, { name: "Cloud", level: 94 }, { name: "Architecture", level: 90 }, { name: "Data Science", level: 88 }, { name: "DevOps", level: 82 }],
    assignedCourses: [
      { id: "C002", title: "AI & Machine Learning Fundamentals", students: 210, progress: 60 },
      { id: "C012", title: "Cloud Architecture on AWS", students: 130, progress: 82 },
      { id: "C013", title: "Digital Transformation Roadmap", students: 95, progress: 25 },
    ],
    feedbacks: [
      { user: "Ngô Trung Kiên", rating: 5, date: "11/03/2026", comment: "Dr. Hùng giảng rất rõ ràng, demo trực tiếp rất ấn tượng." },
      { user: "Phạm Thị Lan", rating: 4, date: "05/03/2026", comment: "Nội dung chuyên sâu, cần có nền tảng kỹ thuật tốt." },
    ],
  },
  {
    id: "INS03", name: "Ngô Trung Kiên", initials: "NK", email: "kien.nt@geleximco.vn", phone: "0987-xxx-xxx",
    subsidiary: "Tập đoàn Geleximco", department: "Ban CNTT & Chuyển đổi số", title: "IT Director",
    specializations: ["Cybersecurity", "Data Analytics", "Python", "Power BI"],
    rating: 4.7, totalReviews: 198, coursesActive: 5, coursesCompleted: 15, totalStudents: 1450, totalHours: 620,
    status: "active", availability: "available", certifications: ["CISSP", "CEH", "Microsoft Data Analyst"],
    joinDate: "01/03/2019", lastActive: "11/03/2026",
    bio: "Chuyên gia An toàn thông tin và Phân tích dữ liệu, triển khai hệ thống ATTT cho 14 đơn vị thành viên.",
    monthlyRatings: [4.5, 4.6, 4.6, 4.7, 4.65, 4.7, 4.7, 4.75, 4.7, 4.72, 4.7, 4.7],
    topSkills: [{ name: "Cybersecurity", level: 95 }, { name: "Python", level: 90 }, { name: "Power BI", level: 88 }, { name: "Networking", level: 85 }, { name: "Cloud Security", level: 87 }],
    assignedCourses: [
      { id: "C003", title: "Cybersecurity Essentials", students: 320, progress: 90 },
      { id: "C014", title: "Python for Data Analysis", students: 280, progress: 65 },
      { id: "C015", title: "Power BI Masterclass", students: 250, progress: 78 },
      { id: "C016", title: "Network Security Advanced", students: 180, progress: 40 },
      { id: "C017", title: "SOC Operations", students: 120, progress: 15 },
    ],
    feedbacks: [
      { user: "Đỗ Minh Châu", rating: 5, date: "09/03/2026", comment: "Anh Kiên rất tận tâm, lab thực hành rất thực tế!" },
      { user: "Trần Văn Bình", rating: 5, date: "07/03/2026", comment: "Khóa Power BI giúp team tôi tự tạo dashboard không cần IT hỗ trợ." },
    ],
  },
  {
    id: "INS04", name: "Phạm Anh Tuấn", initials: "PT", email: "tuan.pa@geleximco.vn", phone: "0918-xxx-xxx",
    subsidiary: "BĐS Geleximco - KĐT Lê Trọng Tấn", department: "Marketing", title: "Head of Marketing",
    specializations: ["Digital Marketing", "Design Thinking", "Branding", "Customer Experience"],
    rating: 4.6, totalReviews: 167, coursesActive: 2, coursesCompleted: 8, totalStudents: 560, totalHours: 240,
    status: "active", availability: "available", certifications: ["Google Ads Certified", "HubSpot Marketing"],
    joinDate: "15/09/2021", lastActive: "10/03/2026",
    bio: "10 năm Marketing BĐS, chuyên gia Design Thinking và trải nghiệm khách hàng.",
    monthlyRatings: [4.4, 4.5, 4.5, 4.6, 4.55, 4.6, 4.6, 4.65, 4.6, 4.62, 4.6, 4.6],
    topSkills: [{ name: "Digital Mktg", level: 92 }, { name: "Design Thinking", level: 90 }, { name: "Branding", level: 88 }, { name: "CX", level: 85 }, { name: "Content", level: 83 }],
    assignedCourses: [
      { id: "C004", title: "Digital Marketing Strategy", students: 310, progress: 85 },
      { id: "C018", title: "Design Thinking Workshop", students: 95, progress: 50 },
    ],
    feedbacks: [
      { user: "Hoàng Thu Hà", rating: 5, date: "06/03/2026", comment: "Workshop Design Thinking rất sáng tạo, team thay đổi mindset hoàn toàn." },
    ],
  },
  {
    id: "INS05", name: "Trần Thị Hương", initials: "TH", email: "huong.tt@abbank.com.vn", phone: "0901-xxx-xxx",
    subsidiary: "Ngân hàng TMCP An Bình (ABBank)", department: "Khối Quản trị Rủi ro", title: "VP Risk Management",
    specializations: ["Risk Management", "Credit Analysis", "Basel III", "Financial Modeling"],
    rating: 4.5, totalReviews: 134, coursesActive: 2, coursesCompleted: 10, totalStudents: 670, totalHours: 310,
    status: "active", availability: "busy", certifications: ["FRM", "CFA Level 3", "PRM"],
    joinDate: "01/01/2020", lastActive: "11/03/2026",
    bio: "Chuyên gia quản lý rủi ro ngân hàng, 14 năm kinh nghiệm tại ABBank và các NHTM.",
    monthlyRatings: [4.3, 4.4, 4.4, 4.5, 4.45, 4.5, 4.5, 4.55, 4.5, 4.52, 4.5, 4.5],
    topSkills: [{ name: "Risk Mgmt", level: 96 }, { name: "Credit", level: 93 }, { name: "Basel III", level: 91 }, { name: "Fin Model", level: 88 }, { name: "Compliance", level: 85 }],
    assignedCourses: [
      { id: "C005", title: "Credit Risk Analysis", students: 380, progress: 92 },
      { id: "C019", title: "Basel III Compliance", students: 120, progress: 55 },
    ],
    feedbacks: [
      { user: "Lê Quốc Vương", rating: 5, date: "04/03/2026", comment: "Chị Hương rất chuyên nghiệp, kiến thức Basel III rất sâu." },
    ],
  },
  {
    id: "INS06", name: "Lê Quốc Vương", initials: "LV", email: "vuong.lq@geleximco.vn", phone: "0908-xxx-xxx",
    subsidiary: "BĐS Geleximco - KĐT Lê Trọng Tấn", department: "Ban Kinh doanh BĐS", title: "CEO Geleximco Land",
    specializations: ["BĐS Strategy", "ESG", "Investment", "Corporate Governance"],
    rating: 4.8, totalReviews: 89, coursesActive: 1, coursesCompleted: 5, totalStudents: 320, totalHours: 120,
    status: "active", availability: "unavailable", certifications: ["MBA Harvard", "CFA"],
    joinDate: "01/01/2022", lastActive: "08/03/2026",
    bio: "CEO Geleximco Land, chuyên gia chiến lược BĐS và phát triển bền vững ESG.",
    monthlyRatings: [4.7, 4.7, 4.8, 4.8, 4.75, 4.8, 4.8, 4.85, 4.8, 4.8, 4.8, 4.8],
    topSkills: [{ name: "Strategy", level: 97 }, { name: "Real Estate", level: 95 }, { name: "ESG", level: 90 }, { name: "Investment", level: 92 }, { name: "Governance", level: 88 }],
    assignedCourses: [
      { id: "C006", title: "ESG & Sustainable Development", students: 180, progress: 68 },
    ],
    feedbacks: [
      { user: "Phạm Đức Mạnh", rating: 5, date: "02/03/2026", comment: "Anh Vương chia sẻ tầm nhìn ESG rất thuyết phục, có số liệu thực tế." },
    ],
  },
  {
    id: "INS07", name: "Phạm Đức Mạnh", initials: "PM", email: "manh.pd@geleximco.vn", phone: "0915-xxx-xxx",
    subsidiary: "Xi măng Thăng Long", department: "Ban An toàn Mỏ & Lao động", title: "HSE Manager",
    specializations: ["ATLĐ", "HSE Management", "ISO 45001", "Construction Safety"],
    rating: 4.3, totalReviews: 210, coursesActive: 3, coursesCompleted: 20, totalStudents: 2100, totalHours: 480,
    status: "active", availability: "available", certifications: ["NEBOSH IGC", "ISO 45001 Lead Auditor"],
    joinDate: "01/06/2018", lastActive: "12/03/2026",
    bio: "Quản lý An toàn lao động 18 năm kinh nghiệm, đào tạo ATLĐ cho toàn bộ công trường Geleximco.",
    monthlyRatings: [4.2, 4.2, 4.3, 4.3, 4.25, 4.3, 4.3, 4.35, 4.3, 4.3, 4.3, 4.3],
    topSkills: [{ name: "HSE", level: 97 }, { name: "ISO 45001", level: 94 }, { name: "Construction", level: 92 }, { name: "First Aid", level: 90 }, { name: "Risk Assess", level: 88 }],
    assignedCourses: [
      { id: "C007", title: "ATVSLĐ - Cơ bản", students: 850, progress: 95 },
      { id: "C020", title: "ISO 45001 Implementation", students: 420, progress: 70 },
      { id: "C021", title: "Construction Site Safety", students: 680, progress: 82 },
    ],
    feedbacks: [
      { user: "Nguyễn Thị Hà", rating: 4, date: "11/03/2026", comment: "Khóa ATVSLĐ rất thiết thực, video minh họa sống động." },
      { user: "Trần Đức Long", rating: 5, date: "09/03/2026", comment: "Anh Mạnh truyền đạt dễ hiểu, có demo thực tế tại công trường." },
    ],
  },
  {
    id: "INS08", name: "Bùi Thị Hà", initials: "BH", email: "ha.bt@geleximco.vn", phone: "0922-xxx-xxx",
    subsidiary: "Tập đoàn Geleximco", department: "Kế toán - Tài chính", title: "Senior Accountant",
    specializations: ["Excel Advanced", "VBA", "Kế toán DN", "Thuế"],
    rating: 4.6, totalReviews: 145, coursesActive: 1, coursesCompleted: 6, totalStudents: 430, totalHours: 180,
    status: "on-leave", availability: "unavailable", certifications: ["CPA Vietnam", "ACCA"],
    joinDate: "15/03/2020", lastActive: "28/02/2026",
    bio: "Kế toán trưởng 12 năm kinh nghiệm, chuyên gia Excel và VBA automation cho bộ phận tài chính.",
    monthlyRatings: [4.5, 4.5, 4.6, 4.6, 4.55, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 0],
    topSkills: [{ name: "Excel", level: 98 }, { name: "VBA", level: 94 }, { name: "Accounting", level: 92 }, { name: "Tax", level: 88 }, { name: "ERP", level: 82 }],
    assignedCourses: [
      { id: "C008", title: "Excel VBA for Accountants", students: 280, progress: 90 },
    ],
    feedbacks: [
      { user: "Bùi Văn Hải", rating: 5, date: "25/02/2026", comment: "Chị Hà dạy VBA cực kỳ thực tế, file mẫu rất có giá trị." },
    ],
  },
];

const STATUS_CONFIG = {
  active: { label: "Hoạt động", color: "#16a34a", bg: "#dcfce7" },
  "on-leave": { label: "Nghỉ phép", color: "#ea580c", bg: "#ffedd5" },
  inactive: { label: "Ngừng", color: "#6b7280", bg: "#f3f4f6" },
  pending: { label: "Chờ duyệt", color: "#c8a84e", bg: "#fef9c3" },
};

const AVAIL_CONFIG = {
  available: { label: "Sẵn sàng", color: "#16a34a" },
  busy: { label: "Bận", color: "#ea580c" },
  unavailable: { label: "Không khả dụng", color: "#6b7280" },
};

function getInitials(name: string) {
  return name.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase();
}

export function InstructorManagement() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";

  const [instructors, setInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS);
  const [search, setSearch] = useState("");
  const [filterSubsidiary, setFilterSubsidiary] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "students" | "courses" | "hours">("rating");
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorFormData | null>(null);

  const subsidiaries = [...new Set(instructors.map(i => i.subsidiary))];
  const filtered = instructors.filter(i => {
    if (search) {
      const q = search.toLowerCase();
      if (!i.name.toLowerCase().includes(q) &&
          !i.specializations.some(s => s.toLowerCase().includes(q)) &&
          !i.email.toLowerCase().includes(q) &&
          !i.department.toLowerCase().includes(q)) return false;
    }
    if (filterSubsidiary !== "all" && i.subsidiary !== filterSubsidiary) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "rating": return b.rating - a.rating;
      case "students": return b.totalStudents - a.totalStudents;
      case "courses": return b.coursesActive - a.coursesActive;
      case "hours": return b.totalHours - a.totalHours;
      default: return 0;
    }
  });

  const totalStudents = instructors.reduce((s, i) => s + i.totalStudents, 0);
  const avgRating = (instructors.reduce((s, i) => s + i.rating, 0) / instructors.length).toFixed(1);
  const totalHours = instructors.reduce((s, i) => s + i.totalHours, 0);
  const activeCount = instructors.filter(i => i.status === "active").length;

  // ─── CRUD Handlers ───
  const openAdd = () => { setEditingInstructor(null); setFormOpen(true); };
  const openEdit = (ins: Instructor) => {
    setEditingInstructor({
      id: ins.id, name: ins.name, email: ins.email, phone: ins.phone,
      subsidiary: ins.subsidiary, department: ins.department, title: ins.title,
      specializations: [...ins.specializations], bio: ins.bio,
      certifications: [...ins.certifications], status: ins.status, availability: ins.availability,
    });
    setFormOpen(true);
  };

  const handleFormSubmit = (data: InstructorFormData) => {
    if (editingInstructor) {
      // Edit existing
      setInstructors(prev => prev.map(ins => {
        if (ins.id !== data.id) return ins;
        return {
          ...ins,
          name: data.name, initials: getInitials(data.name),
          email: data.email, phone: data.phone,
          subsidiary: data.subsidiary, department: data.department, title: data.title,
          specializations: data.specializations, bio: data.bio,
          certifications: data.certifications, status: data.status, availability: data.availability,
        };
      }));
      if (selectedInstructor?.id === data.id) {
        setSelectedInstructor(prev => prev ? {
          ...prev,
          name: data.name, initials: getInitials(data.name),
          email: data.email, phone: data.phone,
          subsidiary: data.subsidiary, department: data.department, title: data.title,
          specializations: data.specializations, bio: data.bio,
          certifications: data.certifications, status: data.status, availability: data.availability,
        } : null);
      }
      toast.success(`Đã cập nhật thông tin giảng viên "${data.name}"`);
    } else {
      // Add new
      const newIns: Instructor = {
        id: data.id, name: data.name, initials: getInitials(data.name),
        email: data.email, phone: data.phone,
        subsidiary: data.subsidiary, department: data.department, title: data.title,
        specializations: data.specializations,
        rating: 0, totalReviews: 0, coursesActive: 0, coursesCompleted: 0,
        totalStudents: 0, totalHours: 0,
        status: data.status, availability: data.availability,
        certifications: data.certifications,
        joinDate: new Date().toLocaleDateString("vi-VN"),
        lastActive: new Date().toLocaleDateString("vi-VN"),
        bio: data.bio,
        monthlyRatings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        topSkills: data.specializations.slice(0, 5).map(s => ({ name: s, level: 70 })),
        assignedCourses: [],
        feedbacks: [],
      };
      setInstructors(prev => [newIns, ...prev]);
      toast.success(`Đã thêm giảng viên "${data.name}" vào hệ thống`);
    }
  };

  const handleDelete = async (ins: Instructor) => {
    const confirmed = await confirm({
      title: "Xóa giảng viên",
      message: `Bạn có chắc muốn xóa giảng viên "${ins.name}"? Hành động này sẽ hủy liên kết với ${ins.coursesActive} khóa đang dạy và ${ins.totalStudents} học viên liên quan.`,
      confirmLabel: "Xóa giảng viên",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (confirmed) {
      setInstructors(prev => prev.filter(i => i.id !== ins.id));
      if (selectedInstructor?.id === ins.id) setSelectedInstructor(null);
      toast.success(`Đã xóa giảng viên "${ins.name}"`);
    }
  };

  const handleToggleStatus = async (ins: Instructor) => {
    const newStatus: Instructor["status"] = ins.status === "active" ? "inactive" : "active";
    const label = newStatus === "active" ? "kích hoạt" : "vô hiệu hóa";
    const confirmed = await confirm({
      title: `${newStatus === "active" ? "Kích hoạt" : "Vô hiệu hóa"} giảng viên`,
      message: `Bạn muốn ${label} giảng viên "${ins.name}"?${newStatus === "inactive" ? " Giảng viên sẽ không thể đăng nhập và dạy khóa mới." : ""}`,
      confirmLabel: newStatus === "active" ? "Kích hoạt" : "Vô hiệu hóa",
      cancelLabel: "Hủy",
      variant: newStatus === "active" ? "info" : "warning",
    });
    if (confirmed) {
      setInstructors(prev => prev.map(i => i.id === ins.id ? { ...i, status: newStatus } : i));
      if (selectedInstructor?.id === ins.id) {
        setSelectedInstructor(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Đã ${label} giảng viên "${ins.name}"`);
    }
  };

  const handleExportReport = () => {
    const header = "ID,Tên,Email,Đơn vị,Phòng ban,Chức danh,Rating,Học viên,Giờ dạy,Trạng thái\n";
    const rows = instructors.map(i =>
      `${i.id},${i.name},${i.email},${i.subsidiary},${i.department},${i.title},${i.rating},${i.totalStudents},${i.totalHours},${STATUS_CONFIG[i.status].label}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geleximco_instructors_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất báo cáo giảng viên (CSV)");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#990803]" />
            <h1 className="text-foreground">Quản lý Giảng viên</h1>
          </div>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            Quản lý đội ngũ giảng viên nội bộ toàn tập đoàn Geleximco
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              style={{ fontSize: "13px" }}>
              <Download className="w-4 h-4" /> Xuất báo cáo
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
              style={{ fontSize: "14px" }}>
              <Plus className="w-4 h-4" /> Thêm giảng viên
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Tổng giảng viên", value: instructors.length, icon: GraduationCap, color: "#990803" },
          { label: "Đang hoạt động", value: activeCount, icon: CheckCircle, color: "#16a34a" },
          { label: "Đánh giá TB", value: avgRating, icon: Star, color: "#c8a84e" },
          { label: "Tổng học viên", value: totalStudents.toLocaleString(), icon: Users, color: "#2563eb" },
          { label: "Tổng giờ dạy", value: totalHours.toLocaleString() + "h", icon: Clock, color: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Instructors */}
      <div className="bg-gradient-to-r from-[#990803]/5 via-[#c8a84e]/5 to-transparent rounded-xl border border-[#990803]/10 p-5">
        <h3 className="text-foreground mb-3 flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Award className="w-4 h-4 text-[#c8a84e]" /> Top Giảng viên Xuất sắc Q1/2026
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {instructors.filter(i => i.status === "active").sort((a, b) => b.rating - a.rating).slice(0, 3).map((ins, idx) => (
            <div key={ins.id} onClick={() => setSelectedInstructor(ins)}
              className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:shadow-md transition-all flex items-center gap-3 relative overflow-hidden group">
              {idx === 0 && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c8a84e] to-transparent" />}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ fontSize: "14px", fontWeight: 700, background: idx === 0 ? "linear-gradient(145deg, #c8a84e, #a08636)" : "linear-gradient(145deg, #990803, #7a0602)" }}>
                  {ins.initials}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ fontSize: "9px", fontWeight: 800, backgroundColor: idx === 0 ? "#c8a84e" : idx === 1 ? "#94a3b8" : "#c97a3e" }}>
                  #{idx + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate" style={{ fontSize: "14px", fontWeight: 600 }}>{ins.name}</p>
                <p className="text-muted-foreground truncate" style={{ fontSize: "11px" }}>{ins.title} — {ins.subsidiary}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-0.5 text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 600 }}>
                    <Star className="w-3 h-3 fill-[#c8a84e]" /> {ins.rating}
                  </span>
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{ins.totalReviews} đánh giá</span>
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{ins.totalStudents.toLocaleString()} HV</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm giảng viên, chuyên môn, email..."
              className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              style={{ fontSize: "13px" }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
            style={{ fontSize: "13px" }}>
            <Filter className="w-4 h-4" /> Bộ lọc
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <span className="flex items-center text-muted-foreground" style={{ fontSize: "12px" }}>{filtered.length} giảng viên</span>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Đơn vị</label>
              <select value={filterSubsidiary} onChange={e => setFilterSubsidiary(e.target.value)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                <option value="all">Tất cả đơn vị</option>
                {subsidiaries.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Trạng thái</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                <option value="all">Tất cả trạng thái</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Sắp xếp</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="students">Nhiều học viên nhất</option>
                <option value="courses">Nhiều khóa nhất</option>
                <option value="hours">Nhiều giờ dạy nhất</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Instructor Cards */}
      {filtered.length === 0 ? (
        <EmptyState variant="search" title="Không tìm thấy giảng viên" message="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(ins => (
            <InstructorCard key={ins.id} ins={ins} isAdmin={isAdmin}
              onView={() => setSelectedInstructor(ins)}
              onEdit={() => openEdit(ins)}
              onDelete={() => handleDelete(ins)}
              onToggleStatus={() => handleToggleStatus(ins)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedInstructor && (
        <InstructorDetailModal
          instructor={selectedInstructor}
          isAdmin={isAdmin}
          onClose={() => setSelectedInstructor(null)}
          onEdit={() => { openEdit(selectedInstructor); }}
          onDelete={() => { handleDelete(selectedInstructor); }}
          onToggleStatus={() => { handleToggleStatus(selectedInstructor); }}
        />
      )}

      {/* Form Modal */}
      <InstructorFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingInstructor(null); }}
        onSubmit={handleFormSubmit}
        editData={editingInstructor}
      />
    </div>
  );
}

// ─── Instructor Card ───
function InstructorCard({ ins, isAdmin, onView, onEdit, onDelete, onToggleStatus }: {
  ins: Instructor; isAdmin: boolean;
  onView: () => void; onEdit: () => void; onDelete: () => void; onToggleStatus: () => void;
}) {
  const stCfg = STATUS_CONFIG[ins.status];
  const avCfg = AVAIL_CONFIG[ins.availability];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0 cursor-pointer" onClick={onView}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ fontSize: "14px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}>
            {ins.initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card"
            style={{ backgroundColor: avCfg.color }} title={avCfg.label} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{ins.name}</h4>
            <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
              {stCfg.label}
            </span>
          </div>
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{ins.title} • {ins.subsidiary}</p>

          <div className="flex flex-wrap gap-1 mt-1.5">
            {ins.specializations.slice(0, 3).map(s => (
              <span key={s} className="px-1.5 py-0.5 bg-[#990803]/5 text-[#990803] rounded" style={{ fontSize: "10px", fontWeight: 500 }}>{s}</span>
            ))}
            {ins.specializations.length > 3 && (
              <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "10px" }}>+{ins.specializations.length - 3}</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-muted-foreground" style={{ fontSize: "11px" }}>
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" />
              <strong className="text-[#c8a84e]">{ins.rating}</strong> ({ins.totalReviews})
            </span>
            <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" /> {ins.coursesActive} khóa</span>
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {ins.totalStudents.toLocaleString()}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {ins.totalHours}h</span>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-start gap-1">
          {/* Mini sparkline */}
          <div className="hidden lg:block">
            <MiniSparkline data={ins.monthlyRatings} color="#c8a84e" />
            <p className="text-center text-muted-foreground mt-0.5" style={{ fontSize: "8px" }}>12 tháng</p>
          </div>

          {isAdmin && (
            <div ref={menuRef} className="relative">
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl border border-border shadow-xl z-20 py-1 overflow-hidden">
                  <button onClick={() => { setMenuOpen(false); onView(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-secondary transition-colors text-left cursor-pointer" style={{ fontSize: "13px" }}>
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Xem chi tiết
                  </button>
                  <button onClick={() => { setMenuOpen(false); onEdit(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-secondary transition-colors text-left cursor-pointer" style={{ fontSize: "13px" }}>
                    <Pencil className="w-3.5 h-3.5 text-[#c8a84e]" /> Chỉnh sửa
                  </button>
                  <button onClick={() => { setMenuOpen(false); onToggleStatus(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-secondary transition-colors text-left cursor-pointer" style={{ fontSize: "13px" }}>
                    {ins.status === "active" ? <UserX className="w-3.5 h-3.5 text-orange-500" /> : <UserCheck className="w-3.5 h-3.5 text-green-600" />}
                    {ins.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                  </button>
                  <div className="border-t border-border my-0.5" />
                  <button onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-red-50 transition-colors text-left cursor-pointer text-red-600" style={{ fontSize: "13px" }}>
                    <Trash2 className="w-3.5 h-3.5" /> Xóa giảng viên
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course progress mini bars (admin) */}
      {isAdmin && ins.assignedCourses.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-muted-foreground mb-1.5" style={{ fontSize: "10px", fontWeight: 500 }}>Khóa đang dạy ({ins.coursesActive})</p>
          <div className="space-y-1">
            {ins.assignedCourses.slice(0, 2).map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="text-foreground truncate flex-1" style={{ fontSize: "11px" }}>{c.title}</span>
                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0">
                  <div className="h-full rounded-full bg-[#990803]" style={{ width: `${c.progress}%` }} />
                </div>
                <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{c.progress}%</span>
              </div>
            ))}
            {ins.assignedCourses.length > 2 && (
              <p className="text-muted-foreground" style={{ fontSize: "10px" }}>+{ins.assignedCourses.length - 2} khóa khác</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mini Sparkline ───
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const W = 60, H = 24;
  const validData = data.filter(d => d > 0);
  if (validData.length < 2) return <svg width={W} height={H} />;
  const min = Math.min(...validData) - 0.2;
  const max = Math.max(...validData) + 0.1;
  const pts = validData.map((v, i) => `${(i / (validData.length - 1)) * W},${H - ((v - min) / (max - min)) * H}`).join(" ");
  return (
    <svg width={W} height={H}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={W} cy={H - ((validData[validData.length - 1] - min) / (max - min)) * H} r="2" fill={color} />
    </svg>
  );
}

// ─── Detail Modal ───
function InstructorDetailModal({ instructor: ins, isAdmin, onClose, onEdit, onDelete, onToggleStatus }: {
  instructor: Instructor; isAdmin: boolean;
  onClose: () => void; onEdit: () => void; onDelete: () => void; onToggleStatus: () => void;
}) {
  const stCfg = STATUS_CONFIG[ins.status];
  const avCfg = AVAIL_CONFIG[ins.availability];
  const [tab, setTab] = useState<"overview" | "courses" | "skills" | "feedback" | "schedule">("overview");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                style={{ fontSize: "18px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}>{ins.initials}</div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-card" style={{ backgroundColor: avCfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{ins.name}</h3>
                <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground" style={{ fontSize: "10px" }}>{avCfg.label}</span>
              </div>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "13px" }}>{ins.title} — {ins.subsidiary} / {ins.department}</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{ins.bio}</p>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground" style={{ fontSize: "11px" }}>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {ins.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {ins.phone}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Tham gia: {ins.joinDate}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer shrink-0">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {([
              { id: "overview" as const, label: "Tổng quan", icon: BarChart3 },
              { id: "courses" as const, label: `Khóa học (${ins.assignedCourses.length})`, icon: BookOpen },
              { id: "skills" as const, label: "Kỹ năng", icon: Target },
              { id: "feedback" as const, label: `Đánh giá (${ins.feedbacks.length})`, icon: MessageCircle },
              { id: "schedule" as const, label: "Lịch dạy", icon: Calendar },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors ${tab === t.id ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                style={{ fontSize: "12px", fontWeight: tab === t.id ? 600 : 400 }}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "overview" && (
            <div className="space-y-5">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Đánh giá", value: ins.rating.toString(), sub: `${ins.totalReviews} reviews`, color: "#c8a84e", icon: Star },
                  { label: "Khóa học", value: `${ins.coursesActive}`, sub: `+ ${ins.coursesCompleted} hoàn thành`, color: "#990803", icon: BookOpen },
                  { label: "Học viên", value: ins.totalStudents.toLocaleString(), sub: "Tổng cộng", color: "#2563eb", icon: Users },
                  { label: "Giờ dạy", value: `${ins.totalHours}h`, sub: "Tổng cộng", color: "#7c3aed", icon: Clock },
                ].map((s, i) => (
                  <div key={i} className="bg-secondary/50 rounded-xl p-3 text-center border border-border">
                    <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                    <p style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{s.value}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{s.label}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div>
                <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Chứng chỉ Chuyên môn</h4>
                <div className="flex flex-wrap gap-1.5">
                  {ins.certifications.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-[#c8a84e]/10 text-[#c8a84e] rounded-lg flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                      <Award className="w-3 h-3" /> {c}
                    </span>
                  ))}
                  {ins.certifications.length === 0 && <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Chưa có chứng chỉ</span>}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Chuyên môn Giảng dạy</h4>
                <div className="flex flex-wrap gap-1.5">
                  {ins.specializations.map(s => (
                    <span key={s} className="px-2 py-1 bg-[#990803]/5 text-[#990803] rounded-lg border border-[#990803]/10" style={{ fontSize: "12px" }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Rating Trend */}
              <div>
                <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Xu hướng Đánh giá 12 Tháng</h4>
                <RatingTrendChart data={ins.monthlyRatings} />
              </div>
            </div>
          )}

          {tab === "courses" && (
            <div className="space-y-4">
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Khóa học đang phụ trách</h4>
              {ins.assignedCourses.length === 0 ? (
                <EmptyState variant="empty" title="Chưa có khóa học" message="Giảng viên chưa được gán khóa nào" />
              ) : (
                <div className="space-y-3">
                  {ins.assignedCourses.map(course => (
                    <div key={course.id} className="bg-secondary/50 rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 500 }}>{course.title}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{course.students} học viên đăng ký</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg ${course.progress >= 80 ? "bg-green-50 text-green-600" : course.progress >= 50 ? "bg-yellow-50 text-yellow-600" : "bg-[#990803]/5 text-[#990803]"}`}
                          style={{ fontSize: "12px", fontWeight: 600 }}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${course.progress >= 80 ? "bg-green-500" : course.progress >= 50 ? "bg-yellow-500" : "bg-[#990803]"}`}
                          style={{ width: `${course.progress}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Tiến độ giảng dạy</span>
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Mã: {course.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Summary */}
              <div className="bg-[#990803]/5 rounded-xl p-4 border border-[#990803]/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 700 }}>{ins.coursesActive}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Đang dạy</p>
                  </div>
                  <div>
                    <p className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 700 }}>{ins.coursesCompleted}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Đã hoàn thành</p>
                  </div>
                  <div>
                    <p className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 700 }}>{ins.totalStudents.toLocaleString()}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng học viên</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "skills" && (
            <div className="space-y-5">
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Chuyên môn Chi tiết</h4>
              <div className="flex justify-center">
                <SkillRadarChart skills={ins.topSkills} />
              </div>
              <div className="space-y-2.5">
                {ins.topSkills.map(skill => (
                  <div key={skill.name} className="flex items-center gap-3">
                    <span className="w-24 text-muted-foreground text-right shrink-0" style={{ fontSize: "12px" }}>{skill.name}</span>
                    <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${skill.level}%`, backgroundColor: skill.level >= 90 ? "#990803" : skill.level >= 80 ? "#c8a84e" : "#6b7280" }} />
                    </div>
                    <span className="w-10 text-right shrink-0" style={{ fontSize: "12px", fontWeight: 600, color: skill.level >= 90 ? "#990803" : "#6b7280" }}>{skill.level}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "feedback" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Đánh giá từ Học viên</h4>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#c8a84e] fill-[#c8a84e]" />
                  <span className="text-[#c8a84e]" style={{ fontSize: "16px", fontWeight: 700 }}>{ins.rating}</span>
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>/ 5.0 ({ins.totalReviews} đánh giá)</span>
                </div>
              </div>

              {/* Rating distribution */}
              <div className="bg-secondary/50 rounded-xl border border-border p-4">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = ins.feedbacks.filter(f => f.rating === stars).length;
                  const pct = ins.feedbacks.length > 0 ? (count / ins.feedbacks.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 mb-1">
                      <span className="text-muted-foreground w-6 text-right" style={{ fontSize: "12px" }}>{stars}</span>
                      <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" />
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#c8a84e]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-muted-foreground w-6" style={{ fontSize: "11px" }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Feedback list */}
              {ins.feedbacks.length === 0 ? (
                <EmptyState variant="empty" title="Chưa có đánh giá" message="Giảng viên chưa nhận được đánh giá từ học viên" />
              ) : (
                ins.feedbacks.map((fb, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#b82020] text-white flex items-center justify-center"
                          style={{ fontSize: "10px", fontWeight: 600 }}>
                          {fb.user.split(" ").slice(-2).map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{fb.user}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{fb.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= fb.rating ? "text-[#c8a84e] fill-[#c8a84e]" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.6 }}>{fb.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "schedule" && (
            <div className="space-y-4">
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Lịch Giảng dạy Tuần này</h4>
              <WeeklySchedule name={ins.name} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30">
          <div className="text-muted-foreground" style={{ fontSize: "11px" }}>
            Hoạt động cuối: {ins.lastActive} • ID: {ins.id}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button onClick={onToggleStatus}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${ins.status === "active" ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                  style={{ fontSize: "12px", fontWeight: 500 }}>
                  {ins.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  {ins.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                </button>
                <button onClick={onEdit}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                  style={{ fontSize: "12px", fontWeight: 500 }}>
                  <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
                </button>
                <button onClick={onDelete}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                  style={{ fontSize: "12px", fontWeight: 500 }}>
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </>
            )}
            {!isAdmin && (
              <button onClick={() => toast.info("Đang mở hộp thoại nhắn tin...")}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <MessageCircle className="w-4 h-4" /> Liên hệ
              </button>
            )}
            <button onClick={onClose}
              className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              style={{ fontSize: "13px" }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rating Trend Chart ───
function RatingTrendChart({ data }: { data: number[] }) {
  const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
  const validData = data.map((d, i) => ({ val: d, month: months[i] })).filter(d => d.val > 0);
  if (validData.length < 2) return <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Chưa đủ dữ liệu</p>;
  const W = 520, H = 120, pL = 30, pR = 10, pT = 10, pB = 20;
  const cW = W - pL - pR, cH = H - pT - pB;
  const min = Math.min(...validData.map(d => d.val)) - 0.2;
  const max = Math.max(...validData.map(d => d.val)) + 0.1;

  return (
    <svg width="100%" height="120" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {[min, (min + max) / 2, max].map((v, i) => {
        const y = pT + cH - ((v - min) / (max - min)) * cH;
        return (
          <g key={i}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
            <text x={pL - 4} y={y} textAnchor="end" dominantBaseline="central" fill="currentColor" opacity="0.4" style={{ fontSize: "8px" }}>{v.toFixed(1)}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="ratingGradIM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a84e" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c8a84e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${pL},${pT + cH} ${validData.map((d, i) => `L${pL + (i / (validData.length - 1)) * cW},${pT + cH - ((d.val - min) / (max - min)) * cH}`).join(" ")} L${pL + ((validData.length - 1) / (validData.length - 1)) * cW},${pT + cH} Z`} fill="url(#ratingGradIM)" />
      <polyline points={validData.map((d, i) => `${pL + (i / (validData.length - 1)) * cW},${pT + cH - ((d.val - min) / (max - min)) * cH}`).join(" ")} fill="none" stroke="#c8a84e" strokeWidth="2" strokeLinejoin="round" />
      {validData.map((d, i) => {
        const x = pL + (i / (validData.length - 1)) * cW;
        const y = pT + cH - ((d.val - min) / (max - min)) * cH;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="2.5" fill="#c8a84e" />
            <text x={x} y={pT + cH + 14} textAnchor="middle" fill="currentColor" opacity="0.4" style={{ fontSize: "7px" }}>{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Skill Radar Chart ───
function SkillRadarChart({ skills }: { skills: { name: string; level: number }[] }) {
  const n = skills.length;
  if (n < 3) return null;
  const R = 80, cx = 110, cy = 100;
  return (
    <svg width="220" height="210" viewBox="0 0 220 210">
      {[20, 40, 60, 80, 100].map(level => {
        const r = (level / 100) * R;
        const pts = skills.map((_, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={level} points={pts} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />;
      })}
      {skills.map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="currentColor" strokeWidth="0.5" opacity="0.1" />;
      })}
      <polygon points={skills.map((s, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const r = (s.level / 100) * R;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(" ")} fill="#990803" fillOpacity="0.15" stroke="#990803" strokeWidth="2" />
      {skills.map((s, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const r = (s.level / 100) * R;
        const lr = R + 18;
        return (
          <g key={i}>
            <circle cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r="3.5" fill="#990803" />
            <text x={cx + lr * Math.cos(a)} y={cy + lr * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fill="currentColor" opacity="0.5" style={{ fontSize: "9px", fontWeight: 500 }}>{s.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Weekly Schedule ───
function WeeklySchedule({ name }: { name: string }) {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const slots = [
    { day: 0, start: 9, end: 11, title: "Kỹ năng Lãnh đạo - Lớp A", color: "#990803" },
    { day: 1, start: 14, end: 16, title: "Workshop Design Thinking", color: "#2563eb" },
    { day: 2, start: 9, end: 12, title: "Coaching 1-on-1", color: "#16a34a" },
    { day: 3, start: 14, end: 16, title: "Kỹ năng Lãnh đạo - Lớp B", color: "#990803" },
    { day: 4, start: 9, end: 11, title: "Đánh giá cuối khóa", color: "#c8a84e" },
  ];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  return (
    <div className="bg-secondary/50 rounded-xl border border-border p-4 overflow-x-auto">
      <div className="grid gap-0" style={{ gridTemplateColumns: `40px repeat(7, 1fr)`, minWidth: "500px" }}>
        <div />
        {days.map(d => (
          <div key={d} className="text-center text-muted-foreground pb-1" style={{ fontSize: "11px", fontWeight: 600 }}>{d}</div>
        ))}
        {hours.map(h => (
          <div key={h} className="contents">
            <div className="text-muted-foreground text-right pr-2 border-t border-border" style={{ fontSize: "10px", paddingTop: "2px" }}>{h}:00</div>
            {days.map((d, di) => {
              const slot = slots.find(s => s.day === di && h >= s.start && h < s.end);
              const isStart = slot && h === slot.start;
              return (
                <div key={`${h}-${di}`} className="border-t border-border relative" style={{ height: "22px" }}>
                  {isStart && slot && (
                    <div className="absolute left-0 right-0 mx-0.5 rounded px-1.5 py-0.5 text-white z-10 overflow-hidden"
                      style={{ backgroundColor: slot.color, top: 0, height: `${(slot.end - slot.start) * 22}px`, fontSize: "8px", fontWeight: 600, lineHeight: 1.4 }}>
                      {slot.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
