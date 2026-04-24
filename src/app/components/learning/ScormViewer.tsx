import { useState, useEffect, useRef, useCallback } from "react";
import {
  Package, Maximize2, Minimize2, Lightbulb, AlertCircle,
  ChevronLeft, ChevronRight, CheckCircle2, CircleX, CircleHelp,
  Award, BarChart3, Clock,
  BookOpen, Shield, Zap, Brain,
  RotateCcw, ChevronDown, ChevronUp,
  CircleCheck, Trophy, Star,
} from "lucide-react";
import type { Lesson } from "./types";

/* ============================================================ */
/*  SCORM DATA: Info Pages + Quiz Questions                      */
/* ============================================================ */

interface ScormInfoPage {
  id: string;
  title: string;
  subtitle?: string;
  type: "intro" | "content" | "scenario" | "matrix";
  content: string;
  bullets?: string[];
  tip?: string;
  image?: "risk-matrix" | "process-flow" | "org-chart";
}

interface ScormQuizQuestion {
  id: string;
  type: "single" | "multiple" | "true_false" | "scenario";
  question: string;
  scenario?: string;
  options: string[];
  correctAnswers: number[];
  explanation: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
}

const INFO_PAGES: ScormInfoPage[] = [
  {
    id: "P1", type: "intro",
    title: "Mô phỏng Quản lý Rủi ro Doanh nghiệp",
    subtitle: "Dành cho lãnh đạo cấp trung tại Tập đoàn Geleximco",
    content: "Module e-learning tương tác này giúp bạn hiểu và áp dụng quy trình quản lý rủi ro toàn diện (ERM — Enterprise Risk Management) phù hợp với đặc thù hoạt động đa ngành của Geleximco.",
    bullets: [
      "Nhận diện các loại rủi ro chính trong hệ sinh thái Geleximco",
      "Đánh giá mức độ tác động và xác suất xảy ra",
      "Xây dựng kế hoạch ứng phó và giảm thiểu rủi ro",
      "Áp dụng thực tế qua các tình huống mô phỏng",
    ],
    tip: "Thời gian dự kiến: 45 phút · Yêu cầu đạt ≥70% để hoàn thành module",
  },
  {
    id: "P2", type: "content",
    title: "Khung Quản lý Rủi ro Geleximco",
    content: "Với 14 công ty thành viên hoạt động trên 10 lĩnh vực khác nhau (Tài chính-Ngân hàng, Bất động sản, Khoáng sản, VLXD, Năng lượng, Hạ tầng...), Geleximco áp dụng khung ERM theo chuẩn ISO 31000:2018 được customize cho đặc thù Tập đoàn.",
    bullets: [
      "Rủi ro Chiến lược — Thay đổi chính sách, cạnh tranh thị trường, biến động vĩ mô",
      "Rủi ro Tài chính — Tỷ giá, lãi suất, thanh khoản, nợ xấu (đặc biệt tại ABBank)",
      "Rủi ro Vận hành — An toàn lao động, chất lượng sản phẩm, gián đoạn chuỗi cung ứng",
      "Rủi ro Pháp lý — Tuân thủ quy định, giấy phép, tranh chấp hợp đồng",
      "Rủi ro Danh tiếng — Truyền thông, ESG, quan hệ cộng đồng",
    ],
    tip: "Mỗi công ty thành viên cần có Đơn vị Quản lý Rủi ro (RMU) báo cáo trực tiếp Ban Giám đốc.",
  },
  {
    id: "P3", type: "matrix",
    title: "Ma trận Đánh giá Rủi ro",
    content: "Sử dụng ma trận 5×5 để đánh giá mức độ rủi ro dựa trên hai yếu tố: Xác suất xảy ra (Likelihood) và Mức độ tác động (Impact). Kết quả chia thành 4 vùng: Thấp (xanh), Trung bình (vàng), Cao (cam), Nghiêm trọng (đỏ).",
    bullets: [
      "Vùng Xanh (1-4 điểm): Chấp nhận rủi ro, theo dõi định kỳ",
      "Vùng Vàng (5-9 điểm): Giảm thiểu chủ động, có kế hoạch dự phòng",
      "Vùng Cam (10-16 điểm): Hành động ngay, báo cáo Ban Giám đốc",
      "Vùng Đỏ (17-25 điểm): Xử lý khẩn cấp, leo thang lên Tập đoàn",
    ],
    image: "risk-matrix",
    tip: "Tại Geleximco, mọi rủi ro vùng Cam + Đỏ phải được báo cáo trong 24 giờ qua hệ thống LMS.",
  },
  {
    id: "P4", type: "scenario",
    title: "Tình huống: Dự án BĐS Hải Phòng",
    content: "Bạn là Phó Giám đốc phụ trách Dự án KĐT mới tại Hải Phòng (Geleximco Land). Dự án trị giá 4,200 tỷ VNĐ, dự kiến triển khai trong 36 tháng. Trong quá trình chuẩn bị, bạn nhận thấy một số tín hiệu rủi ro sau:",
    bullets: [
      "Giá thép và xi măng tăng 15-20% so với dự toán ban đầu (nguồn: Xi măng Thăng Long)",
      "Quy hoạch giao thông kết nối khu vực có thể bị điều chỉnh theo kế hoạch mới của TP",
      "Đối thủ cạnh tranh vừa công bố dự án tương tự cách đó 5km với giá bán thấp hơn 10%",
      "Lãi suất vay mua nhà đang có xu hướng tăng, ảnh hưởng đến sức mua",
    ],
    tip: "Hãy đọc kỹ tình huống. Phần Quiz tiếp theo sẽ hỏi về cách xử lý các rủi ro trong tình huống này.",
  },
];

