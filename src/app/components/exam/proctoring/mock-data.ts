import type { ProctoringSession, SuspiciousEvent } from "./types";
import { MOCK_EXAMS } from "../types";
import { SUBSIDIARIES, DEPARTMENTS } from "../../mock-data";
import { ROOMS } from "./types";

const AI_INSIGHTS_POOL = [
  "Mẫu gõ phím bất thường - có thể đang nhận trợ giúp từ bên ngoài",
  "Chuyển động mắt liên tục nhìn sang bên trái - kiểm tra xung quanh",
  "Tốc độ trả lời quá nhanh so với độ khó câu hỏi",
  "Pattern copy-paste phát hiện trong câu trả lời tự luận",
  "Webcam cho thấy có vật thể phản chiếu trên kính",
  "Hành vi bình thường - không phát hiện dấu hiệu bất thường",
  "Đã idle quá 2 phút - có thể đang tham khảo tài liệu",
  "Âm thanh nền có giọng nói khác - kiểm tra môi trường thi",
  "Tần suất tab switch tăng đột biến trong 5 phút qua",
  "IP address thay đổi giữa phiên thi - VPN detected",
];

export function generateMockSessions(): ProctoringSession[] {
  const names = [
    "Trần Văn Hùng", "Nguyễn Thị Lan", "Phạm Minh Tuấn", "Lê Hoàng Vũ",
    "Võ Thị Hạnh", "Hoàng Văn Đạt", "Đỗ Thị Mai", "Bùi Xuân Trường",
    "Nguyễn Văn An", "Trần Thị Bích", "Lê Văn Cường", "Phạm Thị Dương",
    "Vũ Hoàng Dũng", "Nguyễn Thị E", "Đinh Văn Phú", "Trần Thanh Hoa",
    "Lê Minh Khôi", "Phạm Văn Long", "Nguyễn Thị Ngọc", "Hoàng Văn Phong",
    "Võ Thị Quý", "Bùi Văn Rơi", "Trần Thị Sơn", "Đoàn Văn Thắng",
  ];
  const eventTypes: SuspiciousEvent["type"][] = [
    "tab_switch", "face_absent", "multiple_faces", "phone_detected",
    "screen_share_off", "audio_anomaly", "copy_paste", "idle",
  ];
  const severities: SuspiciousEvent["severity"][] = ["low", "medium", "high", "critical"];
  const browsers = ["Chrome 122", "Firefox 123", "Edge 121", "Safari 17.3"];
  const oses = ["Windows 11", "macOS Sonoma", "Windows 10", "Ubuntu 22.04"];
  const statuses: ProctoringSession["status"][] = ["active", "active", "active", "warning", "warning", "flagged", "completed", "active"];
  const connQuality: ProctoringSession["connectionQuality"][] = ["excellent", "good", "good", "fair", "excellent", "poor"];

  return names.map((name, i) => {
    const nEvents = Math.floor(Math.random() * 6);
    const events: SuspiciousEvent[] = Array.from({ length: nEvents }, (_, j) => ({
      id: `EVT-${i}-${j}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Sự kiện #${j + 1} - ${name}`,
      resolved: Math.random() > 0.6,
    }));
    const riskScore = Math.min(100, events.reduce((s, e) =>
      s + (e.severity === "critical" ? 30 : e.severity === "high" ? 20 : e.severity === "medium" ? 10 : 5), 0
    ));
    const status = riskScore > 60 ? "flagged" : riskScore > 30 ? "warning" : statuses[i % statuses.length];
    const timeSpent = 300 + Math.floor(Math.random() * 2400);
    const totalTime = [45, 15, 90, 60][i % 4] * 60;
    const faceMatch = Math.max(50, 100 - Math.floor(Math.random() * 30) - (riskScore > 50 ? 20 : 0));
    const aiThreatLevel: ProctoringSession["aiThreatLevel"] =
      riskScore > 70 ? "critical" : riskScore > 50 ? "high" : riskScore > 30 ? "medium" : riskScore > 10 ? "low" : "safe";
    const kbActivity = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
    const msActivity = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
    const numInsights = riskScore > 40 ? 3 : riskScore > 20 ? 2 : 1;
    const insights = Array.from({ length: numInsights }, () =>
      AI_INSIGHTS_POOL[Math.floor(Math.random() * AI_INSIGHTS_POOL.length)]
    );

    return {
      id: `PROC-${String(i + 1).padStart(3, "0")}`,
      examId: MOCK_EXAMS[i % MOCK_EXAMS.length].id,
      examTitle: MOCK_EXAMS[i % MOCK_EXAMS.length].title,
      studentId: `U${String(100 + i).padStart(3, "0")}`,
      studentName: name,
      studentAvatar: name.split(" ").map(w => w[0]).join("").slice(0, 2),
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      subsidiary: SUBSIDIARIES[i % SUBSIDIARIES.length],
      status,
      startedAt: new Date(Date.now() - timeSpent * 1000).toISOString(),
      timeSpent,
      timeRemaining: Math.max(0, totalTime - timeSpent),
      progress: Math.min(100, Math.round((timeSpent / totalTime) * 100)),
      webcamActive: Math.random() > 0.1,
      screenShareActive: Math.random() > 0.15,
      audioActive: Math.random() > 0.2,
      tabSwitches: events.filter(e => e.type === "tab_switch").length,
      suspiciousEvents: events,
      riskScore,
      currentQuestion: Math.floor(Math.random() * 20) + 1,
      totalQuestions: [20, 10, 30, 15][i % 4],
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      browser: browsers[i % browsers.length],
      os: oses[i % oses.length],
      connectionQuality: connQuality[i % connQuality.length],
      faceMatchConfidence: faceMatch,
      keyboardActivity: kbActivity,
      mouseActivity: msActivity,
      aiThreatLevel,
      aiInsights: insights,
      room: ROOMS[i % ROOMS.length],
    };
  });
}
