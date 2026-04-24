import { useMemo } from "react";
import {
  Brain, Sparkles, CheckCircle2, AlertTriangle, Target, BookOpen,
  TrendingUp, MessageSquare, Hash, Lightbulb, BarChart3, Zap,
} from "lucide-react";

// ─── NLP-like Scoring Engine (Mock AI) ───

export interface AIGradingResult {
  score: number;        // 0-100
  earnedPoints: number;
  totalPoints: number;
  keywordScore: number; // 0-100 how many expected keywords found
  coherenceScore: number; // 0-100 text quality
  relevanceScore: number; // 0-100 topic relevance
  lengthScore: number;   // 0-100 appropriate length
  sentimentScore: number; // 0-100 professional tone
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
  suggestions: string[];
  confidence: number;   // AI confidence 0-100
  detailedBreakdown: { criterion: string; score: number; maxScore: number; comment: string }[];
}

// Expected keyword dictionaries by topic
const KEYWORD_DICTS: Record<string, { required: string[]; bonus: string[]; }> = {
  "leadership": {
    required: ["lãnh đạo", "chiến lược", "tầm nhìn", "đội ngũ", "quản lý"],
    bonus: ["servant leadership", "transformational", "coaching", "mentoring", "feedback", "delegation", "empowerment", "agile", "VUCA", "resilience"],
  },
  "finance": {
    required: ["tài chính", "dòng tiền", "rủi ro", "lợi nhuận", "đầu tư"],
    bonus: ["DCF", "NPV", "IRR", "WACC", "EBITDA", "ROE", "ROA", "Basel", "KPI", "hedging"],
  },
  "management": {
    required: ["quản lý", "kế hoạch", "mục tiêu", "hiệu suất", "tổ chức"],
    bonus: ["OKR", "KPI", "PDCA", "lean", "agile", "scrum", "stakeholder", "delegation", "SMART"],
  },
  "digital": {
    required: ["chuyển đổi số", "công nghệ", "dữ liệu", "AI", "tự động"],
    bonus: ["digital twin", "IoT", "blockchain", "cloud", "machine learning", "API", "platform", "ecosystem"],
  },
  "esg": {
    required: ["ESG", "bền vững", "môi trường", "xã hội", "quản trị"],
    bonus: ["carbon", "SDG", "stakeholder", "reporting", "GRI", "TCFD", "net zero", "circular economy"],
  },
  default: {
    required: ["phân tích", "đánh giá", "giải pháp", "kết quả", "chiến lược"],
    bonus: ["Geleximco", "tập đoàn", "hiệu quả", "cải thiện", "phát triển", "đổi mới"],
  },
};

function detectTopics(tags: string[]): string[] {
  const topicMap: Record<string, string> = {
    leadership: "leadership", strategy: "leadership", management: "management",
    finance: "finance", valuation: "finance", risk: "finance",
    digital: "digital", ai: "digital", esg: "esg", sustainability: "esg",
  };
  const topics = tags.map(t => topicMap[t]).filter(Boolean);
  return [...new Set(topics.length > 0 ? topics : ["default"])];
}

function getKeywordsForTopics(topics: string[]) {
  const required: string[] = [];
  const bonus: string[] = [];
  topics.forEach(topic => {
    const dict = KEYWORD_DICTS[topic] || KEYWORD_DICTS.default;
    required.push(...dict.required);
    bonus.push(...dict.bonus);
  });
  return { required: [...new Set(required)], bonus: [...new Set(bonus)] };
}

