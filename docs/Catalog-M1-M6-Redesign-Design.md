# THIẾT KẾ LẠI 2 NHÓM MODULE — SẢN PHẨM & GIẢI PHÁP · NỘI DUNG & ĐÀO TẠO
## Theo chuẩn `DanhMuc_STEM_Geleximco.xlsx` + 6 Module M1–M6

| Thông tin | Chi tiết |
|---|---|
| Loại tài liệu | BA Design Document — đầu vào cho redesign giao diện |
| Phạm vi | 8 màn thuộc 2 nhóm module phía NCC: **Sản phẩm & Giải pháp** (4 màn) + **Nội dung & Đào tạo** (4 màn) |
| Nguồn | `DanhMuc_STEM_Geleximco.xlsx`; biên bản họp EBD & Nexta 20/05; chuỗi brainstorm 21/05 |
| Phiên bản | v3.0 — 2026-05-21 (mở rộng từ v2.1 "Danh mục & Gói" ra toàn bộ 2 nhóm module) |
| Bước kế tiếp | Redesign giao diện 8 màn theo tài liệu này |
| Liên quan | `Operations-Business-Analysis.md`, `CT-Programs-Specification.md` |

---

# PHẦN I — TỔNG QUAN

## 1. MỤC TIÊU & PHẠM VI

### 1.1 Mục tiêu
Thiết kế lại mô hình dữ liệu và giao diện cho 8 màn của 2 nhóm module phía NCC, bám chuẩn `DanhMuc_STEM_Geleximco.xlsx`, để hệ thống **thông minh và logic**: tự tính độ phủ chương trình, tự ràng buộc theo quy tắc nghiệp vụ, theo dõi tiến độ học liệu động.

### 1.2 Trong phạm vi
8 màn: Danh mục gói STEM · Danh mục Thiết bị · Chương trình STEM · Thư viện Media · Studio Biên soạn · Ngân hàng Nội dung · Hệ sinh thái Kỳ thi · Tập huấn Giáo viên. Mô hình dữ liệu chung; logic nghiệp vụ; luồng thao tác.

### 1.3 Ngoài phạm vi (V2 / đợt sau)
E-commerce, tầng NPP; định giá thật (giá xlsx là placeholder); Cuộc thi STEM; lớp vận hành kỳ thi (giao bài/chấm — thuộc role Giáo viên/Học sinh).

---

## 2. BẢN ĐỒ 8 MÀN / 2 NHÓM MODULE

| Nhóm | Màn hình | Vai trò nghiệp vụ | Thực thể dữ liệu chính |
|---|---|---|---|
| **Sản phẩm & Giải pháp** | Danh mục Thiết bị | Quản lý catalog sản phẩm theo M1–M6 | `StemCatalogItem` |
| | Danh mục Gói STEM | Tạo/quản lý gói phòng STEM (lắp từ StemCatalogItem) | `StemRoomPackage` |
| | Chương trình STEM | Trang tham chiếu CT1–CT5 + hub thống kê độ phủ | `CurriculumRequirement` (đọc) |
| | Thư viện Media | Kho asset dùng chung (ảnh/video/tài liệu) | `MediaAsset` |
| **Nội dung & Đào tạo** | Studio Biên soạn | Biên soạn bài giảng | `LessonV2` → `LessonSet` |
| | Ngân hàng Nội dung | Kho bài giảng đã publish | `LessonSet` / `LessonV2` |
| | Hệ sinh thái Kỳ thi | Biên soạn ngân hàng câu hỏi + đề (lớp biên soạn) | `Question` → `AssessmentSet` |
| | Tập huấn Giáo viên | Hub tổng hợp/quản lý tập huấn (kèm gói qua M6) | `TrainingSession` |

**Insight gắn kết toàn hệ:** mọi thứ NCC "biên soạn" đều là **Học liệu** = `LessonSet` (bài giảng) ∪ `AssessmentSet` (bộ đánh giá). Cả hai phân loại theo CT (suy ra), gắn được vào `StemCatalogItem`, bán kèm hoặc bán riêng, dùng chung mô hình "4 lớp / 3 gap".

---

## 3. CÁC QUYẾT ĐỊNH ĐÃ CHỐT

