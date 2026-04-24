import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Bold, Italic, Code, List, Quote, Link2, Eye, EyeOff,
  Heading2, Send, AtSign, X,
} from "lucide-react";

// ─── Known Users (for @mention) ───
export const KNOWN_USERS = [
  { name: "Nguyễn Văn Minh", role: "Giám đốc Đào tạo", badge: "admin" },
  { name: "Trần Thị Hương", role: "Trưởng phòng Nhân sự", badge: "learner" },
  { name: "Đỗ Minh Châu", role: "Giám đốc CNTT", badge: "admin" },
  { name: "Ngô Thị Mai", role: "Trưởng phòng Kinh doanh", badge: "learner" },
  { name: "KS. Trần Minh Đức", role: "Giảng viên An toàn", badge: "instructor" },
  { name: "ThS. Lê Thị Thu Hà", role: "Giảng viên Tài chính", badge: "instructor" },
  { name: "Phạm Anh Tuấn", role: "Trưởng nhóm Marketing", badge: "learner" },
  { name: "Hoàng Thị Lan", role: "Trưởng Ban Pháp chế", badge: "learner" },
  { name: "Lê Hoàng Nam", role: "Chuyên viên Tài chính", badge: "learner" },
  { name: "Vũ Thị Mai", role: "Chuyên viên HR", badge: "learner" },
  { name: "Phạm Đức Mạnh", role: "Giảng viên ATLĐ", badge: "instructor" },
  { name: "Hoàng Đình Nam", role: "Giảng viên QLDA", badge: "instructor" },
  { name: "LS. Nguyễn Thị Lan", role: "Giảng viên Pháp luật", badge: "instructor" },
  { name: "Dr. Trần Hùng", role: "Ban CNTT & CĐS", badge: "admin" },
  { name: "Bùi Thị Hà", role: "Kế toán - Tài chính", badge: "learner" },
];

const badgeColors: Record<string, { color: string; bg: string }> = {
  admin: { color: "#990803", bg: "#99080310" },
  instructor: { color: "#c8a84e", bg: "#c8a84e15" },
  learner: { color: "#2e86de", bg: "#2e86de10" },
};

// ─── Markdown Renderer ───
export function renderMarkdown(text: string): JSX.Element[] {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let key = 0;

  const renderInline = (line: string, idx: number): JSX.Element => {
    // Process inline markdown
    const parts: (string | JSX.Element)[] = [];
    let remaining = line;
    let pKey = 0;

    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))|(@[\p{L}\s.]+(?=\s|$|[,;!?]))/gu;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }
      if (match[1]) {
        // **bold**
        parts.push(<strong key={`b${pKey++}`} className="text-foreground" style={{ fontWeight: 600 }}>{match[2]}</strong>);
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={`i${pKey++}`} className="text-foreground/80">{match[4]}</em>);
      } else if (match[5]) {
        // `inline code`
        parts.push(<code key={`c${pKey++}`} className="px-1.5 py-0.5 bg-gray-100 rounded text-[#990803]" style={{ fontSize: "0.9em" }}>{match[6]}</code>);
      } else if (match[7]) {
        // [link](url)
        parts.push(<a key={`l${pKey++}`} href={match[9]} target="_blank" rel="noopener noreferrer" className="text-[#2e86de] underline hover:text-[#1a6fc4]">{match[8]}</a>);
      } else if (match[0].startsWith("@")) {
        // @mention
        const mentionName = match[0].substring(1).trim();
        parts.push(
          <span key={`m${pKey++}`} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#2e86de]/10 text-[#2e86de] rounded cursor-default" style={{ fontSize: "0.95em", fontWeight: 500 }}>
            <AtSign className="w-3 h-3" />{mentionName}
          </span>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }
    if (parts.length === 0) parts.push(remaining);

    return <span key={idx}>{parts}</span>;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={key++} className="bg-gray-900 text-green-300 p-3 rounded-lg overflow-x-auto my-2" style={{ fontSize: "12px" }}>
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Heading ##
    if (line.startsWith("## ")) {
      elements.push(<p key={key++} className="text-foreground mt-2 mb-1" style={{ fontSize: "15px", fontWeight: 600 }}>{renderInline(line.substring(3), key)}</p>);
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(<p key={key++} className="text-foreground mt-2 mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>{renderInline(line.substring(4), key)}</p>);
      continue;
    }

    // Quote >
    if (line.startsWith("> ")) {
      elements.push(
        <div key={key++} className="border-l-3 border-[#c8a84e] pl-3 my-1 text-muted-foreground" style={{ fontSize: "inherit" }}>
          {renderInline(line.substring(2), key)}
        </div>
      );
      continue;
    }

    // Unordered list
    if (line.match(/^[-*] /)) {
      elements.push(
        <div key={key++} className="flex items-start gap-2 ml-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#990803] shrink-0" />
          <span>{renderInline(line.substring(2), key)}</span>
        </div>
      );
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\. /);
    if (olMatch) {
      elements.push(
        <div key={key++} className="flex items-start gap-2 ml-2">
          <span className="text-[#990803] shrink-0" style={{ fontWeight: 600, fontSize: "0.9em" }}>{olMatch[1]}.</span>
          <span>{renderInline(line.substring(olMatch[0].length), key)}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Normal paragraph
    elements.push(<p key={key++}>{renderInline(line, key)}</p>);
  }

  // Close unclosed code block
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key={key++} className="bg-gray-900 text-green-300 p-3 rounded-lg overflow-x-auto my-2" style={{ fontSize: "12px" }}>
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
  }

  return elements;
}

// ─── Rich Editor with Markdown Toolbar + @Mention ───
interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  rows?: number;
  submitLabel?: string;
  submitIcon?: typeof Send;
  disabled?: boolean;
  compact?: boolean;
  replyingTo?: string | null;
  onCancelReply?: () => void;
}