export function gradeEssay(
  answer: string,
  question: string,
  maxPoints: number,
  tags: string[] = [],
  explanation?: string,
): AIGradingResult {
  const text = answer.toLowerCase();
  const wordCount = answer.trim().split(/\s+/).length;
  const sentenceCount = answer.split(/[.!?]+/).filter(s => s.trim()).length;
  const topics = detectTopics(tags);
  const { required, bonus } = getKeywordsForTopics(topics);

  // 1. Keyword Analysis
  const matchedRequired = required.filter(kw => text.includes(kw.toLowerCase()));
  const matchedBonus = bonus.filter(kw => text.includes(kw.toLowerCase()));
  const allMatched = [...matchedRequired, ...matchedBonus];
  const allMissing = required.filter(kw => !text.includes(kw.toLowerCase()));
  const keywordScore = required.length > 0
    ? Math.min(100, Math.round(((matchedRequired.length / required.length) * 70 + (matchedBonus.length / Math.max(bonus.length, 1)) * 30)))
    : 50;

  // 2. Coherence (sentence structure, length variety)
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const hasStructure = sentenceCount >= 3;
  const hasVariety = answer.includes(",") && answer.includes(".");
  const hasParagraphs = answer.includes("\n") || wordCount > 150;
  const coherenceScore = Math.min(100, (
    (hasStructure ? 30 : 10) +
    (avgWordsPerSentence > 8 && avgWordsPerSentence < 35 ? 25 : 10) +
    (hasVariety ? 20 : 5) +
    (hasParagraphs ? 15 : 5) +
    Math.min(10, sentenceCount * 2)
  ));

  // 3. Relevance
  const questionWords = question.toLowerCase().split(/\s+/);
  const relevantWords = questionWords.filter(w => w.length > 3 && text.includes(w));
  const relevanceScore = Math.min(100, Math.round((relevantWords.length / Math.max(questionWords.filter(w => w.length > 3).length, 1)) * 100));

  // 4. Length appropriateness
  const idealMin = 50;
  const idealMax = 300;
  const lengthScore = wordCount < 10 ? 5 :
    wordCount < idealMin ? Math.round((wordCount / idealMin) * 70) :
    wordCount <= idealMax ? 100 :
    Math.max(60, 100 - Math.round((wordCount - idealMax) / 10));

  // 5. Professional tone
  const professionalWords = ["phân tích", "đánh giá", "đề xuất", "giải pháp", "chiến lược", "mục tiêu", "hiệu quả", "kết luận", "theo", "do đó", "vì vậy", "cụ thể"];
  const matchedProfessional = professionalWords.filter(w => text.includes(w));
  const sentimentScore = Math.min(100, matchedProfessional.length * 12 + 20);

  // Weighted overall
  const overallScore = Math.round(
    keywordScore * 0.30 +
    coherenceScore * 0.20 +
    relevanceScore * 0.25 +
    lengthScore * 0.10 +
    sentimentScore * 0.15
  );
  const earnedPoints = Math.round((overallScore / 100) * maxPoints * 10) / 10;

  // Generate feedback
  const feedbackParts: string[] = [];
  if (overallScore >= 85) feedbackParts.push("Bài viết xuất sắc, bao phủ đầy đủ các khía cạnh quan trọng.");
  else if (overallScore >= 70) feedbackParts.push("Bài viết khá tốt, đã nêu được các ý chính.");
  else if (overallScore >= 50) feedbackParts.push("Bài viết ở mức trung bình, cần bổ sung thêm nội dung.");
  else feedbackParts.push("Bài viết cần cải thiện đáng kể.");

  const suggestions: string[] = [];
  if (allMissing.length > 0) suggestions.push(`Bổ sung các khái niệm: ${allMissing.slice(0, 3).join(", ")}`);
  if (wordCount < idealMin) suggestions.push(`Mở rộng câu trả lời (hiện ${wordCount} từ, nên từ ${idealMin} từ trở lên)`);
  if (coherenceScore < 60) suggestions.push("Cải thiện cấu trúc: dùng đoạn văn rõ ràng hơn, có dẫn nhập và kết luận");
  if (sentimentScore < 50) suggestions.push("Sử dụng ngôn ngữ chuyên nghiệp hơn: 'phân tích', 'đề xuất', 'chiến lược'");
  if (matchedBonus.length === 0 && bonus.length > 0) suggestions.push(`Thêm thuật ngữ chuyên môn: ${bonus.slice(0, 3).join(", ")}`);

  const confidence = Math.min(95, 50 + wordCount * 0.1 + matchedRequired.length * 5);

  const detailedBreakdown = [
    { criterion: "Từ khóa chuyên môn", score: keywordScore, maxScore: 100, comment: `${allMatched.length}/${required.length + bonus.length} từ khóa được đề cập` },
    { criterion: "Mức độ liên quan", score: relevanceScore, maxScore: 100, comment: relevanceScore >= 70 ? "Bám sát câu hỏi" : "Cần tập trung hơn vào câu hỏi" },
    { criterion: "Cấu trúc & mạch lạc", score: coherenceScore, maxScore: 100, comment: `${sentenceCount} câu, TB ${Math.round(avgWordsPerSentence)} từ/câu` },
    { criterion: "Độ dài phù hợp", score: lengthScore, maxScore: 100, comment: `${wordCount} từ (khuyến nghị: ${idealMin}-${idealMax} từ)` },
    { criterion: "Ngôn ngữ chuyên nghiệp", score: sentimentScore, maxScore: 100, comment: `${matchedProfessional.length} cụm từ chuyên nghiệp` },
  ];

  return {
    score: overallScore, earnedPoints, totalPoints: maxPoints,
    keywordScore, coherenceScore, relevanceScore, lengthScore, sentimentScore,
    matchedKeywords: allMatched, missingKeywords: allMissing,
    feedback: feedbackParts.join(" "), suggestions, confidence,
    detailedBreakdown,
  };
}