| Mã | Quyết định |
|---|---|
| QĐ-01 | 6 Module M1–M6 **thay thế** `configuration` 4-nhóm + cấu trúc configurator cũ |
| QĐ-02 | CT1–CT5 **giữ song song** làm chiều sư phạm, sống ở mức bài học |
| QĐ-03 | Gap học liệu **suy ra động** + mô hình hoá yêu cầu chương trình (`CurriculumRequirement`) |
| QĐ-04 | Thiết bị ↔ Học liệu nối qua **`LessonSet` trung gian** (không nhân đôi con số cam kết) |
| QĐ-05 | Gói **chụp snapshot** khi publish / gắn trường |
| QĐ-06 | CT/Môn/Lớp **suy ra** từ bài học, không gán; một thiết bị thuộc **nhiều CT** |
| QĐ-07 | Tạo gói **cho khai `StemCatalogItem` mới ngay trong luồng** (inline) |
| QĐ-08 | "Tạo gói mới" khởi đầu bằng **auto-đề xuất theo Cấp học + Tier** |
| QĐ-09 | Publish gói **cho phép khi bài chưa soạn đủ** (chỉ cảnh báo coverage); chặn cứng QT-1, QT-2 |
| QĐ-10 | **Tất cả bài giảng do NCC biên soạn** |
| QĐ-11 | Quan hệ bài học ↔ thiết bị **nhiều–nhiều**, làm ngay V1 |
| QĐ-12 | Làm **cả 4 cấp học** trong đợt này |
| QĐ-13 | Kỳ thi: `AssessmentSet` song song `LessonSet`; NCC tự quyết **bán kèm hoặc bán riêng** |
| QĐ-14 | Màn "Hệ sinh thái Kỳ thi" của NCC = **chỉ lớp biên soạn** |
| QĐ-15 | **Cuộc thi STEM để V2** |
| QĐ-16 | Tập huấn GV **đi kèm gói** (item M6); màn = **hub quản lý** tập huấn |

---

## 4. TÓM TẮT TÀI LIỆU NGUỒN

`DanhMuc_STEM_Geleximco.xlsx` — 5 sheet: TỔNG HỢP + 4 cấp học (Mầm non, Tiểu học, THCS, THPT).

**6 Module chuẩn:**

| Mã | Tên module | Bản chất | Cấp áp dụng |
|---|---|---|---|
| M1 | Khảo sát – Thiết kế – Cải tạo – Nội thất | Hạ tầng phòng, bàn ghế, tủ kệ, trang trí | 4/4 |
| M2 | Thiết bị Dùng chung | Màn tương tác, PC, âm thanh, kính hiển vi, in 3D, laser, internet | 4/4 |
| M3 | Thực hành Thí nghiệm STEM | Kit thí nghiệm + cảm biến gắn từng bài học | 4/4 |
| M4 | IoT & AI | micro:bit, Arduino, UNIHIKER, mô hình nhà thông minh | **Chỉ THCS, THPT** |
| M5 | Robotics | VEX GO/IQ/V5, Stick'Em, Talebot, UGOT, VR | 4/4 |
| M6 | Đào tạo & Hỗ trợ sau bán | Vận chuyển, lắp đặt, tập huấn GV, bảo trì 2 năm | 4/4 — **bắt buộc** |

**3 quy tắc vàng:** QT-1 Thiết bị & Học liệu đi cùng nhau · QT-2 M6 bắt buộc · QT-3 Pilot trước, Scale sau.

**Đặc điểm:** mỗi item gắn 1 Module + nhiều "Chương trình" (CT); tier ✓/½/(trống) theo từng item; multi-NCC trong một phòng; mã CP `{MN|TH|CS|PT}-M{1-6}-{NN}`. Công thức TỔNG HỢP: `NCC cung cấp = Hiện có + Cần tự xây`.

---

# PHẦN II — MÔ HÌNH NỀN TẢNG

## 5. MÔ HÌNH "HỌC LIỆU" — 4 LỚP TỒN TẠI

Đây là gốc của toàn bộ logic. Một bài học / một đề đánh giá **không phải một con số** — nó tồn tại ở 4 lớp:

| Lớp | Tên | Là gì | Lưu ở |
|---|---|---|---|
| **L1** | Yêu cầu CT | CT GDPT 2018 quy định cần bao nhiêu bài (môn/lớp) | `CurriculumRequirement` |
| **L2** | NCC cam kết | NCC khai "bộ này kèm 150 bài / 80 câu hỏi" | `LessonSet.declaredCount` · `AssessmentSet.declaredCount` |
| **L3** | Đã biên soạn | Bài/câu hỏi thật, có nội dung đầy đủ | `LessonV2` · `Question` |
| **L4** | Đã liên kết | Đã gắn đúng bộ, đã publish | `lessonIds` / `questionIds` (published) |

**Ba loại "gap" — suy ra động (QĐ-03):**

| Gap | Công thức | Ý nghĩa | Ai xử lý |
|---|---|---|---|
| Gap-CT | L1 − L2 | NCC không phủ hết chương trình | NCC biên soạn thêm (QĐ-10) |
| Gap-soạn | L2 − L3 | Đã hứa nhưng chưa giao nội dung | NCC |
| Gap-gắn | L3 − L4 | Đã có nhưng chưa dùng/publish | Hệ thống |

**Học liệu = umbrella 2 nhánh:** `LessonSet` (bài giảng) và `AssessmentSet` (bộ đánh giá) — cùng mô hình 4 lớp, cùng cơ chế gắn `StemCatalogItem`.

---

## 6. LOGIC SUY RA CT / MÔN / LỚP

CT, Môn, Lớp **không gán cho thiết bị hay gói** — chúng nổi lên (derive) theo chuỗi:

```
LessonV2 / Question   → đúng 1 CT, 1 môn, 1 lớp        (đơn vị nguyên tử)
   │ thuộc
   ▼
LessonSet / AssessmentSet → nhiều CT/môn/lớp           (declaredCtPrograms — NCC khai)
   │ gắn qua lessonSetId / assessmentSetId
   ▼
StemCatalogItem           → nhiều CT/môn/lớp               (SUY RA)
   │ nằm trong PackageLine
   ▼
StemRoomPackage       → nhiều CT/môn/lớp               (HỢP của mọi item)
```

**Hệ quả thiết kế:**
- `StemCatalogItem` **không lưu** CT. `LessonV2`/`Question` lưu CT đơn trị; bộ học liệu khai `declaredCtPrograms` đa trị; thiết bị và gói suy ra.
- Một thiết bị **thuộc nhiều CT** là bình thường (xlsx ghi "Chương trình 1-2", "3-4").
- **Không có thao tác "gán CT"** ở bất kỳ màn nào. Configurator **không có bước chọn CT**.
- Suy ra từ một nguồn (bài học) → không bao giờ lệch; sửa bài → CT tự cập nhật.

Tham chiếu Module ↔ CT (chỉ là xu hướng): M3 ~ CT1/CT2 · M4 ~ CT4 · M5 ~ CT4 (VR ~ CT5) · Khang Thịnh ~ CT3.

---

## 7. MÔ HÌNH DỮ LIỆU ĐẦY ĐỦ

### 7.1 Kiểu nền tảng

```ts
export type SchoolLevel   = "mam_non" | "tieu_hoc" | "thcs" | "thpt";
export type ModuleCode    = "M1" | "M2" | "M3" | "M4" | "M5" | "M6";
export type TierInclusion = "full" | "partial" | "none";    // ✓ / ½ / (trống)
export type ItemKind      = "equipment" | "material" | "content" | "service";
export type StemPackageTier = "minimum" | "basic" | "advanced";
// StemProgram = "CT1".."CT5" — giữ nguyên enum hiện có
```

### 7.2 Tham chiếu

```ts
export interface StemModule {
  code: ModuleCode; name: string; shortName: string; description: string;
  order: number; mandatory: boolean; availableLevels: SchoolLevel[];
}
export interface CurriculumRequirement {        // L1
  id: string; level: SchoolLevel; grade: string; subject: string;
  ctProgram: StemProgram; requiredLessons: number; note?: string;
}
```

### 7.3 Học liệu — Bài giảng

