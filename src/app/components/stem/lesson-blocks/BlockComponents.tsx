/* ================================================================ */
/*  BLOCK COMPONENTS — 11 block editable cho LessonEditor             */
/*  - 7 block cũ upgraded với inline edit (S3)                       */
/*  - 4 block mới HIGH priority (S4)                                  */
/*  - 5 block NCKH (CT5) sẽ phát triển ở Sprint 6                    */
/* ================================================================ */

import { useState, type ReactNode } from "react";
import {
  Video, Image as ImageIcon, Circle, CheckCircle2, Plus, X,
  Trash2, Edit2, Save, AlertTriangle, Users, Quote, FileText,
} from "lucide-react";
import { toast } from "@/app/lib/toast";
import { SUBJECTS } from "../../mock-data/index";

/* ── Common block prop interface ── */
export interface EditableBlockProps<T = unknown> {
  content: T;
  onChange: (next: T) => void;
  readonly?: boolean;
}

/* ── Helper: parse content gracefully (string fallback) ── */
function asString(content: unknown, fallback = ""): string {
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text: string }).text);
  }
  return fallback;
}

/* ================================================================ */
/*  S3.1 — HeadingBlock (inline edit + 3 levels)                     */
/* ================================================================ */
export interface HeadingContent {
  text: string;
  level: 1 | 2 | 3;
}

