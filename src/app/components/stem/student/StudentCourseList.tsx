import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, PlayCircle, Star, BookOpen, Brain, Code2, Zap, BarChart3, FlaskConical, TrendingUp, Globe, Leaf, Calculator, Cpu, Layers, PenLine, Languages } from "lucide-react";
import { useGradeLevel } from "../../GradeLevelContext";
import type { LucideIcon } from "lucide-react";

/* ─── CT meta ────────────────────────────────────────────────────────────── */
const CT_META = {
  CT1: { label:"CT1", color:"#990803", bg:"#FFF0EF", lightBg:"#FFF8F8" },
  CT2: { label:"CT2", color:"#2563eb", bg:"#EAF1FF", lightBg:"#EFF6FF" },
  CT3: { label:"CT3", color:"#7c3aed", bg:"#EEE8FF", lightBg:"#F5F3FF" },
  CT4: { label:"CT4", color:"#f59e0b", bg:"#FFF4DC", lightBg:"#FFFBEB" },
  CT5: { label:"CT5", color:"#16a34a", bg:"#DFFFED", lightBg:"#F0FDF4" },
} as const;
type CTKey = keyof typeof CT_META;

/* ─── Subject tag display ─────────────────────────────────────────────────── */
const SUBJECT_TAG: Record<string, { short: string; color: string }> = {
  "Toán học":        { short:"TOÁN",    color:"#990803" },
  "Ngữ văn":         { short:"VĂN",     color:"#7c3aed" },
  "Khoa học":        { short:"KHOA HỌC",color:"#16a34a" },
  "Ngoại ngữ":       { short:"TIẾNG ANH",color:"#0891b2"},
  "Vật lý":          { short:"VẬT LÝ",  color:"#2563eb" },
  "Hóa học":         { short:"HÓA HỌC", color:"#16a34a" },
  "Sinh học":        { short:"SINH HỌC",color:"#059669" },
  "Tin học":         { short:"TIN HỌC", color:"#6366f1" },
  "NCKH":            { short:"NCKH",    color:"#f59e0b" },
  "Khoa học + Toán": { short:"LIÊN MÔN",color:"#2563eb" },
  "Sáng tạo số":     { short:"SÁNG TẠO",color:"#7c3aed" },
  "Đổi mới sáng tạo":{ short:"SÁNG TẠO",color:"#7c3aed" },
  "Robotics":        { short:"ROBOT",   color:"#f59e0b" },
};

/* ─── Course data ────────────────────────────────────────────────────────── */
type CourseTag = "Yêu thích" | "Đang học" | "Mới" | "Hoàn thành";

interface Course {
  id: number; ct: CTKey;
  name: string; subject: string; teacher: string; emoji: string;
  lessonsTotal: number; lessonsDone: number;
  status: "inprogress" | "completed";
  tag: CourseTag;
  thumbnail?: string;
}

/* ─── Tiểu học courses — Lớp 3 ───────────────────────────────────────────── */
const TH_PURCHASED_CTS: CTKey[] = ["CT1", "CT3", "CT4"];

const TH_ALL_COURSES: Course[] = [
  { id:1,  ct:"CT1", name:"Toán lớp 3",                  subject:"Toán học",         teacher:"Cô Lan Anh",    emoji:"🔢", lessonsTotal:24, lessonsDone:18, status:"inprogress", tag:"Yêu thích"  },
  { id:2,  ct:"CT1", name:"Tiếng Việt lớp 3",            subject:"Ngữ văn",           teacher:"Cô Thu Hoa",    emoji:"📖", lessonsTotal:20, lessonsDone:18, status:"inprogress", tag:"Yêu thích"  },
  { id:3,  ct:"CT1", name:"Tự nhiên & Xã hội lớp 3",    subject:"Khoa học",          teacher:"Thầy Quang",    emoji:"🔬", lessonsTotal:18, lessonsDone:11, status:"inprogress", tag:"Đang học"   },
  { id:4,  ct:"CT1", name:"Tiếng Anh lớp 3",             subject:"Ngoại ngữ",         teacher:"Cô Thu Trang",  emoji:"🌐", lessonsTotal:16, lessonsDone:16, status:"completed",  tag:"Hoàn thành" },
  { id:7,  ct:"CT3", name:"Tin học lớp 3 – Scratch",     subject:"Sáng tạo số",       teacher:"Thầy Minh Đức", emoji:"💻", lessonsTotal:20, lessonsDone:8,  status:"inprogress", tag:"Đang học"   },
  { id:8,  ct:"CT3", name:"Thiết kế & Sáng tạo",         subject:"Đổi mới sáng tạo", teacher:"Cô Hải Yến",   emoji:"✂️", lessonsTotal:12, lessonsDone:1,  status:"inprogress", tag:"Mới"        },
  { id:9,  ct:"CT4", name:"Robotics nhí",                 subject:"Robotics",          teacher:"Thầy Hoàng",    emoji:"🤖", lessonsTotal:15, lessonsDone:8,  status:"inprogress", tag:"Đang học"   },
];