```ts
export interface LessonSet {
  id: string; name: string; level: SchoolLevel; module: ModuleCode;
  declaredCtPrograms: StemProgram[];          // L2 — đa trị
  ownerSupplierId: string;
  declaredCount: number;                      // L2 — số bài cam kết
  curriculumRequirementIds: string[];         // ánh xạ L1
  lessonIds: string[];                        // L3 — trỏ LessonV2
  ct2018Mapping?: string;
}
export interface LessonV2 {                   // mở rộng từ kiểu hiện có
  id: string; title: string; /* ...blocks, attachments... */
  ctProgram: StemProgram; subject: string; grade: string;  // nguyên tử
  sourceType: "ncc" | "geleximco" | "school";
  lessonSetId: string;
  requiredEquipmentItemIds: string[];         // nhiều–nhiều với thiết bị (QĐ-11)
  status: "draft" | "published";
}
```

### 7.4 Học liệu — Đánh giá / Kỳ thi

```ts
export type QuestionType = "mcq" | "essay" | "practical" | "fill";
export type AssessmentKind = "quiz" | "periodic_test" | "competency";

export interface Question {
  id: string; ownerSupplierId: string;
  ctProgram: StemProgram; subject: string; grade: string;  // nguyên tử
  difficulty: "easy" | "medium" | "hard";
  type: QuestionType;
  stem: string;                  // nội dung câu hỏi
  options?: string[]; answerKey: string; explanation?: string;
  mediaIds?: string[];
  status: "draft" | "published";
}
export interface AssessmentSet {
  id: string; name: string; level: SchoolLevel;
  kind: AssessmentKind;
  declaredCtPrograms: StemProgram[];          // L2 — đa trị
  ownerSupplierId: string;
  declaredCount: number;                      // L2 — số câu/đề cam kết
  curriculumRequirementIds: string[];
  questionIds: string[];                      // L3 — trỏ Question
}
```

### 7.5 Danh mục — Thiết bị & sản phẩm

```ts
export interface StemCatalogItem {
  id: string; code: string;                   // Mã CP {MN|TH|CS|PT}-M{n}-{NN}
  level: SchoolLevel; module: ModuleCode;     // module GÁN cứng — 1 module
  kind: ItemKind; name: string;
  supplierId: string; origin: string;
  unit: string; unitPriceVND: number; defaultQuantity: number;
  tierFlags: { minimum: TierInclusion; basic: TierInclusion; advanced: TierInclusion };
  /** Học liệu đi kèm — equipment "ships", content "delivers". CT suy ra từ đây (§6) */
  lessonSetId?: string;
  assessmentSetId?: string;
  thumbnailMediaId?: string;
  specs?: string;
  status: "active" | "draft" | "discontinued";
}
```
`contentStatus` (suy diễn): `khong_can` (material/service) · `chua_gan` (equipment M3–5 thiếu cả 2 set) · `rong_noi_dung` · `mot_phan` · `du`.

### 7.6 Gói phòng STEM

```ts
export interface PackageLine {
  catalogItemId: string; quantity: number;
  snapshot?: { code: string; name: string; supplierId: string;
               module: ModuleCode; unit: string; unitPriceVND: number;
               lessonSetId?: string; assessmentSetId?: string };
}
export interface StemRoomPackage {
  id: string; name: string;
  level: SchoolLevel; tier: StemPackageTier;
  packageType: "template" | "custom"; targetSchoolId?: string;
  lines: PackageLine[];
  status: "draft" | "waiting_approval" | "active" | "discontinued";
  isPilot?: boolean; snapshotAt?: string;
  createdBy?: string; approvedBy?: string; rejectionNote?: string;
  submittedAt?: string; publishedAt?: string;
}
```

### 7.7 Media & Đào tạo

```ts
export interface MediaAsset {
  id: string; kind: "image" | "video" | "document" | "audio";
  name: string; url: string; sizeBytes: number; mimeType: string;
  ownerSupplierId: string; uploadedBy: string; uploadedAt: string;
  tags: string[];
}
export interface TrainingSession {
  id: string;
  m6ItemId: string;                 // item M6 sinh ra buổi tập huấn
  packageId?: string; schoolId: string;
  title: string; mode: "online" | "onsite";
  scheduledAt: string; durationHours: number;
  trainerName: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  attendeeCount: number; completedCount: number;
  note?: string;
}
```

