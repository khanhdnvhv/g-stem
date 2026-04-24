import { useState } from "react";
import {
  Plus, Copy, Trash2, Eye, Star,
  X, Save,
} from "lucide-react";
import { useConfirm } from "../ConfirmDialog";
import { MOCK_RUBRICS, type Rubric, type RubricCriteria } from "./mock-data";

interface RubricManagerProps {
  isAdmin: boolean;
}

export function RubricManager({ isAdmin }: RubricManagerProps) {
  const [rubrics, setRubrics] = useState<Rubric[]>(MOCK_RUBRICS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const confirm = useConfirm();

  // Create form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCriteria, setNewCriteria] = useState<RubricCriteria[]>([
    {
      id: "new_1", name: "", description: "", maxScore: 25, weight: 25,
      levels: [
        { label: "Xuất sắc", description: "", minScore: 21, maxScore: 25 },
        { label: "Tốt", description: "", minScore: 16, maxScore: 20 },
        { label: "Đạt", description: "", minScore: 10, maxScore: 15 },
        { label: "Chưa đạt", description: "", minScore: 0, maxScore: 9 },
      ],
    },
  ]);

  const handleClone = (rubric: Rubric) => {
    const cloned: Rubric = {
      ...rubric,
      id: `RB${String(rubrics.length + 1).padStart(3, "0")}`,
      name: rubric.name + " (Bản sao)",
      createdAt: "2026-03-12",
      usageCount: 0,
    };
    setRubrics(prev => [...prev, cloned]);
  };

  const handleDelete = async (id: string) => {
    const rubric = rubrics.find(r => r.id === id);
    const ok = await confirm({
      title: "Xóa rubric?",
      message: `Bạn có chắc muốn xóa rubric "${rubric?.name || ""}"? Các bài chấm đã dùng rubric này sẽ không bị ảnh hưởng.`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setRubrics(prev => prev.filter(r => r.id !== id));
      import("sonner").then(m => m.toast.success("Đã xóa rubric"));
    }
  };

  const addCriteria = () => {
    setNewCriteria(prev => [
      ...prev,
      {
        id: `new_${prev.length + 1}`, name: "", description: "", maxScore: 25, weight: 25,
        levels: [
          { label: "Xuất sắc", description: "", minScore: 21, maxScore: 25 },
          { label: "Tốt", description: "", minScore: 16, maxScore: 20 },
          { label: "Đạt", description: "", minScore: 10, maxScore: 15 },
          { label: "Chưa đạt", description: "", minScore: 0, maxScore: 9 },
        ],
      },
    ]);
  };

  const totalWeight = newCriteria.reduce((s, c) => s + c.weight, 0);

  const previewRubric = rubrics.find(r => r.id === previewId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500" style={{ fontSize: "13px" }}>
            {rubrics.length} rubric templates • {isAdmin ? "Xem tất cả giảng viên" : "Rubric của bạn"}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors cursor-pointer flex items-center gap-1.5"
            style={{ fontSize: "12.5px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" /> Tạo Rubric mới
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-[#990803]/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-800" style={{ fontSize: "15px", fontWeight: 600 }}>Tạo Rubric mới</h3>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Tên Rubric</label>
              <input
                type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="VD: Rubric Phân tích Marketing"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "13px" }}
              />
            </div>
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
              <input
                type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
                placeholder="Mô tả ngắn..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Criteria builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 600 }}>
                Tiêu chí ({newCriteria.length})
              </span>
              <span className={`${totalWeight === 100 ? "text-green-600" : "text-red-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>
                Tổng weight: {totalWeight}% {totalWeight === 100 ? "✓" : "(cần = 100%)"}
              </span>
            </div>
            {newCriteria.map((c, i) => (
              <div key={c.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => {
                      const updated = [...newCriteria];
                      updated[i] = { ...c, name: e.target.value };
                      setNewCriteria(updated);
                    }}
                    placeholder="Tên tiêu chí"
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
                    style={{ fontSize: "12px" }}
                  />
                  <input
                    type="number"
                    value={c.maxScore}
                    onChange={e => {
                      const updated = [...newCriteria];
                      updated[i] = { ...c, maxScore: parseInt(e.target.value) || 0 };
                      setNewCriteria(updated);
                    }}
                    className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-center"
                    style={{ fontSize: "12px" }}
                    placeholder="Max"
                  />
                  <input
                    type="number"
                    value={c.weight}
                    onChange={e => {
                      const updated = [...newCriteria];
                      updated[i] = { ...c, weight: parseInt(e.target.value) || 0 };
                      setNewCriteria(updated);
                    }}
                    className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-center"
                    style={{ fontSize: "12px" }}
                    placeholder="%"
                  />
                  {newCriteria.length > 1 && (
                    <button
                      onClick={() => setNewCriteria(prev => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={addCriteria}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-[#990803] hover:border-[#990803] transition-colors cursor-pointer"
              style={{ fontSize: "12px" }}
            >
              + Thêm tiêu chí
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer"
              style={{ fontSize: "12.5px" }}
            >
              Hủy
            </button>
            <button
              onClick={() => {
                if (newName) {
                  const newRubric: Rubric = {
                    id: `RB${String(rubrics.length + 1).padStart(3, "0")}`,
                    name: newName, description: newDesc, courseId: "", courseName: "Chưa gán",
                    totalMaxScore: newCriteria.reduce((s, c) => s + c.maxScore, 0),
                    criteria: newCriteria, createdBy: "Bạn", createdAt: "2026-03-12",
                    usageCount: 0, isShared: false,
                  };
                  setRubrics(prev => [...prev, newRubric]);
                  setShowCreate(false);
                  setNewName(""); setNewDesc("");
                }
              }}
              className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1"
              style={{ fontSize: "12.5px", fontWeight: 500 }}
            >
              <Save className="w-4 h-4" /> Lưu Rubric
            </button>
          </div>
        </div>
      )}

      {/* Rubric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {rubrics.map(rubric => (
          <div
            key={rubric.id}
            className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-800 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {rubric.name}
                  </h3>
                  <p className="text-gray-400 truncate mt-0.5" style={{ fontSize: "11px" }}>
                    {rubric.courseName}
                  </p>
                </div>
                {rubric.isShared && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 shrink-0" style={{ fontSize: "9px", fontWeight: 600 }}>
                    Chia sẻ
                  </span>
                )}
              </div>

              <p className="text-gray-500 mb-3 line-clamp-2" style={{ fontSize: "11.5px" }}>
                {rubric.description}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-gray-700" style={{ fontSize: "14px", fontWeight: 700 }}>{rubric.criteria.length}</p>
                  <p className="text-gray-400" style={{ fontSize: "9.5px" }}>Tiêu chí</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-gray-700" style={{ fontSize: "14px", fontWeight: 700 }}>{rubric.totalMaxScore}</p>
                  <p className="text-gray-400" style={{ fontSize: "9.5px" }}>Max điểm</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-gray-700" style={{ fontSize: "14px", fontWeight: 700 }}>{rubric.usageCount}</p>
                  <p className="text-gray-400" style={{ fontSize: "9.5px" }}>Đã dùng</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-gray-400" style={{ fontSize: "10.5px" }}>
                <span>{rubric.createdBy}</span>
                <span>{rubric.createdAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-1">
              <button
                onClick={() => setPreviewId(previewId === rubric.id ? null : rubric.id)}
                className="flex-1 py-1.5 text-[#990803] hover:bg-[#990803]/5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                style={{ fontSize: "11.5px", fontWeight: 500 }}
              >
                <Eye className="w-3.5 h-3.5" /> Xem
              </button>
              {!isAdmin && (
                <>
                  <button
                    onClick={() => handleClone(rubric)}
                    className="flex-1 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    style={{ fontSize: "11.5px", fontWeight: 500 }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Sao
                  </button>
                  <button
                    onClick={() => handleDelete(rubric.id)}
                    className="py-1.5 px-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Preview */}
            {previewId === rubric.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50/50">
                <table className="w-full" style={{ fontSize: "10.5px" }}>
                  <thead>
                    <tr className="text-gray-500">
                      <th className="text-left pb-2 pr-2" style={{ fontWeight: 600 }}>Tiêu chí</th>
                      <th className="text-center pb-2 px-1" style={{ fontWeight: 600, color: "#16a34a" }}>Xuất sắc</th>
                      <th className="text-center pb-2 px-1" style={{ fontWeight: 600, color: "#3b82f6" }}>Tốt</th>
                      <th className="text-center pb-2 px-1" style={{ fontWeight: 600, color: "#eab308" }}>Đạt</th>
                      <th className="text-center pb-2 px-1" style={{ fontWeight: 600, color: "#dc2626" }}>Chưa đạt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rubric.criteria.map(c => (
                      <tr key={c.id} className="border-t border-gray-200">
                        <td className="py-2 pr-2">
                          <p style={{ fontWeight: 600 }}>{c.name}</p>
                          <p className="text-gray-400">{c.weight}% • Max {c.maxScore}</p>
                        </td>
                        {c.levels.map(l => (
                          <td key={l.label} className="py-2 px-1 text-center text-gray-500">
                            {l.minScore}-{l.maxScore}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}