export function RichEditor({
  value, onChange, onSubmit, placeholder = "Nhập nội dung...",
  rows = 4, submitLabel = "Gửi", submitIcon: SubmitIcon = Send,
  disabled = false, compact = false, replyingTo, onCancelReply,
}: RichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionPos, setMentionPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [mentionIdx, setMentionIdx] = useState(0);
  const mentionRef = useRef<HTMLDivElement>(null);

  const filteredUsers = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return KNOWN_USERS.filter(u => u.name.toLowerCase().includes(q)).slice(0, 6);
  }, [mentionQuery]);

  // Insert text at cursor
  const insertAt = useCallback((before: string, after: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const newVal = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      const cursor = start + before.length + selected.length;
      ta.setSelectionRange(cursor, cursor);
    }, 10);
  }, [value, onChange]);

  const toolbarActions = [
    { icon: Bold, label: "Đậm", action: () => insertAt("**", "**") },
    { icon: Italic, label: "Nghiêng", action: () => insertAt("*", "*") },
    { icon: Code, label: "Code", action: () => insertAt("`", "`") },
    { icon: Heading2, label: "Heading", action: () => insertAt("## ") },
    { icon: List, label: "List", action: () => insertAt("- ") },
    { icon: Quote, label: "Trích dẫn", action: () => insertAt("> ") },
    { icon: Link2, label: "Link", action: () => insertAt("[", "](url)") },
    { icon: AtSign, label: "Mention", action: () => { insertAt("@"); triggerMention(""); } },
  ];

  const triggerMention = (query: string) => {
    setMentionQuery(query);
    setMentionIdx(0);
    const ta = textareaRef.current;
    if (ta) {
      // Approximate position
      const rect = ta.getBoundingClientRect();
      setMentionPos({ top: rect.height + 4, left: 0 });
    }
  };

  const insertMention = (userName: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart;
    // Find the @ symbol before cursor
    const before = value.substring(0, cursor);
    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1) return;
    const newVal = value.substring(0, atIdx) + `@${userName} ` + value.substring(cursor);
    onChange(newVal);
    setMentionQuery(null);
    setTimeout(() => {
      ta.focus();
      const pos = atIdx + userName.length + 2;
      ta.setSelectionRange(pos, pos);
    }, 10);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    // Check for @mention
    const cursor = e.target.selectionStart;
    const before = val.substring(0, cursor);
    const atMatch = before.match(/@([\p{L}\s.]*)$/u);
    if (atMatch) {
      triggerMention(atMatch[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIdx(prev => Math.min(prev + 1, filteredUsers.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIdx(prev => Math.max(prev - 1, 0)); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insertMention(filteredUsers[mentionIdx].name); }
      else if (e.key === "Escape") { setMentionQuery(null); }
      return;
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Click outside to close mention
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mentionRef.current && !mentionRef.current.contains(e.target as Node)) {
        setMentionQuery(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-0">
      {/* Replying to indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#2e86de]/5 border border-[#2e86de]/20 rounded-t-lg" style={{ fontSize: "12px" }}>
          <span className="text-[#2e86de]" style={{ fontWeight: 500 }}>↩ Trả lời</span>
          <span className="text-foreground" style={{ fontWeight: 600 }}>{replyingTo}</span>
          {onCancelReply && (
            <button onClick={onCancelReply} className="ml-auto p-0.5 rounded hover:bg-[#2e86de]/10 cursor-pointer">
              <X className="w-3.5 h-3.5 text-[#2e86de]" />
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      {!compact && (
        <div className={`flex items-center gap-0.5 px-2 py-1.5 bg-secondary/50 border border-border ${replyingTo ? "border-t-0" : "rounded-t-lg"}`}>
          {toolbarActions.map(({ icon: Icon, label, action }) => (
            <button key={label} onClick={action} title={label}
              className="p-1.5 rounded hover:bg-secondary transition-colors cursor-pointer text-muted-foreground hover:text-foreground" style={{ fontSize: "12px" }}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${showPreview ? "bg-[#990803]/10 text-[#990803]" : "text-muted-foreground hover:text-foreground"}`}
            style={{ fontSize: "11px" }}>
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? "Soạn" : "Xem trước"}
          </button>
        </div>
      )}

      {/* Editor / Preview */}
      {showPreview ? (
        <div className={`px-3 py-3 bg-card border border-border border-t-0 rounded-b-lg min-h-[${rows * 24}px]`}
          style={{ fontSize: "14px", lineHeight: "1.7" }}>
          {value.trim() ? (
            <div className="prose-sm text-foreground space-y-1">
              {renderMarkdown(value)}
            </div>
          ) : (
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Chưa có nội dung để xem trước</p>
          )}
        </div>
      ) : (
        <div className="relative">
          <textarea ref={textareaRef} value={value} onChange={handleTextareaChange}
            onKeyDown={handleKeyDown} placeholder={placeholder} rows={compact ? 2 : rows}
            className={`w-full p-3 bg-input-background border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none ${!compact && !replyingTo ? "border-t-0 rounded-b-lg rounded-t-none" : compact ? "rounded-lg" : "border-t-0 rounded-b-lg rounded-t-none"}`}
            style={{ fontSize: "13px", resize: "vertical", minHeight: compact ? "48px" : undefined }}
          />

          {/* @mention dropdown */}
          {mentionQuery !== null && filteredUsers.length > 0 && (
            <div ref={mentionRef}
              className="absolute left-0 bottom-full mb-1 w-72 bg-card rounded-xl border border-border shadow-2xl z-30 py-1 overflow-hidden max-h-52 overflow-y-auto"
              style={{ ...mentionPos }}>
              <div className="px-3 py-1.5 text-muted-foreground border-b border-border" style={{ fontSize: "10px", fontWeight: 600 }}>
                THÀNH VIÊN — Gõ để lọc, ↑↓ chọn, Enter xác nhận
              </div>
              {filteredUsers.map((u, idx) => {
                const bc = badgeColors[u.badge] || badgeColors.learner;
                return (
                  <button key={u.name} onClick={() => insertMention(u.name)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${idx === mentionIdx ? "bg-[#990803]/5" : "hover:bg-secondary"}`}
                    onMouseEnter={() => setMentionIdx(idx)}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ${u.badge === "admin" ? "bg-[#990803]" : u.badge === "instructor" ? "bg-[#c8a84e]" : "bg-gray-400"}`}
                      style={{ fontSize: "9px", fontWeight: 700 }}>
                      {u.name.replace(/^(KS\.|TS\.|ThS\.|PMP\.|LS\.|Dr\.)\s*/, "").split(" ").slice(-2).map(p => p[0]).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{u.name}</p>
                      <p className="text-muted-foreground truncate" style={{ fontSize: "10px" }}>{u.role}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded shrink-0" style={{ fontSize: "9px", fontWeight: 600, color: bc.color, backgroundColor: bc.bg }}>
                      {u.badge === "admin" ? "Admin" : u.badge === "instructor" ? "GV" : "HV"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer with submit */}
      {onSubmit && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
            Markdown: **đậm**, *nghiêng*, `code`, @mention • Ctrl+Enter để gửi
          </span>
          <button disabled={disabled || !value.trim()} onClick={onSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors disabled:opacity-50 cursor-pointer"
            style={{ fontSize: "13px" }}>
            <SubmitIcon className="w-4 h-4" /> {submitLabel}
          </button>
        </div>
      )}
    </div>
  );
}