---

# PHẦN III — NHÓM SẢN PHẨM & GIẢI PHÁP

## 8. MÀN "DANH MỤC THIẾT BỊ"

**Mục đích:** NCC quản lý toàn bộ catalog sản phẩm (`StemCatalogItem`) theo chuẩn M1–M6.
**Người dùng:** NCC Staff (tạo/sửa), NCC Manager (duyệt).

**Cấu trúc màn:**
- Bộ lọc: Cấp học · Module M1–M6 · Kind · Tier · NCC · trạng thái.
- Danh sách item nhóm theo Module (mặc định), cột: Mã CP · Tên · Kind · Đơn giá · Tier flags (✓/½/–) · `contentStatus` · CT (suy ra, đa badge).
- Item detail: toàn bộ trường §7.5 + panel học liệu (LessonSet/AssessmentSet đang gắn) + danh sách gói đang dùng item.

**Hành động:** Tạo/sửa/ngừng item · Gắn hoặc tạo nhanh `LessonSet`/`AssessmentSet` · Nhân bản item.

**Tính năng thông minh:**
- Badge `contentStatus` cảnh báo QT-1 (equipment M3–5 chưa gắn học liệu → đỏ).
- CT/Môn/Lớp hiển thị tự động (suy ra) — không có ô nhập CT.
- Cảnh báo Mã CP trùng (BR-CAT-07).

## 9. MÀN "DANH MỤC GÓI STEM"

**Mục đích:** Tạo và quản lý `StemRoomPackage` — lắp ráp từ `StemCatalogItem`.
**Người dùng:** NCC Staff (tạo nháp), NCC Manager (duyệt).

### 9.1 Danh sách gói
Thẻ gói: tên · cấp · tier · trạng thái · `coveragePct` · danh sách NCC · badge Pilot. Lọc theo cấp/tier/trạng thái.

### 9.2 Luồng tạo gói STEM (Configurator)

```
B0  Thiết lập: Cấp học + Tier + loại gói (mẫu/custom) + tên
       └ custom → chọn trường
B1  Auto-đề xuất: hệ thống tự tick StemCatalogItem có cờ tier đó, theo từng module (QĐ-08)
B2..B7  Wizard 6 module M1→M6 (nhảy tự do như tab):
       · chỉnh số lượng, thêm/bỏ item
       · THIẾU item → "Tạo item mới" inline → lưu Danh mục (status=draft) + thêm vào gói (QĐ-07)
       · thêm equipment có companion → tự gợi ý kéo giáo án (cùng lessonSetId)
       · M4 ẩn nếu MN/TH · M6 không bỏ qua được
B8  Tổng kết: tự hiện CT/môn/lớp · coverage 3-gap · cảnh báo QT · bài mồ côi
B9  Lưu nháp / Gửi duyệt
B10 NCC Manager duyệt → Active → chụp snapshot
```

**Tiền đề:** chỉ cần **Thiết bị + khai báo `LessonSet`/`AssessmentSet`** có trước (tạo inline được). **Biên soạn nội dung thật làm sau** ở Studio/Kỳ thi — gói publish được kèm cảnh báo coverage (QĐ-09).

### 9.3 Chi tiết gói
Tab: **Tổng quan** · **Thành phần theo Module** (6 nhóm M1–M6) · **Độ phủ chương trình** (bảng 3-gap theo Module & CT). Panel cố định: tổng giá · `coveragePct` · cảnh báo QT.

**Tính năng thông minh:** auto-compose theo tier · delta khi đổi tier · co-requisite tự kéo · chặn publish khi vi phạm QT-1/QT-2 · cảnh báo "bài mồ côi" (thiếu thiết bị bài cần).

## 10. MÀN "CHƯƠNG TRÌNH STEM"

**Mục đích:** Trang **tham chiếu** CT1–CT5 + **hub thống kê** độ phủ theo CT. Chủ yếu chỉ-đọc — không nhập liệu CT ở đây.
**Người dùng:** NCC (xem), tham chiếu khi biên soạn.

