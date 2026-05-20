/* ================================================================ */
/*  SGK PICKER DIALOG — Chọn bài SGK theo Khối → Môn → Bài           */
/*  Dùng cho CT1 (1 bài) và CT2 (nhiều bài)                          */
/*  Mode single | multi                                              */
/* ================================================================ */

import { useState, useMemo } from "react";
import {
  X, Search, ChevronRight, Layers, Check, BookOpen,
} from "lucide-react";
import {
  SGK_BOOKS, encodeSGKRef,
  type SGKBook, type SGKChapter, type SGKLesson,
} from "../../mock-data/index";

interface SGKPickerDialogProps {
  open: boolean;
  onClose: () => void;
  /** "single" → trả 1 ref; "multi" → trả mảng */
  mode: "single" | "multi";
  /** Filter ban đầu theo khối lớp (VD "THCS 8") */
  initialGrade?: string;
  /** Filter ban đầu theo môn */
  initialSubject?: string;
  /** Selected refs hiện tại (decoded) */
  selectedRefs?: string[];
  onConfirm: (refs: string[]) => void;
}

/** Decode "TOAN-8-KNTT/C1/L1.2" → { bookId, chapterId, lessonId } */
function decodeSGKRef(ref: string): { bookId: string; chapterId?: string; lessonId?: string } {
  const [bookId, chapterId, lessonId] = ref.split("/");
  return { bookId, chapterId, lessonId };
}

