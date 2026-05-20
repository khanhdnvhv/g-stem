/* ================================================================ */
/*  CT4 MODULES — 4 module công nghệ CỐ ĐỊNH                         */
/*  Nguồn: Cautruc chuong trinh Geleximco.xlsx — sheet CT4           */
/* ================================================================ */

export type CT4ModuleId = "robotics_1" | "ai" | "iot" | "robotics_ai";
export type ProgrammingLanguage = "scratch" | "block" | "arduino_c" | "python";

export interface CT4Module {
  id: CT4ModuleId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  languages: ProgrammingLanguage[];
  defaultHardware: string[];
  safetyTemplate: string;
  suitableGrades: string[];
}

export const CT4_MODULES: CT4Module[] = [
  {
    id: "robotics_1",
    name: "Chương trình Robotics 1",
    shortName: "Robotics 1",
    description: "Cơ bản — lắp ráp robot + lập trình điều khiển Block-based. Khám phá khái niệm cảm biến, động cơ, logic điều khiển.",
    color: "#dc2626",
    languages: ["scratch", "block"],
    defaultHardware: [
      "Robot kit (mBot / LEGO Mindstorms / mBlock)",
      "Cảm biến siêu âm HC-SR04",
      "Cảm biến đường line",
      "Module Bluetooth HC-05",
    ],
    safetyTemplate:
      "• An toàn pin Li-Po: không sạc qua đêm, không để gần nguồn nhiệt.\n" +
      "• Kiểm tra dây kết nối trước khi cấp nguồn — tránh chập mạch.\n" +
      "• Khi robot di chuyển, giữ khoảng cách an toàn ≥ 30cm.",
    suitableGrades: ["Tiểu học", "THCS", "THPT"],
  },
  {
    id: "ai",
    name: "Chương trình AI",
    shortName: "AI",
    description: "Machine Learning cơ bản — Teachable Machine, Computer Vision, NLP đơn giản. Hiểu nguyên lý ML và ứng dụng.",
    color: "#7c3aed",
    languages: ["python", "scratch"],
    defaultHardware: [
      "Laptop / PC (Chrome browser)",
      "Webcam",
      "Microphone",
      "Tài khoản Teachable Machine / Google Colab",
    ],
    safetyTemplate:
      "• Bảo vệ quyền riêng tư: không train model với khuôn mặt người khác khi chưa xin phép.\n" +
      "• Không upload dữ liệu cá nhân nhạy cảm lên cloud công cộng.\n" +
      "• Hiểu rằng AI có thể sai — kiểm tra kỹ trước khi áp dụng kết quả vào thực tế.",
    suitableGrades: ["THCS", "THPT"],
  },
  {
    id: "iot",
    name: "Chương trình IoT",
    shortName: "IoT",
    description: "Arduino + cảm biến + smart device. Thiết kế hệ thống thu thập dữ liệu thông minh — trạm thời tiết, nhà thông minh, v.v.",
    color: "#0891b2",
    languages: ["arduino_c", "python"],
    defaultHardware: [
      "Arduino UNO R3 / ESP32",
      "Breadboard 830 điểm",
      "Cảm biến DHT11 (nhiệt độ/độ ẩm)",
      "Cảm biến ánh sáng LDR",
      "Module relay 5V",
      "LED + điện trở 220Ω",
      "Dây jumper Male-Male / Female-Male",
    ],
    safetyTemplate:
      "• AN TOÀN ĐIỆN: chỉ dùng nguồn USB 5V hoặc adapter ≤ 9V. KHÔNG cắm vào điện lưới 220V.\n" +
      "• Kiểm tra cực + / − trước khi cắm linh kiện điện tử.\n" +
      "• Mỏ hàn (nếu có): đặt giá đỡ, đứng cách 30cm, không sờ tay vào đầu hàn.\n" +
      "• Tháo nguồn trước khi thay đổi mạch.",
    suitableGrades: ["THCS", "THPT", "THPT Nghề"],
  },
  {
    id: "robotics_ai",
    name: "Chương trình Robotics + AI",
    shortName: "Robotics + AI",
    description: "Kết hợp robot tự động hoá có trí tuệ nhân tạo — Computer Vision, autonomous navigation. Nâng cao.",
    color: "#990803",
    languages: ["python", "arduino_c"],
    defaultHardware: [
      "Raspberry Pi 4 / Jetson Nano",
      "Camera Pi v2 (8MP)",
      "Robot kit có DC motor (4WD)",
      "Cảm biến siêu âm HC-SR04 (x2)",
      "Servo SG90 (x2)",
      "Pin Li-Po 11.1V + sạc",
    ],
    safetyTemplate:
      "• An toàn pin Li-Po: lưu trữ trong túi chống cháy, không sạc khi nóng.\n" +
      "• AN TOÀN ĐIỆN: Pi 4 cần nguồn 5V/3A — không dùng adapter điện thoại.\n" +
      "• Camera/AI: tuân thủ quy tắc quyền riêng tư khi quay video.\n" +
      "• Robot di chuyển có camera AI: chạy thử ở khu vực rộng, không có vật cản dễ vỡ.",
    suitableGrades: ["THPT", "THPT Nghề"],
  },
];

export function getCT4Module(id: CT4ModuleId): CT4Module | undefined {
  return CT4_MODULES.find((m) => m.id === id);
}