**Cấu trúc màn:**
- 5 thẻ CT1–CT5: mô tả, đặc trưng, khối lớp/môn áp dụng.
- Mỗi CT: thống kê suy ra — số `LessonSet`/`AssessmentSet` gắn CT, số bài đã soạn, **độ phủ % so với `CurriculumRequirement`**, số `StemCatalogItem` thuộc CT, số gói phủ CT.
- Bảng `CurriculumRequirement` (L1) hiển thị: cấp/lớp/môn/CT → số bài yêu cầu. **L1 là dữ liệu chuẩn nạp sẵn**, màn này chỉ hiển thị.

## 11. MÀN "THƯ VIỆN MEDIA"

**Mục đích:** Kho asset dùng chung (`MediaAsset`) — ảnh, video, tài liệu — được lesson/thiết bị/gói/câu hỏi **tham chiếu** tới.
**Người dùng:** NCC Staff.

**Cấu trúc màn:**
- Lưới asset, lọc theo kind/tag, tìm kiếm, **upload file thật** (File API).
- Asset detail: preview · metadata · **panel "Đang dùng ở đâu"** (lesson nào, item nào, gói nào tham chiếu).

**Tính năng thông minh:** chặn xoá asset đang được tham chiếu (hoặc cảnh báo) · gợi ý asset trùng.

---

# PHẦN IV — NHÓM NỘI DUNG & ĐÀO TẠO

## 12. MÀN "STUDIO BIÊN SOẠN"

**Mục đích:** Nơi NCC biên soạn **bài giảng** (`LessonV2`) dạng block.
**Người dùng:** NCC Staff biên soạn nội dung.

**Cấu trúc màn:**
- **Hộp "Đơn đặt biên soạn":** danh sách gap (Gap-CT/Gap-soạn) sinh từ các `LessonSet` — bấm vào mở editor đã điền sẵn CT/môn/lớp/LessonSet.
- **Block editor** (theo template CT1–CT5, đã có): soạn nội dung; khi tạo bài phải gán `lessonSetId`, `ctProgram`, `subject`, `grade`, `requiredEquipmentItemIds`.
- Lưu nháp → Publish. Publish → bài chảy vào Ngân hàng + đếm "đã soạn" của `LessonSet` tăng → Gap-soạn co lại.

**Tính năng thông minh:** auto-save · gắn `requiredEquipmentItemIds` từ catalog · cảnh báo nếu bài publish mà `LessonSet` chưa được item nào tham chiếu (bài "vô chủ").

## 13. MÀN "NGÂN HÀNG NỘI DUNG"

**Mục đích:** Kho tra cứu bài giảng **đã publish** (L3/L4). Studio = nơi soạn; Ngân hàng = nơi lưu & tái sử dụng.
**Người dùng:** NCC, và là nguồn để gắn vào `LessonSet`.

**Cấu trúc màn:**
- Duyệt theo Cấp/Module/CT/`LessonSet`; tìm kiếm; preview bài.
- Mỗi bài: CT/môn/lớp, `LessonSet` thuộc về, thiết bị cần (`requiredEquipmentItemIds`), trạng thái.

## 14. MÀN "HỆ SINH THÁI KỲ THI"

**Mục đích:** **Lớp biên soạn** (QĐ-14) — NCC xây ngân hàng câu hỏi (`Question`) + bộ đề (`AssessmentSet`). Không bao gồm giao bài/chấm (thuộc role Giáo viên).
**Người dùng:** NCC Staff.

**Cấu trúc màn — 2 khu:**
- **Ngân hàng câu hỏi:** danh sách `Question`, lọc theo CT/môn/lớp/độ khó/loại; tạo/sửa câu hỏi (đa loại: trắc nghiệm, tự luận, thực hành, điền khuyết); đính kèm `MediaAsset`.
- **Bộ đề (`AssessmentSet`):** gom câu hỏi thành đề; khai `kind` (quiz / kiểm tra định kỳ / đánh giá năng lực), `declaredCtPrograms`, `declaredCount`.

**Đóng gói (QĐ-13):** `AssessmentSet` gắn vào `StemCatalogItem` qua `assessmentSetId` — đi kèm thiết bị (không tính tiền) **hoặc** là một `StemCatalogItem` `kind=content` bán riêng — NCC tự quyết.

