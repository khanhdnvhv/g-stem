import { useState } from "react";
import { Link } from "react-router";

/* ════════════════════════════════════════════════════════════════════
   THỜI KHÓA BIỂU MẦM NON
   Layout cũ giữ nguyên · Chỉ icon/emoji dùng sticker style
   ════════════════════════════════════════════════════════════════════ */

type Session = "morning" | "break" | "noon" | "afternoon" | "end";
type Status  = "done" | "current" | "upcoming";

interface Activity {
  id: string; time: string; session: Session;
  name: string; emoji: string; color: string; bg: string;
  status: Status; hasLesson?: boolean;
}

// ─── Sticker icon style ───────────────────────────────────────────────
// Emoji được bọc trong khung sticker: nền solid, viền đen 3px, shadow offset
function StickerIcon({
  emoji, color, size = 72, radius = 20, isDone = false,
}: {
  emoji: string; color: string; size?: number; radius?: number; isDone?: boolean;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: isDone ? "#E8F5E9" : color,
      border: isDone ? "1.5px solid #B0BEC5" : "1.5px solid rgba(0,0,0,0.12)",
      boxShadow: isDone ? "0 2px 8px rgba(0,0,0,0.08)" : "0 4px 14px rgba(0,0,0,0.13)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.54,
    }}>
      {isDone ? "✅" : emoji}
    </div>
  );
}

