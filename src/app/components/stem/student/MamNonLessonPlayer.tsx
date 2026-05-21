import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════════
   LESSON PLAYER MẦM NON
   Slide-based interactive lesson · 5 slide types:
   intro → video → activity → quiz → celebrate
   ════════════════════════════════════════════════════════════════════ */

interface LessonInfo {
  id: string;
  title: string;
  subtitle: string;
  chars: string[];
  color: string;
  grad: string;
  done: number;
  total: number;
}

interface Option {
  emoji: string;
  label: string;
  correct: boolean;
}

type SlideType = "intro" | "video" | "activity" | "quiz" | "celebrate";

interface Slide {
  type: SlideType;
  title: string;
  emoji: string;
  bg: string;
  description?: string;
  question?: string;
  options?: Option[];
  videoLabel?: string;
}

// ─── Generate slides from lesson info ────────────────────────────────
function buildSlides(lesson: LessonInfo): Slide[] {
  const [main, second, third] = lesson.chars;
  return [
    {
      type: "intro",
      title: lesson.title,
      emoji: main,
      bg: lesson.grad,
      description: lesson.subtitle,
    },
    {
      type: "video",
      title: `Xem & Nghe: ${lesson.title}`,
      emoji: "▶️",
      bg: "linear-gradient(145deg,#1A1A2E,#16213E)",
      videoLabel: `Bài học về ${lesson.title}`,
    },
    {
      type: "activity",
      title: "Tìm đúng hình nhé!",
      emoji: "🎯",
      bg: "linear-gradient(145deg,#FFD93D,#FF9F43)",
      question: `Con hãy chọn hình ${lesson.title.split(" ").pop()}!`,
      options: [
        { emoji: main,   label: lesson.title.split(" ").pop() ?? "Đúng", correct: true  },
        { emoji: second, label: lesson.subtitle.split(",")[0] ?? "Sai",  correct: false },
        { emoji: third ?? "❓", label: "Không phải", correct: false },
      ],
    },
    {
      type: "quiz",
      title: "Câu đố nhỏ!",
      emoji: "🧩",
      bg: "linear-gradient(145deg,#7c3aed,#A29BFE)",
      question: `${main} là gì?`,
      options: [
        { emoji: main,   label: "Đúng rồi! ✓",    correct: true  },
        { emoji: "❓",   label: "Không phải",       correct: false },
        { emoji: "🎈",   label: "Thử lại nhé!",    correct: false },
      ],
    },
    {
      type: "celebrate",
      title: "Xuất sắc! 🎉",
      emoji: "🏆",
      bg: "linear-gradient(145deg,#FFD93D,#FF6B35)",
      description: `Em đã hoàn thành bài "${lesson.title}"!`,
    },
  ];
}