> **Lưu ý ranh giới:** Rubric chấm sản phẩm/dự án **đã nằm trong giáo án** (`LessonV2`) — không thuộc màn này. Cuộc thi STEM = V2 (QĐ-15).

## 15. MÀN "TẬP HUẤN GIÁO VIÊN"

**Mục đích:** **Hub tổng hợp & quản lý** các buổi tập huấn giáo viên — vốn đi kèm gói STEM qua item M6 (QĐ-16).
**Người dùng:** NCC điều phối tập huấn.

**Cấu trúc màn:**
- Lịch tập huấn (`TrainingSession`): theo trường / theo gói / theo thời gian.
- Mỗi session: item M6 nguồn · gói/trường · hình thức (online/onsite) · lịch · giảng viên · trạng thái · số GV tham dự / hoàn thành.
- Khi gói có item M6 "Tập huấn GV" được gắn cho trường → hệ thống **gợi ý tạo `TrainingSession`** tương ứng.

**Tính năng thông minh:** liên kết ngược về gói/trường · nhắc lịch · thống kê tỷ lệ hoàn thành.

---

# PHẦN V — LOGIC HỆ THỐNG

## 16. QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

| Mã | Quy tắc | Hành vi |
|---|---|---|
| BR-01 | Thiết bị & Học liệu đi cùng nhau (QT-1) | `equipment` M3–5 thiếu cả `lessonSetId` lẫn `assessmentSetId` → chặn `active` |
| BR-02 | M6 bắt buộc (QT-2) | Gói không có line M6 → chặn `waiting_approval`/`active` |
| BR-03 | Pilot trước Scale (QT-3) | Gắn gói cho trường lần đầu mặc định `isPilot=true` |
| BR-04 | Đủ 6 module | Thiếu module khả dụng của cấp → cảnh báo (không chặn) |
| BR-05 | M4 theo cấp học | MN/TH → ẩn bước M4 trong Configurator |
| BR-06 | Tier nhất quán | Item lệch tier so với tier gói → cảnh báo |
| BR-07 | Mã CP duy nhất | `code` không trùng trong cùng cấp học |
| BR-08 | Item không cấp chéo | Item `level=X` không thêm vào gói `level=Y` |
| BR-09 | Gap suy ra động | Không lưu gap tĩnh — luôn tính từ L1/L2/L3 |
| BR-10 | Snapshot khi publish | Sau publish, gói đọc `snapshot`; sửa catalog không đổi gói đã bán |
| BR-11 | Bộ học liệu là nguồn duy nhất | `declaredCount` chỉ ở `LessonSet`/`AssessmentSet` |
| BR-12 | CT không gán | Không có thao tác gán CT; CT luôn suy ra (§6) |
| BR-13 | Publish có cảnh báo | Cho publish khi coverage < 100%; chỉ chặn cứng BR-01, BR-02 |
| BR-14 | Bài đủ thiết bị | Bài trong gói thiếu `requiredEquipmentItemIds` → cảnh báo "bài mồ côi" |
| BR-15 | Media đang dùng | Asset đang được tham chiếu → cảnh báo/chặn xoá |

## 17. COVERAGE ENGINE

Hàm thuần `computeCoverage(pkg, ...): PackageCoverage` — tính lại bằng selector, **không cache cứng**.

```ts
export interface PackageCoverage {
  byModule: { module: ModuleCode; itemCount: number; declared: number; authored: number }[];
  byCT: { ct: StemProgram; required: number; declared: number;
          authored: number; coveragePct: number }[];   // độ phủ KHÔNG nhị phân
  gapCT: number; gapAuthoring: number; gapLinking: number;
  coveragePct: number;
  missingModules: ModuleCode[];
  hasM6: boolean;
  uncoupledEquipmentIds: string[];   // thiết bị mồ côi (BR-01)
  orphanLessonIds: string[];         // bài mồ côi (BR-14)
  ctPrograms: StemProgram[]; subjects: string[]; grades: string[];  // suy ra
  suppliers: string[];
}
```

