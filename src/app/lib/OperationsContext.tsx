/* ================================================================ */
/*  OPERATIONS CONTEXT — Store trung tâm nhóm Vận hành NCC           */
/*  Giữ orders/contracts/licenses/campaigns/tickets + action nghiệp  */
/*  vụ liên hoàn. Nguồn: docs/Operations-Completion-Plan.md §3       */
/* ================================================================ */

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  orders as seedOrders,
  contracts as seedContracts,
  licenses as seedLicenses,
  installCampaigns as seedCampaigns,
  warrantyTickets as seedTickets,
  stemPackages,
} from "../components/mock-data/index";
import type {
  Order, Contract, License, InstallCampaign, WarrantyTicket,
  OrderItem, ContractMilestone, WarrantyStatus, CampaignStatus,
} from "../components/mock-data/index";

/* ── Bộ milestone chuẩn cho hợp đồng STEM ── */
function buildStandardMilestones(signedAtMs: number): ContractMilestone[] {
  const d = (days: number) => new Date(signedAtMs + days * 86400_000).toISOString();
  return [
    { title: "Khảo sát hiện trạng",          dueAt: d(3),  done: false },
    { title: "Thanh toán đợt 1 (30%)",       dueAt: d(7),  done: false },
    { title: "Giao thiết bị",                dueAt: d(21), done: false },
    { title: "Lắp đặt & cấu hình",           dueAt: d(25), done: false },
    { title: "Cài phần mềm + cấp license",   dueAt: d(28), done: false },
    { title: "Tập huấn giáo viên",           dueAt: d(35), done: false },
    { title: "Nghiệm thu & thanh toán cuối", dueAt: d(45), done: false },
  ];
}

/* ── Input types ── */
export interface CreateOrderInput {
  fromTenantId: string;   // trường
  toTenantId: string;     // NCC
  items: OrderItem[];
  totalVND: number;
  note?: string;
}
export interface CreateCampaignInput {
  name: string;
  softwareName: string;
  version: string;
  contractId?: string;
  licenseId?: string;
  targetEquipmentIds: string[];
}
export interface CreateTicketInput {
  equipmentId: string;
  schoolId: string;
  issue: string;
  severity?: string;
}
export interface AdvanceTicketInput {
  note?: string;
  assignedTo?: string;
  resolutionNote?: string;
}

/* ── Store shape ── */
interface OperationsStore {
  orders: Order[];
  contracts: Contract[];
  licenses: License[];
  campaigns: InstallCampaign[];
  tickets: WarrantyTicket[];

  /* Order */
  createOrder(input: CreateOrderInput): Order;
  approveOrder(orderId: string): Contract | null;
  rejectOrder(orderId: string, reason: string): void;
  advanceOrderDelivery(orderId: string): void;

  /* Contract */
  signContract(contractId: string): void;
  activateContract(contractId: string): void;
  terminateContract(contractId: string, reason: string): void;
  completeMilestone(contractId: string, milestoneIdx: number): void;

  /* License */
  issueLicensesForContract(contractId: string): License[];
  renewLicense(licenseId: string): void;
  revokeLicense(licenseId: string, reason: string): void;

  /* Campaign */
  createCampaign(input: CreateCampaignInput): InstallCampaign;
  advanceCampaign(campaignId: string): void;
  pauseCampaign(campaignId: string): void;

  /* Warranty */
  createTicket(input: CreateTicketInput): WarrantyTicket;
  advanceTicket(ticketId: string, next: WarrantyStatus, opts?: AdvanceTicketInput): void;
}

