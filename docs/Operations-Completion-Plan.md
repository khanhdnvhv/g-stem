# KẾ HOẠCH IMPLEMENT — NHÓM MODULE "VẬN HÀNH" (NCC)

> **Phiên bản:** 1.0
> **Ngày lập:** 2026-05-20
> **Phạm vi:** V1 — 6 component: Đơn hàng, Hợp đồng (list + detail), Bảo hành, License, Bộ cài Phần mềm
> **Tham chiếu:** [Operations-Business-Analysis.md](./Operations-Business-Analysis.md)
> **Mục tiêu:** Đưa nhóm Vận hành từ ~42% (UI mockup rời rạc) lên ~90% — thông xương sống nghiệp vụ Đơn→HĐ→License→Bộ cài.

---

## Mục lục

1. [Mục tiêu & Tiêu chí thành công](#1-mục-tiêu--tiêu-chí-thành-công)
2. [Phạm vi (In / Out scope)](#2-phạm-vi-in--out-scope)
3. [Quyết định kiến trúc — Operations Store](#3-quyết-định-kiến-trúc--operations-store)
4. [Tổng quan 7 Sprint](#4-tổng-quan-7-sprint)
5. [Sprint 0 — Foundation: Data backbone + Store](#sprint-0--foundation-data-backbone--store-3-4h)
6. [Sprint 1 — Đơn hàng](#sprint-1--đơn-hàng-4-5h)
7. [Sprint 2 — Hợp đồng](#sprint-2--hợp-đồng-4-5h)
8. [Sprint 3 — License](#sprint-3--license-3-4h)
9. [Sprint 4 — Bộ cài Phần mềm](#sprint-4--bộ-cài-phần-mềm-3-4h)
10. [Sprint 5 — Bảo hành](#sprint-5--bảo-hành-3-4h)
11. [Sprint 6 — Integration & QA](#sprint-6--integration--qa-2-3h)
12. [Risk Register](#12-risk-register)
13. [Definition of Done](#13-definition-of-done)
14. [Quick reference — toàn bộ task](#14-quick-reference--toàn-bộ-task)

---

## 1. Mục tiêu & Tiêu chí thành công

### 1.1. Mục tiêu

Hoàn thiện 6 component nhóm Vận hành để **xương sống thương mại thông suốt**: một đơn hàng đi trọn vòng đời từ tạo → duyệt → hợp đồng → triển khai → cấp license → cài đặt → bảo hành.

### 1.2. Tiêu chí thành công (đo lường được)

| # | Tiêu chí | Cách kiểm |
|---|---|---|
| 1 | Vòng đời Đơn hàng đổi status thực | Tạo → duyệt → delivering → delivered, status thay đổi qua UI |
| 2 | Duyệt đơn **tự sinh Hợp đồng** | Duyệt đơn → sang module Hợp đồng thấy HĐ mới `draft` |
| 3 | Cấp License từ hợp đồng hoạt động | Đơn delivered → bấm "Cấp license" → License mới xuất hiện, gắn `contractId` |
| 4 | Tạo Campaign bộ cài bind license + thiết bị | Campaign mới có `licenseId` + danh sách `equipmentId` |
| 5 | Bảo hành đủ 7 nhánh trạng thái | Ticket đi được new→accepted→in_progress/awaiting_part→resolved→closed, có rejected |
| 6 | 5 form tạo có validation | Tạo đơn / HĐ / ticket / license / campaign — đều validate |
| 7 | Cross-module navigation | Đơn→HĐ, HĐ→License click-through được |
| 8 | Build sạch | `npm run build` xanh, 0 TS error |

### 1.3. Tổng effort ước tính

**~22-28 giờ** — 7 sprint.

---

## 2. Phạm vi (In / Out scope)

### 2.1. In Scope (V1)

- Vòng đời thực cho Order, Contract, License, Campaign (state mutable qua store)
- Liên hoàn: Duyệt đơn → sinh HĐ → cấp License → tạo Campaign
- 5 form tạo: đơn thủ công, hợp đồng, ticket bảo hành, cấp license, campaign
- Bảo hành đủ 7 nhánh + dropdown KTV + nhánh hết hạn → có phí
- FK bổ sung: `License.contractId/orderId`, `InstallCampaign` đưa vào mock-data
- Cross-module navigation
- ConfirmDialog cho thao tác huỷ/xóa

### 2.2. Out Scope (V2 — theo BA §11)

- Module Chợ / Marketplace
- Vai trò Đại lý trong đơn hàng — V1 chỉ trực tiếp NCC↔Trường
- Đối soát hoa hồng (không có đại lý → không cần)
- Sinh Equipment records khi giao hàng (dùng equipment mock có sẵn)
- Backend API thật, persistence qua localStorage (reload mất — chấp nhận prototype)
- Hợp đồng N:1 (V1 chốt 1:1)
- Ký số / chữ ký điện tử hợp đồng

---

## 3. Quyết định kiến trúc — Operations Store

### 3.1. Vấn đề

Nghiệp vụ liên hoàn (duyệt đơn → sinh HĐ) đòi hỏi **state chia sẻ giữa các route component**. Hiện mỗi component đọc `mock-data` tĩnh, state cục bộ — contract tạo ở module Đơn hàng sẽ không thấy được ở module Hợp đồng.

### 3.2. Giải pháp — `OperationsProvider` (React Context)

Tạo 1 store nhẹ giữ 4 mảng thực thể + các action nghiệp vụ:

```typescript
// lib/OperationsContext.tsx
interface OperationsStore {
  orders: Order[];
  contracts: Contract[];
  licenses: License[];
  campaigns: InstallCampaign[];

  // Order actions
  createOrder(draft): Order;
  approveOrder(orderId): void;           // → status approved + SINH contract draft
  rejectOrder(orderId, reason): void;    // → status cancelled
  advanceOrderDelivery(orderId): void;   // delivering → delivered

  // Contract actions
  signContract(contractId): void;        // draft → signed → active
  terminateContract(contractId, reason): void;
  completeMilestone(contractId, idx): void;

  // License actions
  issueLicensesForContract(contractId): License[];  // bán tự động
  renewLicense(licenseId): void;
  revokeLicense(licenseId, reason): void;

  // Campaign actions
  createCampaign(draft): InstallCampaign;
  advanceCampaign(campaignId): void;
}
```

- `OperationsProvider` bọc subtree route Supplier (trong `routes.ts` hoặc `Layout`)
- Component dùng hook `useOperations()` thay vì import mock tĩnh
- Khởi tạo state từ `mock-data` (orders, contracts, licenses) + `install-campaigns`
- **Lợi ích:** cascade nghiệp vụ chạy thật; sau này thay Context bằng API chỉ sửa 1 chỗ

### 3.3. Lưu ý
- State chỉ sống trong session (reload mất) — chấp nhận ở prototype, ghi chú V2 cần backend
- Warranty tickets có thể giữ trong store hoặc local — đề xuất đưa vào store luôn cho nhất quán

---

## 4. Tổng quan 7 Sprint

| Sprint | Tên | Effort | Output |
|---|---|---|---|
| **S0** | Foundation — Data backbone + Store | 3-4h | Types mở rộng, install-campaigns.ts, OperationsContext |
| **S1** | Đơn hàng | 4-5h | Vòng đời đơn + duyệt cascade HĐ + form tạo đơn |
| **S2** | Hợp đồng | 4-5h | List + Detail, ký/kích hoạt, milestone, khối License |
| **S3** | License | 3-4h | Cấp bán tự động, gia hạn/thu hồi, fix bug |
| **S4** | Bộ cài Phần mềm | 3-4h | Campaign data thật, form tạo bind license + thiết bị |
| **S5** | Bảo hành | 3-4h | 7 nhánh, dropdown KTV, nhánh hết hạn, form tạo ticket |
| **S6** | Integration & QA | 2-3h | Cross-nav, ConfirmDialog, smoke test, build |
| **TOTAL** | | **22-28h** | |

### Critical path

```
S0 (store) ──▶ S1 (đơn) ──▶ S2 (hợp đồng) ──▶ S3 (license) ──▶ S4 (bộ cài)
                                                                      │
              S5 (bảo hành — độc lập, chạy song song bất kỳ lúc nào) ─┤
                                                                      ▼
                                                              S6 (integration)
```

S0→S1→S2→S3→S4 tuần tự (cascade phụ thuộc nhau). S5 độc lập. S6 cuối.

---

# Sprint 0 — Foundation: Data backbone + Store (3-4h)

## S0 — Mục tiêu
Dựng xương sống dữ liệu + store để các sprint sau có cascade thực.

## S0 — Tasks

### S0.1 — Mở rộng `types.ts` (1h)

**File:** `mock-data/types.ts`

**Việc làm:**
- `License`: thêm `contractId?: string`, `orderId?: string`, `status: "active" | "expiring" | "expired" | "revoked"`
- Thêm interface `InstallCampaign`:
  ```typescript
  interface InstallCampaign {
    id: string;
    name: string;
    softwareName: string;
    version: string;
    contractId?: string;
    licenseId?: string;
    targetEquipmentIds: string[];
    targetCount: number;
    completedCount: number;
    failedCount: number;
    status: "draft" | "running" | "completed" | "failed" | "paused";
    createdAt: string;
  }
  ```
- `Contract`: bổ sung milestone "Khảo sát hiện trạng" sẽ thêm ở mock data

**Acceptance:** Types compile, `License` + `InstallCampaign` đầy đủ field FK.

---

### S0.2 — Tạo `mock-data/install-campaigns.ts` (0.5h)

**File:** `mock-data/install-campaigns.ts` (new)

**Việc làm:** `INSTALL_CAMPAIGNS: InstallCampaign[]` — 6-8 campaign mock, gắn `contractId`/`licenseId` thực từ contracts/licenses có sẵn.

**Acceptance:** Export được, gắn FK hợp lệ.

---

### S0.3 — Cập nhật mock licenses + contracts (0.5h)

**File:** `mock-data/licenses.ts`, `mock-data/orders-contracts.ts`

**Việc làm:**
- Gán `contractId` + `status` cho các `License` hiện có
- Thêm milestone "Khảo sát hiện trạng" vào đầu danh sách milestone các contract
- Export `install-campaigns` trong `index.ts`

**Acceptance:** License có FK, contract có milestone khảo sát.

---

### S0.4 — Tạo `lib/OperationsContext.tsx` (1.5h)

**File:** `lib/OperationsContext.tsx` (new)

**Việc làm:** Theo spec §3.2 — Provider + hook `useOperations()` + đầy đủ action. Mỗi action mutate state đúng, action cascade (`approveOrder` sinh contract) gọi nội bộ.

**Acceptance:**
- [ ] `useOperations()` trả về 4 mảng + actions
- [ ] `approveOrder` đổi status + push contract mới
- [ ] `issueLicensesForContract` sinh license theo `includedSoftware` của gói

---

### S0.5 — Wire Provider vào routing (0.5h)

**File:** `routes.ts` hoặc `Layout.tsx`

**Việc làm:** Bọc `<OperationsProvider>` quanh subtree route Supplier.

**Acceptance:** Provider active, component con gọi `useOperations()` không lỗi.

## S0 — Deliverables
Types mở rộng, `install-campaigns.ts`, `OperationsContext.tsx`, provider wired. Build sạch.

---

# Sprint 1 — Đơn hàng (4-5h)

## S1 — Mục tiêu
Vòng đời đơn hàng thực + duyệt đơn cascade sinh hợp đồng + form tạo đơn thủ công.

## S1 — Tasks

### S1.1 — STEMOrderManagement đọc từ store (0.5h)
- Thay import `orders` tĩnh bằng `useOperations().orders`
- KPI/bảng/filter reactive theo store

**Acceptance:** Danh sách đơn từ store, filter hoạt động.

### S1.2 — Duyệt / Từ chối đơn — cascade (1.5h)
- Dialog chi tiết: nút "Duyệt đơn" → `approveOrder()` → status `approved` + **toast "Đã sinh hợp đồng nháp HĐ-xxx"**
- "Từ chối" → mở `ConfirmActionDialog` nhập lý do → `rejectOrder()` → `cancelled`
- Badge status cập nhật ngay

**Acceptance:**
- [ ] Duyệt đơn → status đổi + contract draft xuất hiện ở store
- [ ] Từ chối có dialog lý do bắt buộc

### S1.3 — Luồng giao hàng (1h)
- Đơn `approved` → nút "Bắt đầu giao" → `delivering`
- Đơn `delivering` → nút "Xác nhận đã giao" → `delivered` + toast gợi ý "Vào Hợp đồng để cấp license"

**Acceptance:** Đơn đi được approved → delivering → delivered.

### S1.4 — Form tạo đơn thủ công (1.5h)
- Modal: chọn Trường (từ `tenantsByType.school`) + chọn Gói (multi, mỗi gói có qty) → tự tính `totalVND`
- Validation: ≥1 trường, ≥1 gói, qty > 0
- Submit → `createOrder()` → đơn `pending` xuất hiện

**Acceptance:** Tạo đơn thật, validate đầy đủ.

### S1.5 — Hiển thị liên kết HĐ (0.5h)
- Card/dialog đơn `approved+` hiện `contractId` — click → navigate `/supplier/contracts/:id`

**Acceptance:** Click contractId → sang chi tiết hợp đồng.

## S1 — Deliverables
`STEMOrderManagement` đầy đủ vòng đời + form tạo; build sạch.

---

# Sprint 2 — Hợp đồng (4-5h)

## S2 — Mục tiêu
Vòng đời hợp đồng + milestone + liên kết license.

## S2 — Tasks

### S2.1 — SupplierContractList đọc store (0.5h)
- `useOperations().contracts`, filter/KPI reactive

### S2.2 — Tạo hợp đồng (1h)
- Hợp đồng chủ yếu sinh tự động từ duyệt đơn (S1.2)
- Nút "Tạo hợp đồng" thủ công → wizard ngắn: chọn đơn `approved` chưa có HĐ → sinh HĐ
- Hoặc thông báo "HĐ được sinh tự động khi duyệt đơn"

**Acceptance:** Không còn nút toast giả; tạo HĐ có đường đi thực.

### S2.3 — SupplierContractDetail đọc store + vòng đời (1.5h)
- Đọc contract từ store theo `:id`
- Nút "Ký hợp đồng" (`draft`→`signed`), "Kích hoạt" (`signed`→`active`)
- "Chấm dứt HĐ" → ConfirmActionDialog nhập lý do → `terminated`

**Acceptance:** Contract đi được draft→signed→active→(terminated).

### S2.4 — Milestone — đánh dấu hoàn thành (1h)
- Mỗi milestone có nút "Đánh dấu hoàn thành" → `completeMilestone()`
- Milestone "Khảo sát hiện trạng" hiển thị đầu danh sách
- Progress bar cập nhật

**Acceptance:** Tick milestone → progress đổi thực.

### S2.5 — Khối "License đã cấp theo HĐ" (1h)
- Trong detail, thêm section list `licenses.filter(contractId === id)`
- Nút "Cấp license cho hợp đồng này" (nếu contract `active`) → gọi S3.2

**Acceptance:** Detail hiển thị license của HĐ, có nút cấp.

## S2 — Deliverables
Contract list + detail đầy đủ vòng đời + milestone + license section.

---

# Sprint 3 — License (3-4h)

## S3 — Mục tiêu
Cấp license bán tự động + vòng đời license.

## S3 — Tasks

### S3.1 — LicenseDistribution đọc store (0.5h)
- `useOperations().licenses`, KPI/filter reactive

### S3.2 — Cấp license bán tự động (1.5h)
- `issueLicensesForContract(contractId)` — đọc `includedSoftware` của gói trong đơn → sinh License records (1 license/phần mềm, `seats` theo spec, `type` per_user, `expiresAt` +1 năm)
- Gọi được từ: nút "Phát license" (chọn contract `active`) HOẶC từ Contract Detail (S2.5)

**Acceptance:**
- [ ] Cấp license sinh đúng số license theo gói
- [ ] License gắn `contractId` + `orderId`

### S3.3 — Gia hạn / Thu hồi (1h)
- "Gia hạn" → `renewLicense()` đẩy `expiresAt` +1 năm, `status` về `active`
- "Thu hồi" → ConfirmDialog → `revokeLicense()` set `revokedAt` + `status` revoked

**Acceptance:** Gia hạn/thu hồi đổi data thực.

### S3.4 — Fix bug + liên kết (0.5h)
- Cột "Loại" đọc `lic.type` thực (không hard-code "Per user")
- License row → link tới contract (`contractId`)

**Acceptance:** Cột Loại đúng, click → contract.

## S3 — Deliverables
License đầy đủ vòng đời, cấp bán tự động, fix bug.

---

# Sprint 4 — Bộ cài Phần mềm (3-4h)

## S4 — Mục tiêu
Campaign data thật + bind license + thiết bị.

## S4 — Tasks

### S4.1 — SoftwareInstaller đọc store (0.5h)
- `useOperations().campaigns` thay `generateCampaigns()` tự sinh
- KPI reactive

### S4.2 — Form tạo Campaign (1.5h)
- Modal: tên, phần mềm + version, chọn `License` (từ licenses `active`), chọn thiết bị mục tiêu (multi từ `equipment` theo trường của license)
- Validation: tên ≥3, có license, ≥1 thiết bị
- Submit → `createCampaign()` → campaign `draft`

**Acceptance:** Tạo campaign bind license + equipment thật.

### S4.3 — Vòng đời Campaign (1h)
- `draft` → "Bắt đầu triển khai" → `running`
- `running` → "Dừng" → `paused`; mock tiến độ `completedCount` tăng
- Hoàn tất 100% → `completed`; có thiết bị fail → nút "Thử lại thiết bị lỗi"

**Acceptance:** Campaign đi được draft→running→completed.

### S4.4 — Hiển thị liên kết (0.5h)
- Campaign card hiện license + số thiết bị mục tiêu thực
- Link license → contract

**Acceptance:** Campaign hiển thị đủ liên kết.

## S4 — Deliverables
SoftwareInstaller dùng data thật, campaign bind license/equipment.

---

# Sprint 5 — Bảo hành (3-4h)

## S5 — Mục tiêu
Hoàn thiện đủ 7 nhánh trạng thái + form tạo ticket.

## S5 — Tasks

### S5.1 — Đủ 7 nhánh trạng thái (1.5h)
- Thêm hành động: `accepted`→`awaiting_part` (chờ linh kiện), `awaiting_part`→`in_progress`
- `new`→`rejected` (từ chối, có lý do)
- `resolved`→`closed` (nghiệm thu đóng ticket)
- BR-OP-08: ticket `awaiting_part` đánh dấu "tạm dừng SLA"

**Acceptance:** Ticket đi được đủ 7 trạng thái.

### S5.2 — Dropdown chọn KTV (0.5h)
- "Cử KTV xử lý" → dropdown chọn kỹ thuật viên → set `assignedTo` thực

**Acceptance:** Cử KTV gán `assignedTo`.

### S5.3 — Nhánh hết hạn bảo hành (0.5h)
- Khi tạo/tiếp nhận ticket: nếu thiết bị `warrantyEndsAt` < hôm nay → badge "Hết hạn BH" + luồng "Báo giá sửa có phí" (nhập phí ước tính)

**Acceptance:** Thiết bị hết hạn → nhánh có phí.

### S5.4 — Form tạo ticket thủ công (1h)
- Modal: chọn thiết bị (`equipment`), trường, mô tả lỗi, mức độ
- Validation: có thiết bị, mô tả ≥10 ký tự
- Submit → ticket `new`

**Acceptance:** Tạo ticket thật, validate.

### S5.5 — Nhập note khi chuyển trạng thái (0.5h)
- Mỗi lần `advance` → cho nhập ghi chú (tùy chọn) → push vào `history` với note thực

**Acceptance:** History ghi note thực thay vì "Chuyển trạng thái" cứng.

## S5 — Deliverables
WarrantyFulfillment đủ 7 nhánh + form + KTV + note.

---

# Sprint 6 — Integration & QA (2-3h)

## S6 — Tasks

### S6.1 — Cross-module navigation (0.5h)
- Đơn → HĐ, HĐ → License, License → HĐ, Campaign → License — đều click-through

### S6.2 — ConfirmDialog cho thao tác huỷ (0.5h)
- Huỷ đơn, chấm dứt HĐ, thu hồi license, từ chối ticket — dùng `ConfirmDialog`/`ConfirmActionDialog` đã có

### S6.3 — Smoke test luồng đầy đủ (1h)
- Test end-to-end: Tạo đơn → duyệt (sinh HĐ) → ký HĐ → kích hoạt → giao hàng delivered → cấp license → tạo campaign → chạy campaign. + Tạo ticket bảo hành → xử lý đóng.

### S6.4 — Build + cleanup (0.5h)
- `npm run build` xanh, dọn import thừa, dọn `toast` placeholder còn sót

## S6 — Deliverables
Luồng thông suốt, build sạch, smoke test pass.

---

## 12. Risk Register

| ID | Risk | Mức độ | Sprint | Mitigation |
|---|---|---|---|---|
| R1 | Store reload mất data | Trung bình | S0 | Chấp nhận prototype; ghi chú V2 cần backend |
| R2 | Cascade approveOrder→contract phức tạp | Cao | S0/S1 | Action gói gọn trong store, test riêng |
| R3 | Nhiều component đổi từ mock tĩnh → store, dễ sót | Trung bình | S1-S5 | Mỗi sprint build check; đổi từng component |
| R4 | `OperationsProvider` wrap sai subtree → component ngoài không có context | Trung bình | S0.5 | Wrap rộng (toàn Layout supplier); test sớm |
| R5 | issueLicensesForContract — gói thiếu `includedSoftware` | Thấp | S3 | Fallback: gói không software → toast "gói không có phần mềm" |
| R6 | Sprint 4 InstallCampaign type mới — đồng bộ component | Trung bình | S0/S4 | Định nghĩa type chuẩn ngay S0.1 |

---

## 13. Definition of Done

- [ ] **Vòng đời** Order / Contract / License / Campaign đổi status thực qua store
- [ ] **Cascade** Duyệt đơn → sinh HĐ → cấp License → tạo Campaign hoạt động end-to-end
- [ ] **5 form** tạo (đơn, HĐ, ticket, license, campaign) có validation
- [ ] **Bảo hành** đủ 7 nhánh + KTV + nhánh hết hạn + note
- [ ] **FK** License.contractId/orderId, InstallCampaign trong mock-data
- [ ] **Cross-nav** giữa 5 module hoạt động
- [ ] **ConfirmDialog** cho mọi thao tác huỷ/thu hồi/xóa
- [ ] **Build** sạch, 0 TS error
- [ ] Demo được: 1 đơn đi trọn vòng đời + 1 ticket bảo hành xử lý xong

---

## 14. Quick reference — toàn bộ task

| ID | Task | Sprint | Effort |
|---|---|---|---|
| S0.1 | Mở rộng types.ts (License FK, InstallCampaign) | 0 | 1h |
| S0.2 | mock-data/install-campaigns.ts | 0 | 0.5h |
| S0.3 | Update licenses + contracts mock | 0 | 0.5h |
| S0.4 | lib/OperationsContext.tsx | 0 | 1.5h |
| S0.5 | Wire Provider vào routing | 0 | 0.5h |
| S1.1 | OrderManagement đọc store | 1 | 0.5h |
| S1.2 | Duyệt/Từ chối đơn — cascade HĐ | 1 | 1.5h |
| S1.3 | Luồng giao hàng delivering→delivered | 1 | 1h |
| S1.4 | Form tạo đơn thủ công | 1 | 1.5h |
| S1.5 | Hiển thị liên kết HĐ | 1 | 0.5h |
| S2.1 | ContractList đọc store | 2 | 0.5h |
| S2.2 | Tạo hợp đồng | 2 | 1h |
| S2.3 | ContractDetail vòng đời | 2 | 1.5h |
| S2.4 | Milestone đánh dấu hoàn thành | 2 | 1h |
| S2.5 | Khối License đã cấp theo HĐ | 2 | 1h |
| S3.1 | LicenseDistribution đọc store | 3 | 0.5h |
| S3.2 | Cấp license bán tự động | 3 | 1.5h |
| S3.3 | Gia hạn / Thu hồi | 3 | 1h |
| S3.4 | Fix bug cột Loại + liên kết | 3 | 0.5h |
| S4.1 | SoftwareInstaller đọc store | 4 | 0.5h |
| S4.2 | Form tạo Campaign | 4 | 1.5h |
| S4.3 | Vòng đời Campaign | 4 | 1h |
| S4.4 | Hiển thị liên kết campaign | 4 | 0.5h |
| S5.1 | Bảo hành đủ 7 nhánh | 5 | 1.5h |
| S5.2 | Dropdown chọn KTV | 5 | 0.5h |
| S5.3 | Nhánh hết hạn bảo hành | 5 | 0.5h |
| S5.4 | Form tạo ticket | 5 | 1h |
| S5.5 | Note khi chuyển trạng thái | 5 | 0.5h |
| S6.1 | Cross-module navigation | 6 | 0.5h |
| S6.2 | ConfirmDialog thao tác huỷ | 6 | 0.5h |
| S6.3 | Smoke test luồng đầy đủ | 6 | 1h |
| S6.4 | Build + cleanup | 6 | 0.5h |

**Tổng: 32 task.**

---

## 15. Thứ tự thực thi đề xuất

1. **S0** (foundation — bắt buộc trước) → build check
2. **S1 → S2 → S3 → S4** (cascade tuần tự) → mỗi sprint build check
3. **S5** (bảo hành — có thể chen vào bất kỳ lúc nào sau S0)
4. **S6** (integration — cuối cùng)

---

**Hết kế hoạch.**
