import { useState } from "react";

/* ════════════════════════════════════════════════════════════════════
   MẦM NON WORKBOOK — Vở bài tập tương tác
   Tham chiếu: SmartLMS SBT demo (sbt-demo.smartlms.edu.vn)
   ════════════════════════════════════════════════════════════════════ */

// ─── Types ─────────────────────────────────────────────────────────────
export interface WorkbookExercise {
  question: string;
  hint: string;
  cols: string[];
  rows: { label: string; example?: number[] }[];
  correct: Record<number, number[]>;
}

export interface WorkbookProps {
  lessonTitle: string;
  lessonSub: string;
  lessonColor: string;
  exercises: WorkbookExercise[];
  onBack: () => void;
}

// ─── Sample exercises ─────────────────────────────────────────────────
export const WORKBOOK_DATA: Record<string, WorkbookExercise[]> = {
  s1: [
    {
      question: "Đánh dấu ✓ vào ô phù hợp cho mỗi loại cây nhé!",
      hint: "Nhấp vào ô để đánh dấu ✓ nhé!",
      cols: ["Có hoa", "Cho quả", "Có lá xanh", "Có gai"],
      rows: [
        { label: "Ví dụ: Hoa hồng 🌹", example: [0, 2, 3] },
        { label: "Cây cam 🍊" },
        { label: "Cây chuối 🍌" },
        { label: "Cây dừa 🥥" },
        { label: "Cây sen 🪷" },
        { label: "Cây xương rồng 🌵" },
      ],
      correct: { 1: [0, 1, 2], 2: [1, 2], 3: [1, 2], 4: [0, 2], 5: [2, 3] },
    },
    {
      question: "Chọn ✓ vào cột đúng: cây này thuộc nhóm nào?",
      hint: "Mỗi cây có thể thuộc nhiều nhóm đó nhé!",
      cols: ["Cây ăn quả", "Cây làm thuốc", "Cây cảnh", "Cây lương thực"],
      rows: [
        { label: "Ví dụ: Cây lúa 🌾", example: [3] },
        { label: "Cây bưởi 🍈" },
        { label: "Cây nha đam 🌿" },
        { label: "Cây hoa lan 🌺" },
        { label: "Cây ngô 🌽" },
      ],
      correct: { 1: [0], 2: [1], 3: [2], 4: [3] },
    },
  ],
  s2: [
    {
      question: "Đánh dấu ✓ vào cột đúng cho mỗi con vật!",
      hint: "Quan sát kỹ rồi nhấp vào ô nhé!",
      cols: ["Có 4 chân", "Biết bay", "Sống dưới nước", "Ăn thực vật"],
      rows: [
        { label: "Ví dụ: Con mèo 🐱", example: [0] },
        { label: "Con chó 🐶" },
        { label: "Con cá 🐟" },
        { label: "Con chim 🐦" },
        { label: "Con thỏ 🐰" },
        { label: "Con bò 🐄" },
        { label: "Con vịt 🦆" },
      ],
      correct: { 1: [0], 2: [2], 3: [1], 4: [0, 3], 5: [0, 3], 6: [0, 1, 3] },
    },
  ],
  default: [
    {
      question: "Đánh dấu ✓ vào ô đúng cho mỗi hình!",
      hint: "Nhấp vào ô để đánh dấu ✓ nhé!",
      cols: ["Màu đỏ", "Màu xanh", "Màu vàng", "Hình tròn"],
      rows: [
        { label: "Ví dụ: Quả táo 🍎", example: [0] },
        { label: "Quả chuối 🍌" },
        { label: "Mặt trời ☀️" },
        { label: "Bầu trời 🌤️" },
        { label: "Quả nho 🍇" },
      ],
      correct: { 1: [2], 2: [2, 3], 3: [1], 4: [0, 3] },
    },
  ],
};

