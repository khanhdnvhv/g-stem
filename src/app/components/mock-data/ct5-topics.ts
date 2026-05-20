/* ================================================================ */
/*  CT5 TOPICS — 18 chủ đề Nghiên cứu khoa học                       */
/*  Nguồn: Cautruc chuong trinh Geleximco.xlsx — sheet CT5           */
/*  (Excel skeleton chỉ có "Chủ đề 1-18" — dưới đây là placeholder   */
/*   chủ đề thực tế phổ biến trong các hội thi KH-KT cấp tỉnh/QG)    */
/* ================================================================ */

export type CT5Duration = "3m" | "6m" | "1y" | "2y";

export interface CT5Topic {
  id: string;
  name: string;
  description: string;
  field: string;
  suitableGrades: string[];
  estimatedDuration: CT5Duration;
  defaultMethodology: string;
  exampleOutputs: string[];
}

export const CT5_TOPICS: CT5Topic[] = [
  {
    id: "T01",
    name: "Lọc nước từ thực vật bản địa",
    description: "Nghiên cứu khả năng lọc nước của các loại thực vật phổ biến (rau muống, lục bình, vỏ chuối, v.v.) so sánh với hệ thống lọc thương mại.",
    field: "Hoá học - Sinh học",
    suitableGrades: ["THCS", "THPT"],
    estimatedDuration: "6m",
    defaultMethodology: "Thực nghiệm so sánh — đo TDS, độ đục, vi sinh trước/sau lọc.",
    exampleOutputs: ["Hệ lọc nước prototype", "Bài báo KH cấp tỉnh", "Poster hội thi"],
  },
  {
    id: "T02",
    name: "Hệ thống giám sát chất lượng không khí học đường",
    description: "Thiết kế và triển khai hệ thống IoT đo PM2.5, CO2, nhiệt độ, độ ẩm tại lớp học để cảnh báo phụ huynh.",
    field: "IoT - Kỹ thuật",
    suitableGrades: ["THPT", "THPT Nghề"],
    estimatedDuration: "6m",
    defaultMethodology: "Phát triển sản phẩm + thực nghiệm tại trường — ESP32 + cảm biến + dashboard web.",
    exampleOutputs: ["Prototype IoT", "Dashboard real-time", "Báo cáo so sánh chuẩn QCVN"],
  },
  {
    id: "T03",
    name: "Đánh giá ảnh hưởng vi khuẩn lactic đến nem chua truyền thống",
    description: "Nghiên cứu vai trò của các chủng vi khuẩn lactic trong quá trình lên men nem chua VN.",
    field: "Sinh học - Công nghệ sinh học",
    suitableGrades: ["THPT"],
    estimatedDuration: "1y",
    defaultMethodology: "Nuôi cấy vi sinh + đo độ acid + cảm quan + so sánh nhóm đối chứng.",
    exampleOutputs: ["Báo cáo NCKH", "Bài báo trong tạp chí trường", "Hội thi KH-KT cấp QG"],
  },
  {
    id: "T04",
    name: "Ứng dụng AI nhận diện bệnh trên lá cây nông nghiệp",
    description: "Train mô hình computer vision phát hiện bệnh phổ biến trên lúa/cà phê/rau từ ảnh smartphone.",
    field: "AI - Nông nghiệp",
    suitableGrades: ["THPT"],
    estimatedDuration: "1y",
    defaultMethodology: "Thu thập dataset + train CNN (Teachable Machine / TensorFlow) + thử nghiệm thực địa.",
    exampleOutputs: ["Mobile app", "Mô hình AI", "Báo cáo accuracy benchmark"],
  },
  {
    id: "T05",
    name: "Khảo sát thói quen sử dụng nhựa của học sinh THCS",
    description: "Khảo sát + đề xuất giải pháp giảm rác thải nhựa trong trường học.",
    field: "Xã hội - Môi trường",
    suitableGrades: ["THCS", "THPT"],
    estimatedDuration: "3m",
    defaultMethodology: "Khảo sát định lượng + định tính — phỏng vấn + bảng hỏi + phân tích thống kê.",
    exampleOutputs: ["Báo cáo khảo sát", "Đề xuất chính sách trường", "Poster"],
  },
  {
    id: "T06",
    name: "Tối ưu hoá năng lượng pin mặt trời mini",
    description: "So sánh hiệu suất các loại pin mặt trời mini ở các điều kiện chiếu sáng khác nhau, đề xuất tối ưu cho điều kiện VN.",
    field: "Vật lý - Năng lượng",
    suitableGrades: ["THPT"],
    estimatedDuration: "6m",
    defaultMethodology: "Thực nghiệm vật lý — đo công suất ra theo điều kiện môi trường.",
    exampleOutputs: ["Dataset hiệu suất", "Đề xuất tối ưu", "Bài báo KH"],
  },
  {
    id: "T07",
    name: "Chế tạo robot phân loại rác tự động",
    description: "Thiết kế robot kết hợp AI nhận diện và cơ cấu cơ khí để phân loại rác hữu cơ/nhựa/kim loại.",
    field: "Robotics + AI",
    suitableGrades: ["THPT"],
    estimatedDuration: "1y",
    defaultMethodology: "Phát triển sản phẩm — design → prototype → test → iterate.",
    exampleOutputs: ["Robot prototype", "Mô hình AI nhận diện", "Hội thi KH-KT QG"],
  },
  {
    id: "T08",
    name: "Nghiên cứu phương pháp dạy STEM hiệu quả cấp THCS",
    description: "Khảo sát phương pháp dạy STEM tại các trường THCS, so sánh hiệu quả với phương pháp truyền thống.",
    field: "Giáo dục - Khoa học XH",
    suitableGrades: ["THPT"],
    estimatedDuration: "6m",
    defaultMethodology: "Khảo sát + phỏng vấn + thực nghiệm so sánh nhóm.",
    exampleOutputs: ["Báo cáo nghiên cứu", "Đề xuất phương pháp"],
  },
  {
    id: "T09",
    name: "Đo nồng độ vi nhựa trong nước sông địa phương",
    description: "Lấy mẫu nước sông tại địa phương, đo nồng độ vi nhựa (microplastic) qua kính hiển vi.",
    field: "Hoá học - Môi trường",
    suitableGrades: ["THPT"],
    estimatedDuration: "6m",
    defaultMethodology: "Lấy mẫu + lọc + đo dưới kính hiển vi + thống kê.",
    exampleOutputs: ["Báo cáo môi trường", "Bài báo cấp tỉnh"],
  },
  {
    id: "T10",
    name: "Ảnh hưởng âm nhạc đến hiệu suất học tập",
    description: "Thực nghiệm xem các loại âm nhạc khác nhau ảnh hưởng thế nào đến tốc độ + chính xác làm bài tập.",
    field: "Tâm lý - Khoa học XH",
    suitableGrades: ["THCS", "THPT"],
    estimatedDuration: "3m",
    defaultMethodology: "Thực nghiệm có nhóm đối chứng — đo thời gian + điểm số.",
    exampleOutputs: ["Báo cáo thực nghiệm", "Poster"],
  },
  {
    id: "T11",
    name: "Phát triển ứng dụng nhắc nhở uống nước thông minh",
    description: "Thiết kế app nhắc nhở uống nước dựa trên hoạt động cá nhân + thời tiết, có IoT bottle integration.",
    field: "Lập trình - IoT",
    suitableGrades: ["THPT", "THPT Nghề"],
    estimatedDuration: "6m",
    defaultMethodology: "Agile development — sprint planning, user testing.",
    exampleOutputs: ["Mobile app", "Smart bottle prototype"],
  },
  {
    id: "T12",
    name: "So sánh sinh trưởng rau theo phương pháp thuỷ canh",
    description: "Thực nghiệm trồng rau thuỷ canh so với đất truyền thống, đo sinh trưởng + dinh dưỡng.",
    field: "Sinh học - Nông nghiệp",
    suitableGrades: ["THCS", "THPT"],
    estimatedDuration: "3m",
    defaultMethodology: "Thực nghiệm sinh học có nhóm đối chứng — đo chiều cao, sinh khối, hàm lượng vit C.",
    exampleOutputs: ["Báo cáo thực nghiệm", "Hệ thuỷ canh tự chế"],
  },
  {
    id: "T13",
    name: "Nghiên cứu vật liệu cách nhiệt từ phế phẩm nông nghiệp",
    description: "Chế tạo vật liệu cách nhiệt từ vỏ trấu, xơ dừa, rơm — so sánh với vật liệu thương mại.",
    field: "Vật liệu - Kỹ thuật",
    suitableGrades: ["THPT", "THPT Nghề"],
    estimatedDuration: "6m",
    defaultMethodology: "Thực nghiệm vật liệu — đo dẫn nhiệt, độ bền, chi phí.",
    exampleOutputs: ["Sản phẩm vật liệu", "Báo cáo so sánh"],
  },
  {
    id: "T14",
    name: "Phát hiện cảm xúc qua giọng nói bằng AI",
    description: "Train mô hình ML phân tích cảm xúc (vui/buồn/giận/lo) từ giọng nói tiếng Việt.",
    field: "AI - NLP",
    suitableGrades: ["THPT"],
    estimatedDuration: "1y",
    defaultMethodology: "Thu thập audio dataset + train RNN/transformer + đánh giá accuracy.",
    exampleOutputs: ["Mô hình AI", "Demo realtime", "Báo cáo accuracy"],
  },
  {
    id: "T15",
    name: "Thiết kế máy phân loại trái cây theo kích thước",
    description: "Chế tạo máy cơ khí + cảm biến phân loại táo/cam/chanh theo kích thước.",
    field: "Cơ khí - Tự động hoá",
    suitableGrades: ["THPT Nghề"],
    estimatedDuration: "6m",
    defaultMethodology: "Thiết kế cơ khí (CAD) + lập trình điều khiển + test prototype.",
    exampleOutputs: ["Máy prototype", "Bản vẽ CAD", "Báo cáo hiệu suất"],
  },
  {
    id: "T16",
    name: "Khảo sát thực trạng sử dụng smartphone trong học tập",
    description: "Khảo sát học sinh THCS/THPT về thói quen smartphone, đề xuất hướng dẫn sử dụng lành mạnh.",
    field: "Xã hội học",
    suitableGrades: ["THCS", "THPT"],
    estimatedDuration: "3m",
    defaultMethodology: "Khảo sát định lượng + định tính.",
    exampleOutputs: ["Báo cáo khảo sát", "Đề xuất chính sách"],
  },
  {
    id: "T17",
    name: "Phân tích di sản kiến trúc địa phương qua GIS",
    description: "Sử dụng GIS để bản đồ hoá + phân tích các di sản kiến trúc tại địa phương.",
    field: "Địa lý - Lịch sử",
    suitableGrades: ["THPT"],
    estimatedDuration: "6m",
    defaultMethodology: "Khảo sát thực địa + GIS mapping + phân tích thống kê.",
    exampleOutputs: ["GIS map", "Báo cáo địa lý lịch sử"],
  },
  {
    id: "T18",
    name: "Nghiên cứu thuốc trừ sâu tự nhiên từ thực vật bản địa",
    description: "Chiết xuất + thử nghiệm hiệu quả của các loại thực vật (sả, neem, ớt) làm thuốc trừ sâu sinh học.",
    field: "Hoá - Sinh - Nông nghiệp",
    suitableGrades: ["THPT"],
    estimatedDuration: "1y",
    defaultMethodology: "Chiết xuất + thử nghiệm sinh học có đối chứng.",
    exampleOutputs: ["Sản phẩm chiết xuất", "Báo cáo hiệu quả", "Bài báo KH"],
  },
];

export function getCT5Topic(id: string): CT5Topic | undefined {
  return CT5_TOPICS.find((t) => t.id === id);
}

export function findCT5TopicsByGrade(grade: string): CT5Topic[] {
  return CT5_TOPICS.filter((t) =>
    t.suitableGrades.some((g) => grade.startsWith(g))
  );
}
