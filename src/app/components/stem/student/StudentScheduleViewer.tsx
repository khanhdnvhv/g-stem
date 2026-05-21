import { useState } from "react";
import { Calendar, Download, LayoutGrid, List, ChevronLeft, ChevronRight, MapPin, User, Clock, BookOpen, X } from "lucide-react";
import { useGradeLevel } from "../../GradeLevelContext";
import { MamNonSchedule } from "./MamNonSchedule";
import { STEMScheduleViewer } from "../teacher/STEMScheduleViewer";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "sonner";

/* ─── Subject meta ───────────────────────────────────────────────────────── */
interface SubjectMeta { color: string; stem?: string }

const SUBJECT: Record<string, SubjectMeta> = {
  // ── Tiểu học ──
  "Toán":           { color: "#990803" },
  "Tiếng Việt":     { color: "#d4183d" },
  "Tiếng Anh":      { color: "#c8a84e" },
  "Khoa Học":       { color: "#16a34a" },
  "Lịch Sử":       { color: "#b45309" },
  "Địa Lý":        { color: "#0891b2" },
  "Mỹ Thuật":      { color: "#ec4899" },
  "Âm Nhạc":       { color: "#2563eb" },
  "Thể Dục":       { color: "#16a34a" },
  "Đạo Đức":       { color: "#7c3aed" },
  "Tự Nhiên & XH": { color: "#0891b2" },
  "Tin Học":        { color: "#6366f1" },
  "Sinh Hoạt":     { color: "#6b7280" },
  "Lập Trình":     { color: "#7c3aed", stem: "CT3" },
  "Robotics":       { color: "#f59e0b", stem: "CT4" },
  // ── THCS ──
  "Ngữ Văn":       { color: "#d4183d" },
  "Vật Lý":        { color: "#2563eb" },
  "Hóa Học":       { color: "#16a34a" },
  "Sinh Học":       { color: "#10b981" },
  "GDCD":           { color: "#7c3aed" },
  "Công Nghệ":     { color: "#64748b" },
  "Python":         { color: "#7c3aed", stem: "CT3" },
  "Toán STEM":      { color: "#990803", stem: "CT1" },
  "Vật Lý STEM":   { color: "#2563eb", stem: "CT1" },
  // ── THPT ──
  "GDQP":           { color: "#64748b" },
  "AI & ML":        { color: "#7c3aed", stem: "CT3" },
  "Lập Trình Web":  { color: "#6366f1", stem: "CT3" },
  "Toán Thống Kê":  { color: "#990803", stem: "CT1" },
  "Vật Lý Nâng Cao":{ color: "#2563eb", stem: "CT4" },
};

/* ─── Week helpers ───────────────────────────────────────────────────────── */
const BASE_WEEK_NUM = 20;
const BASE_WEEK_START = new Date(2026, 4, 18); // Mon 18/05/2026 = Tuần 20