const QUIZ_QUESTIONS: ScormQuizQuestion[] = [
  {
    id: "SQ1", type: "single", difficulty: "easy", points: 10,
    question: "Theo khung ERM của Geleximco (ISO 31000), việc giá nguyên vật liệu tăng 15-20% thuộc loại rủi ro nào?",
    options: ["Rủi ro Chiến lược", "Rủi ro Tài chính", "Rủi ro Vận hành", "Rủi ro Pháp lý"],
    correctAnswers: [2],
    explanation: "Biến động giá nguyên vật liệu ảnh hưởng trực tiếp đến chi phí vận hành và tiến độ thi công. Đây là rủi ro Vận hành (Operational Risk), cần điều chỉnh dự toán và tìm nguồn cung thay thế.",
  },
  {
    id: "SQ2", type: "true_false", difficulty: "easy", points: 10,
    question: "Mọi rủi ro nằm trong vùng Cam và Đỏ của ma trận đánh giá phải được báo cáo trong vòng 24 giờ qua hệ thống LMS của Geleximco.",
    options: ["Đúng", "Sai"],
    correctAnswers: [0],
    explanation: "Đúng. Theo quy trình ERM của Geleximco, rủi ro vùng Cam (10-16 điểm) và Đỏ (17-25 điểm) phải được báo cáo khẩn cấp trong 24 giờ qua hệ thống quản lý rủi ro tích hợp trên LMS.",
  },
  {
    id: "SQ3", type: "single", difficulty: "medium", points: 15,
    question: "Trong tình huống dự án BĐS Hải Phòng, rủi ro nào có mức độ tác động (Impact) CAO NHẤT đến dự án?",
    scenario: "Dự án KĐT 4,200 tỷ VNĐ tại Hải Phòng với 4 rủi ro đã nhận diện.",
    options: [
      "Giá thép & xi măng tăng 15-20%",
      "Quy hoạch giao thông có thể bị điều chỉnh",
      "Đối thủ công bố dự án giá thấp hơn 10%",
      "Lãi suất vay mua nhà tăng",
    ],
    correctAnswers: [1],
    explanation: "Quy hoạch giao thông ảnh hưởng đến kết nối hạ tầng — yếu tố then chốt quyết định giá trị và tính hấp dẫn của KĐT. Nếu giao thông bị điều chỉnh bất lợi, tác động có thể lên tới 30-40% giá trị dự án, nghiêm trọng hơn các rủi ro khác.",
  },
  {
    id: "SQ4", type: "multiple", difficulty: "medium", points: 15,
    question: "Những biện pháp nào phù hợp để giảm thiểu rủi ro chi phí nguyên vật liệu tăng? (Chọn nhiều đáp án)",
    options: [
      "Ký hợp đồng mua NVL dài hạn (lock price) với Xi măng Thăng Long",
      "Tạm dừng toàn bộ dự án chờ giá giảm",
      "Điều chỉnh thiết kế sử dụng vật liệu thay thế chi phí thấp hơn",
      "Đàm phán lại với nhà thầu về chia sẻ rủi ro chi phí",
      "Bỏ qua vì chỉ là biến động tạm thời",
    ],
    correctAnswers: [0, 2, 3],
    explanation: "Ba biện pháp đúng: Lock price qua hợp đồng dài hạn (tận dụng quan hệ nội bộ với Xi măng Thăng Long), tìm vật liệu thay thế, và đàm phán chia sẻ rủi ro. Tạm dừng dự án gây thiệt hại lớn hơn, và bỏ qua rủi ro là vi phạm quy trình ERM.",
  },
  {
    id: "SQ5", type: "scenario", difficulty: "hard", points: 20,
    question: "Bạn là GĐ Dự án. Vừa nhận tin quy hoạch giao thông kết nối bị điều chỉnh, tuyến đường vành đai dự kiến qua khu vực dự án sẽ bị hoãn 3 năm. Hành động ưu tiên đầu tiên của bạn là gì?",
    scenario: "Dự án đã giải ngân 30% (1,260 tỷ). Hợp đồng bán 15% sản phẩm. Deadline bàn giao đợt 1: 18 tháng.",
    options: [
      "Gọi họp Ban Quản lý Rủi ro, đánh giá tác động toàn diện trước khi hành động",
      "Lập tức thông báo khách hàng đã mua về thay đổi quy hoạch",
      "Liên hệ UBND TP Hải Phòng để lobby thay đổi quy hoạch",
      "Giảm giá bán 15% để đẩy nhanh tốc độ bán hàng trước khi tin xấu lan rộng",
    ],
    correctAnswers: [0],
    explanation: "Theo quy trình ERM: hành động đầu tiên luôn là ĐÁNH GIÁ TÁC ĐỘNG, không phải phản ứng ngay. Họp Ban QLRR để: (1) Xác định mức độ ảnh hưởng thực tế, (2) Đánh giá phương án thay thế, (3) Xây dựng kế hoạch truyền thông, (4) Báo cáo lên Tập đoàn nếu nằm vùng Đỏ.",
  },
  {
    id: "SQ6", type: "single", difficulty: "medium", points: 15,
    question: "Với rủi ro đối thủ cạnh tranh (dự án cách 5km, giá thấp hơn 10%), chiến lược nào phù hợp nhất cho Geleximco Land?",
    options: [
      "Giảm giá tương đương hoặc thấp hơn đối thủ",
      "Tập trung nâng cao giá trị gia tăng: tiện ích, quy hoạch xanh, thương hiệu Geleximco",
      "Kiện đối thủ vì cạnh tranh không lành mạnh",
      "Chuyển sang phân khúc bình dân để cạnh tranh về giá",
    ],
    correctAnswers: [1],
    explanation: "Geleximco có lợi thế thương hiệu Tập đoàn lớn. Chiến lược đúng là differentiation — nâng cao giá trị, không cạnh tranh về giá. Hệ sinh thái nội bộ (ABBank hỗ trợ tài chính, Thăng Long GTC cung cấp NVL) là lợi thế mà đối thủ không có.",
  },
  {
    id: "SQ7", type: "true_false", difficulty: "easy", points: 10,
    question: "Trong ma trận rủi ro 5×5, một rủi ro có Xác suất = 3 (Trung bình) và Tác động = 4 (Nghiêm trọng) sẽ nằm trong vùng Cam (10-16 điểm).",
    options: ["Đúng", "Sai"],
    correctAnswers: [0],
    explanation: "Đúng. Điểm rủi ro = Xác suất × Tác động = 3 × 4 = 12 điểm. Vùng Cam là 10-16 điểm, nên rủi ro này yêu cầu hành động ngay và báo cáo Ban Giám đốc.",
  },
  {
    id: "SQ8", type: "scenario", difficulty: "hard", points: 20,
    question: "Sau 6 tháng triển khai, bạn phát hiện nhà thầu phụ đang sử dụng thép không đúng chủng loại trong hợp đồng (thép Trung Quốc thay vì thép Hòa Phát). Đây là rủi ro thuộc vùng nào và xử lý ra sao?",
    scenario: "Công trình đã thi công xong phần móng (25% khối lượng). Nhà thầu phụ chiếm 40% khối lượng thi công.",
    options: [
      "Vùng Vàng — Nhắc nhở nhà thầu và cho phép tiếp tục nếu chất lượng tương đương",
      "Vùng Cam — Dừng thi công hạng mục liên quan, yêu cầu thay thế đúng loại, phạt hợp đồng",
      "Vùng Đỏ — Dừng toàn bộ dự án, chấm dứt hợp đồng nhà thầu, kiểm tra lại toàn bộ",
      "Vùng Xanh — Ghi nhận và tiếp tục, xử lý khi nghiệm thu cuối",
    ],
    correctAnswers: [1],
    explanation: "Đây là rủi ro vùng Cam (nghiêm trọng nhưng chưa đến mức dừng toàn bộ dự án). Xử lý đúng: (1) Dừng thi công hạng mục liên quan, (2) Kiểm định chất lượng thép đã lắp đặt, (3) Phạt hợp đồng, (4) Yêu cầu thay thế nếu không đạt tiêu chuẩn. Nếu kết quả kiểm định cho thấy nguy cơ an toàn → leo thang lên vùng Đỏ.",
  },
];

