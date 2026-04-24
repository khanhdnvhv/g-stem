import { useState, useEffect, useMemo, useRef } from "react";
import {
  AlertTriangle, ShieldCheck, ShieldAlert, Users, Clock, Search, Bell,
  Camera, CameraOff, Monitor, WifiOff, Ban, CheckCircle2, XCircle,
  ChevronRight, RefreshCw, Brain, Sparkles, Flag, AlertCircle, Radio,
  Activity, Play, Mic, MicOff, MessageSquare, Send, Timer, ArrowLeft,
  Download, Target, Grid3X3, LayoutGrid, List,
  CheckSquare, Square as SquareIcon, Megaphone, FileWarning, Cpu,
  ScanFace, ChevronLeft, Layers, Gauge, MapPin, Eye, Maximize2,
} from "lucide-react";
import { MOCK_EXAMS } from "./types";
import type { ProctoringSession, SuspiciousEvent } from "./proctoring/types";
import {
  ALERT_CONFIGS, SEVERITY_CONFIG, STATUS_CONFIG, AI_THREAT_CONFIG,
  CONNECTION_CONFIG, ROOMS, formatTime,
} from "./proctoring/types";
import { generateMockSessions } from "./proctoring/mock-data";
import {
  RiskRing, RiskDonutChart, ActivityHeatmap, Sparkline, WebcamFeed,
  FaceMatchBadge, ConnectionBadge, BroadcastModal, IncidentReportModal,
} from "./proctoring/SubComponents";

// ── Connection Quality Summary ──
function ConnectionSummary({ sessions }: { sessions: ProctoringSession[] }) {
  const activeSessions = sessions.filter(s => s.status !== "terminated" && s.status !== "completed");
  const groups = {
    excellent: activeSessions.filter(s => s.connectionQuality === "excellent").length,
    good: activeSessions.filter(s => s.connectionQuality === "good").length,
    fair: activeSessions.filter(s => s.connectionQuality === "fair").length,
    poor: activeSessions.filter(s => s.connectionQuality === "poor").length,
  };
  const total = activeSessions.length || 1;
  const bars = [
    { key: "excellent" as const, label: "Tuyệt vời", count: groups.excellent, color: "#22c55e" },
    { key: "good" as const, label: "Tốt", count: groups.good, color: "#3b82f6" },
    { key: "fair" as const, label: "TB", count: groups.fair, color: "#f59e0b" },
    { key: "poor" as const, label: "Yếu", count: groups.poor, color: "#ef4444" },
  ];
  return (
    <div className="space-y-2">
      {bars.map(bar => (
        <div key={bar.key} className="flex items-center gap-2">
          <span className="text-gray-500 w-14 shrink-0" style={{ fontSize: "10px" }}>{bar.label}</span>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
            <div className="h-full rounded-full transition-all" style={{ width: `${(bar.count / total) * 100}%`, background: bar.color, minWidth: bar.count > 0 ? "12px" : 0 }} />
          </div>
          <span className="text-gray-600 shrink-0 w-6 text-right" style={{ fontSize: "11px", fontWeight: 700 }}>{bar.count}</span>
        </div>
      ))}
      {groups.poor > 0 && (
        <div className="flex items-center gap-1.5 mt-1 px-2 py-1.5 bg-red-50 rounded-lg">
          <WifiOff className="w-3 h-3 text-red-500" />
          <span className="text-red-600" style={{ fontSize: "10px", fontWeight: 500 }}>{groups.poor} học viên kết nối yếu - có thể ảnh hưởng bài thi</span>
        </div>
      )}
    </div>
  );
}

// ── Empty State ──
function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
      <Search className="w-12 h-12 text-gray-300 mb-3" />
      <p className="text-gray-500" style={{ fontSize: "14px", fontWeight: 600 }}>Không tìm thấy phiên thi</p>
      <p className="text-gray-400 mt-1" style={{ fontSize: "12px" }}>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
      <button onClick={onReset} className="mt-3 px-4 py-2 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer transition-colors" style={{ fontSize: "12px", fontWeight: 500 }}>Xoá bộ lọc</button>
    </div>
  );
}

