/**
 * lesson-content.ts
 * Lesson-specific content data for Audio, Presentation, and Video viewers.
 * Each viewer looks up content by lesson.id to render the appropriate material.
 */

/* ============================================================ */
/*  AUDIO TRANSCRIPTS (keyed by lesson id)                       */
/* ============================================================ */

export interface AudioTranscriptSegment {
  timeSec: number;
  text: string;
}

export interface AudioLessonContent {
  headerLabel: string;
  headerSubtitle: string;
  totalSec: number;
  bookmarks: { id: string; timePct: number; label: string }[];
  transcript: AudioTranscriptSegment[];
}

export const AUDIO_CONTENT: Record<string, AudioLessonContent> = {
  /* ── L03: CEO chia sẻ tầm nhìn (default — kept in AudioPlayer) ── */

  /* ── L09: Phỏng vấn GĐ Xi măng Thăng Long ── */
  L09: {
    headerLabel: "PHỎNG VẤN • AUDIO",
    headerSubtitle: "Nguyễn Đức Thành — GĐ Công ty CP Xi măng Thăng Long • 22:30",
    totalSec: 1350, // 22:30
    bookmarks: [
      { id: "ab09-1", timePct: 0, label: "Giới thiệu — Hành trình 15 năm Xi măng Thăng Long" },
      { id: "ab09-2", timePct: 11, label: "Quản lý sản xuất 3 ca liên tục" },
      { id: "ab09-3", timePct: 24, label: "An toàn lao động — Mục tiêu 0 tai nạn" },
      { id: "ab09-4", timePct: 40, label: "Đào tạo kỹ năng vận hành lò quay" },
      { id: "ab09-5", timePct: 58, label: "Chuyển đổi số nhà máy" },
      { id: "ab09-6", timePct: 75, label: "Quản lý chi phí nguyên vật liệu" },
      { id: "ab09-7", timePct: 89, label: "Bài học & lời khuyên cho lãnh đạo mới" },
    ],
    transcript: [
      { timeSec: 0, text: "MC: Chào anh Thành, cảm ơn anh đã dành thời gian cho buổi phỏng vấn hôm nay. Anh có thể chia sẻ hành trình 15 năm gắn bó với Xi măng Thăng Long được không ạ?" },
      { timeSec: 35, text: "Anh Thành: Tôi gia nhập Thăng Long từ 2011, khi nhà máy mới vận hành dây chuyền thứ hai. Lúc đó công suất chỉ 2.3 triệu tấn/năm, nay đã đạt 4.5 triệu tấn — gần gấp đôi." },
      { timeSec: 75, text: "Bước ngoặt lớn nhất là năm 2018 khi chúng tôi đầu tư hệ thống điều khiển tự động DCS — Distributed Control System. Toàn bộ quy trình từ nghiền nguyên liệu đến đóng bao đều được giám sát từ phòng điều khiển trung tâm." },
      { timeSec: 120, text: "MC: Với quy mô nhà máy hoạt động 24/7, anh quản lý sản xuất 3 ca liên tục như thế nào?" },
      { timeSec: 148, text: "Anh Thành: Đó là thách thức lớn nhất. Chúng tôi có 850 công nhân chia thành 3 ca, mỗi ca 8 tiếng. Bí quyết là xây dựng hệ thống giao ca chuẩn hóa — tôi gọi là 'Shift Handover Protocol'." },
      { timeSec: 195, text: "Mỗi cuối ca, tổ trưởng phải hoàn thành checklist 47 điểm kiểm tra. Nếu thiếu dù chỉ 1 mục, ca tiếp theo có quyền từ chối nhận bàn giao. Điều này buộc mọi người phải nghiêm túc." },
      { timeSec: 240, text: "Ngoài ra, tôi áp dụng hệ thống đánh giá hiệu suất ca real-time trên dashboard. Mỗi tổ trưởng đều thấy được OEE — Overall Equipment Effectiveness — của ca mình so với mục tiêu." },
      { timeSec: 290, text: "MC: Về an toàn lao động — ngành xi măng luôn có nhiều rủi ro. Chiến lược của anh để đạt mục tiêu 0 tai nạn là gì?" },
      { timeSec: 325, text: "Anh Thành: Mục tiêu 0 tai nạn nghe có vẻ lý tưởng, nhưng chúng tôi đã đạt được 1,247 ngày liên tiếp không có tai nạn nghiêm trọng — từ tháng 8/2022 đến nay." },
      { timeSec: 370, text: "Chìa khóa là văn hóa 'Stop Work Authority' — bất kỳ công nhân nào cũng có quyền dừng dây chuyền nếu phát hiện nguy cơ mất an toàn, không cần xin phép ai. Người dừng máy được khen thưởng, không bị phạt." },
      { timeSec: 420, text: "Chúng tôi cũng làm 'Safety Walk' hàng ngày — ban giám đốc phải đi thực tế xuống xưởng ít nhất 30 phút/ngày. Không phải để kiểm tra, mà để LẮNG NGHE. Công nhân kể cho bạn những gì báo cáo không thể hiện." },
      { timeSec: 475, text: "MC: Đào tạo vận hành lò quay — thiết bị cốt lõi nhất của nhà máy xi măng — anh tổ chức ra sao?" },
      { timeSec: 510, text: "Anh Thành: Lò quay là trái tim nhà máy. Dài 72 mét, nhiệt độ vùng nung 1,450°C. Một sai sót nhỏ có thể gây dừng lò 2-3 tuần, thiệt hại hàng chục tỷ đồng." },
      { timeSec: 555, text: "Chúng tôi xây dựng chương trình 'Master Kiln Operator' — mất 3 năm đào tạo mới đủ trình độ vận hành độc lập. Năm đầu: lý thuyết + quan sát. Năm hai: vận hành có giám sát. Năm ba: vận hành tự chủ + xử lý sự cố." },
      { timeSec: 605, text: "Hiện tại trên LMS Geleximco, chúng tôi đã số hóa toàn bộ quy trình vận hành lò quay thành 48 module e-learning. Công nhân có thể ôn tập trên điện thoại ngay tại xưởng." },
      { timeSec: 660, text: "MC: Nói về chuyển đổi số nhà máy — xu hướng Industry 4.0 — Thăng Long đã triển khai những gì?" },
      { timeSec: 695, text: "Anh Thành: Ba trụ cột chính: một là IoT sensors — 2,400 cảm biến gắn trên toàn bộ thiết bị, gửi dữ liệu mỗi 5 giây về cloud. Hai là AI predictive maintenance — dự đoán hỏng hóc trước 72 giờ." },
      { timeSec: 745, text: "Ba là digital twin — bản sao số hóa toàn bộ nhà máy. Kỹ sư có thể mô phỏng các kịch bản vận hành trước khi áp dụng thực tế. Giảm 35% thời gian dừng máy ngoài kế hoạch." },
      { timeSec: 800, text: "MC: Chi phí nguyên vật liệu chiếm tỷ trọng lớn. Anh quản lý chi phí thế nào trong bối cảnh giá biến động?" },
      { timeSec: 835, text: "Anh Thành: Nguyên liệu chính gồm đá vôi, đất sét, thạch cao, xỉ sắt. Đá vôi chúng tôi tự khai thác từ mỏ nên ổn định. Nhưng than và thạch cao phải nhập, giá biến động liên tục." },
      { timeSec: 885, text: "Chiến lược của tôi là 'Hedging + Alternative'. Ký hợp đồng dài hạn 6-12 tháng để lock giá. Song song, R&D liên tục tìm phụ gia thay thế — năm 2025 chúng tôi đã giảm 12% tiêu hao than nhờ tối ưu hóa tỷ lệ phối liệu." },
      { timeSec: 940, text: "Tôi cũng chia sẻ data chi phí lên dashboard chung của Tập đoàn — để các đơn vị khác như Hải Phòng Thermal, Khoáng sản có thể tham khảo và phối hợp mua chung." },
      { timeSec: 995, text: "MC: Cuối cùng, bài học và lời khuyên của anh dành cho các lãnh đạo mới tại Geleximco?" },
      { timeSec: 1030, text: "Anh Thành: Một là 'Go to Gemba' — hãy xuống hiện trường. Dữ liệu trên dashboard rất quan trọng, nhưng không thể thay thế việc tận mắt nhìn thấy vấn đề." },
      { timeSec: 1080, text: "Hai là 'Invest in People First'. Máy móc hiện đại đến mấy mà con người không biết vận hành thì vô nghĩa. Tôi dành 15% ngân sách vận hành cho đào tạo — cao hơn trung bình ngành." },
      { timeSec: 1135, text: "Ba là 'Standardize Everything'. Từ cách giao ca, cách báo cáo, cách xử lý sự cố — tất cả đều phải có SOP. Không có SOP thì không có cải tiến, vì bạn không biết đang cải tiến từ cái gì." },
      { timeSec: 1195, text: "Và cuối cùng, đừng ngại thất bại. Năm 2019 chúng tôi thử nghiệm nhiên liệu thay thế từ rác thải công nghiệp — thất bại hoàn toàn lần đầu. Nhưng rút kinh nghiệm, lần hai thành công, giờ tiết kiệm 8 tỷ/năm." },
      { timeSec: 1260, text: "MC: Cảm ơn anh Thành rất nhiều. Những chia sẻ thực tế từ Xi măng Thăng Long là bài học quý giá cho tất cả lãnh đạo trong hệ sinh thái Geleximco." },
      { timeSec: 1310, text: "Anh Thành: Cảm ơn chương trình. Hy vọng các đồng nghiệp sẽ tìm thấy điều hữu ích từ kinh nghiệm của Thăng Long. Chúng ta cùng xây dựng Geleximco ngày càng vững mạnh." },
    ],
  },
};