function getWeekLabel(offset: number): string {
  const start = new Date(BASE_WEEK_START);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  const fmt = (d: Date) =>
    `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  return `Tuần ${BASE_WEEK_NUM + offset} · ${fmt(start)} – ${fmt(end)}`;
}

function getWeekDayDate(weekOffset: number, dayIndex: number): string {
  const d = new Date(BASE_WEEK_START);
  d.setDate(d.getDate() + weekOffset * 7 + dayIndex);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

function getTodayDayId(): DayId | null {
  const map: Record<number, DayId> = { 1:"t2", 2:"t3", 3:"t4", 4:"t5", 5:"t6" };
  return map[new Date().getDay()] ?? null;
}

/* ─── Schedule data ──────────────────────────────────────────────────────── */
interface Slot { period: number; subject: string; teacher: string; room: string; lesson?: string }
interface PopoverState { slot: Slot; x: number; y: number }
type DayId = "t2" | "t3" | "t4" | "t5" | "t6"

const SCHEDULE: Record<DayId, Slot[]> = {
  t2: [
    { period:1, subject:"Toán",          teacher:"Cô Lan Anh",    room:"P.201",    lesson:"Phép nhân có nhớ" },
    { period:2, subject:"Tiếng Việt",    teacher:"Cô Thu Hoa",    room:"P.201",    lesson:"Viết đoạn văn miêu tả" },
    { period:3, subject:"Tiếng Anh",     teacher:"Cô Thu Trang",  room:"P.301",    lesson:"Unit 5: My School" },
    { period:4, subject:"Đạo Đức",       teacher:"Cô Lan Anh",    room:"P.201",    lesson:"Kính trọng thầy cô" },
    { period:5, subject:"Thể Dục",       teacher:"Thầy Hùng",     room:"Sân VĐ",   lesson:"Bài tập thể dục buổi sáng" },
  ],
  t3: [
    { period:1, subject:"Tiếng Việt",    teacher:"Cô Thu Hoa",    room:"P.201",    lesson:"Đọc hiểu: Cây tre Việt Nam" },
    { period:2, subject:"Toán",          teacher:"Cô Lan Anh",    room:"P.201",    lesson:"Chia số có hai chữ số" },
    { period:3, subject:"Khoa Học",      teacher:"Thầy Quang",    room:"Lab STEM", lesson:"Nước — Ba trạng thái" },
    { period:4, subject:"Lịch Sử",       teacher:"Cô Ngọc Mai",   room:"P.102",    lesson:"Làng xã Việt Nam xưa" },
    { period:5, subject:"Âm Nhạc",       teacher:"Cô Kim Linh",   room:"P.Nhạc",   lesson:"Bài hát: Quê hương tươi đẹp" },
    { period:6, subject:"Lập Trình",     teacher:"Thầy Minh Đức", room:"Lab IT",   lesson:"Vòng lặp cơ bản trong Scratch" },
    { period:7, subject:"Lập Trình",     teacher:"Thầy Minh Đức", room:"Lab IT",   lesson:"Vòng lặp cơ bản trong Scratch" },
  ],
  t4: [
    { period:1, subject:"Toán",          teacher:"Cô Lan Anh",    room:"P.201",    lesson:"Phép nhân có nhớ" },
    { period:2, subject:"Tiếng Anh",     teacher:"Cô Thu Trang",  room:"P.301",    lesson:"Unit 5: My School" },
    { period:3, subject:"Tiếng Việt",    teacher:"Cô Thu Hoa",    room:"P.201",    lesson:"Viết đoạn văn miêu tả" },
    { period:4, subject:"Tự Nhiên & XH", teacher:"Thầy Quang",    room:"P.201",    lesson:"Các giác quan của cơ thể" },
    { period:5, subject:"Mỹ Thuật",      teacher:"Thầy Hoài",     room:"P.Art",    lesson:"Vẽ tranh phong cảnh làng quê" },
  ],
  t5: [
    { period:1, subject:"Tiếng Việt",    teacher:"Cô Thu Hoa",    room:"P.201",    lesson:"Luyện tập kể chuyện" },
    { period:2, subject:"Toán",          teacher:"Cô Lan Anh",    room:"P.201",    lesson:"Bài toán có lời văn" },
    { period:3, subject:"Tiếng Anh",     teacher:"Cô Thu Trang",  room:"P.301",    lesson:"Unit 5: Speaking practice" },
    { period:4, subject:"Địa Lý",        teacher:"Thầy Hải Đăng", room:"P.103",    lesson:"Đồng bằng sông Cửu Long" },
    { period:5, subject:"Thể Dục",       teacher:"Thầy Hùng",     room:"Sân VĐ",   lesson:"Trò chơi vận động" },
    { period:6, subject:"Robotics",      teacher:"Thầy Hoàng",    room:"P.STEM",   lesson:"Lắp ráp robot di động" },
    { period:7, subject:"Robotics",      teacher:"Thầy Hoàng",    room:"P.STEM",   lesson:"Lắp ráp robot di động" },
  ],
  t6: [
    { period:1, subject:"Tiếng Việt",    teacher:"Cô Thu Hoa",    room:"P.201",    lesson:"Ôn tập cuối tuần" },
    { period:2, subject:"Toán",          teacher:"Cô Lan Anh",    room:"P.201",    lesson:"Ôn tập cuối tuần" },
    { period:3, subject:"Khoa Học",      teacher:"Thầy Quang",    room:"Lab STEM", lesson:"Thí nghiệm: Sự bay hơi của nước" },
    { period:4, subject:"Tin Học",       teacher:"Thầy Minh Đức", room:"P.Máy",    lesson:"Học vẽ bằng Paint" },
    { period:5, subject:"Sinh Hoạt",     teacher:"GVCN",           room:"P.201",    lesson:"Họp lớp — Tổng kết tuần 20" },
  ],
};

const DAYS: { id: DayId; label: string }[] = [
  { id:"t2", label:"Thứ 2" }, { id:"t3", label:"Thứ 3" },
  { id:"t4", label:"Thứ 4" }, { id:"t5", label:"Thứ 5" },
  { id:"t6", label:"Thứ 6" },
];

const PERIOD_TIME: Record<number, string> = {
  1:"07:00", 2:"07:50", 3:"08:40", 4:"09:30", 5:"10:20",
  6:"13:30", 7:"14:20",
};

const ALL_PERIODS = [1,2,3,4,5,6,7];

/* ─── Legend component ───────────────────────────────────────────────────── */
function ScheduleLegend({ schedule }: { schedule: Record<DayId, Slot[]> }) {
  const stem = Array.from(new Set(Object.values(schedule).flat().map(s => s.subject)))
    .filter(name => SUBJECT[name]?.stem);

  if (stem.length === 0) return null;

  return (
    <div className="border-t border-border px-4 py-2.5" style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:"9px", fontWeight:800, color:"#9ca3af", letterSpacing:1, textTransform:"uppercase", flexShrink:0 }}>STEM TC</span>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 8px" }}>
        {stem.map(name => {
          const m = SUBJECT[name]!;
          return (
            <span key={name} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:"11px", fontWeight:600, color:m.color, background:m.color+"15", border:`1px solid ${m.color}30`, padding:"2px 9px", borderRadius:20 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:m.color, display:"inline-block" }} />
              {name}
              <span style={{ fontSize:"9px", fontWeight:800, opacity:0.75 }}>{m.stem}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Week navigator ─────────────────────────────────────────────────────── */
function WeekNav({ weekOffset, setWeekOffset }: { weekOffset: number; setWeekOffset: (fn: (o:number)=>number)=>void }) {
  const isThisWeek = weekOffset === 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      {!isThisWeek && (
        <button
          onClick={() => setWeekOffset(() => 0)}
          style={{ padding:"5px 11px", borderRadius:7, background:"#990803", color:"#fff", border:"none", fontSize:"11px", fontWeight:700, cursor:"pointer" }}
        >
          Tuần này
        </button>
      )}
      <div style={{ display:"flex", alignItems:"center", gap:1, borderRadius:8, padding:3, background:"#f3f4f6" }}>
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          style={{ width:28, height:28, borderRadius:6, border:"none", background:"#fff", color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <ChevronLeft style={{ width:15, height:15 }} />
        </button>
        <span style={{ fontSize:"12px", fontWeight:600, color:"#374151", padding:"0 10px", whiteSpace:"nowrap", minWidth:180, textAlign:"center" }}>
          {getWeekLabel(weekOffset)}
        </span>
        <button
          onClick={() => setWeekOffset(o => o + 1)}
          style={{ width:28, height:28, borderRadius:6, border:"none", background:"#fff", color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <ChevronRight style={{ width:15, height:15 }} />
        </button>
      </div>
    </div>
  );
}

/* ─── Slot popover ───────────────────────────────────────────────────────── */
function SlotPopover({ state, onClose }: { state: PopoverState; onClose: () => void }) {
  const m = SUBJECT[state.slot.subject] ?? { color: "#6b7280" };
  const isStem = !!m.stem;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.min(state.x, vw - 276);
  const top  = state.y + 260 > vh ? state.y - 268 : state.y;

  return (
    <>
      <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={onClose} />
      <div style={{ position:"fixed", left, top, zIndex:50, width:264, background:"#fff", borderRadius:12, boxShadow:"0 12px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #e5e7eb", overflow:"hidden" }}>
        {/* Top accent */}
        <div style={{ height:4, background:m.color }} />
        {/* Header */}
        <div style={{ padding:"12px 14px 10px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <span style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{state.slot.subject}</span>
              {isStem && <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:4, background:m.color, color:"#fff" }}>{m.stem}</span>}
            </div>
            <span style={{ fontSize:11, color:"#9ca3af" }}>Tiết {state.slot.period} · {PERIOD_TIME[state.slot.period]}</span>
          </div>
          <button onClick={onClose} style={{ width:24, height:24, borderRadius:6, border:"none", background:"#f3f4f6", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <X style={{ width:12, height:12, color:"#6b7280" }} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding:"10px 14px 14px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <User style={{ width:13, height:13, color:"#9ca3af", flexShrink:0 }} />
              <span style={{ fontSize:12, color:"#374151" }}>{state.slot.teacher}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <MapPin style={{ width:13, height:13, color:"#9ca3af", flexShrink:0 }} />
              <span style={{ fontSize:12, color:"#374151" }}>{state.slot.room}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Clock style={{ width:13, height:13, color:"#9ca3af", flexShrink:0 }} />
              <span style={{ fontSize:12, color:"#374151" }}>{PERIOD_TIME[state.slot.period]} · 45 phút</span>
            </div>
          </div>
          {state.slot.lesson && (
            <div style={{ padding:"8px 10px", borderRadius:8, background:m.color + "0f", border:`1px solid ${m.color}28`, marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
                <BookOpen style={{ width:11, height:11, color:m.color }} />
                <span style={{ fontSize:10, fontWeight:700, color:m.color, letterSpacing:0.3 }}>Bài học tuần này</span>
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:"#1f2937" }}>{state.slot.lesson}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Week-view cell ─────────────────────────────────────────────────────── */
function WeekCell({ slot, onClick }: { slot?: Slot; onClick?: (slot: Slot, rect: DOMRect) => void }) {
  if (!slot) return null;
  const m = SUBJECT[slot.subject] ?? { color: "#6b7280" };
  const isStem = !!m.stem;

  return (
    <div
      onClick={onClick ? (e) => onClick(slot, (e.currentTarget as HTMLElement).getBoundingClientRect()) : undefined}
      style={{ cursor: onClick ? "pointer" : undefined, borderRadius:4, padding:"1px 0", transition:"background .1s" }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
        <span style={{ fontSize:"12px", fontWeight:700, color:"#111827" }}>{slot.subject}</span>
        {isStem && (
          <span style={{ fontSize:"9px", fontWeight:700, padding:"1px 5px", borderRadius:3, background:m.color, color:"#fff", flexShrink:0 }}>{m.stem}</span>
        )}
      </div>
      <div style={{ fontSize:"10px", color:"#64748b" }}>{slot.room}</div>
      <div style={{ fontSize:"10px", color:"#94a3b8", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{slot.teacher}</div>
    </div>
  );
}

/* ─── Day-view row ───────────────────────────────────────────────────────── */
function DayRow({ slot }: { slot: Slot }) {
  const m = SUBJECT[slot.subject] ?? { color: "#6b7280" };
  const isStem = !!m.stem;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:0, background:"#fff", borderBottom:"1px solid #f3f4f6" }}>
      {/* Period */}
      <div style={{ width:36, height:36, borderRadius:8, flexShrink:0, background:"#f9fafb", border:"1px solid #e5e7eb", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:800, color:"#6b7280", lineHeight:1.3 }}>
        <span>Tiết</span>
        <span style={{ fontSize:15, fontWeight:900, lineHeight:1 }}>{slot.period}</span>
      </div>

      {/* Time */}
      <div style={{ width:44, flexShrink:0 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#374151" }}>{PERIOD_TIME[slot.period]}</div>
        <div style={{ fontSize:9, color:"#9ca3af" }}>45 phút</div>
      </div>

      {/* Subject info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{slot.subject}</span>
          {isStem && (
            <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:4, background:m.color, color:"#fff" }}>{m.stem}</span>
          )}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"2px 12px" }}>
          <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#6b7280" }}>
            <User style={{ width:11, height:11 }} />{slot.teacher}
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#6b7280" }}>
            <MapPin style={{ width:11, height:11 }} />{slot.room}
          </span>
        </div>
      </div>
    </div>
  );
}

const SCHEDULE_THCS: Record<DayId, Slot[]> = {
  t2: [
    { period:1, subject:"Toán",       teacher:"Thầy Minh Khoa",  room:"P.8A3",    lesson:"Phương trình bậc 2 — Công thức nghiệm" },
    { period:2, subject:"Ngữ Văn",    teacher:"Cô Hương Lan",    room:"P.8A3",    lesson:"Đọc hiểu: Lão Hạc" },
    { period:3, subject:"Vật Lý",     teacher:"Thầy Quang Huy",  room:"Lab Lý",   lesson:"Định luật Ôm — Bài tập" },
    { period:4, subject:"Tiếng Anh",  teacher:"Cô Thu Trang",    room:"P.301",    lesson:"Unit 6: The environment" },
    { period:5, subject:"GDCD",        teacher:"Cô Lan Anh",      room:"P.8A3",    lesson:"Quyền và nghĩa vụ công dân" },
  ],
  t3: [
    { period:1, subject:"Ngữ Văn",    teacher:"Cô Hương Lan",    room:"P.8A3",    lesson:"Viết đoạn văn nghị luận" },
    { period:2, subject:"Toán",       teacher:"Thầy Minh Khoa",  room:"P.8A3",    lesson:"Bất phương trình bậc 2" },
    { period:3, subject:"Hóa Học",    teacher:"Cô Bích Ngọc",    room:"Lab Hóa",  lesson:"Tính chất hóa học của Axit" },
    { period:4, subject:"Lịch Sử",    teacher:"Cô Ngọc Mai",     room:"P.102",    lesson:"Phong trào Đồng Khởi" },
    { period:5, subject:"Thể Dục",    teacher:"Thầy Hùng",       room:"Sân VĐ",   lesson:"Bóng đá mini" },
    { period:6, subject:"Python",     teacher:"Thầy Minh Đức",   room:"Lab IT",   lesson:"Hàm và vòng lặp for" },
    { period:7, subject:"Python",     teacher:"Thầy Minh Đức",   room:"Lab IT",   lesson:"Hàm và vòng lặp for" },
  ],
  t4: [
    { period:1, subject:"Vật Lý",     teacher:"Thầy Quang Huy",  room:"Lab Lý",   lesson:"Mạch điện nối tiếp và song song" },
    { period:2, subject:"Tiếng Anh",  teacher:"Cô Thu Trang",    room:"P.301",    lesson:"Reading: Climate change" },
    { period:3, subject:"Ngữ Văn",    teacher:"Cô Hương Lan",    room:"P.8A3",    lesson:"Phân tích nhân vật trong truyện" },
    { period:4, subject:"Sinh Học",   teacher:"Cô Thanh Hà",     room:"Lab Sinh", lesson:"Hệ tuần hoàn máu" },
    { period:5, subject:"Tin Học",    teacher:"Thầy Minh Đức",   room:"P.Máy",    lesson:"Excel: Hàm VLOOKUP" },
  ],
  t5: [
    { period:1, subject:"Toán",       teacher:"Thầy Minh Khoa",  room:"P.8A3",    lesson:"Ôn tập chương III" },
    { period:2, subject:"Hóa Học",    teacher:"Cô Bích Ngọc",    room:"Lab Hóa",  lesson:"Thí nghiệm: Phản ứng trung hòa" },
    { period:3, subject:"Tiếng Anh",  teacher:"Cô Thu Trang",    room:"P.301",    lesson:"Writing: Opinion essay" },
    { period:4, subject:"Địa Lý",     teacher:"Thầy Hải Đăng",   room:"P.103",    lesson:"Địa lý châu Á" },
    { period:5, subject:"Công Nghệ",  teacher:"Thầy Hoàng",      room:"Lab STEM", lesson:"Thiết kế mạch điện đơn giản" },
    { period:6, subject:"Toán STEM",  teacher:"Cô Ngọc Hà",      room:"Lab STEM", lesson:"Thống kê mô tả — Biểu đồ" },
    { period:7, subject:"Toán STEM",  teacher:"Cô Ngọc Hà",      room:"Lab STEM", lesson:"Thống kê mô tả — Biểu đồ" },
  ],
  t6: [
    { period:1, subject:"Ngữ Văn",    teacher:"Cô Hương Lan",    room:"P.8A3",    lesson:"Ôn tập văn học dân gian" },
    { period:2, subject:"Toán",       teacher:"Thầy Minh Khoa",  room:"P.8A3",    lesson:"Kiểm tra 15 phút" },
    { period:3, subject:"Sinh Học",   teacher:"Cô Thanh Hà",     room:"Lab Sinh", lesson:"Quan sát tiêu bản máu" },
    { period:4, subject:"GDCD",        teacher:"Cô Lan Anh",      room:"P.8A3",    lesson:"Trách nhiệm của học sinh" },
    { period:5, subject:"Sinh Hoạt",  teacher:"GVCN",             room:"P.8A3",    lesson:"Họp lớp — Tổng kết tuần 20" },
  ],
};

const SCHEDULE_THPT: Record<DayId, Slot[]> = {
  t2: [
    { period:1, subject:"Toán",         teacher:"Cô Ngọc Hà",     room:"P.12A1",   lesson:"Giới hạn hàm số — Ứng dụng" },
    { period:2, subject:"Ngữ Văn",      teacher:"Cô Hương Lan",   room:"P.12A1",   lesson:"Phân tích bài thơ Tây Tiến" },
    { period:3, subject:"Vật Lý",       teacher:"Thầy Quang Huy", room:"Lab Lý",   lesson:"Dao động điều hòa" },
    { period:4, subject:"Tiếng Anh",    teacher:"Cô Thu Trang",   room:"P.301",    lesson:"Writing: Argumentative essay" },
    { period:5, subject:"GDCD",          teacher:"Cô Lan Anh",     room:"P.12A1",   lesson:"Pháp luật và đời sống" },
    { period:6, subject:"Lập Trình Web", teacher:"Thầy Minh Đức",  room:"Lab IT",   lesson:"React Hooks: useState & useEffect" },
    { period:7, subject:"Lập Trình Web", teacher:"Thầy Minh Đức",  room:"Lab IT",   lesson:"React Hooks: useState & useEffect" },
  ],
  t3: [
    { period:1, subject:"Ngữ Văn",      teacher:"Cô Hương Lan",   room:"P.12A1",   lesson:"Nghị luận xã hội: Môi trường" },
    { period:2, subject:"Toán",         teacher:"Cô Ngọc Hà",     room:"P.12A1",   lesson:"Đạo hàm — Bài tập ứng dụng" },
    { period:3, subject:"Hóa Học",      teacher:"Cô Bích Ngọc",   room:"Lab Hóa",  lesson:"Polime và ứng dụng" },
    { period:4, subject:"Tiếng Anh",    teacher:"Cô Thu Trang",   room:"P.301",    lesson:"Speaking: Debate practice" },
    { period:5, subject:"Thể Dục",      teacher:"Thầy Hùng",      room:"Sân VĐ",   lesson:"Cầu lông" },
    { period:6, subject:"AI & ML",      teacher:"Thầy Tuấn",      room:"Lab IT",   lesson:"Mạng neural cơ bản" },
    { period:7, subject:"AI & ML",      teacher:"Thầy Tuấn",      room:"Lab IT",   lesson:"Mạng neural cơ bản" },
  ],
  t4: [
    { period:1, subject:"Vật Lý",       teacher:"Thầy Quang Huy", room:"Lab Lý",   lesson:"Con lắc lò xo — Năng lượng" },
    { period:2, subject:"Tiếng Anh",    teacher:"Cô Thu Trang",   room:"P.301",    lesson:"Reading: Technology" },
    { period:3, subject:"Ngữ Văn",      teacher:"Cô Hương Lan",   room:"P.12A1",   lesson:"Chiếc thuyền ngoài xa — Phân tích" },
    { period:4, subject:"Hóa Học",      teacher:"Cô Bích Ngọc",   room:"Lab Hóa",  lesson:"Thí nghiệm: Điều chế khí" },
    { period:5, subject:"Tin Học",      teacher:"Thầy Minh Đức",  room:"P.Máy",    lesson:"Cơ sở dữ liệu quan hệ" },
  ],
  t5: [
    { period:1, subject:"Toán",         teacher:"Cô Ngọc Hà",     room:"P.12A1",   lesson:"Tích phân — Ứng dụng tính diện tích" },
    { period:2, subject:"Vật Lý",       teacher:"Thầy Quang Huy", room:"Lab Lý",   lesson:"Thí nghiệm: Dao động con lắc" },
    { period:3, subject:"Hóa Học",      teacher:"Cô Bích Ngọc",   room:"Lab Hóa",  lesson:"Ôn tập chương Polime" },
    { period:4, subject:"Sinh Học",     teacher:"Cô Thanh Hà",    room:"Lab Sinh", lesson:"Di truyền học Mendel" },
    { period:5, subject:"GDQP",         teacher:"Thầy Hùng",      room:"Sân VĐ",   lesson:"Điều lệnh đội ngũ" },
    { period:6, subject:"Toán Thống Kê",teacher:"Cô Ngọc Hà",     room:"Lab STEM", lesson:"Xác suất có điều kiện" },
    { period:7, subject:"Vật Lý Nâng Cao",teacher:"Thầy Quang Huy",room:"Lab Lý",  lesson:"Quang học sóng" },
  ],
  t6: [
    { period:1, subject:"Ngữ Văn",      teacher:"Cô Hương Lan",   room:"P.12A1",   lesson:"Ôn tập cuối kỳ" },
    { period:2, subject:"Toán",         teacher:"Cô Ngọc Hà",     room:"P.12A1",   lesson:"Kiểm tra 1 tiết" },
    { period:3, subject:"Sinh Học",     teacher:"Cô Thanh Hà",    room:"Lab Sinh", lesson:"Đột biến gen và NST" },
    { period:4, subject:"GDCD",          teacher:"Cô Lan Anh",     room:"P.12A1",   lesson:"Hôn nhân và gia đình" },
    { period:5, subject:"Sinh Hoạt",    teacher:"GVCN",            room:"P.12A1",   lesson:"Họp lớp — Tổng kết tuần 20" },
  ],
};

/* ─── Main component ─────────────────────────────────────────────────────── */
function THScheduleViewer() {
  const [view, setView]               = useState<"week" | "day">("week");
  const [weekOffset, setWeekOffset]   = useState(0);
  const [selectedDay, setSelectedDay] = useState<DayId>("t2");

  const weekLabel  = getWeekLabel(weekOffset);
  const isThisWeek = weekOffset === 0;

  const daySlots   = SCHEDULE[selectedDay] ?? [];

  const todayDayId = getTodayDayId();
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const openPopover = (slot: Slot, rect: DOMRect) =>
    setPopover({ slot, x: rect.left, y: rect.bottom + 6 });

  const grid: Record<DayId, Record<number, Slot | undefined>> = {} as never;
  for (const d of DAYS) {
    grid[d.id] = {};
    for (const s of SCHEDULE[d.id] ?? []) grid[d.id][s.period] = s;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Calendar}
        title="Thời Khóa Biểu"
        subtitle={`Lớp 3A · Trường TH Hoa Đồng Nội · ${weekLabel}`}
        accentColor="#990803"
        actions={
          <button
            onClick={() => toast.info("Xuất lịch dạng ICS")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" /> Xuất ICS
          </button>
        }
      />

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg p-1 border border-border bg-secondary/30">
          <button
            onClick={() => setView("week")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all"
            style={{ fontSize:"12px", fontWeight:600, background: view==="week" ? "#990803" : "transparent", color: view==="week" ? "#fff" : "#6b7280", border:"none", cursor:"pointer" }}
          >
            <LayoutGrid style={{ width:14, height:14 }} /> Theo tuần
          </button>
          <button
            onClick={() => setView("day")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all"
            style={{ fontSize:"12px", fontWeight:600, background: view==="day" ? "#990803" : "transparent", color: view==="day" ? "#fff" : "#6b7280", border:"none", cursor:"pointer" }}
          >
            <List style={{ width:14, height:14 }} /> Theo ngày
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <WeekNav weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
        </div>
      </div>

      {/* ══ WEEK VIEW ══════════════════════════════════════════════════════ */}
      {view === "week" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background:"#f1f5f9", borderBottom:"1px solid #e2e8f0" }}>
                <tr>
                  <th style={{ padding:"10px 14px", textAlign:"left", fontSize:"11px", fontWeight:600, color:"#475569", width:72 }}>Tiết</th>
                  {DAYS.map(d => {
                    const isToday = isThisWeek && d.id === todayDayId;
                    return (
                      <th key={d.id} style={{ padding:"10px 14px", textAlign:"left", fontSize:"11px", fontWeight: isToday ? 700 : 600, color: isToday ? "#990803" : "#475569", background: isToday ? undefined : "#dde3ed", borderLeft:"3px solid transparent", borderBottom: isToday ? "2px solid #990803" : "2px solid transparent", paddingBottom: isToday ? 8 : 10 }}>
                        {d.label}
                        {isToday && <span style={{ display:"block", fontSize:"9px", fontWeight:500, color:"#990803", marginTop:1 }}>Hôm nay</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ALL_PERIODS.map((p) => {
                  const isAfternoonStart = p === 6;
                  return (
                    <>
                      {isAfternoonStart && (
                        <tr key="sep">
                          <td colSpan={6} style={{ padding:"4px 14px", background:"#f1f5f9", borderTop:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0" }}>
                            <span style={{ fontSize:"10px", fontWeight:700, color:"#64748b", letterSpacing:1, textTransform:"uppercase" }}>Buổi chiều</span>
                          </td>
                        </tr>
                      )}
                      <tr key={p} style={{ background: p % 2 === 0 ? "#f8fafc" : "#ffffff", borderTop:"1px solid #e2e8f0" }}>
                        <td style={{ padding:"10px 14px", textAlign:"center", background:"#f1f5f9", borderRight:"1px solid #e2e8f0" }}>
                          <div style={{ fontSize:"13px", fontWeight:700, color:"#334155" }}>{p}</div>
                          <div style={{ fontSize:"9px", color:"#94a3b8", marginTop:1 }}>{PERIOD_TIME[p]}</div>
                        </td>
                        {DAYS.map(d => {
                          const slot = grid[d.id][p];
                          const isToday = isThisWeek && d.id === todayDayId;
                          return (
                            <td key={d.id} style={{ padding:"10px 14px", verticalAlign:"top", minWidth:140, background: isToday ? "#fde8e8" : undefined }}>
                              <WeekCell slot={slot} onClick={openPopover} />
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ScheduleLegend schedule={SCHEDULE} />
        </div>
      )}

      {/* ══ DAY VIEW ═══════════════════════════════════════════════════════ */}
      {view === "day" && (
        <div className="space-y-4">
          {/* Day picker */}
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d, di) => {
              const hasStem = (SCHEDULE[d.id]??[]).some(s => SUBJECT[s.subject]?.stem);
              const isSelected = selectedDay === d.id;
              const isToday = isThisWeek && d.id === "t2";
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  style={{
                    padding: "8px 18px", borderRadius: 10, border: `1.5px solid ${isSelected ? "#990803" : "#e5e7eb"}`,
                    background: isSelected ? "#990803" : "#fff",
                    color: isSelected ? "#fff" : "#374151",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    position: "relative",
                  }}
                >
                  {d.label}
                  <span style={{ fontSize: 9, fontWeight: 500, color: isSelected ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
                    {getWeekDayDate(weekOffset, di)}
                  </span>
                  {hasStem && (
                    <span style={{ position:"absolute", top:-5, right:-5, width:14, height:14, borderRadius:"50%", background:"#7c3aed", border:"2px solid #fff", fontSize:7, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>S</span>
                  )}
                  {isToday && !isSelected && (
                    <span style={{ position:"absolute", bottom:-7, left:"50%", transform:"translateX(-50%)", width:5, height:5, borderRadius:"50%", background:"#990803" }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Slot list */}
          <div className="space-y-2">
            {daySlots.filter(s => s.period <= 5).length > 0 && (
              <>
                <div style={{ fontSize:"11px", fontWeight:800, color:"#9ca3af", letterSpacing:1, padding:"4px 2px" }}>🌞 BUỔI SÁNG</div>
                {daySlots.filter(s => s.period <= 5).map((slot, i) => <DayRow key={i} slot={slot} />)}
              </>
            )}
            {daySlots.filter(s => s.period >= 6).length > 0 && (
              <>
                <div style={{ fontSize:"11px", fontWeight:600, color:"#9ca3af", letterSpacing:0.5, padding:"4px 2px", marginTop:8 }}>BUỔI CHIỀU</div>
                {daySlots.filter(s => s.period >= 6).map((slot, i) => <DayRow key={i} slot={slot} />)}
              </>
            )}
            {daySlots.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
                <div style={{ fontSize:14, fontWeight:600 }}>Không có tiết học</div>
              </div>
            )}
          </div>
        </div>
      )}
      {popover && <SlotPopover state={popover} onClose={() => setPopover(null)} />}
    </div>
  );
}

/* ─── THCS Schedule component ────────────────────────────────────────────── */
function THCSScheduleViewer() {
  const [view, setView]               = useState<"week" | "day">("week");
  const [weekOffset, setWeekOffset]   = useState(0);
  const [selectedDay, setSelectedDay] = useState<DayId>("t2");

  const weekLabel  = getWeekLabel(weekOffset);
  const isThisWeek = weekOffset === 0;

  const daySlots   = SCHEDULE_THCS[selectedDay] ?? [];
  void Object.values(SCHEDULE_THCS).flat().filter(s => SUBJECT[s.subject]?.stem).length;
  const todayDayId = getTodayDayId();
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const openPopover = (slot: Slot, rect: DOMRect) =>
    setPopover({ slot, x: rect.left, y: rect.bottom + 6 });

  const grid: Record<DayId, Record<number, Slot | undefined>> = {} as never;
  for (const d of DAYS) {
    grid[d.id] = {};
    for (const s of SCHEDULE_THCS[d.id] ?? []) grid[d.id][s.period] = s;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Calendar}
        title="Thời Khóa Biểu"
        subtitle={`Lớp 8A3 · Trường THCS Nguyễn Trãi · ${weekLabel}`}
        accentColor="#990803"
        actions={
          <button
            onClick={() => toast.info("Xuất lịch dạng ICS")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize:"13px", fontWeight:500 }}
          >
            <Download className="w-4 h-4" /> Xuất ICS
          </button>
        }
      />

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg p-1 border border-border bg-secondary/30">
          <button
            onClick={() => setView("week")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all"
            style={{ fontSize:"12px", fontWeight:600, background:view==="week"?"#990803":"transparent", color:view==="week"?"#fff":"#6b7280", border:"none", cursor:"pointer" }}
          >
            <LayoutGrid style={{ width:14, height:14 }} /> Theo tuần
          </button>
          <button
            onClick={() => setView("day")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all"
            style={{ fontSize:"12px", fontWeight:600, background:view==="day"?"#990803":"transparent", color:view==="day"?"#fff":"#6b7280", border:"none", cursor:"pointer" }}
          >
            <List style={{ width:14, height:14 }} /> Theo ngày
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <WeekNav weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
        </div>
      </div>

      {/* ══ WEEK VIEW ══════════════════════════════════════════════════════ */}
      {view === "week" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background:"#f1f5f9", borderBottom:"1px solid #e2e8f0" }}>
                <tr>
                  <th style={{ padding:"10px 14px", textAlign:"left", fontSize:"11px", fontWeight:600, color:"#475569", width:72 }}>Tiết</th>
                  {DAYS.map(d => {
                    const isToday = isThisWeek && d.id === todayDayId;
                    return (
                      <th key={d.id} style={{ padding:"10px 14px", textAlign:"left", fontSize:"11px", fontWeight: isToday ? 700 : 600, color: isToday ? "#990803" : "#475569", background: isToday ? undefined : "#dde3ed", borderLeft:"3px solid transparent", borderBottom: isToday ? "2px solid #990803" : "2px solid transparent", paddingBottom: isToday ? 8 : 10 }}>
                        {d.label}
                        {isToday && <span style={{ display:"block", fontSize:"9px", fontWeight:500, color:"#990803", marginTop:1 }}>Hôm nay</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ALL_PERIODS.map(p => {
                  const isAfternoonStart = p === 6;
                  return (
                    <>
                      {isAfternoonStart && (
                        <tr key="sep">
                          <td colSpan={6} style={{ padding:"4px 14px", background:"#f1f5f9", borderTop:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0" }}>
                            <span style={{ fontSize:"10px", fontWeight:700, color:"#64748b", letterSpacing:1, textTransform:"uppercase" }}>Buổi chiều</span>
                          </td>
                        </tr>
                      )}
                      <tr key={p} style={{ background: p % 2 === 0 ? "#f8fafc" : "#ffffff", borderTop:"1px solid #e2e8f0" }}>
                        <td style={{ padding:"10px 14px", textAlign:"center", background:"#f1f5f9", borderRight:"1px solid #e2e8f0" }}>
                          <div style={{ fontSize:"13px", fontWeight:700, color:"#334155" }}>{p}</div>
                          <div style={{ fontSize:"9px", color:"#94a3b8", marginTop:1 }}>{PERIOD_TIME[p]}</div>
                        </td>
                        {DAYS.map(d => {
                          const isToday = isThisWeek && d.id === todayDayId;
                          return (
                            <td key={d.id} style={{ padding:"10px 14px", verticalAlign:"top", minWidth:140, background: isToday ? "#fde8e8" : undefined }}>
                              <WeekCell slot={grid[d.id][p]} onClick={openPopover} />
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ScheduleLegend schedule={SCHEDULE_THCS} />
        </div>
      )}

      {/* ══ DAY VIEW ═══════════════════════════════════════════════════════ */}
      {view === "day" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d, di) => {
              const hasStem = (SCHEDULE_THCS[d.id]??[]).some(s => SUBJECT[s.subject]?.stem);
              const isSelected = selectedDay === d.id;
              const isToday = isThisWeek && d.id === "t2";
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  style={{
                    padding:"8px 18px", borderRadius:10, border:`1.5px solid ${isSelected?"#990803":"#e5e7eb"}`,
                    background: isSelected ? "#990803" : "#fff",
                    color: isSelected ? "#fff" : "#374151",
                    fontSize:"13px", fontWeight:700, cursor:"pointer",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                    position:"relative",
                  }}
                >
                  {d.label}
                  <span style={{ fontSize:9, fontWeight:500, color:isSelected?"rgba(255,255,255,0.7)":"#9ca3af" }}>
                    {getWeekDayDate(weekOffset, di)}
                  </span>
                  {hasStem && (
                    <span style={{ position:"absolute", top:-5, right:-5, width:14, height:14, borderRadius:"50%", background:"#990803", border:"2px solid #fff", fontSize:7, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>S</span>
                  )}
                  {isToday && !isSelected && (
                    <span style={{ position:"absolute", bottom:-7, left:"50%", transform:"translateX(-50%)", width:5, height:5, borderRadius:"50%", background:"#990803" }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {daySlots.filter(s => s.period <= 5).length > 0 && (
              <>
                <div style={{ fontSize:"11px", fontWeight:800, color:"#9ca3af", letterSpacing:1, padding:"4px 2px" }}>🌞 BUỔI SÁNG</div>
                {daySlots.filter(s => s.period <= 5).map((slot, i) => <DayRow key={i} slot={slot} />)}
              </>
            )}
            {daySlots.filter(s => s.period >= 6).length > 0 && (
              <>
                <div style={{ fontSize:"11px", fontWeight:600, color:"#9ca3af", letterSpacing:0.5, padding:"4px 2px", marginTop:8 }}>BUỔI CHIỀU</div>
                {daySlots.filter(s => s.period >= 6).map((slot, i) => <DayRow key={i} slot={slot} />)}
              </>
            )}
            {daySlots.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
                <div style={{ fontSize:14, fontWeight:600 }}>Không có tiết học</div>
              </div>
            )}
          </div>
        </div>
      )}
      {popover && <SlotPopover state={popover} onClose={() => setPopover(null)} />}
    </div>
  );
}

/* ─── THPT Schedule component ────────────────────────────────────────────── */
function THPTScheduleViewer() {
  const [view, setView]               = useState<"week" | "day">("week");
  const [weekOffset, setWeekOffset]   = useState(0);
  const [selectedDay, setSelectedDay] = useState<DayId>("t2");

  const weekLabel  = getWeekLabel(weekOffset);
  const isThisWeek = weekOffset === 0;
  const daySlots   = SCHEDULE_THPT[selectedDay] ?? [];
  void Object.values(SCHEDULE_THPT).flat().filter(s => SUBJECT[s.subject]?.stem).length;
  const todayDayId = getTodayDayId();
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const openPopover = (slot: Slot, rect: DOMRect) =>
    setPopover({ slot, x: rect.left, y: rect.bottom + 6 });

  const grid: Record<DayId, Record<number, Slot | undefined>> = {} as never;
  for (const d of DAYS) {
    grid[d.id] = {};
    for (const s of SCHEDULE_THPT[d.id] ?? []) grid[d.id][s.period] = s;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Calendar}
        title="Thời Khóa Biểu"
        subtitle={`Lớp 12A1 · THPT Chu Văn An · ${weekLabel}`}
        accentColor="#990803"
        actions={
          <button
            onClick={() => toast.info("Xuất lịch dạng ICS")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize:"13px", fontWeight:500 }}
          >
            <Download className="w-4 h-4" /> Xuất ICS
          </button>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg p-1 border border-border bg-secondary/30">
          <button onClick={() => setView("week")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all" style={{ fontSize:"12px", fontWeight:600, background:view==="week"?"#990803":"transparent", color:view==="week"?"#fff":"#6b7280", border:"none", cursor:"pointer" }}>
            <LayoutGrid style={{ width:14, height:14 }} /> Theo tuần
          </button>
          <button onClick={() => setView("day")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all" style={{ fontSize:"12px", fontWeight:600, background:view==="day"?"#990803":"transparent", color:view==="day"?"#fff":"#6b7280", border:"none", cursor:"pointer" }}>
            <List style={{ width:14, height:14 }} /> Theo ngày
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <WeekNav weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
        </div>
      </div>

      {/* Week view */}
      {view === "week" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background:"#f1f5f9", borderBottom:"1px solid #e2e8f0" }}>
                <tr>
                  <th style={{ padding:"10px 14px", textAlign:"left", fontSize:"11px", fontWeight:600, color:"#475569", width:72 }}>Tiết</th>
                  {DAYS.map(d => <th key={d.id} className="px-2 py-2.5 text-left text-muted-foreground" style={{ fontSize:"11px", fontWeight:600 }}>{d.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {ALL_PERIODS.map(p => {
                  const isAfternoonStart = p === 6;
                  return (
                    <>
                      {isAfternoonStart && (
                        <tr key="sep">
                          <td colSpan={6} style={{ padding:"4px 14px", background:"#f1f5f9", borderTop:"1px solid #e2e8f0", borderBottom:"1px solid #e2e8f0" }}>
                            <span style={{ fontSize:"10px", fontWeight:700, color:"#64748b", letterSpacing:1, textTransform:"uppercase" }}>Buổi chiều</span>
                          </td>
                        </tr>
                      )}
                      <tr key={p} style={{ background: p % 2 === 0 ? "#f8fafc" : "#ffffff", borderTop:"1px solid #e2e8f0" }}>
                        <td style={{ padding:"10px 14px", textAlign:"center", background:"#f1f5f9", borderRight:"1px solid #e2e8f0" }}>
                          <div style={{ fontSize:"13px", fontWeight:700, color:"#334155" }}>{p}</div>
                          <div style={{ fontSize:"9px", color:"#94a3b8", marginTop:1 }}>{PERIOD_TIME[p]}</div>
                        </td>
                        {DAYS.map(d => {
                          const isToday = isThisWeek && d.id === todayDayId;
                          return (
                            <td key={d.id} style={{ padding:"10px 14px", verticalAlign:"top", minWidth:140, background: isToday ? "#fde8e8" : undefined }}>
                              <WeekCell slot={grid[d.id][p]} onClick={openPopover} />
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ScheduleLegend schedule={SCHEDULE_THPT} />
        </div>
      )}

      {/* Day view */}
      {view === "day" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d, di) => {
              const hasStem = (SCHEDULE_THPT[d.id]??[]).some(s => SUBJECT[s.subject]?.stem);
              const isSelected = selectedDay === d.id;
              const isToday = isThisWeek && d.id === "t2";
              return (
                <button key={d.id} onClick={() => setSelectedDay(d.id)} style={{ padding:"8px 18px", borderRadius:10, border:`1.5px solid ${isSelected?"#990803":"#e5e7eb"}`, background:isSelected?"#990803":"#fff", color:isSelected?"#fff":"#374151", fontSize:"13px", fontWeight:700, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative" }}>
                  {d.label}
                  <span style={{ fontSize:9, fontWeight:500, color:isSelected?"rgba(255,255,255,0.7)":"#9ca3af" }}>
                    {getWeekDayDate(weekOffset, di)}
                  </span>
                  {hasStem && <span style={{ position:"absolute", top:-5, right:-5, width:14, height:14, borderRadius:"50%", background:"#990803", border:"2px solid #fff", fontSize:7, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>S</span>}
                  {isToday && !isSelected && <span style={{ position:"absolute", bottom:-7, left:"50%", transform:"translateX(-50%)", width:5, height:5, borderRadius:"50%", background:"#990803" }} />}
                </button>
              );
            })}
          </div>
          <div className="space-y-2">
            {daySlots.filter(s => s.period <= 5).length > 0 && (
              <>
                <div style={{ fontSize:"11px", fontWeight:800, color:"#9ca3af", letterSpacing:1, padding:"4px 2px" }}>🌞 BUỔI SÁNG</div>
                {daySlots.filter(s => s.period <= 5).map((slot, i) => <DayRow key={i} slot={slot} />)}
              </>
            )}
            {daySlots.filter(s => s.period >= 6).length > 0 && (
              <>
                <div style={{ fontSize:"11px", fontWeight:600, color:"#9ca3af", letterSpacing:0.5, padding:"4px 2px", marginTop:8 }}>BUỔI CHIỀU</div>
                {daySlots.filter(s => s.period >= 6).map((slot, i) => <DayRow key={i} slot={slot} />)}
              </>
            )}
            {daySlots.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
                <div style={{ fontSize:14, fontWeight:600 }}>Không có tiết học</div>
              </div>
            )}
          </div>
        </div>
      )}
      {popover && <SlotPopover state={popover} onClose={() => setPopover(null)} />}
    </div>
  );
}

/* ─── Export ─────────────────────────────────────────────────────────────── */
export function StudentScheduleViewer() {
  const { level } = useGradeLevel();
  if (level === "mamnon")  return <MamNonSchedule />;
  if (level === "tieuhoc") return <THScheduleViewer />;
  if (level === "thcs")    return <THCSScheduleViewer />;
  if (level === "thpt")    return <THPTScheduleViewer />;
  return <STEMScheduleViewer forRole="student" />;
}

export default StudentScheduleViewer;
