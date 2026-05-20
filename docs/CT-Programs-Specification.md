# ĐẶC TẢ CHI TIẾT 5 CHƯƠNG TRÌNH STEM (CT1–CT5)

> **Phiên bản:** 1.0
> **Ngày lập:** 2026-05-19
> **Nguồn:**
> - `Cautruc chuong trinh Geleximco.xlsx` (9 sheet)
> - `STEM-Transformation-Plan.md` (Section 3.1)
> - Công văn 5512/BGDĐT (4 hoạt động dạy học)
> **Mục đích:** Tài liệu tham chiếu CHUẨN khi thiết kế Lesson Editor, Content Bank, Configurator Tab 4, và Analytics. Dùng làm Single Source of Truth cho 5 CT.

---

## Mục lục

1. [Tổng quan 5 CT](#1-tổng-quan-5-ct)
2. [Cấu trúc dữ liệu bài học mỗi CT](#2-cấu-trúc-dữ-liệu-bài-học-mỗi-ct)
3. [Bộ 9 học liệu chuẩn (Excel sheet "Học liệu, thiết bị")](#3-bộ-9-học-liệu-chuẩn-excel-sheet-học-liệu-thiết-bị)
4. [14 thành phần gói phòng STEM (Excel sheet "Mô hình phòng")](#4-14-thành-phần-gói-phòng-stem-excel-sheet-mô-hình-phòng)
5. [CT1 — Tích hợp trong môn học](#5-ct1--tích-hợp-trong-môn-học)
6. [CT2 — Tích hợp liên môn](#6-ct2--tích-hợp-liên-môn)
7. [CT3 — Đổi mới sáng tạo (buổi 2)](#7-ct3--đổi-mới-sáng-tạo-buổi-2)
8. [CT4 — Robotic, AI, IoT](#8-ct4--robotic-ai-iot)
9. [CT5 — Trải nghiệm / Nghiên cứu KH](#9-ct5--trải-nghiệmnghiên-cứu-kh)
10. [Bảng tổng hợp template per CT](#10-bảng-tổng-hợp-template-per-ct)
11. [Block types — danh mục đầy đủ + CT nào dùng](#11-block-types--danh-mục-đầy-đủ--ct-nào-dùng)
12. [Năng lực cốt lõi STEM — 6 năng lực](#12-năng-lực-cốt-lõi-stem--6-năng-lực)
13. [Mapping với data model hiện tại](#13-mapping-với-data-model-hiện-tại)
14. [Đề xuất TypeScript types](#14-đề-xuất-typescript-types)
15. [Phụ lục: cách Excel skeleton ánh xạ vào hệ thống](#15-phụ-lục-cách-excel-skeleton-ánh-xạ-vào-hệ-thống)

---

## 1. Tổng quan 5 CT

Trích nguyên văn từ Sheet "CT STEM":

| Mã | Tên chính thức | Mô tả phương thức | Đối tượng GV phụ trách |
|---|---|---|---|
| **CT1** | GD STEM tích hợp **trong môn học** (quản lý theo từng môn) | Dạy bài học của môn học theo phương thức STEM | Giáo viên các môn học |
| **CT2** | GD STEM tích hợp **liên môn** (theo nhóm môn học) | Dạy chủ đề tích hợp liên môn (Môn chủ đạo + môn tích hợp) | Giáo viên nhóm môn |
| **CT3** | GD STEM tăng cường **định hướng đổi mới, sáng tạo** (coi như môn học dạy buổi 2) | Được xếp TKB như môn học/HĐGD (vận dụng kiến thức các môn học) | Giáo viên nhà trường |
| **CT4** | GD STEM **Robotic, AI, IoT** (tăng cường) | Chương trình công nghệ chuyên sâu | GV tin học + GV có khả năng |
| **CT5** | **Trải nghiệm / Nghiên cứu khoa học** | Dành cho CLB, học sinh có năng khiếu | (không nêu rõ — thường GV nghiên cứu) |

### 1.1. Bậc học áp dụng (chung cho cả 5 CT)

Theo Sheet "CT STEM" cột:
1. Mẫu giáo
2. Tiểu học
3. THCS
4. THPT
5. THPT Nghề
6. Trường liên cấp

> **Lưu ý:** "Trường liên cấp" là tenant đặc biệt phục vụ trường nhiều cấp học, **KHÔNG phải bậc học riêng**. Khi áp dụng vào data model, có thể coi nó là "tenant tag" chứ không phải `gradeLevel` riêng.

### 1.2. Phân loại theo tính chất

```
┌─────────────────────────────────────────────────────────┐
│   CT TRONG TKB CHÍNH KHOÁ   │   CT NGOẠI KHOÁ / TĂNG    │
├──────────────────────────────┼────────────────────────────┤
│   CT1 (môn học)              │   CT3 (buổi 2)             │
│   CT2 (liên môn)             │   CT4 (Robotic/AI/IoT)     │
│                              │   CT5 (CLB/NCKH)           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Cấu trúc dữ liệu bài học mỗi CT

Trích từ Sheet `CT1` đến `CT5`. Mỗi sheet là ma trận **đơn vị bài học × bậc học**.

| CT | Đơn vị | Số đơn vị tối đa | Cách phân loại |
|---|---|---|---|
| **CT1** | Môn học (Môn 1, Môn 2, ..., Môn 9) | 9 × 6 bậc = **54 cell** | Theo MÔN HỌC riêng lẻ |
| **CT2** | Nhóm môn (Nhóm môn 1, ..., Nhóm môn 9) | 9 × 6 bậc = **54 cell** | Theo NHÓM môn (môn chủ đạo + môn tích hợp) |
| **CT3** | Chương trình tăng cường (1–4) | 4 × 6 bậc = **24 cell** | Theo chương trình tăng cường ngoại khoá |
| **CT4** | 4 module CỐ ĐỊNH (xem 8.1) | 4 × 6 bậc = **24 cell** | Theo công nghệ (Robotics/AI/IoT/Combined) |
| **CT5** | Chủ đề nghiên cứu (1–18) | 18 × 6 bậc = **108 cell** | Theo chủ đề NCKH |

→ Tổng cộng có **264 "cell"** cấu thành ma trận bài học toàn nền tảng.

---

## 3. Bộ 9 học liệu chuẩn (Excel sheet "Học liệu, thiết bị")

**Mỗi cell (CT × Bậc)** PHẢI có đầy đủ 9 loại học liệu sau:

| # | Loại học liệu | Người dùng cuối | Bắt buộc? | Loại file |
|---|---|---|---|---|
| 1 | **Kế hoạch tổ chức** (phân phối chương trình theo tháng/tuần) | CBQL, GV | Có | .docx, .pdf |
| 2 | **Tài liệu bồi dưỡng giáo viên** | CBQL, GV | Có | .pdf, video |
| 3 | **Kế hoạch bài dạy** theo bài học/chủ đề | GV | **Bắt buộc** | .docx |
| 4 | **Bài giảng (PPTX)** theo bài học/chủ đề | GV | **Bắt buộc** | .pptx |
| 5 | **Video hướng dẫn giáo viên** | GV | Có | .mp4, YouTube link |
| 6 | **Video hướng dẫn học sinh** | HS | Có | .mp4, YouTube link |
| 7 | **Phiếu học tập** của học sinh | HS | **Bắt buộc** | .pdf, .docx |
| 8 | **Danh mục học liệu** (thiết bị theo chủ đề/bài học) | GV, HS | Có | Auto-gen từ BOM |
| 9 | **Bài tập, kiểm tra, đánh giá, mở rộng** | GV, HS | **Bắt buộc** | .pdf, .docx |

→ Đây là **9 slot CỐ ĐỊNH** trong Lesson Editor, KHÔNG phải URL list tuỳ ý.

---

## 4. 14 thành phần gói phòng STEM (Excel sheet "Mô hình phòng")

**Gói phòng × Bậc học** — 3 gói (Tối thiểu / Cơ bản / Nâng cao) × 6 bậc:

| # | Thành phần |
|---|---|
| 1 | Cơ sở vật chất phòng (thiết kế, bàn ghế) |
| 2 | Thiết bị kết nối thông minh |
| 3 | Nội thất, thiết bị chuyên dụng |
| 4 | **Bài học STEM CT1** |
| 5 | **Bài học STEM CT2** |
| 6 | **Bài học STEM CT3** |
| 7 | **Chủ đề STEM CT4** |
| 8 | **Chủ đề STEM CT5** |
| 9 | Tài liệu học sinh |
| 10 | Tài liệu giáo viên |
| 11 | Tập huấn giáo viên, CBQL |
| 12 | Trang trí phòng |
| 13 | Chương trình hỗ trợ, đồng hành 5 năm |
| 14 | Hệ sinh thái các kì thi STEM |

→ **Ý nghĩa quan trọng:** Mỗi gói phòng phải bao gồm bài học/chủ đề của **TẤT CẢ 5 CT** (mục #4–8). Gói tối thiểu có thể chỉ CT1 cơ bản, gói nâng cao có đầy đủ CT4 + CT5.

---

## 5. CT1 — Tích hợp trong môn học

### 5.1. Định nghĩa

Dạy **bài học của môn học** theo phương thức STEM. Không thay đổi nội dung môn — chỉ thay phương pháp dạy (thực tiễn, ứng dụng, sáng tạo).

### 5.2. Đối tượng

- **GV phụ trách:** Giáo viên các môn học (Toán, Lý, Hóa, Sinh, Tin học, Công nghệ, Tự nhiên, Công nghệ thông tin, Mỹ thuật, ...)
- **HS:** Toàn trường (theo môn học chính khoá)
- **TKB:** Trong giờ học chính của môn → không cần slot riêng

### 5.3. Đơn vị bài giảng

1 bài CT1 = 1 bài học của 1 môn cụ thể, dạy theo phương thức STEM.

**Ví dụ tiêu đề:**
- "Bài 24: Lực ma sát — Ứng dụng STEM trong cuộc sống"
- "Bài 15: Phân thức đại số — STEM toán học"

### 5.4. Cấu trúc 4 phase (chuẩn Công văn 5512/BGDĐT)

| # | Phase | Tên trong CT1 | Mục tiêu | Thời gian gợi ý |
|---|---|---|---|---|
| 1 | Mở đầu | **Khởi động** | Tình huống kích thích — câu hỏi thực tế, video ngắn | 5–7p |
| 2 | Hình thành kiến thức | **Kiến thức mới** | Lý thuyết cô đọng — sơ đồ, ví dụ minh hoạ | 12–15p |
| 3 | Luyện tập | **Luyện tập** | Áp dụng kiến thức vào bài tập | 12–15p |
| 4 | Vận dụng | **Vận dụng STEM** | Kết nối thực tế — bài toán thực tiễn | 5–10p |

### 5.5. Metadata bắt buộc

| Field | Type | Bắt buộc | Note |
|---|---|---|---|
| Bậc học | enum (6 bậc) | ✅ | |
| Khối lớp | string | ✅ | VD "THCS 8" |
| Môn học | select 1 | ✅ | 1 môn duy nhất |
| Bài SGK | SGK picker | ✅ | Map đến Chương → Bài SGK Bộ GD&ĐT |
| Thời lượng | number | ✅ | Default 45p |
| Năng lực phát triển | multi-select 6 | ✅ | Thường 2–3 năng lực |
| Thiết bị cần | device-picker | Tuỳ | Gói "Tối thiểu" đủ |

### 5.6. Block types

- Mọi block chuẩn (Tiêu đề, Đoạn văn, Hình ảnh, Video, Quiz, Đoạn code, File đính kèm)
- Quiz tuỳ chọn
- Group activity TUỲ chọn (không bắt buộc)

### 5.7. Thiết bị

Gói **Tối thiểu** (xem [Mô hình phòng](#4-14-thành-phần-gói-phòng-stem-excel-sheet-mô-hình-phòng)):
- Bộ dụng cụ STEM tại nhà/lớp
- Có thể dùng vật liệu sẵn có (giấy, kéo, băng dính, pin AA, đèn LED, ...)

### 5.8. Đánh giá

- Quiz 5–10 câu (đáp án đúng/sai)
- Phiếu học tập cuối tiết
- Không yêu cầu rubric phức tạp

---

## 6. CT2 — Tích hợp liên môn

### 6.1. Định nghĩa

Dạy **chủ đề tích hợp liên môn** — vận dụng kiến thức từ NHIỀU môn để giải quyết 1 vấn đề thực tiễn. Có 1 môn **chủ đạo** và N môn **tích hợp**.

### 6.2. Đối tượng

- **GV phụ trách:** Giáo viên nhóm môn (thường tổ Khoa học tự nhiên — Toán/Lý/Hoá/Sinh, hoặc tổ Công nghệ — Tin/Công nghệ/Mỹ thuật)
- **HS:** Toàn trường
- **TKB:** Tiết của môn chủ đạo, hoặc tiết liên môn riêng

### 6.3. Đơn vị bài giảng

1 bài CT2 = 1 chủ đề tích hợp, có:
- **Môn chủ đạo** (1 môn)
- **Môn tích hợp** (1–4 môn còn lại)
- Vấn đề thực tiễn cụ thể

**Ví dụ tiêu đề:**
- "Chủ đề: Năng lượng tái tạo — Vật lý + Hoá học + Công nghệ"
- "Chủ đề: Thiết kế cầu giấy chịu lực — Toán + Kỹ thuật + Mỹ thuật"
- "Chủ đề: Phân tích chất dinh dưỡng — Hoá + Sinh + Tin học"

### 6.4. Cấu trúc 4 phase (5512 + phase 3 dài hơn)

| # | Phase | Tên trong CT2 | Mục tiêu | Thời gian gợi ý |
|---|---|---|---|---|
| 1 | Mở đầu | **Khởi động liên môn** | Tình huống thực tế đa môn | 5–10p |
| 2 | Hình thành kiến thức | **Kiến thức liên môn** | KT từng môn liên quan đến chủ đề | 15–20p |
| 3 | Luyện tập | **Thực hành tích hợp** ⭐ | Vận dụng KT đa môn — phase chính | 20–40p |
| 4 | Vận dụng | **Đánh giá sản phẩm** | Trình bày sản phẩm tích hợp | 10–15p |

### 6.5. Metadata bắt buộc

| Field | Type | Bắt buộc | Note |
|---|---|---|---|
| Bậc học, Khối lớp | | ✅ | |
| **Môn chủ đạo** | select 1 | ✅ | Driver subject |
| **Môn tích hợp** | multi-select | ✅ | 1–4 môn khác |
| **Chủ đề tích hợp** | text | ✅ | Tên chủ đề |
| Bài SGK liên quan | multi-picker SGK | Có | Từ NHIỀU môn |
| Thời lượng | number | ✅ | 45 / 90 / 135p (1–3 tiết) |
| Năng lực phát triển | multi-select 6 | ✅ | Thường 3–4 năng lực |
| Thiết bị cần | device-picker | ✅ | Bắt buộc có BOM |

### 6.6. Block types

Tất cả block chuẩn + **2 block mới**:
- **`subject-roles`** — Bảng phân vai trò các môn trong chủ đề (môn này đóng vai gì? đóng góp kiến thức nào?)
- **`group-activity`** — Hoạt động nhóm (khuyến nghị, không bắt buộc)

### 6.7. Đánh giá

- Quiz tích hợp (câu hỏi xuyên môn)
- Rubric đánh giá SẢN PHẨM TÍCH HỢP (đơn giản, 4–5 tiêu chí)
- Đánh giá hoạt động nhóm

---

## 7. CT3 — Đổi mới sáng tạo (buổi 2)

### 7.1. Định nghĩa

Chương trình GD STEM tăng cường, **xếp TKB như môn học** (buổi 2). Vận dụng KT các môn để tạo SẢN PHẨM SÁNG TẠO. Là "môn học sáng tạo riêng" — không gắn SGK cụ thể.

### 7.2. Đối tượng

- **GV phụ trách:** Giáo viên nhà trường (general — có thể tổ chức, không bắt buộc chuyên môn cụ thể)
- **HS:** Toàn trường (buổi 2)
- **TKB:** Slot buổi 2 — xếp như môn học riêng

### 7.3. Đơn vị bài giảng

1 bài CT3 = 1 hoạt động đổi mới sáng tạo, có ý tưởng cốt lõi + sản phẩm cuối cụ thể.

**Ví dụ tiêu đề:**
- "Thiết kế xe đua bằng năng lượng gió"
- "Sáng tạo robot dọn rác mini từ bìa carton"
- "Vẽ tranh STEM theo phong cách Da Vinci"

### 7.4. Cấu trúc 4 phase (đổi tên — emphasis trên sáng tạo)

| # | Phase | Tên trong CT3 | Mục tiêu | Thời gian |
|---|---|---|---|---|
| 1 | Mở đầu | **Khám phá vấn đề** | Đặt vấn đề thực tế, kích thích sáng tạo | 5–10p |
| 2 | Hình thành KT | **Kiến thức nền** | KT tối thiểu cần để giải quyết | 10–15p |
| 3 | Luyện tập | **Sáng tạo & Tạo mẫu** ⭐ | Prototyping — phase chính, dài nhất | 20–30p |
| 4 | Vận dụng | **Trình bày & Phản hồi** | Show-and-tell, nhận góp ý | 5–10p |

### 7.5. Metadata bắt buộc

| Field | Type | Bắt buộc | Note |
|---|---|---|---|
| Bậc học, Khối lớp | | ✅ | |
| **Tên hoạt động** | text | ✅ | Tên độc lập (không gắn môn) |
| **Lĩnh vực** | enum | ✅ | STEM Art / Tin học sáng tạo / Khoa học VL / Cơ khí / ... |
| **Sản phẩm cuối dự kiến** | text | ✅ | Output cụ thể — bắt buộc khai báo |
| Số HS/nhóm | number | ✅ | Default 3–5 |
| Thời lượng | number | ✅ | Default 45p, có thể 90p |
| Năng lực phát triển | multi-select 6 | ✅ | Thường 4–5 năng lực |
| Thiết bị cần | device-picker | ✅ | Đa dạng — tuỳ ý tưởng |

> **Lưu ý:** CT3 KHÔNG có SGK mapping — vì đây là môn riêng buổi 2.

### 7.6. Block types

Tất cả block chuẩn + **bắt buộc 1 block mới:**
- **`group-activity`** — Hoạt động nhóm (BẮT BUỘC — vì CT3 trọng tâm là làm việc nhóm sáng tạo)
- **`rubric`** — Rubric đánh giá sản phẩm (BẮT BUỘC — chi tiết)

### 7.7. Đánh giá

- Rubric đánh giá SẢN PHẨM SÁNG TẠO (4–6 tiêu chí):
  - Ý tưởng sáng tạo (25%)
  - Tính khả thi (20%)
  - Hoàn thiện sản phẩm (25%)
  - Trình bày (15%)
  - Hợp tác nhóm (15%)
- Phản hồi đồng đẳng (peer review)

---

## 8. CT4 — Robotic, AI, IoT

### 8.1. Định nghĩa

Chương trình GD STEM **chuyên sâu công nghệ** — Robotic, AI, IoT. Có 4 module CỐ ĐỊNH (theo Excel sheet CT4):

| # | Tên module | Mô tả ngắn |
|---|---|---|
| 1 | **Chương trình Robotics 1** | Cơ bản — lắp ráp + lập trình robot Block-based |
| 2 | **Chương trình AI** | ML cơ bản — Teachable Machine, Computer Vision |
| 3 | **Chương trình IoT** | Arduino + cảm biến + smart device |
| 4 | **Chương trình Robotics + AI** | Kết hợp robot tự động hoá có AI |

### 8.2. Đối tượng

- **GV phụ trách:** GV tin học + GV có khả năng (Toán/Lý/Kỹ thuật)
- **HS:** THCS, THPT (chủ yếu), có thể Tiểu học (Block-based)
- **TKB:** Slot riêng, thường 2 tiết liền (90p) — không nên dưới 60p

### 8.3. Đơn vị bài giảng

1 bài CT4 = 1 buổi học của 1 module — có Code/Logic cụ thể + Phần cứng cụ thể.

**Ví dụ tiêu đề:**
- "Robotics 1 — Bài 3: Lập trình robot né vật cản"
- "AI — Bài 5: Phân loại ảnh với Teachable Machine"
- "IoT — Bài 7: Trạm thời tiết mini với DHT11"

### 8.4. Cấu trúc 5 phase (mở rộng 5512 + Test/Debug)

| # | Phase | Tên trong CT4 | Mục tiêu | Thời gian |
|---|---|---|---|---|
| 1 | Khởi động | **Khởi động** | Demo robot/AI/IoT đã hoàn thành | 5–10p |
| 2 | Hình thành KT | **Lý thuyết** | Kiến thức công nghệ + thuật toán | 10–15p |
| 3 | Thực hành 1 | **Lắp ráp & Lập trình** ⭐ | Hardware + Code — phase chính | 30–50p |
| 4 | Thực hành 2 | **Test & Debug** ⭐ | Chạy thử, sửa lỗi, tối ưu | 15–25p |
| 5 | Vận dụng | **Đánh giá** | Demo sản phẩm + reflection | 5–10p |

### 8.5. Metadata bắt buộc

| Field | Type | Bắt buộc | Note |
|---|---|---|---|
| Bậc học, Khối lớp | | ✅ | |
| **Module chính** | enum (4) | ✅ | Robotics 1 / AI / IoT / Robotics+AI |
| **Ngôn ngữ lập trình** | enum | ✅ | Scratch / Block-based / Arduino C / Python / mBlock |
| **Phần cứng cần** | multi-device-picker | ✅ | Arduino UNO, HC-SR04, DHT11, motor servo, ... |
| Thời lượng | number | ✅ | Default 90p (2 tiết) |
| **Lưu ý an toàn** | textarea | ✅ | Pre-fill theo module — an toàn điện/pin/mỏ hàn |
| Năng lực phát triển | multi-select 6 | ✅ | Nặng GQVĐ + Kỹ sư |
| SGK mapping | (tuỳ) | Tuỳ chọn | Có thể liên kết Tin học/Vật lý |

### 8.6. Block types

Tất cả block chuẩn + **2 block mới bắt buộc:**
- **`code`** — Đoạn code có syntax highlight (Scratch JSON, Block-based XML, Arduino C, Python)
  - PHẢI là Monaco editor hoặc syntax-aware block
- **`safety-notes`** — Block lưu ý an toàn (bắt buộc — màu cam cảnh báo)
- **`group-activity`** — Nhóm 2–3 HS/bộ kit (bắt buộc)

### 8.7. Thiết bị (BOM kèm theo)

Theo gói "Cơ bản" hoặc "Nâng cao":
- **Robotics 1:** Robot kit (mBot, LEGO Mindstorms, mBlock kit)
- **AI:** Laptop + webcam + Teachable Machine account
- **IoT:** Arduino UNO + Breadboard + Cảm biến + Module
- **Robotics + AI:** Combo robot + AI camera

### 8.8. Đánh giá

- Rubric đánh giá CHI TIẾT:
  - Robot/Sản phẩm chạy đúng (30%)
  - Code clean & logic (25%)
  - Khả năng debug (15%)
  - Thuyết trình (15%)
  - Hợp tác (15%)
- Demo sản phẩm trước lớp
- Bài kiểm tra trắc nghiệm code (5 câu)

---

## 9. CT5 — Trải nghiệm / Nghiên cứu KH

### 9.1. Định nghĩa

**KHÁC BIỆT LỚN NHẤT:** CT5 KHÔNG phải "bài giảng 45 phút" — mà là **đề tài nghiên cứu dài hạn** (3 tháng – 2 năm). Theo phương pháp nghiên cứu khoa học. Đầu ra: bài báo KH, poster, dự thi KH-KT cấp tỉnh/quốc gia.

### 9.2. Đối tượng

- **HS:** HS năng khiếu (THCS, THPT) — tự nguyện, có chọn lọc
- **GV:** GV hướng dẫn 1-1 hoặc nhóm nhỏ
- **TKB:** Sinh hoạt CLB / Ngoài giờ học

### 9.3. Đơn vị "bài giảng"

1 "bài giảng" CT5 = 1 **dự án nghiên cứu** với chủ đề từ 18 chủ đề Excel sheet CT5 (Chủ đề 1–18).

Trong context Excel, mỗi cell (chủ đề × bậc học) là 1 đề tài cụ thể.

**Ví dụ đề tài:**
- "Nghiên cứu lọc nước từ thực vật bản địa Việt Nam"
- "Đánh giá ảnh hưởng của vi khuẩn lactic lên chất lượng nem chua truyền thống"
- "Hệ thống giám sát chất lượng không khí học đường bằng IoT"

### 9.4. Cấu trúc 8 phase (theo PP NCKH — KHÔNG theo 5512)

| # | Phase | Mục tiêu | Thời gian dự kiến |
|---|---|---|---|
| 1 | **Câu hỏi nghiên cứu** | Đặt câu hỏi tốt, narrow scope | 2–4 tuần |
| 2 | **Tổng quan tài liệu** | Đọc, tổng hợp tài liệu sẵn có | 2–4 tuần |
| 3 | **Giả thuyết** | Đề xuất giả thuyết có thể kiểm chứng | 1–2 tuần |
| 4 | **Phương pháp** | Thiết kế thí nghiệm/khảo sát | 2 tuần |
| 5 | **Thu thập dữ liệu** | Thực hiện thí nghiệm, ghi nhận | 4–12 tuần |
| 6 | **Phân tích dữ liệu** | Xử lý số liệu, vẽ chart, kiểm định | 2–4 tuần |
| 7 | **Kết luận & Đề xuất** | Trả lời câu hỏi NC, đưa ra kiến nghị | 1–2 tuần |
| 8 | **Báo cáo / Poster / Bài báo** | Viết báo cáo, làm poster, đăng bài | 2–4 tuần |

→ Tổng: **~3 tháng** (đề tài nhỏ) đến **~2 năm** (đề tài dài, 5 năm kế hoạch).

### 9.5. Metadata bắt buộc

| Field | Type | Bắt buộc | Note |
|---|---|---|---|
| Bậc học | enum (THCS / THPT chủ yếu) | ✅ | Hiếm gặp Tiểu học |
| **Chủ đề NCKH** | select từ 18 chủ đề | ✅ | Theo Excel CT5 |
| **HS dẫn đầu** | select student | ✅ | HS năng khiếu |
| **GV hướng dẫn** | select teacher | ✅ | 1-1 mentor |
| **Thời gian dự kiến** | enum | ✅ | 3 tháng / 6 tháng / 1 năm / 2 năm |
| **Câu hỏi nghiên cứu** | textarea | ✅ | Phải rõ ràng, có thể kiểm chứng |
| **Giả thuyết** | textarea | ✅ | Sau phase 3 mới fill |
| **Phương pháp** | textarea | ✅ | Sau phase 4 mới fill |
| **Đầu ra dự kiến** | multi-select | ✅ | Bài báo KH / Poster / Hội thi KH-KT / Sản phẩm thực |
| **Plan 5 năm** | timeline | Tuỳ | Đối với HS năng khiếu chuyên sâu |

### 9.6. Block types

Tất cả block chuẩn + **5 block hoàn toàn mới:**
- **`research-question`** — Câu hỏi NC (cấu trúc: Câu hỏi chính + Câu hỏi phụ)
- **`literature-citation`** — Trích dẫn nguồn (Định dạng APA/MLA)
- **`data-table`** — Bảng dữ liệu thu thập (rows × cols, editable)
- **`chart`** — Biểu đồ (line/bar/scatter) — render từ data-table
- **`hypothesis`** — Giả thuyết có cấu trúc (Nếu... thì...)
- **`group-activity`** — Nhóm nghiên cứu (nhỏ — 2–3 HS hoặc 1 HS + GV)

### 9.7. Đánh giá

Tiêu chí đánh giá theo chuẩn **Hội thi KHKT cấp tỉnh/quốc gia**:
- Tính khoa học (25%)
- Tính sáng tạo (20%)
- Phương pháp (20%)
- Trình bày báo cáo / poster (15%)
- Khả năng trả lời câu hỏi (20%)

### 9.8. Liên kết với hệ thống

CT5 cần tích hợp với:
- **STEMExamEcosystem** — đăng ký dự thi KH-KT
- **Teacher Training** — bồi dưỡng GV hướng dẫn NCKH
- **Authority Module** — báo cáo cấp Sở/Bộ về kết quả NCKH
- **ContentBank** — bài báo, poster sau khi công bố

---

## 10. Bảng tổng hợp template per CT

| Tiêu chí | **CT1** | **CT2** | **CT3** | **CT4** | **CT5** |
|---|---|---|---|---|---|
| Vị trí TKB | Tiết chính | Tiết chính / Liên môn | Buổi 2 | Slot riêng (90p) | CLB / ngoài giờ |
| Thời lượng default | 45p | 45–135p | 45p | 90–120p | 3 tháng – 2 năm |
| Số phase | 4 (5512) | 4 (5512) | 4 (đổi tên) | **5** | **8 (NCKH)** |
| SGK mapping | ✅ bắt buộc | ✅ bắt buộc (nhiều môn) | ❌ | tuỳ | ❌ |
| Group activity | tuỳ | khuyến nghị | **bắt buộc** | **bắt buộc** | **bắt buộc** |
| Số năng lực core | 2–3 | 3–4 | 4–5 | 4–5 | 6 (full) |
| Rubric đánh giá | đơn giản | vừa | **chi tiết** | **chi tiết** | **phức tạp** (KHKT) |
| Block bắt buộc mới | — | `subject-roles` | `group-activity`, `rubric` | `code`, `safety-notes`, `group-activity` | `research-question`, `data-table`, `chart`, `citation`, `hypothesis` |
| Số block mới cần dev | 0 | 1 | 2 | 3 | 5 |
| Workflow approval | Bình thường (draft→review→published) | Bình thường | Bình thường | Bình thường | **Đặc biệt** — có thêm "đang nghiên cứu" / "đã công bố" |
| Module/Chủ đề lock | — | — | 4 chương trình tăng cường | **4 module cố định** | **18 chủ đề** |

---

## 11. Block types — danh mục đầy đủ + CT nào dùng

### 11.1. Block hiện có (7 block)

| Block | Mô tả | CT1 | CT2 | CT3 | CT4 | CT5 |
|---|---|---|---|---|---|---|
| `heading` | Tiêu đề H1/H2/H3 | ✅ | ✅ | ✅ | ✅ | ✅ |
| `text` | Đoạn văn | ✅ | ✅ | ✅ | ✅ | ✅ |
| `image` | Hình ảnh | ✅ | ✅ | ✅ | ✅ | ✅ |
| `video` | Video (upload hoặc YouTube) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `quiz` | Câu hỏi trắc nghiệm | ✅ | ✅ | ✅ | ✅ | ✅ |
| `code` | Đoạn code (cần upgrade syntax) | tuỳ | tuỳ | tuỳ | ✅ **bắt buộc** | ✅ |
| `attachment` | File đính kèm | ✅ | ✅ | ✅ | ✅ | ✅ |

### 11.2. Block cần phát triển mới (7 block)

| Block | Mô tả | CT cần | Độ ưu tiên |
|---|---|---|---|
| `subject-roles` | Bảng phân vai trò các môn trong chủ đề tích hợp | CT2 | **HIGH** |
| `group-activity` | Hoạt động nhóm — số HS/nhóm, vai trò, sản phẩm | CT3, CT4, CT5 | **HIGH** |
| `rubric` | Bảng tiêu chí × mức độ × điểm | CT3, CT4, CT5 | **HIGH** |
| `safety-notes` | Block lưu ý an toàn (cảnh báo cam) | CT4 | **HIGH** |
| `research-question` | Câu hỏi nghiên cứu structured | CT5 | MEDIUM |
| `data-table` | Bảng dữ liệu thu thập (rows × cols) | CT5 | MEDIUM |
| `chart` | Biểu đồ (link với data-table) | CT5 | LOW (có thể dùng image trước) |
| `literature-citation` | Trích dẫn nguồn APA/MLA | CT5 | LOW |
| `hypothesis` | Giả thuyết "Nếu... thì..." structured | CT5 | LOW |

---

## 12. Năng lực cốt lõi STEM — 6 năng lực

Theo `TeachingEffectivenessAnalytics.tsx` (đã có trong code), 6 năng lực cốt lõi STEM được tracking:

| # | Năng lực | Mô tả ngắn | CT phát triển mạnh |
|---|---|---|---|
| 1 | **Sáng tạo** | Creative thinking — tạo ra ý tưởng mới, sản phẩm mới | CT3, CT4 |
| 2 | **Phản biện** | Critical thinking — đánh giá, phân tích lập luận | CT2, CT5 |
| 3 | **Hợp tác** | Collaboration — làm việc nhóm hiệu quả | CT3, CT4, CT5 |
| 4 | **Giao tiếp** | Communication — trình bày ý tưởng, tranh luận | CT2, CT3, CT5 |
| 5 | **GQVĐ** | Problem solving — giải quyết vấn đề có cấu trúc | CT4, CT5 |
| 6 | **Kỹ sư** | Engineering mindset — thiết kế, prototype, iterate | CT3, CT4 |

→ **Mỗi bài giảng tag năng lực sẽ phát triển** → Analytics tự động tổng hợp được dashboard 6 năng lực toàn mạng.

---

## 13. Mapping với data model hiện tại

### 13.1. So sánh `Lesson` type hiện tại vs spec mới

```typescript
// HIỆN TẠI (types.ts)
export interface Lesson {
  id: string;
  title: string;
  description: string;
  programCode: StemProgram;        // ✅ đã có
  gradeLevel: string;              // ✅ đã có (cần thêm enum bậc học chuẩn)
  subject: string;                 // ✅ đã có
  sgkMapping?: string;             // ✅ optional → CẦN bắt buộc cho CT1/CT2
  durationMinutes: number;         // ✅ đã có
  resourceUrls: string[];          // ❌ refactor → 9 attachment slots
  thumbnail: string;
  createdBy: string;
  createdAt: string;
}
```

### 13.2. Đề xuất schema mới

```typescript
export interface Lesson {
  // === Core (chung mọi CT) ===
  id: string;
  title: string;
  description: string;
  programCode: StemProgram;
  gradeLevel: BậcHọc;              // enum mới
  klass: string;                    // VD "THCS 8", "Tiểu học 5"
  durationMinutes: number;
  status: "draft" | "review" | "published" | "researching" | "completed";
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
  thumbnail: string;

  // === CT-specific metadata (discriminated union) ===
  ctMetadata: CT1Meta | CT2Meta | CT3Meta | CT4Meta | CT5Meta;

  // === Pedagogy (chung) ===
  competencies: Competency[];       // 6 năng lực
  blocks: Block[];                  // có phase + blockType
  attachments: AttachmentSlot[];    // 9 slot CỐ ĐỊNH
}

type BậcHọc = "MauGiao" | "TieuHoc" | "THCS" | "THPT" | "THPTNghe" | "LienCap";
type Competency = "sang_tao" | "phan_bien" | "hop_tac" | "giao_tiep" | "gqvd" | "ky_su";

interface CT1Meta {
  type: "CT1";
  subject: string;                  // 1 môn
  sgkBook: SGKReference;            // ✅ BẮT BUỘC
}

interface CT2Meta {
  type: "CT2";
  drivingSubject: string;           // Môn chủ đạo
  integratedSubjects: string[];     // Môn tích hợp
  topic: string;                    // Tên chủ đề tích hợp
  sgkBooks: SGKReference[];         // ✅ Nhiều bài SGK
}

interface CT3Meta {
  type: "CT3";
  activityName: string;
  domain: "stem_art" | "tin_hoc" | "khoa_hoc_vl" | "co_khi" | "khac";
  finalProduct: string;             // ✅ Sản phẩm cuối
  studentsPerGroup: number;
}

interface CT4Meta {
  type: "CT4";
  module: "robotics_1" | "ai" | "iot" | "robotics_ai";
  language: "scratch" | "block" | "arduino_c" | "python" | "mblock";
  requiredHardware: DeviceRef[];    // BOM bắt buộc
  safetyNotes: string;
}

interface CT5Meta {
  type: "CT5";
  topicCode: string;                // 1 trong 18 chủ đề
  leadStudentId: string;
  mentorTeacherId: string;
  expectedDuration: "3m" | "6m" | "1y" | "2y";
  researchQuestion: string;
  hypothesis?: string;
  methodology?: string;
  expectedOutputs: Array<"paper" | "poster" | "competition" | "real_product">;
  fiveYearPlan?: YearPlan[];
}

interface AttachmentSlot {
  type: "organization_plan" | "teacher_training_doc" | "lesson_plan" | "pptx"
      | "teacher_video"  | "student_video" | "student_worksheet"
      | "equipment_list" | "exercises_assessment";
  required: boolean;
  fileUrl?: string;
  uploadedAt?: string;
}

interface Block {
  id: string;
  phase: string;                    // CT-dependent phase ID
  type: BlockType;
  content: any;                     // type-specific shape
  order: number;
}

type BlockType =
  // Chung
  | "heading" | "text" | "image" | "video" | "quiz" | "code" | "attachment"
  // CT-specific
  | "subject-roles"      // CT2
  | "group-activity"     // CT3/CT4/CT5
  | "rubric"             // CT3/CT4/CT5
  | "safety-notes"       // CT4
  | "research-question"  // CT5
  | "data-table"         // CT5
  | "chart"              // CT5
  | "citation"           // CT5
  | "hypothesis";        // CT5
```

### 13.3. Migration plan

1. **Giữ `Lesson` cũ** cho 50 bài hiện có trong mock-data
2. **Thêm `Lesson v2`** với `ctMetadata` discriminated union
3. **Migrate dần** — bài CT1 không cần meta phức tạp; ưu tiên migrate CT4/CT5 vì khác biệt lớn nhất

---

## 14. Đề xuất TypeScript types

File mới: `mock-data/ct-templates.ts`

```typescript
import type { StemProgram } from "./types";

export interface Phase {
  id: string;
  label: string;
  color: string;
  hint: string;
  targetMin: number;
}

export interface CTTemplate {
  code: StemProgram;
  fullName: string;
  shortName: string;
  description: string;
  targetTeacher: string;
  scheduleSlot: "main" | "session2" | "club_extra";
  defaultDuration: number;
  phases: Phase[];
  metadataFields: MetadataField[];
  mandatoryBlocks: BlockType[];
  availableBlocks: BlockType[];
  groupActivityRequired: boolean;
  sgkMappingRequired: boolean;
  rubricComplexity: "simple" | "medium" | "detailed" | "research_grade";
}

export const CT_TEMPLATES: Record<StemProgram, CTTemplate> = {
  CT1: { /* ... spec từ section 5 ... */ },
  CT2: { /* ... spec từ section 6 ... */ },
  CT3: { /* ... spec từ section 7 ... */ },
  CT4: { /* ... spec từ section 8 ... */ },
  CT5: { /* ... spec từ section 9 ... */ },
};

// 18 chủ đề CT5 từ Excel (Chủ đề 1-18, placeholder names)
export const CT5_TOPICS = [
  { id: "CT5-T01", name: "Chủ đề 1 — [cần fill]" },
  // ... 18 items
];

// 4 module CT4 cố định
export const CT4_MODULES = [
  { id: "robotics_1",   name: "Robotics 1",          languages: ["scratch", "block", "mblock"] },
  { id: "ai",           name: "AI",                  languages: ["python", "scratch"] },
  { id: "iot",          name: "IoT",                 languages: ["arduino_c", "python"] },
  { id: "robotics_ai",  name: "Robotics + AI",       languages: ["python", "arduino_c"] },
];

// 9 attachment slots chuẩn
export const ATTACHMENT_SLOT_TEMPLATES = [
  { type: "organization_plan",     label: "Kế hoạch tổ chức",                 forUser: "CBQL,GV",   required: true,  acceptedTypes: [".docx", ".pdf"] },
  { type: "teacher_training_doc",  label: "Tài liệu bồi dưỡng giáo viên",     forUser: "CBQL,GV",   required: true,  acceptedTypes: [".pdf", "video"] },
  { type: "lesson_plan",           label: "Kế hoạch bài dạy",                 forUser: "GV",        required: true,  acceptedTypes: [".docx"] },
  { type: "pptx",                  label: "Bài giảng PPTX",                   forUser: "GV",        required: true,  acceptedTypes: [".pptx"] },
  { type: "teacher_video",         label: "Video hướng dẫn giáo viên",        forUser: "GV",        required: false, acceptedTypes: [".mp4", "youtube"] },
  { type: "student_video",         label: "Video hướng dẫn học sinh",         forUser: "HS",        required: false, acceptedTypes: [".mp4", "youtube"] },
  { type: "student_worksheet",     label: "Phiếu học tập của học sinh",       forUser: "HS",        required: true,  acceptedTypes: [".pdf", ".docx"] },
  { type: "equipment_list",        label: "Danh mục học liệu",                forUser: "GV,HS",     required: false, acceptedTypes: ["auto"] },
  { type: "exercises_assessment",  label: "Bài tập, kiểm tra, đánh giá",      forUser: "GV,HS",     required: true,  acceptedTypes: [".pdf", ".docx"] },
];
```

---

## 15. Phụ lục: cách Excel skeleton ánh xạ vào hệ thống

### 15.1. Bảng ánh xạ

| Excel Sheet | Ý nghĩa | Vị trí trong hệ thống |
|---|---|---|
| `CT STEM` | Định nghĩa 5 CT | `mock-data/types.ts` → `STEM_PROGRAMS` (đã có) |
| `CT1`, `CT2` | Ma trận Môn × Bậc học | `mock-data/ct-templates.ts` → `CT_SUBJECTS_BY_GRADE` (cần tạo) |
| `CT3` | 4 chương trình tăng cường × Bậc | `CT3_REINFORCEMENT_PROGRAMS` (cần tạo) |
| `CT4` | 4 module công nghệ × Bậc | `CT4_MODULES` (cần tạo) |
| `CT5` | 18 chủ đề NCKH × Bậc | `CT5_RESEARCH_TOPICS` (cần tạo) |
| `Học liệu, thiết bị` | 9 loại học liệu × CT × Bậc | `ATTACHMENT_SLOT_TEMPLATES` (cần tạo) |
| `Mô hình phòng` | 14 thành phần × Gói × Bậc | `mock-data/packages.ts` (đã có concept, cần refactor) |
| `Danh mục các bài học` | (chưa fill nội dung) | Chờ Excel fill thêm |

### 15.2. Trạng thái hiện tại của Excel

⚠️ **Excel hiện CHỈ có cấu trúc (skeleton)**, các cell intersection (row Môn × col Bậc) CHƯA fill nội dung môn cụ thể. Cần Geleximco fill thêm:
- CT1: 9 môn × 6 bậc = 54 môn cụ thể
- CT2: 9 nhóm môn × 6 bậc = 54 nhóm
- CT3: 4 chương trình tăng cường × 6 bậc = 24 cụ thể
- CT5: 18 chủ đề × 6 bậc = 108 chủ đề cụ thể

Khi prototype, tạm dùng `SUBJECTS` mock-data + 18 chủ đề placeholder.

---

## 16. Phân tích Risk & Mitigation

| Risk | Tác động | Mitigation |
|---|---|---|
| Excel chưa fill nội dung cụ thể | Mock data không đủ chân thực | Dùng `SUBJECTS` từ mock-data + placeholder cho 18 chủ đề CT5; ghi rõ "(chờ Geleximco fill)" |
| CT5 dài hạn không fit vào `Lesson` UI | UX confusion | Tách `ResearchProjectEditor` riêng (component mới); CT5 không hiển thị trong "bài giảng 45p" view |
| 7 block mới cần dev | Effort lớn | Phân lớp ưu tiên — HIGH (subject-roles, group-activity, rubric, safety-notes) trước; LOW (chart, citation, hypothesis) sau |
| Migration data cũ | 50 lessons hiện có không fit schema mới | `Lesson v1` + `Lesson v2` cùng tồn tại; type guard discriminator |
| GV không quen workflow CT5 NCKH | Adoption thấp | Trong S3, sẽ có wizard step-by-step + AI assist mạnh hơn |

---

## 17. Deliverables tiếp theo

Sau khi spec này được phê duyệt:

1. **`mock-data/ct-templates.ts`** — concrete TypeScript constants cho 5 CT
2. **Refactor `LessonEditor`** — đọc template động theo `programCode`
3. **Mới: `CTSelectorWizard`** — 3-step wizard chọn CT/Bậc/Module
4. **Mới: `ResearchProjectEditor`** — CT5 component riêng
5. **7 block mới** — components trong `components/stem/lesson-blocks/`
6. **Refactor "Tài liệu GV"** — 9 attachment slots chuẩn
7. **Update Tab 4 Configurator** — hiển thị CT badge với metadata khác nhau khi chọn bài

---

**Hết tài liệu.**