Quy trình: gom `LessonSet`/`AssessmentSet` qua `lines`; mỗi bộ tính `declared`/`authored`/`required`; cộng dồn theo Module & CT; suy ra CT/môn/lớp; kiểm thiết bị đủ cho bài; tính 3 gap; kiểm BR-01/02/04/14.

## 18. VÒNG ĐỜI LIÊN ĐỘNG & SNAPSHOT

| Sự kiện | Hệ quả |
|---|---|
| `StemCatalogItem` bị `discontinued` | Gói **draft** dùng nó → cờ "cần thay thế"; gói **đã publish** → không ảnh hưởng (snapshot) |
| `LessonV2`/`Question` gỡ `published` | "đã soạn" của bộ giảm → coverage gói draft tụt theo thời gian thực |
| Gói chuyển `active` | Đóng băng `snapshot` từng line + `snapshotAt` |
| Gắn gói cho trường | `SchoolPackage` snapshot lần 2 + `isPilot=true`; sinh gợi ý `TrainingSession` từ item M6 |
| NCC sửa giá/specs item | Chỉ ảnh hưởng gói `draft` |

Nguyên tắc: **draft = tham chiếu sống** · **published/assigned = snapshot**.

---

# PHẦN VI — TRIỂN KHAI

## 19. ẢNH HƯỞNG & KẾ HOẠCH SPRINT

Nguyên tắc: thêm mô hình mới **song song**, không phá build; chuyển đổi từng bước.

| Sprint | Nội dung | Đầu ra |
|---|---|---|
| S0 — Nền tảng | Types §7.1; 6 `StemModule`; helper parse Mã CP / "Chương trình N" | `types.ts` mở rộng |
| S1 — Dữ liệu chuẩn | Seed `CurriculumRequirement`, `StemCatalogItem`, `LessonSet`, `AssessmentSet`, `MediaAsset` từ xlsx | Mock data đầy đủ 4 cấp |
| S2 — Coverage engine | `computeCoverage()` 3-gap + selector; unit-test | `lib/coverage.ts` |
| S3 — Sản phẩm: Danh mục Thiết bị + Gói | Redesign 2 màn + Configurator wizard M1–M6 | Nhóm Sản phẩm chạy mô hình mới |
| S4 — Sản phẩm: Chương trình STEM + Media | Redesign 2 màn còn lại của nhóm | Hoàn tất nhóm Sản phẩm |
| S5 — Nội dung: Studio + Ngân hàng | Gắn `LessonSet`; đơn đặt biên soạn; redesign 2 màn | Nhóm Nội dung (bài giảng) |
| S6 — Nội dung: Kỳ thi + Tập huấn | `Question`/`AssessmentSet`; `TrainingSession`; redesign 2 màn | Hoàn tất nhóm Nội dung |
| S7 — Chuyển đổi & QA | `StemPackage`→`StemRoomPackage`; snapshot; migrate; rà 15 BR; build cleanup | Bản ổn định |

## 20. RỦI RO & CÂU HỎI MỞ

| # | Vấn đề | Đề xuất xử lý |
|---|---|---|
| R1 | Giá xlsx là placeholder | Seed giá tạm + cờ "giá tạm tính"; chờ NCC |
| R2 | Ý nghĩa mức ½ (partial) | **Cần hỏi NCC:** "có một phần" hay "giảm số lượng"? |
| R3 | Số liệu yêu cầu CT 2018 (L1) | Đối chiếu khung CT GDPT 2018 chính thức để seed `CurriculumRequirement` |
| R4 | Ánh xạ Module ↔ CT từng item | Rà thủ công khi seed từ cột "Chương trình N" |
| R5 | Nội dung khóa tập huấn GV | Đợt này quản lý buổi tập huấn (`TrainingSession`); tài liệu khoá để dạng `MediaAsset`/doc đính kèm |
| R6 | Dữ liệu một số ô xlsx nhiễu | Làm sạch thủ công khi seed |

---

*Tài liệu chuẩn bị bởi Geleximco STEM BA Team · v3.0 · 2026-05-21*
*Bước tiếp theo: redesign giao diện 8 màn theo tài liệu này — bắt đầu từ Sprint S0.*
