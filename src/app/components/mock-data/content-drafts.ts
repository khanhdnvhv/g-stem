/* ================================================================ */
/*  CONTENT DRAFTS — Bài giảng NCC tự biên soạn (Studio)           */
/*  Nguồn dữ liệu chia sẻ: ContentAuthoringStudio + Tab4 Configurator */
/* ================================================================ */

import type { StemProgram, CTMetadata } from "./types";

export type DraftStatus = "draft" | "review" | "published";

export interface DraftCard {
  id: string;
  title: string;
  program: StemProgram;
  grade: string;
  subject: string;
  durationMinutes: number;
  status: DraftStatus;
  updatedAt: string;
  phasesComplete: number;
  /** Optional CT-specific metadata — sẽ điền đầy đủ khi bài migrate sang LessonV2 */
  ctMetadata?: CTMetadata;
}

export const STUDIO_LESSONS: DraftCard[] = [
  {
    id: "D1",
    title: "Lập trình robot né vật cản — Bài 3",
    program: "CT4", grade: "THCS 8", subject: "Công nghệ",
    durationMinutes: 45, status: "draft", updatedAt: "2 giờ trước", phasesComplete: 2,
    ctMetadata: {
      type: "CT4",
      module: "robotics_1",
      language: "block",
      requiredHardware: ["Robot kit (mBot)", "Cảm biến siêu âm HC-SR04"],
      safetyNotes: "An toàn pin Li-Po, kiểm tra dây kết nối trước khi cấp nguồn.",
    },
  },
  {
    id: "D2",
    title: "Đòn bẩy và công cơ học — Liên môn Toán-Lý",
    program: "CT2", grade: "THCS 8", subject: "Vật lý",
    durationMinutes: 45, status: "draft", updatedAt: "Hôm qua", phasesComplete: 3,
    ctMetadata: {
      type: "CT2",
      drivingSubject: "Lý",
      integratedSubjects: ["Toán", "Công nghệ"],
      topic: "Đòn bẩy và công cơ học",
      sgkBooks: ["LY-8-KNTT/C1/L1.3"],
    },
  },
  {
    id: "D3",
    title: "NCKH: Nghiên cứu lọc nước từ thực vật",
    program: "CT5", grade: "THPT 11", subject: "Hóa học",
    durationMinutes: 60, status: "review", updatedAt: "3 ngày trước", phasesComplete: 4,
    ctMetadata: {
      type: "CT5",
      topicCode: "T01",
      leadStudent: "Nguyễn Văn An",
      mentorTeacher: "Cô Trần Thị Hoa",
      expectedDuration: "6m",
      researchQuestion: "Loại thực vật nào trong môi trường địa phương có khả năng lọc nước tốt nhất?",
      hypothesis: "Vỏ chuối + lục bình có khả năng lọc nước tốt hơn rau muống vì có cấu trúc xơ dày hơn.",
      methodology: "Thực nghiệm so sánh — đo TDS, độ đục, vi sinh trước/sau lọc.",
      expectedOutputs: ["paper", "competition"],
    },
  },
  {
    id: "D4",
    title: "Thiết kế cây xanh thông minh với IoT",
    program: "CT3", grade: "Tiểu học 5", subject: "STEM",
    durationMinutes: 45, status: "published", updatedAt: "1 tuần trước", phasesComplete: 4,
    ctMetadata: {
      type: "CT3",
      activityName: "Cây xanh thông minh",
      domain: "tin_hoc",
      finalProduct: "Mô hình chậu cây có cảm biến độ ẩm, LED báo khi cần tưới.",
      studentsPerGroup: 4,
    },
  },
  {
    id: "D5",
    title: "Cầu giấy chịu lực — Kỹ thuật tải trọng",
    program: "CT2", grade: "THCS 7", subject: "Toán",
    durationMinutes: 45, status: "draft", updatedAt: "5 ngày trước", phasesComplete: 1,
    ctMetadata: {
      type: "CT2",
      drivingSubject: "Toán",
      integratedSubjects: ["Mỹ thuật", "Công nghệ"],
      topic: "Cầu giấy chịu lực",
      sgkBooks: ["TOAN-7-CD/C1/L1.1"],
    },
  },
  {
    id: "D6",
    title: "Mô hình hệ mặt trời — Bài 2 Thiên văn",
    program: "CT1", grade: "Tiểu học 4", subject: "Tự nhiên",
    durationMinutes: 60, status: "published", updatedAt: "2 tuần trước", phasesComplete: 4,
    ctMetadata: {
      type: "CT1",
      subject: "Khoa học Tự nhiên",
      sgkBook: "TN-4-KNTT/C1/L1.2",
    },
  },
  {
    id: "D7",
    title: "Phân tích chất dinh dưỡng bằng smartphone",
    program: "CT5", grade: "THPT 12", subject: "Sinh học",
    durationMinutes: 90, status: "review", updatedAt: "4 ngày trước", phasesComplete: 3,
    ctMetadata: {
      type: "CT5",
      topicCode: "T04",
      leadStudent: "Lê Minh Hằng",
      mentorTeacher: "Thầy Phạm Văn Đức",
      expectedDuration: "1y",
      researchQuestion: "Có thể dùng smartphone camera để đánh giá hàm lượng chất dinh dưỡng cơ bản trong rau quả không?",
      methodology: "Train mô hình computer vision phân loại + đối chiếu với phương pháp chuẩn (HPLC).",
      expectedOutputs: ["paper", "poster", "competition"],
    },
  },
  {
    id: "D8",
    title: "Nhà thông minh Arduino — Mô đun 1",
    program: "CT4", grade: "THCS 9", subject: "Tin học",
    durationMinutes: 45, status: "draft", updatedAt: "6 ngày trước", phasesComplete: 2,
    ctMetadata: {
      type: "CT4",
      module: "iot",
      language: "arduino_c",
      requiredHardware: ["Arduino UNO R3", "DHT11", "Module relay 5V", "LED 3 màu"],
      safetyNotes: "An toàn điện 5V, kiểm tra cực + / − trước khi cắm.",
    },
  },
];