// ─── Bookshelf CSS art ────────────────────────────────────────────────
const SHELF_BOOKS = [
  [
    [16,82,"#FF8FAB"],[12,68,"#FFD93D"],[14,88,"#6BCF7F"],[10,72,"#74C0FC"],
    [16,76,"#7c3aed"],[13,84,"#FF9F43"],[11,70,"#5BB5D5"],[14,80,"#FF6B35"],
  ],
  [
    [13,74,"#A8D8A8"],[16,86,"#E8748A"],[11,68,"#FFD93D"],[14,78,"#6BCF7F"],
    [16,82,"#FF8FAB"],[12,90,"#74C0FC"],[15,72,"#7c3aed"],[13,76,"#FF9F43"],
  ],
  [
    [14,80,"#5BB5D5"],[11,68,"#FF6B35"],[16,84,"#A8D8A8"],[13,74,"#E8748A"],
    [15,88,"#FFD93D"],[12,72,"#6BCF7F"],[14,78,"#FF8FAB"],[16,82,"#74C0FC"],
  ],
  [
    [12,76,"#7c3aed"],[15,84,"#FF9F43"],[13,70,"#5BB5D5"],[16,88,"#FF6B35"],
    [11,74,"#A8D8A8"],[14,80,"#E8748A"],[16,86,"#FFD93D"],[12,72,"#6BCF7F"],
  ],
];

