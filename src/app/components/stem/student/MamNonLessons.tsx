import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { MamNonLessonPlayer } from "./MamNonLessonPlayer";
import { MamNonWorkbook, WORKBOOK_DATA } from "./MamNonWorkbook";

/* ════════════════════════════════════════════════════════════════════
   FLOW: Greeting → Player → Reward → Unlock → Player(mới)
   Navigation stack — back luôn về đúng màn trước đó
   ════════════════════════════════════════════════════════════════════ */

// ─── Types ───────────────────────────────────────────────────────────
type StemCategory = "S" | "T" | "E" | "M";

interface Lesson {
  id: string; title: string; subtitle: string;
  chars: string[]; color: string; grad: string;
  done: number; total: number; isNew?: boolean;
  locked?: boolean;
}

type Step =
  | { type: "greeting" }
  | { type: "lessons"; tab: StemCategory }
  | { type: "player"; lesson: Lesson; source: "greeting" | "lessons" }
  | { type: "reward"; lesson: Lesson }
  | { type: "unlock"; lesson: Lesson }
  | { type: "workbook"; lesson: Lesson };

// ─── STEM Data ────────────────────────────────────────────────────────
const STEM_DATA: Record<StemCategory, {
  label: string; vi: string; desc: string; emoji: string; color: string; lessons: Lesson[];
}> = {
  S: {
    label: "Science", vi: "Khoa Học", emoji: "🔬", color: "#5BB5D5",
    desc: "Khám phá thế giới tự nhiên xung quanh bé!",
    lessons: [
      { id:"s1", title:"Thế Giới Thực Vật",   subtitle:"Hoa, lá, cây xanh",       chars:["🌸","🌿","🌻"], color:"#6BCF7F", grad:"linear-gradient(145deg,#6BCF7F,#95D5A5)", done:3, total:6 },
      { id:"s2", title:"Động Vật Quanh Em",   subtitle:"Bạn bốn chân, hai cánh",  chars:["🐶","🐱","🐰"], color:"#FF9F43", grad:"linear-gradient(145deg,#FF9F43,#F7C674)", done:1, total:5 },
      { id:"s3", title:"Nước & Không Khí",    subtitle:"Mưa, mây, gió",           chars:["🌧️","☁️","🌬️"], color:"#74C0FC", grad:"linear-gradient(145deg,#74C0FC,#A29BFE)", done:0, total:4, locked:true },
      { id:"s4", title:"Ngày & Đêm",          subtitle:"Mặt trời, mặt trăng, sao",chars:["🌞","🌙","⭐"], color:"#A29BFE", grad:"linear-gradient(145deg,#A29BFE,#7c3aed)", done:0, total:4, locked:true },
      { id:"s5", title:"Các Giác Quan",       subtitle:"Nhìn, nghe, ngửi, sờ",   chars:["👁️","👂","👃"], color:"#FF8FAB", grad:"linear-gradient(145deg,#FF8FAB,#F4A0B0)", done:0, total:5, locked:true },
      { id:"s6", title:"Thời Tiết Vui",       subtitle:"Nắng, mưa, lạnh, nóng",  chars:["☀️","🌈","❄️"], color:"#5BB5D5", grad:"linear-gradient(145deg,#5BB5D5,#7ECFCE)", done:0, total:4, locked:true },
    ],
  },
  T: {
    label: "Technology", vi: "Công Nghệ", emoji: "💻", color: "#7c3aed",
    desc: "Khám phá những thiết bị và công cụ kỳ diệu!",
    lessons: [
      { id:"t1", title:"Thiết Bị Quanh Em",  subtitle:"Điện thoại, TV, máy tính", chars:["📱","💻","📺"], color:"#7c3aed", grad:"linear-gradient(145deg,#7c3aed,#DDA0DD)", done:2, total:4 },
      { id:"t2", title:"Robot Bạn Thân",     subtitle:"Robot làm được gì?",       chars:["🤖","⚙️","🔧"], color:"#74C0FC", grad:"linear-gradient(145deg,#74C0FC,#A29BFE)", done:0, total:5, locked:true },
      { id:"t3", title:"Nút Bấm & Màn Hình",subtitle:"Bấm để làm gì?",           chars:["🎮","🖱️","⌨️"], color:"#FF6B35", grad:"linear-gradient(145deg,#FF6B35,#F5A67A)", done:0, total:4, locked:true },
      { id:"t4", title:"Âm Nhạc Điện Tử",   subtitle:"Nhạc cụ thông minh",       chars:["🎹","🎵","🎧"], color:"#6BCF7F", grad:"linear-gradient(145deg,#6BCF7F,#95D5A5)", done:0, total:3, locked:true },
    ],
  },
  E: {
    label: "Engineering", vi: "Kỹ Thuật", emoji: "🏗️", color: "#FF9F43",
    desc: "Xây dựng và sáng tạo những điều tuyệt vời!",
    lessons: [
      { id:"e1", title:"Xây Nhà Cho Búp Bê", subtitle:"Cách nhà đứng vững",      chars:["🏠","🧱","🔨"], color:"#FF9F43", grad:"linear-gradient(145deg,#FF9F43,#F7C674)", done:5, total:6 },
      { id:"e2", title:"Cầu Bé Bắc Qua Sông",subtitle:"Sức chịu lực của cầu",   chars:["🌉","🚗","🌊"], color:"#5BB5D5", grad:"linear-gradient(145deg,#5BB5D5,#7ECFCE)", done:0, total:5, locked:true },
      { id:"e3", title:"Xe Đồ Chơi Tự Chạy", subtitle:"Bánh xe lăn thế nào?",   chars:["🚗","⚙️","🛞"], color:"#E8703A", grad:"linear-gradient(145deg,#E8703A,#F5A67A)", done:0, total:4, locked:true },
      { id:"e4", title:"Tháp Cao Nhất Lớp",  subtitle:"Cân bằng và chiều cao",   chars:["🗼","📐","✏️"], color:"#6BCF7F", grad:"linear-gradient(145deg,#6BCF7F,#95D5A5)", done:0, total:4, locked:true },
    ],
  },
  M: {
    label: "Math", vi: "Toán Học", emoji: "🔢", color: "#6BCF7F",
    desc: "Học đếm, hình dạng và con số thật vui!",
    lessons: [
      { id:"m1", title:"Đếm 1 Đến 10",       subtitle:"Con số vui nhộn",         chars:["1️⃣","2️⃣","🔟"], color:"#FF8FAB", grad:"linear-gradient(145deg,#FF8FAB,#F4A0B0)", done:6, total:6 },
      { id:"m2", title:"Hình Dạng Quanh Em", subtitle:"Vuông, tròn, tam giác",   chars:["🔴","🟦","🔺"], color:"#74C0FC", grad:"linear-gradient(145deg,#74C0FC,#A29BFE)", done:3, total:5 },
      { id:"m3", title:"Màu Sắc Kỳ Diệu",   subtitle:"Trộn màu tạo màu mới",   chars:["🎨","🌈","🖌️"], color:"#7c3aed", grad:"linear-gradient(145deg,#7c3aed,#DDA0DD)", done:0, total:5, locked:true },
      { id:"m4", title:"To & Nhỏ, Nhiều & Ít",subtitle:"So sánh mọi thứ",       chars:["🐘","🐭","⚖️"], color:"#6BCF7F", grad:"linear-gradient(145deg,#6BCF7F,#95D5A5)", done:0, total:4, locked:true },
      { id:"m5", title:"Mẫu Hình Lặp Lại",  subtitle:"Nhận ra quy luật AB AB",  chars:["🔴","🔵","🔴"], color:"#FF9F43", grad:"linear-gradient(145deg,#FF9F43,#F7C674)", done:0, total:3, locked:true },
    ],
  },
};