export function HeadingBlock({ content, onChange, readonly }: EditableBlockProps<HeadingContent | string>) {
  const text = asString(content, "Tiêu đề mới");
  const level = (typeof content === "object" && content && "level" in content)
    ? content.level : 2;
  const [editing, setEditing] = useState(false);

  const sizeMap = { 1: "18px", 2: "15px", 3: "13px" } as const;
  const weightMap = { 1: 800, 2: 700, 3: 600 } as const;

  if (editing && !readonly) {
    return (
      <div className="space-y-1.5">
        <div className="flex gap-1.5 items-center">
          <span className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>Cấp:</span>
          {[1, 2, 3].map((l) => (
            <button key={l}
              onClick={() => onChange({ text, level: l as 1 | 2 | 3 })}
              className={`w-7 h-7 rounded border ${level === l ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
              style={{ fontSize: "11px", fontWeight: 700 }}>
              H{l}
            </button>
          ))}
          <button onClick={() => setEditing(false)} className="ml-auto px-2 py-1 bg-[#16a34a] text-white rounded" style={{ fontSize: "10.5px" }}>
            <Save className="w-3 h-3 inline mr-0.5" /> Xong
          </button>
        </div>
        <input
          autoFocus
          value={text}
          onChange={(e) => onChange({ text: e.target.value, level: level as 1 | 2 | 3 })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
          className="w-full px-2 py-1.5 bg-card border border-[#990803]/40 rounded outline-none"
          style={{ fontSize: sizeMap[level], fontWeight: weightMap[level] }}
        />
      </div>
    );
  }

  return (
    <p
      onClick={() => !readonly && setEditing(true)}
      className={!readonly ? "cursor-text hover:bg-secondary/30 rounded px-1 -mx-1" : ""}
      style={{ fontSize: sizeMap[level], fontWeight: weightMap[level] }}>
      {text}
    </p>
  );
}

/* ================================================================ */
/*  S3.1 — TextBlock (inline edit textarea)                          */
/* ================================================================ */
export function TextBlock({ content, onChange, readonly }: EditableBlockProps<string>) {
  const text = asString(content, "");
  const [editing, setEditing] = useState(false);

  if (editing && !readonly) {
    return (
      <div>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          rows={Math.max(2, Math.min(6, text.split("\n").length))}
          className="w-full px-2 py-1.5 bg-card border border-[#990803]/40 rounded outline-none resize-y"
          style={{ fontSize: "12.5px", lineHeight: 1.65 }}
        />
        <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>
          Bấm ra ngoài để lưu
        </p>
      </div>
    );
  }

  return (
    <p
      onClick={() => !readonly && setEditing(true)}
      className={!readonly ? "cursor-text hover:bg-secondary/30 rounded px-1 -mx-1" : ""}
      style={{ fontSize: "12.5px", lineHeight: 1.65, whiteSpace: "pre-wrap", color: text ? "inherit" : "#94a3b8" }}>
      {text || "Đoạn văn — bấm để nhập nội dung..."}
    </p>
  );
}

/* ================================================================ */
/*  S3.3 — ImageBlock (URL input + caption)                          */
/* ================================================================ */
export interface ImageContent {
  url: string;
  caption: string;
}

export function ImageBlock({ content, onChange, readonly }: EditableBlockProps<ImageContent | string>) {
  const url = typeof content === "object" && content ? content.url : "";
  const caption = typeof content === "object" && content ? content.caption : asString(content);
  const [editing, setEditing] = useState(false);

  return (
    <div>
      {!url && !editing ? (
        <button onClick={() => !readonly && setEditing(true)} disabled={readonly}
          className="w-full h-32 bg-secondary rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/70 border border-dashed border-border">
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>Bấm để thêm ảnh</span>
        </button>
      ) : (
        <>
          {url && (
            <img src={url} alt={caption} className="w-full max-h-64 object-contain rounded-lg border border-border bg-secondary/30" />
          )}
          {caption && !editing && (
            <p className="text-muted-foreground italic mt-1 text-center" style={{ fontSize: "11px" }}>📷 {caption}</p>
          )}
        </>
      )}
      {editing && !readonly && (
        <div className="mt-2 space-y-1.5 p-2.5 bg-secondary/40 rounded-lg">
          <input
            autoFocus
            value={url}
            onChange={(e) => onChange({ url: e.target.value, caption })}
            placeholder="https://images.unsplash.com/... hoặc URL ảnh"
            className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none"
            style={{ fontSize: "11.5px" }}
          />
          <input
            value={caption}
            onChange={(e) => onChange({ url, caption: e.target.value })}
            placeholder="Caption (mô tả ảnh)..."
            className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none"
            style={{ fontSize: "11.5px" }}
          />
          <div className="flex gap-1.5">
            <button onClick={() => setEditing(false)} className="px-2.5 py-1 bg-[#16a34a] text-white rounded" style={{ fontSize: "10.5px" }}>
              <Save className="w-3 h-3 inline mr-0.5" /> Xong
            </button>
            <button onClick={() => toast.info("Upload file ảnh — mở dialog")}
              className="px-2.5 py-1 border border-border bg-card rounded text-muted-foreground hover:bg-secondary" style={{ fontSize: "10.5px" }}>
              Hoặc upload file...
            </button>
          </div>
        </div>
      )}
      {!editing && !readonly && (
        <button onClick={() => setEditing(true)} className="mt-1 text-muted-foreground hover:text-foreground" style={{ fontSize: "10.5px" }}>
          <Edit2 className="w-3 h-3 inline mr-0.5" /> Sửa
        </button>
      )}
    </div>
  );
}

/* ================================================================ */
/*  S3.4 — VideoBlock (YouTube/MP4 URL + iframe embed)               */
/* ================================================================ */
export interface VideoContent {
  url: string;
  caption: string;
  durationSec: number;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function VideoBlock({ content, onChange, readonly }: EditableBlockProps<VideoContent | string>) {
  const url = typeof content === "object" && content ? content.url : "";
  const caption = typeof content === "object" && content ? content.caption : asString(content);
  const [editing, setEditing] = useState(false);
  const ytId = extractYouTubeId(url);

  return (
    <div>
      {!url && !editing ? (
        <button onClick={() => !readonly && setEditing(true)} disabled={readonly}
          className="w-full aspect-video bg-secondary rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/70 border border-dashed border-border">
          <Video className="w-10 h-10 text-muted-foreground/40" />
          <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>Bấm để thêm video YouTube hoặc MP4</span>
        </button>
      ) : (
        <>
          {ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full aspect-video rounded-lg border border-border"
              title={caption}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : url ? (
            <video src={url} controls className="w-full max-h-64 rounded-lg border border-border" />
          ) : null}
          {caption && !editing && (
            <p style={{ fontSize: "12.5px" }} className="mt-1.5">{caption}</p>
          )}
        </>
      )}
      {editing && !readonly && (
        <div className="mt-2 space-y-1.5 p-2.5 bg-secondary/40 rounded-lg">
          <input
            autoFocus
            value={url}
            onChange={(e) => onChange({ url: e.target.value, caption, durationSec: 0 })}
            placeholder="https://youtube.com/watch?v=... hoặc URL MP4"
            className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none"
            style={{ fontSize: "11.5px" }}
          />
          {url && !ytId && !url.endsWith(".mp4") && (
            <p className="text-orange-500" style={{ fontSize: "10px" }}>
              ⚠️ URL không phải YouTube hoặc MP4 — có thể không hiển thị được.
            </p>
          )}
          <input
            value={caption}
            onChange={(e) => onChange({ url, caption: e.target.value, durationSec: 0 })}
            placeholder="Mô tả ngắn về video..."
            className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none"
            style={{ fontSize: "11.5px" }}
          />
          <button onClick={() => setEditing(false)} className="px-2.5 py-1 bg-[#16a34a] text-white rounded" style={{ fontSize: "10.5px" }}>
            <Save className="w-3 h-3 inline mr-0.5" /> Xong
          </button>
        </div>
      )}
      {!editing && !readonly && (
        <button onClick={() => setEditing(true)} className="mt-1 text-muted-foreground hover:text-foreground" style={{ fontSize: "10.5px" }}>
          <Edit2 className="w-3 h-3 inline mr-0.5" /> Sửa
        </button>
      )}
    </div>
  );
}

/* ================================================================ */
/*  S3.2 — QuizBlock (FULL: 3 types + answers + explanation)         */
/* ================================================================ */
export type QuizQuestionType = "single" | "multi" | "true_false";
export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface QuizContent {
  questionType: QuizQuestionType;
  question: string;
  options: QuizOption[];
  explanation: string;
  difficulty: QuizDifficulty;
  timeLimitSec: number;
}

const DEFAULT_QUIZ: QuizContent = {
  questionType: "single",
  question: "Câu hỏi mới — bấm để nhập...",
  options: [
    { id: "A", text: "Đáp án A", correct: true },
    { id: "B", text: "Đáp án B", correct: false },
    { id: "C", text: "Đáp án C", correct: false },
    { id: "D", text: "Đáp án D", correct: false },
  ],
  explanation: "",
  difficulty: "medium",
  timeLimitSec: 60,
};

const DIFFICULTY_META: Record<QuizDifficulty, { label: string; color: string }> = {
  easy:   { label: "Dễ",         color: "#16a34a" },
  medium: { label: "Trung bình", color: "#c8a84e" },
  hard:   { label: "Khó",        color: "#dc2626" },
};

export function QuizBlock({ content, onChange, readonly }: EditableBlockProps<QuizContent | string>) {
  /* Backward compat — nếu content là string thì biến thành quiz default với question = string */
  const quiz: QuizContent = typeof content === "object" && content && "questionType" in content
    ? content as QuizContent
    : { ...DEFAULT_QUIZ, question: typeof content === "string" ? content : DEFAULT_QUIZ.question };

  const [editing, setEditing] = useState(false);

  const update = (patch: Partial<QuizContent>) => onChange({ ...quiz, ...patch });

  const updateOption = (i: number, patch: Partial<QuizOption>) => {
    const next = [...quiz.options];
    next[i] = { ...next[i], ...patch };
    if (quiz.questionType === "single" && patch.correct) {
      // Single — only 1 đáp án đúng
      next.forEach((o, idx) => { if (idx !== i) o.correct = false; });
    }
    update({ options: next });
  };

  const addOption = () => {
    const nextId = String.fromCharCode(65 + quiz.options.length);
    update({ options: [...quiz.options, { id: nextId, text: `Đáp án ${nextId}`, correct: false }] });
  };

  const removeOption = (i: number) => {
    if (quiz.options.length <= 2) {
      toast.error("Câu hỏi phải có ít nhất 2 đáp án");
      return;
    }
    update({ options: quiz.options.filter((_, idx) => idx !== i) });
  };

  /* Change question type — adjust options */
  const changeType = (newType: QuizQuestionType) => {
    if (newType === "true_false") {
      update({
        questionType: newType,
        options: [
          { id: "T", text: "Đúng", correct: true },
          { id: "F", text: "Sai",  correct: false },
        ],
      });
    } else {
      update({ questionType: newType });
    }
  };

  const dm = DIFFICULTY_META[quiz.difficulty];

  if (!editing) {
    /* ── View mode ── */
    return (
      <div className="space-y-1.5">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="flex-1" style={{ fontSize: "12.5px", fontWeight: 600 }}>{quiz.question}</p>
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9.5px", fontWeight: 700, color: dm.color, backgroundColor: dm.color + "15" }}>
              {dm.label}
            </span>
            <span className="text-muted-foreground" style={{ fontSize: "9.5px" }}>{quiz.timeLimitSec}s</span>
          </div>
        </div>
        <div className="space-y-1">
          {quiz.options.map((o) => (
            <div key={o.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded ${o.correct ? "bg-[#16a34a]/10 border border-[#16a34a]/30" : "bg-secondary/40"}`}
              style={{ fontSize: "11.5px" }}>
              {o.correct
                ? <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                : <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
              <span className="font-mono text-muted-foreground shrink-0" style={{ fontSize: "10.5px", fontWeight: 600 }}>{o.id}.</span>
              <span className={o.correct ? "text-[#16a34a]" : ""} style={{ fontWeight: o.correct ? 600 : 400 }}>{o.text}</span>
            </div>
          ))}
        </div>
        {quiz.explanation && (
          <div className="bg-[#0891b2]/5 border-l-2 border-[#0891b2] pl-2 py-1 mt-1.5">
            <p className="text-[#0891b2]" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em" }}>GIẢI THÍCH</p>
            <p style={{ fontSize: "11.5px", lineHeight: 1.45 }}>{quiz.explanation}</p>
          </div>
        )}
        {!readonly && (
          <button onClick={() => setEditing(true)} className="mt-1 text-muted-foreground hover:text-foreground" style={{ fontSize: "10.5px" }}>
            <Edit2 className="w-3 h-3 inline mr-0.5" /> Chỉnh sửa câu hỏi
          </button>
        )}
      </div>
    );
  }

  /* ── Edit mode ── */
  return (
    <div className="space-y-2 p-2 bg-secondary/30 rounded-lg border border-[#990803]/20">
      {/* Type + Difficulty + Time */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 600 }}>Loại:</span>
        {(["single", "multi", "true_false"] as QuizQuestionType[]).map((t) => (
          <button key={t} onClick={() => changeType(t)}
            className={`px-2 py-1 rounded border ${quiz.questionType === t ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "10.5px", fontWeight: 500 }}>
            {t === "single" ? "Một đáp án" : t === "multi" ? "Nhiều đáp án" : "Đúng/Sai"}
          </button>
        ))}
        <div className="h-4 w-px bg-border" />
        <span className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 600 }}>Độ khó:</span>
        <select value={quiz.difficulty} onChange={(e) => update({ difficulty: e.target.value as QuizDifficulty })}
          className="px-1.5 py-1 bg-card border border-border rounded" style={{ fontSize: "10.5px" }}>
          {(Object.keys(DIFFICULTY_META) as QuizDifficulty[]).map((d) =>
            <option key={d} value={d}>{DIFFICULTY_META[d].label}</option>
          )}
        </select>
        <span className="text-muted-foreground ml-auto" style={{ fontSize: "10.5px", fontWeight: 600 }}>Thời gian:</span>
        <input type="number" min={10} max={600} value={quiz.timeLimitSec}
          onChange={(e) => update({ timeLimitSec: Number(e.target.value) || 60 })}
          className="w-16 px-1.5 py-1 bg-card border border-border rounded text-center" style={{ fontSize: "10.5px" }} />
        <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>s</span>
        <button onClick={() => setEditing(false)} className="px-2 py-1 bg-[#16a34a] text-white rounded" style={{ fontSize: "10.5px" }}>
          <Save className="w-3 h-3 inline mr-0.5" /> Xong
        </button>
      </div>

      {/* Question */}
      <textarea value={quiz.question} onChange={(e) => update({ question: e.target.value })}
        rows={2} placeholder="Câu hỏi..."
        className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none resize-none"
        style={{ fontSize: "12.5px", fontWeight: 600 }} />

      {/* Options */}
      <div className="space-y-1">
        {quiz.options.map((o, i) => (
          <div key={o.id} className="flex items-center gap-1.5">
            <button onClick={() => updateOption(i, { correct: !o.correct })}
              className={`shrink-0 w-5 h-5 rounded flex items-center justify-center border-2 ${o.correct ? "bg-[#16a34a] border-[#16a34a]" : "border-border bg-card"}`}>
              {o.correct && <CheckCircle2 className="w-3 h-3 text-white" />}
            </button>
            <span className="font-mono text-muted-foreground shrink-0 w-5" style={{ fontSize: "10.5px", fontWeight: 600 }}>{o.id}.</span>
            <input value={o.text} onChange={(e) => updateOption(i, { text: e.target.value })}
              className="flex-1 px-2 py-1 bg-card border border-border rounded outline-none"
              style={{ fontSize: "11.5px" }}
              readOnly={quiz.questionType === "true_false"} />
            {quiz.questionType !== "true_false" && (
              <button onClick={() => removeOption(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {quiz.questionType !== "true_false" && quiz.options.length < 6 && (
          <button onClick={addOption}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground mt-1"
            style={{ fontSize: "10.5px" }}>
            <Plus className="w-3 h-3" /> Thêm đáp án
          </button>
        )}
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>
          Giải thích đáp án đúng (hiện sau khi HS submit)
        </label>
        <textarea value={quiz.explanation} onChange={(e) => update({ explanation: e.target.value })}
          rows={2} placeholder="Giải thích tại sao đáp án này đúng..."
          className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none resize-none"
          style={{ fontSize: "11.5px", lineHeight: 1.4 }} />
      </div>
    </div>
  );
}

/* ================================================================ */
/*  S3.5 — CodeBlock (language picker + syntax highlight nhẹ)        */
/* ================================================================ */
export interface CodeContent {
  language: string;
  code: string;
}

const CODE_LANGUAGES = [
  { id: "arduino_c", label: "Arduino C/C++", color: "#0891b2" },
  { id: "python",    label: "Python",        color: "#3572A5" },
  { id: "scratch",   label: "Scratch",       color: "#f59e0b" },
  { id: "block",     label: "Block-based",   color: "#7c3aed" },
  { id: "javascript", label: "JavaScript",   color: "#f7df1e" },
  { id: "html",       label: "HTML",         color: "#e34c26" },
] as const;

export function CodeBlock({ content, onChange, readonly }: EditableBlockProps<CodeContent | string>) {
  const codeContent: CodeContent = typeof content === "object" && content && "language" in content
    ? content as CodeContent
    : { language: "arduino_c", code: typeof content === "string" ? content : "// Nhập code..." };
  const [editing, setEditing] = useState(false);

  const lang = CODE_LANGUAGES.find((l) => l.id === codeContent.language) ?? CODE_LANGUAGES[0];

  const update = (patch: Partial<CodeContent>) => onChange({ ...codeContent, ...patch });

  if (editing && !readonly) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 600 }}>Ngôn ngữ:</span>
          <select value={codeContent.language} onChange={(e) => update({ language: e.target.value })}
            className="px-1.5 py-1 bg-card border border-border rounded" style={{ fontSize: "11px" }}>
            {CODE_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <button onClick={() => setEditing(false)} className="ml-auto px-2 py-1 bg-[#16a34a] text-white rounded" style={{ fontSize: "10.5px" }}>
            <Save className="w-3 h-3 inline mr-0.5" /> Xong
          </button>
        </div>
        <textarea
          autoFocus
          value={codeContent.code}
          onChange={(e) => update({ code: e.target.value })}
          rows={Math.min(20, Math.max(4, codeContent.code.split("\n").length + 1))}
          className="w-full px-2.5 py-2 bg-[#0f1118] text-[#c8a84e] rounded outline-none border border-border resize-y"
          style={{ fontSize: "11.5px", fontFamily: "Consolas, Monaco, 'Courier New', monospace", lineHeight: 1.55 }}
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9.5px", fontWeight: 700, color: lang.color, backgroundColor: lang.color + "20" }}>
          {lang.label}
        </span>
      </div>
      <pre onClick={() => !readonly && setEditing(true)}
        className={`p-2.5 bg-[#0f1118] text-[#c8a84e] rounded-md overflow-x-auto ${!readonly ? "cursor-text hover:ring-2 hover:ring-[#990803]/30" : ""}`}
        style={{ fontSize: "11px", fontFamily: "Consolas, Monaco, monospace", lineHeight: 1.65 }}>
        {codeContent.code}
      </pre>
    </div>
  );
}

/* ================================================================ */
/*  S3.6 — AttachmentBlock (filename + icon + size)                  */
/* ================================================================ */
export interface AttachmentContent {
  fileName: string;
  fileType: string;
  size: string;
  url: string;
}

export function AttachmentBlock({ content, onChange, readonly }: EditableBlockProps<AttachmentContent | string>) {
  const att: AttachmentContent = typeof content === "object" && content && "fileName" in content
    ? content as AttachmentContent
    : { fileName: typeof content === "string" ? content : "tài-liệu.pdf", fileType: "pdf", size: "1.2 MB", url: "" };
  const [editing, setEditing] = useState(false);

  const update = (patch: Partial<AttachmentContent>) => onChange({ ...att, ...patch });

  if (editing && !readonly) {
    return (
      <div className="space-y-1.5 p-2 bg-secondary/40 rounded-lg">
        <input autoFocus value={att.fileName} onChange={(e) => update({ fileName: e.target.value })}
          placeholder="Tên file (VD: phieu-hoc-tap.pdf)"
          className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none" style={{ fontSize: "11.5px" }} />
        <div className="flex gap-1.5">
          <select value={att.fileType} onChange={(e) => update({ fileType: e.target.value })}
            className="px-1.5 py-1.5 bg-card border border-border rounded" style={{ fontSize: "11px" }}>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="pptx">PPTX</option>
            <option value="xlsx">XLSX</option>
            <option value="zip">ZIP</option>
            <option value="other">Khác</option>
          </select>
          <input value={att.size} onChange={(e) => update({ size: e.target.value })}
            placeholder="Size (VD: 2.4 MB)"
            className="flex-1 px-2 py-1.5 bg-card border border-border rounded outline-none" style={{ fontSize: "11px" }} />
          <button onClick={() => setEditing(false)} className="px-2 py-1 bg-[#16a34a] text-white rounded" style={{ fontSize: "10.5px" }}>
            <Save className="w-3 h-3 inline mr-0.5" /> Xong
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-1.5 bg-secondary/40 rounded">
      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="flex-1" style={{ fontSize: "11.5px", fontWeight: 500 }}>{att.fileName}</span>
      <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{att.size}</span>
      {!readonly && (
        <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground" title="Sửa">
          <Edit2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ================================================================ */
/*  S4.1 — SubjectRolesBlock (CT2 — bảng phân vai môn)               */
/* ================================================================ */
export interface SubjectRoleRow {
  subject: string;
  role: string;
  knowledge: string;
}

export interface SubjectRolesContent {
  rows: SubjectRoleRow[];
}

const DEFAULT_SUBJECT_ROLES: SubjectRolesContent = {
  rows: [
    { subject: "Toán",  role: "Chủ đạo",  knowledge: "Công thức/định luật" },
    { subject: "Lý",    role: "Tích hợp", knowledge: "Khái niệm vật lý" },
  ],
};

export function SubjectRolesBlock({ content, onChange, readonly }: EditableBlockProps<SubjectRolesContent | string>) {
  const data: SubjectRolesContent = typeof content === "object" && content && "rows" in content
    ? content as SubjectRolesContent
    : DEFAULT_SUBJECT_ROLES;

  const updateRow = (i: number, patch: Partial<SubjectRoleRow>) => {
    const next = [...data.rows];
    next[i] = { ...next[i], ...patch };
    onChange({ rows: next });
  };

  const addRow = () => onChange({ rows: [...data.rows, { subject: "Toán", role: "Tích hợp", knowledge: "" }] });

  const removeRow = (i: number) => onChange({ rows: data.rows.filter((_, idx) => idx !== i) });

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <table className="w-full" style={{ fontSize: "11px" }}>
        <thead className="bg-secondary text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em" }}>
          <tr>
            <th className="px-2 py-1.5 text-left">MÔN</th>
            <th className="px-2 py-1.5 text-left">VAI TRÒ</th>
            <th className="px-2 py-1.5 text-left">KIẾN THỨC ĐÓNG GÓP</th>
            {!readonly && <th className="px-2 py-1.5 w-6" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.rows.map((row, i) => (
            <tr key={i} className="bg-card hover:bg-secondary/30">
              <td className="px-1 py-1">
                {readonly ? row.subject : (
                  <select value={row.subject} onChange={(e) => updateRow(i, { subject: e.target.value })}
                    className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-border rounded" style={{ fontSize: "11px", fontWeight: 500 }}>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </td>
              <td className="px-1 py-1">
                {readonly ? row.role : (
                  <select value={row.role} onChange={(e) => updateRow(i, { role: e.target.value })}
                    className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-border rounded" style={{ fontSize: "11px" }}>
                    <option value="Chủ đạo">Chủ đạo</option>
                    <option value="Tích hợp">Tích hợp</option>
                    <option value="Hỗ trợ">Hỗ trợ</option>
                  </select>
                )}
              </td>
              <td className="px-1 py-1">
                {readonly ? row.knowledge : (
                  <input value={row.knowledge} onChange={(e) => updateRow(i, { knowledge: e.target.value })}
                    placeholder="VD: Công thức F·d"
                    className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-border rounded outline-none" style={{ fontSize: "11px" }} />
                )}
              </td>
              {!readonly && (
                <td className="px-1 py-1 text-center">
                  <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!readonly && (
        <button onClick={addRow}
          className="w-full py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground border-t border-border"
          style={{ fontSize: "10.5px" }}>
          <Plus className="w-3 h-3 inline mr-0.5" /> Thêm môn
        </button>
      )}
    </div>
  );
}

/* ================================================================ */
/*  S4.2 — GroupActivityBlock (CT3/4/5 — hoạt động nhóm)             */
/* ================================================================ */
export interface GroupActivityContent {
  studentsPerGroup: number;
  durationMin: number;
  goal: string;
  steps: string[];
  roles: Array<{ name: string; description: string }>;
  expectedOutput: string;
}

const DEFAULT_GROUP_ACTIVITY: GroupActivityContent = {
  studentsPerGroup: 4,
  durationMin: 20,
  goal: "Mục tiêu hoạt động nhóm...",
  steps: ["Bước 1: ...", "Bước 2: ..."],
  roles: [
    { name: "Trưởng nhóm",   description: "Điều phối, phân công" },
    { name: "Thư ký",        description: "Ghi chép, tổng hợp" },
  ],
  expectedOutput: "Sản phẩm dự kiến...",
};

export function GroupActivityBlock({ content, onChange, readonly }: EditableBlockProps<GroupActivityContent | string>) {
  const data: GroupActivityContent = typeof content === "object" && content && "studentsPerGroup" in content
    ? content as GroupActivityContent
    : DEFAULT_GROUP_ACTIVITY;
  const [editing, setEditing] = useState(false);

  const update = (patch: Partial<GroupActivityContent>) => onChange({ ...data, ...patch });

  const updateStep = (i: number, v: string) => {
    const next = [...data.steps];
    next[i] = v;
    update({ steps: next });
  };

  const updateRole = (i: number, patch: Partial<{ name: string; description: string }>) => {
    const next = [...data.roles];
    next[i] = { ...next[i], ...patch };
    update({ roles: next });
  };

  return (
    <div className="bg-[#7c3aed]/5 border border-[#7c3aed]/30 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#7c3aed]/10 border-b border-[#7c3aed]/20">
        <Users className="w-3.5 h-3.5 text-[#7c3aed]" />
        <span className="text-[#7c3aed]" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em" }}>HOẠT ĐỘNG NHÓM</span>
        {!editing && !readonly && (
          <button onClick={() => setEditing(true)} className="ml-auto text-[#7c3aed] hover:underline" style={{ fontSize: "10.5px" }}>
            <Edit2 className="w-3 h-3 inline mr-0.5" /> Sửa
          </button>
        )}
        {editing && (
          <button onClick={() => setEditing(false)} className="ml-auto px-2 py-0.5 bg-[#16a34a] text-white rounded" style={{ fontSize: "10.5px" }}>
            <Save className="w-3 h-3 inline mr-0.5" /> Xong
          </button>
        )}
      </div>

      <div className="p-3 space-y-2.5">
        {/* Summary stats */}
        <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-border" style={{ fontSize: "11px" }}>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Nhóm:</span>
            {editing ? (
              <input type="number" min={2} max={10} value={data.studentsPerGroup}
                onChange={(e) => update({ studentsPerGroup: Number(e.target.value) || 4 })}
                className="w-12 px-1.5 py-0.5 bg-card border border-border rounded text-center" style={{ fontSize: "11px" }} />
            ) : <strong>{data.studentsPerGroup}</strong>}
            <span className="text-muted-foreground">HS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">⏱ Thời gian:</span>
            {editing ? (
              <input type="number" min={5} max={120} value={data.durationMin}
                onChange={(e) => update({ durationMin: Number(e.target.value) || 20 })}
                className="w-14 px-1.5 py-0.5 bg-card border border-border rounded text-center" style={{ fontSize: "11px" }} />
            ) : <strong>{data.durationMin}</strong>}
            <span className="text-muted-foreground">phút</span>
          </div>
        </div>

        {/* Goal */}
        <div>
          <p className="text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>🎯 MỤC TIÊU</p>
          {editing ? (
            <textarea value={data.goal} onChange={(e) => update({ goal: e.target.value })} rows={2}
              className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none resize-none" style={{ fontSize: "11.5px" }} />
          ) : (
            <p style={{ fontSize: "11.5px", lineHeight: 1.45 }}>{data.goal}</p>
          )}
        </div>

        {/* Steps */}
        <div>
          <p className="text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>📋 CÁC BƯỚC</p>
          <ol className="space-y-1 list-decimal list-inside" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
            {data.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-muted-foreground shrink-0" style={{ fontSize: "10.5px", fontWeight: 600 }}>{i + 1}.</span>
                {editing ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input value={s} onChange={(e) => updateStep(i, e.target.value)}
                      className="flex-1 px-1.5 py-0.5 bg-card border border-border rounded outline-none" style={{ fontSize: "11px" }} />
                    <button onClick={() => update({ steps: data.steps.filter((_, idx) => idx !== i) })}
                      className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : <span className="flex-1">{s}</span>}
              </li>
            ))}
            {editing && (
              <li>
                <button onClick={() => update({ steps: [...data.steps, "Bước mới..."] })}
                  className="text-muted-foreground hover:text-foreground" style={{ fontSize: "10.5px" }}>
                  <Plus className="w-3 h-3 inline mr-0.5" /> Thêm bước
                </button>
              </li>
            )}
          </ol>
        </div>

        {/* Roles */}
        <div>
          <p className="text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>👥 VAI TRÒ TRONG NHÓM</p>
          <div className="space-y-1">
            {data.roles.map((r, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1 bg-card border border-border rounded">
                {editing ? (
                  <>
                    <input value={r.name} onChange={(e) => updateRole(i, { name: e.target.value })}
                      className="w-24 px-1 py-0.5 bg-secondary/40 border-0 rounded outline-none" style={{ fontSize: "11px", fontWeight: 600 }} />
                    <input value={r.description} onChange={(e) => updateRole(i, { description: e.target.value })}
                      className="flex-1 px-1 py-0.5 bg-secondary/40 border-0 rounded outline-none" style={{ fontSize: "11px" }} />
                    <button onClick={() => update({ roles: data.roles.filter((_, idx) => idx !== i) })}
                      className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed", minWidth: "90px" }}>{r.name}:</span>
                    <span className="flex-1" style={{ fontSize: "11px" }}>{r.description}</span>
                  </>
                )}
              </div>
            ))}
            {editing && (
              <button onClick={() => update({ roles: [...data.roles, { name: "Vai trò mới", description: "" }] })}
                className="text-muted-foreground hover:text-foreground" style={{ fontSize: "10.5px" }}>
                <Plus className="w-3 h-3 inline mr-0.5" /> Thêm vai trò
              </button>
            )}
          </div>
        </div>

        {/* Expected output */}
        <div>
          <p className="text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>📦 SẢN PHẨM DỰ KIẾN</p>
          {editing ? (
            <input value={data.expectedOutput} onChange={(e) => update({ expectedOutput: e.target.value })}
              className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none" style={{ fontSize: "11.5px" }} />
          ) : (
            <p style={{ fontSize: "11.5px", fontWeight: 500, color: "#7c3aed" }}>{data.expectedOutput}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  S4.3 — RubricBlock (CT3/4/5 — bảng rubric đánh giá)              */
/* ================================================================ */
export interface RubricLevel {
  score: number;
  descriptor: string;
}

export interface RubricCriterion {
  name: string;
  weight: number;
  levels: RubricLevel[];   // 4 mức: 1=Yếu, 2=TB, 3=Khá, 4=Tốt
}

export interface RubricContent {
  criteria: RubricCriterion[];
}

const RUBRIC_LEVEL_LABELS = ["Yếu", "TB", "Khá", "Tốt"];

const DEFAULT_RUBRIC: RubricContent = {
  criteria: [
    { name: "Sáng tạo",   weight: 25, levels: [{ score: 1, descriptor: "Chưa có ý tưởng" }, { score: 2, descriptor: "Ý tưởng cơ bản" }, { score: 3, descriptor: "Ý tưởng tốt" }, { score: 4, descriptor: "Ý tưởng xuất sắc" }] },
    { name: "Khả thi",    weight: 25, levels: [{ score: 1, descriptor: "Không khả thi" }, { score: 2, descriptor: "Khả thi 1 phần" }, { score: 3, descriptor: "Khả thi" },           { score: 4, descriptor: "Rất khả thi" }] },
    { name: "Trình bày",  weight: 25, levels: [{ score: 1, descriptor: "Khó hiểu" },     { score: 2, descriptor: "Cần cải thiện" },   { score: 3, descriptor: "Rõ ràng" },         { score: 4, descriptor: "Rất tốt" }] },
    { name: "Hợp tác",    weight: 25, levels: [{ score: 1, descriptor: "Không tích cực" },{ score: 2, descriptor: "Cần cố gắng" },     { score: 3, descriptor: "Tích cực" },        { score: 4, descriptor: "Xuất sắc" }] },
  ],
};

export function RubricBlock({ content, onChange, readonly }: EditableBlockProps<RubricContent | string>) {
  const data: RubricContent = typeof content === "object" && content && "criteria" in content
    ? content as RubricContent
    : DEFAULT_RUBRIC;

  const totalWeight = data.criteria.reduce((s, c) => s + c.weight, 0);

  const updateCriterion = (i: number, patch: Partial<RubricCriterion>) => {
    const next = [...data.criteria];
    next[i] = { ...next[i], ...patch };
    onChange({ criteria: next });
  };

  const updateLevel = (criI: number, lvlI: number, descriptor: string) => {
    const next = [...data.criteria];
    next[criI] = {
      ...next[criI],
      levels: next[criI].levels.map((l, idx) => idx === lvlI ? { ...l, descriptor } : l),
    };
    onChange({ criteria: next });
  };

  const addCriterion = () => onChange({
    criteria: [...data.criteria, {
      name: "Tiêu chí mới",
      weight: 0,
      levels: RUBRIC_LEVEL_LABELS.map((_, i) => ({ score: i + 1, descriptor: "" })),
    }],
  });

  const removeCriterion = (i: number) => onChange({ criteria: data.criteria.filter((_, idx) => idx !== i) });

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#c8a84e]/15 border-b border-border">
        <span className="text-[#c8a84e]" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>📋 RUBRIC ĐÁNH GIÁ</span>
        <span className={`ml-auto ${totalWeight !== 100 ? "text-orange-500" : "text-muted-foreground"}`} style={{ fontSize: "10.5px", fontWeight: 600 }}>
          Tổng trọng số: {totalWeight}% {totalWeight !== 100 && "⚠️"}
        </span>
      </div>

      <table className="w-full" style={{ fontSize: "10.5px" }}>
        <thead className="bg-secondary text-muted-foreground" style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.03em" }}>
          <tr>
            <th className="px-2 py-1 text-left">TIÊU CHÍ</th>
            <th className="px-1 py-1 text-center w-12">%</th>
            {RUBRIC_LEVEL_LABELS.map((label, i) => (
              <th key={i} className="px-1.5 py-1 text-center" style={{ color: i === 0 ? "#dc2626" : i === 1 ? "#f59e0b" : i === 2 ? "#0891b2" : "#16a34a" }}>
                {label} ({i + 1})
              </th>
            ))}
            {!readonly && <th className="px-1 py-1 w-6" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.criteria.map((cri, criI) => (
            <tr key={criI} className="bg-card">
              <td className="px-2 py-1.5">
                {readonly ? <strong>{cri.name}</strong> : (
                  <input value={cri.name} onChange={(e) => updateCriterion(criI, { name: e.target.value })}
                    className="w-full px-1.5 py-0.5 bg-transparent border border-transparent hover:border-border rounded outline-none" style={{ fontSize: "10.5px", fontWeight: 600 }} />
                )}
              </td>
              <td className="px-1 py-1 text-center">
                {readonly ? `${cri.weight}%` : (
                  <input type="number" min={0} max={100} value={cri.weight}
                    onChange={(e) => updateCriterion(criI, { weight: Number(e.target.value) || 0 })}
                    className="w-10 px-1 py-0.5 bg-card border border-border rounded text-center" style={{ fontSize: "10.5px" }} />
                )}
              </td>
              {cri.levels.map((lvl, lvlI) => (
                <td key={lvlI} className="px-1.5 py-1">
                  {readonly ? lvl.descriptor : (
                    <input value={lvl.descriptor} onChange={(e) => updateLevel(criI, lvlI, e.target.value)}
                      placeholder={`Mô tả mức ${lvlI + 1}...`}
                      className="w-full px-1 py-0.5 bg-transparent border border-transparent hover:border-border rounded outline-none" style={{ fontSize: "10px", lineHeight: 1.35 }} />
                  )}
                </td>
              ))}
              {!readonly && (
                <td className="px-1 py-1 text-center">
                  <button onClick={() => removeCriterion(criI)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!readonly && (
        <button onClick={addCriterion}
          className="w-full py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground border-t border-border"
          style={{ fontSize: "10.5px" }}>
          <Plus className="w-3 h-3 inline mr-0.5" /> Thêm tiêu chí
        </button>
      )}
    </div>
  );
}

/* ================================================================ */
/*  S4.4 — SafetyNotesBlock (CT4 — lưu ý an toàn)                    */
/* ================================================================ */
export type SafetySeverity = "info" | "warning" | "danger";
export type SafetyCategory = "electrical" | "battery" | "tools" | "chemical" | "general";

export interface SafetyNotesContent {
  severity: SafetySeverity;
  category: SafetyCategory;
  notes: string[];
}

const SEVERITY_META: Record<SafetySeverity, { label: string; color: string; bg: string; border: string }> = {
  info:    { label: "Lưu ý",       color: "#0891b2", bg: "#0891b210", border: "#0891b240" },
  warning: { label: "Cảnh báo",    color: "#f59e0b", bg: "#f59e0b10", border: "#f59e0b40" },
  danger:  { label: "Nguy hiểm",   color: "#dc2626", bg: "#dc262610", border: "#dc262640" },
};

const CATEGORY_META: Record<SafetyCategory, { label: string; icon: string }> = {
  electrical: { label: "Điện",     icon: "⚡" },
  battery:    { label: "Pin",      icon: "🔋" },
  tools:      { label: "Dụng cụ",  icon: "🔧" },
  chemical:   { label: "Hoá chất", icon: "🧪" },
  general:    { label: "Chung",    icon: "⚠️" },
};

const DEFAULT_SAFETY: SafetyNotesContent = {
  severity: "warning",
  category: "electrical",
  notes: ["Lưu ý 1: ...", "Lưu ý 2: ..."],
};

export function SafetyNotesBlock({ content, onChange, readonly }: EditableBlockProps<SafetyNotesContent | string>) {
  const data: SafetyNotesContent = typeof content === "object" && content && "severity" in content
    ? content as SafetyNotesContent
    : typeof content === "string" && content
      ? { ...DEFAULT_SAFETY, notes: content.split("\n").filter(Boolean) }
      : DEFAULT_SAFETY;

  const sm = SEVERITY_META[data.severity];
  const cm = CATEGORY_META[data.category];

  const update = (patch: Partial<SafetyNotesContent>) => onChange({ ...data, ...patch });
  const updateNote = (i: number, v: string) => {
    const next = [...data.notes];
    next[i] = v;
    update({ notes: next });
  };
  const removeNote = (i: number) => update({ notes: data.notes.filter((_, idx) => idx !== i) });
  const addNote = () => update({ notes: [...data.notes, "Lưu ý mới..."] });

  return (
    <div className="rounded-lg border-l-4 overflow-hidden" style={{ borderLeftColor: sm.color, backgroundColor: sm.bg }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: sm.border }}>
        <AlertTriangle className="w-3.5 h-3.5" style={{ color: sm.color }} />
        <span style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em", color: sm.color }}>
          {cm.icon} {sm.label.toUpperCase()} · {cm.label.toUpperCase()}
        </span>
        {!readonly && (
          <div className="ml-auto flex items-center gap-1">
            <select value={data.severity} onChange={(e) => update({ severity: e.target.value as SafetySeverity })}
              className="px-1.5 py-0.5 bg-card border border-border rounded" style={{ fontSize: "10px" }}>
              {(Object.keys(SEVERITY_META) as SafetySeverity[]).map((s) =>
                <option key={s} value={s}>{SEVERITY_META[s].label}</option>
              )}
            </select>
            <select value={data.category} onChange={(e) => update({ category: e.target.value as SafetyCategory })}
              className="px-1.5 py-0.5 bg-card border border-border rounded" style={{ fontSize: "10px" }}>
              {(Object.keys(CATEGORY_META) as SafetyCategory[]).map((c) =>
                <option key={c} value={c}>{CATEGORY_META[c].label}</option>
              )}
            </select>
          </div>
        )}
      </div>

      <ul className="px-3 py-2 space-y-1">
        {data.notes.map((note, i) => (
          <li key={i} className="flex items-start gap-2">
            <span style={{ color: sm.color, fontSize: "11px", fontWeight: 700, marginTop: 1 }}>•</span>
            {readonly ? (
              <span className="flex-1" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>{note}</span>
            ) : (
              <>
                <input value={note} onChange={(e) => updateNote(i, e.target.value)}
                  className="flex-1 px-1.5 py-0.5 bg-card border border-transparent hover:border-border focus:border-border rounded outline-none"
                  style={{ fontSize: "11.5px", lineHeight: 1.5 }} />
                <button onClick={() => removeNote(i)} className="text-muted-foreground hover:text-destructive shrink-0 mt-1">
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </li>
        ))}
        {!readonly && (
          <li>
            <button onClick={addNote}
              className="hover:text-foreground" style={{ fontSize: "10.5px", color: sm.color }}>
              <Plus className="w-3 h-3 inline mr-0.5" /> Thêm lưu ý
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

/* ================================================================ */
/*  CT5 NCKH blocks (5) — import từ BlockComponentsCT5.tsx           */
/* ================================================================ */
import {
  ResearchQuestionBlockFull,
  HypothesisBlockFull,
  DataTableBlockFull,
  ChartBlockFull,
  CitationBlockFull,
} from "./BlockComponentsCT5";

export {
  ResearchQuestionBlockFull as ResearchQuestionBlock,
  HypothesisBlockFull as HypothesisBlock,
  DataTableBlockFull as DataTableBlock,
  ChartBlockFull as ChartBlock,
  CitationBlockFull as CitationBlock,
};

/* ================================================================ */
/*  Default content factory — schema chuẩn cho mỗi block type        */
/*  Giúp khi tạo block mới, không phải string fallback               */
/* ================================================================ */
export function getDefaultBlockContent(type: string): unknown {
  switch (type) {
    case "heading":
      return { text: "Tiêu đề mới", level: 2 } satisfies HeadingContent;
    case "text":
      return "";  // text dùng string trực tiếp
    case "image":
      return { url: "", caption: "" } satisfies ImageContent;
    case "video":
      return { url: "", caption: "", durationSec: 0 } satisfies VideoContent;
    case "quiz":
      return {
        questionType: "single",
        question: "Câu hỏi mới — bấm để nhập...",
        options: [
          { id: "A", text: "Đáp án A", correct: true },
          { id: "B", text: "Đáp án B", correct: false },
          { id: "C", text: "Đáp án C", correct: false },
          { id: "D", text: "Đáp án D", correct: false },
        ],
        explanation: "",
        difficulty: "medium",
        timeLimitSec: 60,
      } satisfies QuizContent;
    case "code":
      return { language: "arduino_c", code: "// Nhập code ở đây..." } satisfies CodeContent;
    case "attachment":
      return { fileName: "tài-liệu.pdf", fileType: "pdf", size: "1.2 MB", url: "" } satisfies AttachmentContent;
    case "subject-roles":
      return {
        rows: [
          { subject: "Toán",  role: "Chủ đạo",  knowledge: "Công thức/định luật cần dùng" },
          { subject: "Lý",    role: "Tích hợp", knowledge: "Khái niệm vật lý liên quan" },
        ],
      } satisfies SubjectRolesContent;
    case "group-activity":
      return {
        studentsPerGroup: 4,
        durationMin: 20,
        goal: "Mục tiêu hoạt động nhóm — HS làm được/tạo ra...",
        steps: ["Bước 1: Đọc tình huống và phân vai", "Bước 2: Thực hiện nhiệm vụ theo vai", "Bước 3: Tổng hợp và trình bày"],
        roles: [
          { name: "Trưởng nhóm",   description: "Điều phối, phân công" },
          { name: "Thư ký",        description: "Ghi chép, tổng hợp" },
          { name: "Người thực hiện", description: "Thao tác chính" },
          { name: "Người trình bày", description: "Trình bày sản phẩm" },
        ],
        expectedOutput: "Sản phẩm cụ thể nhóm phải tạo ra",
      } satisfies GroupActivityContent;
    case "rubric":
      return {
        criteria: [
          { name: "Sáng tạo",   weight: 25, levels: [{ score: 1, descriptor: "Chưa có ý tưởng" }, { score: 2, descriptor: "Ý tưởng cơ bản" }, { score: 3, descriptor: "Ý tưởng tốt" }, { score: 4, descriptor: "Ý tưởng xuất sắc" }] },
          { name: "Khả thi",    weight: 25, levels: [{ score: 1, descriptor: "Không khả thi" }, { score: 2, descriptor: "Khả thi 1 phần" }, { score: 3, descriptor: "Khả thi" },           { score: 4, descriptor: "Rất khả thi" }] },
          { name: "Trình bày",  weight: 25, levels: [{ score: 1, descriptor: "Khó hiểu" },     { score: 2, descriptor: "Cần cải thiện" },   { score: 3, descriptor: "Rõ ràng" },         { score: 4, descriptor: "Rất tốt" }] },
          { name: "Hợp tác",    weight: 25, levels: [{ score: 1, descriptor: "Không tích cực" },{ score: 2, descriptor: "Cần cố gắng" },     { score: 3, descriptor: "Tích cực" },        { score: 4, descriptor: "Xuất sắc" }] },
        ],
      } satisfies RubricContent;
    case "safety-notes":
      return {
        severity: "warning",
        category: "electrical",
        notes: [
          "Kiểm tra dây kết nối trước khi cấp nguồn",
          "Không chạm tay vào linh kiện khi đang có điện",
        ],
      } satisfies SafetyNotesContent;
    default:
      return "";  // CT5 blocks (research-question, hypothesis, etc.) sẽ dùng default trong từng component
  }
}

/* ================================================================ */
/*  Block dispatcher — gọi đúng component theo type                  */
/* ================================================================ */
export function renderEditableBlock(
  type: string,
  content: unknown,
  onChange: (next: unknown) => void,
  readonly?: boolean,
): ReactNode {
  const props = { content, onChange, readonly };
  switch (type) {
    case "heading":         return <HeadingBlock {...props} content={content as never} />;
    case "text":            return <TextBlock {...props} content={content as never} />;
    case "image":           return <ImageBlock {...props} content={content as never} />;
    case "video":           return <VideoBlock {...props} content={content as never} />;
    case "quiz":            return <QuizBlock {...props} content={content as never} />;
    case "code":            return <CodeBlock {...props} content={content as never} />;
    case "attachment":      return <AttachmentBlock {...props} content={content as never} />;
    case "subject-roles":   return <SubjectRolesBlock {...props} content={content as never} />;
    case "group-activity":  return <GroupActivityBlock {...props} content={content as never} />;
    case "rubric":          return <RubricBlock {...props} content={content as never} />;
    case "safety-notes":    return <SafetyNotesBlock {...props} content={content as never} />;
    case "research-question": return <ResearchQuestionBlock {...props} content={content as never} />;
    case "hypothesis":      return <HypothesisBlock {...props} content={content as never} />;
    case "data-table":      return <DataTableBlock {...props} content={content as never} />;
    case "chart":           return <ChartBlock {...props} content={content as never} />;
    case "citation":        return <CitationBlock {...props} content={content as never} />;
    default:                return <TextBlock content={asString(content)} onChange={onChange} readonly={readonly} />;
  }
}