function Bookshelf() {
  return (
    <div style={{
      position:"absolute", left:0, top:0, bottom:0, width:152,
      background:"linear-gradient(180deg,#C9914A 0%,#B8803C 100%)",
      zIndex:2, overflow:"hidden", boxShadow:"4px 0 16px rgba(0,0,0,0.18)",
    }}>
      {/* Top cap */}
      <div style={{height:8,background:"#8B5E3C",boxShadow:"0 3px 6px rgba(0,0,0,0.2)"}}/>
      {SHELF_BOOKS.map((books, si) => (
        <div key={si}>
          <div style={{display:"flex",alignItems:"flex-end",padding:"0 6px",height:98,gap:2}}>
            {(books as [number,number,string][]).map(([w,h,color], bi) => (
              <div key={bi} style={{
                width:w, height:h, background:color,
                borderRadius:"2px 2px 0 0", flexShrink:0,
                border:"1px solid rgba(0,0,0,0.08)",
                position:"relative",
              }}>
                <div style={{position:"absolute",top:6,bottom:6,left:2,width:1,background:"rgba(0,0,0,0.1)"}}/>
                <div style={{position:"absolute",top:6,bottom:6,left:4,width:1,background:"rgba(255,255,255,0.15)"}}/>
              </div>
            ))}
          </div>
          <div style={{height:11,background:"#7A4F28",boxShadow:"0 3px 6px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.15)"}}/>
        </div>
      ))}
      {/* Floor strip */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(0deg,#D4B896,#C9A882)"}}/>
    </div>
  );
}

// ─── Window CSS art ────────────────────────────────────────────────────
function WindowDeco() {
  return (
    <div style={{
      position:"absolute", right:0, top:0, bottom:0, width:140,
      zIndex:2, overflow:"hidden",
      background:"linear-gradient(180deg,#FDECC8 0%,#F5D9A0 100%)",
      boxShadow:"-4px 0 16px rgba(0,0,0,0.12)",
    }}>
      {/* Window frame */}
      <div style={{
        position:"absolute", top:40, left:12, right:12, height:220,
        background:"linear-gradient(180deg,#87CEEB 0%,#B5E0F5 60%,#D4EDA4 100%)",
        borderRadius:8, border:"7px solid #B8803C",
        boxShadow:"inset 0 0 20px rgba(255,255,255,0.5),2px 2px 10px rgba(0,0,0,0.15)",
        overflow:"hidden",
      }}>
        {/* Panes */}
        <div style={{position:"absolute",top:"48%",left:0,right:0,height:5,background:"#B8803C"}}/>
        <div style={{position:"absolute",left:"48%",top:0,bottom:0,width:5,background:"#B8803C"}}/>
        {/* Sun */}
        <div style={{position:"absolute",top:14,right:14,width:26,height:26,borderRadius:"50%",background:"#FFD93D",boxShadow:"0 0 14px #FFD93D99"}}/>
        {/* Clouds */}
        <div style={{position:"absolute",top:22,left:6,width:42,height:16,borderRadius:99,background:"rgba(255,255,255,0.85)"}}/>
        <div style={{position:"absolute",top:12,left:16,width:28,height:12,borderRadius:99,background:"rgba(255,255,255,0.7)"}}/>
        {/* Ground */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"36%",background:"linear-gradient(0deg,#8BC34A,#AED581)"}}/>
        {/* Tree */}
        <div style={{position:"absolute",bottom:"32%",left:"20%"}}>
          <div style={{width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderBottom:"24px solid #4CAF50"}}/>
          <div style={{width:4,height:10,background:"#795548",margin:"0 auto"}}/>
        </div>
        <div style={{position:"absolute",bottom:"32%",right:"22%"}}>
          <div style={{width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderBottom:"20px solid #66BB6A"}}/>
          <div style={{width:3,height:8,background:"#795548",margin:"0 auto"}}/>
        </div>
      </div>
      {/* Curtains */}
      <div style={{position:"absolute",top:32,left:0,width:20,height:238,background:"linear-gradient(90deg,#FFB347,#FFA020)",borderRadius:"0 0 8px 0",opacity:0.85}}/>
      <div style={{position:"absolute",top:32,right:0,width:20,height:238,background:"linear-gradient(270deg,#FFB347,#FFA020)",borderRadius:"0 0 0 8px",opacity:0.85}}/>
      {/* Curtain rod */}
      <div style={{position:"absolute",top:32,left:0,right:0,height:8,background:"#8B5E3C",borderRadius:4}}/>
      {/* Cushion */}
      <div style={{position:"absolute",bottom:48,left:14,right:14,height:26,background:"#FF8FAB",borderRadius:13,border:"3px solid #E8748A",boxShadow:"0 3px 10px rgba(0,0,0,0.15)"}}/>
      <div style={{position:"absolute",bottom:28,left:20,right:20,height:22,background:"#FFCC80",borderRadius:11,border:"3px solid #FFB347",boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}/>
    </div>
  );
}

// ─── Checkbox cell ─────────────────────────────────────────────────────
function CheckCell({ checked, disabled, onChange }: {
  checked: boolean; disabled?: boolean; onChange: () => void;
}) {
  return (
    <div onClick={disabled ? undefined : onChange} style={{
      width:36, height:36, borderRadius:10, flexShrink:0,
      border: checked ? "2.5px solid #16A34A" : "2.5px solid #D0D0D0",
      background: checked ? "#F0FFF4" : "#F8F8F8",
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor: disabled ? "default" : "pointer",
      transition:"all 0.15s",
      boxShadow: checked ? "0 0 0 3px #16A34A22" : "inset 0 1px 3px rgba(0,0,0,0.06)",
    }}>
      {checked && (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path d="M4 10 L8 14 L16 6" stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export function MamNonWorkbook({ lessonTitle, lessonSub, lessonColor, exercises, onBack }: WorkbookProps) {
  const [exIdx, setExIdx] = useState(0);
  const [checked, setChecked] = useState<Record<number, Record<number, boolean>>>({});

  const ex = exercises[exIdx];

  const countCorrect = () => {
    let count = 0;
    Object.entries(ex.correct).forEach(([rowStr, correctCols]) => {
      const row = Number(rowStr);
      correctCols.forEach(col => { if (checked[row]?.[col]) count++; });
    });
    return count;
  };
  const totalCorrect = Object.values(ex.correct).reduce((a, b) => a + b.length, 0);

  const toggle = (row: number, col: number) => {
    setChecked(prev => ({
      ...prev,
      [row]: { ...(prev[row] || {}), [col]: !(prev[row]?.[col]) },
    }));
  };

  const goEx = (dir: 1 | -1) => {
    const next = exIdx + dir;
    if (next < 0 || next >= exercises.length) return;
    setExIdx(next);
    setChecked({});
  };

  const currentScore = countCorrect();

  return (
    <div style={{
      position:"relative", minHeight:"85vh",
      background:"linear-gradient(180deg,#FFF8EE 0%,#FDECD4 60%,#F8E0B8 100%)",
      borderRadius:20, overflow:"hidden",
      fontFamily:"'Nunito','Segoe UI',sans-serif",
      display:"flex", flexDirection:"column",
    }}>
      <style>{`
        @keyframes wb-bee { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-6px) rotate(3deg)} }
      `}</style>

      <Bookshelf />
      <WindowDeco />

      {/* ── TOP BAR ── */}
      <div style={{
        background:"#FFD93D", padding:"10px 16px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"relative", zIndex:10,
        borderBottom:"3px solid #ECC200",
        boxShadow:"0 2px 8px rgba(0,0,0,0.12)",
      }}>
        {/* Left: number + title */}
        <div style={{display:"flex",alignItems:"center",gap:12,paddingLeft:160}}>
          <div style={{
            width:44, height:44, borderRadius:12,
            background:"#1A1A1A",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, fontWeight:900, color:"#FFD93D",
            boxShadow:"2px 2px 0 rgba(0,0,0,0.3)",
          }}>{exIdx + 1}</div>
          <div>
            <div style={{fontSize:15,fontWeight:900,color:"#1A1A1A"}}>{lessonTitle} — CÂU {exIdx + 1}</div>
            <div style={{fontSize:11,fontWeight:700,color:"#8B6000"}}>{lessonSub}</div>
          </div>
        </div>

        {/* Right: controls */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Sound */}
          <button style={{
            width:40, height:40, borderRadius:10,
            background:"rgba(255,255,255,0.8)", border:"2px solid rgba(0,0,0,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", fontSize:18,
          }}>🔊</button>

          {/* Prev */}
          <button onClick={() => goEx(-1)} disabled={exIdx === 0} style={{
            width:40, height:40, borderRadius:10,
            background: exIdx === 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
            border:"2px solid rgba(0,0,0,0.12)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor: exIdx === 0 ? "not-allowed" : "pointer",
            fontSize:18, fontWeight:900,
            color: exIdx === 0 ? "#CCC" : "#333",
          }}>←</button>

          {/* Next */}
          <button onClick={() => goEx(1)} disabled={exIdx === exercises.length - 1} style={{
            width:40, height:40, borderRadius:10,
            background: exIdx < exercises.length - 1 ? "#1A1A1A" : "rgba(255,255,255,0.4)",
            border:"2.5px solid rgba(0,0,0,0.15)",
            boxShadow: exIdx < exercises.length - 1 ? "2px 2px 0 rgba(0,0,0,0.25)" : "none",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor: exIdx === exercises.length - 1 ? "not-allowed" : "pointer",
            fontSize:18, fontWeight:900,
            color: exIdx < exercises.length - 1 ? "#FFD93D" : "#CCC",
          }}>→</button>

          {/* Reset */}
          <button onClick={() => setChecked({})} style={{
            width:40, height:40, borderRadius:10,
            background:"rgba(255,255,255,0.8)", border:"2px solid rgba(0,0,0,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", fontSize:18,
          }}>↺</button>

          {/* Back */}
          <button onClick={onBack} style={{
            padding:"8px 16px", borderRadius:10,
            background:"#FF6B35", color:"#fff",
            border:"1.5px solid rgba(0,0,0,0.12)", boxShadow:"0 3px 12px rgba(0,0,0,0.12)",
            fontSize:13, fontWeight:900, cursor:"pointer",
            fontFamily:"'Nunito',cursive", marginLeft:4,
          }}>← Quay lại</button>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div style={{
        flex:1, padding:"20px 156px 16px 168px",
        position:"relative", zIndex:10,
        display:"flex", flexDirection:"column",
      }}>
        <div style={{
          background:"#fff",
          borderRadius:20, overflow:"hidden",
          boxShadow:"0 4px 28px rgba(0,0,0,0.1)",
          flex:1, display:"flex", flexDirection:"column",
        }}>
          {/* Question */}
          <div style={{padding:"22px 28px 14px"}}>
            <p style={{fontSize:17,fontWeight:700,color:"#1A1A1A",margin:0,lineHeight:1.55}}>
              {ex.question}
            </p>
            <div style={{height:3,width:72,background:"#16A34A",borderRadius:99,marginTop:10}}/>
          </div>

          {/* Table */}
          <div style={{overflowX:"auto",flex:1}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={{
                    background:"#16A34A", color:"#fff",
                    padding:"14px 22px", textAlign:"left",
                    fontSize:14, fontWeight:700, minWidth:200,
                  }}>Đặc điểm</th>
                  {ex.cols.map((col, ci) => (
                    <th key={ci} style={{
                      background:"#16A34A", color:"#fff",
                      padding:"14px 18px", textAlign:"center",
                      fontSize:13, fontWeight:700, minWidth:110,
                      borderLeft:"1.5px solid rgba(255,255,255,0.25)",
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ex.rows.map((row, ri) => {
                  const isExample = ri === 0 && !!row.example;
                  const isEven = ri % 2 === 0;
                  return (
                    <tr key={ri} style={{
                      background: isExample ? "#F0FFF4" : isEven ? "#FAFFFE" : "#fff",
                      borderBottom:"1px solid #EAEAEA",
                      transition:"background 0.1s",
                    }}>
                      <td style={{
                        padding:"13px 22px",
                        fontSize:14,
                        fontWeight: isExample ? 700 : 500,
                        color: isExample ? "#16A34A" : "#333",
                        fontStyle: isExample ? "italic" : "normal",
                        borderRight:"1px solid #EAEAEA",
                      }}>
                        {row.label}
                      </td>
                      {ex.cols.map((_, ci) => {
                        const isExChecked = isExample && (row.example?.includes(ci) ?? false);
                        const isChecked = isExample ? isExChecked : !!(checked[ri]?.[ci]);
                        return (
                          <td key={ci} style={{
                            padding:"13px 18px", textAlign:"center",
                            borderLeft:"1px solid #EAEAEA",
                          }}>
                            <div style={{display:"flex",justifyContent:"center"}}>
                              <CheckCell
                                checked={isChecked}
                                disabled={isExample}
                                onChange={() => !isExample && toggle(ri, ci)}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{
        background:"rgba(255,255,255,0.94)",
        backdropFilter:"blur(8px)",
        borderTop:"2px solid rgba(0,0,0,0.06)",
        padding:"10px 20px",
        display:"flex", alignItems:"center", gap:14,
        position:"relative", zIndex:10,
      }}>
        {/* Spacer for bookshelf */}
        <div style={{width:152, flexShrink:0}}/>

        {/* Bee mascot */}
        <div style={{
          fontSize:50, lineHeight:1, flexShrink:0,
          animation:"wb-bee 2.5s ease-in-out infinite",
          userSelect:"none",
        }}>🐝</div>

        {/* Speech bubble */}
        <div style={{
          flex:1,
          background:"#fff",
          border:"2.5px solid #FFD93D",
          borderRadius:"18px",
          padding:"10px 20px",
          fontSize:14, fontWeight:700, color:"#555",
          position:"relative",
          boxShadow:"0 2px 10px rgba(0,0,0,0.08)",
        }}>
          {ex.hint}
          <div style={{
            position:"absolute", left:-11, top:"50%",
            transform:"translateY(-50%)",
            width:0, height:0,
            borderTop:"7px solid transparent",
            borderBottom:"7px solid transparent",
            borderRight:"11px solid #FFD93D",
          }}/>
          <div style={{
            position:"absolute", left:-8, top:"50%",
            transform:"translateY(-50%)",
            width:0, height:0,
            borderTop:"6px solid transparent",
            borderBottom:"6px solid transparent",
            borderRight:"9px solid #fff",
          }}/>
        </div>

        {/* Exercise pagination */}
        <div style={{
          display:"flex", gap:6, flexShrink:0, alignItems:"center",
        }}>
          {exercises.map((_, i) => (
            <button key={i} onClick={() => { setExIdx(i); setChecked({}); }} style={{
              width:28, height:28, borderRadius:8,
              background: i === exIdx ? lessonColor : "#F0F0F0",
              border: i === exIdx ? `2px solid ${lessonColor}` : "2px solid #E0E0E0",
              fontSize:12, fontWeight:900,
              color: i === exIdx ? "#fff" : "#999",
              cursor:"pointer",
            }}>{i + 1}</button>
          ))}
        </div>

        {/* Score */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:"#F0FFF4", border:"2px solid #16A34A",
          borderRadius:14, padding:"10px 18px", flexShrink:0,
        }}>
          <span style={{fontSize:18,color:"#16A34A"}}>✓</span>
          <span style={{fontSize:14,fontWeight:900,color:"#16A34A",whiteSpace:"nowrap"}}>
            {currentScore} / {totalCorrect} ô đúng
          </span>
        </div>
      </div>
    </div>
  );
}

export default MamNonWorkbook;
