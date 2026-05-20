# KẾ HOẠCH HOÀN THIỆN 2 NHÓM MODULE NCC

> **Phiên bản:** 1.0
> **Ngày lập:** 2026-05-20
> **Phạm vi:** Tenant Supplier (NCC) — nhóm "Sản phẩm & Giải pháp" + "Nội dung & Đào tạo"
> **Nguồn:** Review 8 module ngày 2026-05-20 (5 luồng đứt, ~24 nút placeholder, validation thiếu)
> **Mục tiêu:** Đưa 8 module từ trung bình ~60% lên ~90%, nối tất cả luồng nghiệp vụ, đủ validation.

---

## Mục lục

1. [Mục tiêu & Tiêu chí thành công](#1-mục-tiêu--tiêu-chí-thành-công)
2. [Phạm vi (In / Out scope)](#2-phạm-vi-in--out-scope)
3. [Tổng quan 6 Sprint](#3-tổng-quan-6-sprint)
4. [Sơ đồ ưu tiên](#4-sơ-đồ-ưu-tiên)
5. [Sprint A — Nối 3 luồng đứt critical](#sprint-a--nối-3-luồng-đứt-critical-3-4h)
6. [Sprint B — Validation các form còn hở](#sprint-b--validation-các-form-còn-hở-15-2h)
7. [Sprint C — Dọn placeholder 4 module nhẹ](#sprint-c--dọn-placeholder-4-module-nhẹ-4-5h)
8. [Sprint D — Hệ sinh thái Kỳ thi](#sprint-d--hệ-sinh-thái-kỳ-thi-8-10h)
9. [Sprint E — DeviceCatalog CRUD](#sprint-e--devicecatalog-crud-2h)
10. [Sprint F — Data integration & cleanup](#sprint-f--data-integration--cleanup-3h)
11. [Risk Register](#11-risk-register)
12. [Definition of Done](#12-definition-of-done)
13. [Quick reference — toàn bộ task](#13-quick-reference--toàn-bộ-task-flatten)
14. [Thứ tự thực thi đề xuất](#14-thứ-tự-thực-thi-đề-xuất)

---

## 1. Mục tiêu & Tiêu chí thành công

### 1.1. Mục tiêu

Hoàn thiện 8 module thuộc 2 nhóm nghiệp vụ NCC để:
- **Thông tất cả luồng** — không còn nút "chết" ở các luồng nghiệp vụ chính
- **Đủ chức năng** — mỗi module thực hiện được nghiệp vụ của nó (không chỉ hiển thị)
- **Đủ validation** — mọi form tạo/sửa quan trọng có validate bắt buộc
- **Đồng đều** — thu hẹp khoảng cách giữa Studio (90%) và 7 module còn lại (~55%)

### 1.2. Tiêu chí thành công đo lường được

| # | Tiêu chí | Cách kiểm |
|---|---|---|
| 1 | 5 luồng đứt được nối | Click qua từng luồng, không bị toast giả |
| 2 | Vòng đời gói STEM hoạt động | Tạo → gửi duyệt → duyệt → active đổi status thực |
| 3 | Sửa bài từ Ngân hàng vào được editor | Click "Chỉnh sửa" → mở LessonEditor đúng bài |
| 4 | Wizard truy cập được từ 3 nơi | Studio + Ngân hàng + ProgramManager |
| 5 | Kỳ thi tạo được | Wizard tạo kỳ thi → kỳ thi xuất hiện trong list |
| 6 | ≤ 5 nút placeholder còn lại (toàn V2) | Đếm số `toast.info`/`toast.success` đơn thuần |
| 7 | 2 form còn hở có validation | ProgramManager + PackageDetail modal |
| 8 | Build sạch | `npm run build` xanh, 0 TS error |

### 1.3. Tổng effort ước tính

**~22-27 giờ** — chia 6 sprint độc lập.

---

## 2. Phạm vi (In / Out scope)

### 2.1. In Scope

- Nối 5 luồng đứt (sửa bài, soạn bài, duyệt gói, tạo kỳ thi, Studio→Ngân hàng)
- Đổi status thực cho vòng đời gói STEM (local state)
- Validation cho `STEMProgramManager` PackageForm + `PackageDetail` modal
- Wire chức năng thực (local state) cho: MediaAssetManager, DeviceCatalog CRUD
- Hệ sinh thái Kỳ thi: wizard tạo, route chi tiết, ngân hàng câu hỏi, chấm điểm
- ContentItemDetail: nối editor + version + attach
- Dọn data hard-code rải rác, fix dead code

### 2.2. Out Scope (V2 / khi có backend)

- Backend API thật — vẫn dùng mock + local state
- File upload thật (chỉ mock UI)
- Kỳ thi cấp huyện/tỉnh/quốc gia (Plan ghi rõ V1 chỉ cấp trường)
- Real-time proctoring kỳ thi
- Versioning có rollback thật (chỉ list + preview)
- Export PDF/SCORM thật
- Persistence qua localStorage (chấp nhận mất khi reload — prototype)

---

## 3. Tổng quan 6 Sprint

| Sprint | Tên | Effort | Priority | Output |
|---|---|---|---|---|
| **A** | Nối 3 luồng đứt critical | 3-4h | **P1 CAO** | Sửa bài / Soạn bài / Duyệt gói thông |
| **B** | Validation 2 form còn hở | 1.5-2h | **P1 CAO** | ProgramManager + PackageDetail validate |
| **C** | Dọn placeholder 4 module nhẹ | 4-5h | P2 | Catalog/Media/ItemDetail/ProgramManager |
| **D** | Hệ sinh thái Kỳ thi | 8-10h | P2 | Wizard + chi tiết + ngân hàng câu hỏi + chấm |
| **E** | DeviceCatalog CRUD | 2h | P3 | Thêm/sửa/xóa thiết bị |
| **F** | Data integration & cleanup | 3h | P3 | Studio→Ngân hàng + dọn hard-code |
| **TOTAL** | | **22-27h** | | |

### Critical path

```
A (luồng đứt) ─┬─→ C (placeholder) ──→ F (cleanup)
B (validation) ─┘
D (Kỳ thi) — độc lập, chạy song song bất kỳ lúc nào
E (Device CRUD) — độc lập
```

→ A + B làm trước (tác động cao, effort thấp). D độc lập, có thể tách người. F làm cuối.

---

## 4. Sơ đồ ưu tiên

```
        TÁC ĐỘNG CAO
            │
   ┌────────┼────────┐
   │   A    │   D    │
   │ Luồng  │  Kỳ    │
   │ đứt    │  thi   │
   ├────────┼────────┤   EFFORT
   │   B    │   C    │   ───────→
   │Validate│Placehd │
   ├────────┼────────┤
   │   F    │   E    │
   │Cleanup │ Device │
   └────────┴────────┘
        TÁC ĐỘNG THẤP

Làm trước: A, B (góc trên-trái: cao impact, thấp effort)
Làm sau:   D (cao impact, cao effort — cần commit thời gian)
Lấp đầy:   C, E, F
```

---

# Sprint A — Nối 3 luồng đứt critical (3-4h)

## A — Mục tiêu
Nối 3 luồng nghiệp vụ quan trọng nhất đang bị toast giả chặn đứng.

## A — Tasks

### A1 — ContentItemDetail: "Chỉnh sửa" → mở LessonEditor (0.5h)

**Vấn đề:** Nút "Chỉnh sửa" trong `ContentItemDetail` chỉ `toast.success("Mở editor...")`. Route `/supplier/content/authoring/:lessonId` đã tồn tại.

**File:** `ContentItemDetail.tsx`

**Việc làm:**
- Thay `toast` bằng `navigate(\`/supplier/content/authoring/\${id}\`)`
- Nếu bài là CT5 → navigate `/supplier/content/authoring/research/\${id}`
- Nút "Xem trước" → navigate editor với query `?preview=1` HOẶC mở `LessonPreviewModal` (nếu khả thi, ưu tiên modal)

**Acceptance:**
- [ ] Click "Chỉnh sửa" bài CT1-CT4 → mở `LessonEditor` đúng bài
- [ ] Click "Chỉnh sửa" bài CT5 → mở `ResearchProjectEditor`
- [ ] Build sạch

---

### A2 — ContentLibraryBank + STEMProgramManager: "Soạn bài mới" → mở Wizard (1h)

**Vấn đề:** `ContentLibraryBank` nút "Soạn bài mới" → `toast`. `STEMProgramManager` có 3 link "Soạn bài mới" → chỉ navigate `/supplier/content/authoring` (về Studio, không mở wizard).

**File:** `ContentLibraryBank.tsx`, `STEMProgramManager.tsx`

**Việc làm:**
- `ContentLibraryBank`: thêm state `wizardOpen`, render `<CTSelectorWizard>`, nút "Soạn bài mới" → `setWizardOpen(true)`
- `STEMProgramManager`: nút "Soạn bài mới cho {CT}" → mở wizard với CT pre-selected (truyền prop `initialCT` vào wizard nếu cần — hoặc navigate kèm query)

**Phụ thuộc:** `CTSelectorWizard` đã build (Sprint 1 cũ)

**Acceptance:**
- [ ] `ContentLibraryBank` "Soạn bài mới" → wizard 3 bước mở
- [ ] `STEMProgramManager` "Soạn bài mới cho CT4" → wizard mở (ưu tiên pre-select CT4)
- [ ] Hoàn thành wizard → vào đúng editor

---

### A3 — PackageDetail: Vòng đời duyệt gói thực (1.5-2h)

**Vấn đề:** Nút "Duyệt" / "Từ chối" / "Ngừng bán" chỉ `toast` — không đổi status. "Từ chối" thiếu form lý do.

**File:** `PackageDetail.tsx` (+ component mới `RejectReasonDialog.tsx`)

**Việc làm:**
- Thêm local state `packageStatus` (init từ `found.status`)
- "Duyệt" → `setPackageStatus("active")` + toast + cập nhật badge
- "Ngừng bán" → `setPackageStatus("discontinued")` + confirm dialog đơn giản
- "Từ chối" → mở `RejectReasonDialog` (textarea lý do, bắt buộc ≥ 10 ký tự) → confirm → `setPackageStatus("draft")` + lưu `rejectionNote`
- Badge status + các nút action re-render theo `packageStatus`
- Thêm nút "Gửi duyệt" khi status = `draft` → `setPackageStatus("waiting_approval")`

**Acceptance:**
- [ ] Gói `draft` → nút "Gửi duyệt" → chuyển `waiting_approval`
- [ ] Gói `waiting_approval` + admin → "Duyệt" → `active` / "Từ chối" → dialog lý do → `draft`
- [ ] Gói `active` → "Ngừng bán" → confirm → `discontinued`
- [ ] Badge + nút cập nhật đúng theo status mới

---

## A — Deliverables
- `ContentItemDetail.tsx`, `ContentLibraryBank.tsx`, `STEMProgramManager.tsx`, `PackageDetail.tsx` updated
- Component mới: `RejectReasonDialog.tsx`
- Build sạch

---

# Sprint B — Validation các form còn hở (1.5-2h)

## B — Mục tiêu
Thêm validation cho 2 form tạo/sửa quan trọng đang cho lưu dữ liệu rỗng/sai.

## B — Tasks

### B1 — STEMProgramManager PackageForm validation (0.75h)

**Vấn đề:** `PackageForm` cho lưu tên rỗng, mô tả rỗng, 0 cấp học.

**File:** `STEMProgramManager.tsx`

**Việc làm:**
- Hàm `validatePkgForm(pkg)` — tên ≥ 3 ký tự, mô tả ≥ 20 ký tự, ≥ 1 cấp học
- Nút "Lưu gói" `disabled` khi invalid
- Hiển thị inline error dưới field không hợp lệ (text cam)

**Acceptance:**
- [ ] Lưu tên rỗng → nút disabled + error "Tên gói ≥ 3 ký tự"
- [ ] Lưu 0 cấp học → error "Chọn ít nhất 1 cấp học"
- [ ] Form hợp lệ → lưu được

---

### B2 — PackageDetail modal gắn trường validation (0.75h)

**Vấn đề:** Modal chỉ chặn "chưa chọn trường". Cho ngày quá khứ, cho gắn trùng trường.

**File:** `PackageDetail.tsx`

**Việc làm:**
- Validate `startDate` ≥ hôm nay → nếu quá khứ, error + disable confirm
- Chặn gắn trùng: nếu trường đã có trong `localAssignments` (status active) → hiển thị warning "Trường này đã được gắn gói" + disable
- Search box trong modal: filter ra trường đã gắn HOẶC đánh dấu "Đã gắn"

**Acceptance:**
- [ ] Chọn ngày quá khứ → error + disable
- [ ] Chọn trường đã gắn → warning + disable confirm
- [ ] Trường đã gắn hiển thị nhãn "Đã gắn" trong picker

---

## B — Deliverables
- `STEMProgramManager.tsx`, `PackageDetail.tsx` updated với validation
- Build sạch

---

# Sprint C — Dọn placeholder 4 module nhẹ (4-5h)

## C — Mục tiêu
Biến các nút placeholder thành chức năng thực (local state / dialog), giảm nút "chết".

## C — Tasks

### C1 — MediaAssetManager: upload/xóa/tải thực (1.5h)

**Vấn đề:** Upload/Download/Xóa đều toast; 1 nút Download list view không có handler.

**File:** `MediaAssetManager.tsx` (+ có thể dùng lại pattern upload mock)

**Việc làm:**
- "Tải lên" → mở dialog mock (chọn loại + nhập tên + URL) → thêm asset vào `assets` state
- "Xóa" → confirm → `setAssets(filter)` — XÓA THỰC khỏi danh sách
- "Download" (cả grid + list) → toast "Đang tải {tên}" (chấp nhận — không có file thật) NHƯNG nút list view phải có `onClick`
- Thêm preview: click ảnh → lightbox phóng to (đơn giản)

**Acceptance:**
- [ ] Upload mock → asset mới xuất hiện trong grid
- [ ] Xóa → asset biến mất khỏi danh sách + stats cập nhật
- [ ] Nút Download list view có handler
- [ ] Click ảnh → xem phóng to

---

### C2 — ContentItemDetail: nối các nút còn lại (1h)

**Vấn đề:** 8 nút toast (Xuất, Xem trước, Tải, Đính kèm, Khôi phục version, Tạo version, Thêm học liệu).

**File:** `ContentItemDetail.tsx`

**Việc làm:**
- "Xem trước" → mở `LessonPreviewModal` (component đã có) — cần resolve blocks; nếu khó, tạm navigate editor `?preview=1`
- "Tải tài nguyên" → toast "Đang tải" (chấp nhận — V2 cho file thật)
- "Đính kèm tài nguyên" → dialog nhập tên + URL → thêm vào danh sách (local state)
- "Tạo phiên bản mới" → thêm version vào list (local state) với timestamp
- "Khôi phục version" → confirm dialog (mock — toast OK vì cần backend)
- "Thêm" loại học liệu → navigate Studio HOẶC dialog upload nhanh
- "Xuất" → giữ toast (V2 — cần SCORM engine)

**Acceptance:**
- [ ] "Xem trước" mở preview thực
- [ ] "Đính kèm" → tài nguyên mới xuất hiện
- [ ] "Tạo phiên bản" → version mới trong timeline
- [ ] ≤ 2 nút còn toast (Xuất SCORM, Khôi phục — đều V2)

---

### C3 — STEMProgramManager: coverage map lọc thực (1h)

**Vấn đề:** Coverage map dùng số giả `mockCount()`; click ô chỉ toast.

**File:** `STEMProgramManager.tsx`

**Việc làm:**
- Thay `mockCount()` bằng đếm thực từ `lessons` (filter theo CT + grade) — ít nhất cho dòng "Kế hoạch bài dạy" / "Bài giảng"
- Click ô có data → filter danh sách bài giảng bên dưới theo (CT × cấp học)
- Click ô rỗng → mở wizard soạn bài với CT + grade pre-fill

**Acceptance:**
- [ ] Coverage map hiển thị số bài giảng thực
- [ ] Click ô → danh sách bài giảng lọc theo ô đó
- [ ] Click ô rỗng → wizard mở

---

### C4 — STEMPackageCatalog: search + nút phụ (0.75h)

**Vấn đề:** Không có search theo tên; "Xuất catalog" + "Demo video" toast.

**File:** `STEMPackageCatalog.tsx`

**Việc làm:**
- Thêm ô search theo tên gói (filter `myPackages`)
- "Demo video" → mở dialog video đơn giản (iframe nếu có URL, placeholder nếu không)
- "Xuất catalog" → giữ toast (V2 — PDF engine) HOẶC đổi thành tooltip "Sắp có"
- Thêm nút "Gửi duyệt" nhanh trên card gói `draft`

**Acceptance:**
- [ ] Search tên gói hoạt động
- [ ] "Demo video" mở dialog
- [ ] Card draft có nút "Gửi duyệt" nhanh

---

## C — Deliverables
- 4 file module updated
- Build sạch

---

# Sprint D — Hệ sinh thái Kỳ thi (8-10h)

## D — Mục tiêu
Biến `STEMExamEcosystem` từ skeleton (35%) thành module hoạt động được — tạo kỳ thi, chi tiết, ngân hàng câu hỏi, chấm điểm.

## D — Tasks

### D1 — Mock data kỳ thi mở rộng (1h)

**File:** `mock-data/exams.ts` (mở rộng)

**Việc làm:**
- Thêm interface `ExamQuestion` (id, content, type, options, correctAnswer, points, programCode)
- Thêm `EXAM_QUESTIONS: ExamQuestion[]` — ~30-40 câu hỏi mock CT1-CT5
- Thêm `ExamResult` (examId, studentName, score, submittedAt, answers)
- Thêm `EXAM_RESULTS` mock cho các kỳ thi `graded`
- Bổ sung field cho `STEMExam`: `questionIds[]`, `passingScore`

**Acceptance:**
- [ ] `EXAM_QUESTIONS` ≥ 30 câu phân bố 5 CT
- [ ] `EXAM_RESULTS` có data cho kỳ thi đã chấm
- [ ] Build sạch

---

### D2 — Wizard tạo kỳ thi (2.5h)

**File:** `stem/supplier/ExamCreateWizard.tsx` (mới)

**Việc làm:** Modal wizard 3 bước:
- Bước 1: Thông tin chung — tên, cấp (school — V1), khối lớp, đơn vị tổ chức
- Bước 2: Cấu hình — chương trình CT, thời lượng, ngày mở/đóng, điểm đạt
- Bước 3: Chọn câu hỏi — picker từ `EXAM_QUESTIONS` (multi-select, filter theo CT), hiển thị tổng điểm
- Validate mỗi bước trước Next
- Hoàn thành → thêm kỳ thi vào list (local state ở parent)

**Acceptance:**
- [ ] Wizard 3 bước chạy, validate đầy đủ
- [ ] Chọn câu hỏi từ ngân hàng
- [ ] Tạo xong → kỳ thi xuất hiện trong `STEMExamEcosystem` list

---

### D3 — Route + trang chi tiết kỳ thi (2h)

**File:** `stem/supplier/ExamDetail.tsx` (mới), `routes.ts`

**Việc làm:**
- Route mới `/supplier/exams/:id`
- Trang chi tiết: thông tin kỳ thi, danh sách câu hỏi, danh sách thí sinh, trạng thái
- Nút theo status: `upcoming` → Sửa/Mở thi; `open` → Đóng thi; `closed` → Chấm điểm; `graded` → Xem bảng điểm
- `STEMExamEcosystem` nút "Chi tiết" → navigate route này

**Acceptance:**
- [ ] Route resolve `ExamDetail`
- [ ] "Chi tiết" từ list → mở đúng kỳ thi
- [ ] Hiển thị câu hỏi + thí sinh

---

### D4 — Ngân hàng câu hỏi (2h)

**File:** `stem/supplier/ExamQuestionBank.tsx` (mới), `routes.ts`

**Việc làm:**
- Route `/supplier/exams/questions`
- Quản lý `EXAM_QUESTIONS` — list, filter theo CT + loại, search
- Form thêm/sửa câu hỏi (tái dùng `QuizBlock` pattern từ Studio nếu được)
- `STEMExamEcosystem` nút "Ngân hàng câu hỏi" → navigate route này

**Acceptance:**
- [ ] Route resolve, list câu hỏi
- [ ] Thêm/sửa/xóa câu hỏi (local state)
- [ ] Filter CT + loại hoạt động

---

### D5 — Bảng điểm + chấm điểm (1.5h)

**File:** `ExamDetail.tsx` (mở rộng) hoặc `ExamResultsPanel.tsx`

**Việc làm:**
- Kỳ thi `closed` → nút "Chấm điểm" → mock auto-grade (tính điểm từ `EXAM_RESULTS`) → đổi status `graded`
- Kỳ thi `graded` → bảng điểm: danh sách thí sinh, điểm, đạt/không đạt, thống kê (TB, cao nhất, % đạt)
- Chart phân bố điểm

**Acceptance:**
- [ ] "Chấm điểm" → status đổi `graded`
- [ ] Bảng điểm hiển thị thí sinh + điểm + thống kê
- [ ] Chart phân bố điểm

---

### D6 — Wire data thực + dọn (0.5h)

**File:** `STEMExamEcosystem.tsx`

**Việc làm:**
- `trend` 6 tháng tính từ `stemExams` thực thay vì hard-code
- Render KPI `openCount` (đang tính nhưng không hiện)
- "Xuất lịch" → giữ toast (V2) hoặc tooltip

**Acceptance:**
- [ ] `trend` từ data thực
- [ ] KPI "Đang mở" hiển thị
- [ ] Build sạch

---

## D — Deliverables
- Mở rộng `mock-data/exams.ts`
- Component mới: `ExamCreateWizard`, `ExamDetail`, `ExamQuestionBank`
- `routes.ts` + `STEMExamEcosystem.tsx` updated

---

# Sprint E — DeviceCatalog CRUD (2h)

## E — Mục tiêu
`DeviceCatalog` hiện chỉ xem — thêm CRUD thiết bị.

## E — Tasks

### E1 — DeviceCatalog thêm/sửa/xóa (2h)

**File:** `DeviceCatalog.tsx`, có thể `mock-data/device-catalog.ts`

**Việc làm:**
- Nút "Thêm thiết bị" → dialog form (tên, SKU, hãng, category, giá, specs, active)
- Sửa thiết bị → dialog điền sẵn
- Xóa thiết bị → confirm
- State `devices` local (init từ `DEVICES`)
- Validate form: tên ≥ 3, giá > 0, SKU không rỗng

**Acceptance:**
- [ ] Thêm thiết bị → xuất hiện trong list
- [ ] Sửa → cập nhật
- [ ] Xóa → confirm → biến mất
- [ ] Form validate đầy đủ

---

## E — Deliverables
- `DeviceCatalog.tsx` updated với CRUD + dialog
- Build sạch

---

# Sprint F — Data integration & cleanup (3h)

## F — Mục tiêu
Nối luồng Studio → Ngân hàng, dọn data hard-code, fix dead code.

## F — Tasks

### F1 — Studio → Ngân hàng: published lessons chảy vào bank (1h)

**Vấn đề:** `STUDIO_LESSONS` (Studio) và `lessons[]` (Ngân hàng) là 2 nguồn tách rời. Bài published từ Studio không vào Ngân hàng.

**File:** `ContentLibraryBank.tsx`, có thể `mock-data`

**Việc làm:**
- `ContentLibraryBank` hiển thị HỢP NHẤT: `lessons[]` + `STUDIO_LESSONS.filter(published)`
- Đánh dấu nguồn: badge "Bank" / "Studio" trên card
- Resolve schema khác nhau (đã có pattern `resolvedSelected` trong Tab 4 Configurator — tái dùng)

**Acceptance:**
- [ ] Ngân hàng hiển thị cả bài published từ Studio
- [ ] Badge phân biệt nguồn
- [ ] Filter CT/grade vẫn hoạt động

---

### F2 — Dọn data hard-code rải rác (1h)

**Vấn đề:** `DEFAULT_PACKAGES`, `CT_PACKAGE_NAMES`, `trend` exam, 4 PDF media nằm trong file component.

**File:** `mock-data/` (tạo file mới), các component liên quan

**Việc làm:**
- `DEFAULT_PACKAGES` (ProgramManager) + `CT_PACKAGE_NAMES` (ContentItemDetail) → gộp vào `mock-data/ncc-program-packages.ts`
- Cả 2 component import từ nguồn chung
- Media 4 PDF → `mock-data/media-assets.ts`

**Acceptance:**
- [ ] ProgramManager + ContentItemDetail dùng chung 1 nguồn gói NCC
- [ ] Không còn data hard-code trong component
- [ ] Build sạch

---

### F3 — Fix dead code + smoke test (1h)

**Việc làm:**
- `STEMExamEcosystem` `openCount` — render hoặc xóa
- Quét unused imports toàn 8 module
- Smoke test: click qua từng module, verify không còn lỗi runtime
- `npm run build` xanh

**Acceptance:**
- [ ] 0 dead code rõ ràng
- [ ] 8 module click qua không lỗi
- [ ] Build sạch

---

## F — Deliverables
- `ContentLibraryBank` hợp nhất nguồn
- `mock-data/ncc-program-packages.ts`, `mock-data/media-assets.ts` mới
- Cleanup xong

---

## 11. Risk Register

| ID | Risk | Mức độ | Sprint | Mitigation |
|---|---|---|---|---|
| R1 | Đổi status gói chỉ local — reload mất | Trung bình | A | Chấp nhận (prototype); ghi chú V2 cần backend |
| R2 | Sprint D (Kỳ thi) effort lớn, dễ tràn | Cao | D | Tách 6 task nhỏ, mỗi task build riêng; có thể defer D4/D5 |
| R3 | LessonPreviewModal cần blocks — ContentItemDetail không có blocks thực | Trung bình | C2 | Fallback navigate editor `?preview=1` nếu modal khó |
| R4 | Schema lessons[] vs STUDIO_LESSONS khác nhau | Trung bình | F1 | Tái dùng pattern `resolvedSelected` đã có ở Tab 4 |
| R5 | Wizard pre-select CT cần sửa CTSelectorWizard | Thấp | A2 | Thêm optional prop `initialCT`, default giữ nguyên |
| R6 | QuestionBank tái dùng QuizBlock — coupling | Thấp | D4 | Nếu phức tạp, viết form riêng đơn giản |

---

## 12. Definition of Done

- [ ] **5 luồng đứt** đã nối — sửa bài, soạn bài, duyệt gói, tạo kỳ thi, Studio→Ngân hàng
- [ ] **Vòng đời gói** draft → waiting_approval → active/discontinued đổi status thực
- [ ] **2 form** ProgramManager + PackageDetail modal có validation
- [ ] **Kỳ thi** tạo được qua wizard, có chi tiết + ngân hàng câu hỏi + chấm điểm
- [ ] **DeviceCatalog** CRUD thiết bị
- [ ] **Ngân hàng Nội dung** hợp nhất bài từ Studio
- [ ] **Placeholder** còn ≤ 5 nút (toàn V2: export PDF/SCORM, file upload thật)
- [ ] **Data hard-code** gom về mock-data
- [ ] **Build** sạch, 0 TS error, 8 module click qua không lỗi
- [ ] Demo được end-to-end: tạo gói → duyệt; soạn bài → vào Ngân hàng; tạo kỳ thi → chấm điểm

---

## 13. Quick reference — toàn bộ task (flatten)

| ID | Task | Sprint | Effort | Priority |
|---|---|---|---|---|
| A1 | ContentItemDetail "Chỉnh sửa" → editor | A | 0.5h | P1 |
| A2 | "Soạn bài mới" → Wizard (Bank + ProgramManager) | A | 1h | P1 |
| A3 | PackageDetail vòng đời duyệt gói + RejectDialog | A | 2h | P1 |
| B1 | ProgramManager PackageForm validation | B | 0.75h | P1 |
| B2 | PackageDetail modal validation | B | 0.75h | P1 |
| C1 | MediaAssetManager upload/xóa thực | C | 1.5h | P2 |
| C2 | ContentItemDetail nối các nút còn lại | C | 1h | P2 |
| C3 | ProgramManager coverage map lọc thực | C | 1h | P2 |
| C4 | STEMPackageCatalog search + nút phụ | C | 0.75h | P2 |
| D1 | Mock data kỳ thi mở rộng | D | 1h | P2 |
| D2 | Wizard tạo kỳ thi | D | 2.5h | P2 |
| D3 | Route + trang chi tiết kỳ thi | D | 2h | P2 |
| D4 | Ngân hàng câu hỏi | D | 2h | P2 |
| D5 | Bảng điểm + chấm điểm | D | 1.5h | P2 |
| D6 | Wire data thực + dọn ExamEcosystem | D | 0.5h | P2 |
| E1 | DeviceCatalog CRUD | E | 2h | P3 |
| F1 | Studio → Ngân hàng hợp nhất | F | 1h | P3 |
| F2 | Dọn data hard-code | F | 1h | P3 |
| F3 | Fix dead code + smoke test | F | 1h | P3 |

**Tổng: 19 task.**

**Effort theo priority:**
- P1 (Sprint A+B): 6 task × ~5h
- P2 (Sprint C+D): 10 task × ~14h
- P3 (Sprint E+F): 3 task × ~5h

---

## 14. Thứ tự thực thi đề xuất

### Đợt 1 — Critical (~5h) — nên làm ngay
- Sprint A (A1 → A2 → A3)
- Sprint B (B1 → B2)
- → Sau đợt này: tất cả luồng nghiệp vụ chính thông, không còn nút chết ở luồng critical

### Đợt 2 — Kỳ thi (~8-10h) — cần commit thời gian
- Sprint D (D1 → D2 → D3 → D4 → D5 → D6)
- → Có thể tách: D1-D3 (tạo + chi tiết) đợt 2a; D4-D5 (ngân hàng + chấm) đợt 2b

### Đợt 3 — Lấp đầy (~9h)
- Sprint C (C1 → C2 → C3 → C4)
- Sprint E (E1)
- Sprint F (F1 → F2 → F3)
- → Sau đợt này: 8 module đồng đều ~90%

---

**Hết kế hoạch.**
