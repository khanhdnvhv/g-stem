import {
  MonitorSmartphone, CameraOff, Users, Ban, Monitor,
  Volume2, AlertCircle, Maximize2, Timer, Play, AlertTriangle,
  Flag, XCircle, CheckCircle2, Signal, SignalHigh, SignalLow, SignalZero,
} from "lucide-react";

export interface ProctoringSession {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  department: string;
  subsidiary: string;
  status: "active" | "warning" | "flagged" | "terminated" | "completed";
  startedAt: string;
  timeSpent: number;
  timeRemaining: number;
  progress: number;
  webcamActive: boolean;
  screenShareActive: boolean;
  audioActive: boolean;
  tabSwitches: number;
  suspiciousEvents: SuspiciousEvent[];
  riskScore: number;
  currentQuestion: number;
  totalQuestions: number;
  ipAddress: string;
  browser: string;
  os: string;
  connectionQuality: "excellent" | "good" | "fair" | "poor";
  faceMatchConfidence: number;
  keyboardActivity: number[];
  mouseActivity: number[];
  aiThreatLevel: "safe" | "low" | "medium" | "high" | "critical";
  aiInsights: string[];
  room: string;
}

export interface SuspiciousEvent {
  id: string;
  type: "tab_switch" | "face_absent" | "multiple_faces" | "phone_detected" | "screen_share_off" | "audio_anomaly" | "copy_paste" | "right_click" | "window_resize" | "idle";
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  screenshot?: string;
  resolved: boolean;
}

export const ALERT_CONFIGS: Record<string, { type: string; label: string; color: string; icon: typeof AlertCircle }> = {
  tab_switch: { type: "tab_switch", label: "Chuyển tab", color: "#f59e0b", icon: MonitorSmartphone },
  face_absent: { type: "face_absent", label: "Không phát hiện khuôn mặt", color: "#ef4444", icon: CameraOff },
  multiple_faces: { type: "multiple_faces", label: "Nhiều khuôn mặt", color: "#ef4444", icon: Users },
  phone_detected: { type: "phone_detected", label: "Phát hiện điện thoại", color: "#dc2626", icon: Ban },
  screen_share_off: { type: "screen_share_off", label: "Tắt chia sẻ màn hình", color: "#f59e0b", icon: Monitor },
  audio_anomaly: { type: "audio_anomaly", label: "Bất thường âm thanh", color: "#8b5cf6", icon: Volume2 },
  copy_paste: { type: "copy_paste", label: "Copy/Paste", color: "#f59e0b", icon: AlertCircle },
  right_click: { type: "right_click", label: "Right Click", color: "#6b7280", icon: AlertCircle },
  window_resize: { type: "window_resize", label: "Resize cửa sổ", color: "#6b7280", icon: Maximize2 },
  idle: { type: "idle", label: "Không thao tác", color: "#f59e0b", icon: Timer },
};

export const SEVERITY_CONFIG = {
  low: { label: "Thấp", color: "#22c55e", bg: "#22c55e15" },
  medium: { label: "Trung bình", color: "#f59e0b", bg: "#f59e0b15" },
  high: { label: "Cao", color: "#ef4444", bg: "#ef444415" },
  critical: { label: "Nghiêm trọng", color: "#dc2626", bg: "#dc262615" },
};

export const STATUS_CONFIG = {
  active: { label: "Đang thi", color: "#22c55e", bg: "#22c55e15", icon: Play },
  warning: { label: "Cảnh báo", color: "#f59e0b", bg: "#f59e0b15", icon: AlertTriangle },
  flagged: { label: "Ghi nhận", color: "#ef4444", bg: "#ef444415", icon: Flag },
  terminated: { label: "Đã huỷ", color: "#dc2626", bg: "#dc262615", icon: XCircle },
  completed: { label: "Hoàn thành", color: "#3b82f6", bg: "#3b82f615", icon: CheckCircle2 },
};

export const AI_THREAT_CONFIG = {
  safe: { label: "An toàn", color: "#22c55e", bg: "#22c55e12" },
  low: { label: "Thấp", color: "#3b82f6", bg: "#3b82f612" },
  medium: { label: "Trung bình", color: "#f59e0b", bg: "#f59e0b12" },
  high: { label: "Cao", color: "#ef4444", bg: "#ef444412" },
  critical: { label: "Rất cao", color: "#dc2626", bg: "#dc262612" },
};

export const CONNECTION_CONFIG = {
  excellent: { label: "Tuyệt vời", color: "#22c55e", icon: Signal },
  good: { label: "Tốt", color: "#3b82f6", icon: SignalHigh },
  fair: { label: "Trung bình", color: "#f59e0b", icon: SignalLow },
  poor: { label: "Yếu", color: "#ef4444", icon: SignalZero },
};

export const ROOMS = ["Phòng thi A1", "Phòng thi A2", "Phòng thi B1", "Phòng thi B2", "Phòng thi Online"];

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