const TOTAL_POINTS = QUIZ_QUESTIONS.reduce((sum, q) => sum + q.points, 0);
const PASSING_SCORE = 70; // percent

/* ============================================================ */
/*  RISK MATRIX SVG                                              */
/* ============================================================ */

function RiskMatrixSVG() {
  const colors = [
    ["#22c55e", "#22c55e", "#eab308", "#eab308", "#f97316"],
    ["#22c55e", "#eab308", "#eab308", "#f97316", "#f97316"],
    ["#eab308", "#eab308", "#f97316", "#f97316", "#ef4444"],
    ["#eab308", "#f97316", "#f97316", "#ef4444", "#ef4444"],
    ["#f97316", "#f97316", "#ef4444", "#ef4444", "#ef4444"],
  ];
  const labels = ["Rất thấp", "Thấp", "Trung bình", "Cao", "Rất cao"];
  const cellSize = 44;
  const gap = 2;
  const offsetX = 70;
  const offsetY = 20;
  const total = cellSize * 5 + gap * 4;

  return (
    <svg viewBox={`0 0 ${offsetX + total + 10} ${offsetY + total + 40}`} className="w-full max-w-sm mx-auto">
      {/* Y-axis label */}
      <text x="8" y={offsetY + total / 2} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="8" fontWeight="600" transform={`rotate(-90, 8, ${offsetY + total / 2})`}>
        Mức độ Tác động →
      </text>
      {/* X-axis label */}
      <text x={offsetX + total / 2} y={offsetY + total + 30} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="600">
        Xác suất xảy ra →
      </text>
      {/* Grid */}
      {colors.map((row, ri) =>
        row.map((color, ci) => {
          const x = offsetX + ci * (cellSize + gap);
          const y = offsetY + (4 - ri) * (cellSize + gap);
          const score = (ri + 1) * (ci + 1);
          return (
            <g key={`${ri}-${ci}`}>
              <rect x={x} y={y} width={cellSize} height={cellSize} rx="4" fill={color} opacity={0.25} stroke={color} strokeWidth="1" />
              <text x={x + cellSize / 2} y={y + cellSize / 2 + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="11" fontWeight="700">{score}</text>
            </g>
          );
        })
      )}
      {/* Axis labels */}
      {labels.map((l, i) => (
        <g key={`label-${i}`}>
          <text x={offsetX - 6} y={offsetY + (4 - i) * (cellSize + gap) + cellSize / 2} textAnchor="end" dominantBaseline="middle" fill="#94a3b8" fontSize="7">{l}</text>
          <text x={offsetX + i * (cellSize + gap) + cellSize / 2} y={offsetY + total + 14} textAnchor="middle" fill="#94a3b8" fontSize="7">{l}</text>
        </g>
      ))}
    </svg>
  );
}

/* ============================================================ */
/*  SCORM VIEWER COMPONENT                                       */
/* ============================================================ */

export function ScormViewer({ lesson, onContentReady }: { lesson: Lesson; onContentReady?: (ready: boolean) => void }) {
  // ── Loading state ──
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"loading" | "active" | "completed" | "error">("loading");

  // ── Navigation: info pages → quiz → result ──
  type Phase = "info" | "quiz" | "result";
  const [phase, setPhase] = useState<Phase>("info");
  const [infoPage, setInfoPage] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);

  // ── Quiz answers ──
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number[]>>(new Map());
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());
  const [showExplanation, setShowExplanation] = useState<Set<string>>(new Set());

  // ── Score & completion ──
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // ── Timer ──
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const startTimeRef = useRef<number>(Date.now());

  // ── Fullscreen ──
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Content scroll ref ──
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => { setStatus("active"); setLoading(false); startTimeRef.current = Date.now(); }, 1800);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (status !== "active" && status !== "completed") return;
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const scrollToTop = () => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  // ── Progress calculation ──
  const totalSteps = INFO_PAGES.length + QUIZ_QUESTIONS.length + 1; // +1 for result
  const currentStep = phase === "info" ? infoPage + 1 : phase === "quiz" ? INFO_PAGES.length + quizIndex + 1 : totalSteps;
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  // ── Timer format ──
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ── Content ready tracking ──
  useEffect(() => {
    if (onContentReady && quizCompleted && score >= PASSING_SCORE) {
      onContentReady(true);
    }
  }, [quizCompleted, score, onContentReady]);

  // ── Toggle answer selection ──
  const toggleAnswer = (qId: string, optIndex: number, isMultiple: boolean) => {
    if (submittedQuestions.has(qId)) return; // locked after submit
    setSelectedAnswers((prev) => {
      const next = new Map(prev);
      const current = next.get(qId) || [];
      if (isMultiple) {
        if (current.includes(optIndex)) {
          next.set(qId, current.filter((i) => i !== optIndex));
        } else {
          next.set(qId, [...current, optIndex]);
        }
      } else {
        next.set(qId, [optIndex]);
      }
      return next;
    });
  };

  // ── Submit answer ──
  const submitAnswer = (q: ScormQuizQuestion) => {
    const selected = selectedAnswers.get(q.id) || [];
    if (selected.length === 0) return;
    setSubmittedQuestions((prev) => new Set(prev).add(q.id));
    // Check correctness
    const isCorrect =
      selected.length === q.correctAnswers.length &&
      selected.every((s) => q.correctAnswers.includes(s)) &&
      q.correctAnswers.every((c) => selected.includes(c));
    if (isCorrect) {
      setScore((prev) => prev + q.points);
    }
    // Auto-show explanation
    setShowExplanation((prev) => new Set(prev).add(q.id));
  };

  // ── Check if answer is correct for a question ──
  const isQuestionCorrect = (q: ScormQuizQuestion) => {
    const selected = selectedAnswers.get(q.id) || [];
    return (
      selected.length === q.correctAnswers.length &&
      selected.every((s) => q.correctAnswers.includes(s)) &&
      q.correctAnswers.every((c) => selected.includes(c))
    );
  };

  // ── Finish quiz → go to result ──
  const finishQuiz = useCallback(() => {
    setQuizCompleted(true);
    setPhase("result");
    setStatus("completed");
    scrollToTop();
  }, []);

  // ── Navigation handlers ──
  const goNextInfo = () => {
    if (infoPage < INFO_PAGES.length - 1) {
      setInfoPage((p) => p + 1);
    } else {
      setPhase("quiz");
      setQuizIndex(0);
    }
    scrollToTop();
  };
  const goPrevInfo = () => {
    if (infoPage > 0) setInfoPage((p) => p - 1);
    scrollToTop();
  };
  const goNextQuiz = () => {
    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
    scrollToTop();
  };
  const goPrevQuiz = () => {
    if (quizIndex > 0) {
      setQuizIndex((i) => i - 1);
    } else {
      setPhase("info");
      setInfoPage(INFO_PAGES.length - 1);
    }
    scrollToTop();
  };

  // ── Retry quiz ──
  const retryQuiz = () => {
    setSelectedAnswers(new Map());
    setSubmittedQuestions(new Set());
    setShowExplanation(new Set());
    setScore(0);
    setQuizCompleted(false);
    setPhase("quiz");
    setQuizIndex(0);
    setStatus("active");
    startTimeRef.current = Date.now();
    setElapsed(0);
    scrollToTop();
  };

  // ── Fullscreen ──
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── SCORM CMI values for status bar ──
  const cmiCompletion = quizCompleted ? "completed" : submittedQuestions.size > 0 ? "incomplete" : "not attempted";
  const cmiScore = quizCompleted ? Math.round((score / TOTAL_POINTS) * 100) : "—";
  const passed = typeof cmiScore === "number" && cmiScore >= PASSING_SCORE;

  // ── Difficulty badge ──
  const diffBadge = (d: "easy" | "medium" | "hard") => {
    const cfg = {
      easy: { label: "Dễ", cls: "bg-green-100 text-green-700" },
      medium: { label: "Trung bình", cls: "bg-yellow-100 text-yellow-700" },
      hard: { label: "Khó", cls: "bg-red-100 text-red-700" },
    }[d];
    return <span className={`px-1.5 py-0.5 rounded ${cfg.cls}`} style={{ fontSize: "9px", fontWeight: 600 }}>{cfg.label}</span>;
  };

  /* ============================================================ */
  /*  RENDER: Info Page                                            */
  /* ============================================================ */

  const renderInfoPage = (page: ScormInfoPage) => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`p-5 text-white ${page.type === "intro" ? "bg-gradient-to-r from-teal-600 to-teal-700" : page.type === "scenario" ? "bg-gradient-to-r from-amber-600 to-amber-700" : "bg-gradient-to-r from-slate-700 to-slate-800"}`}>
          <div className="flex items-center gap-2 mb-1">
            {page.type === "intro" && <BookOpen className="w-4 h-4 text-white/60" />}
            {page.type === "content" && <Shield className="w-4 h-4 text-white/60" />}
            {page.type === "matrix" && <BarChart3 className="w-4 h-4 text-white/60" />}
            {page.type === "scenario" && <AlertCircle className="w-4 h-4 text-white/60" />}
            <span className="text-white/60" style={{ fontSize: "11px", fontWeight: 500 }}>
              {page.type === "intro" ? "GIỚI THIỆU MODULE" : page.type === "scenario" ? "TÌNH HUỐNG MÔ PHỎNG" : "NỘI DUNG HỌC TẬP"}
            </span>
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700 }}>{page.title}</h3>
          {page.subtitle && <p className="text-white/70 mt-1" style={{ fontSize: "13px" }}>{page.subtitle}</p>}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700" style={{ fontSize: "13px", lineHeight: 1.8 }}>{page.content}</p>

          {page.bullets && (
            <div className="space-y-2">
              {page.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${page.type === "scenario" ? "bg-amber-100" : "bg-teal-100"}`}>
                    <span className={`${page.type === "scenario" ? "text-amber-700" : "text-teal-700"}`} style={{ fontSize: "10px", fontWeight: 700 }}>{i + 1}</span>
                  </div>
                  <p className="text-gray-600" style={{ fontSize: "13px", lineHeight: 1.6 }}>{b}</p>
                </div>
              ))}
            </div>
          )}

          {page.image === "risk-matrix" && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <RiskMatrixSVG />
            </div>
          )}

          {page.tip && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-teal-700" style={{ fontSize: "12px", lineHeight: 1.6 }}>{page.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ============================================================ */
  /*  RENDER: Quiz Question                                        */
  /* ============================================================ */

  const renderQuizQuestion = (q: ScormQuizQuestion, idx: number) => {
    const selected = selectedAnswers.get(q.id) || [];
    const isSubmitted = submittedQuestions.has(q.id);
    const isCorrect = isSubmitted ? isQuestionCorrect(q) : null;
    const isMultiple = q.type === "multiple";
    const isExplanationOpen = showExplanation.has(q.id);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Quiz header */}
          <div className={`px-5 py-4 border-b ${isSubmitted ? (isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200") : "bg-gradient-to-r from-teal-600 to-teal-700"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSubmitted ? (
                  isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <CircleX className="w-5 h-5 text-red-500" />
                ) : (
                  <CircleHelp className="w-5 h-5 text-white/70" />
                )}
                <span className={isSubmitted ? (isCorrect ? "text-green-800" : "text-red-800") : "text-white"} style={{ fontSize: "13px", fontWeight: 600 }}>
                  Câu hỏi {idx + 1} / {QUIZ_QUESTIONS.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {diffBadge(q.difficulty)}
                <span className={`px-2 py-0.5 rounded ${isSubmitted ? (isCorrect ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800") : "bg-white/20 text-white"}`} style={{ fontSize: "10px", fontWeight: 600 }}>
                  {q.points} điểm
                </span>
              </div>
            </div>
            {isSubmitted && (
              <p className={`mt-1 ${isCorrect ? "text-green-700" : "text-red-700"}`} style={{ fontSize: "12px", fontWeight: 500 }}>
                {isCorrect ? "✓ Chính xác!" : "✗ Chưa chính xác"}
                {isCorrect ? ` — +${q.points} điểm` : " — +0 điểm"}
              </p>
            )}
          </div>

          {/* Question body */}
          <div className="p-6 space-y-4">
            {/* Scenario box */}
            {q.scenario && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800" style={{ fontSize: "12px", lineHeight: 1.5 }}>{q.scenario}</p>
              </div>
            )}

            {/* Question text */}
            <div>
              <p className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.6 }}>{q.question}</p>
              {isMultiple && (
                <p className="text-teal-600 mt-1" style={{ fontSize: "11px", fontWeight: 500 }}>
                  ↳ Chọn nhiều đáp án ({q.correctAnswers.length} đáp án đúng)
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isSelected = selected.includes(oi);
                const isCorrectOpt = q.correctAnswers.includes(oi);

                let borderCls = "border-gray-200";
                let bgCls = "bg-white hover:bg-gray-50";
                let textCls = "text-gray-700";
                let indicatorCls = "border-gray-300 bg-white";
                let indicatorInner = null as React.ReactNode;

                if (isSubmitted) {
                  if (isCorrectOpt && isSelected) {
                    // Correct & selected
                    borderCls = "border-green-400";
                    bgCls = "bg-green-50";
                    textCls = "text-green-800";
                    indicatorCls = "border-green-500 bg-green-500";
                    indicatorInner = <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
                  } else if (isCorrectOpt && !isSelected) {
                    // Correct but not selected
                    borderCls = "border-green-300";
                    bgCls = "bg-green-50/50";
                    textCls = "text-green-700";
                    indicatorCls = "border-green-400 bg-green-100";
                    indicatorInner = <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
                  } else if (!isCorrectOpt && isSelected) {
                    // Wrong & selected
                    borderCls = "border-red-400";
                    bgCls = "bg-red-50";
                    textCls = "text-red-700";
                    indicatorCls = "border-red-500 bg-red-500";
                    indicatorInner = <CircleX className="w-3.5 h-3.5 text-white" />;
                  } else {
                    // Not relevant
                    bgCls = "bg-gray-50";
                    textCls = "text-gray-400";
                    indicatorCls = "border-gray-200 bg-gray-100";
                  }
                } else if (isSelected) {
                  // Selected (not yet submitted)
                  borderCls = "border-teal-400";
                  bgCls = "bg-teal-50";
                  textCls = "text-teal-800";
                  indicatorCls = "border-teal-500 bg-teal-500";
                  indicatorInner = isMultiple
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    : <div className="w-2 h-2 rounded-full bg-white" />;
                }

                return (
                  <button
                    key={oi}
                    onClick={() => toggleAnswer(q.id, oi, isMultiple)}
                    disabled={isSubmitted}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-start gap-3 ${borderCls} ${bgCls} ${isSubmitted ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {/* Radio / Checkbox indicator */}
                    <div className={`w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${isMultiple ? "rounded" : "rounded-full"} ${indicatorCls}`}>
                      {indicatorInner || (
                        !isSubmitted && !isSelected && isMultiple ? null : !isSubmitted && !isSelected ? null : null
                      )}
                    </div>
                    <span className={textCls} style={{ fontSize: "13px", lineHeight: 1.5 }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit button */}
            {!isSubmitted && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-400" style={{ fontSize: "11px" }}>
                  {selected.length === 0 ? "Chọn đáp án để tiếp tục" : `Đã chọn ${selected.length} đáp án`}
                </span>
                <button
                  onClick={() => submitAnswer(q)}
                  disabled={selected.length === 0}
                  className={`px-5 py-2 rounded-lg transition-all cursor-pointer ${selected.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"}`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Xác nhận
                </button>
              </div>
            )}

            {/* Explanation */}
            {isSubmitted && (
              <div className={`rounded-lg border p-4 ${isCorrect ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                <button
                  onClick={() => setShowExplanation((prev) => {
                    const next = new Set(prev);
                    if (next.has(q.id)) next.delete(q.id); else next.add(q.id);
                    return next;
                  })}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Brain className={`w-4 h-4 ${isCorrect ? "text-green-600" : "text-amber-600"}`} />
                    <span className={`${isCorrect ? "text-green-700" : "text-amber-700"}`} style={{ fontSize: "12px", fontWeight: 600 }}>Giải thích</span>
                  </div>
                  {isExplanationOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isExplanationOpen && (
                  <p className={`mt-2 ${isCorrect ? "text-green-700" : "text-amber-800"}`} style={{ fontSize: "12px", lineHeight: 1.7 }}>{q.explanation}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ============================================================ */
  /*  RENDER: Result Page                                          */
  /* ============================================================ */

  const renderResult = () => {
    const pct = Math.round((score / TOTAL_POINTS) * 100);
    const isPassed = pct >= PASSING_SCORE;
    const correctCount = QUIZ_QUESTIONS.filter((q) => isQuestionCorrect(q)).length;
    const wrongCount = QUIZ_QUESTIONS.length - correctCount;

    // Grade by percentage
    const grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 50 ? "D" : "F";
    const gradeColor = pct >= 90 ? "text-emerald-600" : pct >= 80 ? "text-blue-600" : pct >= 70 ? "text-teal-600" : pct >= 50 ? "text-amber-600" : "text-red-600";

    // Score breakdown by difficulty
    const easyQs = QUIZ_QUESTIONS.filter((q) => q.difficulty === "easy");
    const medQs = QUIZ_QUESTIONS.filter((q) => q.difficulty === "medium");
    const hardQs = QUIZ_QUESTIONS.filter((q) => q.difficulty === "hard");
    const easyCorrect = easyQs.filter((q) => isQuestionCorrect(q)).length;
    const medCorrect = medQs.filter((q) => isQuestionCorrect(q)).length;
    const hardCorrect = hardQs.filter((q) => isQuestionCorrect(q)).length;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Result header */}
          <div className={`p-6 text-center ${isPassed ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-red-500 to-rose-600"} text-white`}>
            <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${isPassed ? "bg-white/20" : "bg-white/20"}`}>
              {isPassed ? <Trophy className="w-8 h-8 text-yellow-300" /> : <RotateCcw className="w-8 h-8 text-white/80" />}
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 700 }}>{isPassed ? "Hoàn thành xuất sắc!" : "Chưa đạt yêu cầu"}</h3>
            <p className="text-white/80 mt-1" style={{ fontSize: "13px" }}>
              {isPassed ? "Bạn đã vượt qua module Quản lý Rủi ro Doanh nghiệp" : `Yêu cầu tối thiểu ${PASSING_SCORE}% để hoàn thành module`}
            </p>
          </div>

          {/* Score circle */}
          <div className="p-6 -mt-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-center gap-8">
                {/* Circular score */}
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={isPassed ? "#14b8a6" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(pct / 100) * 327} 327`}
                      transform="rotate(-90 60 60)"
                      className="transition-all duration-1000"
                    />
                    <text x="60" y="52" textAnchor="middle" dominantBaseline="middle" fill={isPassed ? "#0d9488" : "#ef4444"} fontSize="28" fontWeight="800">{pct}%</text>
                    <text x="60" y="72" textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="10">điểm số</text>
                  </svg>
                </div>

                {/* Score breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${gradeColor} bg-gray-100`}>
                      <span style={{ fontSize: "20px", fontWeight: 800 }}>{grade}</span>
                    </div>
                    <div>
                      <p className="text-gray-500" style={{ fontSize: "10px" }}>Xếp loại</p>
                      <p className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {pct >= 90 ? "Xuất sắc" : pct >= 80 ? "Giỏi" : pct >= 70 ? "Khá" : pct >= 50 ? "Trung bình" : "Yếu"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-500" style={{ fontSize: "10px" }}>Trả lời đúng</p>
                      <p className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{correctCount} / {QUIZ_QUESTIONS.length} câu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-500" style={{ fontSize: "10px" }}>Thời gian</p>
                      <p className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{formatTime(elapsed)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown by difficulty */}
          <div className="px-6 pb-4">
            <p className="text-gray-500 mb-3" style={{ fontSize: "12px", fontWeight: 600 }}>Kết quả theo độ khó</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Dễ", correct: easyCorrect, total: easyQs.length, color: "green" },
                { label: "Trung bình", correct: medCorrect, total: medQs.length, color: "yellow" },
                { label: "Khó", correct: hardCorrect, total: hardQs.length, color: "red" },
              ].map((d) => (
                <div key={d.label} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                  <p className="text-gray-500" style={{ fontSize: "10px", fontWeight: 500 }}>{d.label}</p>
                  <p className="text-gray-800 mt-0.5" style={{ fontSize: "16px", fontWeight: 700 }}>{d.correct}/{d.total}</p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${d.color === "green" ? "bg-green-500" : d.color === "yellow" ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${d.total > 0 ? (d.correct / d.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-question review */}
          <div className="px-6 pb-4">
            <p className="text-gray-500 mb-3" style={{ fontSize: "12px", fontWeight: 600 }}>Chi tiết từng câu</p>
            <div className="space-y-1.5">
              {QUIZ_QUESTIONS.map((q, i) => {
                const correct = isQuestionCorrect(q);
                return (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border ${correct ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
                  >
                    <div className="flex items-center gap-2">
                      {correct
                        ? <CircleCheck className="w-4 h-4 text-green-500" />
                        : <CircleX className="w-4 h-4 text-red-400" />
                      }
                      <span className="text-gray-700" style={{ fontSize: "12px" }}>Câu {i + 1}</span>
                      {diffBadge(q.difficulty)}
                    </div>
                    <span className={`${correct ? "text-green-600" : "text-red-500"}`} style={{ fontSize: "12px", fontWeight: 600 }}>
                      {correct ? `+${q.points}` : "+0"} điểm
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 px-3 py-2 bg-gray-100 rounded-lg">
              <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 600 }}>Tổng điểm</span>
              <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 700 }}>{score} / {TOTAL_POINTS}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-6 flex items-center gap-3">
            {!isPassed && (
              <button
                onClick={retryQuiz}
                className="flex-1 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <RotateCcw className="w-4 h-4" /> Làm lại
              </button>
            )}
            {isPassed && (
              <button
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <Award className="w-4 h-4" /> Nhận chứng chỉ
              </button>
            )}
            <button
              onClick={() => { setPhase("quiz"); setQuizIndex(0); scrollToTop(); }}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              Xem lại đáp án
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ============================================================ */
  /*  RENDER: Page Navigation Dots / Step Indicator                 */
  /* ============================================================ */

  const renderStepIndicator = () => {
    const infoCount = INFO_PAGES.length;
    const quizCount = QUIZ_QUESTIONS.length;

    return (
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {/* Info dots */}
        {INFO_PAGES.map((_, i) => {
          const isActive = phase === "info" && infoPage === i;
          const isDone = phase !== "info" || infoPage > i;
          return (
            <button
              key={`info-${i}`}
              onClick={() => { setPhase("info"); setInfoPage(i); scrollToTop(); }}
              className={`transition-all cursor-pointer rounded-full ${isActive ? "w-6 h-2 bg-teal-500" : isDone ? "w-2 h-2 bg-teal-400" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"}`}
              title={`Trang ${i + 1}: ${INFO_PAGES[i].title}`}
            />
          );
        })}
        {/* Separator */}
        <div className="w-px h-3 bg-gray-300 mx-1" />
        {/* Quiz dots */}
        {QUIZ_QUESTIONS.map((q, i) => {
          const isActive = phase === "quiz" && quizIndex === i;
          const isAnswered = submittedQuestions.has(q.id);
          const correct = isAnswered ? isQuestionCorrect(q) : null;
          return (
            <button
              key={`quiz-${i}`}
              onClick={() => { setPhase("quiz"); setQuizIndex(i); scrollToTop(); }}
              className={`transition-all cursor-pointer rounded-full ${isActive ? "w-6 h-2" : "w-2 h-2"} ${
                isActive
                  ? (isAnswered ? (correct ? "bg-green-500" : "bg-red-400") : "bg-amber-500")
                  : isAnswered
                    ? (correct ? "bg-green-400" : "bg-red-300")
                    : "bg-gray-300 hover:bg-gray-400"
              }`}
              title={`Câu ${i + 1}`}
            />
          );
        })}
        {/* Result dot */}
        <div className="w-px h-3 bg-gray-300 mx-1" />
        <button
          onClick={() => { if (quizCompleted) { setPhase("result"); scrollToTop(); } }}
          className={`transition-all rounded-full ${phase === "result" ? "w-6 h-2 bg-purple-500" : quizCompleted ? "w-2 h-2 bg-purple-400 cursor-pointer hover:bg-purple-500" : "w-2 h-2 bg-gray-200"}`}
          title="Kết quả"
        />
      </div>
    );
  };

  /* ============================================================ */
  /*  MAIN RETURN                                                  */
  /* ============================================================ */

  return (
    <div ref={containerRef} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-teal-50">
        <div className="flex items-center gap-3">
          <Package className="w-4 h-4 text-teal-600" />
          <div>
            <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>SCORM 2004 Package</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${status === "completed" ? "bg-emerald-500" : status === "active" ? "bg-green-500 animate-pulse" : status === "loading" ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-gray-500" style={{ fontSize: "10px" }}>
                {status === "completed" ? "Hoàn thành" : status === "active" ? "Đang hoạt động — SCORM API Connected" : status === "loading" ? "Đang tải module..." : "Lỗi kết nối"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Score indicator */}
          {submittedQuestions.size > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-200">
              <Star className="w-3 h-3 text-amber-500" />
              <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{score}/{TOTAL_POINTS}</span>
            </div>
          )}
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500" style={{ fontSize: "11px" }}>Tiến độ:</span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${quizCompleted ? (passed ? "bg-emerald-500" : "bg-red-400") : "bg-teal-500"}`} style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-teal-600" style={{ fontSize: "11px", fontWeight: 600 }}>{progressPct}%</span>
          </div>
          {/* Timer */}
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span style={{ fontSize: "11px" }}>{formatTime(elapsed)}</span>
          </div>
          <button onClick={toggleFullscreen} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded cursor-pointer">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Content area ── */}
      <div ref={contentRef} className={`bg-gray-50 relative overflow-y-auto ${isFullscreen ? "h-[calc(100vh-100px)]" : "min-h-[500px] max-h-[600px]"}`} style={{ scrollbarWidth: "thin" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600" style={{ fontSize: "14px", fontWeight: 500 }}>Đang tải SCORM Package...</p>
              <p className="text-gray-400 mt-1" style={{ fontSize: "12px" }}>Khởi tạo SCORM 2004 Runtime Environment</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Step indicator */}
            <div className="mb-5">
              {renderStepIndicator()}
            </div>

            {/* Phase content */}
            {phase === "info" && renderInfoPage(INFO_PAGES[infoPage])}
            {phase === "quiz" && renderQuizQuestion(QUIZ_QUESTIONS[quizIndex], quizIndex)}
            {phase === "result" && renderResult()}

            {/* Navigation buttons */}
            <div className="max-w-2xl mx-auto mt-5 flex items-center justify-between">
              <button
                onClick={phase === "info" ? goPrevInfo : phase === "quiz" ? goPrevQuiz : () => { setPhase("quiz"); setQuizIndex(QUIZ_QUESTIONS.length - 1); scrollToTop(); }}
                disabled={phase === "info" && infoPage === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${phase === "info" && infoPage === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200 cursor-pointer"}`}
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <ChevronLeft className="w-4 h-4" />
                {phase === "info" ? "Trang trước" : phase === "quiz" ? (quizIndex === 0 ? "Quay lại bài học" : "Câu trước") : "Xem đáp án"}
              </button>

              {/* Center: page info */}
              <span className="text-gray-400" style={{ fontSize: "11px" }}>
                {phase === "info" && `Trang ${infoPage + 1} / ${INFO_PAGES.length}`}
                {phase === "quiz" && `Câu ${quizIndex + 1} / ${QUIZ_QUESTIONS.length}`}
                {phase === "result" && "Kết quả"}
              </span>

              {phase !== "result" && (
                <button
                  onClick={phase === "info" ? goNextInfo : goNextQuiz}
                  disabled={phase === "quiz" && !submittedQuestions.has(QUIZ_QUESTIONS[quizIndex].id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                    phase === "quiz" && !submittedQuestions.has(QUIZ_QUESTIONS[quizIndex].id)
                      ? "text-gray-300 bg-gray-100 cursor-not-allowed"
                      : "text-white bg-teal-600 hover:bg-teal-700 cursor-pointer shadow-sm"
                  }`}
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  {phase === "info"
                    ? (infoPage === INFO_PAGES.length - 1 ? "Bắt đầu Quiz" : "Tiếp tục")
                    : (quizIndex === QUIZ_QUESTIONS.length - 1 ? "Xem kết quả" : "Câu tiếp")
                  }
                  {phase === "info" && infoPage === INFO_PAGES.length - 1
                    ? <Zap className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                  }
                </button>
              )}
              {phase === "result" && <div />}
            </div>
          </div>
        )}
      </div>

      {/* ── SCORM debug bar ── */}
      <div className="px-4 py-1.5 bg-gray-800 flex items-center gap-4" style={{ fontSize: "10px" }}>
        <span className="text-green-400">&bull; SCORM 2004 4th Ed.</span>
        <span className="text-gray-400">cmi.completion_status: {cmiCompletion}</span>
        <span className="text-gray-400">cmi.success_status: {quizCompleted ? (passed ? "passed" : "failed") : "unknown"}</span>
        <span className={`${quizCompleted ? (passed ? "text-green-400" : "text-red-400") : "text-gray-400"}`}>cmi.score.scaled: {typeof cmiScore === "number" ? (cmiScore / 100).toFixed(2) : "—"}</span>
        <span className="text-gray-400">cmi.score.raw: {typeof cmiScore === "number" ? cmiScore : "—"}</span>
        <span className="text-gray-400">cmi.session_time: PT{formatTime(elapsed).replace(":", "M")}S</span>
      </div>
    </div>
  );
}