// ─── AI Grading Display Component ───

export function AIGradingPanel({ result }: { result: AIGradingResult }) {
  const scoreColor = result.score >= 80 ? "#22c55e" : result.score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: scoreColor + "08", borderColor: scoreColor + "30" }}>
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle cx="32" cy="32" r="26" fill="none" stroke={scoreColor} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${result.score * 1.63} 163`} style={{ transition: "stroke-dasharray 1s" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: "16px", fontWeight: 800, color: scoreColor }}>{result.score}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4" style={{ color: scoreColor }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: scoreColor }}>AI Auto-Grading</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400" style={{ fontSize: "9px" }}>Độ tin cậy: {Math.round(result.confidence)}%</span>
          </div>
          <p className="text-gray-600" style={{ fontSize: "12px", lineHeight: 1.5 }}>{result.feedback}</p>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
            Điểm: <span style={{ fontWeight: 700, color: scoreColor }}>{result.earnedPoints}/{result.totalPoints}</span>
          </p>
        </div>
      </div>

      {/* Detailed breakdown bars */}
      <div className="space-y-2.5">
        {result.detailedBreakdown.map(item => (
          <div key={item.criterion}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 500 }}>{item.criterion}</span>
              <span className="text-gray-400" style={{ fontSize: "10px" }}>{item.score}/100 — {item.comment}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{
                width: `${item.score}%`,
                background: item.score >= 80 ? "#22c55e" : item.score >= 60 ? "#f59e0b" : "#ef4444",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-2 gap-3">
        {result.matchedKeywords.length > 0 && (
          <div className="p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600" style={{ fontSize: "10px", fontWeight: 600 }}>Từ khóa đã đề cập ({result.matchedKeywords.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {result.matchedKeywords.map(kw => (
                <span key={kw} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded" style={{ fontSize: "9px" }}>{kw}</span>
              ))}
            </div>
          </div>
        )}
        {result.missingKeywords.length > 0 && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-600" style={{ fontSize: "10px", fontWeight: 600 }}>Nên bổ sung ({result.missingKeywords.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {result.missingKeywords.map(kw => (
                <span key={kw} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded" style={{ fontSize: "9px" }}>{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-blue-600" style={{ fontSize: "10px", fontWeight: 600 }}>Gợi ý cải thiện</span>
          </div>
          <ul className="space-y-1">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-blue-400 shrink-0" style={{ fontSize: "10px" }}>•</span>
                <span className="text-blue-700" style={{ fontSize: "11px", lineHeight: 1.4 }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