const MOCK_SESSIONS = generateMockSessions();

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════
export function ProctoringDashboard() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<ProctoringSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cctv" | "grid" | "list">("cctv");
  const [cctvLayout, setCctvLayout] = useState<4 | 9 | 16>(9);
  const [showAlertLog, setShowAlertLog] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showReport, setShowReport] = useState<ProctoringSession | null>(null);
  const [message, setMessage] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailTab, setDetailTab] = useState<"overview" | "events" | "ai" | "chat" | "report">("overview");
  const [cctvPage, setCctvPage] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ text: string; from: "proctor"; time: string }[]>([]);
  const [liveEvents, setLiveEvents] = useState<(SuspiciousEvent & { studentName: string; sessionId: string })[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveEventRef = useRef<HTMLDivElement>(null);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    timerRef.current = setInterval(() => {
      setSessions(prev => prev.map(s => {
        if (s.status === "completed" || s.status === "terminated") return s;
        const newTimeSpent = s.timeSpent + 5;
        const newTimeRemaining = Math.max(0, s.timeRemaining - 5);
        const newProgress = Math.min(100, s.progress + Math.random() * 2);
        const shouldAddEvent = Math.random() < 0.06;
        const evtTypes = ["tab_switch", "face_absent", "idle", "copy_paste", "audio_anomaly"] as const;
        const newEvents = shouldAddEvent ? [...s.suspiciousEvents, {
          id: `EVT-AUTO-${Date.now()}-${Math.random()}`,
          type: evtTypes[Math.floor(Math.random() * evtTypes.length)],
          timestamp: new Date().toISOString(),
          severity: (["low", "medium", "high"] as const)[Math.floor(Math.random() * 3)],
          description: "Phát hiện tự động bởi AI",
          resolved: false,
        }] : s.suspiciousEvents;
        if (shouldAddEvent && newEvents.length > s.suspiciousEvents.length) {
          const lastEvt = newEvents[newEvents.length - 1];
          setLiveEvents(prev => [{ ...lastEvt, studentName: s.studentName, sessionId: s.id }, ...prev].slice(0, 50));
        }
        return {
          ...s, timeSpent: newTimeSpent, timeRemaining: newTimeRemaining, progress: newProgress, suspiciousEvents: newEvents,
          keyboardActivity: [...s.keyboardActivity.slice(1), Math.floor(Math.random() * 100)],
          mouseActivity: [...s.mouseActivity.slice(1), Math.floor(Math.random() * 100)],
        };
      }));
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh]);

  useEffect(() => { if (liveEventRef.current) liveEventRef.current.scrollTop = 0; }, [liveEvents]);

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      const matchSearch = s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchRisk = riskFilter === "all" ||
        (riskFilter === "high" && s.riskScore > 60) ||
        (riskFilter === "medium" && s.riskScore > 30 && s.riskScore <= 60) ||
        (riskFilter === "low" && s.riskScore <= 30);
      const matchExam = examFilter === "all" || s.examId === examFilter;
      const matchRoom = roomFilter === "all" || s.room === roomFilter;
      return matchSearch && matchStatus && matchRisk && matchExam && matchRoom;
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [sessions, searchQuery, statusFilter, riskFilter, examFilter, roomFilter]);

  const stats = useMemo(() => {
    const active = sessions.filter(s => s.status === "active" || s.status === "warning").length;
    const flagged = sessions.filter(s => s.status === "flagged").length;
    const warnings = sessions.filter(s => s.status === "warning").length;
    const totalAlerts = sessions.reduce((s, sess) => s + sess.suspiciousEvents.filter(e => !e.resolved).length, 0);
    const avgRisk = Math.round(sessions.reduce((s, sess) => s + sess.riskScore, 0) / (sessions.length || 1));
    const terminated = sessions.filter(s => s.status === "terminated").length;
    const avgFaceMatch = Math.round(sessions.reduce((s, sess) => s + sess.faceMatchConfidence, 0) / (sessions.length || 1));
    const poorConn = sessions.filter(s => s.connectionQuality === "poor").length;
    return { active, flagged, warnings, totalAlerts, avgRisk, terminated, total: sessions.length, avgFaceMatch, poorConn };
  }, [sessions]);

  const allAlerts = useMemo(() => {
    return sessions.flatMap(s =>
      s.suspiciousEvents.map(e => ({ ...e, studentName: s.studentName, sessionId: s.id, studentAvatar: s.studentAvatar }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sessions]);

  const handleTerminate = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: "terminated" as const } : s));
    if (selectedSession?.id === sessionId) setSelectedSession(null);
  };
  const handleSendWarning = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? {
      ...s, suspiciousEvents: [...s.suspiciousEvents, {
        id: `WARN-${Date.now()}`, type: "tab_switch" as const, timestamp: new Date().toISOString(),
        severity: "low" as const, description: "Cảnh báo đã gửi tới học viên", resolved: true,
      }]
    } : s));
  };
  const resetFilters = () => {
    setSearchQuery(""); setStatusFilter("all"); setRiskFilter("all"); setExamFilter("all"); setRoomFilter("all");
  };
  const [resolvedEvents, setResolvedEvents] = useState<Set<string>>(new Set());
  const resolveEvent = (evtId: string) => {
    setResolvedEvents(prev => new Set(prev).add(evtId));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const selectAll = () => {
    setSelectedIds(selectedIds.size === filtered.length ? new Set() : new Set(filtered.map(s => s.id)));
  };
  const handleBulkWarning = () => { selectedIds.forEach(id => handleSendWarning(id)); setSelectedIds(new Set()); };
  const handleBulkTerminate = () => { selectedIds.forEach(id => handleTerminate(id)); setSelectedIds(new Set()); };
  const handleSendChat = () => {
    if (!message.trim()) return;
    setChatMessages(prev => [...prev, { text: message, from: "proctor", time: new Date().toLocaleTimeString("vi-VN") }]);
    setMessage("");
  };

  const cctvSessions = filtered.filter(s => s.status !== "terminated" && s.status !== "completed");
  const totalCctvPages = Math.ceil(cctvSessions.length / cctvLayout);

  // ═══════════════════════════════
  // DETAIL VIEW
  // ═══════════════════════════════
  if (selectedSession) {
    const s = sessions.find(sess => sess.id === selectedSession.id) || selectedSession;
    const statusCfg = STATUS_CONFIG[s.status];
    const StatusIcon = statusCfg.icon;
    const aiCfg = AI_THREAT_CONFIG[s.aiThreatLevel];
    const connCfg = CONNECTION_CONFIG[s.connectionQuality];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => { setSelectedSession(null); setDetailTab("overview"); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-foreground">{s.studentName}</h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ fontSize: "11px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
                <StatusIcon className="w-3 h-3" /> {statusCfg.label}
              </span>
              <FaceMatchBadge confidence={s.faceMatchConfidence} />
              <ConnectionBadge quality={s.connectionQuality} />
            </div>
            <p className="text-gray-500" style={{ fontSize: "12px" }}>{s.examTitle} &bull; {s.department} &bull; {s.room}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowReport(s)} className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
              <FileWarning className="w-3.5 h-3.5" /> Báo cáo
            </button>
            <button onClick={() => handleSendWarning(s.id)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
              <AlertTriangle className="w-3.5 h-3.5" /> Cảnh báo
            </button>
            <button onClick={() => handleTerminate(s.id)} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
              <Ban className="w-3.5 h-3.5" /> Huỷ thi
            </button>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto scrollbar-hide">
          {([
            { key: "overview" as const, label: "Tổng quan", icon: Eye },
            { key: "events" as const, label: "Sự kiện", icon: AlertCircle, count: s.suspiciousEvents.filter(e => !e.resolved).length },
            { key: "ai" as const, label: "AI Phân tích", icon: Brain },
            { key: "chat" as const, label: "Tin nhắn", icon: MessageSquare },
            { key: "report" as const, label: "Báo cáo", icon: FileWarning },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setDetailTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${detailTab === tab.key ? "bg-[#990803] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
              style={{ fontSize: "12px", fontWeight: 500 }}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full ${detailTab === tab.key ? "bg-white/20" : "bg-red-100 text-red-600"}`} style={{ fontSize: "9px", fontWeight: 700 }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {detailTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Webcam</h3>
                    {s.webcamActive
                      ? <span className="flex items-center gap-1 text-green-600" style={{ fontSize: "11px" }}><Camera className="w-3 h-3" /> Active</span>
                      : <span className="flex items-center gap-1 text-red-600" style={{ fontSize: "11px" }}><CameraOff className="w-3 h-3" /> Offline</span>
                    }
                  </div>
                  <WebcamFeed name={s.studentName} avatar={s.studentAvatar} active={s.webcamActive} risk={s.riskScore} />
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Màn hình</h3>
                    {s.screenShareActive
                      ? <span className="flex items-center gap-1 text-green-600" style={{ fontSize: "11px" }}><Monitor className="w-3 h-3" /> Active</span>
                      : <span className="flex items-center gap-1 text-red-600" style={{ fontSize: "11px" }}><Monitor className="w-3 h-3" /> Offline</span>
                    }
                  </div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    {s.screenShareActive ? (
                      <div className="w-full h-full bg-white p-3 flex flex-col gap-2">
                        <div className="h-2.5 bg-gray-200 rounded w-3/4" /><div className="h-2.5 bg-gray-200 rounded w-1/2" />
                        <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100 mt-1 flex items-center justify-center">
                          <span className="text-gray-400" style={{ fontSize: "11px" }}>Màn hình làm bài</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center"><Monitor className="w-10 h-10 text-gray-300 mx-auto mb-2" /><span className="text-gray-400" style={{ fontSize: "12px" }}>Không chia sẻ</span></div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 style={{ fontSize: "14px", fontWeight: 600 }} className="mb-3">Hoạt động bàn phím & chuột</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-gray-500" style={{ fontSize: "11px" }}>Bàn phím</span><Sparkline data={s.keyboardActivity} color="#3b82f6" width={200} height={40} /></div>
                  <div><span className="text-gray-500" style={{ fontSize: "11px" }}>Chuột</span><Sparkline data={s.mouseActivity} color="#8b5cf6" width={200} height={40} /></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Thông tin phiên thi</h3>
                  <RiskRing score={s.riskScore} size={52} />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Tiến độ", value: `Câu ${s.currentQuestion}/${s.totalQuestions}`, sub: `${Math.round(s.progress)}%` },
                    { label: "Thời gian còn", value: formatTime(s.timeRemaining) }, { label: "Đã làm", value: formatTime(s.timeSpent) },
                    { label: "Face Match", value: `${s.faceMatchConfidence}%` }, { label: "AI Threat", value: aiCfg.label },
                    { label: "Kết nối", value: connCfg.label }, { label: "Tab switches", value: `${s.tabSwitches}` },
                    { label: "IP", value: s.ipAddress }, { label: "Browser", value: s.browser },
                    { label: "OS", value: s.os }, { label: "Phòng thi", value: s.room },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-gray-500" style={{ fontSize: "12px" }}>{item.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{item.value}</span>
                        {"sub" in item && item.sub && <span className="text-gray-400" style={{ fontSize: "10px" }}>{item.sub}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.progress}%`, background: s.riskScore > 60 ? "#ef4444" : s.riskScore > 30 ? "#f59e0b" : "#22c55e" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        {detailTab === "events" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Sự kiện nghi ngờ ({s.suspiciousEvents.length})</h3>
              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full" style={{ fontSize: "10px", fontWeight: 700 }}>{s.suspiciousEvents.filter(e => !e.resolved).length} chưa xử lý</span>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {s.suspiciousEvents.length === 0 ? (
                <div className="text-center py-10"><ShieldCheck className="w-10 h-10 text-green-400 mx-auto mb-2" /><span className="text-gray-400" style={{ fontSize: "13px" }}>Không có sự kiện nghi ngờ</span></div>
              ) : s.suspiciousEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(evt => {
                const config = ALERT_CONFIGS[evt.type]; const sevCfg = SEVERITY_CONFIG[evt.severity]; const EvtIcon = config?.icon || AlertCircle;
                return (
                  <div key={evt.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors" style={{ opacity: evt.resolved ? 0.5 : 1 }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${config?.color || "#6b7280"}15` }}>
                      <EvtIcon className="w-4 h-4" style={{ color: config?.color || "#6b7280" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{config?.label || evt.type}</span>
                        <span className="px-1.5 py-0 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: sevCfg.color, background: sevCfg.bg }}>{sevCfg.label}</span>
                      </div>
                      <p className="text-gray-500" style={{ fontSize: "11px" }}>{evt.description}</p>
                      <span className="text-gray-400" style={{ fontSize: "10px" }}>{new Date(evt.timestamp).toLocaleString("vi-VN")}</span>
                    </div>
                    {(evt.resolved || resolvedEvents.has(evt.id)) ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-1" /> : (
                      <button onClick={() => { resolveEvent(evt.id); }} className="px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 cursor-pointer shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>Xử lý</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI */}
        {detailTab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
              <h3 className="flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}><Brain className="w-4 h-4 text-purple-500" /> AI Phân tích hành vi</h3>
              <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: aiCfg.bg }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${aiCfg.color}20` }}><Cpu className="w-6 h-6" style={{ color: aiCfg.color }} /></div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: aiCfg.color }}>Mức đe doạ: {aiCfg.label}</p>
                  <p className="text-gray-600" style={{ fontSize: "11px" }}>Confidence: {85 + Math.floor(Math.random() * 10)}%</p>
                </div>
              </div>
              <div className="space-y-2">
                {s.aiInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl"><Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /><span className="text-gray-700" style={{ fontSize: "12px" }}>{insight}</span></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}><ScanFace className="w-4 h-4 text-blue-500" /> Nhận diện khuôn mặt</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{s.studentAvatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: "20px", fontWeight: 800, color: s.faceMatchConfidence >= 90 ? "#22c55e" : s.faceMatchConfidence >= 75 ? "#f59e0b" : "#ef4444" }}>{s.faceMatchConfidence}%</span>
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>độ khớp</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.faceMatchConfidence}%`, background: s.faceMatchConfidence >= 90 ? "#22c55e" : s.faceMatchConfidence >= 75 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>{s.faceMatchConfidence >= 90 ? "Khớp tốt" : s.faceMatchConfidence >= 75 ? "Cần kiểm tra" : "Nghi ngờ thi hộ"}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}><Activity className="w-4 h-4 text-blue-500" /> Hoạt động</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-gray-500" style={{ fontSize: "11px" }}>Bàn phím</span><span className="text-blue-600" style={{ fontSize: "10px", fontWeight: 600 }}>{s.keyboardActivity[s.keyboardActivity.length - 1]}%</span></div>
                    <Sparkline data={s.keyboardActivity} color="#3b82f6" width={250} height={30} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-gray-500" style={{ fontSize: "11px" }}>Chuột</span><span className="text-purple-600" style={{ fontSize: "10px", fontWeight: 600 }}>{s.mouseActivity[s.mouseActivity.length - 1]}%</span></div>
                    <Sparkline data={s.mouseActivity} color="#8b5cf6" width={250} height={30} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat */}
        {detailTab === "chat" && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h3 style={{ fontSize: "14px", fontWeight: 600 }}>Tin nhắn tới {s.studentName}</h3></div>
            <div className="h-64 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {chatMessages.length === 0 ? <div className="text-center py-8 text-gray-400" style={{ fontSize: "12px" }}>Chưa có tin nhắn</div>
                : chatMessages.map((msg, i) => (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[70%] bg-[#990803] text-white px-3 py-2 rounded-xl rounded-br-sm">
                    <p style={{ fontSize: "12px" }}>{msg.text}</p><span className="text-white/60" style={{ fontSize: "9px" }}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-1 flex-wrap">
              {["Giữ trật tự!", "Kiểm tra camera!", "Cảnh báo lần cuối!"].map(q => (
                <button key={q} onClick={() => setMessage(q)} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "10px" }}>{q}</button>
              ))}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendChat()} placeholder="Nhắn tin..."
                className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none" style={{ fontSize: "12px" }} />
              <button onClick={handleSendChat} className="p-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors cursor-pointer"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Report */}
        {detailTab === "report" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}><FileWarning className="w-4 h-4 text-red-500" /> Báo cáo vi phạm tự động</h3>
              <button onClick={() => setShowReport(s)} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px" }}><Maximize2 className="w-3.5 h-3.5" /> Xem đầy đủ</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Risk Score", value: s.riskScore, color: s.riskScore > 60 ? "#ef4444" : s.riskScore > 30 ? "#f59e0b" : "#22c55e" },
                { label: "Face Match", value: `${s.faceMatchConfidence}%`, color: s.faceMatchConfidence >= 90 ? "#22c55e" : "#f59e0b" },
                { label: "Sự kiện", value: s.suspiciousEvents.length, color: "#8b5cf6" },
                { label: "AI Threat", value: aiCfg.label, color: aiCfg.color },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: `${item.color}08` }}>
                  <p className="text-gray-500" style={{ fontSize: "10px" }}>{item.label}</p>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-amber-800" style={{ fontSize: "12px" }}>
                {s.riskScore > 60 ? "Phát hiện nhiều dấu hiệu gian lận. Khuyến nghị huỷ kết quả và thi lại." : s.riskScore > 30 ? "Có sự kiện cần xem xét. Theo dõi thêm." : "Phiên thi bình thường."}
              </p>
            </div>
          </div>
        )}

        {showReport && <IncidentReportModal session={showReport} onClose={() => setShowReport(null)} />}
      </div>
    );
  }

  // ═══════════════════════════════
  // ALERT LOG
  // ═══════════════════════════════
  if (showAlertLog) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAlertLog(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <div><h2 className="text-foreground">Nhật ký Cảnh báo</h2><p className="text-gray-500" style={{ fontSize: "12px" }}>{allAlerts.length} sự kiện</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {allAlerts.slice(0, 50).map(alert => {
            const config = ALERT_CONFIGS[alert.type]; const sevCfg = SEVERITY_CONFIG[alert.severity]; const EvtIcon = config?.icon || AlertCircle;
            return (
              <div key={alert.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${config?.color || "#6b7280"}15` }}><EvtIcon className="w-4 h-4" style={{ color: config?.color || "#6b7280" }} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{config?.label || alert.type}</span><span className="px-1.5 py-0 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: sevCfg.color, background: sevCfg.bg }}>{sevCfg.label}</span></div>
                  <span className="text-gray-500" style={{ fontSize: "11px" }}>{alert.studentName}</span>
                </div>
                <span className="text-gray-400 shrink-0" style={{ fontSize: "11px" }}>{new Date(alert.timestamp).toLocaleTimeString("vi-VN")}</span>
                {alert.resolved ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════
  // MAIN DASHBOARD
  // ═══════════════════════════════
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Đang thi", value: stats.active, icon: Activity, color: "#22c55e" },
          { label: "Cảnh báo", value: stats.warnings, icon: AlertTriangle, color: "#f59e0b" },
          { label: "Vi phạm", value: stats.flagged, icon: Flag, color: "#ef4444" },
          { label: "Đã huỷ", value: stats.terminated, icon: Ban, color: "#6b7280" },
          { label: "Sự kiện", value: stats.totalAlerts, icon: ShieldAlert, color: "#dc2626" },
          { label: "Risk TB", value: `${stats.avgRisk}%`, icon: Gauge, color: "#8b5cf6" },
          { label: "Face Match", value: `${stats.avgFaceMatch}%`, icon: ScanFace, color: "#3b82f6" },
          { label: "Mạng yếu", value: stats.poorConn, icon: WifiOff, color: "#f97316" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${stat.color}12` }}><stat.icon className="w-4 h-4" style={{ color: stat.color }} /></div>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: stat.color }} />
            </div>
            <p className="text-gray-800" style={{ fontSize: "20px", fontWeight: 800 }}>{stat.value}</p>
            <p className="text-gray-400" style={{ fontSize: "10px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm học viên, đề thi, phòng ban..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none transition-all" style={{ fontSize: "13px" }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Trạng thái</option>{Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Rủi ro</option><option value="high">Cao</option><option value="medium">TB</option><option value="low">Thấp</option>
            </select>
            <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Phòng thi</option>{ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={examFilter} onChange={e => setExamFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Đề thi</option>{MOCK_EXAMS.map(ex => <option key={ex.id} value={ex.id}>{ex.title.slice(0, 30)}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer transition-all ${autoRefresh ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`} style={{ fontSize: "12px", fontWeight: 500 }}>
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} /> {autoRefresh ? "Live" : "Paused"}
            </button>
            <button onClick={() => setShowAlertLog(true)} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl cursor-pointer hover:bg-red-100 transition-colors" style={{ fontSize: "12px", fontWeight: 500 }}>
              <Bell className="w-3.5 h-3.5" /> Nhật ký ({stats.totalAlerts})
            </button>
            <button onClick={() => setShowBroadcast(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803]/5 border border-[#990803]/20 text-[#990803] rounded-xl cursor-pointer hover:bg-[#990803]/10 transition-colors" style={{ fontSize: "12px", fontWeight: 500 }}>
              <Megaphone className="w-3.5 h-3.5" /> Thông báo
            </button>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-blue-700" style={{ fontSize: "11px", fontWeight: 600 }}>Chọn: {selectedIds.size}</span>
                <button onClick={handleBulkWarning} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 cursor-pointer" style={{ fontSize: "10px", fontWeight: 600 }}>Cảnh báo</button>
                <button onClick={handleBulkTerminate} className="px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer" style={{ fontSize: "10px", fontWeight: 600 }}>Huỷ</button>
                <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:bg-blue-100 rounded cursor-pointer"><XCircle className="w-3 h-3 text-blue-400" /></button>
              </div>
            )}
            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
              {([{ key: "cctv" as const, icon: Grid3X3, label: "CCTV" }, { key: "grid" as const, icon: LayoutGrid, label: "Lưới" }, { key: "list" as const, icon: List, label: "Bảng" }]).map(v => (
                <button key={v.key} onClick={() => setViewMode(v.key)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${viewMode === v.key ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>
                  <v.icon className="w-3.5 h-3.5" /> {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CCTV */}
      {viewMode === "cctv" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-500" style={{ fontSize: "12px" }}>{cctvSessions.length} camera</span>
              <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 ml-2">
                {([4, 9, 16] as const).map(n => (
                  <button key={n} onClick={() => { setCctvLayout(n); setCctvPage(0); }} className={`px-2.5 py-1 rounded-md cursor-pointer ${cctvLayout === n ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>{Math.sqrt(n)}x{Math.sqrt(n)}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCctvPage(Math.max(0, cctvPage - 1))} disabled={cctvPage === 0} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-30"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
              <span className="text-gray-500" style={{ fontSize: "11px" }}>{cctvPage + 1}/{totalCctvPages || 1}</span>
              <button onClick={() => setCctvPage(Math.min(totalCctvPages - 1, cctvPage + 1))} disabled={cctvPage >= totalCctvPages - 1} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-30"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
            </div>
          </div>
          <div className={`grid gap-2 ${cctvLayout === 4 ? "grid-cols-2" : cctvLayout === 9 ? "grid-cols-3" : "grid-cols-4"}`}>
            {cctvSessions.slice(cctvPage * cctvLayout, (cctvPage + 1) * cctvLayout).map(s => {
              const statusCfg = STATUS_CONFIG[s.status]; const isSelected = selectedIds.has(s.id);
              return (
                <div key={s.id} className={`relative rounded-xl overflow-hidden border-2 cursor-pointer group transition-all hover:shadow-lg ${isSelected ? "ring-2 ring-blue-400" : ""}`}
                  style={{ borderColor: s.riskScore > 60 ? "#ef4444" : s.riskScore > 30 ? "#f59e0b" : "#22c55e40" }} onClick={() => setSelectedSession(s)}>
                  <WebcamFeed name={s.studentName} avatar={s.studentAvatar} active={s.webcamActive} risk={s.riskScore} compact={cctvLayout >= 9} />
                  <div className="absolute top-1.5 right-1.5"><RiskRing score={s.riskScore} size={cctvLayout >= 16 ? 24 : 30} /></div>
                  <div className="absolute bottom-1.5 right-1.5">
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full backdrop-blur-sm" style={{ fontSize: "8px", fontWeight: 600, color: statusCfg.color, background: `${statusCfg.bg}dd` }}>{statusCfg.label}</span>
                  </div>
                  <div className="absolute top-1.5 left-10 bg-black/50 text-white px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px" }}><Clock className="w-2.5 h-2.5 inline mr-0.5" />{formatTime(s.timeRemaining)}</div>
                  <button className="absolute bottom-1.5 left-1.5 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={e => { e.stopPropagation(); toggleSelect(s.id); }}>
                    {isSelected ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <SquareIcon className="w-4 h-4 text-white/70" />}
                  </button>
                  {s.faceMatchConfidence < 80 && <span className="absolute top-8 left-1.5 bg-red-500/80 text-white px-1 py-0.5 rounded" style={{ fontSize: "7px" }}>Face: {s.faceMatchConfidence}%</span>}
                  {s.connectionQuality === "poor" && <span className="absolute top-12 left-1.5 bg-orange-500/80 text-white px-1 py-0.5 rounded" style={{ fontSize: "7px" }}>Mạng yếu</span>}
                </div>
              );
            })}
          </div>
          {/* Live + Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}><Radio className="w-4 h-4 text-red-500 animate-pulse" /> Real-time</h3>
                <span className="text-gray-400" style={{ fontSize: "10px" }}>5s</span>
              </div>
              <div ref={liveEventRef} className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-hide">
                {liveEvents.length === 0 ? <div className="text-center py-6 text-gray-400" style={{ fontSize: "12px" }}>Đang theo dõi...</div>
                  : liveEvents.slice(0, 20).map(evt => {
                    const config = ALERT_CONFIGS[evt.type]; const sevCfg = SEVERITY_CONFIG[evt.severity]; const EvtIcon = config?.icon || AlertCircle;
                    return (
                      <div key={evt.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${config?.color}15` }}><EvtIcon className="w-3 h-3" style={{ color: config?.color }} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5"><span className="text-gray-800 truncate" style={{ fontSize: "11px", fontWeight: 600 }}>{evt.studentName}</span><span className="px-1 py-0 rounded" style={{ fontSize: "8px", fontWeight: 600, color: sevCfg.color, background: sevCfg.bg }}>{config?.label}</span></div>
                        </div>
                        <span className="text-gray-400 shrink-0" style={{ fontSize: "9px" }}>{new Date(evt.timestamp).toLocaleTimeString("vi-VN")}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}><Layers className="w-4 h-4 text-orange-500" /> Heatmap (60 phút)</h3>
              <ActivityHeatmap sessions={sessions} />
            </div>
          </div>
          {/* Risk Distribution + Connection + Rooms */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}><Gauge className="w-4 h-4 text-purple-500" /> Phân bố rủi ro</h3>
              <RiskDonutChart sessions={sessions} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}><WifiOff className="w-4 h-4 text-cyan-500" /> Chất lượng kết nối</h3>
              <ConnectionSummary sessions={sessions} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:col-span-2">
              <h3 className="flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}><MapPin className="w-4 h-4 text-blue-500" /> Phòng thi</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {ROOMS.map(room => {
                  const rs = sessions.filter(s => s.room === room && s.status !== "terminated" && s.status !== "completed");
                  const hr = rs.filter(s => s.riskScore > 60).length;
                  const ar = rs.length > 0 ? Math.round(rs.reduce((a, s) => a + s.riskScore, 0) / rs.length) : 0;
                  return (
                    <button key={room} onClick={() => setRoomFilter(roomFilter === room ? "all" : room)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${roomFilter === room ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <p className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{room}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-500" style={{ fontSize: "10px" }}>{rs.length} HV</span>
                        {hr > 0 && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full" style={{ fontSize: "9px", fontWeight: 700 }}>{hr} risk</span>}
                      </div>
                      <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, ar)}%`, background: ar > 60 ? "#ef4444" : ar > 30 ? "#f59e0b" : "#22c55e" }} /></div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {viewMode === "grid" && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
                {selectedIds.size === filtered.length ? <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> : <SquareIcon className="w-3.5 h-3.5" />} Chọn tất cả
              </button>
              <p className="text-gray-500" style={{ fontSize: "12px" }}>{filtered.length} phiên thi</p>
            </div>
          </div>
          {filtered.length === 0 ? <EmptyFilterState onReset={resetFilters} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(s => {
              const statusCfg = STATUS_CONFIG[s.status]; const StatusIcon = statusCfg.icon;
              const unresolvedCount = s.suspiciousEvents.filter(e => !e.resolved).length;
              const isSelected = selectedIds.has(s.id); const aiCfg2 = AI_THREAT_CONFIG[s.aiThreatLevel];
              return (
                <div key={s.id} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${isSelected ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-200"}`} onClick={() => setSelectedSession(s)}>
                  <div className="relative">
                    <WebcamFeed name={s.studentName} avatar={s.studentAvatar} active={s.webcamActive} risk={s.riskScore} />
                    <div className="absolute top-2 right-2"><RiskRing score={s.riskScore} size={36} /></div>
                    <div className="absolute bottom-2 right-2"><span className="flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-sm" style={{ fontSize: "10px", fontWeight: 600, color: statusCfg.color, background: `${statusCfg.bg}dd` }}><StatusIcon className="w-3 h-3" /> {statusCfg.label}</span></div>
                    <button className="absolute top-2 left-2 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={e => { e.stopPropagation(); toggleSelect(s.id); }}>
                      {isSelected ? <CheckSquare className="w-4.5 h-4.5 text-blue-500" /> : <SquareIcon className="w-4.5 h-4.5 text-white/70" />}
                    </button>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0"><h4 className="text-gray-800 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{s.studentName}</h4><p className="text-gray-400 truncate" style={{ fontSize: "11px" }}>{s.examTitle}</p></div>
                      <div className="flex items-center gap-1 shrink-0">
                        <FaceMatchBadge confidence={s.faceMatchConfidence} />
                        {unresolvedCount > 0 && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full" style={{ fontSize: "9px", fontWeight: 700 }}>{unresolvedCount}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: "10px" }}><Clock className="w-3 h-3" />{formatTime(s.timeRemaining)}</span>
                      <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: "10px" }}><Target className="w-3 h-3" />{s.currentQuestion}/{s.totalQuestions}</span>
                      <ConnectionBadge quality={s.connectionQuality} />
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 600, color: aiCfg2.color, background: aiCfg2.bg }}>AI: {aiCfg2.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1"><span className="text-gray-400" style={{ fontSize: "9px" }}>KB</span><Sparkline data={s.keyboardActivity} color="#3b82f6" width={50} height={16} /></div>
                      <div className="flex items-center gap-1"><span className="text-gray-400" style={{ fontSize: "9px" }}>MS</span><Sparkline data={s.mouseActivity} color="#8b5cf6" width={50} height={16} /></div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${s.progress}%`, background: s.riskScore > 60 ? "#ef4444" : s.riskScore > 30 ? "#f59e0b" : "#22c55e" }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </>
      )}

      {/* List */}
      {viewMode === "list" && (
        filtered.length === 0 ? <EmptyFilterState onReset={resetFilters} /> :
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "12px" }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-2.5 px-3 text-left"><button onClick={selectAll} className="cursor-pointer">{selectedIds.size === filtered.length ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <SquareIcon className="w-4 h-4 text-gray-400" />}</button></th>
                  {["Học viên", "Đề thi", "Phòng", "Status", "Risk", "Face", "AI", "Tiến độ", "Còn lại", "Mạng", "Alerts", "Activity", ""].map(h => (
                    <th key={h} className={`py-2.5 px-3 ${h === "" ? "text-right" : h === "Học viên" || h === "Đề thi" || h === "Phòng" ? "text-left" : "text-center"} text-gray-500`} style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(s => {
                  const statusCfg = STATUS_CONFIG[s.status]; const StatusIcon = statusCfg.icon;
                  const unresolvedCount = s.suspiciousEvents.filter(e => !e.resolved).length;
                  const aiCfg2 = AI_THREAT_CONFIG[s.aiThreatLevel]; const isSelected = selectedIds.has(s.id);
                  return (
                    <tr key={s.id} className={`hover:bg-gray-50 cursor-pointer ${isSelected ? "bg-blue-50/50" : ""}`} onClick={() => setSelectedSession(s)}>
                      <td className="py-2.5 px-3"><button onClick={e => { e.stopPropagation(); toggleSelect(s.id); }} className="cursor-pointer">{isSelected ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <SquareIcon className="w-4 h-4 text-gray-300" />}</button></td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center shrink-0"><span className="text-white" style={{ fontSize: "9px", fontWeight: 700 }}>{s.studentAvatar}</span></div>
                          <div className="min-w-0"><p className="text-gray-800 truncate" style={{ fontWeight: 600 }}>{s.studentName}</p><p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{s.department}</p></div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 max-w-32 truncate">{s.examTitle}</td>
                      <td className="py-2.5 px-3 text-gray-500" style={{ fontSize: "11px" }}>{s.room.replace("Phòng thi ", "")}</td>
                      <td className="py-2.5 px-3 text-center"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}><StatusIcon className="w-3 h-3" /></span></td>
                      <td className="py-2.5 px-3 text-center"><RiskRing score={s.riskScore} size={30} /></td>
                      <td className="py-2.5 px-3 text-center"><FaceMatchBadge confidence={s.faceMatchConfidence} /></td>
                      <td className="py-2.5 px-3 text-center"><span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: aiCfg2.color, background: aiCfg2.bg }}>{aiCfg2.label}</span></td>
                      <td className="py-2.5 px-3 text-center"><div className="w-16 mx-auto"><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: "#990803" }} /></div><span className="text-gray-400" style={{ fontSize: "9px" }}>{Math.round(s.progress)}%</span></div></td>
                      <td className="py-2.5 px-3 text-center text-gray-600" style={{ fontSize: "11px" }}>{formatTime(s.timeRemaining)}</td>
                      <td className="py-2.5 px-3 text-center"><ConnectionBadge quality={s.connectionQuality} /></td>
                      <td className="py-2.5 px-3 text-center">{unresolvedCount > 0 ? <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full" style={{ fontSize: "10px", fontWeight: 700 }}>{unresolvedCount}</span> : <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />}</td>
                      <td className="py-2.5 px-3 text-center"><Sparkline data={s.keyboardActivity} color="#6b7280" width={40} height={14} /></td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={e => { e.stopPropagation(); setShowReport(s); }} className="p-1.5 hover:bg-purple-50 rounded-lg cursor-pointer" title="Báo cáo"><FileWarning className="w-3.5 h-3.5 text-purple-500" /></button>
                          <button onClick={e => { e.stopPropagation(); handleSendWarning(s.id); }} className="p-1.5 hover:bg-amber-50 rounded-lg cursor-pointer" title="Cảnh báo"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /></button>
                          <button onClick={e => { e.stopPropagation(); handleTerminate(s.id); }} className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer" title="Huỷ"><Ban className="w-3.5 h-3.5 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} onSend={(msg, type) => setShowBroadcast(false)} selectedCount={selectedIds.size} />}
      {showReport && <IncidentReportModal session={showReport} onClose={() => setShowReport(null)} />}
    </div>
  );
}
