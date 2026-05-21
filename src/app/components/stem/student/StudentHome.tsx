import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../AuthContext";
import { useGradeLevel, type GradeLevel } from "../../GradeLevelContext";

/* ════════════════════════════════════════════════════════════════════════════
   STUDENT HOME — 4 cấp học, 4 giao diện hoàn toàn khác nhau
   Mầm Non · Tiểu Học · THCS · THPT
   Cấp học được chọn qua GradeLevelContext (dropdown tên user ở header)
   ════════════════════════════════════════════════════════════════════════════ */

// ─── Shared helpers ────────────────────────────────────────────────────────

function Bar({ value, color, h = 7 }: { value: number; color: string; h?: number }) {
  return (
    <div style={{ background: "#e5e7eb", borderRadius: 99, height: h, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99 }} />
    </div>
  );
}

function Stars({ n, color }: { n: number; color: string }) {
  return (
    <span style={{ letterSpacing: -1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 13, color: i <= n ? color : "#E5E7EB" }}>★</span>
      ))}
    </span>
  );
}

// ─── Hint bar — nhắc user cách đổi cấp học ────────────────────────────────

function LevelHint({ level }: { level: GradeLevel }) {
  const colors: Record<GradeLevel, string> = {
    mamnon: "#990803", tieuhoc: "#990803", thcs: "#990803", thpt: "#990803",
  };
  const labels: Record<GradeLevel, string> = {
    mamnon: "🌈 Mầm Non", tieuhoc: "⭐ Tiểu Học", thcs: "🚀 THCS", thpt: "🎓 THPT",
  };
  const c = colors[level];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: `${c}10`, border: `1px solid ${c}30`,
      borderRadius: 10, padding: "8px 14px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{labels[level]}</span>
        <span style={{ fontSize: 12, color: "#64748B" }}>— Đang xem giao diện cấp này</span>
      </div>
      <span style={{ fontSize: 11, color: "#94A3B8" }}>Click tên bạn ở góc trên phải để đổi cấp học</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   🌈 MẦM NON DASHBOARD — 3-5 tuổi
   Vui nhộn · Nhiều hình · Nút lớn · Ít chữ · Màu tươi
   ════════════════════════════════════════════════════════════════════════════ */

const MN_SUBJECTS = [
  { name: "Toán Vui",   emoji: "🔢", color: "#FF6B35", bg: "#FFF0E6" },
  { name: "Tiếng Việt", emoji: "📖", color: "#FF8FAB", bg: "#FFF0F5" },
  { name: "Mỹ Thuật",  emoji: "🎨", color: "#7c3aed", bg: "#F5F0FF" },
  { name: "Âm Nhạc",   emoji: "🎵", color: "#74C0FC", bg: "#F0F8FF" },
  { name: "Thể Dục",   emoji: "⚽", color: "#6BCF7F", bg: "#F0FFF4" },
  { name: "Khám Phá",  emoji: "🔍", color: "#FFD93D", bg: "#FFFCE6" },
];

const MN_SCHEDULE = [
  { time: "7:30",  label: "Buổi Sáng", emoji: "🌞", items: ["🏃 Thể dục sáng", "🔢 Toán Vui", "📖 Tiếng Việt"] },
  { time: "10:00", label: "Giải Lao",  emoji: "🍎", items: ["🍎 Ăn nhẹ & Vui chơi"] },
  { time: "10:30", label: "Giữa Buổi",emoji: "🎨", items: ["🎨 Mỹ Thuật", "🎵 Âm Nhạc"] },
  { time: "14:00", label: "Chiều",     emoji: "🌤️", items: ["🔍 Khám Phá", "⚽ Thể Dục"] },
];

type MNTab = "topic" | "alphabet" | "phonics" | "math" | "schedule";

interface MNSlot { time: string; label: string; emoji: string; color: string; current?: boolean }

const MN_WEEK: Record<string, MNSlot[]> = {
  t2: [
    {time:"07:00",label:"Đến trường",       emoji:"🏫",color:"#74C0FC"},
    {time:"07:30",label:"Thể dục sáng",     emoji:"🏃",color:"#6BCF7F"},
    {time:"08:00",label:"Toán Vui",         emoji:"🔢",color:"#FF9F43"},
    {time:"08:45",label:"Tiếng Việt",       emoji:"📖",color:"#FF8FAB"},
    {time:"09:30",label:"Ăn nhẹ & Vui chơi",emoji:"🍎",color:"#FFD93D"},
    {time:"10:00",label:"Khoa Học STEM",    emoji:"🔬",color:"#5BB5D5",current:true},
    {time:"10:45",label:"Âm Nhạc",          emoji:"🎵",color:"#7c3aed"},
    {time:"11:30",label:"Ăn trưa",          emoji:"🍱",color:"#FF9F43"},
    {time:"12:00",label:"Ngủ trưa",         emoji:"😴",color:"#A8D8A8"},
    {time:"14:00",label:"Mỹ Thuật",         emoji:"🎨",color:"#7c3aed"},
    {time:"14:45",label:"STEM Kỹ Thuật",    emoji:"🏗️",color:"#FF9F43"},
    {time:"15:30",label:"Vui chơi tự do",   emoji:"⚽",color:"#6BCF7F"},
    {time:"16:30",label:"Về nhà",           emoji:"🏠",color:"#FF8FAB"},
  ],
  t3: [
    {time:"07:00",label:"Đến trường",       emoji:"🏫",color:"#74C0FC"},
    {time:"07:30",label:"Thể dục sáng",     emoji:"🏃",color:"#6BCF7F"},
    {time:"08:00",label:"Tiếng Việt",       emoji:"📖",color:"#FF8FAB"},
    {time:"08:45",label:"Khám Phá Tự Nhiên",emoji:"🔍",color:"#5BB5D5"},
    {time:"09:30",label:"Ăn nhẹ & Vui chơi",emoji:"🍎",color:"#FFD93D"},
    {time:"10:00",label:"Toán Vui",         emoji:"🔢",color:"#FF9F43",current:true},
    {time:"10:45",label:"Mỹ Thuật",         emoji:"🎨",color:"#7c3aed"},
    {time:"11:30",label:"Ăn trưa",          emoji:"🍱",color:"#FF9F43"},
    {time:"12:00",label:"Ngủ trưa",         emoji:"😴",color:"#A8D8A8"},
    {time:"14:00",label:"STEM Khoa Học",    emoji:"🔬",color:"#5BB5D5"},
    {time:"14:45",label:"Thể Dục chiều",    emoji:"⚽",color:"#6BCF7F"},
    {time:"15:30",label:"Vui chơi tự do",   emoji:"🎮",color:"#FF8FAB"},
    {time:"16:30",label:"Về nhà",           emoji:"🏠",color:"#FF8FAB"},
  ],
  t4: [
    {time:"07:00",label:"Đến trường",       emoji:"🏫",color:"#74C0FC"},
    {time:"07:30",label:"Thể dục sáng",     emoji:"🏃",color:"#6BCF7F"},
    {time:"08:00",label:"Âm Nhạc",          emoji:"🎵",color:"#7c3aed"},
    {time:"08:45",label:"Toán Vui",         emoji:"🔢",color:"#FF9F43"},
    {time:"09:30",label:"Ăn nhẹ & Vui chơi",emoji:"🍎",color:"#FFD93D"},
    {time:"10:00",label:"Tiếng Việt",       emoji:"📖",color:"#FF8FAB",current:true},
    {time:"10:45",label:"STEM Công Nghệ",   emoji:"💻",color:"#74C0FC"},
    {time:"11:30",label:"Ăn trưa",          emoji:"🍱",color:"#FF9F43"},
    {time:"12:00",label:"Ngủ trưa",         emoji:"😴",color:"#A8D8A8"},
    {time:"14:00",label:"Vẽ & Nặn",        emoji:"🖌️",color:"#7c3aed"},
    {time:"14:45",label:"Kể Chuyện",        emoji:"📚",color:"#FF8FAB"},
    {time:"15:30",label:"Vui chơi tự do",   emoji:"⚽",color:"#6BCF7F"},
    {time:"16:30",label:"Về nhà",           emoji:"🏠",color:"#FF8FAB"},
  ],
  t5: [
    {time:"07:00",label:"Đến trường",       emoji:"🏫",color:"#74C0FC"},
    {time:"07:30",label:"Thể dục sáng",     emoji:"🏃",color:"#6BCF7F"},
    {time:"08:00",label:"STEM Toán Học",    emoji:"🔢",color:"#FF9F43"},
    {time:"08:45",label:"Âm Nhạc",          emoji:"🎵",color:"#7c3aed"},
    {time:"09:30",label:"Ăn nhẹ & Vui chơi",emoji:"🍎",color:"#FFD93D"},
    {time:"10:00",label:"Khoa Học STEM",    emoji:"🔬",color:"#5BB5D5",current:true},
    {time:"10:45",label:"Tiếng Việt",       emoji:"📖",color:"#FF8FAB"},
    {time:"11:30",label:"Ăn trưa",          emoji:"🍱",color:"#FF9F43"},
    {time:"12:00",label:"Ngủ trưa",         emoji:"😴",color:"#A8D8A8"},
    {time:"14:00",label:"STEM Kỹ Thuật",    emoji:"🏗️",color:"#FF9F43"},
    {time:"14:45",label:"Mỹ Thuật",         emoji:"🎨",color:"#7c3aed"},
    {time:"15:30",label:"Vui chơi tự do",   emoji:"⚽",color:"#6BCF7F"},
    {time:"16:30",label:"Về nhà",           emoji:"🏠",color:"#FF8FAB"},
  ],
  t6: [
    {time:"07:00",label:"Đến trường",       emoji:"🏫",color:"#74C0FC"},
    {time:"07:30",label:"Thể dục sáng",     emoji:"🏃",color:"#6BCF7F"},
    {time:"08:00",label:"Ôn Bài Tuần",      emoji:"📝",color:"#FF8FAB"},
    {time:"09:00",label:"Ăn nhẹ & Vui chơi",emoji:"🍎",color:"#FFD93D"},
    {time:"09:30",label:"STEM Tổng Hợp",    emoji:"🌟",color:"#5BB5D5",current:true},
    {time:"10:30",label:"Âm Nhạc & Vũ Điệu",emoji:"🎶",color:"#7c3aed"},
    {time:"11:30",label:"Ăn trưa",          emoji:"🍱",color:"#FF9F43"},
    {time:"12:00",label:"Ngủ trưa",         emoji:"😴",color:"#A8D8A8"},
    {time:"14:00",label:"Biểu Diễn Văn Nghệ",emoji:"🎭",color:"#E8748A"},
    {time:"15:00",label:"Tổng Kết Tuần 🏆", emoji:"🏆",color:"#FFD93D"},
    {time:"15:30",label:"Vui chơi tự do",   emoji:"🎈",color:"#6BCF7F"},
    {time:"16:30",label:"Về nhà",           emoji:"🏠",color:"#FF8FAB"},
  ],
};

const MN_DAYS = [
  {id:"t2",label:"Thứ 2",emoji:"🌟"},
  {id:"t3",label:"Thứ 3",emoji:"🎈"},
  {id:"t4",label:"Thứ 4",emoji:"⭐"},
  {id:"t5",label:"Thứ 5",emoji:"🌸"},
  {id:"t6",label:"Thứ 6",emoji:"🎉"},
];

const MN_IN_PROGRESS = {
  title: "Động Vật Quanh Em", subtitle: "Bạn bốn chân, hai cánh",
  chars: ["🐶","🐱","🐰"], color: "#FF9F43", grad: "linear-gradient(145deg,#FF9F43,#F7C674)",
  done: 1, total: 5,
};

function MamNonDashboard({ name }: { name: string }) {
  const [activeTab, setActiveTab] = useState<MNTab>("topic");
  const [selectedDay, setSelectedDay] = useState("t2");
  const navigate = useNavigate();
  const firstName = name.split(" ").pop() || name;

  const TOPICS = [
    { id:"learn",    en:"HỌC",                   chars:["📖","✏️","🎒"], color:"#5BB5D5", grad:"linear-gradient(145deg,#5BB5D5,#7ECFCE)", done:12, total:19, link:"/student/lessons"  },
    { id:"exam",     en:"THI",                   chars:["📝","🏆","⭐"], color:"#E8748A", grad:"linear-gradient(145deg,#E8748A,#F4A0B0)", done:3,  total:10, link:"/student/exams"    },
    { id:"school",   en:"GIỚI THIỆU VỀ TRƯỜNG",  chars:["🏫","🌸","🎨"], color:"#68B984", grad:"linear-gradient(145deg,#68B984,#95D5A5)", done:0,  total:5,  link:"/student/lessons"  },
    { id:"schedule", en:"LỊCH HỌC",              chars:["📅","🕐","📆"], color:"#FF6B35", grad:"linear-gradient(145deg,#FF6B35,#FF9F43)", done:3,  total:7,  link:"/student/schedule" },
  ];

  const TABS: { id: MNTab; label: string; emoji: string; color: string }[] = [
    { id:"topic",    label:"Chủ Đề",  emoji:"📚", color:"#FF9F43" },
    { id:"alphabet", label:"Chữ Cái", emoji:"🔤", color:"#7c3aed" },
    { id:"phonics",  label:"Âm Học",  emoji:"🎤", color:"#6BCF7F" },
    { id:"math",     label:"Toán",    emoji:"🔢", color:"#74C0FC" },
  ];

  const ALPHA_COLORS = ["#FF8FAB","#FFD93D","#6BCF7F","#74C0FC","#7c3aed","#FF9F43"];

  return (
    <div style={{
      background: "linear-gradient(180deg, #87CEEB 0%, #B5E0F5 55%, #A8D8A8 100%)",
      borderRadius: 24, minHeight: "85vh", padding: "24px 20px 28px",
      fontFamily: "'Nunito','Comic Sans MS',cursive,sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes float-cloud { 0%,100%{transform:translateX(0)} 50%{transform:translateX(14px)} }
        @keyframes bounce-char { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spin-slow   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes plane-fly   { 0%{transform:translateX(0) rotate(-10deg)} 100%{transform:translateX(18px) rotate(5deg)} }
      `}</style>

      {/* ── Clouds ── */}
      {[
        { w:110, h:42, top:18,  left:"6%",  delay:"0s"   },
        { w:75,  h:30, top:52,  left:"22%", delay:"1.8s" },
        { w:90,  h:36, top:12,  right:"12%",delay:"0.9s" },
        { w:60,  h:24, top:62,  right:"5%", delay:"2.4s" },
      ].map((c,i) => (
        <div key={i} style={{
          position:"absolute", width:c.w, height:c.h, pointerEvents:"none",
          top:c.top, left:(c as any).left, right:(c as any).right,
          background:"rgba(255,255,255,0.9)", borderRadius:999,
          boxShadow:"0 4px 16px rgba(0,0,0,0.06)",
          animation:`float-cloud 4s ease-in-out infinite`,
          animationDelay:c.delay,
        }} />
      ))}

      {/* ── Paper planes ── */}
      <div style={{position:"absolute",top:28,left:"42%",fontSize:26,opacity:0.65,animation:"plane-fly 3s ease-in-out infinite alternate",pointerEvents:"none"}}>✈️</div>
      <div style={{position:"absolute",top:80,right:"28%",fontSize:20,opacity:0.5,animation:"plane-fly 4s ease-in-out infinite alternate-reverse",pointerEvents:"none"}}>✈️</div>

      {/* ── Stars ── */}
      {[{t:95,l:"62%"},{t:42,l:"72%"},{t:110,l:"18%"}].map((s,i)=>(
        <div key={i} style={{position:"absolute",top:s.t,left:s.l,fontSize:16,opacity:0.7,pointerEvents:"none"}}>⭐</div>
      ))}

      {/* ── Top greeting pill ── */}
      <div style={{textAlign:"center", marginBottom:20, position:"relative", zIndex:10}}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:10,
          background:"rgba(255,255,255,0.88)", borderRadius:99,
          padding:"10px 26px", backdropFilter:"blur(8px)",
          border:"3px solid rgba(255,255,255,0.95)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
        }}>
          <span style={{fontSize:30}}>👋</span>
          <span style={{fontSize:22,fontWeight:900,color:"#FF6B35"}}>Chào Bé </span>
          <span style={{fontSize:22,fontWeight:900,color:"#1A1A1A"}}>{firstName}!</span>
          <div style={{display:"flex",gap:2,marginLeft:4}}>
            {"⭐⭐⭐⭐⭐".split("").filter((_,i)=>i%2===0).map((s,i)=>(
              <span key={i} style={{fontSize:18}}>{s}</span>
            ))}
          </div>
          <div style={{
            background:"#FF6B35", color:"#fff", borderRadius:99,
            padding:"3px 12px", fontSize:13, fontWeight:900,
          }}>58 ⭐</div>
        </div>
      </div>

      {/* ── Main scene: left deco + wooden frame + right deco ── */}
      <div style={{display:"flex",gap:14,alignItems:"flex-end",position:"relative",zIndex:10}}>

        {/* Left decoration */}
        <div style={{flexShrink:0,width:88,display:"flex",flexDirection:"column",alignItems:"center",gap:6,paddingBottom:4}}>
          <div style={{
            width:64,height:74,borderRadius:16,marginBottom:4,
            background:"#FF8FAB",border:"4px solid #fff",
            boxShadow:"0 4px 14px rgba(0,0,0,0.18)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:40,fontWeight:900,color:"#fff",
            textShadow:"2px 2px 0 rgba(0,0,0,0.15)",
            fontFamily:"'Nunito',cursive",
          }}>A</div>
          <div style={{fontSize:64,lineHeight:1}}>🏠</div>
          <div style={{display:"flex",gap:2}}>
            <span style={{fontSize:38,animation:"bounce-char 2s ease-in-out infinite"}}>👧</span>
            <span style={{fontSize:34,animation:"bounce-char 2s ease-in-out 0.5s infinite"}}>👦</span>
          </div>
        </div>

        {/* ── Wooden frame ── */}
        <div style={{
          flex:1,
          background:"#D4892A",
          borderRadius:28, padding:10,
          boxShadow:"0 8px 0 #A0621A, 0 14px 36px rgba(0,0,0,0.22)",
        }}>
          <div style={{background:"#FFF9F0",borderRadius:20,overflow:"hidden"}}>

            {/* Frame top bar */}
            <div style={{
              background:"linear-gradient(135deg,#f59e0b,#f59e0b)",
              padding:"12px 20px",
              display:"flex",alignItems:"center",justifyContent:"space-between",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{
                  width:40,height:40,borderRadius:12,
                  background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:24,border:"2px solid rgba(255,255,255,0.5)",
                }}>🐝</div>
                <div>
                  <div style={{fontSize:16,fontWeight:900,color:"#fff",lineHeight:1.1}}>GELEXIMCO STEM</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:700}}>Mầm Non · Chương trình học vui</div>
                </div>
                <div style={{background:"#FFD93D",borderRadius:99,padding:"2px 10px",fontSize:11,fontWeight:900,color:"#1A1A1A",marginLeft:6}}>
                  BASIC
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.2)",borderRadius:99,padding:"6px 14px"}}>
                <span style={{fontSize:20}}>⭐</span>
                <span style={{fontSize:18,fontWeight:900,color:"#FFD93D"}}>58</span>
              </div>
            </div>

            {/* ── In-progress lesson banner ── */}
            <div style={{background:"#FFF3E6",padding:"12px 16px",borderBottom:"2px solid #F0E6D0",display:"flex",alignItems:"center",gap:12}}>
              <div style={{
                width:52,height:52,borderRadius:14,flexShrink:0,
                background:MN_IN_PROGRESS.grad,
                border:"1.5px solid rgba(0,0,0,0.12)",boxShadow:"0 4px 16px rgba(0,0,0,0.13)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
              }}>
                {MN_IN_PROGRESS.chars[0]}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:"#FF6B35",display:"inline-block",flexShrink:0}}/>
                  <span style={{fontSize:11,fontWeight:900,color:"#FF6B35"}}>Đang học dang dở...</span>
                </div>
                <div style={{fontSize:14,fontWeight:900,color:"#1A1A1A",marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{MN_IN_PROGRESS.title}</div>
                <div style={{background:"#E0D4C8",borderRadius:99,height:6,overflow:"hidden"}}>
                  <div style={{width:`${Math.round(MN_IN_PROGRESS.done/MN_IN_PROGRESS.total*100)}%`,height:"100%",background:MN_IN_PROGRESS.color,borderRadius:99}}/>
                </div>
                <div style={{fontSize:10,color:MN_IN_PROGRESS.color,fontWeight:800,marginTop:2}}>
                  {MN_IN_PROGRESS.done}/{MN_IN_PROGRESS.total} bài · {Math.round(MN_IN_PROGRESS.done/MN_IN_PROGRESS.total*100)}%
                </div>
              </div>
              <button
                onClick={() => navigate("/student/lessons", { state: { autoPlay: true } })}
                style={{
                  flexShrink:0,background:MN_IN_PROGRESS.color,color:"#fff",
                  border:"1.5px solid rgba(0,0,0,0.12)",boxShadow:"0 4px 16px rgba(0,0,0,0.13)",
                  borderRadius:16,padding:"10px 16px",
                  fontSize:13,fontWeight:900,cursor:"pointer",
                  fontFamily:"'Nunito',cursive",
                  display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",
                }}>
                <span style={{fontSize:16}}>▶</span> Tiếp tục!
              </button>
            </div>

            {/* Tabs */}
            <div style={{background:"#fff",padding:"10px 16px",display:"flex",gap:8,borderBottom:"2px solid #F0E6D0"}}>
              {TABS.map(t => {
                const active = activeTab === t.id;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                    padding:"8px 20px",borderRadius:99,
                    fontSize:14,fontWeight:900,fontFamily:"'Nunito',cursive",
                    background: active ? t.color : "#F5F5F5",
                    color: active ? "#fff" : "#999",
                    border: "none", cursor:"pointer",
                    boxShadow: active ? `0 4px 14px ${t.color}55` : "none",
                    transition:"all 0.15s",
                    display:"flex",alignItems:"center",gap:6,
                  }}>
                    <span style={{fontSize:16}}>{t.emoji}</span>{t.label}
                  </button>
                );
              })}
            </div>

            {/* ── Topic tab ── */}
            {activeTab === "topic" && (
              <div style={{padding:16,display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
                {TOPICS.map(topic => {
                  const pct = Math.round(topic.done / topic.total * 100);
                  return (
                    <Link key={topic.id} to={topic.link} style={{textDecoration:"none"}}>
                      <div style={{
                        borderRadius:20,overflow:"hidden",
                        boxShadow:"0 4px 18px rgba(0,0,0,0.13)",
                        cursor:"pointer",transition:"transform 0.15s",
                      }}>
                        {/* Thumbnail */}
                        <div style={{
                          background:topic.grad,
                          height:150,display:"flex",alignItems:"center",justifyContent:"center",
                          position:"relative",overflow:"hidden",gap:6,
                        }}>
                          {/* Big floating characters */}
                          {topic.chars.map((ch,ci) => (
                            <span key={ci} style={{
                              fontSize: 44 + ci * 6, lineHeight:1,
                              filter:"drop-shadow(2px 4px 6px rgba(0,0,0,0.22))",
                              animation:`bounce-char ${2 + ci * 0.4}s ease-in-out ${ci * 0.3}s infinite`,
                            }}>{ch}</span>
                          ))}
                          {/* Bubble dots deco */}
                          {[[8,8],[88,12],[16,88]].map(([x,y],i)=>(
                            <div key={i} style={{position:"absolute",left:x,top:y,width:12,height:12,borderRadius:"50%",background:"rgba(255,255,255,0.35)"}}/>
                          ))}
                        </div>
                        {/* Card footer */}
                        <div style={{background:"#fff",padding:"12px 16px"}}>
                          <div style={{fontSize:15,fontWeight:900,color:"#1A1A1A",marginBottom:3}}>{topic.en}</div>
                          <div style={{fontSize:11,color:"#999",marginBottom:8,fontWeight:600}}>{topic.done}/{topic.total} bài hoàn thành</div>
                          <div style={{background:"#EEE",borderRadius:99,height:7,overflow:"hidden"}}>
                            <div style={{width:`${pct}%`,height:"100%",background:topic.color,borderRadius:99,transition:"width 0.6s ease"}}/>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ── Alphabet tab ── */}
            {activeTab === "alphabet" && (
              <div style={{padding:"20px 18px"}}>
                <div style={{fontSize:22,fontWeight:900,color:"#7c3aed",marginBottom:16}}>🔤 Học Bảng Chữ Cái A–Z</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch,i)=>(
                    <button key={ch} style={{
                      background: ALPHA_COLORS[i % ALPHA_COLORS.length],
                      border:"1.5px solid rgba(0,0,0,0.12)", borderRadius:14,
                      padding:"12px 6px",
                      fontSize:22,fontWeight:900,color:"#fff",
                      boxShadow:"0 4px 14px rgba(0,0,0,0.13)",cursor:"pointer",
                      fontFamily:"'Nunito',cursive",
                      textShadow:"1px 1px 0 rgba(0,0,0,0.2)",
                      transition:"transform 0.1s",
                    }}>{ch}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Phonics tab ── */}
            {activeTab === "phonics" && (
              <div style={{padding:"20px 18px"}}>
                <div style={{fontSize:22,fontWeight:900,color:"#6BCF7F",marginBottom:16}}>🎤 Luyện Âm Cơ Bản</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[
                    {sound:"BA",emoji:"🎈",color:"#FF8FAB"},{sound:"BE",emoji:"🐝",color:"#FFD93D"},
                    {sound:"BI",emoji:"🎵",color:"#74C0FC"},{sound:"BO",emoji:"🎁",color:"#6BCF7F"},
                    {sound:"CA",emoji:"🐱",color:"#7c3aed"},{sound:"CO",emoji:"🌽",color:"#FF9F43"},
                    {sound:"DA",emoji:"💃",color:"#FF8FAB"},{sound:"DO",emoji:"🎯",color:"#74C0FC"},
                  ].map(p=>(
                    <button key={p.sound} style={{
                      background:p.color,border:"1.5px solid rgba(0,0,0,0.12)",
                      borderRadius:18,padding:"18px 12px",textAlign:"center",
                      cursor:"pointer",boxShadow:"0 4px 14px rgba(0,0,0,0.13)",
                      fontFamily:"'Nunito',cursive",
                    }}>
                      <div style={{fontSize:38,marginBottom:6}}>{p.emoji}</div>
                      <div style={{fontSize:22,fontWeight:900,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,0.2)"}}>{p.sound}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Math tab ── */}
            {activeTab === "math" && (
              <div style={{padding:"20px 18px"}}>
                <div style={{fontSize:22,fontWeight:900,color:"#74C0FC",marginBottom:16}}>🔢 Học Toán Vui</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                  {[
                    {n:1,e:"🍎",c:"#FF8FAB"},{n:2,e:"🍊",c:"#FF9F43"},{n:3,e:"🍇",c:"#7c3aed"},
                    {n:4,e:"⭐",c:"#FFD93D"},{n:5,e:"🌸",c:"#FF8FAB"},{n:6,e:"🎈",c:"#74C0FC"},
                    {n:7,e:"🌟",c:"#FFD93D"},{n:8,e:"🎵",c:"#6BCF7F"},{n:9,e:"🏆",c:"#FF9F43"},
                    {n:10,e:"🎉",c:"#FF6B35"},
                  ].map(item=>(
                    <button key={item.n} style={{
                      background:item.c,border:"1.5px solid rgba(0,0,0,0.12)",
                      borderRadius:18,padding:"14px 8px",textAlign:"center",
                      cursor:"pointer",boxShadow:"0 4px 14px rgba(0,0,0,0.13)",
                      fontFamily:"'Nunito',cursive",
                    }}>
                      <div style={{fontSize:32,marginBottom:4}}>{item.e}</div>
                      <div style={{fontSize:26,fontWeight:900,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,0.2)"}}>{item.n}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
        {/* End wooden frame */}

        {/* Right decoration */}
        <div style={{flexShrink:0,width:88,display:"flex",flexDirection:"column",alignItems:"center",gap:6,paddingBottom:4}}>
          <div style={{
            width:64,height:74,borderRadius:16,marginBottom:4,
            background:"#FF6B35",border:"4px solid #fff",
            boxShadow:"0 4px 14px rgba(0,0,0,0.18)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:40,fontWeight:900,color:"#fff",
            textShadow:"2px 2px 0 rgba(0,0,0,0.15)",
            fontFamily:"'Nunito',cursive",
          }}>C</div>
          <div style={{fontSize:64,lineHeight:1}}>🏡</div>
          <span style={{fontSize:42,animation:"bounce-char 2s ease-in-out 0.7s infinite"}}>🧒</span>
        </div>

      </div>
      {/* End main scene */}

      {/* ── Schedule section ── */}
      <div style={{marginTop:20,position:"relative",zIndex:10}}>
        <style>{`
          @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.4)} }
        `}</style>

        {/* Section header */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:12,
        }}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:"rgba(255,255,255,0.88)",borderRadius:99,
            padding:"8px 20px",backdropFilter:"blur(8px)",
            border:"1.5px solid rgba(255,255,255,0.9)",
            boxShadow:"0 4px 14px rgba(0,0,0,0.08)",
          }}>
            <span style={{fontSize:20}}>📅</span>
            <span style={{fontSize:16,fontWeight:900,color:"#FF6B35"}}>Thời Khóa Biểu Tuần</span>
          </div>

          {/* Day pills */}
          <div style={{display:"flex",gap:6}}>
            {MN_DAYS.map(d => {
              const sel = selectedDay === d.id;
              return (
                <button key={d.id} onClick={() => setSelectedDay(d.id)} style={{
                  padding:"6px 14px",borderRadius:99,
                  background: sel ? "#FF6B35" : "rgba(255,255,255,0.82)",
                  color: sel ? "#fff" : "#666",
                  border: sel ? "1.5px solid rgba(255,107,53,0.5)" : "1.5px solid rgba(255,255,255,0.9)",
                  boxShadow: sel ? "0 4px 12px rgba(255,107,53,0.35)" : "0 2px 8px rgba(0,0,0,0.07)",
                  fontSize:13,fontWeight:900,cursor:"pointer",
                  fontFamily:"'Nunito',cursive",
                  display:"flex",alignItems:"center",gap:5,
                  transition:"all 0.15s",
                }}>
                  <span style={{fontSize:14}}>{d.emoji}</span>{d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity list — horizontal scroll on small screens */}
        <div style={{
          background:"rgba(255,255,255,0.82)",
          borderRadius:20,
          border:"1.5px solid rgba(255,255,255,0.95)",
          boxShadow:"0 6px 24px rgba(0,0,0,0.1)",
          backdropFilter:"blur(8px)",
          overflow:"hidden",
        }}>
          {(MN_WEEK[selectedDay] ?? []).map((slot, i, arr) => (
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"11px 18px",
              background: slot.current ? `${slot.color}14` : "transparent",
              borderLeft: slot.current ? `4px solid ${slot.color}` : "4px solid transparent",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
              transition:"background 0.15s",
            }}>
              {/* Emoji icon */}
              <div style={{
                width:38,height:38,borderRadius:12,flexShrink:0,
                background:`${slot.color}20`,
                border:`1.5px solid ${slot.color}40`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:20,
              }}>{slot.emoji}</div>

              {/* Time */}
              <div style={{
                fontSize:13,fontWeight:900,color:"#888",
                minWidth:44,flexShrink:0,
              }}>{slot.time}</div>

              {/* Label */}
              <div style={{
                flex:1,fontSize:14,fontWeight:900,
                color: slot.current ? slot.color : "#222",
              }}>{slot.label}</div>

              {/* Current badge */}
              {slot.current && (
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <div style={{
                    width:8,height:8,borderRadius:"50%",
                    background:slot.color,
                    animation:"pulse-dot 1.4s ease-in-out infinite",
                  }}/>
                  <span style={{
                    fontSize:11,fontWeight:900,color:slot.color,
                    background:`${slot.color}18`,
                    padding:"3px 10px",borderRadius:99,
                    border:`1px solid ${slot.color}44`,
                  }}>Đang học</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tagline ── */}
      <div style={{textAlign:"center",marginTop:24,position:"relative",zIndex:10}}>
        <div style={{
          display:"inline-block",
          background:"rgba(255,255,255,0.88)",borderRadius:20,
          padding:"14px 32px",backdropFilter:"blur(8px)",
        }}>
          <div style={{fontSize:24,fontWeight:900,color:"#FF6B35",marginBottom:3}}>🌟 CHƠI ĐỂ HỌC VUI!</div>
          <div style={{fontSize:13,color:"#888",fontWeight:600}}>Khám phá thế giới cùng Geleximco STEM! 🚀</div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ⭐ TIỂU HỌC DASHBOARD — 6-10 tuổi
   Năng động · Gamification nhẹ · Progress · Huy chương
   ════════════════════════════════════════════════════════════════════════════ */

const TH_SUBJECTS = [
  // CT1 — STEM tích hợp trong môn học (GV bộ môn dạy theo phương pháp STEM)
  { courseId: 1, ct: "CT1", name: "Toán Tư Duy",       icon: "🔢", tag: "MATH",     color: "#990803", bg: "#FFF8F8", desc: "Phép tính, tư duy logic & giải toán có lời văn",  progress: 78, total: 24, next: "Phép nhân có nhớ",    teacher: "Cô Lan Anh"    },
  { courseId: 2, ct: "CT1", name: "Tiếng Việt STEM",   icon: "📖", tag: "VĂN",      color: "#d4183d", bg: "#FFF8F8", desc: "Đọc hiểu, kể chuyện sáng tạo theo chủ đề STEM",  progress: 92, total: 20, next: "Nhà khoa học nhí",    teacher: "Cô Thu Hoa"    },
  { courseId: 3, ct: "CT1", name: "Khoa Học TN",       icon: "🔬", tag: "SCIENCE",  color: "#16a34a", bg: "#F0FDF4", desc: "Khám phá thiên nhiên, thực nghiệm & quan sát",    progress: 65, total: 20, next: "Nước — Ba trạng thái", teacher: "Thầy Quang"   },
  { courseId: 4, ct: "CT1", name: "Tiếng Anh STEM",    icon: "🌐", tag: "ENGLISH",  color: "#c8a84e", bg: "#FFFBEB", desc: "Giao tiếp tiếng Anh qua các chủ đề khoa học vui", progress: 88, total: 22, next: "My Robot Friend",     teacher: "Cô Thu Trang"  },
  // CT3 — STEM tăng cường, đổi mới sáng tạo (học buổi 2, xếp TKB riêng)
  { courseId: 7, ct: "CT3", name: "Lập Trình Scratch", icon: "💻", tag: "SÁNG TẠO", color: "#7c3aed", bg: "#F5F3FF", desc: "Tạo game & hoạt hình bằng lập trình kéo-thả",     progress: 42, total: 18, next: "Vòng lặp cơ bản",   teacher: "Thầy Minh Đức" },
  // CT4 — Robotics / AI / IoT
  { courseId: 9, ct: "CT4", name: "Robotics Nhí",      icon: "🤖", tag: "ROBOT",    color: "#f59e0b", bg: "#FFFBEB", desc: "Lắp ráp robot & lập trình chuyển động cơ bản",    progress: 55, total: 16, next: "Xây cầu từ que",     teacher: "Thầy Việt"     },
];

const TH_TODAY = [
  { name: "Toán",       color: "#990803", period: 1, time: "7:00" },
  { name: "Tiếng Việt", color: "#d4183d", period: 2, time: "7:50" },
  { name: "Tiếng Anh", color: "#c8a84e", period: 3, time: "8:40" },
  { name: "Khoa Học",  color: "#16A34A", period: 4, time: "9:30" },
  { name: "Thể Dục",   color: "#990803", period: 5, time: "10:20" },
];

const TH_BADGES = [
  { icon: "🥇", label: "Siêu Sao Toán",  desc: "Làm đúng 20 bài",    color: "#c8a84e" },
  { icon: "🔥", label: "Lửa 7 Ngày",    desc: "Không nghỉ 1 tuần",   color: "#f59e0b" },
  { icon: "📗", label: "Mọt Sách",       desc: "Đọc xong 15 bài",     color: "#16A34A" },
  { icon: "🌟", label: "Học Giỏi",       desc: "GPA trên 9.0",        color: "#990803" },
];

const TH_IN_PROGRESS = {
  title: "Phép nhân có nhớ",
  sub: "Toán Tư Duy · STEM MATH · Bài 4/8",
  color: "#990803",
  grad: "linear-gradient(145deg,#7a0602,#990803)",
  icon: "🔢",
  tag: "MATH",
  done: 3,
  total: 8,
  courseId: 1,   // Toán Tư Duy STEM
  lessonId: 19,  // Phép nhân có nhớ (nâng cao) — bài đang học
};

const TH_WEEK: Record<string, { time: string; name: string; teacher: string; color: string; room: string; current?: boolean }[]> = {
  t2: [
    { time:"07:00", name:"Toán",        teacher:"Cô Lan Anh",    color:"#990803", room:"P.201", current:true },
    { time:"07:50", name:"Tiếng Việt",  teacher:"Cô Thu Hoa",    color:"#d4183d", room:"P.201" },
    { time:"08:40", name:"Tiếng Anh",   teacher:"Cô Thu Trang",  color:"#c8a84e", room:"P.301" },
    { time:"09:30", name:"Khoa Học",    teacher:"Thầy Quang",    color:"#16A34A", room:"P.Lab" },
    { time:"10:20", name:"Thể Dục",     teacher:"Thầy Hùng",     color:"#990803", room:"Sân VĐ" },
  ],
  t3: [
    { time:"07:00", name:"Tiếng Việt",  teacher:"Cô Thu Hoa",    color:"#d4183d", room:"P.201" },
    { time:"07:50", name:"Toán",        teacher:"Cô Lan Anh",    color:"#990803", room:"P.201" },
    { time:"08:40", name:"Lịch Sử",     teacher:"Cô Ngọc Mai",   color:"#f59e0b", room:"P.102" },
    { time:"09:30", name:"Mỹ Thuật",    teacher:"Thầy Hoài",     color:"#7c3aed", room:"P.Art" },
    { time:"10:20", name:"Âm Nhạc",     teacher:"Cô Kim Linh",   color:"#2563eb", room:"P.Nhạc" },
  ],
  t4: [
    { time:"07:00", name:"Tiếng Anh",   teacher:"Cô Thu Trang",  color:"#c8a84e", room:"P.301" },
    { time:"07:50", name:"Toán",        teacher:"Cô Lan Anh",    color:"#990803", room:"P.201" },
    { time:"08:40", name:"Khoa Học",    teacher:"Thầy Quang",    color:"#16A34A", room:"P.Lab" },
    { time:"09:30", name:"Tiếng Việt",  teacher:"Cô Thu Hoa",    color:"#d4183d", room:"P.201" },
    { time:"10:20", name:"Địa Lý",      teacher:"Thầy Hải Đăng", color:"#990803", room:"P.103" },
  ],
  t5: [
    { time:"07:00", name:"Lịch Sử",     teacher:"Cô Ngọc Mai",   color:"#f59e0b", room:"P.102" },
    { time:"07:50", name:"Tiếng Anh",   teacher:"Cô Thu Trang",  color:"#c8a84e", room:"P.301" },
    { time:"08:40", name:"Toán",        teacher:"Cô Lan Anh",    color:"#990803", room:"P.201" },
    { time:"09:30", name:"Âm Nhạc",     teacher:"Cô Kim Linh",   color:"#2563eb", room:"P.Nhạc" },
    { time:"10:20", name:"Thể Dục",     teacher:"Thầy Hùng",     color:"#990803", room:"Sân VĐ" },
  ],
  t6: [
    { time:"07:00", name:"Toán",        teacher:"Cô Lan Anh",    color:"#990803", room:"P.201" },
    { time:"07:50", name:"Tiếng Việt",  teacher:"Cô Thu Hoa",    color:"#d4183d", room:"P.201" },
    { time:"08:40", name:"Địa Lý",      teacher:"Thầy Hải Đăng", color:"#990803", room:"P.103" },
    { time:"09:30", name:"Mỹ Thuật",    teacher:"Thầy Hoài",     color:"#7c3aed", room:"P.Art" },
    { time:"10:20", name:"Sinh Hoạt",   teacher:"GVCN",          color:"#64748B", room:"P.201" },
  ],
};

const TH_DAYS = [
  { id:"t2", label:"Thứ 2" },
  { id:"t3", label:"Thứ 3" },
  { id:"t4", label:"Thứ 4" },
  { id:"t5", label:"Thứ 5" },
  { id:"t6", label:"Thứ 6" },
];

function TieuHocDashboard({ name }: { name: string }) {
  const [selectedDay, setSelectedDay] = useState("t2");
  const navigate = useNavigate();
  const firstName = name.split(" ").pop() || name;

  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", background: "#FFF8F8", borderRadius: 20, overflow: "hidden" }}>
      <style>{`
        @keyframes th-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.35)} }
        @keyframes th-glow     { 0%,100%{box-shadow:0 0 8px rgba(252,211,77,0.5)} 50%{box-shadow:0 0 24px rgba(252,211,77,0.95)} }
        @keyframes th-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes th-cta-bump { 0%,100%{box-shadow:0 6px 0 #7a0602,0 8px 20px rgba(153,8,3,0.45)} 50%{box-shadow:0 8px 0 #7a0602,0 12px 28px rgba(153,8,3,0.6)} }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #99080320",
        borderBottom: "3px solid #990803",
        padding: "20px 24px 18px", position: "relative", overflow: "hidden",
        borderRadius: "20px 20px 0 0",
      }}>
        <div style={{ position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(153,8,3,0.03)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",bottom:-20,left:80,width:90,height:90,borderRadius:"50%",background:"rgba(153,8,3,0.03)",pointerEvents:"none" }}/>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, position:"relative" }}>
          {/* Left */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:56,height:56,borderRadius:"50%",
              background:"linear-gradient(135deg,#990803,#c8a84e)",
              border:"2.5px solid #99080330",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:30,flexShrink:0,animation:"th-float 3s ease-in-out infinite",
              boxShadow:"0 4px 14px rgba(153,8,3,0.2)",
            }}>👦</div>
            <div>
              <div style={{ fontSize:11,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4 }}>Thứ Hai · 18/05/2026</div>
              <div style={{ fontSize:23,fontWeight:900,color:"#111827",lineHeight:1.1 }}>Chào {firstName}! 👋</div>
              <div style={{ fontSize:13,color:"#6b7280",fontWeight:700,marginTop:4 }}>Lớp 3A1 · Nhà Khoa Học Nhí 🔬</div>
            </div>
          </div>

          {/* Right: stats + mascot */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {[
              { icon:"⚡", val:"285", sub:"Điểm XP",        color:"#d97706" },
              { icon:"🔥", val:"7",   sub:"Ngày liên tiếp", color:"#f59e0b" },
              { icon:"🏅", val:"18",  sub:"Huy chương",     color:"#7c3aed" },
            ].map(s => (
              <div key={s.sub} style={{
                background:`${s.color}0d`,
                border:`1.5px solid ${s.color}30`,borderRadius:16,
                padding:"10px 14px",textAlign:"center",
              }}>
                <div style={{ fontSize:20 }}>{s.icon}</div>
                <div style={{ fontSize:19,fontWeight:900,color:s.color }}>{s.val}</div>
                <div style={{ fontSize:9,color:"#9ca3af",fontWeight:700 }}>{s.sub}</div>
              </div>
            ))}

            {/* Mascot */}
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5,marginLeft:4 }}>
              <div style={{
                width:66,height:66,borderRadius:"50%",
                background:"rgba(153,8,3,0.07)",border:"2px solid rgba(153,8,3,0.18)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:36,boxShadow:"0 4px 14px rgba(153,8,3,0.1)",
                animation:"th-float 2.4s ease-in-out infinite",
              }}>🤖</div>
              <div style={{
                background:"#990803",borderRadius:10,
                padding:"3px 9px",fontSize:10,fontWeight:900,color:"#fff",
                whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(153,8,3,0.3)",
              }}>Trợ Lý STEM!</div>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:7 }}>
            <span style={{ fontSize:12,color:"#6b7280",fontWeight:700 }}>
              ⚡ Nhà Khoa Học Nhí <span style={{color:"#990803",fontWeight:900}}>→ Nhà Khoa Học Xuất Sắc</span>
            </span>
            <span style={{ fontSize:12,color:"#d97706",fontWeight:900 }}>285 / 400 XP</span>
          </div>
          <div style={{ background:"#f3f4f6",borderRadius:99,height:12,overflow:"hidden" }}>
            <div style={{ width:"71%",height:"100%",background:"linear-gradient(90deg,#FCD34D,#F59E0B)",borderRadius:99,animation:"th-glow 2.5s ease-in-out infinite" }}/>
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",marginTop:5 }}>
            <span style={{ fontSize:11,color:"#9ca3af",fontWeight:600 }}>71% — Cố lên! 💪</span>
          </div>
        </div>
      </div>

      {/* ── CTA banner ── */}
      <div
        onClick={() => navigate(`/student/lessons/${TH_IN_PROGRESS.courseId}/${TH_IN_PROGRESS.lessonId}`)}
        style={{
          background:"#fff",
          border:"1.5px solid #e5e7eb",
          borderRadius:16,
          padding:"14px 18px",marginBottom:20,
          display:"flex",alignItems:"center",gap:14,
          boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
          cursor:"pointer",
          transition:"box-shadow 0.15s,border-color 0.15s",
        }}
        onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 4px 16px rgba(153,8,3,0.07)"; e.currentTarget.style.borderColor="#fca5a5"; }}
        onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor="#e5e7eb"; }}
      >
        <div style={{
          width:52,height:52,borderRadius:16,flexShrink:0,
          background:TH_IN_PROGRESS.grad,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
          boxShadow:"0 2px 8px rgba(0,0,0,0.12)",
        }}>{TH_IN_PROGRESS.icon}</div>

        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#f59e0b",animation:"th-pulse 1.5s ease-in-out infinite" }}/>
            <span style={{ fontSize:11,fontWeight:700,color:"#92400e" }}>Đang học dang dở</span>
            <span style={{ fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99,background:"#fef3c7",color:"#92400e",border:"1px solid #fde68a" }}>STEM {TH_IN_PROGRESS.tag}</span>
          </div>
          <div style={{ fontSize:15,fontWeight:800,color:"#111827",marginBottom:7,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{TH_IN_PROGRESS.title}</div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ flex:1,background:"#f1f5f9",borderRadius:99,height:6,overflow:"hidden" }}>
              <div style={{ width:`${Math.round(TH_IN_PROGRESS.done/TH_IN_PROGRESS.total*100)}%`,height:"100%",background:"linear-gradient(90deg,#990803,#dc2626)",borderRadius:99 }}/>
            </div>
            <span style={{ fontSize:12,fontWeight:600,color:"#6b7280",flexShrink:0 }}>{TH_IN_PROGRESS.done}/{TH_IN_PROGRESS.total} bài</span>
          </div>
        </div>

        {/* Subtle CTA */}
        <div style={{
          flexShrink:0,display:"flex",alignItems:"center",gap:6,
          background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:10,
          padding:"9px 16px",color:"#990803",fontSize:13,fontWeight:700,whiteSpace:"nowrap",
        }}>
          Tiếp tục
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>

      {/* ── Main: Left + Right ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 270px", gap:18, marginBottom:20 }}>

        {/* Left: STEM subjects */}
        <div>
          <div style={{ fontSize:16,fontWeight:900,color:"#1E293B",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}>
            <span style={{fontSize:22}}>🔬</span> Môn Học STEM
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {TH_SUBJECTS.map(s => {
              const done   = Math.round(s.progress * s.total / 100);
              const status = s.progress >= 100 ? "Hoàn thành" : s.stars >= 4 ? "Yêu thích" : s.stars === 3 ? "Đang học" : "Mới";
              const stStyle: Record<string,{bg:string;color:string;icon:string}> = {
                "Yêu thích":  { bg:"#fffbeb", color:"#d97706", icon:"⭐" },
                "Đang học":   { bg:"#eff6ff", color:"#2563eb", icon:"▶" },
                "Mới":        { bg:"#f5f3ff", color:"#7c3aed", icon:"📖" },
                "Hoàn thành": { bg:"#f0fdf4", color:"#16a34a", icon:"✓"  },
              };
              const st = stStyle[status];
              return (
                <Link key={s.name} to={`/student/courses/${s.courseId}`} style={{ textDecoration:"none", display:"block" }}>
                  <div
                    style={{ borderRadius:18, overflow:"hidden", background:"#fff", border:"1px solid #e5e7eb", cursor:"pointer", transition:"box-shadow .15s,transform .15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 8px 28px ${s.color}22`; e.currentTarget.style.transform="translateY(-3px)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}
                  >
                    {/* ── Header: pastel bg + circles + big emoji ── */}
                    <div style={{ position:"relative", height:140, overflow:"hidden", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%", background:s.color+"18" }}/>
                      <div style={{ position:"absolute", right:20, bottom:-30, width:70, height:70, borderRadius:"50%", background:s.color+"10" }}/>
                      <span style={{ fontSize:56, zIndex:1, filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.13))", lineHeight:1 }}>{s.icon}</span>
                      {/* badges */}
                      <div style={{ position:"absolute", top:10, left:10, display:"flex", gap:5, alignItems:"center", zIndex:2 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#374151", background:"rgba(255,255,255,0.9)", padding:"2px 8px", borderRadius:6 }}>{s.progress}%</span>
                        <span style={{ fontSize:10, fontWeight:800, color:"#fff", background:s.color, padding:"2px 8px", borderRadius:6 }}>{s.ct}</span>
                      </div>
                      {s.progress >= 100 && (
                        <div style={{ position:"absolute", top:10, right:10, zIndex:2, width:22, height:22, borderRadius:"50%", background:"#16a34a", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:900 }}>✓</div>
                      )}
                    </div>

                    {/* ── Body ── */}
                    <div style={{ padding:"14px 16px 16px" }}>
                      {/* Dot label */}
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                        <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600, letterSpacing:"0.3px" }}>Môn học</span>
                      </div>
                      {/* Name */}
                      <div style={{ fontSize:15, fontWeight:800, color:"#111827", marginBottom:5, lineHeight:1.3 }}>{s.name}</div>
                      {/* Teacher */}
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
                        <span style={{ fontSize:12 }}>👩‍🏫</span>
                        <span style={{ fontSize:11, color:"#6b7280" }}>{s.teacher}</span>
                      </div>
                      {/* Tags */}
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                        <span style={{ fontSize:10, fontWeight:800, color:s.color, background:s.color+"18", padding:"3px 9px", borderRadius:99 }}>{s.tag}</span>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:700, color:st.color, background:st.bg, padding:"3px 8px", borderRadius:99 }}>
                          {st.icon} {status}
                        </span>
                      </div>
                      {/* Description */}
                      <div style={{ fontSize:11, color:"#6b7280", lineHeight:1.5, marginBottom:8 }}>{s.desc}</div>
                      {/* Progress */}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: s.progress < 100 ? 8 : 0 }}>
                        <div style={{ flex:1, height:5, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ width:`${s.progress}%`, height:"100%", background: s.progress>=100 ? "#16a34a" : s.color, borderRadius:99, transition:"width .4s" }}/>
                        </div>
                        <span style={{ fontSize:10, color:"#9ca3af", flexShrink:0 }}>{done}/{s.total} bài</span>
                      </div>
                      {/* Next lesson */}
                      {s.progress < 100 && (
                        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:8, background:`${s.color}08`, border:`1px solid ${s.color}20` }}>
                          <span style={{ fontSize:10, color:s.color, fontWeight:800 }}>▶</span>
                          <span style={{ fontSize:11, color:s.color, fontWeight:600, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.next}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* TKB hôm nay */}
          <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #E2E8F0", overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ background:"linear-gradient(135deg,#FFF8F8,rgba(153,8,3,0.1))",padding:"12px 16px",borderBottom:"1.5px solid rgba(153,8,3,0.1)",display:"flex",alignItems:"center",gap:8 }}>
              <span style={{fontSize:18}}>📅</span>
              <span style={{ fontSize:14,fontWeight:900,color:"#7a0602" }}>Lịch Hôm Nay — Thứ 2</span>
            </div>
            {TH_TODAY.map((s,i) => (
              <div key={s.name} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderLeft:`4px solid ${i===0?s.color:"transparent"}`,background:i===0?`${s.color}08`:"transparent",borderBottom:"1px solid #F1F5F9" }}>
                <div style={{ width:34,height:34,borderRadius:10,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:s.color,flexShrink:0 }}>T{s.period}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:800,color:"#1E293B" }}>{s.name}</div>
                  <div style={{ fontSize:11,color:"#64748B",fontWeight:600 }}>{s.time}{i===0?" · 🔴 Đang học":""}</div>
                </div>
                {i===0&&<div style={{ width:8,height:8,borderRadius:"50%",background:s.color,animation:"th-pulse 1.4s ease-in-out infinite",flexShrink:0 }}/>}
              </div>
            ))}
          </div>

          {/* STEM Challenge */}
          <div style={{ background:"linear-gradient(135deg,#fff5f5,#fee2e2)",borderRadius:16,border:"1.5px solid #fca5a5",padding:"14px 16px",boxShadow:"0 4px 16px rgba(153,8,3,0.08)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <span style={{fontSize:24}}>🎯</span>
              <div>
                <div style={{ fontSize:13,fontWeight:900,color:"#990803" }}>STEM Challenge Hôm Nay</div>
                <div style={{ fontSize:10,fontWeight:700,color:"#b91c1c" }}>+50 XP nếu hoàn thành!</div>
              </div>
            </div>
            <div style={{ fontSize:13,fontWeight:600,color:"#7f1d1d",marginBottom:12,lineHeight:1.5 }}>
              🌡️ Đo nhiệt độ nước nóng &amp; lạnh, vẽ biểu đồ so sánh kết quả!
            </div>
            <button onClick={() => navigate("/student/challenge")} style={{ width:"100%",background:"linear-gradient(135deg,#7a0602,#990803)",color:"#fff",border:"none",borderRadius:12,padding:"10px",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 0 #5a0401" }}>🚀 Bắt Đầu Thử Thách!</button>
          </div>

          {/* Huy chương */}
          <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #E2E8F0", overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",padding:"12px 16px",borderBottom:"1.5px solid #FEF9C3",display:"flex",alignItems:"center",gap:8 }}>
              <span style={{fontSize:18}}>🏆</span>
              <span style={{ fontSize:14,fontWeight:900,color:"#c8a84e" }}>Huy Chương</span>
            </div>
            {TH_BADGES.map((b, i) => (
              <div key={b.label} style={{ display:"flex",gap:12,padding:"10px 16px",alignItems:"center",borderBottom:i<TH_BADGES.length-1?"1px solid #F8FAFC":"none" }}>
                <div style={{ width:38,height:38,borderRadius:12,flexShrink:0,background:`${b.color}15`,border:`1.5px solid ${b.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize:13,fontWeight:800,color:"#1E293B" }}>{b.label}</div>
                  <div style={{ fontSize:11,color:"#94A3B8",fontWeight:600 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TKB Tuần ── */}
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontSize:16, fontWeight:900, color:"#1E293B", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{fontSize:20}}>📅</span> Thời Khóa Biểu Tuần
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {TH_DAYS.map(d => {
              const sel = selectedDay === d.id;
              return (
                <button key={d.id} onClick={() => setSelectedDay(d.id)} style={{
                  padding:"6px 16px", borderRadius:99,
                  background: sel ? "#990803" : "#fff",
                  color: sel ? "#fff" : "#64748B",
                  border: sel ? "1.5px solid #7a0602" : "1.5px solid #E2E8F0",
                  boxShadow: sel ? "0 4px 12px rgba(153,8,3,0.28)" : "0 1px 4px rgba(0,0,0,0.06)",
                  fontSize:13, fontWeight:900, cursor:"pointer",
                  fontFamily:"'Nunito',sans-serif",
                  transition:"all 0.15s",
                }}>{d.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #E2E8F0", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          {/* Table head */}
          <div style={{
            display:"grid", gridTemplateColumns:"80px 1fr 130px 80px",
            padding:"10px 18px", background:"#F8FAFC", borderBottom:"1.5px solid #E2E8F0",
          }}>
            {["Giờ học","Môn học","Giáo viên","Phòng"].map(h => (
              <span key={h} style={{ fontSize:11, fontWeight:800, color:"#94A3B8", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</span>
            ))}
          </div>
          {(TH_WEEK[selectedDay] ?? []).map((slot, i, arr) => (
            <div key={i} style={{
              display:"grid", gridTemplateColumns:"80px 1fr 130px 80px",
              padding:"12px 18px", alignItems:"center",
              background: slot.current ? `${slot.color}08` : "transparent",
              borderLeft: slot.current ? `4px solid ${slot.color}` : "4px solid transparent",
              borderBottom: i < arr.length-1 ? "1px solid #F1F5F9" : "none",
            }}>
              {/* Time chip */}
              <div style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                background:`${slot.color}14`, border:`1.5px solid ${slot.color}28`,
                borderRadius:10, padding:"4px 10px",
                fontSize:12, fontWeight:900, color:slot.color,
              }}>{slot.time}</div>

              {/* Subject */}
              <div>
                <div style={{ fontSize:14, fontWeight:800, color: slot.current ? slot.color : "#1E293B" }}>
                  {slot.name}
                  {slot.current && (
                    <span style={{
                      marginLeft:8, fontSize:10, fontWeight:900, color:slot.color,
                      background:`${slot.color}18`, padding:"2px 8px", borderRadius:99,
                      border:`1px solid ${slot.color}30`,
                    }}>Đang học</span>
                  )}
                </div>
              </div>

              {/* Teacher */}
              <div style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>{slot.teacher}</div>

              {/* Room */}
              <div style={{
                fontSize:12, fontWeight:800,
                color:slot.color, background:`${slot.color}12`,
                padding:"3px 10px", borderRadius:8, textAlign:"center",
              }}>{slot.room}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   🚀 THCS DASHBOARD — 11-14 tuổi
   Dark mode · XP/Level · Leaderboard · Social · Mission board
   ════════════════════════════════════════════════════════════════════════════ */

const THCS_CONTINUE = {
  courseId: 101,
  lessonId: 19,
  courseName: "Toán 8 – Đại số & Hình học",
  lessonName: "Phương trình bậc hai – Lý thuyết",
  ct: "CT1",
  color: "#990803",
  pct: 68,
  lessonsTotal: 32,
  lessonsDone: 22,
};

const THCS_COURSES = [
  { id:101, ct:"CT1", name:"Toán 8 – Đại số & Hình học",   teacher:"Cô Ngọc Hà",    color:"#dc2626", desc:"Phương trình, bất phương trình & hình học không gian", lessonsTotal:32, lessonsDone:22, next:"Phương trình bậc 2 – Công thức nghiệm", thumbnail:"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:102, ct:"CT1", name:"Vật lý 8",                      teacher:"Thầy Quang",    color:"#2563eb", desc:"Cơ học, điện học và quang học thực nghiệm",             lessonsTotal:28, lessonsDone:18, next:"Định luật Ohm – Mạch song song",         thumbnail:"https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:103, ct:"CT1", name:"Hóa học 8",                     teacher:"Thầy Trung Nam",color:"#16a34a", desc:"Phản ứng hóa học, nguyên tố & thí nghiệm thực hành",   lessonsTotal:24, lessonsDone:20, next:"Axit – Bazơ – Muối",                     thumbnail:"https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:104, ct:"CT1", name:"Sinh học 8 – Cơ thể người",    teacher:"Cô Phương Mai", color:"#059669", desc:"Giải phẫu & sinh lý các hệ cơ quan trong cơ thể",      lessonsTotal:20, lessonsDone:14, next:"Hệ tuần hoàn – Tim và mạch máu",         thumbnail:"https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:105, ct:"CT1", name:"Ngữ văn 8",                     teacher:"Cô Lan Anh",    color:"#7c3aed", desc:"Văn học hiện đại, nghị luận & tập làm văn sáng tạo",   lessonsTotal:22, lessonsDone:19, next:"Tức cảnh Pác Bó – Hồ Chí Minh",         thumbnail:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:106, ct:"CT1", name:"Tiếng Anh 8",                   teacher:"Cô Thu Trang",  color:"#0891b2", desc:"Giao tiếp, ngữ pháp & kỹ năng 4 trong tiếng Anh",     lessonsTotal:26, lessonsDone:24, next:"Unit 12: Life on other planets",         thumbnail:"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:107, ct:"CT3", name:"Tin học 8 – Lập trình Python",  teacher:"Thầy Minh Đức", color:"#6366f1", desc:"Lập trình Python từ cơ bản đến dự án thực tế",         lessonsTotal:20, lessonsDone:8,  next:"Hàm (Function) trong Python",            thumbnail:"https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:108, ct:"CT3", name:"Thiết kế 3D & Chế tạo",         teacher:"Cô Hải Yến",    color:"#ea580c", desc:"Thiết kế mô hình 3D và in ấn sản phẩm thực tế",        lessonsTotal:16, lessonsDone:5,  next:"In 3D – Thiết lập thông số",             thumbnail:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:109, ct:"CT4", name:"Robotics & Arduino",             teacher:"Thầy Hoàng",    color:"#0ea5e9", desc:"Lập trình vi điều khiển Arduino & cảm biến IoT",        lessonsTotal:18, lessonsDone:7,  next:"Cảm biến siêu âm HC-SR04",              thumbnail:"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:110, ct:"CT4", name:"AI cho học sinh",                teacher:"Thầy Tuấn",     color:"#8b5cf6", desc:"Khái niệm AI, machine learning & ứng dụng thực tiễn",  lessonsTotal:15, lessonsDone:4,  next:"Mạng nơ-ron nhân tạo cơ bản",           thumbnail:"https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&h=200&fit=crop&auto=format&q=80" },
];

const THCS_DEADLINES = [
  { subject:"Toán",      task:"Bài tập chương 3: Phương trình bậc hai", due:"20/05", daysLeft:2, color:"#990803", urgent:true  },
  { subject:"Vật Lý",   task:"Bài thực hành: Định luật Ohm",           due:"22/05", daysLeft:4, color:"#2563eb", urgent:false },
  { subject:"Hóa Học",  task:"Báo cáo thí nghiệm số 5",                due:"23/05", daysLeft:5, color:"#16a34a", urgent:false },
  { subject:"Lập Trình", task:"Nộp dự án Python: Calculator",           due:"25/05", daysLeft:7, color:"#7c3aed", urgent:false },
];

const THCS_CLASS_RANK = [
  { name:"Bùi Thị Mai",        avg:9.1, medal:"🥇"              },
  { name:"Em (Lê Hoàng Nam)",  avg:8.7, medal:"🥈", me:true     },
  { name:"Trần Anh Tuấn",      avg:8.5, medal:"🥉"              },
  { name:"Lê Minh Khoa",       avg:8.2, medal:""                },
  { name:"Phạm Thu Hà",        avg:8.0, medal:""                },
];

function THCSDashboard({ name }: { name: string }) {
  const navigate = useNavigate();
  const primary = "#990803";

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", display:"flex", flexDirection:"column", gap:18 }}>

      {/* ── Profile Header + KPIs ── */}
      <div style={{ background:"linear-gradient(135deg,#5a0401,#7a0602,#5a0401)", borderRadius:16, padding:"20px 24px", color:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, border:"2px solid rgba(255,255,255,0.35)", flexShrink:0 }}>
              {name.split(" ").map((w: string) => w[0]).slice(-2).join("")}
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:700 }}>{name}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.85)" }}>Lớp 8A3 · THCS Ba Vì · CT1, CT3, CT4</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[
              { label:"Điểm TB",  val:"8.7",   sub:"kỳ này ↑" },
              { label:"Huy hiệu", val:"5/8",   sub:"đạt được" },
              { label:"Xếp hạng", val:"2/38",  sub:"lớp 8A3"  },
            ].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:12, padding:"10px 16px", textAlign:"center", minWidth:86 }}>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.75)", marginBottom:3, textTransform:"uppercase", letterSpacing:0.8 }}>{s.label}</div>
                <div style={{ fontSize:20, fontWeight:800, color:"#fff", lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)", marginTop:3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tiếp Tục Học ── */}
      <div style={{ background:`${THCS_CONTINUE.color}0d`, border:`1.5px solid ${THCS_CONTINUE.color}28`, borderRadius:16, padding:"18px 22px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:THCS_CONTINUE.color, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>▶ Tiếp Tục Học</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:17, fontWeight:800, color:"#111827", marginBottom:4 }}>{THCS_CONTINUE.lessonName}</div>
            <div style={{ fontSize:13, color:"#6b7280", marginBottom:12 }}>{THCS_CONTINUE.courseName} · Bài {THCS_CONTINUE.lessonId}</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ flex:1, height:6, background:"#e5e7eb", borderRadius:99, overflow:"hidden" }}>
                <div style={{ width:`${THCS_CONTINUE.pct}%`, height:"100%", background:THCS_CONTINUE.color, borderRadius:99 }} />
              </div>
              <span style={{ fontSize:11, color:"#6b7280", flexShrink:0 }}>{THCS_CONTINUE.lessonsDone}/{THCS_CONTINUE.lessonsTotal} bài · {THCS_CONTINUE.pct}%</span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/student/lessons/${THCS_CONTINUE.courseId}/${THCS_CONTINUE.lessonId}`)}
            style={{ padding:"12px 26px", borderRadius:12, background:primary, color:"#fff", border:"none", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 14px ${primary}40`, flexShrink:0 }}>
            Tiếp tục →
          </button>
        </div>
      </div>

      {/* ── Main: course grid + sidebar ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:18, alignItems:"start" }}>

        {/* Course progress grid */}
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:12 }}>📚 Tiến Độ Các Môn STEM</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
            {THCS_COURSES.map(course => {
              const pct = Math.round(course.lessonsDone / course.lessonsTotal * 100);
              return (
                <Link key={course.id} to={`/student/courses/${course.id}`} style={{ textDecoration:"none" }}>
                  <div
                    style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"box-shadow .15s,transform .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 4px 16px ${course.color}25`; e.currentTarget.style.transform="translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}
                  >
                    {/* Header: ảnh nhỏ + tên */}
                    <div style={{ display:"flex", alignItems:"stretch", borderBottom:"1px solid #f3f4f6", overflow:"hidden" }}>
                      <div style={{ width:72, height:72, flexShrink:0, overflow:"hidden" }}>
                        <img src={(course as any).thumbnail} alt={course.name}
                          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                      </div>
                      <div style={{ flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", justifyContent:"center", gap:4 }}>
                        <span style={{ fontSize:9, fontWeight:800, color:"#fff", background:course.color, padding:"2px 7px", borderRadius:4, alignSelf:"flex-start" }}>{course.ct}</span>
                        <div style={{ fontSize:13, fontWeight:700, color:"#111827", lineHeight:1.3 }}>{course.name}</div>
                      </div>
                    </div>
                    {/* Body */}
                    <div style={{ padding:"10px 14px 12px" }}>
                      {/* Teacher */}
                      <div style={{ fontSize:11, color:"#9ca3af", marginBottom:5 }}>{course.teacher}</div>
                      {/* Description */}
                      {course.desc && (
                        <div style={{ fontSize:11, color:"#6b7280", lineHeight:1.5, marginBottom:8 }}>{course.desc}</div>
                      )}
                      {/* Progress bar */}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: course.next ? 8 : 0 }}>
                        <div style={{ flex:1, height:5, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:course.color, borderRadius:99 }} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:course.color, flexShrink:0 }}>{pct}%</span>
                        <span style={{ fontSize:10, color:"#d1d5db", flexShrink:0 }}>{course.lessonsDone}/{course.lessonsTotal}</span>
                      </div>
                      {/* Next lesson */}
                      {course.next && pct < 100 && (
                        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 9px", borderRadius:7, background:`${course.color}08`, border:`1px solid ${course.color}20` }}>
                          <span style={{ fontSize:9, color:course.color, fontWeight:800 }}>▶</span>
                          <span style={{ fontSize:11, color:course.color, fontWeight:500, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{course.next}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Deadlines */}
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", fontSize:13, fontWeight:700, color:"#d4183d" }}>⏰ Bài Tập Sắp Đến Hạn</div>
            {THCS_DEADLINES.map((d, i) => (
              <div key={i} style={{ padding:"11px 16px", borderBottom:i < THCS_DEADLINES.length-1 ? "1px solid #f9fafb" : "none", display:"flex", alignItems:"flex-start", gap:10 }}>
                <div style={{ width:3, borderRadius:99, background:d.color, flexShrink:0, alignSelf:"stretch", minHeight:36 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{d.subject}</div>
                  <div style={{ fontSize:11, color:"#6b7280", lineHeight:1.4, marginTop:2 }}>{d.task}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:800, color:d.urgent ? "#d4183d" : d.color }}>{d.daysLeft}d</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{d.due}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Class ranking */}
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", fontSize:13, fontWeight:700, color:"#c8a84e" }}>🏆 Xếp Hạng Lớp 8A3</div>
            {THCS_CLASS_RANK.map((r, i) => (
              <div key={i} style={{ padding:"9px 16px", borderBottom:i < THCS_CLASS_RANK.length-1 ? "1px solid #f9fafb" : "none", display:"flex", alignItems:"center", gap:10, background:r.me ? `${primary}0a` : "transparent", borderLeft:r.me ? `3px solid ${primary}` : "3px solid transparent" }}>
                <span style={{ fontSize:r.medal ? 16 : 12, minWidth:22 }}>{r.medal || `${i+1}.`}</span>
                <span style={{ flex:1, fontSize:12, fontWeight:r.me ? 700 : 400, color:r.me ? primary : "#374151" }}>{r.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:r.me ? primary : "#6b7280" }}>{r.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { label:"📝 Bài Thi",    to:"/student/exams",        color:"#990803" },
              { label:"🏅 Thành Tích", to:"/student/achievements",  color:"#c8a84e" },
              { label:"📚 Tất Cả Môn", to:"/student/courses",       color:"#16a34a" },
              { label:"📅 Lịch Học",   to:"/student/schedule",      color:"#2563eb" },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ textDecoration:"none" }}>
                <div style={{ background:`${l.color}0f`, border:`1px solid ${l.color}22`, borderRadius:10, padding:"10px", textAlign:"center", fontSize:11, fontWeight:700, color:l.color, cursor:"pointer" }}>{l.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   🎓 THPT DASHBOARD — 15-18 tuổi
   Tối giản · Chuyên nghiệp · Data-driven · Countdown kỳ thi
   ════════════════════════════════════════════════════════════════════════════ */

const THPT_CONTINUE = {
  courseId: 201, lessonId: 14,
  courseName: "Toán 12 – Giải tích & Hình học",
  lessonName: "Bài 14: Cực trị của hàm số – Luyện tập",
  ct: "CT1", color: "#990803", pct: 63, lessonsTotal: 32, lessonsDone: 20,
};

const THPT_COURSES = [
  { id:201, ct:"CT1", name:"Toán 12 – Giải tích & Hình học", teacher:"Cô Ngọc Hà",    color:"#990803", desc:"Giải tích, hàm số, tích phân & hình học không gian",    lessonsTotal:32, lessonsDone:20, next:"Bài 14: Cực trị hàm số – Luyện tập",    thumbnail:"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:202, ct:"CT1", name:"Vật lý 12",                       teacher:"Thầy Quang Huy",color:"#2563eb", desc:"Dao động, sóng, điện xoay chiều & vật lý hiện đại",     lessonsTotal:26, lessonsDone:15, next:"Dao động điện từ – Mạch LC",             thumbnail:"https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:203, ct:"CT1", name:"Hóa học 12",                      teacher:"Cô Bích Ngọc",  color:"#16a34a", desc:"Hóa hữu cơ, polyme, điện hóa & ứng dụng công nghiệp",  lessonsTotal:28, lessonsDone:20, next:"Este và phản ứng xà phòng hóa",         thumbnail:"https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:204, ct:"CT1", name:"Sinh học 12",                     teacher:"Cô Thanh Hà",   color:"#059669", desc:"Di truyền học, tiến hóa & sinh thái học quần thể",      lessonsTotal:22, lessonsDone:12, next:"Di truyền học quần thể",                 thumbnail:"https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:205, ct:"CT1", name:"Ngữ văn 12",                      teacher:"Cô Lan Anh",    color:"#7c3aed", desc:"Văn học Việt Nam hiện đại & kỹ năng viết nghị luận",    lessonsTotal:20, lessonsDone:16, next:"Vợ chồng A Phủ – Tô Hoài",              thumbnail:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:206, ct:"CT1", name:"Tiếng Anh 12",                    teacher:"Cô Thu Trang",  color:"#0891b2", desc:"Luyện thi IELTS & tiếng Anh học thuật nâng cao",        lessonsTotal:20, lessonsDone:20, next:undefined,                                thumbnail:"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:207, ct:"CT3", name:"Tin học 12 – Python & Dữ liệu",  teacher:"Thầy Minh Đức", color:"#6366f1", desc:"Lập trình Python, phân tích dữ liệu & trực quan hóa",   lessonsTotal:20, lessonsDone:8,  next:"Pandas – Phân tích dữ liệu CSV",        thumbnail:"https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200&h=200&fit=crop&auto=format&q=80" },
  { id:208, ct:"CT5", name:"Dự án NCKH STEM",                 teacher:"Thầy Tuấn",     color:"#f59e0b", desc:"Nghiên cứu khoa học, báo cáo & trình bày dự án STEM",   lessonsTotal:12, lessonsDone:4,  next:"Viết báo cáo nghiên cứu khoa học",      thumbnail:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop&auto=format&q=80" },
];

const THPT_DEADLINES = [
  { subject:"Toán 12",    task:"Kiểm tra 1 tiết – Cực trị hàm số",            due:"22/05", daysLeft:3,  color:"#990803", urgent:true  },
  { subject:"Vật lý 12",  task:"Thực hành điện từ – Viết báo cáo lab",        due:"24/05", daysLeft:5,  color:"#2563eb", urgent:false },
  { subject:"Hóa học 12", task:"Bài tập chương Este – Lipit",                  due:"27/05", daysLeft:8,  color:"#16a34a", urgent:false },
  { subject:"Tin học 12", task:"Dự án Python: Phân tích dữ liệu CSV",          due:"30/05", daysLeft:11, color:"#6366f1", urgent:false },
];

const THPT_KHOI_A = {
  label: "Khối A",
  subjects: [
    { name:"Toán",    score:8.5, color:"#990803" },
    { name:"Vật Lý",  score:7.8, color:"#2563eb" },
    { name:"Hóa Học", score:8.9, color:"#16a34a" },
  ],
  total: 25.2,
  max: 30,
};

const THPT_UNI_TARGETS = [
  { name:"ĐH Bách Khoa HN",    major:"CNTT",              cutoff:27.5, color:"#990803" },
  { name:"ĐH KHTN Hà Nội",     major:"Khoa học máy tính", cutoff:25.5, color:"#2563eb" },
  { name:"ĐH Công Nghiệp HN",  major:"CNTT",              cutoff:24.0, color:"#16a34a" },
  { name:"ĐH FPT",             major:"Software Engineering",cutoff:22.5, color:"#7c3aed" },
];

function THPTDashboard({ name }: { name: string }) {
  const navigate = useNavigate();
  const primary = "#990803";
  const predictedTotal = THPT_KHOI_A.total;

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", color:"#111827", display:"flex", flexDirection:"column", gap:18 }}>

      {/* ── Profile Header + KPIs ── */}
      <div style={{ background:"linear-gradient(135deg,#5a0401,#7a0602,#5a0401)", borderRadius:16, padding:"20px 24px", color:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, border:"2px solid rgba(255,255,255,0.35)", flexShrink:0 }}>
              {name.split(" ").map((w: string) => w[0]).slice(-2).join("")}
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:700 }}>{name}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.85)" }}>Lớp 12A1 · Ban KHTN · THPT Trần Phú · CT1, CT3, CT5</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[
              { label:"Điểm TB",  val:"8.3",      sub:"kỳ này ↑ 0.2"  },
              { label:"STEM",     val:"6/8",       sub:"khoá đang học"  },
              { label:"THPT QG",  val:"49 ngày",   sub:"07/07/2026"     },
            ].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:12, padding:"10px 16px", textAlign:"center", minWidth:90 }}>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.75)", marginBottom:3, textTransform:"uppercase", letterSpacing:0.8 }}>{s.label}</div>
                <div style={{ fontSize:s.label==="THPT QG"?15:20, fontWeight:800, color:"#fff", lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.75)", marginTop:3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tiếp Tục Học ── */}
      <div style={{ background:`${THPT_CONTINUE.color}0d`, border:`1.5px solid ${THPT_CONTINUE.color}28`, borderRadius:16, padding:"18px 22px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:THPT_CONTINUE.color, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>▶ Tiếp Tục Học</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:17, fontWeight:800, color:"#111827", marginBottom:4 }}>{THPT_CONTINUE.lessonName}</div>
            <div style={{ fontSize:13, color:"#6b7280", marginBottom:12 }}>{THPT_CONTINUE.courseName} · Bài {THPT_CONTINUE.lessonId}</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ flex:1, height:6, background:"#e5e7eb", borderRadius:99, overflow:"hidden" }}>
                <div style={{ width:`${THPT_CONTINUE.pct}%`, height:"100%", background:THPT_CONTINUE.color, borderRadius:99 }} />
              </div>
              <span style={{ fontSize:11, color:"#6b7280", flexShrink:0 }}>{THPT_CONTINUE.lessonsDone}/{THPT_CONTINUE.lessonsTotal} bài · {THPT_CONTINUE.pct}%</span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/student/lessons/${THPT_CONTINUE.courseId}/${THPT_CONTINUE.lessonId}`)}
            style={{ padding:"12px 26px", borderRadius:12, background:THPT_CONTINUE.color, color:"#fff", border:"none", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 14px ${THPT_CONTINUE.color}40`, flexShrink:0 }}>
            Tiếp tục →
          </button>
        </div>
      </div>

      {/* ── Main: course grid + sidebar ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:18, alignItems:"start" }}>

        {/* Course grid */}
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:12 }}>📚 Khoá Học STEM Đang Học</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
            {THPT_COURSES.map(course => {
              const pct = Math.round(course.lessonsDone / course.lessonsTotal * 100);
              return (
                <Link key={course.id} to={`/student/courses/${course.id}`} style={{ textDecoration:"none" }}>
                  <div
                    style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"box-shadow .15s,transform .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 4px 16px ${course.color}25`; e.currentTarget.style.transform="translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}
                  >
                    <div style={{ display:"flex", alignItems:"stretch", borderBottom:"1px solid #f3f4f6", overflow:"hidden" }}>
                      <div style={{ width:72, height:72, flexShrink:0, overflow:"hidden" }}>
                        <img src={(course as any).thumbnail} alt={course.name}
                          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                      </div>
                      <div style={{ flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", justifyContent:"center", gap:4 }}>
                        <span style={{ fontSize:9, fontWeight:800, color:"#fff", background:course.color, padding:"2px 7px", borderRadius:4, alignSelf:"flex-start" }}>{course.ct}</span>
                        <div style={{ fontSize:13, fontWeight:700, color:"#111827", lineHeight:1.3 }}>{course.name}</div>
                      </div>
                    </div>
                    <div style={{ padding:"10px 14px 12px" }}>
                      {/* Teacher + stars */}
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                        <span style={{ fontSize:11, color:"#9ca3af", flex:1 }}>{course.teacher}</span>
                        <div style={{ display:"flex", gap:1 }}>
                          {[1,2,3,4,5].map(n => (
                            <span key={n} style={{ fontSize:11, color: n <= (course.stars ?? 3) ? "#f59e0b" : "#e5e7eb", lineHeight:1 }}>★</span>
                          ))}
                        </div>
                      </div>
                      {/* Progress */}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: course.next && pct < 100 ? 8 : 0 }}>
                        <div style={{ flex:1, height:5, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background: pct >= 100 ? "#16a34a" : course.color, borderRadius:99 }} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color: pct >= 100 ? "#16a34a" : course.color, flexShrink:0 }}>{pct}%</span>
                        <span style={{ fontSize:10, color:"#d1d5db", flexShrink:0 }}>{course.lessonsDone}/{course.lessonsTotal}</span>
                      </div>
                      {/* Next lesson */}
                      {course.next && pct < 100 && (
                        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 9px", borderRadius:7, background:`${course.color}08`, border:`1px solid ${course.color}20` }}>
                          <span style={{ fontSize:9, color:course.color, fontWeight:800 }}>▶</span>
                          <span style={{ fontSize:11, color:course.color, fontWeight:500, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{course.next}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Deadlines */}
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", fontSize:13, fontWeight:700, color:"#d4183d" }}>⏰ Bài Tập Sắp Đến Hạn</div>
            {THPT_DEADLINES.map((d, i) => (
              <div key={i} style={{ padding:"11px 16px", borderBottom:i < THPT_DEADLINES.length-1 ? "1px solid #f9fafb" : "none", display:"flex", alignItems:"flex-start", gap:10 }}>
                <div style={{ width:3, borderRadius:99, background:d.color, flexShrink:0, alignSelf:"stretch", minHeight:36 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{d.subject}</div>
                  <div style={{ fontSize:11, color:"#6b7280", lineHeight:1.4, marginTop:2 }}>{d.task}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:800, color:d.urgent ? "#d4183d" : d.color }}>{d.daysLeft}d</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>{d.due}</div>
                </div>
              </div>
            ))}
          </div>

          {/* University target — Khối A style */}
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, overflow:"hidden" }}>
            {/* Header */}
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#111827" }}>🎓 Mục Tiêu Đại Học</span>
              <span style={{ fontSize:10, fontWeight:700, color:"#374151", background:"#f3f4f6", padding:"2px 8px", borderRadius:99 }}>Khối A · 3 môn / 30đ</span>
            </div>

            {/* Subject score breakdown */}
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Điểm dự kiến (thi thử)</div>
              {THPT_KHOI_A.subjects.map(s => (
                <div key={s.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"#374151", width:50, flexShrink:0 }}>{s.name}</span>
                  <div style={{ flex:1, height:5, background:"#f3f4f6", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ width:`${(s.score / 10) * 100}%`, height:"100%", background:s.color, borderRadius:99 }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:800, color:s.color, width:28, textAlign:"right", flexShrink:0 }}>{s.score}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, paddingTop:8, borderTop:"1px solid #f3f4f6" }}>
                <span style={{ fontSize:11, fontWeight:600, color:"#374151" }}>Tổng dự kiến</span>
                <span style={{ fontSize:17, fontWeight:900, color:primary }}>
                  {predictedTotal}<span style={{ fontSize:11, fontWeight:500, color:"#9ca3af" }}>/{THPT_KHOI_A.max}đ</span>
                </span>
              </div>
            </div>

            {/* University list */}
            {THPT_UNI_TARGETS.map((t, i) => {
              const achieved = predictedTotal >= t.cutoff;
              const gap = (t.cutoff - predictedTotal).toFixed(1);
              return (
                <div key={i} style={{ padding:"9px 16px", borderBottom:i < THPT_UNI_TARGETS.length-1 ? "1px solid #f9fafb" : "none", display:"flex", alignItems:"center", gap:8 }}>
                  {achieved ? (
                    <div style={{ width:18, height:18, borderRadius:"50%", background:"#16a34a", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:9, color:"#fff", fontWeight:800 }}>✓</div>
                  ) : (
                    <div style={{ width:18, height:18, borderRadius:"50%", border:"1.5px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:9, color:"#9ca3af", fontWeight:800 }}>{i+1}</div>
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.name}</div>
                    <div style={{ fontSize:9, color:"#9ca3af" }}>{t.major} · Chuẩn {t.cutoff}đ</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:800, flexShrink:0, color: achieved ? "#16a34a" : "#f59e0b" }}>
                    {achieved ? "Đạt ✓" : `–${gap}đ`}
                  </span>
                </div>
              );
            })}

            {/* THPT QG countdown */}
            <div style={{ padding:"10px 16px", background:"#fff5f5", borderTop:"1px solid #fee2e2" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, fontWeight:700, color:primary }}>⏳ THPT Quốc Gia 2026</span>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:18, fontWeight:900, color:primary, lineHeight:1 }}>49 ngày</div>
                  <div style={{ fontSize:10, color:"#9ca3af" }}>07/07/2026</div>
                </div>
              </div>
              <div style={{ marginTop:6, height:4, background:"#fee2e2", borderRadius:99, overflow:"hidden" }}>
                <div style={{ width:"87%", height:"100%", background:primary, borderRadius:99 }} />
              </div>
              <div style={{ fontSize:9, color:"#9ca3af", marginTop:3 }}>Đã hoàn thành 87% năm học · Cố lên! 💪</div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { label:"📝 Bài Thi",    to:"/student/exams",        color:"#990803" },
              { label:"🏅 Thành Tích", to:"/student/achievements",  color:"#c8a84e" },
              { label:"📚 Tất Cả Môn", to:"/student/courses",       color:"#16a34a" },
              { label:"📅 Lịch Học",   to:"/student/schedule",      color:"#2563eb" },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ textDecoration:"none" }}>
                <div style={{ background:`${l.color}0f`, border:`1px solid ${l.color}22`, borderRadius:10, padding:"10px", textAlign:"center", fontSize:11, fontWeight:700, color:l.color, cursor:"pointer" }}>{l.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════════════ */

export function StudentHome() {
  const { user } = useAuth();
  const { level } = useGradeLevel();
  const name = user?.name || "Học Sinh";

  const wrapStyle: React.CSSProperties = level === "mamnon"
    ? { background: "#FFFBF0", borderRadius: 24, padding: "24px", minHeight: "60vh" }
    : (level === "thcs" || level === "thpt")
    ? { borderRadius: 16, overflow: "hidden" }
    : {};

  return (
    <div>
      <LevelHint level={level} />
      <div style={wrapStyle}>
        {level === "mamnon"  && <MamNonDashboard  name={name} />}
        {level === "tieuhoc" && <TieuHocDashboard name={name} />}
        {level === "thcs"    && <THCSDashboard    name={name} />}
        {level === "thpt"    && <THPTDashboard    name={name} />}
      </div>
    </div>
  );
}

export default StudentHome;