// ─── Mock schedule data ───────────────────────────────────────────────
const SCHEDULE: Record<number, Activity[]> = {
  2: [
    { id:"mn-201", time:"7:00",  session:"morning",   name:"Chào Cờ & Thể Dục",   emoji:"🏃", color:"#6BCF7F", bg:"#F0FFF4", status:"done" },
    { id:"mn-202", time:"7:30",  session:"morning",   name:"Toán Vui",             emoji:"🔢", color:"#FF9F43", bg:"#FFF5E6", status:"done" },
    { id:"mn-203", time:"8:15",  session:"morning",   name:"Tiếng Việt",           emoji:"📖", color:"#FF8FAB", bg:"#FFF0F5", status:"current", hasLesson:true },
    { id:"mn-204", time:"9:00",  session:"break",     name:"Ăn Sáng & Vui Chơi",  emoji:"🍎", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-205", time:"9:30",  session:"morning",   name:"Mỹ Thuật",             emoji:"🎨", color:"#7c3aed", bg:"#F5F0FF", status:"upcoming", hasLesson:true },
    { id:"mn-206", time:"10:15", session:"morning",   name:"Âm Nhạc",              emoji:"🎵", color:"#74C0FC", bg:"#F0F8FF", status:"upcoming", hasLesson:true },
    { id:"mn-207", time:"11:00", session:"noon",      name:"Ăn Trưa",              emoji:"🍚", color:"#FFA07A", bg:"#FFF5EE", status:"upcoming" },
    { id:"mn-208", time:"11:30", session:"noon",      name:"Ngủ Trưa",             emoji:"😴", color:"#A29BFE", bg:"#F0EEFF", status:"upcoming" },
    { id:"mn-209", time:"14:00", session:"afternoon", name:"Khám Phá",             emoji:"🔍", color:"#FF6B35", bg:"#FFF0E6", status:"upcoming", hasLesson:true },
    { id:"mn-210", time:"14:45", session:"afternoon", name:"Thể Dục Chiều",        emoji:"⚽", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-211", time:"15:30", session:"end",       name:"Ra Về",                emoji:"🏠", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming" },
  ],
  3: [
    { id:"mn-301", time:"7:00",  session:"morning",   name:"Chào Cờ & Thể Dục",   emoji:"🏃", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-302", time:"7:30",  session:"morning",   name:"Tiếng Việt",           emoji:"📖", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming", hasLesson:true },
    { id:"mn-303", time:"8:15",  session:"morning",   name:"Toán Vui",             emoji:"🔢", color:"#FF9F43", bg:"#FFF5E6", status:"upcoming" },
    { id:"mn-304", time:"9:00",  session:"break",     name:"Ăn Sáng & Vui Chơi",  emoji:"🍎", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-305", time:"9:30",  session:"morning",   name:"Thể Dục Vui",          emoji:"⚽", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-306", time:"10:15", session:"morning",   name:"Mỹ Thuật",             emoji:"🎨", color:"#7c3aed", bg:"#F5F0FF", status:"upcoming", hasLesson:true },
    { id:"mn-307", time:"11:00", session:"noon",      name:"Ăn Trưa & Ngủ",       emoji:"😴", color:"#A29BFE", bg:"#F0EEFF", status:"upcoming" },
    { id:"mn-308", time:"14:00", session:"afternoon", name:"Âm Nhạc",              emoji:"🎵", color:"#74C0FC", bg:"#F0F8FF", status:"upcoming", hasLesson:true },
    { id:"mn-309", time:"14:45", session:"afternoon", name:"Khám Phá",             emoji:"🔍", color:"#FF6B35", bg:"#FFF0E6", status:"upcoming" },
    { id:"mn-310", time:"15:30", session:"end",       name:"Ra Về",                emoji:"🏠", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming" },
  ],
  4: [
    { id:"mn-401", time:"7:00",  session:"morning",   name:"Chào Cờ & Thể Dục",   emoji:"🏃", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-402", time:"7:30",  session:"morning",   name:"Âm Nhạc",              emoji:"🎵", color:"#74C0FC", bg:"#F0F8FF", status:"upcoming", hasLesson:true },
    { id:"mn-403", time:"8:15",  session:"morning",   name:"Tiếng Việt",           emoji:"📖", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming" },
    { id:"mn-404", time:"9:00",  session:"break",     name:"Ăn Sáng & Vui Chơi",  emoji:"🍎", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-405", time:"9:30",  session:"morning",   name:"Toán Vui",             emoji:"🔢", color:"#FF9F43", bg:"#FFF5E6", status:"upcoming" },
    { id:"mn-406", time:"10:15", session:"morning",   name:"Khám Phá",             emoji:"🔍", color:"#FF6B35", bg:"#FFF0E6", status:"upcoming", hasLesson:true },
    { id:"mn-407", time:"11:00", session:"noon",      name:"Ăn Trưa & Ngủ",       emoji:"😴", color:"#A29BFE", bg:"#F0EEFF", status:"upcoming" },
    { id:"mn-408", time:"14:00", session:"afternoon", name:"Mỹ Thuật",             emoji:"🎨", color:"#7c3aed", bg:"#F5F0FF", status:"upcoming", hasLesson:true },
    { id:"mn-409", time:"14:45", session:"afternoon", name:"Thể Dục Chiều",        emoji:"⚽", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-410", time:"15:30", session:"end",       name:"Ra Về",                emoji:"🏠", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming" },
  ],
  5: [
    { id:"mn-501", time:"7:00",  session:"morning",   name:"Chào Cờ & Thể Dục",   emoji:"🏃", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-502", time:"7:30",  session:"morning",   name:"Tiếng Việt",           emoji:"📖", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming", hasLesson:true },
    { id:"mn-503", time:"8:15",  session:"morning",   name:"Mỹ Thuật",             emoji:"🎨", color:"#7c3aed", bg:"#F5F0FF", status:"upcoming", hasLesson:true },
    { id:"mn-504", time:"9:00",  session:"break",     name:"Ăn Sáng & Vui Chơi",  emoji:"🍎", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-505", time:"9:30",  session:"morning",   name:"Âm Nhạc",              emoji:"🎵", color:"#74C0FC", bg:"#F0F8FF", status:"upcoming" },
    { id:"mn-506", time:"10:15", session:"morning",   name:"Toán Vui",             emoji:"🔢", color:"#FF9F43", bg:"#FFF5E6", status:"upcoming" },
    { id:"mn-507", time:"11:00", session:"noon",      name:"Ăn Trưa & Ngủ",       emoji:"😴", color:"#A29BFE", bg:"#F0EEFF", status:"upcoming" },
    { id:"mn-508", time:"14:00", session:"afternoon", name:"Thể Dục Vui",          emoji:"⚽", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-509", time:"14:45", session:"afternoon", name:"Khám Phá",             emoji:"🔍", color:"#FF6B35", bg:"#FFF0E6", status:"upcoming" },
    { id:"mn-510", time:"15:30", session:"end",       name:"Ra Về",                emoji:"🏠", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming" },
  ],
  6: [
    { id:"mn-601", time:"7:00",  session:"morning",   name:"Chào Cờ & Thể Dục",   emoji:"🏃", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-602", time:"7:30",  session:"morning",   name:"Toán Vui",             emoji:"🔢", color:"#FF9F43", bg:"#FFF5E6", status:"upcoming" },
    { id:"mn-603", time:"8:15",  session:"morning",   name:"Âm Nhạc",              emoji:"🎵", color:"#74C0FC", bg:"#F0F8FF", status:"upcoming", hasLesson:true },
    { id:"mn-604", time:"9:00",  session:"break",     name:"Ăn Sáng & Vui Chơi",  emoji:"🍎", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-605", time:"9:30",  session:"morning",   name:"Tiếng Việt",           emoji:"📖", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming" },
    { id:"mn-606", time:"10:15", session:"morning",   name:"Thể Dục Vui",          emoji:"⚽", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming" },
    { id:"mn-607", time:"11:00", session:"noon",      name:"Ăn Trưa & Ngủ",       emoji:"😴", color:"#A29BFE", bg:"#F0EEFF", status:"upcoming" },
    { id:"mn-608", time:"14:00", session:"afternoon", name:"Mỹ Thuật",             emoji:"🎨", color:"#7c3aed", bg:"#F5F0FF", status:"upcoming", hasLesson:true },
    { id:"mn-609", time:"14:45", session:"afternoon", name:"Khám Phá Đặc Biệt",   emoji:"🌟", color:"#FF6B35", bg:"#FFF0E6", status:"upcoming" },
    { id:"mn-610", time:"15:30", session:"end",       name:"Cuối Tuần Vui Vẻ!",   emoji:"🎉", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming" },
  ],
  7: [
    { id:"mn-701", time:"7:00",  session:"morning",   name:"Chào Cờ Vui",          emoji:"🚩", color:"#FF6B35", bg:"#FFF0E6", status:"upcoming" },
    { id:"mn-702", time:"7:30",  session:"morning",   name:"Mỹ Thuật Đặc Biệt",   emoji:"🖌️", color:"#7c3aed", bg:"#F5F0FF", status:"upcoming", hasLesson:true },
    { id:"mn-703", time:"8:30",  session:"morning",   name:"Hát Múa Vui",          emoji:"💃", color:"#74C0FC", bg:"#F0F8FF", status:"upcoming", hasLesson:true },
    { id:"mn-704", time:"9:00",  session:"break",     name:"Ăn Sáng & Tiệc Nhỏ",  emoji:"🎂", color:"#FF9F43", bg:"#FFF5E6", status:"upcoming" },
    { id:"mn-705", time:"9:30",  session:"morning",   name:"Ngày Khám Phá Lớn",   emoji:"🌏", color:"#6BCF7F", bg:"#F0FFF4", status:"upcoming", hasLesson:true },
    { id:"mn-706", time:"10:30", session:"morning",   name:"Khen Thưởng Tuần",    emoji:"🏆", color:"#FFD93D", bg:"#FFFCE6", status:"upcoming" },
    { id:"mn-707", time:"11:00", session:"noon",      name:"Ăn Trưa",             emoji:"🍱", color:"#FFA07A", bg:"#FFF5EE", status:"upcoming" },
    { id:"mn-708", time:"15:30", session:"end",       name:"Về Nhà Nghỉ!",         emoji:"🎈", color:"#FF8FAB", bg:"#FFF0F5", status:"upcoming" },
  ],
};

const DAY_CONFIG: Record<number, { label: string; short: string; emoji: string; color: string; bg: string }> = {
  2: { label: "Thứ Hai",  short: "T2", emoji: "🌞", color: "#FF6B35", bg: "#FFF0E6" },
  3: { label: "Thứ Ba",   short: "T3", emoji: "🌸", color: "#FF8FAB", bg: "#FFF0F5" },
  4: { label: "Thứ Tư",   short: "T4", emoji: "⭐", color: "#FFD93D", bg: "#FFFCE6" },
  5: { label: "Thứ Năm",  short: "T5", emoji: "🍀", color: "#6BCF7F", bg: "#F0FFF4" },
  6: { label: "Thứ Sáu",  short: "T6", emoji: "🐳", color: "#74C0FC", bg: "#F0F8FF" },
  7: { label: "Thứ Bảy",  short: "T7", emoji: "🌈", color: "#7c3aed", bg: "#F5F0FF" },
};

const SESSION_CONFIG: Record<Session, { label: string; emoji: string; color: string; grad: string }> = {
  morning:   { label: "Buổi Sáng",  emoji: "🌅", color: "#FF9F43", grad: "linear-gradient(135deg, #FF9F43, #FFD93D)" },
  break:     { label: "Giải Lao",   emoji: "🍎", color: "#6BCF7F", grad: "linear-gradient(135deg, #6BCF7F, #52D68A)" },
  noon:      { label: "Buổi Trưa",  emoji: "😴", color: "#74C0FC", grad: "linear-gradient(135deg, #74C0FC, #A29BFE)" },
  afternoon: { label: "Buổi Chiều", emoji: "⛅", color: "#FF6B35", grad: "linear-gradient(135deg, #FF6B35, #FF8FAB)" },
  end:       { label: "Ra Về",      emoji: "🏠", color: "#A29BFE", grad: "linear-gradient(135deg, #A29BFE, #7c3aed)" },
};

// ─── Day Picker ─────────────────────────────────────────────────────────
function DayPicker({ selected, onChange, todayDay }: {
  selected: number; onChange: (d: number) => void; todayDay: number;
}) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
      {[2,3,4,5,6,7].map(d => {
        const cfg = DAY_CONFIG[d];
        const active = d === selected;
        const isToday = d === todayDay;
        return (
          <button key={d} onClick={() => onChange(d)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            width: 80, padding: "12px 8px",
            borderRadius: 20,
            background: active ? cfg.color : "#fff",
            border: `3px solid ${active ? cfg.color : isToday ? cfg.color + "80" : "#F0F0F0"}`,
            cursor: "pointer",
            boxShadow: active ? `0 8px 24px ${cfg.color}55` : "0 2px 8px rgba(0,0,0,0.06)",
            transform: active ? "translateY(-4px) scale(1.06)" : "none",
            transition: "all 0.2s ease",
            position: "relative",
          }}>
            {isToday && !active && (
              <div style={{
                position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                background: cfg.color, color: "#fff", fontSize: 9, fontWeight: 800,
                padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap",
              }}>HÔM NAY</div>
            )}
            {/* Day emoji dùng StickerIcon nhỏ */}
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: active ? "rgba(255,255,255,0.25)" : cfg.color,
              border: "1.5px solid rgba(0,0,0,0.12)",
              boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26,
            }}>{cfg.emoji}</div>
            <span style={{ fontSize: 15, fontWeight: 900, color: active ? "#fff" : cfg.color }}>{cfg.short}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: active ? "rgba(255,255,255,0.85)" : "#94A3B8", textAlign: "center", lineHeight: 1.2 }}>{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Session Banner ─────────────────────────────────────────────────────
function SessionBanner({ session, timeRange }: { session: Session; timeRange: string }) {
  const cfg = SESSION_CONFIG[session];
  return (
    <div style={{
      background: cfg.grad, borderRadius: 16, padding: "10px 20px",
      display: "flex", alignItems: "center", gap: 12,
      marginBottom: 10, marginTop: 6,
    }}>
      {/* Session emoji → sticker style */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: "#fff", border: "1.5px solid rgba(0,0,0,0.12)",
        boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
      }}>{cfg.emoji}</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{cfg.label}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{timeRange}</div>
      </div>
    </div>
  );
}

// ─── Activity Card ─────────────────────────────────────────────────────
function ActivityCard({ act }: { act: Activity }) {
  const isDone    = act.status === "done";
  const isCurrent = act.status === "current";

  return (
    <div style={{
      background: isDone ? "#F8FAFC" : act.bg,
      border: `3px solid ${isCurrent ? act.color : isDone ? "#E2E8F0" : act.color + "44"}`,
      borderRadius: 24,
      padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 18,
      marginBottom: 10,
      opacity: isDone ? 0.65 : 1,
      position: "relative", overflow: "hidden",
      boxShadow: isCurrent ? `0 8px 28px ${act.color}44` : "0 2px 10px rgba(0,0,0,0.04)",
      transition: "all 0.2s",
    }}>
      {isCurrent && (
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
          borderRadius: 22, boxShadow: `inset 0 0 0 3px ${act.color}`,
          animation: "pulse-ring 2s ease-in-out infinite", pointerEvents: "none",
        }} />
      )}

      {/* Sticker icon */}
      <StickerIcon emoji={act.emoji} color={act.color} size={72} radius={18} isDone={isDone} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 20, fontWeight: 900,
          color: isDone ? "#94A3B8" : "#2D2D2D",
          textDecoration: isDone ? "line-through" : "none",
          marginBottom: 4,
        }}>{act.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: isDone ? "#F1F5F9" : act.color + "18",
            borderRadius: 99, padding: "4px 12px",
          }}>
            <span style={{ fontSize: 14 }}>⏰</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: isDone ? "#94A3B8" : act.color }}>{act.time}</span>
          </div>
          {isCurrent && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#d4183d20", borderRadius: 99, padding: "4px 12px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4183d", display: "inline-block", animation: "blink 1.2s ease-in-out infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#d4183d" }}>ĐANG HỌC</span>
            </div>
          )}
        </div>
        {isCurrent && act.hasLesson && (
          <Link to="/student/lessons" style={{ textDecoration: "none" }}>
            <div style={{
              marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8,
              background: act.color, color: "#fff",
              border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: 16, padding: "10px 22px",
              fontSize: 16, fontWeight: 900,
              boxShadow: "0 4px 14px rgba(0,0,0,0.13)", cursor: "pointer",
            }}>
              <span style={{ fontSize: 20 }}>🚀</span> Vào Học Ngay!
            </div>
          </Link>
        )}
      </div>

      {/* Right badge */}
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        {isDone && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#FFD93D", border: "1.5px solid rgba(0,0,0,0.12)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26,
          }}>⭐</div>
        )}
        {isCurrent && (
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: act.color, border: "1.5px solid rgba(0,0,0,0.12)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26,
          }}>{act.emoji}</div>
        )}
        {act.status === "upcoming" && act.hasLesson && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#fff", border: "1.5px solid rgba(0,0,0,0.12)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>📚</div>
        )}
      </div>
    </div>
  );
}