/* ─── THCS courses — Lớp 8 ───────────────────────────────────────────────── */
const THCS_PURCHASED_CTS: CTKey[] = ["CT1", "CT3", "CT4"];

const THCS_ALL_COURSES: Course[] = [
  { id:101, ct:"CT1", name:"Toán 8 – Đại số & Hình học",    subject:"Toán học",  teacher:"Cô Ngọc Hà",    emoji:"🔢", lessonsTotal:32, lessonsDone:22, status:"inprogress", tag:"Yêu thích", thumbnail:"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:102, ct:"CT1", name:"Vật lý 8",                      subject:"Vật lý",    teacher:"Thầy Quang",    emoji:"⚡", lessonsTotal:28, lessonsDone:18, status:"inprogress", tag:"Đang học",  thumbnail:"https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:103, ct:"CT1", name:"Hóa học 8",                     subject:"Hóa học",   teacher:"Thầy Trung Nam",emoji:"🧪", lessonsTotal:24, lessonsDone:20, status:"inprogress", tag:"Yêu thích", thumbnail:"https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:104, ct:"CT1", name:"Sinh học 8 – Cơ thể người",     subject:"Sinh học",  teacher:"Cô Phương Mai", emoji:"🌿", lessonsTotal:20, lessonsDone:14, status:"inprogress", tag:"Đang học",  thumbnail:"https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:105, ct:"CT1", name:"Ngữ văn 8",                     subject:"Ngữ văn",   teacher:"Cô Lan Anh",    emoji:"📖", lessonsTotal:22, lessonsDone:19, status:"inprogress", tag:"Đang học",  thumbnail:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:106, ct:"CT1", name:"Tiếng Anh 8",                   subject:"Ngoại ngữ", teacher:"Cô Thu Trang",  emoji:"🌐", lessonsTotal:26, lessonsDone:24, status:"inprogress", tag:"Yêu thích", thumbnail:"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:107, ct:"CT3", name:"Tin học 8 – Lập trình Python",  subject:"Tin học",   teacher:"Thầy Minh Đức", emoji:"💻", lessonsTotal:20, lessonsDone:8,  status:"inprogress", tag:"Đang học",  thumbnail:"https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:108, ct:"CT3", name:"Thiết kế 3D & Chế tạo",         subject:"Sáng tạo số",teacher:"Cô Hải Yến",   emoji:"🎨", lessonsTotal:16, lessonsDone:5,  status:"inprogress", tag:"Mới",       thumbnail:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:109, ct:"CT4", name:"Robotics & Arduino",             subject:"Robotics",  teacher:"Thầy Hoàng",    emoji:"🤖", lessonsTotal:18, lessonsDone:7,  status:"inprogress", tag:"Đang học",  thumbnail:"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:110, ct:"CT4", name:"AI cho học sinh",                subject:"Tin học",   teacher:"Thầy Tuấn",     emoji:"🧠", lessonsTotal:15, lessonsDone:4,  status:"inprogress", tag:"Mới",       thumbnail:"https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=340&fit=crop&auto=format&q=80" },
];

/* ─── THPT courses — Lớp 12, Ban KHTN ────────────────────────────────────── */
const THPT_PURCHASED_CTS: CTKey[] = ["CT1", "CT3", "CT5"];

const THPT_ALL_COURSES: Course[] = [
  { id:201, ct:"CT1", name:"Toán 12 – Giải tích & Hình học",  subject:"Toán học",  teacher:"Cô Ngọc Hà",    emoji:"📊", lessonsTotal:32, lessonsDone:20, status:"inprogress", tag:"Yêu thích",  thumbnail:"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:202, ct:"CT1", name:"Vật lý 12",                        subject:"Vật lý",    teacher:"Thầy Quang Huy",emoji:"⚡", lessonsTotal:26, lessonsDone:15, status:"inprogress", tag:"Đang học",   thumbnail:"https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:203, ct:"CT1", name:"Hóa học 12",                       subject:"Hóa học",   teacher:"Cô Bích Ngọc",  emoji:"🧪", lessonsTotal:28, lessonsDone:20, status:"inprogress", tag:"Yêu thích",  thumbnail:"https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:204, ct:"CT1", name:"Sinh học 12",                      subject:"Sinh học",  teacher:"Cô Thanh Hà",   emoji:"🌿", lessonsTotal:22, lessonsDone:12, status:"inprogress", tag:"Đang học",   thumbnail:"https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:205, ct:"CT1", name:"Ngữ văn 12",                       subject:"Ngữ văn",   teacher:"Cô Lan Anh",    emoji:"📖", lessonsTotal:20, lessonsDone:16, status:"inprogress", tag:"Đang học",   thumbnail:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:206, ct:"CT1", name:"Tiếng Anh 12",                     subject:"Ngoại ngữ", teacher:"Cô Thu Trang",  emoji:"🌐", lessonsTotal:20, lessonsDone:20, status:"completed",  tag:"Hoàn thành", thumbnail:"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:207, ct:"CT3", name:"Tin học 12 – Python & Dữ liệu",   subject:"Tin học",   teacher:"Thầy Minh Đức", emoji:"💻", lessonsTotal:20, lessonsDone:8,  status:"inprogress", tag:"Đang học",   thumbnail:"https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=340&fit=crop&auto=format&q=80" },
  { id:208, ct:"CT5", name:"Dự án NCKH STEM",                  subject:"NCKH",      teacher:"Thầy Tuấn",     emoji:"🔬", lessonsTotal:12, lessonsDone:4,  status:"inprogress", tag:"Mới",        thumbnail:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format&q=80" },
];

/* ─── THCS card icon & color maps ────────────────────────────────────────── */
const THCS_ICONS: Record<number, LucideIcon> = {
  101: Calculator, 102: Zap,      103: FlaskConical, 104: Leaf,
  105: PenLine,    106: Languages, 107: Code2,        108: Layers,
  109: Cpu,        110: Brain,
};
const THCS_COLORS: Record<number, string> = {
  101: "#dc2626", 102: "#2563eb", 103: "#16a34a", 104: "#059669",
  105: "#7c3aed", 106: "#0891b2", 107: "#6366f1", 108: "#ea580c",
  109: "#0ea5e9", 110: "#8b5cf6",
};

/* ─── THPT card icon & color maps ────────────────────────────────────────── */
const THPT_ICONS: Record<number, LucideIcon> = {
  201: TrendingUp, 202: Zap,   203: FlaskConical, 204: Leaf,
  205: PenLine,    206: Globe, 207: Code2,         208: Brain,
};
const THPT_COLORS: Record<number, string> = {
  201: "#990803",  202: "#2563eb",  203: "#16a34a",  204: "#059669",
  205: "#7c3aed",  206: "#0891b2",  207: "#6366f1",  208: "#f59e0b",
};

/* ─── Tag badge ──────────────────────────────────────────────────────────── */
function TagBadge({ tag }: { tag: CourseTag }) {
  const styles: Record<CourseTag, { bg:string; color:string; icon:React.ReactNode }> = {
    "Yêu thích": { bg:"#fffbeb", color:"#d97706", icon:<Star style={{ width:10, height:10, fill:"#d97706" }} /> },
    "Đang học":  { bg:"#eff6ff", color:"#2563eb", icon:<PlayCircle style={{ width:10, height:10 }} /> },
    "Mới":       { bg:"#f5f3ff", color:"#7c3aed", icon:<BookOpen style={{ width:10, height:10 }} /> },
    "Hoàn thành":{ bg:"#f0fdf4", color:"#16a34a", icon:<CheckCircle2 style={{ width:10, height:10 }} /> },
  };
  const s = styles[tag];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:700, color:s.color, background:s.bg, padding:"3px 8px", borderRadius:99 }}>
      {s.icon} {tag}
    </span>
  );
}

