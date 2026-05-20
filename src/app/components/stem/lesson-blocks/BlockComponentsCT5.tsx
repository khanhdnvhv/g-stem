/* ================================================================ */
/*  CT5 BLOCK COMPONENTS — 5 block đầy đủ cho Nghiên cứu KH          */
/*  Schema phức tạp + visual chuyên nghiệp                           */
/*  - research-question / hypothesis / data-table / chart / citation */
/* ================================================================ */

import { useState, useMemo } from "react";
import {
  Microscope, TrendingUp, BarChart3, Quote, Plus, X, Save, Edit2,
  Table as TableIcon, ExternalLink,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { EditableBlockProps } from "./BlockComponents";

/* ── Helper ── */
function asString(content: unknown, fallback = ""): string {
  if (typeof content === "string") return content;
  return fallback;
}

/* ================================================================ */
/*  S6.2 — ResearchQuestionBlock (đầy đủ)                            */
/* ================================================================ */
export interface ResearchQuestionContent {
  mainQuestion: string;
  subQuestions: string[];
  scope: string;
  significance: string;
}

const DEFAULT_RQ: ResearchQuestionContent = {
  mainQuestion: "Câu hỏi nghiên cứu chính...",
  subQuestions: ["Câu hỏi phụ 1...", "Câu hỏi phụ 2..."],
  scope: "Phạm vi nghiên cứu...",
  significance: "Ý nghĩa khoa học/thực tiễn...",
};

export function ResearchQuestionBlockFull({ content, onChange, readonly }: EditableBlockProps<ResearchQuestionContent | string>) {
  const data: ResearchQuestionContent = typeof content === "object" && content && "mainQuestion" in content
    ? content as ResearchQuestionContent
    : typeof content === "string" && content
      ? { ...DEFAULT_RQ, mainQuestion: content }
      : DEFAULT_RQ;
  const [editing, setEditing] = useState(false);

  const update = (patch: Partial<ResearchQuestionContent>) => onChange({ ...data, ...patch });

  const updateSubQ = (i: number, v: string) => {
    const next = [...data.subQuestions];
    next[i] = v;
    update({ subQuestions: next });
  };

  const addSubQ = () => update({ subQuestions: [...data.subQuestions, "Câu hỏi phụ mới..."] });
  const removeSubQ = (i: number) => update({ subQuestions: data.subQuestions.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-lg overflow-hidden border-l-4 border border-[#1e3a8a]/30 bg-[#1e3a8a]/5">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e3a8a]/10 border-b border-[#1e3a8a]/20">
        <Microscope className="w-3.5 h-3.5 text-[#1e3a8a]" />
        <span className="text-[#1e3a8a]" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
          🔬 CÂU HỎI NGHIÊN CỨU
        </span>
        {!readonly && (
          <button onClick={() => setEditing(!editing)}
            className="ml-auto px-2 py-0.5 bg-card border border-[#1e3a8a]/30 text-[#1e3a8a] rounded hover:bg-[#1e3a8a]/10"
            style={{ fontSize: "10.5px", fontWeight: 600 }}>
            {editing ? <><Save className="w-3 h-3 inline mr-0.5" /> Xong</> : <><Edit2 className="w-3 h-3 inline mr-0.5" /> Sửa</>}
          </button>
        )}
      </div>

      <div className="p-3 space-y-2.5">
        {/* Main question */}
        <div>
          <p className="text-[#1e3a8a] mb-0.5" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em" }}>
            CÂU HỎI CHÍNH
          </p>
          {editing ? (
            <textarea value={data.mainQuestion} onChange={(e) => update({ mainQuestion: e.target.value })}
              rows={2} className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none resize-none"
              style={{ fontSize: "12.5px", fontStyle: "italic", lineHeight: 1.5 }} />
          ) : (
            <p style={{ fontSize: "13px", fontStyle: "italic", fontWeight: 600, lineHeight: 1.5 }}>
              "{data.mainQuestion}"
            </p>
          )}
        </div>

        {/* Sub-questions */}
        <div>
          <p className="text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>
            CÂU HỎI PHỤ ({data.subQuestions.length})
          </p>
          <ol className="space-y-1 list-decimal list-inside ml-2" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
            {data.subQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[#1e3a8a] shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>{i + 1}.</span>
                {editing ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input value={q} onChange={(e) => updateSubQ(i, e.target.value)}
                      className="flex-1 px-1.5 py-0.5 bg-card border border-border rounded outline-none"
                      style={{ fontSize: "11.5px" }} />
                    <button onClick={() => removeSubQ(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : <span className="flex-1">{q}</span>}
              </li>
            ))}
            {editing && (
              <li className="list-none">
                <button onClick={addSubQ} className="text-[#1e3a8a] hover:underline" style={{ fontSize: "10.5px" }}>
                  <Plus className="w-3 h-3 inline mr-0.5" /> Thêm câu hỏi phụ
                </button>
              </li>
            )}
          </ol>
        </div>

        {/* Scope */}
        <div>
          <p className="text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>📍 PHẠM VI</p>
          {editing ? (
            <textarea value={data.scope} onChange={(e) => update({ scope: e.target.value })}
              rows={2} className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none resize-none"
              style={{ fontSize: "11.5px", lineHeight: 1.45 }} />
          ) : (
            <p style={{ fontSize: "11.5px", lineHeight: 1.45 }}>{data.scope}</p>
          )}
        </div>

        {/* Significance */}
        <div>
          <p className="text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>✨ Ý NGHĨA</p>
          {editing ? (
            <textarea value={data.significance} onChange={(e) => update({ significance: e.target.value })}
              rows={2} className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none resize-none"
              style={{ fontSize: "11.5px", lineHeight: 1.45 }} />
          ) : (
            <p style={{ fontSize: "11.5px", lineHeight: 1.45 }}>{data.significance}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  S6.3 — HypothesisBlock (đầy đủ — "Nếu... thì..." + variables)    */
/* ================================================================ */
export interface HypothesisContent {
  ifClause: string;
  thenClause: string;
  reasoning: string;
  variables: {
    independent: string;
    dependent: string;
    controlled: string[];
  };
}

const DEFAULT_HYP: HypothesisContent = {
  ifClause: "Nếu [biến độc lập thay đổi]...",
  thenClause: "thì [biến phụ thuộc] sẽ...",
  reasoning: "Vì... (dựa trên lý thuyết/kết quả nghiên cứu trước)",
  variables: {
    independent: "Biến mà ta thay đổi",
    dependent: "Biến mà ta đo",
    controlled: ["Yếu tố không đổi 1", "Yếu tố không đổi 2"],
  },
};

export function HypothesisBlockFull({ content, onChange, readonly }: EditableBlockProps<HypothesisContent | string>) {
  const data: HypothesisContent = typeof content === "object" && content && "ifClause" in content
    ? content as HypothesisContent
    : typeof content === "string" && content
      ? { ...DEFAULT_HYP, reasoning: content }
      : DEFAULT_HYP;
  const [editing, setEditing] = useState(false);

  const update = (patch: Partial<HypothesisContent>) => onChange({ ...data, ...patch });
  const updateVars = (patch: Partial<HypothesisContent["variables"]>) =>
    update({ variables: { ...data.variables, ...patch } });

  const updateControlled = (i: number, v: string) => {
    const next = [...data.variables.controlled];
    next[i] = v;
    updateVars({ controlled: next });
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[#0891b2]/30 bg-[#0891b2]/5">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0891b2]/10 border-b border-[#0891b2]/20">
        <TrendingUp className="w-3.5 h-3.5 text-[#0891b2]" />
        <span className="text-[#0891b2]" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
          📐 GIẢ THUYẾT
        </span>
        {!readonly && (
          <button onClick={() => setEditing(!editing)}
            className="ml-auto px-2 py-0.5 bg-card border border-[#0891b2]/30 text-[#0891b2] rounded hover:bg-[#0891b2]/10"
            style={{ fontSize: "10.5px", fontWeight: 600 }}>
            {editing ? <><Save className="w-3 h-3 inline mr-0.5" /> Xong</> : <><Edit2 className="w-3 h-3 inline mr-0.5" /> Sửa</>}
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* If-Then box */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-stretch">
          <div className="border border-[#0891b2]/30 rounded-lg p-2 bg-card">
            <p className="text-[#0891b2] mb-0.5" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em" }}>NẾU</p>
            {editing ? (
              <textarea value={data.ifClause} onChange={(e) => update({ ifClause: e.target.value })}
                rows={2} className="w-full bg-transparent outline-none resize-none"
                style={{ fontSize: "11.5px", lineHeight: 1.45 }} />
            ) : (
              <p style={{ fontSize: "11.5px", lineHeight: 1.45 }}>{data.ifClause}</p>
            )}
          </div>
          <div className="flex items-center justify-center text-[#0891b2]" style={{ fontSize: "20px", fontWeight: 700 }}>
            →
          </div>
          <div className="border border-[#16a34a]/30 rounded-lg p-2 bg-card">
            <p className="text-[#16a34a] mb-0.5" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em" }}>THÌ</p>
            {editing ? (
              <textarea value={data.thenClause} onChange={(e) => update({ thenClause: e.target.value })}
                rows={2} className="w-full bg-transparent outline-none resize-none"
                style={{ fontSize: "11.5px", lineHeight: 1.45 }} />
            ) : (
              <p style={{ fontSize: "11.5px", lineHeight: 1.45 }}>{data.thenClause}</p>
            )}
          </div>
        </div>

        {/* Reasoning */}
        <div>
          <p className="text-muted-foreground mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>💡 LẬP LUẬN</p>
          {editing ? (
            <textarea value={data.reasoning} onChange={(e) => update({ reasoning: e.target.value })}
              rows={2} className="w-full px-2 py-1.5 bg-card border border-border rounded outline-none resize-none"
              style={{ fontSize: "11.5px", lineHeight: 1.45 }} />
          ) : (
            <p style={{ fontSize: "11.5px", lineHeight: 1.45, fontStyle: "italic" }}>{data.reasoning}</p>
          )}
        </div>

        {/* Variables */}
        <div className="border-t border-border pt-2">
          <p className="text-muted-foreground mb-1.5" style={{ fontSize: "10px", fontWeight: 600 }}>🔬 BIẾN NGHIÊN CỨU</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="text-[#7c3aed]" style={{ fontSize: "10px", fontWeight: 700 }}>Biến độc lập:</span>
              {editing ? (
                <input value={data.variables.independent} onChange={(e) => updateVars({ independent: e.target.value })}
                  className="w-full mt-0.5 px-1.5 py-1 bg-card border border-border rounded outline-none"
                  style={{ fontSize: "11px" }} />
              ) : (
                <span className="ml-1" style={{ fontSize: "11px" }}>{data.variables.independent}</span>
              )}
            </div>
            <div>
              <span className="text-[#dc2626]" style={{ fontSize: "10px", fontWeight: 700 }}>Biến phụ thuộc:</span>
              {editing ? (
                <input value={data.variables.dependent} onChange={(e) => updateVars({ dependent: e.target.value })}
                  className="w-full mt-0.5 px-1.5 py-1 bg-card border border-border rounded outline-none"
                  style={{ fontSize: "11px" }} />
              ) : (
                <span className="ml-1" style={{ fontSize: "11px" }}>{data.variables.dependent}</span>
              )}
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-[#64748b]" style={{ fontSize: "10px", fontWeight: 700 }}>Biến kiểm soát:</span>
            <ul className="ml-2 mt-0.5 space-y-0.5">
              {data.variables.controlled.map((c, i) => (
                <li key={i} className="flex items-center gap-1" style={{ fontSize: "11px" }}>
                  <span className="text-muted-foreground">•</span>
                  {editing ? (
                    <>
                      <input value={c} onChange={(e) => updateControlled(i, e.target.value)}
                        className="flex-1 px-1.5 py-0.5 bg-card border border-border rounded outline-none"
                        style={{ fontSize: "11px" }} />
                      <button onClick={() => updateVars({ controlled: data.variables.controlled.filter((_, idx) => idx !== i) })}
                        className="text-muted-foreground hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : <span>{c}</span>}
                </li>
              ))}
              {editing && (
                <li>
                  <button onClick={() => updateVars({ controlled: [...data.variables.controlled, "Yếu tố mới"] })}
                    className="text-muted-foreground hover:text-foreground" style={{ fontSize: "10.5px" }}>
                    <Plus className="w-3 h-3 inline mr-0.5" /> Thêm
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  S6.4 — DataTableBlock (đầy đủ — editable rows/cols + caption)    */
/* ================================================================ */
export interface DataTableColumn {
  id: string;
  name: string;
  unit?: string;
}

export interface DataTableContent {
  columns: DataTableColumn[];
  rows: Record<string, string | number>[];
  caption: string;
}

const DEFAULT_DATA_TABLE: DataTableContent = {
  columns: [
    { id: "c1", name: "Lần đo", unit: "" },
    { id: "c2", name: "Giá trị A", unit: "cm" },
    { id: "c3", name: "Giá trị B", unit: "cm" },
  ],
  rows: [
    { c1: 1, c2: 12.5, c3: 14.2 },
    { c1: 2, c2: 12.8, c3: 14.5 },
    { c1: 3, c2: 12.3, c3: 14.0 },
  ],
  caption: "Bảng 1: Số liệu thu thập...",
};

export function DataTableBlockFull({ content, onChange, readonly }: EditableBlockProps<DataTableContent | string>) {
  const data: DataTableContent = typeof content === "object" && content && "columns" in content
    ? content as DataTableContent
    : DEFAULT_DATA_TABLE;

  const update = (patch: Partial<DataTableContent>) => onChange({ ...data, ...patch });

  const updateColumn = (i: number, patch: Partial<DataTableColumn>) => {
    const next = [...data.columns];
    next[i] = { ...next[i], ...patch };
    update({ columns: next });
  };

  const addColumn = () => {
    const id = `c${Date.now()}`;
    update({
      columns: [...data.columns, { id, name: "Cột mới", unit: "" }],
      rows: data.rows.map((r) => ({ ...r, [id]: "" })),
    });
  };

  const removeColumn = (i: number) => {
    if (data.columns.length <= 1) return;
    const colId = data.columns[i].id;
    update({
      columns: data.columns.filter((_, idx) => idx !== i),
      rows: data.rows.map((r) => {
        const next = { ...r };
        delete next[colId];
        return next;
      }),
    });
  };

  const updateCell = (rowI: number, colId: string, value: string) => {
    const next = [...data.rows];
    const num = Number(value);
    next[rowI] = { ...next[rowI], [colId]: isNaN(num) || value === "" ? value : num };
    update({ rows: next });
  };

  const addRow = () => {
    const newRow: Record<string, string | number> = {};
    data.columns.forEach((c) => { newRow[c.id] = ""; });
    update({ rows: [...data.rows, newRow] });
  };

  const removeRow = (i: number) => update({ rows: data.rows.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-lg overflow-hidden border border-[#c8a84e]/30 bg-card">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#c8a84e]/15 border-b border-[#c8a84e]/30">
        <TableIcon className="w-3.5 h-3.5 text-[#c8a84e]" />
        <span className="text-[#c8a84e]" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
          📊 BẢNG DỮ LIỆU
        </span>
        <span className="text-muted-foreground ml-auto" style={{ fontSize: "10px" }}>
          {data.rows.length} dòng × {data.columns.length} cột
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: "11px" }}>
          <thead className="bg-secondary text-muted-foreground" style={{ fontSize: "10px", fontWeight: 700 }}>
            <tr>
              {data.columns.map((col, ci) => (
                <th key={col.id} className="px-1.5 py-1 text-left border-r border-border last:border-r-0">
                  {readonly ? (
                    <span>{col.name}{col.unit ? ` (${col.unit})` : ""}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input value={col.name} onChange={(e) => updateColumn(ci, { name: e.target.value })}
                        className="flex-1 min-w-0 px-1 py-0.5 bg-card border border-transparent hover:border-border rounded outline-none"
                        style={{ fontSize: "10.5px", fontWeight: 600 }} />
                      <input value={col.unit ?? ""} onChange={(e) => updateColumn(ci, { unit: e.target.value })}
                        placeholder="đơn vị"
                        className="w-12 px-1 py-0.5 bg-card border border-transparent hover:border-border rounded outline-none text-muted-foreground"
                        style={{ fontSize: "9.5px" }} />
                      {data.columns.length > 1 && (
                        <button onClick={() => removeColumn(ci)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </th>
              ))}
              {!readonly && (
                <th className="px-1 py-1 w-8">
                  <button onClick={addColumn} className="text-muted-foreground hover:text-foreground" title="Thêm cột">
                    <Plus className="w-3 h-3" />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-secondary/30">
                {data.columns.map((col) => (
                  <td key={col.id} className="px-1 py-0.5 border-r border-border last:border-r-0">
                    {readonly ? (
                      <span style={{ fontSize: "11px" }}>{row[col.id] ?? ""}</span>
                    ) : (
                      <input value={String(row[col.id] ?? "")} onChange={(e) => updateCell(ri, col.id, e.target.value)}
                        className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-border focus:border-border rounded outline-none"
                        style={{ fontSize: "11px" }} />
                    )}
                  </td>
                ))}
                {!readonly && (
                  <td className="px-1 py-0.5 text-center">
                    <button onClick={() => removeRow(ri)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readonly && (
        <button onClick={addRow}
          className="w-full py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground border-t border-border"
          style={{ fontSize: "10.5px" }}>
          <Plus className="w-3 h-3 inline mr-0.5" /> Thêm dòng
        </button>
      )}

      {/* Caption */}
      <div className="px-3 py-2 border-t border-border bg-secondary/20">
        {readonly ? (
          <p className="text-muted-foreground italic" style={{ fontSize: "11px" }}>{data.caption}</p>
        ) : (
          <input value={data.caption} onChange={(e) => update({ caption: e.target.value })}
            placeholder="Caption bảng (VD: 'Bảng 1: ...')"
            className="w-full bg-transparent outline-none text-muted-foreground italic"
            style={{ fontSize: "11px" }} />
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  S6.5 — ChartBlock (đầy đủ — recharts từ data-table)              */
/* ================================================================ */
export type ChartType = "line" | "bar" | "scatter";

export interface ChartContent {
  chartType: ChartType;
  /** Inline data — đơn giản hơn link đến data-table block */
  data: Array<Record<string, number | string>>;
  xAxisKey: string;
  yAxisKeys: string[];
  title: string;
}

const CHART_COLORS = ["#990803", "#0891b2", "#16a34a", "#c8a84e", "#7c3aed", "#dc2626"];

const DEFAULT_CHART: ChartContent = {
  chartType: "line",
  data: [
    { x: "Tuần 1", y1: 12, y2: 8 },
    { x: "Tuần 2", y1: 18, y2: 12 },
    { x: "Tuần 3", y1: 24, y2: 17 },
    { x: "Tuần 4", y1: 31, y2: 22 },
    { x: "Tuần 5", y1: 38, y2: 28 },
  ],
  xAxisKey: "x",
  yAxisKeys: ["y1", "y2"],
  title: "Biểu đồ kết quả thí nghiệm",
};

export function ChartBlockFull({ content, onChange, readonly }: EditableBlockProps<ChartContent | string>) {
  const data: ChartContent = typeof content === "object" && content && "chartType" in content
    ? content as ChartContent
    : DEFAULT_CHART;
  const [editing, setEditing] = useState(false);

  const update = (patch: Partial<ChartContent>) => onChange({ ...data, ...patch });

  const renderChart = () => {
    const commonProps = { data: data.data, margin: { top: 5, right: 10, left: 0, bottom: 5 } };
    switch (data.chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {data.yAxisKeys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {data.yAxisKeys.map((k, i) => (
              <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {data.yAxisKeys.map((k, i) => (
              <Scatter key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </ScatterChart>
        );
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[#ea580c]/30 bg-card">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ea580c]/15 border-b border-[#ea580c]/30">
        <BarChart3 className="w-3.5 h-3.5 text-[#ea580c]" />
        <span className="text-[#ea580c]" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
          📈 BIỂU ĐỒ
        </span>
        {!readonly && (
          <button onClick={() => setEditing(!editing)}
            className="ml-auto px-2 py-0.5 bg-card border border-[#ea580c]/30 text-[#ea580c] rounded hover:bg-[#ea580c]/10"
            style={{ fontSize: "10.5px", fontWeight: 600 }}>
            {editing ? <><Save className="w-3 h-3 inline mr-0.5" /> Xong</> : <><Edit2 className="w-3 h-3 inline mr-0.5" /> Cấu hình</>}
          </button>
        )}
      </div>

      {editing && !readonly && (
        <div className="p-2.5 border-b border-border bg-secondary/30 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 600 }}>Loại biểu đồ:</span>
            {(["line", "bar", "scatter"] as ChartType[]).map((t) => (
              <button key={t} onClick={() => update({ chartType: t })}
                className={`px-2 py-1 rounded border ${data.chartType === t ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-card border-border hover:bg-secondary"}`}
                style={{ fontSize: "10.5px", fontWeight: 500 }}>
                {t === "line" ? "📈 Đường" : t === "bar" ? "📊 Cột" : "⚬ Phân tán"}
              </button>
            ))}
          </div>
          <input value={data.title} onChange={(e) => update({ title: e.target.value })}
            placeholder="Tiêu đề biểu đồ..."
            className="w-full px-2 py-1 bg-card border border-border rounded outline-none"
            style={{ fontSize: "11px" }} />
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
            💡 Để chỉnh sửa dữ liệu, dùng block "📊 BẢNG DỮ LIỆU" — dữ liệu mock đang dùng.
          </p>
        </div>
      )}

      <div className="p-3">
        {data.title && (
          <p className="text-center mb-1.5" style={{ fontSize: "11.5px", fontWeight: 600 }}>{data.title}</p>
        )}
        <ResponsiveContainer width="100%" height={240}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  S6.6 — CitationBlock (đầy đủ — APA/MLA format)                   */
/* ================================================================ */
export type CitationFormat = "APA" | "MLA";

export interface CitationEntry {
  authors: string;
  year: number;
  title: string;
  source: string;
  url?: string;
}

export interface CitationContent {
  format: CitationFormat;
  citations: CitationEntry[];
}

const DEFAULT_CITATION: CitationContent = {
  format: "APA",
  citations: [
    {
      authors: "Nguyễn Văn A, Trần Thị B",
      year: 2024,
      title: "Nghiên cứu khả năng lọc nước của thực vật bản địa Việt Nam",
      source: "Tạp chí Khoa học Nông nghiệp, 45(3), 12-25",
    },
  ],
};

function formatCitation(c: CitationEntry, format: CitationFormat): string {
  if (format === "APA") {
    // Authors (Year). Title. Source.
    return `${c.authors} (${c.year}). ${c.title}. ${c.source}.`;
  }
  // MLA: Authors. "Title." Source, Year.
  return `${c.authors}. "${c.title}." ${c.source}, ${c.year}.`;
}

export function CitationBlockFull({ content, onChange, readonly }: EditableBlockProps<CitationContent | string>) {
  const data: CitationContent = typeof content === "object" && content && "format" in content
    ? content as CitationContent
    : typeof content === "string" && content
      ? { format: "APA", citations: [{ authors: "Tác giả", year: new Date().getFullYear(), title: content, source: "Nguồn" }] }
      : DEFAULT_CITATION;

  const update = (patch: Partial<CitationContent>) => onChange({ ...data, ...patch });
  const updateCitation = (i: number, patch: Partial<CitationEntry>) => {
    const next = [...data.citations];
    next[i] = { ...next[i], ...patch };
    update({ citations: next });
  };

  const addCitation = () => update({
    citations: [...data.citations, {
      authors: "Tên tác giả",
      year: new Date().getFullYear(),
      title: "Tiêu đề bài báo/sách",
      source: "Nguồn (tạp chí, NXB...)",
    }],
  });

  const removeCitation = (i: number) => update({ citations: data.citations.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 border-b border-border">
        <Quote className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
          📚 TRÍCH DẪN ({data.citations.length})
        </span>
        {!readonly && (
          <select value={data.format} onChange={(e) => update({ format: e.target.value as CitationFormat })}
            className="ml-auto px-1.5 py-0.5 bg-card border border-border rounded" style={{ fontSize: "10px" }}>
            <option value="APA">APA</option>
            <option value="MLA">MLA</option>
          </select>
        )}
      </div>

      <ol className="px-3 py-2 space-y-2 list-decimal list-inside">
        {data.citations.map((c, i) => (
          <li key={i} className="border-l-2 border-muted pl-2.5" style={{ fontSize: "11.5px", lineHeight: 1.55 }}>
            {readonly ? (
              <>
                <span>{formatCitation(c, data.format)}</span>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer"
                    className="ml-1 text-[#0891b2] hover:underline">
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_60px] gap-1.5 mt-1">
                <input value={c.authors} onChange={(e) => updateCitation(i, { authors: e.target.value })}
                  placeholder="Tác giả (VD: Nguyễn Văn A, Trần Thị B)"
                  className="px-1.5 py-0.5 bg-secondary/30 border border-border rounded outline-none"
                  style={{ fontSize: "11px" }} />
                <input type="number" value={c.year} onChange={(e) => updateCitation(i, { year: Number(e.target.value) || 2024 })}
                  className="px-1.5 py-0.5 bg-secondary/30 border border-border rounded outline-none text-center"
                  style={{ fontSize: "11px" }} />
                <input value={c.title} onChange={(e) => updateCitation(i, { title: e.target.value })}
                  placeholder="Tiêu đề bài báo / sách"
                  className="col-span-2 px-1.5 py-0.5 bg-secondary/30 border border-border rounded outline-none"
                  style={{ fontSize: "11px", fontStyle: "italic" }} />
                <input value={c.source} onChange={(e) => updateCitation(i, { source: e.target.value })}
                  placeholder="Nguồn (tạp chí, NXB, URL)"
                  className="col-span-2 px-1.5 py-0.5 bg-secondary/30 border border-border rounded outline-none"
                  style={{ fontSize: "11px" }} />
                <input value={c.url ?? ""} onChange={(e) => updateCitation(i, { url: e.target.value })}
                  placeholder="URL (tuỳ chọn)"
                  className="px-1.5 py-0.5 bg-secondary/30 border border-border rounded outline-none"
                  style={{ fontSize: "10.5px" }} />
                <button onClick={() => removeCitation(i)}
                  className="px-1.5 py-0.5 text-muted-foreground hover:text-destructive border border-border rounded"
                  style={{ fontSize: "10.5px" }}>
                  <X className="w-3 h-3 inline" />
                </button>
                <p className="col-span-2 text-muted-foreground italic" style={{ fontSize: "10.5px" }}>
                  Preview: {formatCitation({ ...c, authors: c.authors || "?", title: c.title || "?", source: c.source || "?" }, data.format)}
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>

      {!readonly && (
        <button onClick={addCitation}
          className="w-full py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground border-t border-border"
          style={{ fontSize: "10.5px" }}>
          <Plus className="w-3 h-3 inline mr-0.5" /> Thêm trích dẫn
        </button>
      )}
    </div>
  );
}