/* ============================================================ */
/*  PRESENTATION SLIDES (keyed by lesson id)                     */
/* ============================================================ */

export interface SlideData {
  num: number;
  type: "cover" | "toc" | "content" | "diagram" | "quote" | "chart" | "comparison" | "summary";
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  items?: string[];
  notes: string;
  diagramNodes?: { label: string; desc: string }[];
  quoteAuthor?: string;
  quoteRole?: string;
  chartBars?: { label: string; value: number; color: string }[];
  leftCol?: { heading: string; items: string[] };
  rightCol?: { heading: string; items: string[] };
  summaryItems?: { icon: string; label: string; value: string }[];
}

/* ── L10: OKR Framework cho Geleximco ── */
export const OKR_SLIDES: SlideData[] = [
  { num: 1, type: "cover", title: "OKR Framework\ncho Geleximco", subtitle: "Objectives & Key Results — Hệ thống quản trị mục tiêu", notes: "Slide mở đầu. OKR (Objectives & Key Results) đã được Google, Intel áp dụng thành công. Nay Geleximco triển khai cho 14 đơn vị thành viên." },
  { num: 2, type: "toc", title: "Nội dung trình bày", items: ["OKR là gì? Tại sao Geleximco cần OKR?", "Cấu trúc OKR: Objective vs Key Result", "OKR vs KPI — Khác biệt then chốt", "Quy trình thiết lập OKR tại Geleximco", "OKR cascade: Tập đoàn → Công ty → Phòng ban", "Ví dụ OKR thực tế cho 3 lĩnh vực", "Công cụ theo dõi OKR trên LMS", "Kế hoạch triển khai Q2-Q4/2026"], notes: "Tổng cộng 8 phần chính, dự kiến trình bày trong 40 phút. Phần 4-6 là trọng tâm với ví dụ thực tế." },
  { num: 3, type: "content", title: "OKR là gì?", content: "OKR — Objectives & Key Results — là phương pháp quản trị mục tiêu giúp tổ chức tập trung nguồn lực vào những điều quan trọng nhất. Mỗi Objective (mục tiêu) đi kèm 2-5 Key Results (kết quả then chốt) có thể đo lường được.", bullets: ["Objective: Định hướng, truyền cảm hứng, tham vọng", "Key Results: Cụ thể, đo lường được, có thời hạn", "Chu kỳ: Quarterly (hàng quý) — linh hoạt hơn KPI thường niên", "Scoring: 0.0 → 1.0, mục tiêu lý tưởng đạt 0.6-0.7 (stretch goal)"], notes: "OKR khác KPI ở tính tham vọng — không phạt khi chỉ đạt 70%. Mục tiêu là stretch, đẩy giới hạn." },
  { num: 4, type: "comparison", title: "OKR vs KPI — Khác biệt then chốt", leftCol: { heading: "KPI (Hiện tại)", items: ["Đo lường hiệu suất duy trì", "Top-down: cấp trên giao", "Chu kỳ dài: 6-12 tháng", "Gắn với đánh giá & lương thưởng", "Tập trung vào 'làm đúng việc cũ'"] }, rightCol: { heading: "OKR (Mới)", items: ["Hướng tới đột phá & tăng trưởng", "Bottom-up + Top-down kết hợp", "Chu kỳ ngắn: 1-3 tháng", "Không gắn trực tiếp với lương", "Tập trung vào 'tìm việc đúng để làm'"] }, notes: "Geleximco KHÔNG thay KPI bằng OKR. Hai hệ thống bổ trợ nhau: KPI cho vận hành, OKR cho đổi mới." },
  { num: 5, type: "diagram", title: "Cấu trúc OKR 3 cấp tại Geleximco", diagramNodes: [{ label: "Tập đoàn", desc: "3-5 OKR chiến lược" }, { label: "Công ty thành viên", desc: "3-4 OKR align lên Tập đoàn" }, { label: "Phòng ban", desc: "2-3 OKR gắn với đơn vị" }, { label: "Cá nhân", desc: "1-2 OKR phát triển" }, { label: "Review Quarterly", desc: "Check-in hàng tháng" }], notes: "Mô hình cascade 4 cấp. Tập đoàn ra OKR trước, các đơn vị align theo. Cá nhân có 50% OKR tự đề xuất." },
  { num: 6, type: "content", title: "Quy trình Thiết lập OKR", content: "Quy trình 5 bước để thiết lập OKR mỗi quý tại Geleximco, đảm bảo sự gắn kết từ Tập đoàn đến từng cá nhân.", bullets: ["Bước 1: Ban Giám đốc Tập đoàn công bố OKR chiến lược (Tuần 1)", "Bước 2: GĐ công ty thành viên draft OKR align (Tuần 2)", "Bước 3: Workshop liên phòng ban — đồng bộ OKR ngang (Tuần 3)", "Bước 4: Cá nhân đề xuất OKR, manager review & approve (Tuần 4)", "Bước 5: Kick-off quý mới, cam kết công khai trên LMS"], notes: "Toàn bộ quy trình hoàn thành trong 4 tuần. Tháng cuối quý cũ = tháng thiết lập OKR quý mới." },
  { num: 7, type: "chart", title: "Tỷ lệ áp dụng OKR tại các Tập đoàn lớn", chartBars: [{ label: "Google", value: 100, color: "#4285F4" }, { label: "Intel", value: 95, color: "#0071C5" }, { label: "Samsung VN", value: 78, color: "#1428A0" }, { label: "VNG", value: 65, color: "#f97316" }, { label: "FPT", value: 72, color: "#e74c3c" }, { label: "Geleximco\n(Mục tiêu)", value: 85, color: "#990803" }], notes: "Benchmark: các tập đoàn công nghệ đi đầu. Geleximco đặt mục tiêu 85% đơn vị áp dụng OKR vào cuối 2027." },
  { num: 8, type: "content", title: "Ví dụ OKR: ABBank (Tài chính-NH)", content: "Objective: Trở thành ngân hàng số hàng đầu trong hệ sinh thái Geleximco", bullets: ["KR1: Tăng số lượng khách hàng digital banking từ 500K lên 800K (Score: 0.75)", "KR2: Giảm thời gian xét duyệt khoản vay từ 5 ngày xuống 2 ngày (Score: 0.6)", "KR3: Ra mắt 3 sản phẩm tài chính mới phục vụ hệ sinh thái Geleximco (Score: 0.9)", "KR4: Đạt NPS (Net Promoter Score) ≥ 45 từ khách hàng nội bộ Tập đoàn (Score: 0.55)"], notes: "OKR mẫu cho ABBank. Lưu ý score 0.6-0.7 là tốt (stretch goal). KR3 đạt 0.9 có thể mục tiêu chưa đủ tham vọng." },
  { num: 9, type: "content", title: "Ví dụ OKR: Geleximco Land (BĐS)", content: "Objective: Phát triển KĐT kiểu mẫu về trải nghiệm sống bền vững", bullets: ["KR1: Đạt chứng chỉ xanh EDGE cho 100% dự án mới khởi công (Score: 0.5)", "KR2: Tăng tỷ lệ hài lòng cư dân từ 72% lên 88% (Score: 0.65)", "KR3: Giảm 20% chi phí vận hành KĐT qua chuyển đổi số (Score: 0.7)", "KR4: Triển khai app cư dân thông minh cho 5 KĐT hiện hữu (Score: 0.8)"], notes: "BĐS focus vào bền vững + trải nghiệm khách hàng. ESG là xu hướng bắt buộc cho ngành." },
  { num: 10, type: "content", title: "Ví dụ OKR: Xi măng Thăng Long (VLXD)", content: "Objective: Dẫn đầu ngành VLXD về hiệu suất sản xuất xanh", bullets: ["KR1: Giảm 15% phát thải CO₂ trên mỗi tấn clinker sản xuất (Score: 0.6)", "KR2: Đạt OEE (Overall Equipment Effectiveness) ≥ 88% trung bình năm (Score: 0.7)", "KR3: Hoàn thành chuyển đổi số 100% dây chuyền sản xuất (Score: 0.85)", "KR4: 0 tai nạn lao động nghiêm trọng — duy trì chuỗi 1,500 ngày (Score: 0.9)"], notes: "Xi măng Thăng Long là benchmark cho các đơn vị sản xuất. Anh Nguyễn Đức Thành chia sẻ chi tiết ở bài Audio trước." },
  { num: 11, type: "diagram", title: "OKR Check-in Monthly", diagramNodes: [{ label: "Tuần 1", desc: "Self-assessment" }, { label: "Tuần 2", desc: "1-on-1 với Manager" }, { label: "Tuần 3", desc: "Team sync & align" }, { label: "Cuối tháng", desc: "Update score trên LMS" }, { label: "Cuối quý", desc: "Review & Grading" }], notes: "Check-in hàng tháng là yếu tố quyết định thành công OKR. Không check-in = OKR chết trên giấy." },
  { num: 12, type: "quote", title: "Triết lý OKR", content: "Nếu mọi người đều tiến về phía trước cùng nhau, thì thành công sẽ tự đến. OKR giúp 6,610 con người của Geleximco cùng nhìn về một hướng.", quoteAuthor: "Ban Chiến lược Geleximco", quoteRole: "Adapted from Henry Ford", notes: "Trích dẫn truyền cảm hứng. Nhấn mạnh alignment — sức mạnh OKR là giúp mọi người cùng hướng." },
  { num: 13, type: "content", title: "Công cụ OKR trên LMS Geleximco", content: "Module OKR được tích hợp trực tiếp vào hệ thống LMS, cho phép quản lý toàn bộ lifecycle OKR từ thiết lập đến review.", bullets: ["Dashboard cá nhân: xem OKR mình + team + công ty", "Alignment Tree: visualize cách OKR cascade từ Tập đoàn", "Weekly Check-in: cập nhật tiến độ chỉ trong 5 phút", "AI Suggestion: GelBot gợi ý Key Results dựa trên dữ liệu lịch sử", "Notification: nhắc nhở check-in, deadline, và scoring"], notes: "LMS không chỉ là nơi học OKR mà còn là nơi THỰC HÀNH OKR. One platform, many purposes." },
  { num: 14, type: "chart", title: "Lộ trình Triển khai OKR tại 14 đơn vị", chartBars: [{ label: "Q2/2026\nPilot", value: 25, color: "#f97316" }, { label: "Q3/2026\nMở rộng", value: 45, color: "#eab308" }, { label: "Q4/2026\nScale", value: 65, color: "#22c55e" }, { label: "Q1/2027\nToàn bộ", value: 85, color: "#8b5cf6" }, { label: "Q2/2027\nTối ưu", value: 95, color: "#990803" }], notes: "% đơn vị áp dụng OKR. Pilot với ABBank, Geleximco Land, Thăng Long trước. Mở rộng dần theo từng quý." },
  { num: 15, type: "comparison", title: "OKR Tốt vs OKR Kém", leftCol: { heading: "OKR Kém ✗", items: ["'Tăng doanh thu' (không có KR cụ thể)", "'Làm tốt hơn quý trước' (không đo được)", "'Hoàn thành dự án X' (task, không phải outcome)", "Quá nhiều: 7-8 OKR cùng lúc", "Không review — viết xong bỏ đó"] }, rightCol: { heading: "OKR Tốt ✓", items: ["'Tăng doanh thu mảng số 30% → 150 tỷ'", "'NPS từ 38 lên 52 trong Q3'", "'Ra mắt app → 10K MAU tháng đầu'", "Tập trung: 3-4 OKR, 2-4 KR mỗi O", "Check-in weekly, scoring monthly"] }, notes: "Sai lầm phổ biến nhất: nhầm OKR với task list. OKR là OUTCOME (kết quả), không phải OUTPUT (sản phẩm)." },
  { num: 16, type: "content", title: "Vai trò của Lãnh đạo trong OKR", content: "OKR thành công hay thất bại phụ thuộc 80% vào sự cam kết của lãnh đạo. Không phải HR triển khai OKR, mà là CEO và GĐ đơn vị.", bullets: ["CEO/GĐ phải là người viết OKR ĐẦU TIÊN — làm gương cho toàn tổ chức", "Manager coaching OKR cho team — không phải chỉ giao rồi kiểm tra", "Tạo 'Safe Space' để thất bại: OKR stretch nghĩa là chấp nhận không đạt 100%", "Public & Transparent: OKR của mọi người đều công khai trên LMS"], notes: "Nếu GĐ không viết OKR, đừng mong team viết. Leading by example là nguyên tắc số 1." },
  { num: 17, type: "content", title: "Kế hoạch Hành động Q2-Q4/2026", content: "Lộ trình 3 quý để đưa OKR vào DNA của Geleximco, từ pilot đến scale toàn Tập đoàn.", bullets: ["Q2/2026: Đào tạo OKR Champion (50 người, 3 đơn vị pilot)", "Q2/2026: Workshop viết OKR cho toàn bộ cấp GĐ/PGĐ (14 đơn vị)", "Q3/2026: Go-live module OKR trên LMS, 6 đơn vị áp dụng", "Q4/2026: Review kết quả pilot, điều chỉnh framework, mở rộng lên 10 đơn vị", "2027: Toàn bộ 14 đơn vị, 34 phòng ban, 6,610 nhân sự trên hệ thống OKR"], notes: "Budget ước tính: 4.5 tỷ cho toàn bộ chương trình (đào tạo + tool + consulting). ROI kỳ vọng 5x." },
  { num: 18, type: "summary", title: "Tổng kết & Bước tiếp theo", summaryItems: [{ icon: "target", label: "Framework", value: "OKR Quarterly" }, { icon: "users", label: "Đối tượng", value: "6,610 nhân sự" }, { icon: "trending", label: "Pilot", value: "3 đơn vị Q2/2026" }, { icon: "award", label: "Mục tiêu", value: "85% áp dụng 2027" }], notes: "Slide kết thúc. Call to action: mỗi GĐ đơn vị hãy thử viết 1 OKR cho Q2/2026 và gửi lên LMS trong tuần tới." },
];


