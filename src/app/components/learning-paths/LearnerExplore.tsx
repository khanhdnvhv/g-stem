import { useState } from "react";
import {
  Search, BookOpen, Clock, Users, Star, Route, ChevronRight,
  Filter, Award, Target, Lock, CheckCircle2, ArrowRight, PlayCircle, Bookmark,
} from "lucide-react";
import { mockPathsFull, mockEnrollments } from "./mock-data";
import { mockCourses } from "../mock-data";
import type { LearningPathFull } from "./types";

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  "Cơ bản": { color: "#2e86de", bg: "#2e86de15" },
  "Trung cấp": { color: "#f59e0b", bg: "#f59e0b15" },
  "Nâng cao": { color: "#e74c3c", bg: "#e74c3c15" },
  "Chuyên gia": { color: "#8b5cf6", bg: "#8b5cf615" },
};

export function LearnerExplore() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [detailPath, setDetailPath] = useState<LearningPathFull | null>(null);
  const [enrolledExtra, setEnrolledExtra] = useState<Set<string>>(new Set());

  // Learner U003's enrolled paths
  const basePathIds = new Set(mockEnrollments.filter(e => e.userId === "U003").map(e => e.pathId));
  const myPathIds = new Set([...basePathIds, ...enrolledExtra]);
  const categories = [...new Set(mockPathsFull.map(p => p.category))];

  const activePaths = mockPathsFull.filter(p => p.status === "active");
  const filtered = activePaths.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchLevel = levelFilter === "all" || p.level === levelFilter;
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchLevel && matchCat;
  });

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Tìm lộ trình theo tên, mô tả, danh mục..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              style={{ fontSize: "13px" }} />
          </div>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
            <option value="all">Tất cả cấp độ</option>
            {Object.keys(LEVEL_COLORS).map(lv => <option key={lv} value={lv}>{lv}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
            <option value="all">Tất cả danh mục</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
        <span className="text-foreground" style={{ fontWeight: 600 }}>{filtered.length}</span> lộ trình khả dụng
      </p>

      {/* Detail Modal */}
      {detailPath && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailPath(null)}>
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#990803] to-[#b82020] p-6 rounded-t-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded text-white" style={{ fontSize: "11px", fontWeight: 600, background: LEVEL_COLORS[detailPath.level]?.color }}>
                  {detailPath.level}
                </span>
                {detailPath.mandatory && (
                  <span className="px-2.5 py-0.5 rounded bg-[#c8a84e] text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>Bắt buộc</span>
                )}
                {detailPath.certificateOnCompletion && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/20 text-white" style={{ fontSize: "11px" }}>
                    <Award className="w-3 h-3" /> Chứng chỉ
                  </span>
                )}
              </div>
              <h2 className="text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{detailPath.title}</h2>
              <p className="text-white/70 mt-2" style={{ fontSize: "13px" }}>{detailPath.description}</p>
              <div className="flex items-center gap-5 mt-4">
                <span className="flex items-center gap-1 text-white/80" style={{ fontSize: "12px" }}>
                  <BookOpen className="w-3.5 h-3.5" /> {detailPath.totalCourses} khóa
                </span>
                <span className="flex items-center gap-1 text-white/80" style={{ fontSize: "12px" }}>
                  <Clock className="w-3.5 h-3.5" /> {detailPath.totalDuration}
                </span>
                <span className="flex items-center gap-1 text-white/80" style={{ fontSize: "12px" }}>
                  <Users className="w-3.5 h-3.5" /> {detailPath.enrolledCount} người
                </span>
                <span className="flex items-center gap-1 text-white/80" style={{ fontSize: "12px" }}>
                  <Star className="w-3.5 h-3.5 fill-[#c8a84e] text-[#c8a84e]" /> {detailPath.avgRating}
                </span>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Milestones */}
              <div>
                <h4 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Cấu trúc Lộ trình</h4>
                <div className="space-y-0">
                  {detailPath.milestones.map((m, idx) => {
                    const mCourses = m.courseIds.map(id => mockCourses.find(c => c.id === id)).filter(Boolean);
                    return (
                      <div key={m.id} className="relative">
                        {idx < detailPath.milestones.length - 1 && (
                          <div className="absolute left-[15px] top-[36px] bottom-0 w-0.5 bg-[#990803]/20" />
                        )}
                        <div className="flex items-start gap-3 pb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] text-white flex items-center justify-center shrink-0 z-10"
                            style={{ fontSize: "12px", fontWeight: 700 }}>{idx + 1}</div>
                          <div className="flex-1">
                            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 500 }}>{m.title}</p>
                            {m.description && <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{m.description}</p>}
                            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>Yêu cầu hoàn thành: {m.requiredCompletionRate}%</p>
                            {mCourses.length > 0 && (
                              <div className="mt-2 space-y-1.5">
                                {mCourses.map(course => course && (
                                  <div key={course.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                                    <img src={course.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                                    <div>
                                      <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{course.title}</p>
                                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{course.duration} • {course.totalLessons} bài</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đơn vị</p>
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{detailPath.subsidiary}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Phòng ban</p>
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{detailPath.department}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Thời gian</p>
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{detailPath.estimatedWeeks} tuần</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Tỷ lệ hoàn thành</p>
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{detailPath.completionRate}%</p>
                </div>
              </div>

              {/* Prerequisites */}
              {detailPath.prerequisites.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-800" style={{ fontSize: "12px", fontWeight: 500 }}>Yêu cầu tiên quyết</span>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {detailPath.prerequisites.map(pid => {
                      const pp = mockPathsFull.find(p => p.id === pid);
                      const isCompleted = mockEnrollments.some(e => e.userId === "U003" && e.pathId === pid && e.status === "completed");
                      return pp ? (
                        <div key={pid} className="flex items-center gap-2">
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Lock className="w-3.5 h-3.5 text-yellow-600" />}
                          <span className={isCompleted ? "text-green-700" : "text-yellow-700"} style={{ fontSize: "12px" }}>{pp.title}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="p-5 border-t border-border flex gap-2">
              <button onClick={() => setDetailPath(null)}
                className="flex-1 px-4 py-2.5 bg-secondary text-foreground rounded-lg cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>Đóng</button>
              <button onClick={() => {
                if (!myPathIds.has(detailPath.id)) {
                  setEnrolledExtra(prev => new Set(prev).add(detailPath.id));
                }
                import("sonner").then(m => m.toast.success(myPathIds.has(detailPath.id) ? "Đang mở trang học tập..." : "Đã đăng ký lộ trình thành công!"));
                setDetailPath(null);
              }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                {myPathIds.has(detailPath.id) ? (
                  <><PlayCircle className="w-4 h-4" /> Tiếp tục học</>
                ) : (
                  <><Route className="w-4 h-4" /> Đăng ký Lộ trình</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Path Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(path => {
          const isEnrolled = myPathIds.has(path.id);
          const enrollment = mockEnrollments.find(e => e.userId === "U003" && e.pathId === path.id);
          const lvl = LEVEL_COLORS[path.level] || { color: "#6b7280", bg: "#6b728015" };
          const pathCourses = path.courseIds.map(id => mockCourses.find(c => c.id === id)).filter(Boolean);
          const isExpanded = expandedPath === path.id;
          const isBm = bookmarked.has(path.id);

          return (
            <div key={path.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all">
              <div className="bg-gradient-to-r from-[#990803] to-[#b82020] p-4 relative">
                {/* Bookmark */}
                <button onClick={() => toggleBookmark(path.id)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                  <Bookmark className={`w-4 h-4 ${isBm ? "fill-[#c8a84e] text-[#c8a84e]" : "text-white/50"}`} />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-white" style={{ fontSize: "10px", fontWeight: 600, background: lvl.color }}>
                    {path.level}
                  </span>
                  {path.mandatory && (
                    <span className="px-2 py-0.5 rounded bg-[#c8a84e] text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>Bắt buộc</span>
                  )}
                  {isEnrolled && (
                    <span className="px-2 py-0.5 rounded bg-white/20 text-white" style={{ fontSize: "10px", fontWeight: 500 }}>
                      {enrollment?.status === "completed" ? "✓ Hoàn thành" : `${enrollment?.progress || 0}% tiến độ`}
                    </span>
                  )}
                </div>
                <h3 className="text-white" style={{ fontSize: "15px", fontWeight: 600 }}>{path.title}</h3>
                <p className="text-white/50 mt-0.5 line-clamp-1" style={{ fontSize: "11px" }}>{path.category}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-white/70" style={{ fontSize: "11px" }}>
                    <BookOpen className="w-3 h-3" /> {path.totalCourses} khóa
                  </span>
                  <span className="flex items-center gap-1 text-white/70" style={{ fontSize: "11px" }}>
                    <Clock className="w-3 h-3" /> {path.totalDuration}
                  </span>
                  <span className="flex items-center gap-1 text-white/70" style={{ fontSize: "11px" }}>
                    <Users className="w-3 h-3" /> {path.enrolledCount}
                  </span>
                  {path.avgRating > 0 && (
                    <span className="flex items-center gap-1 text-[#c8a84e]" style={{ fontSize: "11px" }}>
                      <Star className="w-3 h-3 fill-[#c8a84e]" /> {path.avgRating}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <p className="text-muted-foreground line-clamp-2 mb-3" style={{ fontSize: "12px" }}>{path.description}</p>

                {/* Milestones summary */}
                <div className="flex items-center gap-1 mb-3">
                  {path.milestones.map((m, i) => (
                    <div key={m.id} className="flex items-center flex-1">
                      <div className="w-6 h-6 rounded-full bg-[#990803]/10 text-[#990803] flex items-center justify-center"
                        style={{ fontSize: "10px", fontWeight: 700 }}>{i + 1}</div>
                      {i < path.milestones.length - 1 && <div className="flex-1 h-px bg-border mx-0.5" />}
                    </div>
                  ))}
                  <span className="text-muted-foreground ml-1" style={{ fontSize: "10px" }}>{path.milestones.length} cột mốc</span>
                </div>

                {/* Course list */}
                <div className="space-y-0">
                  {pathCourses.slice(0, isExpanded ? pathCourses.length : 2).map((course, idx) => course && (
                    <div key={course.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0"
                        style={{ fontSize: "10px", fontWeight: 600 }}>{idx + 1}</div>
                      <img src={course.thumbnail} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{course.title}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{course.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {pathCourses.length > 2 && (
                  <button onClick={() => setExpandedPath(isExpanded ? null : path.id)}
                    className="w-full text-center text-muted-foreground hover:text-foreground mt-1 cursor-pointer"
                    style={{ fontSize: "11px" }}>
                    {isExpanded ? "Thu gọn" : `+${pathCourses.length - 2} khóa khác`}
                  </button>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3 mb-3">
                  {path.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10px" }}>{t}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => setDetailPath(path)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                    style={{ fontSize: "12px", fontWeight: 500 }}>
                    Chi tiết
                  </button>
                  <button onClick={() => {
                    if (!isEnrolled) {
                      setEnrolledExtra(prev => new Set(prev).add(path.id));
                    }
                    import("sonner").then(m => m.toast.success(isEnrolled ? "Đang tiếp tục học..." : "Đã đăng ký lộ trình!"));
                  }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                    style={{ fontSize: "12px", fontWeight: 500 }}>
                    {isEnrolled ? (
                      <><PlayCircle className="w-3.5 h-3.5" /> Tiếp tục</>
                    ) : (
                      <><Route className="w-3.5 h-3.5" /> Đăng ký</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Search className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="mt-3 text-foreground" style={{ fontSize: "15px", fontWeight: 500 }}>Không tìm thấy lộ trình</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
}