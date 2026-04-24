# KẾ HOẠCH CHUYỂN ĐỔI LMS GELEXIMCO → "HỆ SINH THÁI GIÁO DỤC STEM GELEXIMCO"

> **Phiên bản:** 1.0
> **Ngày lập:** 2026-04-24
> **Nguồn yêu cầu:** `STEM Geleximco.docx` (toàn văn + 6 infographic)
> **Nguồn hệ thống:** `F:\PTSP-VHV\Claudevhv\Quản lý STEM\Xây dựng hệ thống LMS`
> **Mục tiêu:** customize lại toàn bộ giao diện hệ thống LMS nội bộ hiện có của Geleximco thành nền tảng quản trị hệ sinh thái giáo dục STEM đa phân hệ, đa khách thuê (multi-tenant).
> **Mức độ chi tiết:** đủ để đội phát triển dùng làm tài liệu tham chiếu triển khai, không cần đọc lại tài liệu gốc khi code.

---

## Mục lục

1. [Bối cảnh & Mục tiêu chuyển đổi](#1-bối-cảnh--mục-tiêu-chuyển-đổi)
2. [Bảy phân hệ cốt lõi — đặc tả chi tiết](#2-bảy-phân-hệ-cốt-lõi--đặc-tả-chi-tiết)
3. [Tính năng xuyên suốt (Cross-cutting capabilities)](#3-tính-năng-xuyên-suốt-cross-cutting-capabilities)
4. [Khảo sát codebase hiện tại](#4-khảo-sát-codebase-hiện-tại)
5. [Ma trận quyết định từng component](#5-ma-trận-quyết-định-từng-component)
6. [Component mới cần xây dựng](#6-component-mới-cần-xây-dựng)
7. [Kiến trúc thông tin (Information Architecture)](#7-kiến-trúc-thông-tin-information-architecture)
8. [Mô hình dữ liệu & mock data](#8-mô-hình-dữ-liệu--mock-data)
9. [Hệ thống thị giác (Branding & Design System)](#9-hệ-thống-thị-giác-branding--design-system)
10. [Ma trận phân quyền (RBAC Matrix)](#10-ma-trận-phân-quyền-rbac-matrix)
11. [Kế hoạch triển khai theo Phase (có Checklist & DoD)](#11-kế-hoạch-triển-khai-theo-phase-có-checklist--dod)
12. [User Journeys nghiệm thu](#12-user-journeys-nghiệm-thu)
13. [Tiêu chí chất lượng & Kiểm thử](#13-tiêu-chí-chất-lượng--kiểm-thử)
14. [Rủi ro & Biện pháp giảm nhẹ](#14-rủi-ro--biện-pháp-giảm-nhẹ)
15. [Deliverables](#15-deliverables)
16. [Ước lượng khối lượng](#16-ước-lượng-khối-lượng)
17. [Phụ lục](#17-phụ-lục)

---

## 1. Bối cảnh & Mục tiêu chuyển đổi

### 1.1. Hệ thống hiện tại
- **Tên hiện tại:** Geleximco LMS (Learning Management System nội bộ).
- **Mục đích:** Đào tạo nội bộ cho nhân sự 14 công ty thành viên Tập đoàn Geleximco (ABBank, ABS, Bảo hiểm AAA, Xi măng Thăng Long, Khoáng sản, Nhiệt điện, BĐS KĐT Lê Trọng Tấn/An Khánh/Dương Nội, KCN Quang Minh, Geleximco TM & XNK, Geleximco Giáo dục…).
- **Vai trò hiện tại:** 3 role — `admin` / `instructor` / `learner`.
- **Nội dung hiện tại:** 18 danh mục khóa học doanh nghiệp (lãnh đạo, ATVSLĐ, tuân thủ pháp luật, nghiệp vụ ngân hàng, an toàn mỏ, ESG…).

### 1.2. Hệ thống mục tiêu
- **Tên mới:** Geleximco STEM Platform — "Hệ sinh thái Giáo dục STEM Geleximco".
- **Mô hình kinh doanh:** SaaS B2B2C đa khách thuê (multi-tenant) phục vụ ngành giáo dục phổ thông.
- **Tập khách hàng:**
  - **B2B:** Nhà cung cấp (Geleximco), Đại lý, Cơ quan quản lý nhà nước (Sở/Bộ GD&ĐT).
  - **B2C:** Trường học, Giáo viên, Học sinh.
- **Phạm vi cấp học:** Mầm non → THPT Nghề.
- **Chuẩn tham chiếu:** Sách giáo khoa của Bộ GD&ĐT; Thông tư báo cáo của Bộ GD&ĐT; CSDL ngành giáo dục quốc gia; VNeID; nguyên tắc dữ liệu "Đúng – Đủ – Sạch – Sống".

### 1.3. So sánh ngắn gọn

| Chiều | LMS hiện tại | STEM Platform |
|---|---|---|
| Mô hình | Training nội bộ 1 tập đoàn | SaaS ngành giáo dục đa khách thuê |
| Vai trò | 3 role | 7+ role × 4 loại tenant |
| Khóa học | Đào tạo corporate | 5 chương trình STEM chuẩn (CT1–CT5) |
| Vật lý | Không quản lý thiết bị | 3 gói phòng STEM + warranty + license |
| Thương mại | Không | Đơn hàng, hợp đồng, kho ảo, đối soát hoa hồng |
| Giám sát | Nội bộ Tập đoàn | Sở/Bộ GD&ĐT + CSDL quốc gia |
| AI | Chatbot "GelBot" hỗ trợ | AI-Buddy (tutor + chấm thi + phân tích) |

### 1.4. Nguyên tắc thiết kế ràng buộc
- **Giữ lại 100% stack kỹ thuật:** React 18 + Vite 6 + TypeScript + TailwindCSS v4 + Radix UI + React Router 7 + Recharts + react-dnd + react-hook-form + lucide-react + sonner.
- **Giữ lại brand palette đỏ Geleximco (`#990803`) và vàng (`#c8a84e`);** mở rộng thêm tokens STEM (xanh công nghệ, xanh phòng lab, tím đổi mới, cam cảnh báo).
- **Tái sử dụng tối đa các component hiện có** (Radix primitives, Layout, AuthContext, ChatbotPanel, GlobalSearch, theme system, dark mode).
- **Tạo namespace rõ ràng theo phân hệ** trong route để thuận lợi RBAC.
- **Tất cả text UI dùng tiếng Việt** (hệ thống sẽ phục vụ giáo dục Việt Nam).
- **Responsive full spectrum** mobile / tablet / desktop và hỗ trợ dark mode toàn bộ trang mới.

---

## 2. Bảy phân hệ cốt lõi — đặc tả chi tiết

Cột "Tính năng" dưới đây được trích nguyên văn từ bảng mô tả trong tài liệu gốc `STEM Geleximco.docx`.

### 2.1. Phân hệ Nhà cung cấp (Supplier — Geleximco)

| Nhóm | Tên tính năng | Mô tả chi tiết |
|---|---|---|
| 1. Quản lý Sản phẩm & Giải pháp | Quản lý gói phòng học STEM | Cấu hình và đóng gói các loại phòng học (Tối thiểu / Cơ bản / Nâng cao) linh hoạt cho mọi cấp học từ Mầm non đến THPT Nghề. |
| | Khai báo tham số động tiêu chí phòng | Cho phép tùy chỉnh các tiêu chí cấu thành gói phòng: thiết kế cơ sở vật chất, thiết bị thông minh, nội thất chuyên dụng, dịch vụ trang trí. |
| | Cập nhật thông tin truyền thông | Quản lý thông tin giới thiệu, hình ảnh, video demo và giá tham khảo cho từng gói sản phẩm. |
| 2. Quản lý Nội dung & Đào tạo | Quản lý chương trình học STEM | Phân loại và quản trị tài nguyên học tập theo 5 chương trình chuẩn (CT1–CT5), gắn kết với SGK của Bộ GD&ĐT. |
| | Quản lý tài liệu & Tập huấn | Hệ thống hóa tài liệu cho học sinh/giáo viên, quản lý hệ sinh thái các kỳ thi STEM và điều phối các chương trình tập huấn, đồng hành dài hạn. |
| 3. Quản lý Phần mềm & Giấy phép | Cấp phát bộ cài & License | Phân phối các bộ cài đặt phần mềm STEM trực tiếp lên thiết bị và quản lý, cấp quyền giấy phép tương ứng với từng hợp đồng. |
| 4. Quản lý Vận hành & Hậu mãi | Quản lý đơn hàng đặt mua | Tiếp nhận, kiểm soát trạng thái đơn hàng mua gói STEM từ kênh phân phối hoặc trường học, hỗ trợ tạo đơn thủ công. |
| | Quản lý bảo hành thiết bị | Tiếp nhận yêu cầu báo lỗi, theo dõi tình trạng hỏng hóc và điều phối quy trình bảo hành/sửa chữa thiết bị STEM vật lý. |
| 5. Phân tích & Báo cáo | Thống kê hiệu quả giảng dạy | Đo lường, tổng hợp dữ liệu và xuất báo cáo về mức độ tương tác, kết quả học/thi STEM và hiệu quả triển khai thực tế tại các điểm trường. |

### 2.2. Phân hệ Trường học (School)

| Nhóm | Tên tính năng | Mô tả chi tiết |
|---|---|---|
| 1. Quản lý Mua sắm & Đầu tư | Đặt mua gói phòng học STEM | Xem chi tiết, giá tham khảo và trực tiếp đặt mua các gói phòng STEM từ nhà cung cấp. |
| 2. Quản lý Cơ sở vật chất | Quản lý tình trạng thiết bị | Theo dõi danh sách, số lượng, lịch sử sử dụng và đánh giá tình trạng hiện tại của các trang thiết bị, vật tư phòng lab STEM tại trường. |
| | Báo lỗi và yêu cầu bảo hành | Ghi nhận các sự cố, hỏng hóc hoặc mất mát thiết bị và gửi yêu cầu bảo hành trực tiếp lên hệ thống của nhà cung cấp. |
| 3. Quản lý Đào tạo & Học tập | Quản lý lịch học STEM | Lên kế hoạch, sắp xếp thời khóa biểu và phân bổ lịch sử dụng phòng học STEM cho các tiết học hoặc câu lạc bộ ngoại khóa. |
| | Quản lý tài khoản & License | Quản lý hồ sơ giáo viên, học sinh; cấp phát hoặc thu hồi giấy phép sử dụng phần mềm học tập. |
| 4. Thống kê & Báo cáo | Đánh giá hiệu quả giảng dạy | Theo dõi kết quả học tập, điểm thi STEM của học sinh và trích xuất báo cáo thống kê nhằm đo lường chất lượng, hiệu quả triển khai mô hình STEM tại trường. |

### 2.3. Phân hệ Đại lý (Distributor/Agent)

| Nhóm | Tên tính năng | Mô tả chi tiết |
|---|---|---|
| 1. Quản lý Kinh doanh & Vận hành | Quản lý đơn hàng gói STEM | Theo dõi danh sách và cập nhật trạng thái các đơn đặt hàng gói giải pháp STEM từ các trường học. |
| | Quản lý hợp đồng STEM | Lưu trữ, theo dõi tiến độ và quản lý các điều khoản của các hợp đồng cung cấp dịch vụ và thiết bị đã ký kết với khách hàng. |
| 2. Quản lý Kho vận (Logistics) | Quản lý tồn kho (Kho ảo) | Quản lý hàng hóa qua cơ chế "kho ảo" không cần vận hành kho vật lý; hệ thống tự động trừ tồn kho ảo khi phát sinh đơn hàng giao cho trường. |
| 3. Quản lý Tài chính & Đối soát | Báo cáo doanh thu | Theo dõi doanh số, trích xuất số liệu kinh doanh theo định kỳ để nắm bắt tình hình bán hàng thực tế. |
| | Đối soát hoa hồng | Tiếp nhận, kiểm tra và xác nhận các biên bản đối soát doanh thu từ nhà cung cấp để nhận chiết khấu, hoa hồng. |
| 4. Quản lý Khách hàng (CRM) | Quản lý thông tin khách hàng | Lưu trữ, phân loại và quản lý cơ sở dữ liệu chi tiết các trường học, tổ chức giáo dục đang hợp tác. |
| | Chăm sóc khách hàng | Thực hiện các quy trình chăm sóc khách hàng định kỳ, tiếp nhận phản hồi và duy trì mối quan hệ xuyên suốt quá trình cung cấp giải pháp. |

### 2.4. Phân hệ Cơ quan Quản lý (Authority — Sở/Bộ GD&ĐT)

| Nhóm | Tên tính năng | Mô tả chi tiết |
|---|---|---|
| 1. Giám sát & Điều hành (Dashboard) | Xem bức tranh tổng quan giáo dục | Dashboard trực quan về toàn ngành giáo dục trên địa bàn, bao gồm biến động nhân sự (GV, HS) và chất lượng học tập STEM để phục vụ chỉ đạo, điều hành. |
| 2. Quản lý Cơ sở vật chất & Thiết bị | Giám sát tình trạng thiết bị | Theo dõi số lượng, giá trị, tình trạng sử dụng và tỷ lệ thiết bị đạt chuẩn/chưa đạt chuẩn tại các trường trực thuộc. |
| | Thống kê chi phí mua sắm | Thống kê chi phí đầu tư thiết bị theo từng khối trường và theo nguồn kinh phí (ngân sách, học phí, xã hội hóa) để làm căn cứ lập dự toán. |
| 3. Quản trị & Liên thông Dữ liệu | Đồng bộ CSDL Quốc gia | Cổng giao tiếp tích hợp, đồng bộ và đối soát dữ liệu tự động với Hệ thống CSDL ngành giáo dục, VNeID và các nền tảng quản trị khác. |
| | Quản lý danh mục dùng chung | Quản lý và chuẩn hóa các danh mục dùng chung (môn học, cấp học, trường học, chuẩn kỹ năng) đảm bảo tính thống nhất. |
| 4. Báo cáo & Tuân thủ | Kết xuất báo cáo theo chuẩn Bộ GD&ĐT | Tự động tổng hợp biểu mẫu báo cáo động, biểu đồ thống kê về tình hình triển khai STEM và sử dụng thiết bị đáp ứng đầy đủ các Thông tư, quy chuẩn báo cáo định kỳ của Bộ GD&ĐT. |

### 2.5. Phân hệ Học sinh (Student)

| Nhóm | Tên tính năng | Mô tả chi tiết |
|---|---|---|
| 1. Quản lý Lịch học | Xem thời khóa biểu STEM | Theo dõi thời khóa biểu cá nhân; hệ thống tự động cập nhật và hiển thị các tiết học STEM nếu nhà trường đã đặt mua gói giải pháp. |
| 2. Học tập & Tương tác | Tham gia bài giảng STEM | Truy cập vào nền tảng trên thiết bị để theo dõi, học tập và tương tác với các bài giảng STEM đã được phân bổ. |
| 3. Khảo thí & Đánh giá | Tham gia kỳ thi STEM | Truy cập và tham gia vào hệ sinh thái các kỳ thi STEM trực tuyến để thực hiện bài kiểm tra, đánh giá năng lực học tập. |

### 2.6. Phân hệ Giáo viên (Teacher)

| Nhóm | Tên tính năng | Mô tả chi tiết |
|---|---|---|
| 1. Quản lý Lịch & Giảng dạy | Xem thời khóa biểu STEM | Tự động nhận và xem chi tiết thời khóa biểu cá nhân, trong đó cập nhật tự động các tiết học STEM đã được nhà trường phân bổ. |
| | Triển khai giảng dạy theo chuẩn | Khai thác và tổ chức các tiết học dựa trên 5 phân luồng chương trình STEM (từ CT1 tích hợp nội môn đến CT5 nghiên cứu khoa học) tùy bộ môn. |
| 2. Quản lý Học liệu & Tập huấn | Truy cập tài liệu giáo viên | Truy cập kho lưu trữ số của nhà cung cấp để khai thác giáo án, tài liệu hướng dẫn giảng dạy chuyên biệt. |
| | Tham gia tập huấn chuyên môn | Xem các tài liệu, video hướng dẫn và tham gia các chương trình tập huấn nâng cao năng lực giảng dạy STEM dành riêng cho giáo viên. |
| 3. Quản lý Học sinh & Đánh giá | Theo dõi kết quả học tập và thi cử | Quản lý danh sách lớp, theo dõi sát sao tiến độ học tập, điểm số thực hành và kết quả từ các kỳ thi STEM của học sinh do mình phụ trách. |
| 4. Quản lý Cơ sở vật chất | Kiểm tra và báo cáo thiết bị tại lớp | Kiểm tra số lượng, chất lượng thiết bị thông minh và dụng cụ thực hành khi vào lớp; báo cáo ngay lên hệ thống nếu phát hiện hỏng hóc hoặc thất thoát. |

### 2.7. Phân hệ Quản trị Hệ thống (System Administration)

| Nhóm | Tên tính năng | Mô tả chi tiết |
|---|---|---|
| 1. Quản lý Người dùng & Phân quyền | Quản trị đa khách thuê (Multi-tenancy) | Khởi tạo và quản lý không gian làm việc độc lập cho từng đại lý, trường học trên cùng một hạ tầng, đảm bảo dữ liệu được cách ly an toàn nhưng vẫn có thể quản trị tập trung. |
| | Thiết lập vai trò & Phân quyền | Tạo mới, cập nhật thông tin tài khoản và gán quyền truy cập chi tiết dựa trên vai trò người dùng (NCC, quản trị viên, giáo viên, đại lý). |
| 2. Quản lý Giấy phép (License) | Phân bổ & Thu hồi giấy phép | Cấp phát giấy phép sử dụng phần mềm (tự động hoặc thủ công) cho các tài khoản người dùng/thiết bị; quản lý việc thu hồi để tái phân bổ. |
| | Theo dõi & Giám sát sử dụng | Giám sát dung lượng lưu trữ, hạn mức tài nguyên và số lượng giấy phép đang kích hoạt để đảm bảo hệ thống hoạt động không vượt quá giới hạn ngân sách và quy mô cho phép. |
| 3. Quản trị Dữ liệu & Tích hợp | Đồng bộ & Liên thông dữ liệu | Quản lý các danh mục dữ liệu dùng chung; thiết lập và giám sát cổng giao tiếp (API) để chia sẻ, đồng bộ dữ liệu với CSDL ngành giáo dục, VNeID và hệ thống ERP/CRM. |
| | Cấu hình bảo mật hệ thống | Thiết lập và quản lý các rào cản bảo mật kỹ thuật như SSL, thuật toán mã hóa dữ liệu, SSO và tuân thủ các quy định về bảo vệ quyền riêng tư. |
| 4. Cấu hình & Báo cáo Hệ thống | Quản lý cấu hình & Cập nhật | Kiểm soát cấu hình nền tảng, cài đặt plugin, và triển khai đồng bộ các bản cập nhật tính năng, bản vá lỗi bảo mật cho toàn hệ thống từ một điểm trung tâm. |
| | Báo cáo & Phân tích tổng hợp | Truy xuất bảng điều khiển và giám sát báo cáo tổng quan về hiệu suất hệ thống, tình trạng hoạt động, sự cố, và nhật ký truy cập chéo trên tất cả các phân hệ cũng như các tổ chức khách thuê. |

---

## 3. Tính năng xuyên suốt (Cross-cutting capabilities)

### 3.1. 5 Chương trình STEM chuẩn (CT1 – CT5)

| Mã | Tên | Mô tả | Đối tượng áp dụng |
|---|---|---|---|
| **CT1** | STEM Tích hợp nội môn | Giảng dạy từng môn học theo hướng thực tiễn, ứng dụng thức sáng tạo. Chỉ chạm đến môn học của GV, phù hợp mọi bộ môn. | Tất cả GV, Mầm non → THPT |
| **CT2** | STEM Liên môn | Vận dụng kiến thức liên môn để giải quyết vấn đề thực tiễn, vận dụng một môn làm chủ đề STEM. | GV tổ bộ môn Toán/Lý/Hóa/Sinh/Tin/Công nghệ |
| **CT3** | STEM Đổi mới sáng tạo | Hoạt động sáng tạo, làm sản phẩm cụ thể, vận dụng giải pháp từ kết quả STEM. | Hoạt động câu lạc bộ, ngoại khóa |
| **CT4** | STEM Robotic, AI & Trải nghiệm | STEM định hướng đổi mới sáng tạo: vận dụng kiến thức, kỹ năng, công nghệ để giải quyết bài toán cụ thể (Robotic, AI, Trải nghiệm). | THCS, THPT, CLB chuyên sâu |
| **CT5** | STEM Nghiên cứu khoa học | Tập trung nghiên cứu, có kế hoạch nghiên cứu độc lập, định hướng học sinh 5 năm, có kết quả có thể đăng bài báo khoa học. | HS năng khiếu, THCS/THPT dài hạn |

### 3.2. 3 Gói phòng học STEM

| Gói | Thành phần cốt lõi | Cấp độ đáp ứng |
|---|---|---|
| **STEM Tối thiểu** | Bộ dụng cụ STEM tại nhà/lớp (CT1) | CT1 sơ cấp |
| **STEM Cơ bản** | Phòng Lab STEM 1, Robotic cơ bản (CT1–CT2) | Trường quốc gia |
| **STEM Nâng cao** | AI, IoT, Robotic 5 năm (CT3, CT4, CT5) | Trường trọng điểm quốc tế / Chất lượng cao |

Mỗi gói có tham số động về cấu thành (thiết kế CSVC, thiết bị thông minh, nội thất chuyên dụng, dịch vụ trang trí) do Nhà cung cấp cấu hình.

### 3.3. AI-Buddy
Trợ lý AI thông minh với các khả năng:
- Chat hỏi đáp (kế thừa `ChatbotPanel` hiện có).
- Gợi ý bài tập dựa trên hồ sơ học sinh.
- Chấm bài thông minh (tích hợp `AIGrading.tsx` hiện có).
- Phân tích điểm mạnh/yếu cá nhân hóa.
- Hỗ trợ giáo viên soạn giáo án theo CT1–CT5.

### 3.4. Data Lake & Liên thông CSDL
- Chuẩn dữ liệu **"Đúng – Đủ – Sạch – Sống"**.
- Tích hợp **CSDL ngành giáo dục quốc gia** (đồng bộ hai chiều, đối soát tự động).
- Tích hợp **VNeID** (định danh học sinh, phụ huynh, giáo viên).
- Liên thông ERP/CRM nội bộ NCC và đại lý.

### 3.5. API Gateway / Dev Portal
- Cổng giao tiếp mở cho đối tác tích hợp.
- Quản lý API keys, rate limits, webhooks.
- Tài liệu OpenAPI + playground.
- Danh mục API mẫu: Order, Warranty, License, Schedule, Exam Result, Student Profile, VNeID Sync, NEdu Sync.

### 3.6. Hạ tầng vật lý & Đồng hành 5 năm
- Theo dõi phòng học vật lý, hạ tầng phòng lab, thiết bị, nội dung bài giảng số.
- Chương trình **tập huấn & đồng hành 5 năm** cho đội ngũ giáo viên STEM.

---

## 4. Khảo sát codebase hiện tại

### 4.1. Stack kỹ thuật
```
React 18.3.1 + React Router 7.13
TypeScript + Vite 6.3.5
TailwindCSS 4.1.12 (v4, dùng @custom-variant + @theme inline)
Radix UI (toàn bộ primitives)
Material UI 7.3.5 (đã cài nhưng dùng ít)
lucide-react 0.487 (iconography chính)
Recharts 2.15 (biểu đồ)
react-dnd 16 (kéo-thả)
react-hook-form 7.55 (forms)
sonner 2.0.3 (toast)
date-fns 3.6, embla-carousel, cmdk, motion, vaul, react-slick...
```

### 4.2. Cấu trúc thư mục
```
src/
├── main.tsx
├── styles/
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css          ← brand tokens + dark mode
└── app/
    ├── App.tsx
    ├── routes.ts          ← 68 routes, 1 layout, 3 role-driven nav groups
    ├── components/
    │   ├── Layout.tsx     ← sidebar + header + breadcrumb + chatbot slot
    │   ├── AuthContext.tsx← 3 demo accounts
    │   ├── AuthGuard.tsx
    │   ├── ThemeContext.tsx
    │   ├── ConfirmDialog.tsx
    │   ├── GlobalSearch.tsx
    │   ├── ChatbotPanel.tsx
    │   ├── mock-data.ts
    │   ├── ...74 component trang cấp 1
    │   ├── ui/            ← 46 Radix-based primitives (button, dialog, select…)
    │   ├── figma/         ← ImageWithFallback
    │   ├── shared/        ← ContentPreview, FileUploadZone
    │   ├── classroom/     ← AttendanceTracker, ClassroomList, SessionCalendar
    │   ├── learning/      ← VideoPlayer, AudioPlayer, DocumentViewer, ScormViewer…
    │   ├── exam/          ← QuestionBank, ExamCreator, ExamTaking, AIGrading, Proctoring
    │   ├── gamification/  ← BadgeCollection, Challenges, PointsDashboard, RewardsStore
    │   ├── forum/, grading/, idp/, surveys/, budget/, compliance/, certificates/,
    │   │   learning-paths/, notifications/
    └── utils/
```

### 4.3. Điểm mạnh cần tận dụng
- **Layout sidebar** đã hỗ trợ collapse, mobile overlay, group collapsing, badge đếm.
- **Theme system** hoàn chỉnh light/dark, đủ semantic tokens.
- **UI primitives** đầy đủ, chất lượng sản phẩm.
- **AuthContext** + `loginAs()` demo — rất thuận lợi để demo 7 role.
- **Learning players** (video/audio/document/SCORM/presentation/image) có thể dùng trực tiếp cho bài giảng STEM.
- **Exam suite** (question bank, exam creator, exam taking, AI grading, proctoring) khớp hoàn hảo với "hệ sinh thái kỳ thi STEM".
- **Classroom**, **Calendar**, **TrainingCalendar** dùng được cho thời khóa biểu.
- **IntegrationHub**, **DataCenter**, **TenantManagement**, **AuditLog**, **SystemHealth** là hạt giống cho phân hệ System Admin.

### 4.4. Điểm không phù hợp cần xử lý
- Menu nhiều module corporate không liên quan: KPI/OKR, Training Budget, Compliance Tracker, Individual Development Plan (IDP), Skill Matrix, Competency Gap, Course Marketplace, Mentoring, Social Learning Hub, Study Groups → **loại khỏi nav của vai trò STEM** (giữ file phòng tái sử dụng).
- Danh sách "Subsidiaries" của Geleximco holding → **thay thế** bằng "Quản lý Trường học".
- Mock data dùng ảnh Unsplash "corporate training" → **thay thế** bằng ảnh STEM lab / Robotic / Science kids.

---

## 5. Ma trận quyết định từng component

### 5.1. GIỮ & tái mục đích (đổi nhãn + thay data)

| Component hiện tại | Mục đích mới | Phân hệ sử dụng |
|---|---|---|
| `Dashboard.tsx` | Dashboard 7 vai trò (tách thành 7 dashboard variant) | Tất cả |
| `Courses.tsx`, `CourseDetail.tsx`, `CourseFormModal.tsx` | Chương trình / Bài giảng STEM (CT1–CT5) | Giáo viên, Học sinh, NCC, Trường |
| `LearningPlayer.tsx`, `LearningPlayerPage.tsx`, `learning/*` | Player bài giảng STEM (video/SCORM/audio/doc/ảnh/presentation) | Học sinh, Giáo viên |
| `Quizzes.tsx`, `exam/*` | Hệ sinh thái kỳ thi STEM (tạo đề, ngân hàng câu hỏi, làm bài, chấm AI, proctoring, scheduling) | NCC, GV, HS |
| `ClassroomManagement.tsx`, `classroom/*` | Quản lý Phòng học STEM (Tối thiểu/Cơ bản/Nâng cao) | Trường, NCC |
| `Calendar.tsx` (TrainingCalendar) | Thời khóa biểu STEM (lớp học + CLB) | Trường, GV, HS |
| `Certificates.tsx`, `CertificationProgress.tsx`, `certificates/*` | Chứng chỉ STEM (cho HS + tập huấn GV) | Tất cả |
| `ResourceLibrary.tsx` | Kho học liệu số STEM | GV, HS, NCC |
| `ContentBank.tsx` | Ngân hàng Nội dung NCC | NCC, GV |
| `ContentAuthoring.tsx` | Studio Biên soạn bài giảng STEM | NCC, GV |
| `InstructorManagement.tsx` | Quản lý Giáo viên STEM (của trường) | Trường, NCC |
| `Employees.tsx` | Đồng bộ Nhân sự → **Danh bạ người dùng theo tenant** | System Admin, Trường |
| `Subsidiaries.tsx` | Đổi thành **Quản lý Trường học** (từ góc nhìn NCC/Đại lý/Sở) | NCC, Đại lý, Cơ quan QL |
| `Permissions.tsx` | Phân quyền chi tiết 7 phân hệ | System Admin |
| `TenantManagement.tsx` | Multi-tenancy cho 4 loại tenant | System Admin |
| `IntegrationHub.tsx` | API Gateway / Dev Portal (VNeID, CSDL Quốc gia, ERP) | System Admin, Đối tác |
| `DataCenter.tsx` | Data Lake + Đồng bộ CSDL + tiêu chí "Đúng–Đủ–Sạch–Sống" | System Admin, Cơ quan QL |
| `AuditLog.tsx` | Nhật ký truy cập chéo toàn phân hệ | System Admin |
| `SystemHealth.tsx` | Giám sát hệ thống | System Admin |
| `WorkflowApproval.tsx`, `WorkflowDesigner.tsx` | Duyệt đơn hàng / hợp đồng / ticket bảo hành | NCC, Đại lý |
| `AdvancedAnalytics.tsx`, `LearningAnalytics.tsx`, `Reports.tsx`, `ReportBuilder.tsx` | Báo cáo & phân tích hiệu quả STEM | NCC, Cơ quan QL, Trường |
| `ChatbotPanel.tsx`, `ChatbotAdmin.tsx` | Nâng cấp thành **AI-Buddy** | Tất cả |
| `Grading.tsx` | Chấm bài thi STEM (kết hợp AI) | GV, NCC |
| `Notifications.tsx`, `notifications/*`, `Announcements.tsx`, `Messaging.tsx`, `Forum.tsx` | Kênh giao tiếp tenant | Tất cả |
| `MobileAppConfig.tsx` | Cấu hình App HS/GV trên lớp | NCC, System Admin |
| `WhiteLabelConfig.tsx` | Tùy biến thương hiệu theo tenant (Đại lý, Sở) | System Admin |
| `MultiLanguage.tsx` | Ngôn ngữ (mặc định VN; dự phòng EN) | System Admin |
| `OfflineLearning.tsx` | Học offline cho trường vùng sâu (giữ nguyên) | HS, GV |
| `AccessibilityChecker.tsx` | Kiểm tra a11y nội dung STEM | NCC |
| `Settings.tsx`, `UserProfile.tsx`, `Login.tsx`, `AuthGuard.tsx` | Giữ khung, thay nội dung; bổ sung SSO/VNeID | Tất cả |
| `TrainingEvents.tsx` | Sự kiện tập huấn GV + kỳ thi STEM | GV, NCC |
| `KnowledgeBase.tsx` | Wiki nội bộ tenant (tùy chọn bật) | Tất cả |

### 5.2. LOẠI khỏi nav (ẩn route, giữ file dự phòng)

Các module corporate training không gắn với giáo dục phổ thông STEM. Thực hiện **comment out trong `routes.ts`** và không đưa vào `getNavGroups()`, **giữ file để có thể kích hoạt lại** khi mở rộng sản phẩm:

- `KpiOkrManagement.tsx`
- `TrainingBudget.tsx`
- `ComplianceTracker.tsx`
- `IndividualDevelopment.tsx` (IDP)
- `SkillMatrix.tsx`
- `CompetencyGap.tsx`
- `CourseMarketplace.tsx`
- `Mentoring.tsx`
- `SocialLearning.tsx`
- `StudyGroups.tsx`
- `GamificationCenter.tsx`, `Leaderboard.tsx`, `Achievements.tsx`, `gamification/*` (có thể bật lại cho Học sinh ở Phase tương lai)
- `CourseReviews.tsx`
- `Surveys.tsx` (có thể bật lại cho Sở GD&ĐT khảo sát hiệu quả)
- `AIRecommendations.tsx` (tính năng sẽ được AI-Buddy thay thế)

### 5.3. XÂY MỚI
Xem chi tiết ở mục 6.

---

## 6. Component mới cần xây dựng

> Tất cả ở dạng file `.tsx` trong `src/app/components/` hoặc thư mục con theo phân hệ. Đặt trong `components/stem/` để phân biệt với di sản LMS.

### 6.1. Nhà cung cấp (Supplier)
| Component | Chức năng |
|---|---|
| `stem/supplier/STEMPackageCatalog.tsx` | Grid 3 card tier (Tối thiểu/Cơ bản/Nâng cao) + video demo + gallery + bảng giá |
| `stem/supplier/STEMPackageConfigurator.tsx` | Form builder tham số gói (CSVC / thiết bị / nội thất / trang trí) — dùng `react-hook-form` + Radix Accordion |
| `stem/supplier/STEMProgramManager.tsx` | CRUD 5 chương trình CT1–CT5 + mapping SGK theo cấp học & bộ môn |
| `stem/supplier/STEMOrderManagement.tsx` | Bảng đơn hàng + trạng thái (draft/pending/approved/delivering/delivered) + tạo đơn thủ công |
| `stem/supplier/WarrantyFulfillment.tsx` | Hàng đợi ticket bảo hành + điều phối kỹ thuật viên + SLA tracking |
| `stem/supplier/LicenseDistribution.tsx` | Phát/thu license (auto theo đơn / manual) + kho license còn trống |
| `stem/supplier/SoftwareInstaller.tsx` | Đẩy bộ cài xuống thiết bị (campaign theo gói/trường) |
| `stem/supplier/SupplierRevenueDashboard.tsx` | KPI doanh số, đơn hàng theo đại lý, tồn kho ảo hợp nhất |
| `stem/supplier/MediaAssetManager.tsx` | Quản lý hình ảnh/video giới thiệu theo gói |

### 6.2. Đại lý (Distributor)
| Component | Chức năng |
|---|---|
| `stem/distributor/DistributorOrderBoard.tsx` | Kanban đơn hàng theo giai đoạn (lead → contract → delivery → closed) |
| `stem/distributor/STEMContractManagement.tsx` | Lưu hợp đồng B2B (điều khoản, file PDF, milestone, tiến độ thu hồi công nợ) |
| `stem/distributor/VirtualInventory.tsx` | Dashboard kho ảo: tồn đầu kỳ, phát sinh nhập (NCC), phát sinh xuất (trường), tồn cuối kỳ |
| `stem/distributor/CommissionReconciliation.tsx` | Bảng đối soát hoa hồng + xác nhận biên bản |
| `stem/distributor/RevenueReports.tsx` | Recharts: doanh thu theo tháng/quý/năm/sản phẩm/khách hàng |
| `stem/distributor/CRMCustomerManagement.tsx` | Danh bạ khách hàng + phân loại + tag + hoạt động gần nhất |
| `stem/distributor/CustomerCare.tsx` | Ticket chăm sóc khách hàng + lịch gọi + sổ feedback |
| `stem/distributor/SalesApp.tsx` | Chế độ "bán hàng" cho sale: báo giá nhanh, tạo đơn trên điện thoại |

### 6.3. Trường học (School)
| Component | Chức năng |
|---|---|
| `stem/school/SchoolPurchaseFlow.tsx` | Wizard: duyệt catalog → so sánh → giỏ hàng → gửi duyệt → thanh toán (mô phỏng) |
| `stem/school/EquipmentInventory.tsx` | Bảng thiết bị trường + filter tình trạng + timeline sử dụng + QR scan |
| `stem/school/WarrantyTicketing.tsx` | Tạo ticket: chọn thiết bị → mô tả → upload ảnh → theo dõi trạng thái |
| `stem/school/TeacherManagement.tsx` | Danh sách GV STEM, mapping chương trình dạy, license, chứng chỉ tập huấn |
| `stem/school/StudentManagement.tsx` | Danh sách HS, gán lớp, license, kết quả STEM |
| `stem/school/STEMSchedulePlanner.tsx` | Lưới thời khóa biểu kéo-thả (tiết STEM + CLB ngoại khóa) — dùng `react-dnd` |
| `stem/school/SchoolSTEMEffectivenessReport.tsx` | Báo cáo điểm STEM, tỷ lệ hoàn thành, so sánh lớp/khối |
| `stem/school/SchoolLicensePanel.tsx` | Phân bổ license còn lại cho GV/HS |

### 6.4. Cơ quan Quản lý (Authority)
| Component | Chức năng |
|---|---|
| `stem/authority/RegionalEducationDashboard.tsx` | KPI toàn ngành + heatmap theo quận/huyện + top trường |
| `stem/authority/EquipmentComplianceMonitor.tsx` | Tỷ lệ thiết bị đạt/chưa đạt chuẩn + drill-down theo khối trường |
| `stem/authority/ProcurementCostAnalytics.tsx` | Bar chart chi phí theo nguồn (ngân sách / học phí / xã hội hóa) |
| `stem/authority/NationalDataSync.tsx` | Cổng đồng bộ CSDL Quốc gia + VNeID + status "Đúng/Đủ/Sạch/Sống" |
| `stem/authority/CommonCatalogManager.tsx` | CRUD danh mục dùng chung (môn học, cấp học, trường, chuẩn kỹ năng) |
| `stem/authority/MinistryReportExporter.tsx` | Chọn Thông tư → chọn kỳ → xuất PDF/Excel (mock) |
| `stem/authority/SchoolDirectory.tsx` | Danh bạ trường trực thuộc với filter đa tầng (tỉnh/huyện/cấp học) |

### 6.5. Giáo viên (Teacher)
| Component | Chức năng |
|---|---|
| `stem/teacher/STEMScheduleViewer.tsx` | Weekly calendar, highlight tiết STEM |
| `stem/teacher/TeacherTrainingHub.tsx` | Kho tập huấn: video, tài liệu, progress đồng hành 5 năm |
| `stem/teacher/TeacherResourceDownloader.tsx` | Tải giáo án/HS tài liệu theo CT1–CT5 |
| `stem/teacher/ClassroomEquipmentCheck.tsx` | Check-in thiết bị đầu tiết, báo nhanh hỏng hóc |
| `stem/teacher/StudentProgressTracker.tsx` | Theo dõi tiến độ HS: điểm thực hành + điểm thi STEM |
| `stem/teacher/LessonPlanBuilder.tsx` | Soạn giáo án với AI-Buddy suggest |

### 6.6. Học sinh (Student)
| Component | Chức năng |
|---|---|
| `stem/student/StudentHome.tsx` | Trang chủ học sinh: hôm nay học gì, kỳ thi sắp tới, tiến độ |
| `stem/student/StudentScheduleViewer.tsx` | Thời khóa biểu cá nhân |
| `stem/student/StudentLessonPlayer.tsx` | Wrapper quanh `LearningPlayer` + filter lịch hôm nay |
| `stem/student/STEMExamParticipation.tsx` | Danh sách kỳ thi + đăng ký + làm bài + kết quả |
| `stem/student/StudentAchievements.tsx` | Thành tích, chứng chỉ, AI-Buddy phân tích cá nhân |

### 6.7. System Admin
| Component | Chức năng |
|---|---|
| `stem/admin/TenantOnboarding.tsx` | Wizard khởi tạo tenant mới (Đại lý/Trường/Sở) |
| `stem/admin/LicenseMonitoring.tsx` | Consolidated view: quota, active, expiring, storage |
| `stem/admin/DevPortal.tsx` | API catalog + keys + rate limits + webhooks + OpenAPI doc |
| `stem/admin/SecurityConfig.tsx` | SSL, SSO, 2FA, mã hóa, chính sách bảo mật |
| `stem/admin/PlatformConfig.tsx` | Cấu hình nền tảng + plugin + OTA update |
| `stem/admin/CrossTenantAccessLog.tsx` | Nhật ký truy cập chéo tenant |

### 6.8. AI-Buddy (cross-cutting)
| Component | Chức năng |
|---|---|
| `stem/ai/AIBuddyPanel.tsx` | Floating panel 4 tab: Chat / Gợi ý / Chấm bài / Phân tích |
| `stem/ai/AIBuddyChat.tsx` | Hỏi đáp, nâng cấp từ `ChatbotPanel` |
| `stem/ai/AIBuddyRecommend.tsx` | Gợi ý bài tập theo hồ sơ HS |
| `stem/ai/AIBuddyAnalyze.tsx` | Strengths/weakness chart cho GV và HS |

---

## 7. Kiến trúc thông tin (Information Architecture)

### 7.1. Hệ thống route mới

Thay cấu trúc phẳng hiện có bằng namespace theo phân hệ:

```
/login
/logout
/onboarding/:tenantCode     ← trang kích hoạt tenant mới

/ (dashboard — tự redirect theo tenantType + role)

/supplier/
  ├─ dashboard
  ├─ packages                ← STEMPackageCatalog
  ├─ packages/:id/configure  ← STEMPackageConfigurator
  ├─ programs                ← STEMProgramManager
  ├─ content
  │    ├─ authoring          ← ContentAuthoring (reused)
  │    └─ library            ← ContentBank (reused)
  ├─ exams                   ← exam suite
  ├─ training                ← TrainingEvents (reused)
  ├─ orders                  ← STEMOrderManagement
  ├─ warranty                ← WarrantyFulfillment
  ├─ licenses                ← LicenseDistribution
  ├─ software                ← SoftwareInstaller
  ├─ schools                 ← Subsidiaries (reused, renamed)
  ├─ distributors            ← CRM view ngược (danh sách đại lý)
  ├─ analytics               ← AdvancedAnalytics (reused)
  ├─ revenue                 ← SupplierRevenueDashboard
  └─ media                   ← MediaAssetManager

/distributor/
  ├─ dashboard
  ├─ orders                  ← DistributorOrderBoard
  ├─ contracts               ← STEMContractManagement
  ├─ inventory               ← VirtualInventory
  ├─ commission              ← CommissionReconciliation
  ├─ revenue                 ← RevenueReports
  ├─ customers               ← CRMCustomerManagement
  ├─ customer-care           ← CustomerCare
  └─ sales-app               ← SalesApp

/school/
  ├─ dashboard
  ├─ purchase                ← SchoolPurchaseFlow
  ├─ equipment               ← EquipmentInventory
  ├─ warranty                ← WarrantyTicketing
  ├─ teachers                ← TeacherManagement
  ├─ students                ← StudentManagement
  ├─ schedule                ← STEMSchedulePlanner
  ├─ licenses                ← SchoolLicensePanel
  ├─ reports                 ← SchoolSTEMEffectivenessReport
  └─ announcements           ← Announcements (reused)

/authority/
  ├─ dashboard               ← RegionalEducationDashboard
  ├─ schools                 ← SchoolDirectory
  ├─ equipment-compliance    ← EquipmentComplianceMonitor
  ├─ procurement             ← ProcurementCostAnalytics
  ├─ data-sync               ← NationalDataSync
  ├─ catalogs                ← CommonCatalogManager
  └─ reports                 ← MinistryReportExporter

/teacher/
  ├─ dashboard
  ├─ schedule                ← STEMScheduleViewer
  ├─ lessons                 ← Courses (filter cho GV)
  ├─ lesson-plan-builder     ← LessonPlanBuilder
  ├─ resources               ← TeacherResourceDownloader
  ├─ training                ← TeacherTrainingHub
  ├─ classes                 ← StudentProgressTracker
  ├─ grading                 ← Grading (reused)
  ├─ exams                   ← Quizzes (reused)
  └─ equipment-check         ← ClassroomEquipmentCheck

/student/
  ├─ dashboard               ← StudentHome
  ├─ schedule                ← StudentScheduleViewer
  ├─ lessons                 ← StudentLessonPlayer
  ├─ exams                   ← STEMExamParticipation
  ├─ achievements            ← StudentAchievements
  └─ certificates            ← Certificates (reused)

/admin/
  ├─ dashboard
  ├─ tenants                 ← TenantManagement (reused)
  ├─ tenant-onboarding       ← TenantOnboarding
  ├─ users                   ← Employees (reused, renamed)
  ├─ roles                   ← Permissions (reused)
  ├─ licenses                ← LicenseMonitoring
  ├─ dev-portal              ← DevPortal (upgraded from IntegrationHub)
  ├─ data-lake               ← DataCenter (reused)
  ├─ security                ← SecurityConfig
  ├─ platform                ← PlatformConfig (upgraded from WhiteLabelConfig)
  ├─ audit                   ← AuditLog (reused)
  ├─ system-health           ← SystemHealth (reused)
  └─ cross-tenant-log        ← CrossTenantAccessLog

/shared/
  ├─ profile                 ← UserProfile
  ├─ settings                ← Settings
  ├─ notifications           ← Notifications
  ├─ messages                ← Messaging
  └─ ai-buddy                ← AIBuddyPanel (fullscreen mode)
```

Redirect rule trong `AuthGuard.tsx`:
- `supplier_*` → `/supplier/dashboard`
- `distributor_*` → `/distributor/dashboard`
- `school_*` → `/school/dashboard`
- `authority_*` → `/authority/dashboard`
- `teacher` → `/teacher/dashboard`
- `student` → `/student/dashboard`
- `system_admin` → `/admin/dashboard`

### 7.2. Nav groups mẫu cho từng phân hệ

Ví dụ sidebar cho **School Principal**:
```
TỔNG QUAN
├─ Dashboard
MUA SẮM & ĐẦU TƯ
├─ Danh mục gói STEM
├─ Đơn hàng của tôi
├─ Hợp đồng
CƠ SỞ VẬT CHẤT
├─ Quản lý Thiết bị
├─ Yêu cầu Bảo hành
ĐÀO TẠO STEM
├─ Thời khóa biểu
├─ Giáo viên
├─ Học sinh
├─ License & Tài khoản
BÁO CÁO
├─ Hiệu quả STEM
TƯƠNG TÁC
├─ Thông báo
├─ Tin nhắn
CÁ NHÂN
├─ Hồ sơ
├─ Cài đặt
```

Ví dụ sidebar cho **Authority Admin (Sở GD&ĐT)**:
```
TỔNG QUAN
├─ Dashboard toàn ngành
├─ Danh bạ Trường
THIẾT BỊ & CSVC
├─ Tình trạng & Chuẩn
├─ Chi phí Mua sắm
DỮ LIỆU & LIÊN THÔNG
├─ Đồng bộ CSDL Quốc gia
├─ VNeID
├─ Danh mục dùng chung
BÁO CÁO
├─ Kết xuất theo Thông tư
├─ Analytics nâng cao
CÁ NHÂN
├─ Hồ sơ, Cài đặt
```

Xem đầy đủ nav các phân hệ còn lại trong file `docs/IA-7-modules.md` (sẽ tạo ở Phase 1).

---

## 8. Mô hình dữ liệu & mock data

### 8.1. Types cốt lõi (bổ sung vào `mock-data/types.ts`)

```typescript
// Tenant
export type TenantType = "supplier" | "distributor" | "school" | "authority";
export interface Tenant {
  id: string;
  type: TenantType;
  name: string;
  code: string;
  province?: string;
  district?: string;
  logo?: string;
  licenseQuota: number;
  licenseUsed: number;
  storageQuotaGB: number;
  storageUsedGB: number;
  active: boolean;
  onboardedAt: string;
  parentTenantId?: string;
}

// User (mở rộng từ User hiện tại)
export type StemRole =
  | "supplier_admin" | "supplier_content" | "supplier_sales" | "supplier_warranty"
  | "distributor_admin" | "distributor_sales" | "distributor_finance"
  | "school_principal" | "school_admin" | "school_itadmin"
  | "authority_admin" | "authority_viewer"
  | "teacher" | "student"
  | "system_admin";

export interface StemUser extends User {
  tenantId: string;
  tenantType: TenantType;
  stemRole: StemRole;
  vneidVerified?: boolean;
}

// Chương trình STEM
export type StemProgram = "CT1" | "CT2" | "CT3" | "CT4" | "CT5";
export interface StemProgramMeta {
  code: StemProgram;
  name: string;
  description: string;
  color: string;
  supportedGrades: string[];
  supportedSubjects: string[];
}

// Gói phòng STEM
export type StemPackageTier = "minimum" | "basic" | "advanced";
export interface StemPackage {
  id: string;
  tier: StemPackageTier;
  name: string;
  description: string;
  priceVND: number;
  includedEquipment: EquipmentSpec[];
  includedSoftware: SoftwareSpec[];
  supportedGrades: string[];
  supportedPrograms: StemProgram[];
  demoVideoUrl?: string;
  thumbnails: string[];
  configuration: {
    infrastructure: string[];
    smartDevices: string[];
    furniture: string[];
    decoration: string[];
  };
  active: boolean;
}
export interface EquipmentSpec { /* category, name, qty, unitVND, specs */ }
export interface SoftwareSpec { /* name, version, licenseType, seats */ }

// Thiết bị
export interface Equipment {
  id: string;
  name: string;
  serial: string;
  category: string;
  packageId: string;
  schoolId: string;
  location: string;
  status: "ok" | "warning" | "broken" | "missing";
  purchasedAt: string;
  warrantyEndsAt: string;
  lastCheckedBy?: string;
  lastCheckedAt?: string;
  usageHours?: number;
  qrCode?: string;
}

// Yêu cầu bảo hành
export type WarrantyStatus =
  | "new" | "accepted" | "awaiting_part"
  | "in_progress" | "resolved" | "rejected" | "closed";
export interface WarrantyTicket {
  id: string;
  ticketNo: string;
  equipmentId: string;
  schoolId: string;
  reportedBy: string;
  reportedAt: string;
  issue: string;
  photos: string[];
  status: WarrantyStatus;
  assignedTo?: string;
  slaDueAt?: string;
  resolutionNote?: string;
  history: { at: string; by: string; status: WarrantyStatus; note?: string }[];
}

// Đơn hàng & Hợp đồng
export type OrderStatus =
  | "draft" | "pending" | "approved"
  | "delivering" | "delivered" | "cancelled";
export interface Order {
  id: string;
  orderNo: string;
  fromTenantId: string;
  toTenantId: string;
  distributorTenantId?: string;
  packages: { packageId: string; quantity: number; unitPrice: number }[];
  totalVND: number;
  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  contractId?: string;
}
export interface Contract {
  id: string;
  contractNo: string;
  supplierId: string;
  distributorId?: string;
  schoolId: string;
  signedAt: string;
  totalVND: number;
  status: "draft" | "signed" | "active" | "expired" | "terminated";
  milestones: { title: string; dueAt: string; done: boolean }[];
  attachments: string[];
  commissionPct?: number;
}

// License
export type LicenseType = "per_user" | "per_device" | "site";
export interface License {
  id: string;
  licenseKey: string;
  type: LicenseType;
  productId: string;
  seats: number;
  seatsUsed: number;
  tenantId: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

// Kho ảo
export interface VirtualStockMovement {
  id: string;
  at: string;
  tenantId: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  orderId?: string;
  note?: string;
}

// Đối soát hoa hồng
export interface CommissionRecord {
  id: string;
  period: string;
  supplierId: string;
  distributorId: string;
  baseRevenueVND: number;
  commissionPct: number;
  commissionVND: number;
  status: "pending" | "reconciled" | "paid" | "disputed";
  attachment?: string;
}

// Lịch STEM
export interface STEMScheduleEntry {
  id: string;
  schoolId: string;
  classId: string;
  teacherId: string;
  programCode: StemProgram;
  subject: string;
  roomId: string;
  weekday: number;
  period: number;
  dateFrom: string;
  dateTo: string;
  isClub?: boolean;
}

// Kỳ thi
export interface STEMExam {
  id: string;
  name: string;
  level: "school" | "district" | "province" | "national";
  gradeLevel: string;
  programCodes: StemProgram[];
  openAt: string;
  closeAt: string;
  durationMinutes: number;
  questionBankId: string;
  organiser: string;
}

// Báo cáo Sở/Bộ
export interface AuthorityReport {
  id: string;
  name: string;
  templateCode: string;
  generatedAt: string;
  scope: "district" | "province" | "national";
  period: string;
  fileUrl: string;
}

// Danh mục dùng chung
export interface CatalogItem {
  id: string;
  catalog: "subject" | "grade" | "school" | "skill" | "program";
  code: string;
  name: string;
  parentCode?: string;
  metadata?: Record<string, unknown>;
}

// Bản ghi đồng bộ dữ liệu
export interface DataSyncRecord {
  id: string;
  source: "NEdu" | "VNeID" | "ERP" | "CRM";
  direction: "in" | "out";
  entity: string;
  count: number;
  startedAt: string;
  finishedAt?: string;
  status: "queued" | "running" | "done" | "error";
  "4D": { dung: boolean; du: boolean; sach: boolean; song: boolean };
}
```

### 8.2. Khối lượng mock data tối thiểu

| Entity | Số lượng tối thiểu |
|---|---|
| Tenant | 1 supplier + 3 distributor + 15 school + 2 authority |
| User | 50 học sinh × 5 trường, 10 giáo viên × 5 trường, 2 HT × 5 trường, 3 sale × 3 đại lý, 5 admin × 1 NCC, 3 sở/bộ, 1 sysadmin |
| StemPackage | 3 (1 cho mỗi tier) |
| Equipment | 200 (phân bổ 40/trường) |
| WarrantyTicket | 30 (đủ status) |
| Order | 30 |
| Contract | 15 |
| License | 200 |
| STEMScheduleEntry | ~300 (1 tuần × 5 trường × 60 entries) |
| STEMExam | 10 |
| Question (tái dùng) | 100 |
| LessonCTX | 50 theo CT1–CT5 |
| AuthorityReport | 5 biểu mẫu Thông tư |
| DataSyncRecord | 20 |

### 8.3. Tách file mock data
```
mock-data/
├── index.ts              ← re-export
├── types.ts              ← tất cả types
├── constants.ts          ← STEM_PROGRAMS, STEM_TIERS, GRADES, SUBJECTS
├── tenants.ts
├── users.ts              ← demoAccounts + generated users
├── packages.ts
├── equipment.ts
├── warranty.ts
├── orders-contracts.ts
├── licenses.ts
├── inventory.ts
├── schedules.ts
├── lessons.ts
├── exams.ts
├── authority-reports.ts
├── catalogs.ts
└── data-sync.ts
```

---

## 9. Hệ thống thị giác (Branding & Design System)

### 9.1. Logo & brand
- **Tên hiển thị trong UI:** `GELEXIMCO STEM`
- **Subtitle:** "Hệ sinh thái Giáo dục STEM"
- **Tên tài liệu:** `<title>Geleximco STEM Platform</title>` trong `index.html`
- **Icon hệ thống:** thay `Building2` (icon tòa nhà) → icon `Atom` (nguyên tử) hoặc SVG kết hợp Atom + GraduationCap trên gradient đỏ `#990803 → #7a0602`.
- **Favicon:** mới, kích thước 32/64/192 px.

### 9.2. Palette

Giữ nguyên brand đỏ và vàng, bổ sung tokens STEM trong `theme.css`:

```css
:root {
  /* giữ nguyên */
  --primary: #990803;
  --accent: #c8a84e;

  /* STEM tokens */
  --stem-tech:      #2563eb;   /* xanh công nghệ — AI, software, Dev Portal */
  --stem-lab:       #16a34a;   /* xanh phòng lab — equipment OK */
  --stem-warning:   #f59e0b;   /* cam cảnh báo — warranty due */
  --stem-innovate:  #7c3aed;   /* tím đổi mới — CT3/CT5 */

  /* Màu 5 chương trình */
  --ct1: #64748b;   /* CT1 Tích hợp nội môn — xám trung tính */
  --ct2: #0891b2;   /* CT2 Liên môn — cyan */
  --ct3: #7c3aed;   /* CT3 Đổi mới sáng tạo — tím */
  --ct4: #dc2626;   /* CT4 Robotic/AI — đỏ tech */
  --ct5: #059669;   /* CT5 Nghiên cứu — xanh nghiên cứu */

  /* Màu 3 gói */
  --tier-minimum:  #94a3b8;
  --tier-basic:    #2e86de;
  --tier-advanced: #c8a84e;   /* khớp accent */

  /* Data quality "Đúng – Đủ – Sạch – Sống" */
  --dq-correct: #16a34a;
  --dq-complete: #0891b2;
  --dq-clean: #7c3aed;
  --dq-alive: #f59e0b;
}

.dark {
  /* điều chỉnh giảm độ bão hòa cho dark mode */
  --stem-tech:     #3b82f6;
  --stem-lab:      #22c55e;
  --stem-innovate: #a78bfa;
  --ct1: #94a3b8; --ct2: #22d3ee; --ct3: #a78bfa; --ct4: #f87171; --ct5: #34d399;
}
```

Cập nhật `@theme inline` để expose các biến trên dưới dạng `--color-stem-tech` v.v.

### 9.3. Typography
- **Font chính:** Inter (đang dùng) — giữ nguyên.
- **Font headings tùy chọn:** Plus Jakarta Sans (tải về dạng `@font-face` trong `fonts.css`, fallback Inter).
- Kích cỡ và weight giữ theme hiện tại.

### 9.4. Iconography
Dùng `lucide-react` (đã cài). Map icon đề xuất:

| Đối tượng | Icon |
|---|---|
| NCC | `Factory` hoặc `Warehouse` |
| Đại lý | `Handshake` |
| Trường | `School` |
| Sở/Bộ | `Landmark` |
| Giáo viên | `GraduationCap` |
| Học sinh | `User` |
| System Admin | `Shield` |
| Chương trình CT1–CT5 | `Puzzle`, `Network`, `Lightbulb`, `Bot`, `Microscope` |
| Gói Tối thiểu / Cơ bản / Nâng cao | `Boxes`, `FlaskConical`, `Cpu` |
| Thiết bị | `Cog` |
| Bảo hành | `Wrench` |
| License | `FileBadge`, `KeyRound` |
| Kho ảo | `Warehouse` |
| CSDL Quốc gia | `Database`, `Network` |
| VNeID | `BadgeCheck`, `IdCard` |
| AI-Buddy | `Bot`, `Sparkles` |
| Dev Portal | `Plug`, `Terminal`, `CodeXml` |
| Data Lake "4Đ" | `CheckCircle2`, `PackageCheck`, `Droplets`, `Activity` |

### 9.5. Hình ảnh minh họa
- **Không dùng ảnh cũ corporate training Unsplash.**
- Chuẩn bị bộ ~30 ảnh Unsplash với search terms gợi ý:
  - `stem lab`, `robotics classroom`, `science experiment kids`, `coding for kids`, `3d printer education`, `ai tutor children`, `microscope student`, `circuit board workshop`, `drone school project`.
- Lưu URL vào `mock-data/media.ts`.

### 9.6. Components UI bổ sung
- **`ProgramBadge.tsx`:** hiển thị nhãn CT1–CT5 với màu chuẩn.
- **`TierBadge.tsx`:** nhãn gói Tối thiểu/Cơ bản/Nâng cao.
- **`TenantBadge.tsx`:** hiển thị tenant với icon theo loại.
- **`DataQualityBadge.tsx`:** hiển thị 4 tick "Đúng/Đủ/Sạch/Sống".
- **`EmptyState` (mở rộng file hiện có):** thêm các variant theo bối cảnh STEM.
- **`KpiCard`:** trừu tượng hóa card KPI hiện có thành component tái sử dụng.

---

## 10. Ma trận phân quyền (RBAC Matrix)

File tham chiếu sẽ tạo: `src/app/components/permissions.ts` chứa constant `PERMISSIONS: Record<StemRole, string[]>` và helper `can(user, routePrefix)`.

### 10.1. Bảng truy cập namespace

| Role \ Namespace | /supplier | /distributor | /school | /authority | /teacher | /student | /admin | /shared |
|---|---|---|---|---|---|---|---|---|
| supplier_admin | ✅ | 👁 CRM | 👁 | — | — | — | — | ✅ |
| supplier_content | ⚠️ content + programs | — | — | — | — | — | — | ✅ |
| supplier_sales | ⚠️ orders + schools | 👁 | 👁 | — | — | — | — | ✅ |
| supplier_warranty | ⚠️ warranty + equipment | — | 👁 equipment | — | — | — | — | ✅ |
| distributor_admin | — | ✅ | 👁 customers | — | — | — | — | ✅ |
| distributor_sales | — | ⚠️ orders + CRM | 👁 | — | — | — | — | ✅ |
| distributor_finance | — | ⚠️ revenue + commission | — | — | — | — | — | ✅ |
| school_principal | — | — | ✅ | — | 👁 schedule | 👁 | — | ✅ |
| school_admin | — | — | ⚠️ purchase + equipment + license | — | — | — | — | ✅ |
| school_itadmin | — | — | ⚠️ equipment + license | — | — | — | — | ✅ |
| authority_admin | — | — | 👁 | ✅ | — | — | — | ✅ |
| authority_viewer | — | — | 👁 | ⚠️ read-only | — | — | — | ✅ |
| teacher | — | — | 👁 students | — | ✅ | 👁 | — | ✅ |
| student | — | — | — | — | — | ✅ | — | ✅ |
| system_admin | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | ✅ | ✅ |

Ký hiệu: ✅ full access | ⚠️ subset | 👁 chỉ xem | — không truy cập.

### 10.2. Helper
```typescript
export function can(user: StemUser, pathPrefix: string): boolean {
  return PERMISSIONS[user.stemRole]?.some(p =>
    pathPrefix.startsWith(p) || p === "*"
  ) ?? false;
}
```

`AuthGuard.tsx` dùng `can()` + redirect về dashboard mặc định nếu không có quyền.

---

## 11. Kế hoạch triển khai theo Phase (có Checklist & DoD)

> Tổng khối lượng: **~19 ngày công** 1 người (có thể nén 12–13 ngày nếu 2 người song song).

### Phase 0 — Chuẩn bị (0.5 ngày)
**Checklist:**
- [ ] Tạo branch `stem-transform` từ `main` hiện tại.
- [ ] Cài đặt: `npm install`; xác nhận `npm run dev` chạy, `npm run build` pass.
- [ ] Chụp baseline screenshots 10 trang chính (lưu `docs/screenshots/before/`).
- [ ] Thêm file `docs/STEM-Transformation-Plan.md` (chính tài liệu này).
- [ ] Thêm file `docs/IA-7-modules.md`, `docs/data-model.md`, `docs/permission-matrix.md`, `docs/api-contract-spec.md` (placeholder).
- [ ] Đặt biến `VITE_APP_NAME = "Geleximco STEM Platform"` trong `.env`.

**DoD:** Branch có PR "[WIP] STEM transform — scaffold"; local dev chạy ổn định.

### Phase 1 — Nền tảng: Brand + Auth + Routing (2 ngày)
**Checklist:**
- [ ] Cập nhật `src/styles/theme.css` — thêm tokens STEM (mục 9.2) cho light + dark.
- [ ] Đổi `index.html`: `<title>` + favicon.
- [ ] `Layout.tsx`: đổi logo + text "GELEXIMCO STEM" + subtitle + icon `Atom`.
- [ ] `AuthContext.tsx`: mở rộng type (`TenantType`, `StemRole`, `tenantId`, `vneidVerified`); cập nhật `demoAccounts` với 7 tài khoản (1 cho mỗi loại chính).
- [ ] `Login.tsx`: thiết kế lại trang đăng nhập với:
  - Hero trái (giới thiệu hệ sinh thái STEM, 5 chương trình).
  - Form đăng nhập + nút SSO giả lập + "Đăng nhập bằng VNeID" (mock).
  - Grid 7 tile demo login theo role (có badge tenantType + role).
- [ ] Tạo `components/permissions.ts` với matrix và helper `can()`.
- [ ] Cập nhật `AuthGuard.tsx`: kiểm tra `can()` và redirect `/<tenantType>/dashboard`.
- [ ] Viết lại `routes.ts` theo cấu trúc 7 namespace (mục 7.1) — dùng `lazy()` load từng module.
- [ ] Viết lại `getNavGroups()` trong `Layout.tsx` thành hàm nhận `user` và trả nav theo role; đặt tạm stub item trỏ tới route mới.
- [ ] Tạo page stub `ComingSoon.tsx` cho mọi route chưa có component; gán vào routes.
- [ ] Cập nhật `GlobalSearch.tsx` — mở rộng catalog item để index đa entity (tạm để placeholder).
- [ ] Cập nhật `ChatbotPanel.tsx` đổi brand "GelBot" → "AI-Buddy STEM" tạm thời.

**DoD:**
- Đăng nhập bằng 7 tài khoản → mỗi tài khoản vào đúng dashboard namespace, sidebar hiển thị nav tương ứng.
- Click tất cả các menu item không crash, có thể là trang "Coming soon".
- Dark mode hoạt động ổn định trên trang Login và Layout.

### Phase 2 — Mock data (1.5 ngày)
**Checklist:**
- [ ] Tạo thư mục `mock-data/` và tách file theo domain (mục 8.3).
- [ ] Định nghĩa tất cả types trong `mock-data/types.ts` (mục 8.1).
- [ ] Tạo `mock-data/constants.ts`: `STEM_PROGRAMS` (CT1–CT5 với màu/mô tả), `STEM_TIERS` (3 gói), `GRADES` (Mầm non → THPT Nghề), `SUBJECTS`, `NEdu_FIELDS`.
- [ ] Sinh mock tối thiểu theo bảng ở mục 8.2. Viết helper `faker`-like thuần TS (không cần thêm dependency).
- [ ] Cập nhật `mock-data.ts` gốc — re-export từ `mock-data/index.ts` để không làm vỡ các import cũ.
- [ ] Thay ảnh Unsplash `courseImages` → ảnh STEM trong `mock-data/media.ts`.

**DoD:**
- `import { demoStemPackages, demoEquipment, demoOrders, demoSchools, ... } from "./mock-data"` chạy ổn định.
- Không còn lỗi TypeScript trong bước build.

### Phase 3 — Phân hệ NCC + Đại lý (B2B core, 4 ngày)

**Thứ tự thực hiện (đã sắp theo dependency):**
1. `stem/supplier/STEMPackageCatalog.tsx`
2. `stem/supplier/STEMPackageConfigurator.tsx` (form builder tham số, dùng `react-hook-form` + Radix Accordion)
3. `stem/supplier/STEMProgramManager.tsx` (CRUD CT1–CT5 + mapping SGK)
4. `stem/supplier/MediaAssetManager.tsx`
5. `stem/supplier/STEMOrderManagement.tsx`
6. `stem/supplier/LicenseDistribution.tsx` + `SoftwareInstaller.tsx`
7. `stem/supplier/WarrantyFulfillment.tsx` (kanban + SLA)
8. `stem/supplier/SupplierRevenueDashboard.tsx`
9. `stem/distributor/DistributorOrderBoard.tsx` (kanban)
10. `stem/distributor/STEMContractManagement.tsx`
11. `stem/distributor/VirtualInventory.tsx`
12. `stem/distributor/CommissionReconciliation.tsx`
13. `stem/distributor/RevenueReports.tsx` (Recharts)
14. `stem/distributor/CRMCustomerManagement.tsx`
15. `stem/distributor/CustomerCare.tsx`
16. `stem/distributor/SalesApp.tsx` (chế độ compact cho mobile)

**DoD:**
- Login supplier_admin → chạy qua mọi menu; có thể tạo đơn hàng demo, xem warranty kanban, xem doanh thu.
- Login distributor_admin → chạy end-to-end: thấy đơn hàng → tạo hợp đồng → duyệt commission.

### Phase 4 — Phân hệ Trường + GV + HS (B2C core, 4 ngày)

**Thứ tự:**
1. `stem/school/SchoolPurchaseFlow.tsx` (wizard)
2. `stem/school/EquipmentInventory.tsx`
3. `stem/school/WarrantyTicketing.tsx`
4. `stem/school/TeacherManagement.tsx`
5. `stem/school/StudentManagement.tsx`
6. `stem/school/STEMSchedulePlanner.tsx` (kéo-thả, `react-dnd`)
7. `stem/school/SchoolLicensePanel.tsx`
8. `stem/school/SchoolSTEMEffectivenessReport.tsx`
9. `stem/teacher/STEMScheduleViewer.tsx`
10. `stem/teacher/TeacherTrainingHub.tsx`
11. `stem/teacher/TeacherResourceDownloader.tsx`
12. `stem/teacher/ClassroomEquipmentCheck.tsx`
13. `stem/teacher/StudentProgressTracker.tsx`
14. `stem/teacher/LessonPlanBuilder.tsx` (tích hợp AI-Buddy suggest)
15. `stem/student/StudentHome.tsx`
16. `stem/student/StudentScheduleViewer.tsx`
17. `stem/student/StudentLessonPlayer.tsx` (wrapper quanh `LearningPlayer`)
18. `stem/student/STEMExamParticipation.tsx` (tái dùng `exam/*`)
19. `stem/student/StudentAchievements.tsx`

**DoD:**
- User journey end-to-end (mục 12) chạy trôi chảy từ bước 3 → 7.

### Phase 5 — Phân hệ Cơ quan QL (3 ngày)
1. `stem/authority/SchoolDirectory.tsx`
2. `stem/authority/RegionalEducationDashboard.tsx` (KPI + heatmap — Recharts)
3. `stem/authority/EquipmentComplianceMonitor.tsx`
4. `stem/authority/ProcurementCostAnalytics.tsx`
5. `stem/authority/NationalDataSync.tsx` (status "Đúng/Đủ/Sạch/Sống")
6. `stem/authority/CommonCatalogManager.tsx`
7. `stem/authority/MinistryReportExporter.tsx` (xuất PDF/Excel mock)

**DoD:** Login authority_admin → xem dashboard toàn ngành, xuất 1 báo cáo mẫu.

### Phase 6 — System Admin + Tích hợp (2 ngày)
1. Nâng cấp `TenantManagement.tsx` → quản lý 4 loại tenant.
2. `stem/admin/TenantOnboarding.tsx` (wizard 4 bước: thông tin → gói license → admin user → confirm).
3. `stem/admin/LicenseMonitoring.tsx`.
4. Nâng cấp `IntegrationHub.tsx` → `stem/admin/DevPortal.tsx` (API catalog + keys + OpenAPI doc).
5. Nâng cấp `DataCenter.tsx` thành Data Lake (tab: Overview / CSDL Quốc gia / VNeID / ETL / 4Đ quality).
6. `stem/admin/SecurityConfig.tsx` (SSL, SSO, 2FA, encryption, audit policy).
7. Nâng cấp `WhiteLabelConfig.tsx` → `stem/admin/PlatformConfig.tsx` (branding tenant + plugin + OTA).
8. `stem/admin/CrossTenantAccessLog.tsx`.
9. Viết `docs/api-contract-spec.md` với OpenAPI draft 8 endpoint chính.

**DoD:** System admin khởi tạo thành công 1 tenant trường mới qua wizard; xem được metrics license toàn hệ thống.

### Phase 7 — AI-Buddy + Polish + QA (2 ngày)
**AI-Buddy:**
- [ ] Hoàn thiện `stem/ai/AIBuddyPanel.tsx` với 4 tab.
- [ ] `AIBuddyChat.tsx` — nâng cấp nội dung prompts cho giáo dục.
- [ ] `AIBuddyRecommend.tsx` — gợi ý theo hồ sơ HS.
- [ ] Tích hợp `AIGrading.tsx` đã có vào tab Chấm bài.
- [ ] `AIBuddyAnalyze.tsx` — strengths/weakness chart (Recharts Radar).
- [ ] Floating trigger AI-Buddy xuất hiện trên mọi layout (đã sẵn từ `ChatbotPanel`).

**Dọn dẹp:**
- [ ] Xóa khỏi `routes.ts` + `getNavGroups()` mọi route ở mục 5.2 (giữ file trên disk).
- [ ] Cập nhật `GlobalSearch.tsx` index dữ liệu mới (trường, thiết bị, đơn hàng, bài giảng, kỳ thi, GV, HS).
- [ ] Đi qua từng trang mới kiểm tra responsive (breakpoint `sm`, `md`, `lg`, `xl`).
- [ ] Kiểm tra dark mode từng trang.
- [ ] Chạy Accessibility check (Radix đã a11y tốt — chỉ cần kiểm tra aria-label + tab order + contrast tokens mới).
- [ ] Chụp `after` screenshots vào `docs/screenshots/after/`.
- [ ] Viết lại `README.md` + `ATTRIBUTIONS.md` để mô tả hệ thống mới.
- [ ] `npm run build` pass, không TS warning.

**DoD:** Demo được 7 tài khoản × 5 kịch bản chính (mục 12) × 2 theme × 3 breakpoint mà không lỗi console.

---

## 12. User Journeys nghiệm thu

### Journey A — "Từ catalog đến lớp học"
1. **NCC (supplier_admin)** tạo gói "STEM Nâng cao" → dùng Configurator cấu hình 15 tiêu chí → publish.
2. **Đại lý (distributor_sales)** thấy sản phẩm mới trong kho ảo → CRM giới thiệu cho 3 trường THCS.
3. **Hiệu trưởng (school_principal) Trường THCS A** đặt mua 1 gói Nâng cao → đơn hàng đi qua Đại lý → NCC duyệt → phát license.
4. **System Admin** tự động cấp license cho 30 HS + 5 GV qua Auto-License rule.
5. **Giáo viên Toán (teacher)** mở kho học liệu → tải giáo án CT2 (Liên môn Toán–Lý) → tạo lịch STEM thứ 3 tiết 4.
6. **Học sinh (student)** mở app → thấy tiết STEM thứ 3 → vào player học → làm quiz cuối giờ → AI-Buddy chấm tự động.

### Journey B — "Sự cố thiết bị"
1. **Giáo viên** vào lớp → `ClassroomEquipmentCheck` → phát hiện bộ cảm biến hỏng → tạo ticket kèm ảnh.
2. **Hiệu trưởng** duyệt → ticket chuyển NCC.
3. **Supplier (supplier_warranty)** tiếp nhận → chỉ định kỹ thuật viên → SLA 3 ngày.
4. **Trường** theo dõi trạng thái real-time → nhận thiết bị thay thế → đóng ticket.

### Journey C — "Giám sát Sở GD&ĐT"
1. **Authority Admin** mở Dashboard → thấy Trường A có 95% tiết STEM được triển khai.
2. Drill-down vào `EquipmentComplianceMonitor` → thấy Huyện X có 30% thiết bị chưa đạt chuẩn.
3. Vào `ProcurementCostAnalytics` → xuất biểu đồ chi phí theo nguồn.
4. Mở `MinistryReportExporter` → chọn Thông tư 38/2023 → xuất PDF.
5. Vào `NationalDataSync` → bấm "Đồng bộ ngay" → thấy tất cả "Đúng – Đủ – Sạch – Sống" đều xanh.

### Journey D — "Onboarding tenant"
1. **System Admin** mở `TenantOnboarding` → nhập thông tin Đại lý "Giáo dục ABC" → gán gói 500 license → tạo tài khoản admin → gửi email kích hoạt (mock).
2. **Admin Đại lý mới** nhận link → `/onboarding/<code>` → set mật khẩu → login → vào dashboard distributor.

### Journey E — "Tập huấn giáo viên 5 năm"
1. **NCC (supplier_content)** publish chương trình tập huấn CT4 (Robotic).
2. **Giáo viên** mở `TeacherTrainingHub` → đăng ký → xem video → làm bài kiểm tra → nhận chứng chỉ STEM cấp 2.
3. Dashboard trường hiển thị tỷ lệ giáo viên đã đạt chứng chỉ.

---

## 13. Tiêu chí chất lượng & Kiểm thử

### 13.1. Code quality
- TypeScript strict, không có `any` trừ khi không thể tránh (có `// eslint-disable` kèm giải thích).
- Mỗi file `.tsx` không quá 500 dòng — tách sub-component nếu vượt.
- Không import thư viện mới nếu không thật sự cần (ưu tiên dùng các thư viện đã có).
- Naming convention: component `PascalCase`, hook `useXxx`, helper `camelCase`, constant `UPPER_SNAKE_CASE`.
- Sử dụng `cn()` helper từ `ui/utils.ts` để compose className.

### 13.2. UX checklist cho mỗi trang mới
- [ ] Có breadcrumb đúng cấp.
- [ ] Có empty state khi chưa có dữ liệu.
- [ ] Có loading skeleton khi fetch giả lập (`setTimeout` 300ms).
- [ ] Có toast xác nhận thành công/lỗi (`sonner`).
- [ ] Có `ConfirmDialog` cho thao tác phá hủy.
- [ ] Có responsive xuống 375px (mobile S) — hoặc hiển thị bảng có horizontal scroll.
- [ ] Keyboard a11y: Tab chạy đúng; Enter/Space kích hoạt button; Escape đóng modal.
- [ ] Dark mode không vỡ layout và contrast đủ.
- [ ] Copy tiếng Việt chuẩn — không lẫn English trong UI chính.

### 13.3. Performance
- Code-splitting mỗi namespace (`/supplier`, `/distributor`, ...) bằng `React.lazy()` trong `routes.ts`.
- Không import toàn bộ `lucide-react` — chỉ `import { X, Y } from "lucide-react"`.
- Recharts: set `responsive container` và tránh re-render không cần thiết (`useMemo` cho data series).

### 13.4. QA test matrix
- 7 tài khoản demo × 3 breakpoint (mobile/tablet/desktop) × 2 theme (light/dark).
- Tối thiểu smoke test: đăng nhập → điều hướng mọi menu → không crash console.
- Tập trung kiểm thử journey A/B/C ở mục 12.

---

## 14. Rủi ro & Biện pháp giảm nhẹ

| Rủi ro | Tác động | Mức | Biện pháp |
|---|---|---|---|
| 70+ component hiện có, ôm hết gây dư thừa / loãng UX | Khó bảo trì, giao diện không chuyên nghiệp | Cao | Áp dụng ma trận mục 5 nghiêm ngặt; comment route & ẩn khỏi nav với module loại bỏ |
| Multi-tenancy khó thể hiện trên UI khi chỉ có mock data | Demo không thuyết phục | Trung | Hiển thị `TenantBadge` rõ trên header; cung cấp tenant switcher (ctrl+shift+T) cho System Admin |
| VNeID / CSDL Quốc gia chưa có API thật | Không test được luồng đồng bộ | Trung | UI mock chân thực với trạng thái queued/running/done; đặc tả OpenAPI trong `docs/api-contract-spec.md` để team backend dùng sau |
| 5 chương trình CT1–CT5 đòi hỏi hiểu nghiệp vụ giáo dục | Nội dung giáo án mock có thể sai chuyên môn | Thấp | Dùng mô tả ở mục 3.1 làm nguồn duy nhất; không chế tạo nội dung chuyên ngành quá sâu; ghi chú "nội dung minh họa" trong UI mock |
| Khối lượng 19 ngày — timeline dài, dễ scope creep | Chậm giao | Trung | Mỗi Phase có DoD rõ; mỗi Phase tự demo độc lập; không thêm feature ngoài bảng |
| Thay đổi palette STEM có thể vỡ contrast dark mode | A11y fail | Thấp | Test contrast bằng DevTools mỗi khi thêm token mới |
| Khác biệt hiển thị Windows/Mac (font, scrollbar) | UX không đồng đều | Thấp | Dùng `scrollbar-width: thin` đã có; font Inter self-host |
| `react-dnd` kéo-thả lịch học có thể chậm nếu nhiều entry | UX chậm | Thấp | Giới hạn render chỉ tuần hiện tại; dùng `React.memo` cho cell |

---

## 15. Deliverables

### 15.1. Source code
- Branch: `stem-transform`.
- PR gộp: "STEM Transform — 7 phân hệ, brand mới, data lake, AI-Buddy".
- `npm run build` pass không warning.

### 15.2. Documentation
| File | Nội dung |
|---|---|
| `docs/STEM-Transformation-Plan.md` | Tài liệu này (nguồn chính) |
| `docs/IA-7-modules.md` | Bản đồ IA chi tiết + nav từng phân hệ |
| `docs/data-model.md` | Sơ đồ ER + mô tả entity |
| `docs/permission-matrix.md` | Ma trận RBAC mở rộng |
| `docs/api-contract-spec.md` | OpenAPI draft cho Order, Warranty, License, Schedule, Exam, VNeID, NEdu, Dev Portal |
| `docs/screenshots/before/` | Baseline trước transform |
| `docs/screenshots/after/` | Kết quả sau transform (7 dashboard × 2 theme) |
| `README.md` | Mô tả hệ thống mới + hướng dẫn chạy + 7 tài khoản demo |
| `ATTRIBUTIONS.md` | Cập nhật attributions mới |

### 15.3. Demo
- 7 tài khoản login hiển thị sẵn trên trang Login với nút "Dùng ngay".
- Một trình tự demo 15 phút chạy qua 5 user journey (A–E) ở mục 12.

---

## 16. Ước lượng khối lượng

| Phase | Mô tả | Ngày công |
|---|---|---|
| 0 | Chuẩn bị | 0.5 |
| 1 | Brand + Auth + Routing | 2.0 |
| 2 | Mock data | 1.5 |
| 3 | NCC + Đại lý | 4.0 |
| 4 | Trường + GV + HS | 4.0 |
| 5 | Cơ quan QL | 3.0 |
| 6 | System Admin | 2.0 |
| 7 | AI-Buddy + Polish + QA | 2.0 |
| | **Tổng** | **19 ngày** |

**Tối ưu với 2 developer song song:**
- Dev A: Phase 3 + Phase 5 (NCC/Đại lý/Sở) — 7 ngày.
- Dev B: Phase 4 + Phase 6 (Trường/GV/HS/Admin) — 6 ngày.
- Cả hai cùng Phase 7 — 1 ngày.
- Cộng Phase 0+1+2 đồng loạt — 4 ngày.
- **Tổng nén: ~12 ngày lịch.**

---

## 17. Phụ lục

### 17.1. Danh sách demo accounts

| Email | Password | Role | Tenant |
|---|---|---|---|
| `supplier@geleximco-stem.vn` | `stem@123` | supplier_admin | Geleximco STEM (NCC) |
| `content@geleximco-stem.vn` | `stem@123` | supplier_content | Geleximco STEM (NCC) |
| `distributor@abc-edu.vn` | `stem@123` | distributor_admin | Đại lý Giáo dục ABC |
| `sales@abc-edu.vn` | `stem@123` | distributor_sales | Đại lý Giáo dục ABC |
| `principal@thcs-bavi.edu.vn` | `stem@123` | school_principal | Trường THCS Ba Vì |
| `teacher.toan@thcs-bavi.edu.vn` | `stem@123` | teacher | Trường THCS Ba Vì |
| `student01@thcs-bavi.edu.vn` | `stem@123` | student | Trường THCS Ba Vì |
| `doet@hanoi.gov.vn` | `stem@123` | authority_admin | Sở GD&ĐT Hà Nội |
| `sysadmin@geleximco-stem.vn` | `stem@123` | system_admin | Platform |

### 17.2. Danh mục route kế thừa cần ẩn
```
/kpi-okr, /budget, /compliance, /idp, /skill-matrix, /competency-gap,
/marketplace, /mentoring, /social-learning, /study-groups,
/gamification, /leaderboard, /achievements, /badges,
/reviews, /surveys, /ai-recommendations
```

### 17.3. Quy tắc commit
- Prefix theo Phase: `phase-1: add STEM theme tokens`, `phase-3: add STEMPackageCatalog`.
- Mỗi Phase kết thúc bằng commit `phase-N: DoD checklist verified`.

### 17.4. Gợi ý kế hoạch sau khi hoàn thành
Sau khi bản "transform" hoàn tất và được nghiệm thu demo, các hạng mục sau có thể mở tiếp (ngoài phạm vi kế hoạch này):
- **Backend thật:** triển khai API theo `docs/api-contract-spec.md` (NestJS / Go / Python).
- **Database:** PostgreSQL + Row-Level Security cho multi-tenant.
- **Authentication thật:** Keycloak / Auth0 + SSO + VNeID OAuth.
- **AI thật:** kết nối Claude API / Gemini để thay AI-Buddy mock.
- **Mobile app:** bản React Native riêng cho Student và Teacher, dùng shared component library.
- **Hoàn thiện gamification, IDP, mentoring** nếu được yêu cầu mở rộng sản phẩm.

---

**Kế hoạch này phản ánh đầy đủ 100% thông tin trong `STEM Geleximco.docx`** (toàn văn bảng mô tả 7 phân hệ + 6 infographic về 5 chương trình, 3 gói phòng, AI-Buddy, API Gateway, Data Lake, VNeID, kho ảo, đồng hành 5 năm, báo cáo Bộ GD&ĐT, multi-tenancy, bảo mật).

Mọi điều chỉnh/cắt giảm phạm vi nên được ghi bổ sung vào **phụ lục 17** với ghi chú ngày và lý do.