/* ============================================================ */
/*  VIDEO L12 — Tổng kết & Bài học Rút ra                       */
/* ============================================================ */

export interface VideoLessonContent {
  totalSec: number;
  chapters: { pct: number; label: string }[];
  timeComments: { id: string; pct: number; user: string; initials: string; text: string; time: string; likes: number }[];
  quizzes: {
    id: string;
    triggerPct: number;
    type: "single_choice" | "multiple_choice" | "true_false" | "fill_blank";
    question: string;
    options: string[];
    correctAnswers: number[];
    explanation: string;
    required: boolean;
    points: number;
  }[];
  subtitles: { startPct: number; endPct: number; text: string }[];
}

export const VIDEO_CONTENT: Record<string, VideoLessonContent> = {
  /* ── L12: Tổng kết & Bài học Rút ra ── */
  L12: {
    totalSec: 900, // 15:00
    chapters: [
      { pct: 0, label: "Mở đầu — Hành trình khóa học" },
      { pct: 5, label: "Tổng quan 4 Module & 12 bài học" },
      { pct: 10, label: "Recap Module 1: Tổng quan & Tầm nhìn" },
      { pct: 17, label: "Highlight: CEO chia sẻ 3 trụ cột đào tạo" },
      { pct: 22, label: "Recap Module 2: Lãnh đạo Chiến lược" },
      { pct: 28, label: "Highlight: Mô hình 5 cấp độ John Maxwell" },
      { pct: 33, label: "Case Study ABBank — Kết quả & Tác động" },
      { pct: 38, label: "Recap Module 3: Quản lý Thực chiến" },
      { pct: 43, label: "Highlight: Phỏng vấn GĐ Xi măng Thăng Long" },
      { pct: 48, label: "OKR Framework — Tóm tắt & Roadmap" },
      { pct: 53, label: "Recap Module 4: E-Learning & SCORM" },
      { pct: 58, label: "Bài học 1: Go to Gemba — Xuống hiện trường" },
      { pct: 62, label: "Bài học 2: People First — Đầu tư vào con người" },
      { pct: 66, label: "Bài học 3: Standardize Everything — Chuẩn hóa" },
      { pct: 70, label: "Bài học 4: OKR & Đo lường đột phá" },
      { pct: 74, label: "Bài học 5: Văn hóa Học tập Liên tục" },
      { pct: 78, label: "Kế hoạch Hành động Cá nhân (IDP 90 ngày)" },
      { pct: 84, label: "Template IDP — Hướng dẫn điền" },
      { pct: 90, label: "Lời kết — Cam kết & Hành động" },
      { pct: 95, label: "Thông tin chứng chỉ & Bước tiếp theo" },
    ],
    timeComments: [
      { id: "TC12-1", pct: 6, user: "Lê Minh Phương", initials: "LP", text: "Tóm tắt 4 module rất trực quan, dễ nhớ!", time: "1 ngày trước", likes: 8 },
      { id: "TC12-2", pct: 12, user: "Nguyễn Hoàng Sơn", initials: "NS", text: "Phần recap Module 1 gọn gàng, highlight đúng trọng tâm 👍", time: "2 ngày trước", likes: 14 },
      { id: "TC12-3", pct: 18, user: "Trần Thị Mai", initials: "TM", text: "3 trụ cột đào tạo — cần nhắc lại cho team mới onboard", time: "5 giờ trước", likes: 6 },
      { id: "TC12-4", pct: 28, user: "Hoàng Đức Thịnh", initials: "HT", text: "Case study ABBank ở Module 2 ấn tượng nhất với mình, áp dụng được ngay cho chi nhánh", time: "2 ngày trước", likes: 19 },
      { id: "TC12-5", pct: 35, user: "Phạm Văn Hải", initials: "PH", text: "NPL giảm 2.3% — con số thuyết phục. Data-driven decision making!", time: "1 ngày trước", likes: 11 },
      { id: "TC12-6", pct: 42, user: "Nguyễn Thu Hà", initials: "NH", text: "Phỏng vấn anh Thành (Xi măng Thăng Long) là highlight toàn khóa 👏", time: "3 giờ trước", likes: 27 },
      { id: "TC12-7", pct: 49, user: "Vũ Đình Quang", initials: "VQ", text: "OKR roadmap rất rõ — Q2/2026 pilot 3 đơn vị. Team mình cần chuẩn bị sớm", time: "4 giờ trước", likes: 9 },
      { id: "TC12-8", pct: 58, user: "Lê Thị Hương Giang", initials: "LG", text: "Go to Gemba — bài học đơn giản nhưng ít ai thực hành. Cần thay đổi mindset!", time: "1 ngày trước", likes: 16 },
      { id: "TC12-9", pct: 65, user: "Trần Quốc Bảo", initials: "TB", text: "5 bài học này nên in ra dán ở bàn làm việc luôn 📌", time: "5 giờ trước", likes: 13 },
      { id: "TC12-10", pct: 72, user: "Đặng Minh Tuấn", initials: "ĐT", text: "Standardize Everything — thiếu SOP thì không cải tiến được. Quá đúng!", time: "2 ngày trước", likes: 8 },
      { id: "TC12-11", pct: 80, user: "Phạm Thị Lan", initials: "PL", text: "IDP cá nhân — format rất rõ ràng, dễ follow. Đã tải template về rồi!", time: "1 ngày trước", likes: 10 },
      { id: "TC12-12", pct: 85, user: "Nguyễn Anh Khoa", initials: "NK", text: "3 mục tiêu 30-60-90 ngày rất thực tế, không bị overwhelming", time: "6 giờ trước", likes: 7 },
      { id: "TC12-13", pct: 91, user: "Hoàng Thị Thanh", initials: "HT", text: "Lời kết rất truyền cảm hứng. Cảm ơn đội ngũ đào tạo! 🎯", time: "3 giờ trước", likes: 22 },
      { id: "TC12-14", pct: 96, user: "Vũ Hoàng Nam", initials: "VN", text: "Khóa học tuyệt vời! Chứng chỉ có giá trị thực sự trong Tập đoàn 🎓", time: "2 giờ trước", likes: 35 },
      { id: "TC12-15", pct: 98, user: "Bùi Thanh Tùng", initials: "BT", text: "Đã đăng ký khóa tiếp theo: Quản lý Dự án Bất động sản. Mong chờ!", time: "1 giờ trước", likes: 5 },
    ],
    quizzes: [
      {
        id: "VQ12-1", triggerPct: 12, type: "single_choice",
        question: "Trong Module 1, CEO Geleximco nhấn mạnh 3 trụ cột đào tạo. Trụ cột nào KHÔNG thuộc 3 trụ cột chính?",
        options: ["Năng lực chuyên môn ngành", "Kỹ năng lãnh đạo", "Chuyển đổi số toàn diện", "Văn hóa doanh nghiệp thống nhất"],
        correctAnswers: [2], explanation: "3 trụ cột đào tạo Geleximco: (1) Chuyên môn ngành, (2) Kỹ năng lãnh đạo, (3) Văn hóa doanh nghiệp. Chuyển đổi số là phương tiện, không phải trụ cột đào tạo.",
        required: true, points: 10,
      },
      {
        id: "VQ12-2", triggerPct: 25, type: "single_choice",
        question: "Trong mô hình Lãnh đạo 5 cấp độ John Maxwell (Module 2), cấp độ nào dựa trên 'Năng suất' — người khác đi theo vì kết quả bạn đạt được?",
        options: ["Cấp 1: Vị trí (Position)", "Cấp 2: Sự cho phép (Permission)", "Cấp 3: Năng suất (Production)", "Cấp 4: Phát triển người khác (People Development)"],
        correctAnswers: [2], explanation: "Cấp 3 — Năng suất (Production): Người khác đi theo vì kết quả bạn mang lại cho tổ chức. Đây là cấp độ mà leader chứng minh năng lực qua thành tích thực tế.",
        required: true, points: 10,
      },
      {
        id: "VQ12-3", triggerPct: 36, type: "true_false",
        question: "Theo case study ABBank (Module 2), sau 18 tháng tái cấu trúc danh mục tín dụng, nợ xấu (NPL) giảm từ 4.2% xuống 1.9%, tương đương giảm 2.3 điểm phần trăm.",
        options: ["Đúng", "Sai"],
        correctAnswers: [0], explanation: "Đúng. ABBank áp dụng quy trình ra quyết định 6 bước để tái cấu trúc danh mục tín dụng, đạt kết quả ấn tượng: NPL giảm từ 4.2% xuống 1.9% trong 18 tháng.",
        required: true, points: 10,
      },
      {
        id: "VQ12-4", triggerPct: 45, type: "multiple_choice",
        question: "Từ bài phỏng vấn GĐ Xi măng Thăng Long (Module 3), những nguyên tắc quản lý nào anh Nguyễn Đức Thành đề cập? (Chọn tất cả đáp án đúng)",
        options: ["Go to Gemba — xuống hiện trường", "Invest in People First — đầu tư vào con người", "Move Fast, Break Things — tốc độ trên hoàn hảo", "Standardize Everything — chuẩn hóa mọi thứ", "Stop Work Authority — quyền dừng máy"],
        correctAnswers: [0, 1, 3, 4], explanation: "4 nguyên tắc đúng: Gemba, People First, Standardize, Stop Work Authority. 'Move Fast, Break Things' là triết lý của Facebook/Meta, không phù hợp với ngành sản xuất công nghiệp nặng.",
        required: true, points: 15,
      },
      {
        id: "VQ12-5", triggerPct: 55, type: "single_choice",
        question: "Module SCORM 'Quản lý Rủi ro Doanh nghiệp' (Module 4) mô phỏng tình huống tại công ty nào trong hệ sinh thái Geleximco?",
        options: ["ABBank — Rủi ro tín dụng", "Geleximco Land — Rủi ro dự án BĐS", "Xi măng Thăng Long — Rủi ro sản xuất", "Tất cả các tình huống trên"],
        correctAnswers: [3], explanation: "Module SCORM bao gồm 3 kịch bản mô phỏng từ 3 lĩnh vực khác nhau: rủi ro tín dụng (ABBank), rủi ro dự án (BĐS), và rủi ro sản xuất (Xi măng), giúp học viên thực hành đa dạng.",
        required: false, points: 10,
      },
      {
        id: "VQ12-6", triggerPct: 68, type: "fill_blank",
        question: "Hoàn thành: \"OKR khác KPI ở chỗ OKR tập trung vào ______, còn KPI tập trung vào duy trì hiệu suất.\"",
        options: ["Đột phá & tăng trưởng", "Kỷ luật & tuân thủ", "Tiết kiệm chi phí", "Đánh giá nhân sự"],
        correctAnswers: [0], explanation: "OKR hướng tới đột phá & tăng trưởng (stretch goals), trong khi KPI đo lường hiệu suất vận hành hiện tại. Hai hệ thống bổ trợ nhau tại Geleximco.",
        required: true, points: 15,
      },
      {
        id: "VQ12-7", triggerPct: 80, type: "multiple_choice",
        question: "Kế hoạch IDP (Individual Development Plan) 90 ngày gồm những mốc thời gian nào? (Chọn tất cả đáp án đúng)",
        options: ["30 ngày: Học & Hiểu — nắm framework lý thuyết", "45 ngày: Thử nghiệm pilot tại phòng ban", "60 ngày: Áp dụng — triển khai 1-2 công cụ vào công việc", "75 ngày: Đánh giá giữa kỳ với mentor", "90 ngày: Đánh giá & Chia sẻ — báo cáo kết quả cho team"],
        correctAnswers: [0, 2, 4], explanation: "IDP 90 ngày có 3 mốc chính: 30 ngày (Học & Hiểu), 60 ngày (Áp dụng), 90 ngày (Đánh giá & Chia sẻ). Mỗi mốc có KR cụ thể để đo lường tiến độ.",
        required: true, points: 15,
      },
      {
        id: "VQ12-8", triggerPct: 93, type: "true_false",
        question: "Sau khi hoàn thành khóa học 'Phát triển Năng lực Lãnh đạo', học viên cần đạt tối thiểu 70% điểm tổng kết và nộp IDP để nhận chứng chỉ.",
        options: ["Đúng", "Sai"],
        correctAnswers: [0], explanation: "Đúng. Điều kiện cấp chứng chỉ: (1) Hoàn thành 100% bài học, (2) Đạt ≥ 70% điểm tổng kết quiz & bài tập, (3) Nộp IDP 90 ngày được manager phê duyệt.",
        required: false, points: 10,
      },
    ],
    subtitles: [
      { startPct: 0, endPct: 3, text: "Chào mừng các bạn đến với phần tổng kết khóa học Phát triển Năng lực Lãnh đạo Geleximco." },
      { startPct: 3, endPct: 5, text: "Chúng ta đã cùng nhau đi qua một hành trình đào tạo đầy ý nghĩa trong suốt khóa học này." },
      { startPct: 5, endPct: 8, text: "Khóa học gồm 4 Module, 12 bài học, tổng thời lượng hơn 6 giờ — từ video, tài liệu, audio, đến SCORM tương tác." },
      { startPct: 8, endPct: 10, text: "Hãy cùng nhìn lại những điểm nổi bật và bài học quan trọng nhất từ mỗi module." },
      { startPct: 10, endPct: 14, text: "Module 1 — Giới thiệu tổng quan — đã giúp chúng ta hiểu tầm nhìn đào tạo của Tập đoàn với 3 trụ cột chính." },
      { startPct: 14, endPct: 17, text: "CEO Geleximco nhấn mạnh: Chuyên môn ngành, Kỹ năng lãnh đạo, và Văn hóa doanh nghiệp thống nhất." },
      { startPct: 17, endPct: 20, text: "Đặc biệt, trụ cột Văn hóa là yếu tố kết nối 14 công ty thành viên hoạt động trên 10 lĩnh vực khác nhau." },
      { startPct: 20, endPct: 22, text: "Sổ tay Khung Năng lực là tài liệu gối đầu giường — các bạn nên revisit thường xuyên." },
      { startPct: 22, endPct: 26, text: "Module 2 — Năng lực Lãnh đạo Chiến lược — tập trung vào mô hình 5 cấp độ John Maxwell." },
      { startPct: 26, endPct: 28, text: "Từ Vị trí → Sự cho phép → Năng suất → Phát triển người khác → Đỉnh cao. Mỗi cấp là nền tảng cho cấp tiếp theo." },
      { startPct: 28, endPct: 31, text: "Không thể có năng suất bền vững nếu thiếu nền tảng quan hệ. Đó là sai lầm phổ biến nhất của lãnh đạo mới." },
      { startPct: 31, endPct: 33, text: "Case study ABBank đã minh họa sống động cách áp dụng quy trình ra quyết định 6 bước." },
      { startPct: 33, endPct: 36, text: "Kết quả: nợ xấu giảm 2.3 điểm phần trăm sau 18 tháng — con số thuyết phục cho data-driven decision making." },
      { startPct: 36, endPct: 38, text: "Bài học từ ABBank: luôn bắt đầu bằng dữ liệu, tạo đồng thuận, rồi mới hành động." },
      { startPct: 38, endPct: 41, text: "Module 3 — Kỹ năng Quản lý Thực chiến — mang đến góc nhìn từ những người dẫn dắt hàng ngày." },
      { startPct: 41, endPct: 43, text: "Quản lý hiệu suất đội nhóm: KPI rõ ràng, phản hồi liên tục, và tạo động lực nội tại." },
      { startPct: 43, endPct: 46, text: "Phỏng vấn anh Nguyễn Đức Thành — GĐ Xi măng Thăng Long — là highlight của toàn bộ khóa học." },
      { startPct: 46, endPct: 48, text: "1,247 ngày không tai nạn nghiêm trọng, 850 công nhân 3 ca — quản lý nhà máy 24/7 ở đẳng cấp cao nhất." },
      { startPct: 48, endPct: 51, text: "OKR Framework — Objectives & Key Results — sẽ là hệ thống quản trị mục tiêu mới của toàn Tập đoàn." },
      { startPct: 51, endPct: 53, text: "Lộ trình: Q2/2026 pilot 3 đơn vị, mục tiêu 85% đơn vị áp dụng vào cuối 2027." },
      { startPct: 53, endPct: 56, text: "Module 4 — E-Learning Chuyên sâu — với SCORM mô phỏng quản lý rủi ro qua 3 kịch bản thực tế." },
      { startPct: 56, endPct: 58, text: "Giờ đây, hãy cùng đúc kết 5 bài học chính — những điều quan trọng nhất cần mang theo." },
      { startPct: 58, endPct: 62, text: "Bài học 1: Go to Gemba — Hãy xuống hiện trường. Dữ liệu trên dashboard không thay thế tận mắt nhìn thấy vấn đề." },
      { startPct: 62, endPct: 66, text: "Bài học 2: People First — Đầu tư vào con người trước. Máy móc hiện đại mà con người không biết vận hành thì vô nghĩa." },
      { startPct: 66, endPct: 70, text: "Bài học 3: Standardize Everything — Chuẩn hóa mọi thứ. Không có SOP thì không có cải tiến, vì không biết cải tiến từ đâu." },
      { startPct: 70, endPct: 74, text: "Bài học 4: OKR & Đo lường đột phá — Dám đặt mục tiêu stretch, chấp nhận đạt 70% cũng là thành công." },
      { startPct: 74, endPct: 78, text: "Bài học 5: Văn hóa Học tập Liên tục — Tổ chức học tập là tổ chức sống sót. Ngừng học là bắt đầu tụt hậu." },
      { startPct: 78, endPct: 82, text: "Bước tiếp theo: xây dựng Kế hoạch Phát triển Cá nhân — IDP 90 ngày." },
      { startPct: 82, endPct: 84, text: "IDP gồm 3 mốc: 30 ngày Học & Hiểu, 60 ngày Áp dụng, 90 ngày Đánh giá & Chia sẻ." },
      { startPct: 84, endPct: 87, text: "Mỗi mốc có 2-3 Key Results cụ thể. Template đã được upload lên thư viện tài nguyên LMS — hãy tải về ngay." },
      { startPct: 87, endPct: 90, text: "Manager trực tiếp sẽ review IDP của bạn trong vòng 1 tuần. Hãy chủ động book lịch 1-on-1." },
      { startPct: 90, endPct: 93, text: "Lời kết: 6,610 con người, 14 công ty, 10 lĩnh vực — nhưng chung một khát vọng phát triển." },
      { startPct: 93, endPct: 95, text: "Hãy biến những bài học hôm nay thành hành động ngay ngày mai. Kiến thức chỉ có giá trị khi được áp dụng." },
      { startPct: 95, endPct: 97, text: "Điều kiện chứng chỉ: hoàn thành 100% bài học, đạt ≥ 70% điểm quiz, và nộp IDP được phê duyệt." },
      { startPct: 97, endPct: 100, text: "Cảm ơn các bạn đã đồng hành. Hẹn gặp lại ở khóa tiếp theo — Quản lý Dự án Bất động sản! 🎓" },
    ],
  },
};