export function SGKPickerDialog({
  open, onClose, mode, initialGrade, initialSubject,
  selectedRefs = [], onConfirm,
}: SGKPickerDialogProps) {
  const [gradeFilter, setGradeFilter] = useState(initialGrade ?? "all");
  const [subjectFilter, setSubjectFilter] = useState(initialSubject ?? "all");
  const [search, setSearch] = useState("");
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>(selectedRefs);

  /* ── Derived ── */
  const allGrades = useMemo(() =>
    Array.from(new Set(SGK_BOOKS.map((b) => b.grade))).sort(), []);
  const allSubjects = useMemo(() =>
    Array.from(new Set(SGK_BOOKS.map((b) => b.subject))).sort(), []);

  const filteredBooks = useMemo(() => SGK_BOOKS.filter((b) => {
    if (gradeFilter !== "all" && b.grade !== gradeFilter) return false;
    if (subjectFilter !== "all" && b.subject !== subjectFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit =
        b.subject.toLowerCase().includes(q) ||
        b.grade.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.chapters.some((c) =>
          c.name.toLowerCase().includes(q) ||
          c.lessons.some((l) => l.name.toLowerCase().includes(q))
        );
      if (!hit) return false;
    }
    return true;
  }), [gradeFilter, subjectFilter, search]);

  const activeBook: SGKBook | undefined = activeBookId
    ? SGK_BOOKS.find((b) => b.id === activeBookId)
    : undefined;
  const activeChapter: SGKChapter | undefined = activeBook && activeChapterId
    ? activeBook.chapters.find((c) => c.id === activeChapterId)
    : undefined;

  /* ── Handlers ── */
  const togglePick = (lesson: SGKLesson, book: SGKBook, chapter: SGKChapter) => {
    const ref = encodeSGKRef(book.id, chapter.id, lesson.id);
    if (mode === "single") {
      setPicked([ref]);
    } else {
      setPicked((prev) => prev.includes(ref) ? prev.filter((x) => x !== ref) : [...prev, ref]);
    }
  };

  const isPicked = (lesson: SGKLesson, book: SGKBook, chapter: SGKChapter) => {
    const ref = encodeSGKRef(book.id, chapter.id, lesson.id);
    return picked.includes(ref);
  };

  const removePicked = (ref: string) => setPicked((prev) => prev.filter((x) => x !== ref));

  const handleConfirm = () => {
    onConfirm(picked);
    onClose();
  };

  /* Resolve picked refs → display text */
  const pickedDisplay = useMemo(() => picked.map((ref) => {
    const { bookId, chapterId, lessonId } = decodeSGKRef(ref);
    const book = SGK_BOOKS.find((b) => b.id === bookId);
    const chapter = book?.chapters.find((c) => c.id === chapterId);
    const lesson = chapter?.lessons.find((l) => l.id === lessonId);
    if (!book || !chapter || !lesson) return { ref, text: ref, valid: false };
    return {
      ref,
      text: `${book.grade} · ${book.subject} · ${lesson.name}`,
      subText: `${book.publisher} · ${chapter.name}`,
      valid: true,
    };
  }), [picked]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-gradient-to-r from-[#2563eb]/5 to-transparent">
          <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>
              Gắn kết SGK Bộ GD&ĐT {mode === "multi" && <span className="text-muted-foreground">(chọn nhiều)</span>}
            </h2>
            <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
              Chọn Khối lớp → Môn → Sách → Chương → Bài học cụ thể
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border bg-secondary/30 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên bài, chương..."
              className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-md outline-none"
              style={{ fontSize: "12px" }} />
          </div>
          <select value={gradeFilter} onChange={(e) => { setGradeFilter(e.target.value); setActiveBookId(null); setActiveChapterId(null); }}
            className="px-2.5 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "11.5px" }}>
            <option value="all">Tất cả khối ({SGK_BOOKS.length} sách)</option>
            {allGrades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setActiveBookId(null); setActiveChapterId(null); }}
            className="px-2.5 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "11.5px" }}>
            <option value="all">Tất cả môn</option>
            {allSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-muted-foreground" style={{ fontSize: "11.5px" }}>
            {filteredBooks.length}/{SGK_BOOKS.length} sách
          </span>
        </div>

        {/* Body: 3-column miller picker */}
        <div className="flex-1 overflow-hidden grid grid-cols-[1fr_1fr_1.4fr] divide-x divide-border">

          {/* Col 1: Books */}
          <div className="overflow-y-auto">
            <div className="px-3 py-2 sticky top-0 bg-card border-b border-border">
              <p className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
                SÁCH ({filteredBooks.length})
              </p>
            </div>
            {filteredBooks.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                Không tìm thấy sách phù hợp
              </p>
            ) : filteredBooks.map((book) => {
              const isActive = activeBookId === book.id;
              return (
                <button key={book.id} onClick={() => { setActiveBookId(book.id); setActiveChapterId(null); }}
                  className={`w-full text-left px-3 py-2 border-b border-border transition-colors ${
                    isActive ? "bg-[#2563eb]/10" : "hover:bg-secondary/50"
                  }`}>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-[#2563eb] shrink-0" />
                    <p className="flex-1 truncate" style={{ fontSize: "11.5px", fontWeight: isActive ? 700 : 500 }}>
                      {book.subject} {book.grade}
                    </p>
                    {isActive && <ChevronRight className="w-3 h-3 text-[#2563eb]" />}
                  </div>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>
                    {book.publisher}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Col 2: Chapters */}
          <div className="overflow-y-auto">
            <div className="px-3 py-2 sticky top-0 bg-card border-b border-border">
              <p className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
                CHƯƠNG {activeBook ? `(${activeBook.chapters.length})` : ""}
              </p>
            </div>
            {!activeBook ? (
              <p className="text-center py-8 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                Chọn sách bên trái
              </p>
            ) : activeBook.chapters.map((chapter) => {
              const isActive = activeChapterId === chapter.id;
              const pickedInChap = chapter.lessons.filter((l) => isPicked(l, activeBook, chapter)).length;
              return (
                <button key={chapter.id} onClick={() => setActiveChapterId(chapter.id)}
                  className={`w-full text-left px-3 py-2 border-b border-border transition-colors ${
                    isActive ? "bg-[#2563eb]/10" : "hover:bg-secondary/50"
                  }`}>
                  <div className="flex items-center gap-1.5">
                    <p className="flex-1 truncate" style={{ fontSize: "11.5px", fontWeight: isActive ? 700 : 500 }}>
                      {chapter.name}
                    </p>
                    {pickedInChap > 0 && (
                      <span className="px-1.5 py-0.5 bg-[#16a34a] text-white rounded-full" style={{ fontSize: "9px", fontWeight: 700 }}>
                        {pickedInChap}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 text-[#2563eb]" />}
                  </div>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>
                    {chapter.lessons.length} bài
                  </p>
                </button>
              );
            })}
          </div>

          {/* Col 3: Lessons */}
          <div className="overflow-y-auto">
            <div className="px-3 py-2 sticky top-0 bg-card border-b border-border">
              <p className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
                BÀI HỌC {activeChapter ? `(${activeChapter.lessons.length})` : ""}
              </p>
            </div>
            {!activeChapter ? (
              <p className="text-center py-8 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                Chọn chương ở cột giữa
              </p>
            ) : activeChapter.lessons.map((lesson) => {
              const picked_ = activeBook ? isPicked(lesson, activeBook, activeChapter) : false;
              return (
                <button key={lesson.id}
                  onClick={() => activeBook && togglePick(lesson, activeBook, activeChapter)}
                  className={`w-full flex items-start gap-2 px-3 py-2 border-b border-border transition-colors ${
                    picked_ ? "bg-[#16a34a]/10" : "hover:bg-secondary/50"
                  }`}>
                  <div className={`w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center border-2 ${
                    picked_ ? "bg-[#16a34a] border-[#16a34a]" : "border-border bg-card"
                  } ${mode === "single" ? "rounded-full" : ""}`}>
                    {picked_ && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <p className="flex-1 text-left" style={{ fontSize: "11.5px", fontWeight: picked_ ? 600 : 400, lineHeight: 1.45 }}>
                    {lesson.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected summary */}
        {picked.length > 0 && (
          <div className="px-5 py-2.5 border-t border-border bg-[#16a34a]/5 max-h-32 overflow-y-auto">
            <p className="text-[#16a34a] mb-1.5" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
              ĐÃ CHỌN ({picked.length})
            </p>
            <div className="space-y-1">
              {pickedDisplay.map((p) => (
                <div key={p.ref} className="flex items-center gap-2 px-2 py-1 bg-card border border-[#16a34a]/30 rounded">
                  <Check className="w-3 h-3 text-[#16a34a] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{p.text}</p>
                    {p.subText && <p className="text-muted-foreground truncate" style={{ fontSize: "10px" }}>{p.subText}</p>}
                  </div>
                  <button onClick={() => removePicked(p.ref)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border bg-card rounded-md hover:bg-secondary"
            style={{ fontSize: "12px" }}>
            Hủy
          </button>
          <button onClick={handleConfirm} disabled={picked.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] disabled:opacity-40"
            style={{ fontSize: "12px", fontWeight: 600 }}>
            <Check className="w-3.5 h-3.5" /> Xác nhận {picked.length > 0 ? `(${picked.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SGKPickerDialog;