// ─── Today View ────────────────────────────────────────────────────────
function TodayView({ activities }: { activities: Activity[] }) {
  const groups: { session: Session; acts: Activity[] }[] = [];
  let cur: Session | null = null;
  for (const act of activities) {
    if (act.session !== cur) { groups.push({ session: act.session, acts: [] }); cur = act.session; }
    groups[groups.length - 1].acts.push(act);
  }
  const timeRange = (acts: Activity[]) => {
    if (!acts.length) return "";
    return acts[0].time === acts[acts.length-1].time ? acts[0].time : `${acts[0].time} – ${acts[acts.length-1].time}`;
  };
  return (
    <div>
      {groups.map((g, gi) => (
        <div key={gi}>
          <SessionBanner session={g.session} timeRange={timeRange(g.acts)} />
          {g.acts.map(act => <ActivityCard key={act.id} act={act} />)}
        </div>
      ))}
    </div>
  );
}

// ─── Week View ─────────────────────────────────────────────────────────
function WeekView({ onSelectDay }: { onSelectDay: (d: number) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
      {[2,3,4,5,6,7].map(d => {
        const cfg = DAY_CONFIG[d];
        const acts = SCHEDULE[d]?.filter(a => a.session !== "break" && a.session !== "noon" && a.session !== "end") ?? [];
        return (
          <button key={d} onClick={() => onSelectDay(d)} style={{
            background: cfg.bg, border: `2px solid ${cfg.color}33`,
            borderRadius: 20, padding: "14px 8px",
            cursor: "pointer", textAlign: "center",
            transition: "all 0.18s", boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}>
            <StickerIcon emoji={cfg.emoji} color={cfg.color} size={48} radius={14} />
            <div style={{ fontSize: 14, fontWeight: 900, color: cfg.color, margin: "6px 0 2px" }}>{cfg.short}</div>
            <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 12 }}>{cfg.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {acts.slice(0,4).map(act => (
                <div key={act.id} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "#fff", border: "1.5px solid rgba(0,0,0,0.12)",
                  borderRadius: 10, padding: "5px 8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{act.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#1A1A1A", textAlign: "left", lineHeight: 1.2 }}>{act.name}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 10, fontSize: 11, fontWeight: 700,
              color: cfg.color, background: cfg.color + "18",
              borderRadius: 99, padding: "4px 10px",
            }}>Xem →</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────
function WeekStats({ acts }: { acts: Activity[] }) {
  const done    = acts.filter(a => a.status === "done").length;
  const current = acts.filter(a => a.status === "current").length;
  const remain  = acts.filter(a => a.status === "upcoming").length;
  const stats = [
    { emoji: "✅", label: "Xong rồi!", value: String(done),    color: "#6BCF7F" },
    { emoji: "🔴", label: "Đang học",  value: String(current), color: "#d4183d" },
    { emoji: "📚", label: "Còn lại",   value: String(remain),  color: "#74C0FC" },
    { emoji: "⭐", label: "Sao hôm nay",value: String(done),   color: "#FFD93D" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: "#fff", border: `2px solid ${s.color}33`,
          borderRadius: 18, padding: "14px 12px", textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          {/* Sticker stat icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 15, margin: "0 auto 8px",
            background: s.color, border: "1.5px solid rgba(0,0,0,0.12)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>{s.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#2D2D2D", marginBottom: 3 }}>{s.value}</div>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export function MamNonSchedule() {
  const todayNum  = new Date().getDay();
  const mappedToday = todayNum === 0 ? 7 : todayNum === 1 ? 2 : todayNum + 1;
  const safeToday = mappedToday >= 2 && mappedToday <= 7 ? mappedToday : 2;

  const [selectedDay, setSelectedDay] = useState<number>(safeToday);
  const [view, setView] = useState<"today" | "week">("today");

  const dayCfg  = DAY_CONFIG[selectedDay];
  const dayActs = SCHEDULE[selectedDay] ?? [];
  const isToday = selectedDay === safeToday;

  return (
    <div style={{ background: "#FFFBF0", borderRadius: 28, padding: "28px 24px", fontFamily: "'Nunito','Comic Sans MS',cursive,sans-serif", minHeight: "80vh" }}>

      <style>{`
        @keyframes pulse-ring { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes wiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
      `}</style>

      {/* ── Hero Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${dayCfg.color} 0%, ${dayCfg.color}BB 100%)`,
        borderRadius: 24, padding: "24px 28px", marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 700, marginBottom: 6 }}>
            📅 Thời Khóa Biểu
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 8 }}>
            {isToday ? "Hôm Nay " : ""}{dayCfg.emoji} {dayCfg.label}!
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.92)", fontWeight: 700 }}>
            {dayActs.filter(a => a.status !== "done").length} hoạt động đang chờ con! 🎉
          </div>
        </div>
        {/* Sticker day emoji */}
        <div style={{
          width: 100, height: 100, borderRadius: 28, flexShrink: 0,
          background: "#fff", border: "1.5px solid rgba(0,0,0,0.12)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 56,
          animation: "wiggle 3s ease-in-out infinite",
        }}>{dayCfg.emoji}</div>
      </div>

      {/* ── Stats ── */}
      <WeekStats acts={dayActs} />

      {/* ── Day Picker ── */}
      <DayPicker selected={selectedDay} onChange={setSelectedDay} todayDay={safeToday} />

      {/* ── View Toggle ── */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }}>
        {(["today","week"] as const).map(v => {
          const active = view === v;
          return (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "12px 32px", borderRadius: 18,
              fontSize: 16, fontWeight: 900,
              background: active ? dayCfg.color : "#fff",
              color: active ? "#fff" : dayCfg.color,
              border: `3px solid ${dayCfg.color}`,
              cursor: "pointer",
              boxShadow: active ? `0 6px 20px ${dayCfg.color}44` : "none",
              transition: "all 0.18s",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 20 }}>{v === "today" ? "📋" : "🗓️"}</span>
              {v === "today" ? "Ngày Này" : "Cả Tuần"}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {view === "today" ? (
        <TodayView activities={dayActs} />
      ) : (
        <WeekView onSelectDay={d => { setSelectedDay(d); setView("today"); }} />
      )}

      {/* ── Footer ── */}
      <div style={{
        marginTop: 28, textAlign: "center",
        background: "linear-gradient(135deg, #FF6B3522, #FFD93D22)",
        borderRadius: 20, padding: "18px",
        border: "2px dashed #FF6B3544",
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 18, margin: "0 auto 10px",
          background: "#FFD93D", border: "1.5px solid rgba(0,0,0,0.12)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.13)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34,
        }}>🌟</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#FF6B35", marginBottom: 4 }}>Con học giỏi lắm!</div>
        <div style={{ fontSize: 14, color: "#8B6955", fontWeight: 700 }}>Cố gắng thêm một chút nữa nhé! 💪</div>
      </div>
    </div>
  );
}

export default MamNonSchedule;