const OperationsCtx = createContext<OperationsStore | null>(null);

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders]       = useState<Order[]>(() => [...seedOrders]);
  const [contracts, setContracts] = useState<Contract[]>(() => [...seedContracts]);
  const [licenses, setLicenses]   = useState<License[]>(() => [...seedLicenses]);
  const [campaigns, setCampaigns] = useState<InstallCampaign[]>(() => [...seedCampaigns]);
  const [tickets, setTickets]     = useState<WarrantyTicket[]>(() => [...seedTickets]);

  /* ── ORDER ── */
  const createOrder: OperationsStore["createOrder"] = (input) => {
    const seq = orders.length + 1;
    const order: Order = {
      id: `ORD-NEW-${Date.now()}`,
      orderNo: `ORD-2026-${String(seq).padStart(4, "0")}`,
      fromTenantId: input.fromTenantId,
      toTenantId: input.toTenantId,
      items: input.items,
      totalVND: input.totalVND,
      status: "pending",
      createdAt: new Date().toISOString(),
      createdBy: "U-SUP-SALES",
      note: input.note,
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const approveOrder: OperationsStore["approveOrder"] = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status !== "pending") return null;
    /* Sinh hợp đồng draft từ đơn (BR-OP-02) */
    const nowMs = Date.now();
    const seq = contracts.length + 1;
    const contract: Contract = {
      id: `CTR-NEW-${Date.now()}`,
      contractNo: `CTR-2026-${String(seq).padStart(4, "0")}`,
      supplierId: order.toTenantId,
      schoolId: order.fromTenantId,
      signedAt: "",
      totalVND: order.totalVND,
      status: "draft",
      milestones: buildStandardMilestones(nowMs),
      attachments: [],
    };
    setContracts((prev) => [contract, ...prev]);
    setOrders((prev) => prev.map((o) =>
      o.id === orderId ? { ...o, status: "approved", contractId: contract.id } : o,
    ));
    return contract;
  };

  const rejectOrder: OperationsStore["rejectOrder"] = (orderId, reason) => {
    setOrders((prev) => prev.map((o) =>
      o.id === orderId ? { ...o, status: "cancelled", note: `[Từ chối] ${reason}` } : o,
    ));
  };

  const advanceOrderDelivery: OperationsStore["advanceOrderDelivery"] = (orderId) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      if (o.status === "approved")   return { ...o, status: "delivering" };
      if (o.status === "delivering") return { ...o, status: "delivered", deliveredAt: new Date().toISOString() };
      return o;
    }));
  };

  /* ── CONTRACT ── */
  const signContract: OperationsStore["signContract"] = (contractId) => {
    setContracts((prev) => prev.map((c) =>
      c.id === contractId && c.status === "draft"
        ? { ...c, status: "signed", signedAt: new Date().toISOString() }
        : c,
    ));
  };

  const activateContract: OperationsStore["activateContract"] = (contractId) => {
    setContracts((prev) => prev.map((c) =>
      c.id === contractId && c.status === "signed" ? { ...c, status: "active" } : c,
    ));
  };

  const terminateContract: OperationsStore["terminateContract"] = (contractId, reason) => {
    setContracts((prev) => prev.map((c) =>
      c.id === contractId ? { ...c, status: "terminated", terminationReason: reason } : c,
    ));
  };

  const completeMilestone: OperationsStore["completeMilestone"] = (contractId, idx) => {
    setContracts((prev) => prev.map((c) => {
      if (c.id !== contractId) return c;
      const milestones = c.milestones.map((m, i) => i === idx ? { ...m, done: true } : m);
      return { ...c, milestones };
    }));
  };

  /* ── LICENSE ── */
  const issueLicensesForContract: OperationsStore["issueLicensesForContract"] = (contractId) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return [];
    /* Tìm đơn liên kết → gói → includedSoftware */
    const order = orders.find((o) => o.contractId === contractId);
    const pkgIds = order ? order.items.map((it) => it.packageId) : [];
    const softwareSpecs = pkgIds.flatMap((pid) =>
      stemPackages.find((p) => p.id === pid)?.includedSoftware ?? [],
    );
    if (softwareSpecs.length === 0) return [];

    const nowMs = Date.now();
    const expiresAt = new Date(nowMs + 365 * 86400_000).toISOString();
    const newLicenses: License[] = softwareSpecs.map((spec, i) => ({
      id: `LIC-NEW-${Date.now()}-${i}`,
      licenseKey: `GLX-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      type: "per_user",
      productName: spec.name,
      seats: spec.seats,
      seatsUsed: 0,
      tenantId: contract.schoolId,
      issuedAt: new Date(nowMs).toISOString(),
      expiresAt,
      contractId,
      orderId: order?.id,
      status: "active",
    }));
    setLicenses((prev) => [...newLicenses, ...prev]);
    return newLicenses;
  };

  const renewLicense: OperationsStore["renewLicense"] = (licenseId) => {
    setLicenses((prev) => prev.map((l) =>
      l.id === licenseId
        ? {
            ...l,
            expiresAt: new Date(Date.now() + 365 * 86400_000).toISOString(),
            revokedAt: undefined,
            status: "active",
          }
        : l,
    ));
  };

  const revokeLicense: OperationsStore["revokeLicense"] = (licenseId) => {
    setLicenses((prev) => prev.map((l) =>
      l.id === licenseId
        ? { ...l, revokedAt: new Date().toISOString(), status: "revoked" }
        : l,
    ));
  };

  /* ── CAMPAIGN ── */
  const createCampaign: OperationsStore["createCampaign"] = (input) => {
    const seq = campaigns.length + 1;
    const campaign: InstallCampaign = {
      id: `CMP-NEW-${Date.now()}`,
      name: input.name,
      softwareName: input.softwareName,
      version: input.version,
      contractId: input.contractId,
      licenseId: input.licenseId,
      targetEquipmentIds: input.targetEquipmentIds,
      targetCount: input.targetEquipmentIds.length,
      completedCount: 0,
      failedCount: 0,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    void seq;
    setCampaigns((prev) => [campaign, ...prev]);
    return campaign;
  };

  const advanceCampaign: OperationsStore["advanceCampaign"] = (campaignId) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaignId) return c;
      if (c.status === "draft")  return { ...c, status: "running" as CampaignStatus };
      if (c.status === "paused") return { ...c, status: "running" as CampaignStatus };
      if (c.status === "running") {
        /* Mô phỏng tiến độ — tăng completedCount */
        const next = Math.min(c.targetCount, c.completedCount + Math.ceil(c.targetCount / 3));
        const done = next >= c.targetCount;
        return {
          ...c,
          completedCount: next,
          status: done ? ("completed" as CampaignStatus) : c.status,
        };
      }
      return c;
    }));
  };

  const pauseCampaign: OperationsStore["pauseCampaign"] = (campaignId) => {
    setCampaigns((prev) => prev.map((c) =>
      c.id === campaignId && c.status === "running"
        ? { ...c, status: "paused" as CampaignStatus }
        : c,
    ));
  };

  /* ── WARRANTY ── */
  const createTicket: OperationsStore["createTicket"] = (input) => {
    const seq = tickets.length + 1;
    const ticket: WarrantyTicket = {
      id: `WT-NEW-${Date.now()}`,
      ticketNo: `WT-2026-${String(seq).padStart(4, "0")}`,
      equipmentId: input.equipmentId,
      schoolId: input.schoolId,
      reportedBy: "U-SUP-WR",
      reportedAt: new Date().toISOString(),
      issue: input.issue,
      photos: [],
      status: "new",
      slaDueAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
      history: [
        { at: new Date().toISOString(), by: "U-SUP-WR", status: "new", note: "Tạo ticket thủ công" },
      ],
    };
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  };

  const advanceTicket: OperationsStore["advanceTicket"] = (ticketId, next, opts) => {
    setTickets((prev) => prev.map((t) => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        status: next,
        assignedTo: opts?.assignedTo ?? t.assignedTo,
        resolutionNote: opts?.resolutionNote ?? t.resolutionNote,
        history: [
          ...t.history,
          { at: new Date().toISOString(), by: "U-SUP-WR", status: next, note: opts?.note || undefined },
        ],
      };
    }));
  };

  const store: OperationsStore = {
    orders, contracts, licenses, campaigns, tickets,
    createOrder, approveOrder, rejectOrder, advanceOrderDelivery,
    signContract, activateContract, terminateContract, completeMilestone,
    issueLicensesForContract, renewLicense, revokeLicense,
    createCampaign, advanceCampaign, pauseCampaign,
    createTicket, advanceTicket,
  };

  return <OperationsCtx.Provider value={store}>{children}</OperationsCtx.Provider>;
}

export function useOperations(): OperationsStore {
  const ctx = useContext(OperationsCtx);
  if (!ctx) throw new Error("useOperations must be used within <OperationsProvider>");
  return ctx;
}