// ─── Intro Slide ──────────────────────────────────────────────────────
function IntroSlide({ slide, lesson }: { slide: Slide; lesson: LessonInfo }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 24px 28px" }}>
      <div style={{
        background: lesson.grad,
        borderRadius: 28, padding: "32px 20px",
        marginBottom: 24,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}>
        <div style={{ fontSize: 100, lineHeight: 1, animation: "mn-bounce 2s ease-in-out infinite", filter: "drop-shadow(4px 8px 10px rgba(0,0,0,0.25))" }}>
          {lesson.chars[0]}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {lesson.chars.slice(1).map((c, i) => (
            <span key={i} style={{ fontSize: 56, filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))", animation: `mn-bounce ${1.8 + i * 0.3}s ease-in-out ${i * 0.4}s infinite` }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>{slide.title}</div>
      <div style={{
        display: "inline-block",
        background: lesson.color + "22", borderRadius: 99,
        padding: "8px 20px", fontSize: 15, fontWeight: 700, color: lesson.color,
      }}>{slide.description}</div>
      <div style={{ marginTop: 20, fontSize: 16, color: "#888", fontWeight: 600 }}>
        👇 Nhấn <strong style={{ color: lesson.color }}>Tiếp theo</strong> để bắt đầu!
      </div>
    </div>
  );
}

// ─── Video Slide ──────────────────────────────────────────────────────
function VideoSlide({ slide, lesson }: { slide: Slide; lesson: LessonInfo }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    if (progress >= 100) { setPlaying(false); return; }
    const t = setInterval(() => setProgress(p => Math.min(p + 2, 100)), 200);
    return () => clearInterval(t);
  }, [playing, progress]);

  return (
    <div style={{ padding: "20px 24px 28px" }}>
      {/* Video screen */}
      <div style={{
        background: "#0F0F1A", borderRadius: 24,
        padding: "32px 20px", marginBottom: 20,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        minHeight: 220, justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Star field deco */}
        {[20,80,140,200,260].map((x,i)=>(
          <div key={i} style={{position:"absolute",left:x,top:10+i*8,width:2,height:2,borderRadius:"50%",background:"rgba(255,255,255,0.5)"}}/>
        ))}

        {/* Characters on screen */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {lesson.chars.map((c, i) => (
            <span key={i} style={{
              fontSize: 60 + i * 8, lineHeight: 1,
              filter: `drop-shadow(0 0 12px ${lesson.color}99)`,
              animation: playing ? `mn-bounce ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` : "none",
            }}>{c}</span>
          ))}
        </div>

        {/* Play button */}
        {!playing && progress < 100 && (
          <button onClick={() => setPlaying(true)} style={{
            width: 72, height: 72, borderRadius: "50%",
            background: lesson.color, border: "4px solid #fff",
            boxShadow: `0 0 0 6px ${lesson.color}44, 0 8px 24px rgba(0,0,0,0.4)`,
            fontSize: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900,
          }}>▶</button>
        )}
        {playing && (
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
            {[1,2,3,4,5,4,3,2,1].map((h,i)=>(
              <div key={i} style={{
                width: 8, borderRadius: 4,
                background: lesson.color,
                height: h * 8,
                animation: `mn-wave ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
              }}/>
            ))}
          </div>
        )}
        {progress >= 100 && (
          <div style={{ fontSize: 52 }}>✅</div>
        )}

        {/* Progress bar */}
        <div style={{ width: "100%", background: "rgba(255,255,255,0.15)", borderRadius: 99, height: 8 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: lesson.color, borderRadius: 99, transition: "width 0.2s" }} />
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
          {progress < 100 ? (playing ? "Đang phát..." : "Nhấn ▶ để xem") : "✓ Đã xem xong!"}
        </div>
      </div>
      <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: "#555" }}>
        📹 {slide.videoLabel}
      </div>
    </div>
  );
}

// ─── Activity Slide ───────────────────────────────────────────────────
function ActivitySlide({ slide, lesson, onCorrect }: { slide: Slide; lesson: LessonInfo; onCorrect: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const opts = slide.options ?? [];

  const choose = (i: number) => {
    if (confirmed) return;
    setSelected(i);
  };
  const confirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    if (opts[selected].correct) setTimeout(onCorrect, 1200);
  };
  const reset = () => { setSelected(null); setConfirmed(false); };

  return (
    <div style={{ padding: "20px 24px 28px" }}>
      {/* Question banner */}
      <div style={{
        background: lesson.grad, borderRadius: 20,
        padding: "18px 20px", marginBottom: 24, textAlign: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🎯</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", textShadow: "1px 1px 0 rgba(0,0,0,0.2)" }}>
          {slide.question}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {opts.map((opt, i) => {
          const isSelected = selected === i;
          const showResult = confirmed && isSelected;
          const bg = showResult ? (opt.correct ? "#6BCF7F" : "#FF6B35") : isSelected ? lesson.color : "#F0F4F8";
          return (
            <button key={i} onClick={() => choose(i)} style={{
              borderRadius: 20, padding: "20px 10px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              background: bg,
              border: `3px solid ${isSelected ? "#1A1A1A" : "#E0E0E0"}`,
              boxShadow: isSelected ? "0 6px 20px rgba(0,0,0,0.15)" : "2px 2px 0 #E0E0E0",
              cursor: confirmed ? "default" : "pointer",
              transform: isSelected ? "translateY(-3px)" : "none",
              transition: "all 0.15s",
              fontFamily: "'Nunito',cursive",
            }}>
              <span style={{ fontSize: 56, filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))" }}>{opt.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 900, color: isSelected ? "#fff" : "#555", textAlign: "center" }}>
                {showResult ? (opt.correct ? "✓ Đúng rồi!" : "✗ Thử lại") : opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Confirm / retry */}
      {!confirmed ? (
        <button onClick={confirm} disabled={selected === null} style={{
          width: "100%", padding: "14px", borderRadius: 18,
          background: selected !== null ? lesson.color : "#E0E0E0",
          color: "#fff", fontSize: 18, fontWeight: 900,
          border: "none", cursor: selected !== null ? "pointer" : "not-allowed",
          boxShadow: selected !== null ? `0 6px 20px ${lesson.color}55` : "none",
          fontFamily: "'Nunito',cursive",
          transition: "all 0.15s",
        }}>
          {selected !== null ? "✓ Kiểm tra!" : "👆 Chọn một hình đi!"}
        </button>
      ) : !opts[selected!]?.correct ? (
        <button onClick={reset} style={{
          width: "100%", padding: "14px", borderRadius: 18,
          background: "#FF6B35", color: "#fff",
          fontSize: 18, fontWeight: 900, border: "none", cursor: "pointer",
          boxShadow: "0 6px 20px #FF6B3555",
          fontFamily: "'Nunito',cursive",
        }}>🔄 Thử lại nhé!</button>
      ) : (
        <div style={{ textAlign: "center", fontSize: 20, fontWeight: 900, color: "#6BCF7F" }}>
          🎉 Đúng rồi! Tuyệt vời!
        </div>
      )}
    </div>
  );
}

// ─── Quiz Slide ───────────────────────────────────────────────────────
function QuizSlide({ slide, lesson, onCorrect }: { slide: Slide; lesson: LessonInfo; onCorrect: () => void }) {
  return <ActivitySlide slide={slide} lesson={lesson} onCorrect={onCorrect} />;
}

// ─── Celebrate Slide ──────────────────────────────────────────────────
function CelebrateSlide({ lesson, onBack, onComplete }: { lesson: LessonInfo; onBack: () => void; onComplete?: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 24px" }}>
      {/* Trophy */}
      <div style={{ fontSize: 96, marginBottom: 12, animation: "mn-bounce 1.2s ease-in-out infinite" }}>🏆</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: "#FF6B35", marginBottom: 6 }}>Xuất sắc! 🎉</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#555", marginBottom: 24 }}>
        Em đã hoàn thành bài<br />
        <strong style={{ color: lesson.color }}>"{lesson.title}"</strong>!
      </div>

      {/* Stars earned */}
      <div style={{
        display: "inline-flex", gap: 12, alignItems: "center",
        background: "#FFF9E6", border: "3px solid #FFD93D",
        borderRadius: 20, padding: "14px 28px", marginBottom: 24,
        boxShadow: "4px 4px 0 #FFD93D",
      }}>
        <span style={{ fontSize: 36 }}>⭐</span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#FF6B35" }}>+3 Sao!</div>
          <div style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Tiếp tục học để kiếm thêm sao</div>
        </div>
      </div>

      {/* Flying stars animation */}
      <div style={{ position: "relative", height: 60, marginBottom: 20 }}>
        {[10,30,50,70,90].map((left, i) => (
          <div key={i} style={{
            position: "absolute", left: `${left}%`,
            fontSize: 22,
            animation: `mn-float-star ${1 + i * 0.2}s ease-in-out ${i * 0.15}s infinite alternate`,
          }}>⭐</div>
        ))}
      </div>

      {/* Lesson chars celebration */}
      <div style={{
        display: "flex", gap: 16, justifyContent: "center", marginBottom: 28,
      }}>
        {lesson.chars.map((c, i) => (
          <span key={i} style={{
            fontSize: 52, filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.2))",
            animation: `mn-bounce ${1.2 + i * 0.2}s ease-in-out ${i * 0.3}s infinite`,
          }}>{c}</span>
        ))}
      </div>

      <button onClick={onComplete ?? onBack} style={{
        background: lesson.color, color: "#fff",
        border: "1.5px solid rgba(0,0,0,0.13)", borderRadius: 20,
        padding: "14px 36px", fontSize: 18, fontWeight: 900,
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)", cursor: "pointer",
        fontFamily: "'Nunito',cursive",
        display: "inline-flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>{onComplete ? "🎁" : "📚"}</span>
        {onComplete ? "Nhận phần thưởng!" : "Về danh sách bài"}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN PLAYER COMPONENT
// ════════════════════════════════════════════════════════════════════
export function MamNonLessonPlayer({
  lesson,
  onBack,
  onComplete,
}: {
  lesson: LessonInfo;
  onBack: () => void;
  onComplete?: () => void;
}) {
  const slides = buildSlides(lesson);
  const [slideIdx, setSlideIdx] = useState(0);
  const [activityDone, setActivityDone] = useState(false);

  const slide = slides[slideIdx];
  const isFirst = slideIdx === 0;
  const isLast  = slideIdx === slides.length - 1;

  const next = () => {
    if (!isLast) { setSlideIdx(s => s + 1); setActivityDone(false); }
  };
  const prev = () => {
    if (!isFirst) { setSlideIdx(s => s - 1); setActivityDone(false); }
  };

  // Can the user advance from this slide?
  const canNext = slide.type === "activity" || slide.type === "quiz"
    ? activityDone
    : slide.type !== "celebrate";

  return (
    <div style={{
      background: "linear-gradient(180deg,#87CEEB 0%,#B5E0F5 55%,#A8D8A8 100%)",
      borderRadius: 24, minHeight: "85vh", padding: "24px 20px 28px",
      fontFamily: "'Nunito','Comic Sans MS',cursive,sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes float-cloud  { 0%,100%{transform:translateX(0)} 50%{transform:translateX(14px)} }
        @keyframes mn-bounce    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes mn-wave      { 0%{height:8px} 100%{height:32px} }
        @keyframes mn-float-star{ 0%{transform:translateY(0) rotate(-10deg)} 100%{transform:translateY(-20px) rotate(10deg)} }
      `}</style>

      {/* Clouds */}
      {[{w:100,h:38,top:16,left:"5%"},{w:70,h:28,top:50,left:"22%"},{w:85,h:34,top:10,right:"8%"}].map((c,i)=>(
        <div key={i} style={{
          position:"absolute",width:c.w,height:c.h,pointerEvents:"none",
          top:c.top,left:(c as any).left,right:(c as any).right,
          background:"rgba(255,255,255,0.88)",borderRadius:999,
          animation:"float-cloud 4s ease-in-out infinite",
          animationDelay:`${i*0.8}s`,
        }}/>
      ))}

      {/* Back pill */}
      <div style={{ textAlign:"center", marginBottom:20, position:"relative", zIndex:10 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:10,
          background:"rgba(255,255,255,0.88)", borderRadius:99,
          padding:"8px 20px", border:"3px solid rgba(255,255,255,0.95)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
        }}>
          <button onClick={onBack} style={{
            textDecoration:"none", background:"#FF6B35", color:"#fff",
            borderRadius:99, padding:"4px 14px", fontSize:13, fontWeight:900,
            border:"1.5px solid rgba(0,0,0,0.13)", boxShadow:"0 3px 10px rgba(0,0,0,0.13)",
            cursor:"pointer", fontFamily:"'Nunito',cursive",
          }}>← Quay lại</button>
          <span style={{fontSize:20}}>{lesson.chars[0]}</span>
          <span style={{fontSize:17,fontWeight:900,color:"#1A1A1A"}}>{lesson.title}</span>
        </div>
      </div>

      {/* Main scene */}
      <div style={{display:"flex",gap:14,alignItems:"flex-start",position:"relative",zIndex:10}}>

        {/* Left deco */}
        <div style={{flexShrink:0,width:72,display:"flex",flexDirection:"column",alignItems:"center",gap:8,paddingTop:8}}>
          <div style={{fontSize:54,lineHeight:1}}>🏠</div>
          <span style={{fontSize:34,animation:"mn-bounce 2s ease-in-out infinite"}}>👧</span>
        </div>

        {/* Wooden frame */}
        <div style={{
          flex:1, background:"#D4892A",
          borderRadius:28, padding:10,
          boxShadow:"0 8px 0 #A0621A, 0 14px 36px rgba(0,0,0,0.22)",
        }}>
          <div style={{background:"#FFF9F0",borderRadius:20,overflow:"hidden"}}>

            {/* Frame top: progress */}
            <div style={{
              background:"linear-gradient(135deg,#f59e0b,#f59e0b)",
              padding:"12px 20px",
              display:"flex",alignItems:"center",gap:14,
            }}>
              {/* Step dots */}
              <div style={{display:"flex",gap:8,flex:1}}>
                {slides.map((_,i)=>(
                  <div key={i} style={{
                    flex:1, height:8, borderRadius:99,
                    background: i <= slideIdx ? "#fff" : "rgba(255,255,255,0.3)",
                    transition:"all 0.3s",
                    boxShadow: i === slideIdx ? "0 0 0 2px rgba(255,255,255,0.5)" : "none",
                  }}/>
                ))}
              </div>
              <div style={{
                background:"rgba(255,255,255,0.2)",borderRadius:99,
                padding:"4px 12px",fontSize:12,fontWeight:900,color:"#fff",
                whiteSpace:"nowrap",
              }}>
                Bước {slideIdx + 1}/{slides.length}
              </div>
            </div>

            {/* Slide content */}
            <div style={{ minHeight: 360 }}>
              {slide.type === "intro" && (
                <IntroSlide slide={slide} lesson={lesson} />
              )}
              {slide.type === "video" && (
                <VideoSlide slide={slide} lesson={lesson} />
              )}
              {slide.type === "activity" && (
                <ActivitySlide
                  slide={slide} lesson={lesson}
                  onCorrect={() => setActivityDone(true)}
                />
              )}
              {slide.type === "quiz" && (
                <QuizSlide
                  slide={slide} lesson={lesson}
                  onCorrect={() => setActivityDone(true)}
                />
              )}
              {slide.type === "celebrate" && (
                <CelebrateSlide lesson={lesson} onBack={onBack} onComplete={onComplete} />
              )}
            </div>

            {/* Navigation bar */}
            {slide.type !== "celebrate" && (
              <div style={{
                borderTop:"2px solid #F0E6D0",
                padding:"14px 20px",
                display:"flex",alignItems:"center",justifyContent:"space-between",
                background:"#fff",
              }}>
                <button onClick={prev} disabled={isFirst} style={{
                  padding:"12px 24px", borderRadius:16,
                  fontSize:15, fontWeight:900, fontFamily:"'Nunito',cursive",
                  background: isFirst ? "#F0F0F0" : "#fff",
                  color: isFirst ? "#CCC" : "#555",
                  border: `3px solid ${isFirst ? "#E0E0E0" : "#1A1A1A"}`,
                  boxShadow: isFirst ? "none" : "0 4px 14px rgba(0,0,0,0.13)",
                  cursor: isFirst ? "not-allowed" : "pointer",
                  display:"flex",alignItems:"center",gap:8,
                }}>← Trước</button>

                {/* Slide type indicator */}
                <div style={{
                  background: lesson.color + "22", borderRadius:99,
                  padding:"6px 16px", fontSize:13, fontWeight:700, color:lesson.color,
                }}>
                  {{
                    intro:"🌟 Giới thiệu",
                    video:"📹 Xem video",
                    activity:"🎯 Hoạt động",
                    quiz:"🧩 Câu đố",
                    celebrate:"🎉 Hoàn thành",
                  }[slide.type]}
                </div>

                <button onClick={next} disabled={!canNext} style={{
                  padding:"12px 28px", borderRadius:16,
                  fontSize:15, fontWeight:900, fontFamily:"'Nunito',cursive",
                  background: canNext ? lesson.color : "#E0E0E0",
                  color:"#fff",
                  border: `3px solid ${canNext ? "#1A1A1A" : "#E0E0E0"}`,
                  boxShadow: canNext ? "0 4px 14px rgba(0,0,0,0.13)" : "none",
                  cursor: canNext ? "pointer" : "not-allowed",
                  display:"flex",alignItems:"center",gap:8,
                  transition:"all 0.15s",
                }}>
                  {canNext ? "Tiếp theo →" : (
                    slide.type === "activity" || slide.type === "quiz"
                      ? "Trả lời đúng để tiếp!"
                      : "Tiếp theo →"
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right deco */}
        <div style={{flexShrink:0,width:72,display:"flex",flexDirection:"column",alignItems:"center",gap:8,paddingTop:8}}>
          <div style={{fontSize:54,lineHeight:1}}>🏡</div>
          <span style={{fontSize:34,animation:"mn-bounce 2s ease-in-out 0.6s infinite"}}>🧒</span>
        </div>

      </div>
    </div>
  );
}

export default MamNonLessonPlayer;
