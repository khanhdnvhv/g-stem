# KẾ HOẠCH IMPLEMENT CHI TIẾT — STUDIO BIÊN SOẠN STEM

> **Phiên bản:** 1.0
> **Ngày lập:** 2026-05-19
> **Tham chiếu:** [CT-Programs-Specification.md](./CT-Programs-Specification.md)
> **Mục tiêu:** Phá vỡ công việc thành các task nhỏ có thể track, estimate và validate độc lập. Đảm bảo Studio Biên soạn đạt 100% chuẩn 5 CT.

---

## Mục lục

1. [Mục tiêu & Tiêu chí thành công](#1-mục-tiêu--tiêu-chí-thành-công)
2. [Phạm vi (In / Out scope)](#2-phạm-vi-in--out-scope)
3. [Tổng quan 10 Sprint](#3-tổng-quan-10-sprint)
4. [Sơ đồ dependencies](#4-sơ-đồ-dependencies)
5. [Sprint 0 — Foundation](#sprint-0--foundation-3-5h)
6. [Sprint 1 — CT Selector Wizard](#sprint-1--ct-selector-wizard-3-4h)
7. [Sprint 2 — Refactor LessonEditor dynamic per CT](#sprint-2--refactor-lessoneditor-dynamic-per-ct-4-5h)
8. [Sprint 3 — Upgrade 7 block hiện có](#sprint-3--upgrade-7-block-hiện-có-4-5h)
9. [Sprint 4 — 4 block mới HIGH priority](#sprint-4--4-block-mới-high-priority-5-6h)
10. [Sprint 5 — 9 Attachment Slots](#sprint-5--9-attachment-slots-3-4h)
11. [Sprint 6 — CT5 ResearchProjectEditor](#sprint-6--ct5-researchprojecteditor-5-6h)
12. [Sprint 7 — AI Assist nâng cao](#sprint-7--ai-assist-nâng-cao-3-4h)
13. [Sprint 8 — UX Polish](#sprint-8--ux-polish-4-5h)
14. [Sprint 9 — Workflow & Versioning](#sprint-9--workflow--versioning-3-4h)
15. [Sprint 10 — Integration & QA](#sprint-10--integration--qa-3-4h)
16. [Risk Register](#16-risk-register)
17. [Definition of Done](#17-definition-of-done-toàn-bộ-module)
18. [Phụ lục: Quick reference task list](#18-phụ-lục-quick-reference-task-list-tất-cả-task-flatten)

---

## 1. Mục tiêu & Tiêu chí thành công

### 1.1. Mục tiêu chính

Hoàn thiện Studio Biên soạn STEM thành module sản xuất nội dung **đạt chuẩn 5 CT** (CT1–CT5) theo chuẩn Bộ GD&ĐT (Công văn 5512), phục vụ NCC tạo ra bài giảng / chủ đề / đề tài nghiên cứu một cách chuyên nghiệp.

### 1.2. Tiêu chí thành công (đo lường được)

| # | Tiêu chí | Cách validate |
|---|---|---|
| 1 | NCC chọn được 1 trong 5 CT khi tạo bài mới | Wizard chạy được, lưu được metadata đúng CT |
| 2 | Mỗi CT có layout editor đúng spec | Smoke test 5 CT: phase đúng, metadata fields đúng, block availability đúng |
| 3 | 16 loại block hoạt động được (7 cũ + 9 mới) | Đếm thấy 16 block trong picker; tạo + edit + xoá được mỗi loại |
| 4 | 9 attachment slots cố định | Slot panel hiển thị đúng 9 slot; required slot có cảnh báo nếu rỗng |
| 5 | CT5 dùng `ResearchProjectEditor` riêng | Route CT5 dẫn đến component khác, có 8 phase NCKH |
| 6 | Drag-drop reorder block | Có thể kéo thả block trong cùng phase |
| 7 | Preview modal hoạt động | Click Preview → modal full-screen render bài ở góc nhìn HS |
| 8 | Auto-save indicator | "Đã lưu cách đây X phút" hiển thị, auto save mỗi 30s |
| 9 | Workflow review có comments | Reviewer (supplier_admin) để lại comment được |
| 10 | Build sạch | `npm run build` xanh, 0 TypeScript errors |

### 1.3. Tổng effort ước tính

**~40-50 giờ** — chia thành 10 sprint độc lập.

---

## 2. Phạm vi (In / Out scope)

### 2.1. In Scope

- Refactor `LessonEditor.tsx` (478 dòng hiện tại) thành CT-aware
- Tạo `ResearchProjectEditor.tsx` riêng cho CT5
- 9 block components mới (1 file/component)
- Upgrade 7 block hiện có (đặc biệt Quiz)
- `CTSelectorWizard.tsx` mới
- `AttachmentSlotsPanel.tsx` mới (9 slot)
- Mock data: `ct-templates.ts`, `ct4-modules.ts`, `ct5-topics.ts`, `sgk-books.ts`
- Update `ContentAuthoringStudio.tsx` (thêm CT filter card + entry điểm vào wizard)
- Update Tab 4 Configurator: hiển thị CT-specific metadata khi gắn bài
- Update Analytics: count by CT competency tags
- AI Assist menu mở rộng (4-5 actions, mock UI)
- Preview modal, drag-drop, auto-save, status, comments

### 2.2. Out of Scope (V1)

- Real backend API integration (vẫn dùng mock data)
- File upload thật (chỉ mock UI)
- Real-time collaboration (WebSocket) — chỉ 1 editor mở 1 lúc
- AI generation thật (gọi Claude API) — chỉ mock response
- Full version history với rollback (chỉ list versions)
- Export bài giảng sang PDF/PPTX thật
- Mobile editor — chỉ optimize desktop ≥1280px
- I18n (chỉ tiếng Việt)

---

## 3. Tổng quan 10 Sprint

| Sprint | Tên | Effort | Priority | Output chính |
|---|---|---|---|---|
| **S0** | Foundation | 3-5h | **CRITICAL** | Types, mock data, utils |
| **S1** | CT Selector Wizard | 3-4h | **CRITICAL** | Component wizard 3 step |
| **S2** | Refactor LessonEditor dynamic | 4-5h | **CRITICAL** | Editor đọc template động |
| **S3** | Upgrade 7 block hiện có | 4-5h | HIGH | Quiz đầy đủ, inline edit |
| **S4** | 4 block mới HIGH priority | 5-6h | HIGH | subject-roles, group, rubric, safety |
| **S5** | 9 Attachment Slots | 3-4h | HIGH | AttachmentSlotsPanel |
| **S6** | CT5 ResearchProjectEditor | 5-6h | MEDIUM | Component CT5 + 5 block NCKH |
| **S7** | AI Assist nâng cao | 3-4h | MEDIUM | Menu AI 5 actions |
| **S8** | UX Polish | 4-5h | MEDIUM | DnD, Preview, Auto-save, Status |
| **S9** | Workflow & Versioning | 3-4h | LOW | Comments, version list |
| **S10** | Integration & QA | 3-4h | **CRITICAL** | Wire up everywhere, smoke test |
| **TOTAL** | | **40-50h** | | |

### 3.1. Critical path

```
S0 → S1 → S2 → S5 ──┐
              S3 ───┤
              S4 ───┴→ S10 (Integration)
              S6 (parallel)
              S7 (parallel sau S2)
              S8 (parallel sau S2)
              S9 (parallel sau S2)
```

→ S0, S1, S2 phải tuần tự. S3-S9 có thể song song. S10 cuối cùng.

---

## 4. Sơ đồ dependencies

```
                    ┌─────────────┐
                    │  S0: Setup  │
                    │ Types + mock│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  S1: Wizard │
                    │  CT Picker  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────────────┐
                    │  S2: Refactor Editor    │
                    │  dynamic per CT         │
                    └──────┬──────────────────┘
                           │
            ┌──────────────┼──────────────┬─────────────┐
            │              │              │             │
       ┌────▼────┐    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
       │ S3:     │    │ S4:     │    │ S5:     │   │ S6:     │
       │ Upgrade │    │ New     │    │ 9 Slots │   │ CT5     │
       │ 7 blocks│    │ 4 blocks│    │         │   │ Editor  │
       └────┬────┘    └────┬────┘    └────┬────┘   └────┬────┘
            │              │              │             │
            └──────────────┴──────────────┴─────────────┤
                           │                            │
                  ┌────────▼─────┬─────────┬──────────┐ │
                  │  S7: AI      │ S8: UX  │ S9: Wfl  │ │
                  │  Assist      │ Polish  │ Versions │ │
                  └────────┬─────┴────┬────┴──────┬───┘ │
                           │          │           │     │
                           └──────────┴───────────┴─────┤
                                                        │
                                              ┌─────────▼───────┐
                                              │  S10: Integrate │
                                              │  + QA + Build   │
                                              └─────────────────┘
```

---

# Sprint 0 — Foundation (3-5h)

## S0 — Mục tiêu

Đặt nền tảng cho mọi sprint khác: TypeScript types, mock data constants, utility functions. Không có UI mới ở sprint này — chỉ setup.

## S0 — Tasks

### S0.1 — Tạo `mock-data/ct-templates.ts` (1h)

**Mô tả:** Concrete TypeScript constants cho 5 CT theo [CT-Programs-Specification.md](./CT-Programs-Specification.md) section 14.

**File:** `Prototype/src/app/components/mock-data/ct-templates.ts` (new)

**Nội dung:**
```typescript
export interface Phase { id, label, color, hint, targetMin }
export interface MetadataField { id, label, type, required, options?... }
export interface CTTemplate { code, fullName, ... phases, metadataFields, ... }
export const CT_TEMPLATES: Record<StemProgram, CTTemplate> = {
  CT1: { /* 4 phase 5512, metadata: môn + sgk */ },
  CT2: { /* 4 phase 5512, metadata: môn chủ đạo + môn tích hợp */ },
  CT3: { /* 4 phase đổi tên, metadata: tên hoạt động + sản phẩm */ },
  CT4: { /* 5 phase, metadata: module + hardware + safety */ },
  CT5: { /* placeholder — sẽ override bằng ResearchProjectTemplate */ },
};
```

**Acceptance:**
- [ ] Export `CT_TEMPLATES` với 5 entries
- [ ] Mỗi entry có đầy đủ phases (4-5-8 tuỳ CT)
- [ ] Mỗi entry có `metadataFields[]` matching spec
- [ ] Type guards + helper `getCTTemplate(code)` được export

---

### S0.2 — Tạo `mock-data/ct4-modules.ts` (0.5h)

**Mô tả:** 4 module cố định CT4 (Robotics 1, AI, IoT, Robotics+AI) với chi tiết.

**File:** `Prototype/src/app/components/mock-data/ct4-modules.ts` (new)

**Nội dung:**
```typescript
export interface CT4Module {
  id, name, shortName,
  languages: ProgrammingLanguage[],
  defaultHardware: string[],   // BOM template
  safetyTemplate: string,       // Safety notes pre-fill
  suitableGrades: string[],     // VD ["THCS", "THPT"]
}

export const CT4_MODULES: CT4Module[] = [
  { id: "robotics_1", name: "Chương trình Robotics 1", ... },
  { id: "ai",          name: "Chương trình AI", ... },
  { id: "iot",         name: "Chương trình IoT", ... },
  { id: "robotics_ai", name: "Chương trình Robotics + AI", ... },
];
```

**Acceptance:**
- [ ] Export `CT4_MODULES` (4 entries)
- [ ] Mỗi module có safety template realistic

---

### S0.3 — Tạo `mock-data/ct5-topics.ts` (0.5h)

**Mô tả:** 18 chủ đề NCKH (placeholder) + workflow phase definitions.

**File:** `Prototype/src/app/components/mock-data/ct5-topics.ts` (new)

**Nội dung:**
```typescript
export interface CT5Topic {
  id, name, description,
  suitableGrades: string[],
  estimatedDuration: "3m" | "6m" | "1y" | "2y",
  defaultMethodology: string,
}

export const CT5_TOPICS: CT5Topic[] = [
  { id: "T01", name: "Lọc nước từ thực vật bản địa", grades: ["THCS", "THPT"], duration: "6m", ... },
  // ... 18 entries (có thể là placeholder name nếu chưa có Excel fill)
];

export const RESEARCH_PHASES: Phase[] = [
  { id: "rq",          label: "Câu hỏi nghiên cứu",  ... },
  { id: "lit",         label: "Tổng quan tài liệu",  ... },
  { id: "hypothesis",  label: "Giả thuyết",          ... },
  { id: "method",      label: "Phương pháp",         ... },
  { id: "data",        label: "Thu thập dữ liệu",    ... },
  { id: "analysis",    label: "Phân tích",           ... },
  { id: "conclusion",  label: "Kết luận",            ... },
  { id: "report",      label: "Báo cáo / Poster",    ... },
];
```

**Acceptance:**
- [ ] 18 topics có name + grade + duration
- [ ] `RESEARCH_PHASES` (8 phases) có color/hint khác bài giảng thường

---

### S0.4 — Tạo `mock-data/sgk-books.ts` (0.5h)

**Mô tả:** Danh mục SGK Bộ GD&ĐT cho picker (mock).

**File:** `Prototype/src/app/components/mock-data/sgk-books.ts` (new)

**Nội dung:**
```typescript
export interface SGKBook {
  id, grade, subject, publisher, // "Cánh Diều" / "Kết Nối Tri Thức" / "Chân Trời Sáng Tạo"
  chapters: { id, name, lessons: { id, name }[] }[],
}

export const SGK_BOOKS: SGKBook[] = [
  { id: "TIN-8-CD", grade: "THCS 8", subject: "Tin học", publisher: "Cánh Diều",
    chapters: [ ... ] },
  // ~15-20 books đại diện đủ Toán/Lý/Hoá/Sinh/Tin/Công nghệ × 6 khối lớp
];

export function findSGKBooks(grade: string, subject: string): SGKBook[];
```

**Acceptance:**
- [ ] ≥ 15 books mock data
- [ ] Helper `findSGKBooks(grade, subject)` filter được

---

### S0.5 — Tạo `mock-data/attachment-slots.ts` (0.5h)

**Mô tả:** 9 attachment slots chuẩn theo Excel sheet "Học liệu, thiết bị".

**File:** `Prototype/src/app/components/mock-data/attachment-slots.ts` (new)

**Nội dung:** Như spec section 14 — array 9 slot definitions với `required`, `acceptedTypes`, `forUser`.

**Acceptance:**
- [ ] Export `ATTACHMENT_SLOT_TEMPLATES` (9 entries)
- [ ] 4 slots có `required: true` (lesson_plan, pptx, student_worksheet, exercises_assessment)

---

### S0.6 — Update `mock-data/types.ts` cho schema v2 (1h)

**Mô tả:** Thêm `LessonV2` type với discriminated union `ctMetadata`.

**File:** `Prototype/src/app/components/mock-data/types.ts` (edit)

**Strategy:** Giữ `Lesson` (v1) cho backward compat, thêm `LessonV2` cho bài mới + helper convert.

**Nội dung:**
```typescript
export type CTMetadata =
  | CT1Meta | CT2Meta | CT3Meta | CT4Meta | CT5Meta;

export interface LessonV2 {
  id, title, programCode, status, blocks, attachments,
  competencies: Competency[],
  ctMetadata: CTMetadata,
  ... // see CT-Programs-Specification.md §13
}

export type Competency = "sang_tao" | "phan_bien" | "hop_tac" | "giao_tiep" | "gqvd" | "ky_su";

export const COMPETENCY_META: Record<Competency, { label, icon, color }> = { ... };
```

**Acceptance:**
- [ ] Types compile
- [ ] `LessonV2` discriminated union nhận diện được bằng `ctMetadata.type`
- [ ] `COMPETENCY_META` cho 6 năng lực có label tiếng Việt

---

### S0.7 — Update `mock-data/content-drafts.ts` (0.5h)

**Mô tả:** Migrate 8 STUDIO_LESSONS hiện có sang có `ctMetadata` placeholder (cho test thực tế).

**File:** edit existing

**Acceptance:**
- [ ] D1-D8 có `ctMetadata` ứng với CT của chúng (D1→CT4 module robotics_1, D3→CT5 topic T01, ...)

---

### S0.8 — Helper `lib/ct-utils.ts` (0.5h)

**Mô tả:** Utility functions chung.

**File:** `Prototype/src/app/lib/ct-utils.ts` (new)

**Nội dung:**
```typescript
export function getPhasesForCT(code: StemProgram): Phase[]
export function getBlocksAvailableForCT(code: StemProgram): BlockType[]
export function getMandatoryBlocksForCT(code: StemProgram): BlockType[]
export function validateLessonV2(lesson: LessonV2): { ok: boolean; errors: string[] }
export function isCTRequiringSGK(code: StemProgram): boolean
```

**Acceptance:**
- [ ] Unit-testable (mặc dù chưa có test framework, function pure)
- [ ] Cover all 5 CT

---

## S0 — Deliverables

- 5 file mock-data mới
- Updated `types.ts`
- 1 utility file
- **Không có UI thay đổi**
- Build pass

## S0 — Validation

```bash
npm run build  # Phải pass
```

---

# Sprint 1 — CT Selector Wizard (3-4h)

## S1 — Mục tiêu

Khi NCC click "Soạn bài mới" trong `ContentAuthoringStudio`, mở Wizard 3 bước thay vì vào thẳng editor. Cuối wizard → navigate đến editor (hoặc ResearchProjectEditor nếu CT5).

## S1 — Tasks

### S1.1 — Tạo `CTSelectorWizard.tsx` (1.5h)

**File:** `Prototype/src/app/components/stem/supplier/CTSelectorWizard.tsx` (new)

**UI:** Dialog/Modal 3 bước

```
Step 1: Chọn Chương trình
  ┌───────────┬───────────┬───────────┬───────────┬───────────┐
  │   CT1     │   CT2     │   CT3     │   CT4     │   CT5     │
  │ Tích hợp  │ Liên môn  │ Đổi mới ST│ Robotic/AI│ NCKH      │
  │ trong môn │           │ (buổi 2)  │ (4 module)│ (18 chủ đề)│
  └───────────┴───────────┴───────────┴───────────┴───────────┘
  Mô tả CT đã chọn ↓
  Đối tượng GV, HS, TKB, thời lượng default

Step 2: Chọn Bậc học + Khối lớp
  [Mẫu giáo] [Tiểu học] [THCS] [THPT] [Liên cấp] [THPT Nghề]
  → Khối lớp cụ thể (dropdown sau khi chọn bậc)

Step 3a (CT1/CT2/CT3): Chọn môn / Chủ đề tích hợp / Tên hoạt động
Step 3b (CT4): Chọn 1 trong 4 module
Step 3c (CT5): Chọn 1 trong 18 chủ đề NCKH

Footer: [← Back] [Tiếp theo →] / [✓ Tạo bài giảng]
```

**Logic:**
- Step 1, 2, 3 với state local `{ ct, bậc, klass, ... }`
- Validate trước khi cho phép Next
- Cuối: navigate với query params hoặc state passed to next route

**Acceptance:**
- [ ] 3 steps render đúng theo CT đã chọn ở step 1
- [ ] Step 3 thay đổi UI tuỳ CT (môn vs module vs topic)
- [ ] Có thể Back / Next
- [ ] Click "Tạo" → navigate `/supplier/content/authoring/new?ct=CT4&module=ai&grade=THCS%208`

---

### S1.2 — Integrate wizard vào `ContentAuthoringStudio` (1h)

**File:** edit `ContentAuthoringStudio.tsx`

**Thay đổi:**
- Button "+ Soạn bài mới" trước đây navigate trực tiếp → giờ mở modal wizard
- State `showWizard: boolean` ở component level

**Acceptance:**
- [ ] Click "Soạn bài mới" → modal mở
- [ ] Modal click Cancel → đóng
- [ ] Modal hoàn thành → navigate

---

### S1.3 — Update routing (0.5h)

**File:** `Prototype/src/app/routes.ts` (or wherever routes defined)

**Thay đổi:**
- `/supplier/content/authoring/new` accept query params: `?ct=CT4&module=ai&grade=...`
- Route mới: `/supplier/content/authoring/research/new` (CT5) → `ResearchProjectEditor`
- Route mới: `/supplier/content/authoring/research/:id` → `ResearchProjectEditor`

**Acceptance:**
- [ ] Routes resolve đúng component
- [ ] Query params propagate đến editor

---

### S1.4 — Editor đọc query params (0.5h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- `useSearchParams()` đọc `ct`, `module`, `grade`, `subject`, etc.
- Initialize `form` state với value từ params (override `DRAFT_META.new`)

**Acceptance:**
- [ ] Vào `?ct=CT4&module=ai` → form khởi tạo với program=CT4, ctMetadata.module="ai"

---

## S1 — Deliverables

- `CTSelectorWizard.tsx` (~300 dòng)
- Update `ContentAuthoringStudio.tsx` (~30 dòng changes)
- Update routes
- Update `LessonEditor.tsx` để đọc query params

## S1 — Validation

- Click "Soạn bài mới" → wizard 3 step → cuối cùng vào đúng editor (regular hoặc research)
- Build pass

---

# Sprint 2 — Refactor LessonEditor dynamic per CT (4-5h)

## S2 — Mục tiêu

Hiện tại `LessonEditor` hardcode 4 phase + 7 block. Refactor để đọc từ `CT_TEMPLATES[code]` → phases, available blocks, mandatory blocks, metadata fields đều dynamic.

## S2 — Tasks

### S2.1 — Phase sidebar dynamic (1h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- Remove hardcoded `PHASES` array
- Use `getPhasesForCT(currentCT)` từ `ct-utils`
- Phase count có thể là 4 / 5 / 8
- Color/label/hint dynamic theo CT

**Acceptance:**
- [ ] Đổi CT1 → CT4: phase sidebar tự update từ 4 → 5 phase
- [ ] Label phase đúng (CT3 hiện "Khám phá vấn đề" thay vì "Khởi động")

---

### S2.2 — Block picker dynamic (1h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- Block picker chỉ hiện những block available cho CT đang dùng
- Mandatory block có badge "*Bắt buộc"
- Nếu block là mandatory mà chưa add → cảnh báo ở phase đó

**Acceptance:**
- [ ] CT4: picker thấy `code`, `safety-notes`, `group-activity` với badge bắt buộc
- [ ] CT1: picker KHÔNG thấy `subject-roles`, `safety-notes`, `data-table`
- [ ] Cảnh báo vàng ở canvas nếu thiếu mandatory block

---

### S2.3 — Settings panel dynamic metadata fields (1.5h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- Settings panel hiện chỉ có CHƯƠNG TRÌNH/KHỐI LỚP/MÔN/THỜI LƯỢNG/SGK
- Refactor thành render dynamic theo `CT_TEMPLATES[ct].metadataFields`
- Mỗi field định nghĩa: id, label, type ("select", "multi-select", "text", "textarea", "number", "device-picker", "subject-picker", "sgk-picker", ...)
- Component `MetadataFieldRenderer` switch theo type

**Acceptance:**
- [ ] CT1 settings: Môn (1 select) + Bài SGK (picker)
- [ ] CT2 settings: Môn chủ đạo + Môn tích hợp (multi) + Chủ đề (text)
- [ ] CT3 settings: Tên hoạt động + Lĩnh vực + Sản phẩm cuối
- [ ] CT4 settings: Module + Ngôn ngữ + Phần cứng + Lưu ý an toàn

---

### S2.4 — Section "Mục tiêu bài học" mới (top of canvas) (1h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- Thêm section trên cùng canvas (trước phase content):
  - 🎯 Mục tiêu bài học (4 trường nhỏ: Kiến thức / Kỹ năng / Thái độ / Năng lực)
  - 🏆 Năng lực phát triển: checkbox 6 năng lực với màu icon
- Collapsible — default open

**Acceptance:**
- [ ] Section hiển thị ở top canvas, dưới phase header
- [ ] 4 trường textarea + checkbox 6 năng lực
- [ ] State save vào form

---

### S2.5 — Section "Thiết bị cần thiết" (0.5h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- Section thứ 2 ở top canvas
- Picker từ `DEVICES[]` (như Tab 2 Configurator)
- Hiển thị: SL × thiết bị, có thể xóa

**Acceptance:**
- [ ] Picker mở dialog chọn thiết bị
- [ ] Selected devices hiện list với qty inline edit

---

## S2 — Deliverables

- Refactored `LessonEditor.tsx` (~600-700 dòng)
- New helper components: `MetadataFieldRenderer`, `CompetencyChecklist`, `EquipmentRequiredSection`, `LearningObjectivesSection`
- Build pass

## S2 — Validation

- Switch giữa 5 CT (mở 5 bài D1-D8 khác CT) → editor thay đổi đúng
- Build pass

---

# Sprint 3 — Upgrade 7 block hiện có (4-5h)

## S3 — Mục tiêu

7 block hiện đang quá nông. Upgrade để usable thật sự, đặc biệt Quiz.

## S3 — Tasks

### S3.1 — Inline edit cho text/heading (1h)

**File:** new `lesson-blocks/EditableTextBlock.tsx`

**Thay đổi:**
- Block text/heading: click vào content → mode edit (textarea)
- Blur hoặc Enter (cho heading) → save
- Heading có 3 cấp H1/H2/H3 select

**Acceptance:**
- [ ] Double-click text → edit, blur → save
- [ ] Heading có dropdown chọn H1/H2/H3
- [ ] State persist trong form

---

### S3.2 — Quiz block đầy đủ (2h)

**File:** new `lesson-blocks/QuizBlock.tsx`

**Thay đổi:**
- Hiện chỉ có content string + 3 đáp án hardcoded
- Upgrade:
  - 3 dạng câu hỏi: Trắc nghiệm 1 đáp án / Nhiều đáp án / Đúng-sai
  - Editable answers (add/remove option)
  - Mark đáp án đúng (radio cho single, checkbox cho multi)
  - Trường giải thích (explanation textarea)
  - Độ khó: Dễ / Trung bình / Khó (dropdown)
  - Thời gian gợi ý (sec)

**Schema:**
```typescript
interface QuizBlock {
  type: "quiz";
  questionType: "single" | "multi" | "true_false";
  question: string;
  options: { id, text, correct }[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // seconds
}
```

**Acceptance:**
- [ ] Edit question + answers inline
- [ ] Mark đáp án đúng
- [ ] Switch loại câu hỏi (single/multi/T-F) → UI tự đổi

---

### S3.3 — Image block với upload UI (0.5h)

**File:** new `lesson-blocks/ImageBlock.tsx`

**Thay đổi:**
- Hiện chỉ placeholder gray box
- Thêm: nút Upload (mở dialog mock — toast.info "Mở dialog chọn file"), URL input, Caption textarea
- Save URL → display `<img src={url}>`

**Acceptance:**
- [ ] Click placeholder → input URL hoặc upload button
- [ ] Có URL → render image
- [ ] Caption text edit được

---

### S3.4 — Video block với YouTube embed (0.5h)

**File:** new `lesson-blocks/VideoBlock.tsx`

**Thay đổi:**
- Hỗ trợ YouTube URL → render iframe
- Hỗ trợ upload .mp4 (mock)
- Caption + thời lượng

**Acceptance:**
- [ ] Paste YouTube URL → iframe embed
- [ ] Validation URL hợp lệ

---

### S3.5 — Code block với syntax highlight (0.5h)

**File:** new `lesson-blocks/CodeBlock.tsx`

**Thay đổi:**
- Hiện text plain
- Upgrade: chọn ngôn ngữ (Scratch/Block/Arduino/Python), syntax highlight cơ bản
- Có thể dùng `<pre><code class="language-xxx">` + Prism.js nhẹ (hoặc CSS tự viết)

**Acceptance:**
- [ ] Dropdown chọn ngôn ngữ
- [ ] Code render với màu cú pháp (đơn giản: keyword đỏ, string xanh, comment xám)

---

### S3.6 — Attachment block với file picker (0.5h)

**File:** new `lesson-blocks/AttachmentBlock.tsx`

**Thay đổi:**
- Hiện chỉ string content
- Upgrade: tên file + icon theo type (PDF/DOC/PPT) + size + nút download (mock)

**Acceptance:**
- [ ] Hiển thị tên + icon + size
- [ ] Click download → toast

---

## S3 — Deliverables

- 6 components mới trong `lesson-blocks/`
- Refactor `LessonEditor` để render block qua component (thay vì switch case dài)

## S3 — Validation

- Mỗi loại block: tạo + edit + xoá được
- Quiz đầy đủ tính năng

---

# Sprint 4 — 4 block mới HIGH priority (5-6h)

## S4 — Mục tiêu

Thêm 4 block mới cho CT2/CT3/CT4: `subject-roles`, `group-activity`, `rubric`, `safety-notes`.

## S4 — Tasks

### S4.1 — Block `subject-roles` (CT2) (1h)

**File:** `lesson-blocks/SubjectRolesBlock.tsx`

**UI:** Table 3 cột — Môn / Vai trò trong chủ đề / Kiến thức đóng góp

**Schema:**
```typescript
interface SubjectRolesBlock {
  type: "subject-roles";
  rows: { subject: string; role: string; knowledge: string }[];
}
```

**Acceptance:**
- [ ] Thêm/xóa row
- [ ] Subject dropdown từ `SUBJECTS`
- [ ] Render table đẹp

---

### S4.2 — Block `group-activity` (CT3/4/5) (1.5h)

**File:** `lesson-blocks/GroupActivityBlock.tsx`

**Schema:**
```typescript
interface GroupActivityBlock {
  type: "group-activity";
  studentsPerGroup: number;
  duration: number; // minutes
  goal: string;
  steps: string[];
  roles: { name: string; description: string }[];
  expectedOutput: string;
}
```

**UI:**
- Đầu: Số HS/nhóm + Thời gian
- Mục tiêu (textarea)
- Các bước thực hiện (numbered list, add/remove)
- Vai trò trong nhóm (list pairs)
- Sản phẩm dự kiến

**Acceptance:**
- [ ] Add/remove step
- [ ] Add/remove role
- [ ] Tổng thời gian phải ≤ duration của phase

---

### S4.3 — Block `rubric` (CT3/4/5) (1.5h)

**File:** `lesson-blocks/RubricBlock.tsx`

**Schema:**
```typescript
interface RubricBlock {
  type: "rubric";
  criteria: {
    id, name, weight,           // weight 0-100, total = 100%
    levels: { score, descriptor }[]   // VD 4 mức: Yếu/TB/Khá/Tốt
  }[];
}
```

**UI:** Table — Tiêu chí × Trọng số × 4 mức điểm (descriptors)

**Acceptance:**
- [ ] Thêm/xóa tiêu chí
- [ ] Cảnh báo nếu tổng weight ≠ 100
- [ ] Each criteria có 4 levels editable

---

### S4.4 — Block `safety-notes` (CT4) (1h)

**File:** `lesson-blocks/SafetyNotesBlock.tsx`

**Schema:**
```typescript
interface SafetyNotesBlock {
  type: "safety-notes";
  severity: "info" | "warning" | "danger";
  category: "electrical" | "battery" | "tools" | "chemical" | "general";
  notes: string[];   // bullet list
}
```

**UI:** Card cam/đỏ tuỳ severity, icon cảnh báo, bullet list rules

**Acceptance:**
- [ ] 3 severity → 3 màu
- [ ] Pre-fill template từ CT4 module (electrical for Robotics, etc.)
- [ ] Editable bullet list

---

### S4.5 — Register 4 block mới trong `BLOCK_META` (0.5h)

**File:** edit `LessonEditor.tsx` + `ct-utils.ts`

**Thay đổi:**
- Add 4 entries vào `BLOCK_META`
- Update `getBlocksAvailableForCT()` để return đúng theo CT
- Update render switch trong editor để gọi component mới

**Acceptance:**
- [ ] Block picker hiện 4 block mới khi đúng CT
- [ ] Tạo + edit được mỗi loại

---

## S4 — Deliverables

- 4 components mới
- Update `BLOCK_META` registry
- Update CT template availability rules

## S4 — Validation

- Test trong từng CT — block mới chỉ hiện ở CT phù hợp
- Build pass

---

# Sprint 5 — 9 Attachment Slots (3-4h)

## S5 — Mục tiêu

Thay "Tài liệu Giáo viên" (URL list tự do) bằng 9 slot cố định theo Excel chuẩn.

## S5 — Tasks

### S5.1 — Component `AttachmentSlotsPanel.tsx` (1.5h)

**File:** `Prototype/src/app/components/stem/lesson-blocks/AttachmentSlotsPanel.tsx` (new)

**UI:**
```
┌────────────────────────────────────────────────────────────┐
│ 📎 TÀI LIỆU KÈM THEO (9 loại chuẩn Bộ GD&ĐT)              │
├────────────────────────────────────────────────────────────┤
│ 1. 📅 Kế hoạch giáo dục              [⬆ Upload] [👁]       │
│    Đã có: kehoach-T11-2026.docx (2.1 MB)                  │
│                                                            │
│ 2. 📚 Tài liệu bồi dưỡng GV         [⬆ Upload]           │
│    (chưa có)                                              │
│                                                            │
│ 3. 📋 Kế hoạch bài dạy ★            [⬆ Upload] [👁]       │
│    Đã có: KHBD-Bài24.docx                                 │
│                                                            │
│ 4. 🖥 Bài giảng PPTX ★              [⬆ Upload]           │
│    ⚠️ Chưa upload — bắt buộc                              │
│                                                            │
│ 5-9. ...                                                  │
└────────────────────────────────────────────────────────────┘
```

**Schema:**
```typescript
interface AttachmentSlot {
  slotType: string;        // matches ATTACHMENT_SLOT_TEMPLATES
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
}
```

**Acceptance:**
- [ ] 9 slot hiển thị đúng order
- [ ] Slot required (4 cái) có ★ + cảnh báo nếu trống
- [ ] Upload mock (toast.info)
- [ ] Slot #8 (Danh mục thiết bị) auto-generate từ "Thiết bị cần"

---

### S5.2 — Integrate vào `LessonEditor` (1h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- Replace section "Tài liệu Giáo viên" (Tab 4 cũ) bằng `<AttachmentSlotsPanel />`
- Section ở dưới cùng editor canvas hoặc collapsible

**Acceptance:**
- [ ] Editor có section attachment 9 slot
- [ ] State save vào `form.attachments`

---

### S5.3 — Validation checklist update (0.5h)

**File:** `ct-utils.ts`

**Thay đổi:**
- `validateLessonV2` check: 4 required slot phải có file mới được "Gửi duyệt"
- Trả về list errors

**Acceptance:**
- [ ] Click "Gửi duyệt" với 1 slot required rỗng → error message
- [ ] Tất cả OK → submit thành công

---

## S5 — Deliverables

- 1 component mới
- Integrate vào editor
- Validation rules cập nhật

## S5 — Validation

- 9 slot hiện đầy đủ, upload mock OK
- Required validation hoạt động

---

# Sprint 6 — CT5 ResearchProjectEditor (5-6h)

## S6 — Mục tiêu

CT5 KHÁC HẲN bài giảng 45p — là **đề tài nghiên cứu dài hạn 3 tháng–2 năm**. Tách thành component riêng.

## S6 — Tasks

### S6.1 — Component `ResearchProjectEditor.tsx` (2h)

**File:** `Prototype/src/app/components/stem/supplier/ResearchProjectEditor.tsx` (new)

**UI:**
- Top bar khác (badge "Nghiên cứu KH", show project status)
- Sidebar: 8 phase research (vertical timeline thay grid)
- Center: phase content (long-form, có thể spanning weeks)
- Right: Settings — Chủ đề, HS dẫn đầu, GV mentor, thời gian dự kiến, plan 5 năm

**Acceptance:**
- [ ] Component render OK
- [ ] Reuse component shared với LessonEditor (top bar, settings) nếu có thể
- [ ] 8 phase sidebar vertical

---

### S6.2 — Block `research-question` (0.5h)

**File:** `lesson-blocks/ResearchQuestionBlock.tsx`

**Schema:**
```typescript
interface ResearchQuestionBlock {
  type: "research-question";
  mainQuestion: string;
  subQuestions: string[];
  scope: string;
  significance: string;
}
```

**Acceptance:**
- [ ] 4 textarea điền câu hỏi chính + phụ + phạm vi + ý nghĩa

---

### S6.3 — Block `hypothesis` (0.5h)

**File:** `lesson-blocks/HypothesisBlock.tsx`

**Schema:**
```typescript
interface HypothesisBlock {
  type: "hypothesis";
  ifClause: string;     // "Nếu..."
  thenClause: string;   // "thì..."
  reasoning: string;
  variables: { independent: string; dependent: string; controlled: string[] };
}
```

**Acceptance:**
- [ ] Form 4-5 trường structured

---

### S6.4 — Block `data-table` (1h)

**File:** `lesson-blocks/DataTableBlock.tsx`

**Schema:**
```typescript
interface DataTableBlock {
  type: "data-table";
  columns: { id, name, unit }[];
  rows: Record<string, string | number>[];
  caption?: string;
}
```

**UI:** Editable table (add column, add row, edit cell)

**Acceptance:**
- [ ] Add/remove cols và rows
- [ ] Edit cell inline
- [ ] Caption phía dưới

---

### S6.5 — Block `chart` (1h)

**File:** `lesson-blocks/ChartBlock.tsx`

**Schema:**
```typescript
interface ChartBlock {
  type: "chart";
  chartType: "line" | "bar" | "scatter";
  dataSource: string;     // ID của data-table block parent
  xAxis: string;          // column name
  yAxis: string[];        // column names
}
```

**UI:**
- Chọn data-table block trong cùng phase
- Chọn axis
- Render với recharts

**Acceptance:**
- [ ] Link với data-table → vẽ chart dynamic
- [ ] 3 chart type

---

### S6.6 — Block `literature-citation` (0.5h)

**File:** `lesson-blocks/CitationBlock.tsx`

**Schema:**
```typescript
interface CitationBlock {
  type: "citation";
  format: "APA" | "MLA";
  citations: {
    authors: string;
    year: number;
    title: string;
    source: string;
    url?: string;
  }[];
}
```

**Acceptance:**
- [ ] Format selector
- [ ] Add citation row
- [ ] Render đúng format APA/MLA

---

### S6.7 — Plan 5 năm UI cho HS năng khiếu (0.5h)

**Trong settings panel ResearchProjectEditor**

**UI:** Timeline 5 năm với mục tiêu mỗi năm (Năm 1: ..., Năm 2: ..., ...)

**Acceptance:**
- [ ] Collapsible section
- [ ] 5 trường textarea
- [ ] Save vào `ctMetadata.fiveYearPlan`

---

### S6.8 — Update routing để dispatch CT5 (0.5h)

**File:** edit routes

**Thay đổi:**
- `/supplier/content/authoring/new?ct=CT5` → ResearchProjectEditor
- Wizard cuối khi chọn CT5 → navigate đến research route

**Acceptance:**
- [ ] Chọn CT5 trong wizard → vào ResearchProjectEditor
- [ ] Chọn CT1-4 → vào LessonEditor như cũ

---

## S6 — Deliverables

- 1 component lớn mới
- 5 block components NCKH
- Routing updates

## S6 — Validation

- Smoke test CT5 flow end-to-end
- Build pass

---

# Sprint 7 — AI Assist nâng cao (3-4h)

## S7 — Mục tiêu

Hiện AI Gợi ý chỉ 1 action "Tạo nội dung mẫu". Upgrade thành menu 5 actions theo CT.

## S7 — Tasks

### S7.1 — Component `AIAssistMenu.tsx` (1.5h)

**File:** `lesson-blocks/AIAssistMenu.tsx` (new)

**UI:** Dropdown menu hoặc dialog với 5 actions:

```
🪄 AI Assist
├── ✨ Tạo nội dung mẫu cho [phase này]
├── 📺 Đề xuất video YouTube
├── ❓ Sinh quiz từ nội dung đã có
├── 🔍 Tìm bài tương tự trong Ngân hàng
└── 📖 Map với bài SGK liên quan
```

**Schema mỗi action:**
- Mock response delay 1-2s rồi insert block
- Có thể có dialog xác nhận trước khi insert

**Acceptance:**
- [ ] 5 actions hoạt động (mock)
- [ ] Mỗi action có loading state
- [ ] Inserted block visible ngay

---

### S7.2 — Action: Tạo nội dung mẫu theo CT (1h)

**Cải thiện action #1:** Template content khác nhau cho mỗi (CT × phase).

VD CT4 phase "Lắp ráp & Lập trình":
- Insert heading "Sơ đồ kết nối phần cứng"
- Insert image (placeholder)
- Insert code block với template Arduino C
- Insert safety-notes

VD CT5 phase "Thu thập dữ liệu":
- Insert data-table empty
- Insert text "Quy trình thu thập:..."

**File:** edit `AIAssistMenu.tsx`

**Acceptance:**
- [ ] CT khác nhau → AI gen nội dung khác nhau
- [ ] Phase khác nhau → nội dung khác

---

### S7.3 — Action: Sinh quiz từ nội dung (0.5h)

**Logic:** Đọc tất cả text/heading block trong phase, gen 3-5 câu quiz dạng single choice.

Mock: dùng template câu hỏi "Theo nội dung bài, [X] có ý nghĩa gì?" với options random.

**Acceptance:**
- [ ] Insert quiz block với 3 câu mới

---

### S7.4 — Action: Tìm bài tương tự (0.5h)

**Logic:** Filter `lessons[]` (Ngân hàng) theo cùng CT + cùng grade, return top 3.

UI: Dialog show 3 bài, click "Xem" → navigate đến bài đó.

**Acceptance:**
- [ ] Dialog hiện 3 bài relevant
- [ ] Click navigate đúng

---

### S7.5 — Action: Map với SGK (0.5h)

**Logic:** Dialog mở SGK picker, filter theo grade + subject hiện tại, list các bài. Click → bind vào `ctMetadata.sgkBook`.

**Acceptance:**
- [ ] Dialog mở từ menu
- [ ] Picker filter đúng
- [ ] Bind state thành công

---

## S7 — Deliverables

- 1 component mới
- 5 AI actions hoạt động (mock)

## S7 — Validation

- Test 5 actions ở mỗi CT khác nhau
- Build pass

---

# Sprint 8 — UX Polish (4-5h)

## S8 — Mục tiêu

Drag-drop, Preview modal, Auto-save, Status indicator — những UX nâng cao.

## S8 — Tasks

### S8.1 — Drag-drop reorder block (1.5h)

**File:** edit `LessonEditor.tsx`

**Library:** `react-dnd` (đã cài trong dependencies)

**Thay đổi:**
- Block list dùng `DndProvider` + `useDrag` / `useDrop`
- `GripVertical` icon → drag handle thật
- Reorder trong cùng phase
- Có thể move giữa các phase (drop vào phase header trong sidebar)

**Acceptance:**
- [ ] Kéo block lên/xuống trong cùng phase → reorder
- [ ] Visual feedback khi dragging (opacity 0.5, drop indicator line)

---

### S8.2 — Preview modal (1.5h)

**File:** `lesson-blocks/LessonPreviewModal.tsx` (new)

**UI:**
- Full-screen modal
- Top: Title + close button + tab "Góc nhìn HS" / "Góc nhìn GV"
- Body: render bài giảng read-only với UI giống cho học sinh thật (block render đẹp, không có edit controls)
- Sidebar: navigate giữa 4-8 phase

**Acceptance:**
- [ ] Click "Preview" → modal mở
- [ ] Modal render đúng tất cả block đã tạo
- [ ] Switch HS/GV view: GV thấy thêm answer keys, teacher notes (sau này)

---

### S8.3 — Auto-save indicator + logic (1h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- State `lastSavedAt: number | null`
- Effect: mỗi 30s nếu form thay đổi → mock save (toast or silent)
- Top bar hiện "Đã lưu cách đây X phút" (relative time)
- Khi đang edit → "Đang lưu..." (spinner)

**Acceptance:**
- [ ] Indicator hiện trong top bar
- [ ] Update mỗi 30s
- [ ] Khi save: "Đã lưu vừa xong" → 1 phút sau "1 phút trước"

---

### S8.4 — Status badge top bar (0.5h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- Hiện status hiện tại của bài: Nháp / Chờ duyệt / Đã publish
- Badge có màu giống `STUDIO_STATUS_META`

**Acceptance:**
- [ ] Top bar có badge status cạnh title
- [ ] Đúng màu theo status

---

### S8.5 — Block edit inline (đã làm 1 phần ở S3) — finish (0.5h)

**Đảm bảo tất cả block (heading, text, code, video, image, attachment, quiz, all new) đều có chế độ edit inline.**

**Acceptance:**
- [ ] Click bất kỳ block → edit mode
- [ ] Blur/Enter → save

---

## S8 — Deliverables

- Drag-drop hoạt động
- Preview modal
- Auto-save indicator
- Status badge

## S8 — Validation

- Smoke test UX trên Chrome desktop
- Build pass

---

# Sprint 9 — Workflow & Versioning (3-4h)

## S9 — Mục tiêu

Khi NCC submit bài để review, reviewer (supplier_admin) cần để lại comment. Versioning để xem lịch sử.

## S9 — Tasks

### S9.1 — Comment thread panel (1.5h)

**File:** `lesson-blocks/CommentThreadPanel.tsx` (new)

**UI:**
- Bottom sheet hoặc right drawer collapsible
- List comments: avatar, name, timestamp, content, reply
- Input để thêm comment mới
- Mention `@username` (mock — dropdown showing 3 tên)

**Schema:**
```typescript
interface LessonComment {
  id, lessonId, authorId, authorName,
  content, createdAt,
  parentId?: string,  // reply
  resolved: boolean,
}
```

**Acceptance:**
- [ ] List comments mock 3-4 cái
- [ ] Add comment được
- [ ] Reply (1 level)
- [ ] Mark resolved

---

### S9.2 — Version history view (1h)

**File:** `lesson-blocks/VersionHistoryDialog.tsx` (new)

**UI:**
- Dialog show list version: v1.0 (2026-04-15 - publish), v1.1 (2026-04-20 - draft), ...
- Click version → preview snapshot (read-only modal)
- Nút "Khôi phục phiên bản này" (mock toast)

**Acceptance:**
- [ ] Dialog mở từ top bar
- [ ] List 3-5 version mock
- [ ] Click → preview

---

### S9.3 — Submit/Approve workflow UI (1h)

**File:** edit `LessonEditor.tsx`

**Thay đổi:**
- Khi status = "review" → reviewer (mock current user là supplier_admin) thấy 2 nút: "✅ Duyệt publish" / "❌ Yêu cầu chỉnh sửa"
- Reviewer yêu cầu chỉnh: dialog nhập lý do → push vào comments
- Sau approve → status đổi published

**Acceptance:**
- [ ] Vai trò reviewer thấy đúng UI
- [ ] Workflow chuyển status đúng
- [ ] Comment lưu khi reject

---

## S9 — Deliverables

- 2 components mới
- Workflow buttons

## S9 — Validation

- Submit → review → approve flow chạy được
- Build pass

---

# Sprint 10 — Integration & QA (3-4h)

## S10 — Mục tiêu

Wire up tất cả thay đổi vào các nơi khác trong app + smoke test 5 CT.

## S10 — Tasks

### S10.1 — Update `ContentAuthoringStudio` show CT-specific cards (1h)

**File:** edit `ContentAuthoringStudio.tsx`

**Thay đổi:**
- Mỗi DraftCard hiện CT badge (đã có rồi)
- Thêm: small icons biểu thị metadata đặc trưng theo CT
  - CT2: icon "đa môn" + tooltip danh sách môn
  - CT4: icon module type
  - CT5: icon "research" + duration
- Khi click "Soạn tiếp" của bài CT5 → navigate `/supplier/content/authoring/research/:id`

**Acceptance:**
- [ ] Card hiện đúng theo CT
- [ ] Click vào CT5 → đúng route

---

### S10.2 — Update Tab 4 Configurator hiện CT-specific info (0.5h)

**File:** edit `STEMPackageConfigurator.tsx` Tab4

**Thay đổi:**
- Khi resolve lesson hiển thị: thêm metadata đặc trưng theo CT
- VD CT4 lesson: hiện module ("Robotics 1")
- VD CT5 lesson: hiện thời gian dự kiến ("6 tháng")

**Acceptance:**
- [ ] Resolved card hiện đủ info đặc trưng

---

### S10.3 — Update `TeachingEffectivenessAnalytics` count by competency (0.5h)

**File:** edit `TeachingEffectivenessAnalytics.tsx`

**Thay đổi:**
- Section radar 6 năng lực hiện đang mock — connect thực với `STUDIO_LESSONS` đã có competency tags
- Count: số bài giảng tag năng lực sáng tạo / phản biện / ...

**Acceptance:**
- [ ] Radar chart phản ánh thực data
- [ ] Nếu chưa có data thì show placeholder

---

### S10.4 — Smoke test 5 CT (1h)

**Test cases:**
- [ ] CT1: Tạo bài qua wizard → editor có 4 phase chuẩn + môn + SGK
- [ ] CT2: Tạo bài → editor có 4 phase + môn chủ đạo + môn tích hợp + subject-roles block available
- [ ] CT3: Tạo bài → editor có 4 phase đổi tên + tên hoạt động + sản phẩm cuối + group-activity bắt buộc
- [ ] CT4: Tạo bài → editor có 5 phase + module + code block + safety-notes
- [ ] CT5: Tạo bài → vào ResearchProjectEditor (component khác) với 8 phase NCKH

**Acceptance:**
- [ ] 5/5 CT pass
- [ ] Save + submit + approve flow work cho mỗi CT

---

### S10.5 — Build + cleanup (0.5h)

**Tasks:**
- [ ] `npm run build` pass
- [ ] Remove dead code (DRAFT_META cũ nếu không còn dùng)
- [ ] Update mock-data/index.ts exports

**Acceptance:**
- [ ] Build clean
- [ ] Không có TypeScript error

---

### S10.6 — Update CT-Programs-Specification.md với decisions thực tế (0.5h)

**File:** edit `docs/CT-Programs-Specification.md`

**Thay đổi:**
- Section 16 (Risk & Mitigation): cập nhật trạng thái thực
- Section 17 (Deliverables): mark hoàn thành

**Acceptance:**
- [ ] Doc reflects implementation thực

---

## S10 — Deliverables

- Integration updates
- Smoke test report
- Final build clean

## S10 — Validation

- 5/5 CT smoke test pass
- Build pass
- Spec doc updated

---

## 16. Risk Register

| ID | Risk | Mức độ | Sprint | Mitigation |
|---|---|---|---|---|
| R1 | Excel chưa fill nội dung cụ thể (18 chủ đề CT5, môn × bậc) | High | S0 | Dùng placeholder + ghi chú "chờ Geleximco fill" |
| R2 | `LessonEditor` hiện tại refactor có thể break 8 STUDIO_LESSONS cũ | High | S2 | Giữ DRAFT_META + DRAFT_BLOCKS backward compat, fallback nếu thiếu `ctMetadata` |
| R3 | `react-dnd` setup phức tạp với HTML5Backend trên Windows | Medium | S8 | Đã có sẵn trong deps; nếu lỗi → fallback dùng button up/down |
| R4 | CT5 ResearchProjectEditor effort lớn — có thể không xong trong 5-6h | High | S6 | Có thể defer 5 block NCKH advanced (citation, chart) sang sprint sau |
| R5 | Mock AI responses không impressive | Medium | S7 | Đầu tư template phong phú cho mock — đảm bảo demo tốt |
| R6 | Drag-drop giữa các phase phức tạp | Low | S8 | V1 chỉ reorder trong cùng phase, cross-phase defer |
| R7 | 9 attachment slots khi chưa có backend → upload không thực | Low | S5 | Mock UI rõ ràng, ghi "demo upload" |
| R8 | Quiz block đầy đủ tốn time hơn dự kiến | Medium | S3 | Có thể giảm scope chỉ single + multi (bỏ true-false) ban đầu |

---

## 17. Definition of Done (toàn bộ module)

Trước khi đóng dự án Studio:

- [ ] **Code:** Build sạch, 0 TypeScript error, 0 console error
- [ ] **5 CT:** Tạo + edit + save + submit từng CT đều OK (smoke test pass 5/5)
- [ ] **CT5 dedicated:** `ResearchProjectEditor` component riêng, route khác
- [ ] **Wizard:** 3 step hoàn chỉnh, dispatch đúng component cuối
- [ ] **Blocks:** 16 blocks (7 cũ upgraded + 9 mới) đều render + edit OK
- [ ] **9 attachment slots:** required validation hoạt động
- [ ] **UX polish:** Drag-drop + Preview + Auto-save + Status badge có
- [ ] **AI Assist:** 5 actions mock có
- [ ] **Workflow:** Submit → Comment review → Approve có
- [ ] **Integration:** ContentAuthoringStudio, Tab 4 Configurator, Analytics update reflect
- [ ] **Spec doc:** CT-Programs-Specification.md updated với decisions thực
- [ ] **Demo:** Có thể demo end-to-end 1 bài CT4 và 1 đề tài CT5 cho stakeholder

---

## 18. Phụ lục: Quick reference task list (tất cả task flatten)

| ID | Task | Sprint | Effort | Priority |
|---|---|---|---|---|
| S0.1 | mock-data/ct-templates.ts | 0 | 1h | C |
| S0.2 | mock-data/ct4-modules.ts | 0 | 0.5h | C |
| S0.3 | mock-data/ct5-topics.ts | 0 | 0.5h | C |
| S0.4 | mock-data/sgk-books.ts | 0 | 0.5h | C |
| S0.5 | mock-data/attachment-slots.ts | 0 | 0.5h | C |
| S0.6 | Update types.ts schema v2 | 0 | 1h | C |
| S0.7 | Update content-drafts.ts ctMetadata | 0 | 0.5h | C |
| S0.8 | lib/ct-utils.ts | 0 | 0.5h | C |
| S1.1 | CTSelectorWizard component | 1 | 1.5h | C |
| S1.2 | Wizard integration into Studio | 1 | 1h | C |
| S1.3 | Routing updates | 1 | 0.5h | C |
| S1.4 | Editor read query params | 1 | 0.5h | C |
| S2.1 | Phase sidebar dynamic | 2 | 1h | C |
| S2.2 | Block picker dynamic | 2 | 1h | C |
| S2.3 | Settings metadata fields dynamic | 2 | 1.5h | C |
| S2.4 | Learning objectives section | 2 | 1h | C |
| S2.5 | Equipment required section | 2 | 0.5h | C |
| S3.1 | Inline edit text/heading | 3 | 1h | H |
| S3.2 | Quiz block full | 3 | 2h | H |
| S3.3 | Image block upload UI | 3 | 0.5h | H |
| S3.4 | Video block YouTube embed | 3 | 0.5h | H |
| S3.5 | Code block syntax highlight | 3 | 0.5h | H |
| S3.6 | Attachment block file picker | 3 | 0.5h | H |
| S4.1 | Block subject-roles (CT2) | 4 | 1h | H |
| S4.2 | Block group-activity | 4 | 1.5h | H |
| S4.3 | Block rubric | 4 | 1.5h | H |
| S4.4 | Block safety-notes (CT4) | 4 | 1h | H |
| S4.5 | Register 4 blocks | 4 | 0.5h | H |
| S5.1 | AttachmentSlotsPanel | 5 | 1.5h | H |
| S5.2 | Integrate into editor | 5 | 1h | H |
| S5.3 | Validation rules | 5 | 0.5h | H |
| S6.1 | ResearchProjectEditor component | 6 | 2h | M |
| S6.2 | Block research-question | 6 | 0.5h | M |
| S6.3 | Block hypothesis | 6 | 0.5h | M |
| S6.4 | Block data-table | 6 | 1h | M |
| S6.5 | Block chart | 6 | 1h | M |
| S6.6 | Block citation | 6 | 0.5h | M |
| S6.7 | Plan 5 năm UI | 6 | 0.5h | M |
| S6.8 | Routing CT5 dispatch | 6 | 0.5h | M |
| S7.1 | AIAssistMenu component | 7 | 1.5h | M |
| S7.2 | Action: gen content per CT | 7 | 1h | M |
| S7.3 | Action: gen quiz | 7 | 0.5h | M |
| S7.4 | Action: find similar | 7 | 0.5h | M |
| S7.5 | Action: SGK map | 7 | 0.5h | M |
| S8.1 | Drag-drop reorder | 8 | 1.5h | M |
| S8.2 | Preview modal | 8 | 1.5h | M |
| S8.3 | Auto-save indicator | 8 | 1h | M |
| S8.4 | Status badge | 8 | 0.5h | M |
| S8.5 | Block edit inline (finish) | 8 | 0.5h | M |
| S9.1 | Comment thread panel | 9 | 1.5h | L |
| S9.2 | Version history dialog | 9 | 1h | L |
| S9.3 | Submit/Approve workflow | 9 | 1h | L |
| S10.1 | Update Studio CT cards | 10 | 1h | C |
| S10.2 | Update Tab 4 CT info | 10 | 0.5h | C |
| S10.3 | Update Analytics competency | 10 | 0.5h | C |
| S10.4 | Smoke test 5 CT | 10 | 1h | C |
| S10.5 | Build + cleanup | 10 | 0.5h | C |
| S10.6 | Update spec doc | 10 | 0.5h | C |

**Total: 57 tasks**

**Effort breakdown by priority:**
- **C (Critical):** 23 tasks × ~15-16h
- **H (High):** 14 tasks × ~12-13h
- **M (Medium):** 17 tasks × ~13-14h
- **L (Low):** 3 tasks × ~3.5h

---

## 19. Suggested execution order

### Tuần 1 (16-18h work) — MVP usable
- Sprint 0 (S0.1 → S0.8)
- Sprint 1 (S1.1 → S1.4)
- Sprint 2 (S2.1 → S2.5)
- Sprint 5 (S5.1 → S5.3)

### Tuần 2 (15-17h work) — Block ecosystem
- Sprint 3 (S3.1 → S3.6)
- Sprint 4 (S4.1 → S4.5)
- Sprint 10 partial (S10.4 smoke test CT1-4)

### Tuần 3 (10-13h work) — Polish & CT5
- Sprint 6 (S6.1 → S6.8) — CT5
- Sprint 8 (S8.1 → S8.5) — UX polish

### Tuần 4 (8-10h work) — Final
- Sprint 7 (S7.1 → S7.5) — AI Assist
- Sprint 9 (S9.1 → S9.3) — Workflow
- Sprint 10 (S10.1 → S10.6) — Integration & final

---

**Hết kế hoạch implementation.**