/* ─── Course card ────────────────────────────────────────────────────────── */
function CourseCard({ course }: { course: Course }) {
  const ct    = CT_META[course.ct];
  const pct   = Math.round((course.lessonsDone / course.lessonsTotal) * 100);
  const subj  = SUBJECT_TAG[course.subject] ?? { short: course.subject.toUpperCase().slice(0,6), color:"#6b7280" };
  const isThpt = course.id >= 200;
  const isThcs = course.id >= 100 && course.id < 200;

  const Icon = isThpt ? THPT_ICONS[course.id] : isThcs ? THCS_ICONS[course.id] : null;
  const col  = isThpt ? (THPT_COLORS[course.id] ?? "#990803")
             : isThcs ? (THCS_COLORS[course.id] ?? ct.color)
             : ct.color;

  return (
    <Link to={`/student/courses/${course.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div
        style={{ borderRadius:16, overflow:"hidden", background:"#fff", border:"1px solid #e5e7eb", cursor:"pointer", transition:"box-shadow .15s, transform .15s" }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.09)"; e.currentTarget.style.transform="translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}
      >
        {/* Card header */}
        <div style={{ position:"relative", height:160, overflow:"hidden", background: isThpt ? "#111" : ct.bg }}>
          {isThpt && course.thumbnail ? (
            <>
              <img
                src={course.thumbnail}
                alt={course.name}
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {/* gradient overlay bottom → readable badges + color accent */}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.52) 100%)" }} />
              {/* color bar bottom */}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:col }} />
            </>
          ) : isThpt ? (
            <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#18181b" }}>
              {Icon && <Icon size={38} color="rgba(255,255,255,0.75)" strokeWidth={1.25} />}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:col }} />
            </div>
          ) : isThcs && course.thumbnail ? (
            <>
              <img
                src={course.thumbnail}
                alt={course.name}
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.48) 100%)" }} />
            </>
          ) : isThcs ? (
            <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", borderTop:`3px solid ${col}` }}>
              <div style={{ width:58, height:58, borderRadius:14, background:col+"12", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {Icon && <Icon size={26} color={col} strokeWidth={1.75} />}
              </div>
            </div>
          ) : (
            <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%", background:ct.color+"15" }} />
              <div style={{ position:"absolute", right:20, bottom:-30, width:70, height:70, borderRadius:"50%", background:ct.color+"10" }} />
              <span style={{ fontSize:52, zIndex:1, filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.12))", lineHeight:1 }}>{course.emoji}</span>
            </div>
          )}

          {/* Top-left badges */}
          <div style={{ position:"absolute", top:10, left:10, display:"flex", gap:5, alignItems:"center", zIndex:2 }}>
            <span style={{ fontSize:11, fontWeight:700,
              color:    isThpt ? "#fff"              : isThcs ? col        : "#374151",
              background: isThpt ? "rgba(0,0,0,0.45)" : isThcs ? col+"15" : "rgba(255,255,255,0.88)",
              padding:"2px 8px", borderRadius:5 }}>
              {pct}%
            </span>
            <span style={{ fontSize:10, fontWeight:700,
              color:      isThpt ? "#fff" : isThcs ? "#fff" : "#fff",
              background: isThpt ? col    : isThcs ? col    : ct.color,
              padding:"2px 7px", borderRadius:5 }}>
              {ct.label}
            </span>
          </div>

          {/* Completed check */}
          {course.status === "completed" && (
            <div style={{ position:"absolute", top:10, right:10, zIndex:2, width:22, height:22, borderRadius:"50%", background:"#16a34a", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CheckCircle2 style={{ width:13, height:13, color:"#fff" }} />
            </div>
          )}

          {/* Teacher name overlay bottom-left */}
          {(isThpt || isThcs) && course.thumbnail && (
            <div style={{ position:"absolute", bottom:10, left:12, zIndex:2 }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.85)", fontWeight:500 }}>{course.teacher}</span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding:"14px 16px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background: (isThpt || isThcs) ? col : ct.color, flexShrink:0 }} />
            <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600, letterSpacing:"0.3px" }}>Môn học</span>
          </div>
          <div style={{ fontSize:15, fontWeight:800, color:"#111827", marginBottom:10, lineHeight:1.3 }}>{course.name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            <span style={{ fontSize:10, fontWeight:800, color:subj.color, background:subj.color+"15", padding:"3px 9px", borderRadius:99, letterSpacing:"0.4px" }}>
              {subj.short}
            </span>
            <TagBadge tag={course.tag} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ flex:1, height:4, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${pct}%`, height:"100%", background: course.status==="completed" ? "#16a34a" : ((isThpt || isThcs) ? col : ct.color), borderRadius:99, transition:"width .4s" }} />
            </div>
            <span style={{ fontSize:10, color:"#9ca3af", flexShrink:0 }}>{course.lessonsDone}/{course.lessonsTotal}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function StudentCourseList() {
  const [activeFilter, setActiveFilter] = useState<CTKey | "all">("all");
  const { level } = useGradeLevel();

  const isThcs = level === "thcs";
  const isThpt = level === "thpt";
  const PURCHASED_CTS = isThpt ? THPT_PURCHASED_CTS : isThcs ? THCS_PURCHASED_CTS : TH_PURCHASED_CTS;
  const COURSES = (isThpt ? THPT_ALL_COURSES : isThcs ? THCS_ALL_COURSES : TH_ALL_COURSES).filter(c => PURCHASED_CTS.includes(c.ct));
  const gradeLabel = isThpt ? "Lớp 12A1 – Ban KHTN" : isThcs ? "Lớp 8A3" : "Lớp 3A1";

  const filtered = activeFilter === "all"
    ? COURSES
    : COURSES.filter(c => c.ct === activeFilter);

  const totalCourses     = COURSES.length;
  const completedCourses = COURSES.filter(c => c.status === "completed").length;
  const inProgressCourses= COURSES.filter(c => c.status === "inprogress").length;

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:"#111827" }}>Môn Học STEM</h1>
        <p style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>Các chương trình STEM nhà trường đã đăng ký · {gradeLabel}</p>
      </div>

      {/* Summary chips */}
      <div style={{ display:"flex", gap:10, marginBottom:22, flexWrap:"wrap" }}>
        {[
          { label:"Tổng khóa học", val:totalCourses,      color:"#374151", emoji:"📚" },
          { label:"Đang học",      val:inProgressCourses, color:"#2563eb", emoji:"▶️" },
          { label:"Hoàn thành",    val:completedCourses,  color:"#16a34a", emoji:"✅" },
        ].map(c => (
          <div key={c.label} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:10, background:"#f9fafb", border:"1px solid #e5e7eb" }}>
            <span style={{ fontSize:16 }}>{c.emoji}</span>
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:c.color, lineHeight:1 }}>{c.val}</div>
              <div style={{ fontSize:10, color:"#9ca3af" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CT filter tabs — chỉ hiển thị các CT trường đã mua */}
      <div style={{ display:"flex", gap:6, marginBottom:24, flexWrap:"wrap" }}>
        <button
          onClick={() => setActiveFilter("all")}
          style={{
            padding:"7px 16px", borderRadius:9, border:"none", fontSize:12, fontWeight: activeFilter==="all" ? 800 : 600,
            background: activeFilter==="all" ? "#111827" : "#f3f4f6",
            color: activeFilter==="all" ? "#fff" : "#6b7280",
            cursor:"pointer",
          }}>
          Tất cả ({COURSES.length})
        </button>
        {PURCHASED_CTS.map(ct => {
          const meta  = CT_META[ct];
          const count = COURSES.filter(c => c.ct === ct).length;
          const isActive = activeFilter === ct;
          return (
            <button key={ct} onClick={() => setActiveFilter(ct)} style={{
              padding:"7px 16px", borderRadius:9, border:"none", fontSize:12, fontWeight: isActive ? 800 : 600,
              background: isActive ? meta.color : "#f3f4f6",
              color: isActive ? "#fff" : "#6b7280",
              cursor:"pointer",
              boxShadow: isActive ? `0 2px 8px ${meta.color}40` : "none",
            }}>
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Course grid */}
      {filtered.length > 0 ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
          {filtered.map(course => <CourseCard key={course.id} course={course} />)}
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#9ca3af" }}>
          <div style={{ fontSize:40, marginBottom:8 }}>📭</div>
          <div style={{ fontSize:14, fontWeight:600 }}>Không có khóa học nào</div>
        </div>
      )}
    </div>
  );
}