const STEM_ORDER: StemCategory[] = ["S","T","E","M"];
const ALPHA_COLORS = ["#FF8FAB","#FFD93D","#6BCF7F","#74C0FC","#7c3aed","#FF9F43"];

// Mock: bài đang học dang dở
const IN_PROGRESS = STEM_DATA.S.lessons[1]; // Động Vật Quanh Em 1/5
const NEXT_UNLOCK  = STEM_DATA.S.lessons[2]; // Nước & Không Khí (sẽ mở khóa)

// ─── Shared: Sky wrapper ──────────────────────────────────────────────
function SkyWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:"linear-gradient(180deg,#87CEEB 0%,#B5E0F5 55%,#A8D8A8 100%)",
      borderRadius:24, minHeight:"85vh", padding:"24px 20px 28px",
      fontFamily:"'Nunito','Comic Sans MS',cursive,sans-serif",
      position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @keyframes float-cloud  { 0%,100%{transform:translateX(0)} 50%{transform:translateX(14px)} }
        @keyframes mn-bounce    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes mn-spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes mn-pop       { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes mn-star-fly  { 0%{transform:translateY(0) scale(0) rotate(0deg); opacity:1} 100%{transform:translateY(-80px) scale(1.5) rotate(180deg); opacity:0} }
        @keyframes mn-shake     { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
        @keyframes mn-pulse     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes mn-unlock    { 0%{transform:scale(1) rotate(0)} 30%{transform:scale(1.3) rotate(-15deg)} 60%{transform:scale(0.8) rotate(10deg)} 100%{transform:scale(1) rotate(0)} }
        @keyframes mn-sparkle   { 0%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1.2)} 100%{opacity:0;transform:scale(0)} }
      `}</style>
      {/* Clouds */}
      {[
        {w:110,h:42,top:18,left:"5%",d:"0s"},{w:75,h:30,top:52,left:"22%",d:"1.8s"},
        {w:90,h:36,top:12,right:"10%",d:"0.9s"},{w:62,h:25,top:58,right:"4%",d:"2.3s"},
      ].map((c,i)=>(
        <div key={i} style={{
          position:"absolute",width:c.w,height:c.h,pointerEvents:"none",
          top:c.top,left:(c as any).left,right:(c as any).right,
          background:"rgba(255,255,255,0.88)",borderRadius:999,
          animation:`float-cloud 4s ease-in-out infinite`,animationDelay:c.d,
        }}/>
      ))}
      <div style={{position:"absolute",top:26,left:"44%",fontSize:22,opacity:0.6,pointerEvents:"none"}}>✈️</div>
      <div style={{position:"absolute",top:68,right:"30%",fontSize:16,opacity:0.5,pointerEvents:"none"}}>✈️</div>
      {children}
    </div>
  );
}

// ─── Shared: Top pill ────────────────────────────────────────────────
function TopPill({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div style={{textAlign:"center",marginBottom:18,position:"relative",zIndex:10}}>
      <div style={{
        display:"inline-flex",alignItems:"center",gap:10,
        background:"rgba(255,255,255,0.9)",borderRadius:99,
        padding:"8px 20px",border:"3px solid rgba(255,255,255,0.95)",
        boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
      }}>
        <button onClick={onBack} style={{
          background:"#FF6B35",color:"#fff",borderRadius:99,
          padding:"4px 14px",fontSize:13,fontWeight:900,
          border:"1.5px solid rgba(0,0,0,0.13)",boxShadow:"0 3px 10px rgba(0,0,0,0.13)",
          cursor:"pointer",fontFamily:"'Nunito',cursive",
        }}>← Quay lại</button>
        {children}
      </div>
    </div>
  );
}

// ─── Shared: Wooden frame ─────────────────────────────────────────────
function WoodenFrame({ header, children }: {
  header: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{flex:1,background:"#D4892A",borderRadius:28,padding:10,boxShadow:"0 8px 0 #A0621A, 0 14px 36px rgba(0,0,0,0.22)"}}>
      <div style={{background:"#FFF9F0",borderRadius:20,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#f59e0b,#f59e0b)",padding:"12px 20px"}}>
          {header}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Side decorations ─────────────────────────────────────────────────
function LeftDeco({ letter }: { letter?: string }) {
  return (
    <div style={{flexShrink:0,width:82,display:"flex",flexDirection:"column",alignItems:"center",gap:6,paddingTop:8}}>
      {letter && (
        <div style={{width:60,height:68,borderRadius:14,background:"#FF8FAB",border:"4px solid #fff",boxShadow:"0 4px 14px rgba(0,0,0,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:900,color:"#fff",textShadow:"2px 2px 0 rgba(0,0,0,0.15)"}}>
          {letter}
        </div>
      )}
      <div style={{fontSize:56,lineHeight:1}}>🏠</div>
      <span style={{fontSize:36,animation:"mn-bounce 2s ease-in-out infinite"}}>👧</span>
    </div>
  );
}
function RightDeco({ letter }: { letter?: string }) {
  return (
    <div style={{flexShrink:0,width:82,display:"flex",flexDirection:"column",alignItems:"center",gap:6,paddingTop:8}}>
      {letter && (
        <div style={{width:60,height:68,borderRadius:14,background:"#FF6B35",border:"4px solid #fff",boxShadow:"0 4px 14px rgba(0,0,0,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:900,color:"#fff",textShadow:"2px 2px 0 rgba(0,0,0,0.15)"}}>
          {letter}
        </div>
      )}
      <div style={{fontSize:56,lineHeight:1}}>🏡</div>
      <span style={{fontSize:36,animation:"mn-bounce 2s ease-in-out 0.7s infinite"}}>🧒</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 1 — DAILY GREETING (Chào hôm nay)
// ════════════════════════════════════════════════════════════════════
function DailyGreeting({ onContinue, onBrowse, onBack }: {
  onContinue: () => void;
  onBrowse: () => void;
  onBack: () => void;
}) {
  const hour = new Date().getHours();
  const [greeting, timeEmoji] =
    hour < 11 ? ["Chào buổi sáng","🌞"]
    : hour < 14 ? ["Chào buổi trưa","☀️"]
    : hour < 18 ? ["Chào buổi chiều","🌤️"]
    : ["Chào buổi tối","🌙"];
  const pct = Math.round(IN_PROGRESS.done / IN_PROGRESS.total * 100);

  return (
    <SkyWrap>
      <TopPill onBack={onBack}>
        <span style={{fontSize:16,fontWeight:900,color:"#FF6B35"}}>{greeting}!</span>
        <span style={{fontSize:14,color:"#888",fontWeight:600}}>Hôm nay học gì nhỉ? 📚</span>
      </TopPill>

      <div style={{display:"flex",gap:14,alignItems:"flex-start",position:"relative",zIndex:10}}>
        <LeftDeco letter="S" />

        <WoodenFrame header={
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:10,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🐝</div>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>{greeting}! 👋</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:700}}>STEM Mầm Non · Tiếp tục hành trình!</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div style={{background:"rgba(255,255,255,0.2)",borderRadius:99,padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:18}}>🔥</span>
                <span style={{fontSize:14,fontWeight:900,color:"#FFD93D"}}>3 ngày</span>
              </div>
              <div style={{background:"rgba(255,255,255,0.2)",borderRadius:99,padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:18}}>⭐</span>
                <span style={{fontSize:14,fontWeight:900,color:"#FFD93D"}}>58</span>
              </div>
            </div>
          </div>
        }>
          <div style={{padding:"20px 24px 28px"}}>

            {/* In-progress lesson card */}
            <div style={{marginBottom:20}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#FF6B3520",borderRadius:99,padding:"4px 14px",marginBottom:12}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:"#FF6B35",display:"inline-block",animation:"mn-pulse 1.2s ease-in-out infinite"}}/>
                <span style={{fontSize:12,fontWeight:900,color:"#FF6B35"}}>Đang học dang dở...</span>
              </div>

              <div style={{
                background:IN_PROGRESS.grad,
                borderRadius:24,overflow:"hidden",
                boxShadow:"0 8px 28px rgba(0,0,0,0.15)",
              }}>
                {/* Thumbnail */}
                <div style={{height:160,display:"flex",alignItems:"center",justifyContent:"center",gap:12,position:"relative"}}>
                  {IN_PROGRESS.chars.map((c,i)=>(
                    <span key={i} style={{fontSize:52+i*8,filter:"drop-shadow(2px 4px 8px rgba(0,0,0,0.25))",animation:`mn-bounce ${1.8+i*0.3}s ease-in-out ${i*0.3}s infinite`}}>{c}</span>
                  ))}
                  {/* Bubble dots */}
                  {[[10,10],[90,14],[16,90]].map(([x,y],i)=>(
                    <div key={i} style={{position:"absolute",left:x,top:y,width:10,height:10,borderRadius:"50%",background:"rgba(255,255,255,0.3)"}}/>
                  ))}
                </div>
                {/* Footer */}
                <div style={{background:"#fff",padding:"16px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:18,fontWeight:900,color:"#1A1A1A"}}>{IN_PROGRESS.title}</div>
                    <div style={{background:IN_PROGRESS.color,color:"#fff",borderRadius:99,padding:"3px 12px",fontSize:12,fontWeight:900}}>
                      {IN_PROGRESS.done}/{IN_PROGRESS.total} bài
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#888",marginBottom:10,fontWeight:600}}>{IN_PROGRESS.subtitle}</div>
                  {/* Progress */}
                  <div style={{background:"#EEE",borderRadius:99,height:10,overflow:"hidden",marginBottom:6}}>
                    <div style={{width:`${pct}%`,height:"100%",background:IN_PROGRESS.color,borderRadius:99,transition:"width 1s ease"}}/>
                  </div>
                  <div style={{fontSize:11,color:IN_PROGRESS.color,fontWeight:800}}>{pct}% hoàn thành</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <button onClick={onContinue} style={{
              width:"100%",padding:"16px",borderRadius:20,marginBottom:10,
              background:IN_PROGRESS.color,color:"#fff",
              border:"1.5px solid rgba(0,0,0,0.13)",boxShadow:"0 6px 20px rgba(0,0,0,0.15)",
              fontSize:20,fontWeight:900,cursor:"pointer",
              fontFamily:"'Nunito',cursive",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              animation:"mn-pulse 2s ease-in-out infinite",
            }}>
              <span style={{fontSize:26}}>▶</span> Tiếp tục học ngay!
            </button>

            <button onClick={onBrowse} style={{
              width:"100%",padding:"12px",borderRadius:18,
              background:"#fff",color:"#555",
              border:"3px solid #DDD",
              fontSize:15,fontWeight:800,cursor:"pointer",
              fontFamily:"'Nunito',cursive",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            }}>
              <span style={{fontSize:18}}>📚</span> Xem tất cả bài học
            </button>
          </div>
        </WoodenFrame>

        <RightDeco letter="M" />
      </div>
    </SkyWrap>
  );
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 3 — REWARD (Nhận sao & badge)
// ════════════════════════════════════════════════════════════════════
function RewardScreen({ lesson, onNext, onBack }: {
  lesson: Lesson; onNext: () => void; onBack: () => void;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <SkyWrap>
      <TopPill onBack={onBack}>
        <span style={{fontSize:16,fontWeight:900,color:"#FF6B35"}}>🎉 Hoàn thành xuất sắc!</span>
      </TopPill>

      <div style={{display:"flex",gap:14,alignItems:"flex-start",position:"relative",zIndex:10}}>
        <LeftDeco />
        <WoodenFrame header={
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:32,animation:phase>=1?"mn-shake 0.5s ease-in-out 3":"none"}}>🏆</span>
            <div>
              <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>Phần Thưởng Hôm Nay!</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:700}}>Em đã học xong: {lesson.title}</div>
            </div>
          </div>
        }>
          <div style={{padding:"24px"}}>

            {/* Floating stars */}
            <div style={{position:"relative",height:80,marginBottom:8,overflow:"hidden"}}>
              {[15,30,50,65,80].map((left,i)=>(
                <div key={i} style={{
                  position:"absolute",left:`${left}%`,bottom:0,
                  fontSize:28,
                  animation:phase>=1?`mn-star-fly ${1+i*0.2}s ease-out ${i*0.15}s forwards`:"none",
                  opacity:0,
                }}>⭐</div>
              ))}
              {phase >= 2 && (
                <div style={{
                  position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
                  fontSize:80,animation:"mn-pop 0.5s ease-out forwards",
                }}>🏆</div>
              )}
            </div>

            {/* XP & Stars gained */}
            {phase >= 2 && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20,animation:"mn-pop 0.4s ease-out"}}>
                {[
                  {emoji:"⭐",label:"Sao nhận được",val:"+3",color:"#FFD93D"},
                  {emoji:"⚡",label:"Điểm XP",val:"+25",color:"#FF9F43"},
                  {emoji:"🔥",label:"Chuỗi ngày",val:"4 ngày",color:"#FF6B35"},
                ].map(s=>(
                  <div key={s.label} style={{
                    background:s.color,border:"1.5px solid rgba(0,0,0,0.13)",
                    borderRadius:18,padding:"14px 8px",textAlign:"center",
                    boxShadow:"0 4px 14px rgba(0,0,0,0.13)",
                  }}>
                    <div style={{fontSize:30,marginBottom:4}}>{s.emoji}</div>
                    <div style={{fontSize:20,fontWeight:900,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,0.2)"}}>{s.val}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.9)",fontWeight:800}}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Badge earned */}
            {phase >= 2 && (
              <div style={{
                display:"flex",alignItems:"center",gap:16,
                background:"linear-gradient(135deg,#FFD93D,#FF9F43)",
                border:"1.5px solid rgba(0,0,0,0.13)",borderRadius:20,padding:"16px 20px",
                boxShadow:"0 6px 20px rgba(0,0,0,0.15)",marginBottom:20,
                animation:"mn-pop 0.4s ease-out",
              }}>
                <div style={{
                  width:64,height:64,borderRadius:18,flexShrink:0,
                  background:"#fff",border:"1.5px solid rgba(0,0,0,0.13)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:38,boxShadow:"0 3px 10px rgba(0,0,0,0.13)",
                }}>🦁</div>
                <div>
                  <div style={{fontSize:11,fontWeight:900,color:"rgba(0,0,0,0.5)",marginBottom:2}}>HUY HIỆU MỚI!</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#1A1A1A"}}>Nhà Khoa Học Nhỏ 🔬</div>
                  <div style={{fontSize:12,color:"#5D4037",fontWeight:700}}>Hoàn thành bài Động Vật Quanh Em!</div>
                </div>
              </div>
            )}

            {/* Next lesson preview */}
            {phase >= 3 && (
              <div style={{marginBottom:20,animation:"mn-pop 0.4s ease-out"}}>
                <div style={{fontSize:13,fontWeight:900,color:"#888",marginBottom:8}}>🔓 SẮP MỞ KHÓA:</div>
                <div style={{
                  display:"flex",alignItems:"center",gap:14,
                  background:NEXT_UNLOCK.grad,
                  border:"1.5px solid rgba(0,0,0,0.13)",borderRadius:20,padding:"14px 18px",
                  boxShadow:"0 4px 14px rgba(0,0,0,0.13)",
                }}>
                  <div style={{display:"flex",gap:6}}>
                    {NEXT_UNLOCK.chars.map((c,i)=>(
                      <span key={i} style={{fontSize:36,filter:"drop-shadow(1px 2px 4px rgba(0,0,0,0.2))"}}>{c}</span>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:16,fontWeight:900,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,0.2)"}}>{NEXT_UNLOCK.title}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{NEXT_UNLOCK.subtitle}</div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            {phase >= 3 && (
              <button onClick={onNext} style={{
                width:"100%",padding:"16px",borderRadius:20,
                background:"#6BCF7F",color:"#fff",
                border:"1.5px solid rgba(0,0,0,0.13)",boxShadow:"0 6px 20px rgba(0,0,0,0.15)",
                fontSize:18,fontWeight:900,cursor:"pointer",
                fontFamily:"'Nunito',cursive",
                display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                animation:"mn-pop 0.4s ease-out",
              }}>
                <span style={{fontSize:24}}>🔓</span> Mở khóa bài tiếp theo!
              </button>
            )}
          </div>
        </WoodenFrame>
        <RightDeco />
      </div>
    </SkyWrap>
  );
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 4 — UNLOCK (Mở khóa bài mới)
// ════════════════════════════════════════════════════════════════════
function UnlockScreen({ lesson, onStart, onBack }: {
  lesson: Lesson; onStart: () => void; onBack: () => void;
}) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setUnlocked(true), 800);
    return () => clearTimeout(t);
  }, []);

  const pct = Math.round(lesson.done / lesson.total * 100);

  return (
    <SkyWrap>
      <TopPill onBack={onBack}>
        <span style={{fontSize:16,fontWeight:900,color:"#6BCF7F"}}>🔓 Bài Mới Mở Khóa!</span>
      </TopPill>

      <div style={{display:"flex",gap:14,alignItems:"flex-start",position:"relative",zIndex:10}}>
        <LeftDeco />
        <WoodenFrame header={
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:32,animation:unlocked?"mn-spin 0.6s ease-out":"none"}}>🔓</span>
            <div>
              <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>Chúc mừng! Bài mới đã mở!</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:700}}>Em đã đủ sao để khám phá bài này!</div>
            </div>
          </div>
        }>
          <div style={{padding:"24px",textAlign:"center"}}>

            {/* Sparkles around unlock */}
            <div style={{position:"relative",display:"inline-block",marginBottom:24}}>
              {/* Sparkle decorations */}
              {unlocked && [
                {top:-20,left:10},{top:-15,right:20},{top:10,left:-25},{top:30,right:-20},
                {bottom:-10,left:30},{bottom:5,right:10},
              ].map((pos,i)=>(
                <div key={i} style={{
                  position:"absolute",...(pos as any),
                  fontSize:20,
                  animation:`mn-sparkle ${0.5+i*0.1}s ease-out ${i*0.1}s infinite`,
                }}>✨</div>
              ))}

              {/* Big lock → unlock transition */}
              <div style={{
                width:120,height:120,borderRadius:32,
                background: unlocked ? lesson.grad : "#E0E0E0",
                border:"2px solid rgba(0,0,0,0.13)",boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:64,
                transition:"background 0.8s ease",
                animation: unlocked ? "mn-pop 0.5s ease-out" : "none",
              }}>
                {unlocked ? lesson.chars[0] : "🔒"}
              </div>
            </div>

            {/* Lesson info */}
            {unlocked && (
              <div style={{animation:"mn-pop 0.4s ease-out 0.3s both"}}>
                <div style={{fontSize:26,fontWeight:900,color:"#1A1A1A",marginBottom:6}}>{lesson.title}</div>
                <div style={{fontSize:14,color:"#888",marginBottom:16,fontWeight:600}}>{lesson.subtitle}</div>

                {/* Characters */}
                <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:20}}>
                  {lesson.chars.map((c,i)=>(
                    <span key={i} style={{
                      fontSize:52,filter:"drop-shadow(2px 4px 8px rgba(0,0,0,0.2))",
                      animation:`mn-bounce ${1.6+i*0.3}s ease-in-out ${i*0.3}s infinite`,
                    }}>{c}</span>
                  ))}
                </div>

                {/* Progress */}
                <div style={{
                  display:"flex",alignItems:"center",gap:10,
                  background:"#F0F4F8",borderRadius:14,padding:"10px 16px",marginBottom:20,
                }}>
                  <div style={{flex:1,background:"#DDD",borderRadius:99,height:8,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:lesson.color,borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:900,color:lesson.color,whiteSpace:"nowrap"}}>
                    {lesson.done}/{lesson.total} bài
                  </span>
                </div>

                <button onClick={onStart} style={{
                  width:"100%",padding:"16px",borderRadius:20,marginBottom:10,
                  background:lesson.color,color:"#fff",
                  border:"1.5px solid rgba(0,0,0,0.13)",boxShadow:"0 6px 20px rgba(0,0,0,0.15)",
                  fontSize:20,fontWeight:900,cursor:"pointer",
                  fontFamily:"'Nunito',cursive",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                }}>
                  <span style={{fontSize:26}}>🚀</span> Học ngay!
                </button>

                <button onClick={onBack} style={{
                  width:"100%",padding:"12px",borderRadius:16,
                  background:"#fff",color:"#888",
                  border:"3px solid #DDD",fontSize:14,fontWeight:800,
                  cursor:"pointer",fontFamily:"'Nunito',cursive",
                }}>Để sau 📅</button>
              </div>
            )}

            {!unlocked && (
              <div style={{fontSize:18,fontWeight:800,color:"#888"}}>Đang mở khóa... 🔓</div>
            )}
          </div>
        </WoodenFrame>
        <RightDeco />
      </div>
    </SkyWrap>
  );
}

// ════════════════════════════════════════════════════════════════════
// LESSON CARD & LIST VIEW
// ════════════════════════════════════════════════════════════════════
function LessonCard({ lesson, onStart, onWorkbook }: { lesson: Lesson; onStart: () => void; onWorkbook: () => void }) {
  const pct = lesson.total > 0 ? Math.round(lesson.done / lesson.total * 100) : 0;
  const done = lesson.done === lesson.total && lesson.total > 0;

  return (
    <div style={{
      borderRadius:20,overflow:"hidden",
      boxShadow: lesson.locked ? "none" : "0 4px 18px rgba(0,0,0,0.13)",
      background:"#fff",position:"relative",
      opacity: lesson.locked ? 0.6 : 1,
    }}>
      {lesson.isNew && !lesson.locked && (
        <div style={{position:"absolute",top:10,left:10,zIndex:2,background:"#FF6B35",color:"#fff",fontSize:10,fontWeight:900,padding:"3px 10px",borderRadius:99,border:"2px solid #fff"}}>MỚI!</div>
      )}
      {done && (
        <div style={{position:"absolute",top:10,right:10,zIndex:2,background:"#6BCF7F",color:"#fff",fontSize:10,fontWeight:900,padding:"3px 10px",borderRadius:99,border:"2px solid #fff"}}>✅ XONG!</div>
      )}
      {lesson.locked && (
        <div style={{position:"absolute",top:10,right:10,zIndex:2,background:"#888",color:"#fff",fontSize:12,fontWeight:900,padding:"3px 12px",borderRadius:99,border:"2px solid #fff"}}>🔒</div>
      )}

      <div style={{background:lesson.locked?"#E0E0E0":lesson.grad,height:130,display:"flex",alignItems:"center",justifyContent:"center",gap:8,position:"relative",overflow:"hidden"}}>
        {lesson.locked
          ? <span style={{fontSize:48,filter:"grayscale(1)"}}>🔒</span>
          : lesson.chars.map((ch,ci)=>(
            <span key={ci} style={{fontSize:40+ci*6,filter:"drop-shadow(2px 4px 6px rgba(0,0,0,0.2))",animation:`mn-bounce ${1.8+ci*0.4}s ease-in-out ${ci*0.3}s infinite`}}>{ch}</span>
          ))
        }
        {[[8,10],[80,14],[14,80]].map(([x,y],i)=>(
          <div key={i} style={{position:"absolute",left:x,top:y,width:10,height:10,borderRadius:"50%",background:"rgba(255,255,255,0.3)"}}/>
        ))}
      </div>

      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:14,fontWeight:900,color:"#1A1A1A",marginBottom:2}}>{lesson.title}</div>
        <div style={{fontSize:11,color:"#999",marginBottom:10,fontWeight:600}}>{lesson.subtitle}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{flex:1,background:"#EEE",borderRadius:99,height:7,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:lesson.color,borderRadius:99}}/>
          </div>
          <span style={{fontSize:10,fontWeight:800,color:lesson.color,whiteSpace:"nowrap"}}>{lesson.done}/{lesson.total}</span>
        </div>
        <button onClick={lesson.locked ? undefined : onStart} disabled={!!lesson.locked} style={{
          width:"100%",background:"none",border:"none",padding:0,cursor:lesson.locked?"not-allowed":"pointer",
        }}>
          <div style={{
            background:lesson.locked?"#CCC":done?"#6BCF7F":lesson.color,
            color:"#fff",borderRadius:12,padding:"8px 0",textAlign:"center",
            fontSize:13,fontWeight:900,boxShadow:lesson.locked?"none":`0 3px 10px ${lesson.color}55`,
          }}>
            {lesson.locked?"🔒 Chưa mở khóa":done?"✅ Học lại":lesson.done>0?"▶ Tiếp tục":"▶ Bắt đầu học"}
          </div>
        </button>
        {!lesson.locked && (
          <button onClick={onWorkbook} style={{
            width:"100%",background:"none",border:"none",padding:"6px 0 0",cursor:"pointer",
          }}>
            <div style={{
              background:"#FFF9E6",border:`2px solid #FFD93D`,
              color:"#8B6000",borderRadius:12,padding:"7px 0",textAlign:"center",
              fontSize:12,fontWeight:900,
            }}>
              📝 Làm bài tập
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function LessonListView({ tab, onTabChange, onSelectLesson, onSelectWorkbook, onBack }: {
  tab: StemCategory;
  onTabChange: (t: StemCategory) => void;
  onSelectLesson: (l: Lesson) => void;
  onSelectWorkbook: (l: Lesson) => void;
  onBack: () => void;
}) {
  const cat = STEM_DATA[tab];
  return (
    <SkyWrap>
      <TopPill onBack={onBack}>
        <span style={{fontSize:16,fontWeight:900,color:"#FF6B35"}}>📚 Chương trình STEM Mầm Non</span>
        <div style={{background:"#FF6B35",color:"#fff",borderRadius:99,padding:"3px 12px",fontSize:13,fontWeight:900}}>S·T·E·M</div>
      </TopPill>

      <div style={{display:"flex",gap:14,alignItems:"flex-start",position:"relative",zIndex:10}}>
        <LeftDeco letter="S" />
        <WoodenFrame header={
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:38,height:38,borderRadius:10,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🐝</div>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>Chương Trình Học</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:700}}>STEM Mầm Non · 3–5 tuổi</div>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.2)",borderRadius:99,padding:"5px 14px",fontSize:12,color:"#fff",fontWeight:700}}>
              {Object.values(STEM_DATA).reduce((a,c)=>a+c.lessons.filter(l=>l.done>0).length,0)} bài đã học
            </div>
          </div>
        }>
          {/* STEM tabs */}
          <div style={{background:"#fff",padding:"12px 16px",display:"flex",gap:8,borderBottom:"2px solid #F0E6D0"}}>
            {STEM_ORDER.map(k=>{
              const d=STEM_DATA[k]; const active=tab===k;
              return (
                <button key={k} onClick={()=>onTabChange(k)} style={{
                  flex:1,padding:"10px 8px",borderRadius:16,
                  fontSize:13,fontWeight:900,fontFamily:"'Nunito',cursive",
                  background:active?d.color:"#F5F5F5",color:active?"#fff":"#999",
                  border:"none",cursor:"pointer",
                  boxShadow:active?`0 4px 14px ${d.color}55`:"none",
                  transition:"all 0.15s",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                }}>
                  <span style={{fontSize:22}}>{d.emoji}</span>
                  <span style={{fontSize:16,fontWeight:900}}>{k}</span>
                  <span style={{fontSize:10,opacity:active?0.9:0.7}}>{d.vi}</span>
                </button>
              );
            })}
          </div>
          {/* Category desc */}
          <div style={{background:cat.color+"18",padding:"12px 20px",display:"flex",alignItems:"center",gap:10,borderBottom:"2px solid #F0E6D0"}}>
            <span style={{fontSize:26}}>{cat.emoji}</span>
            <div>
              <div style={{fontSize:15,fontWeight:900,color:cat.color}}>{cat.label} — {cat.vi}</div>
              <div style={{fontSize:12,color:"#666",fontWeight:600}}>{cat.desc}</div>
            </div>
            <div style={{marginLeft:"auto",background:cat.color,color:"#fff",borderRadius:99,padding:"4px 14px",fontSize:12,fontWeight:900}}>
              {cat.lessons.filter(l=>l.done===l.total&&l.total>0).length}/{cat.lessons.length} xong
            </div>
          </div>
          {/* Grid */}
          <div style={{padding:16,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {cat.lessons.map(lesson=>(
              <LessonCard
                key={lesson.id} lesson={lesson}
                onStart={()=>onSelectLesson(lesson)}
                onWorkbook={()=>onSelectWorkbook(lesson)}
              />
            ))}
          </div>
        </WoodenFrame>
        <RightDeco letter="M" />
      </div>
    </SkyWrap>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN — Flow Controller
// ════════════════════════════════════════════════════════════════════
export function MamNonLessons() {
  const navigate = useNavigate();
  const location = useLocation();
  const autoPlay = (location.state as { autoPlay?: boolean } | null)?.autoPlay === true;

  const [history, setHistory] = useState<Step[]>(() =>
    autoPlay
      ? [{ type: "player", lesson: IN_PROGRESS, source: "greeting" as const }]
      : [{ type: "lessons", tab: "S" as const }]
  );
  const [lessonTab, setLessonTab] = useState<StemCategory>("S");

  const current = history[history.length - 1];
  const push = (step: Step) => setHistory(h => [...h, step]);
  const back = () => {
    if (history.length <= 1) { navigate("/student/dashboard"); }
    else { setHistory(h => h.slice(0, -1)); }
  };

  // ── Lesson list ──
  if (current.type === "lessons") {
    return (
      <LessonListView
        tab={current.tab}
        onTabChange={t => {
          setLessonTab(t);
          setHistory(h => [...h.slice(0,-1), { type:"lessons", tab:t }]);
        }}
        onSelectLesson={lesson => push({ type:"player", lesson, source:"lessons" })}
        onSelectWorkbook={lesson => push({ type:"workbook", lesson })}
        onBack={back}
      />
    );
  }

  // ── Player ──
  if (current.type === "player") {
    return (
      <MamNonLessonPlayer
        lesson={current.lesson}
        onBack={back}
        onComplete={
          current.source === "greeting"
            ? () => push({ type: "reward", lesson: current.lesson })
            : undefined
        }
      />
    );
  }

  // ── Reward ──
  if (current.type === "reward") {
    return (
      <RewardScreen
        lesson={current.lesson}
        onNext={() => push({ type: "unlock", lesson: NEXT_UNLOCK })}
        onBack={back}
      />
    );
  }

  // ── Unlock ──
  if (current.type === "unlock") {
    return (
      <UnlockScreen
        lesson={current.lesson}
        onStart={() => push({ type: "player", lesson: current.lesson, source: "lessons" })}
        onBack={back}
      />
    );
  }

  // ── Workbook ──
  if (current.type === "workbook") {
    const exData = WORKBOOK_DATA[current.lesson.id] ?? WORKBOOK_DATA["default"];
    return (
      <MamNonWorkbook
        lessonTitle={current.lesson.title}
        lessonSub="KHOA HỌC MẦM NON"
        lessonColor={current.lesson.color}
        exercises={exData}
        onBack={back}
      />
    );
  }

  return null;
}

export default MamNonLessons;
