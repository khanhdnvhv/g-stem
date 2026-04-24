import { useState, useCallback } from "react";
import {
  GitBranch, Plus, Save, Play, Pause, Trash2, Copy, Eye,
  Settings, Search, ChevronRight, Check, X, AlertTriangle,
  ArrowRight, ArrowDown, Clock, Users, Mail, Shield,
  FileText, Zap, Star, RotateCcw, Undo2, Redo2,
  Workflow, MousePointer, Hand, ZoomIn, ZoomOut,
  SquareStack, GripVertical, Circle, Diamond, Square,
  CheckCircle, XCircle, Timer, UserCheck, Bell,
  Upload, Download, MoreHorizontal, Maximize2,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface WfNode {
  id: string;
  type: "start" | "end" | "action" | "condition" | "approval" | "notification" | "timer" | "parallel";
  label: string;
  description: string;
  x: number;
  y: number;
  config: Record<string, any>;
  status?: "idle" | "active" | "completed" | "failed";
}

interface WfEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

interface WfTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: number;
  edges: number;
  icon: string;
  usage: number;
}

interface WfInstance {
  id: string;
  workflowName: string;
  status: "running" | "completed" | "failed" | "pending";
  startedBy: string;
  startedAt: string;
  completedAt: string;
  currentStep: string;
  progress: number;
}

// ─── Mock Data ───
const MOCK_NODES: WfNode[] = [
  { id: "n1", type: "start", label: "Bắt đầu", description: "Nhân viên gửi yêu cầu", x: 60, y: 200, config: {}, status: "completed" },
  { id: "n2", type: "action", label: "Kiểm tra Form", description: "Validate thông tin yêu cầu", x: 220, y: 200, config: { assignee: "system" }, status: "completed" },
  { id: "n3", type: "condition", label: "Ngân sách > 50M?", description: "Kiểm tra mức ngân sách", x: 400, y: 200, config: { field: "budget", operator: ">", value: 50000000 }, status: "active" },
  { id: "n4", type: "approval", label: "Trưởng Phòng duyệt", description: "Phê duyệt cấp phòng ban", x: 580, y: 120, config: { approver: "department_head", sla: "2 ngày" }, status: "idle" },
  { id: "n5", type: "approval", label: "Ban GĐ duyệt", description: "Phê duyệt cấp Ban Giám đốc", x: 580, y: 280, config: { approver: "director", sla: "3 ngày" }, status: "idle" },
  { id: "n6", type: "parallel", label: "Gửi thông báo", description: "Song song: email + push", x: 760, y: 200, config: {}, status: "idle" },
  { id: "n7", type: "notification", label: "Email xác nhận", description: "Gửi email tới người yêu cầu", x: 940, y: 140, config: { template: "approval_result", channel: "email" }, status: "idle" },
  { id: "n8", type: "timer", label: "Chờ 24h", description: "Delay 24 giờ trước khi thực thi", x: 940, y: 260, config: { delay: "24h" }, status: "idle" },
  { id: "n9", type: "action", label: "Cập nhật Hệ thống", description: "Tạo đơn mua sắm / training", x: 1120, y: 200, config: { action: "create_purchase_order" }, status: "idle" },
  { id: "n10", type: "end", label: "Kết thúc", description: "Quy trình hoàn tất", x: 1280, y: 200, config: {}, status: "idle" },
];

const MOCK_EDGES: WfEdge[] = [
  { id: "e1", from: "n1", to: "n2" },
  { id: "e2", from: "n2", to: "n3" },
  { id: "e3", from: "n3", to: "n4", label: "≤ 50M", condition: "budget <= 50000000" },
  { id: "e4", from: "n3", to: "n5", label: "> 50M", condition: "budget > 50000000" },
  { id: "e5", from: "n4", to: "n6" },
  { id: "e6", from: "n5", to: "n6" },
  { id: "e7", from: "n6", to: "n7" },
  { id: "e8", from: "n6", to: "n8" },
  { id: "e9", from: "n7", to: "n9" },
  { id: "e10", from: "n8", to: "n9" },
  { id: "e11", from: "n9", to: "n10" },
];

const TEMPLATES: WfTemplate[] = [
  { id: "WT01", name: "Phê duyệt Khóa học mới", description: "Quy trình tạo và phê duyệt khóa đào tạo", category: "Đào tạo", nodes: 8, edges: 9, icon: "📚", usage: 45 },
  { id: "WT02", name: "Phê duyệt Ngân sách", description: "Quy trình duyệt ngân sách đào tạo theo cấp", category: "Tài chính", nodes: 10, edges: 11, icon: "💰", usage: 38 },
  { id: "WT03", name: "Onboarding Nhân viên mới", description: "Quy trình đào tạo hội nhập nhân viên mới", category: "HR", nodes: 12, edges: 14, icon: "👋", usage: 62 },
  { id: "WT04", name: "Cấp Chứng chỉ", description: "Quy trình xét duyệt và cấp chứng chỉ", category: "Chứng chỉ", nodes: 7, edges: 8, icon: "🏆", usage: 55 },
  { id: "WT05", name: "Đăng ký Thi", description: "Quy trình đăng ký và xếp lịch thi", category: "Thi cử", nodes: 9, edges: 10, icon: "📝", usage: 42 },
  { id: "WT06", name: "Yêu cầu Đào tạo Ngoài", description: "Quy trình xin đào tạo bên ngoài", category: "Đào tạo", nodes: 11, edges: 13, icon: "🎓", usage: 28 },
  { id: "WT07", name: "Review Nội dung", description: "Quy trình review và phê duyệt content", category: "Content", nodes: 6, edges: 7, icon: "✅", usage: 35 },
  { id: "WT08", name: "Compliance Training", description: "Tự động gán đào tạo bắt buộc khi deadline", category: "Compliance", nodes: 8, edges: 9, icon: "🛡️", usage: 50 },
];

const INSTANCES: WfInstance[] = [
  { id: "WI01", workflowName: "Phê duyệt Ngân sách Q1-2026 ABBank", status: "running", startedBy: "Trần Thị Hương", startedAt: "10/03/2026 09:00", completedAt: "—", currentStep: "Ban GĐ duyệt", progress: 60 },
  { id: "WI02", workflowName: "Onboarding - Batch T3/2026 (15 NV)", status: "running", startedBy: "HR Admin", startedAt: "01/03/2026 08:00", completedAt: "—", currentStep: "Gán khóa Compliance", progress: 45 },
  { id: "WI03", workflowName: "Cấp CC An toàn Lao động - Xi măng TL", status: "completed", startedBy: "Phạm Đức Mạnh", startedAt: "05/03/2026 10:00", completedAt: "08/03/2026 15:30", currentStep: "Hoàn tất", progress: 100 },
  { id: "WI04", workflowName: "Review Content: ESG Module 1", status: "pending", startedBy: "Vũ Thị Mai", startedAt: "11/03/2026 14:00", completedAt: "—", currentStep: "Chờ Reviewer", progress: 20 },
  { id: "WI05", workflowName: "Đăng ký Thi Chứng chỉ IT - Hanel", status: "running", startedBy: "Đỗ Thị Lan", startedAt: "09/03/2026 11:00", completedAt: "—", currentStep: "Xếp Lịch thi", progress: 75 },
  { id: "WI06", workflowName: "Yêu cầu Đào tạo AWS - ABS", status: "failed", startedBy: "Vũ Thị Mai", startedAt: "28/02/2026 09:00", completedAt: "02/03/2026 09:00", currentStep: "Từ chối (vượt ngân sách)", progress: 40 },
];

const NODE_CFG: Record<string, { icon: typeof Circle; color: string; bg: string; label: string }> = {
  start: { icon: Circle, color: "#16a34a", bg: "#16a34a15", label: "Bắt đầu" },
  end: { icon: CheckCircle, color: "#990803", bg: "#99080315", label: "Kết thúc" },
  action: { icon: Zap, color: "#2563eb", bg: "#2563eb15", label: "Hành động" },
  condition: { icon: Diamond, color: "#c8a84e", bg: "#c8a84e15", label: "Điều kiện" },
  approval: { icon: UserCheck, color: "#7c3aed", bg: "#7c3aed15", label: "Phê duyệt" },
  notification: { icon: Bell, color: "#ea580c", bg: "#ea580c15", label: "Thông báo" },
  timer: { icon: Timer, color: "#0d9488", bg: "#0d948815", label: "Hẹn giờ" },
  parallel: { icon: GitBranch, color: "#6b7280", bg: "#6b728015", label: "Song song" },
};

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  idle: { color: "#9ca3af", bg: "#9ca3af10", label: "Chờ" },
  active: { color: "#2563eb", bg: "#2563eb10", label: "Đang chạy" },
  completed: { color: "#16a34a", bg: "#16a34a10", label: "Hoàn thành" },
  failed: { color: "#ef4444", bg: "#ef444410", label: "Thất bại" },
};

const INST_STATUS: Record<string, { color: string; label: string }> = {
  running: { color: "#2563eb", label: "Đang chạy" },
  completed: { color: "#16a34a", label: "Hoàn thành" },
  failed: { color: "#ef4444", label: "Thất bại" },
  pending: { color: "#c8a84e", label: "Chờ xử lý" },
};

export function WorkflowDesigner() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"designer" | "templates" | "instances" | "analytics">("designer");
  const [selectedNode, setSelectedNode] = useState<WfNode | null>(null);
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<"select" | "pan">("select");

  const activeWf = INSTANCES.filter(i => i.status === "running").length;
  const completedWf = INSTANCES.filter(i => i.status === "completed").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Workflow Designer</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Thiết kế quy trình phê duyệt trực quan cho hệ thống đào tạo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất cấu hình workflow...")); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form tạo Workflow mới...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo Workflow
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Templates", value: TEMPLATES.length, icon: SquareStack, color: "#990803" },
          { label: "Đang chạy", value: activeWf, icon: Play, color: "#2563eb" },
          { label: "Hoàn thành", value: completedWf, icon: CheckCircle, color: "#16a34a" },
          { label: "Thất bại", value: INSTANCES.filter(i => i.status === "failed").length, icon: XCircle, color: "#ef4444" },
          { label: "Tổng Instances", value: INSTANCES.length, icon: GitBranch, color: "#c8a84e" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
        {([
          { id: "designer", label: "Thiết kế", icon: GitBranch },
          { id: "templates", label: "Templates", icon: SquareStack },
          { id: "instances", label: "Instances", icon: Play },
          { id: "analytics", label: "Phân tích", icon: Settings },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "designer" && <DesignerTab nodes={MOCK_NODES} edges={MOCK_EDGES} selectedNode={selectedNode} onSelectNode={setSelectedNode} zoom={zoom} setZoom={setZoom} tool={tool} setTool={setTool} />}
      {tab === "templates" && <TemplatesTab />}
      {tab === "instances" && <InstancesTab />}
      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}

// ─── Designer Tab ───
function DesignerTab({ nodes, edges, selectedNode, onSelectNode, zoom, setZoom, tool, setTool }: {
  nodes: WfNode[]; edges: WfEdge[];
  selectedNode: WfNode | null; onSelectNode: (n: WfNode | null) => void;
  zoom: number; setZoom: (z: number) => void;
  tool: string; setTool: (t: "select" | "pan") => void;
}) {
  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2">
          <button onClick={() => setTool("select")} className={`p-1.5 rounded cursor-pointer ${tool === "select" ? "bg-[#990803]/10 text-[#990803]" : "text-gray-400 hover:text-gray-600"}`}><MousePointer className="w-4 h-4" /></button>
          <button onClick={() => setTool("pan")} className={`p-1.5 rounded cursor-pointer ${tool === "pan" ? "bg-[#990803]/10 text-[#990803]" : "text-gray-400 hover:text-gray-600"}`}><Hand className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2">
          <button onClick={() => { import("sonner").then(m => m.toast.info("Hoàn tác thao tác trước đó")); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded cursor-pointer"><Undo2 className="w-4 h-4" /></button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Làm lại thao tác đã hoàn tác")); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded cursor-pointer"><Redo2 className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 text-gray-400 hover:text-gray-600 rounded cursor-pointer"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-gray-500 w-10 text-center" style={{ fontSize: "11px" }}>{zoom}%</span>
          <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1.5 text-gray-400 hover:text-gray-600 rounded cursor-pointer"><ZoomIn className="w-4 h-4" /></button>
        </div>
        <span className="text-gray-300 mx-1" style={{ fontSize: "10px" }}>Quy trình: Phê duyệt Ngân sách Đào tạo</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => { import("sonner").then(m => m.toast.info("Đang chạy test workflow...")); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>
            <Play className="w-3 h-3" /> Test Run
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đã lưu workflow!")); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>
            <Save className="w-3 h-3" /> Lưu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Canvas */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <WorkflowCanvas nodes={nodes} edges={edges} zoom={zoom} selectedNode={selectedNode} onSelectNode={onSelectNode} />
        </div>

        {/* Side Panel */}
        <div className="space-y-3">
          {/* Node Palette */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Thêm Node</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(NODE_CFG).map(([type, cfg]) => (
                <div key={type} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all" draggable>
                  <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-gray-600 truncate" style={{ fontSize: "10px" }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Node Properties */}
          {selectedNode ? (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-600" style={{ fontSize: "12px", fontWeight: 600 }}>Thuộc tính Node</h4>
                <button onClick={() => onSelectNode(null)} className="text-gray-300 hover:text-gray-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-gray-400 block mb-0.5" style={{ fontSize: "10px" }}>Tên</label>
                  <input defaultValue={selectedNode.label} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "12px" }} />
                </div>
                <div>
                  <label className="text-gray-400 block mb-0.5" style={{ fontSize: "10px" }}>Mô tả</label>
                  <textarea defaultValue={selectedNode.description} rows={2} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#990803]/20 resize-none" style={{ fontSize: "11px" }} />
                </div>
                <div>
                  <label className="text-gray-400 block mb-0.5" style={{ fontSize: "10px" }}>Loại</label>
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: NODE_CFG[selectedNode.type]?.color, backgroundColor: NODE_CFG[selectedNode.type]?.bg }}>{NODE_CFG[selectedNode.type]?.label}</span>
                </div>
                {selectedNode.config.approver && (
                  <div>
                    <label className="text-gray-400 block mb-0.5" style={{ fontSize: "10px" }}>Người duyệt</label>
                    <span className="text-gray-600" style={{ fontSize: "11px" }}>{selectedNode.config.approver}</span>
                  </div>
                )}
                {selectedNode.config.sla && (
                  <div>
                    <label className="text-gray-400 block mb-0.5" style={{ fontSize: "10px" }}>SLA</label>
                    <span className="text-gray-600" style={{ fontSize: "11px" }}>{selectedNode.config.sla}</span>
                  </div>
                )}
                {selectedNode.status && (
                  <div>
                    <label className="text-gray-400 block mb-0.5" style={{ fontSize: "10px" }}>Trạng thái</label>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: STATUS_COLORS[selectedNode.status]?.color, backgroundColor: STATUS_COLORS[selectedNode.status]?.bg }}>{STATUS_COLORS[selectedNode.status]?.label}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-gray-400 text-center py-4" style={{ fontSize: "11px" }}>Click một node trên canvas để xem thuộc tính</p>
            </div>
          )}

          {/* Workflow Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Thông tin</h4>
            <div className="space-y-1">
              {[
                { label: "Nodes", value: nodes.length },
                { label: "Edges", value: edges.length },
                { label: "Phiên bản", value: "v2.1" },
                { label: "Cập nhật", value: "12/03/2026" },
                { label: "Tác giả", value: "Admin" },
              ].map((i, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>{i.label}</span>
                  <span className="text-gray-600" style={{ fontSize: "10px", fontWeight: 500 }}>{i.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVG Workflow Canvas ───
function WorkflowCanvas({ nodes, edges, zoom, selectedNode, onSelectNode }: {
  nodes: WfNode[]; edges: WfEdge[];
  zoom: number; selectedNode: WfNode | null; onSelectNode: (n: WfNode | null) => void;
}) {
  const scale = zoom / 100;
  const W = 1400, H = 420;
  const nodeW = 130, nodeH = 50;

  const getNodeCenter = (n: WfNode) => ({ cx: n.x + nodeW / 2, cy: n.y + nodeH / 2 });

  return (
    <div className="overflow-auto" style={{ maxHeight: 500 }}>
      <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`} className="bg-[#fafafa]">
        {/* Grid */}
        <defs>
          <pattern id="wfGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="#e5e7eb" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#wfGrid)" />

        {/* Edges */}
        {edges.map(edge => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          const from = getNodeCenter(fromNode);
          const to = getNodeCenter(toNode);
          const fromStatus = fromNode.status;
          const edgeColor = fromStatus === "completed" ? "#16a34a" : fromStatus === "active" ? "#2563eb" : "#d1d5db";
          const mx = (from.cx + to.cx) / 2;
          const my = (from.cy + to.cy) / 2;
          return (
            <g key={edge.id}>
              <line x1={from.cx + nodeW / 2} y1={from.cy} x2={to.cx - nodeW / 2} y2={to.cy} stroke={edgeColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
              {edge.label && (
                <g>
                  <rect x={mx - 22} y={my - 8} width="44" height="16" rx="4" fill="white" stroke={edgeColor} strokeWidth="0.5" />
                  <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="central" fill={edgeColor} style={{ fontSize: "7px", fontWeight: 600 }}>{edge.label}</text>
                </g>
              )}
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map(node => {
          const cfg = NODE_CFG[node.type];
          const stColor = STATUS_COLORS[node.status || "idle"];
          const isSelected = selectedNode?.id === node.id;
          const Icon = cfg.icon;

          if (node.type === "condition") {
            // Diamond shape
            const cx = node.x + nodeW / 2;
            const cy = node.y + nodeH / 2;
            const rx = 55, ry = 28;
            return (
              <g key={node.id} onClick={() => onSelectNode(node)} className="cursor-pointer">
                <polygon points={`${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`} fill="white" stroke={isSelected ? "#990803" : cfg.color} strokeWidth={isSelected ? 2.5 : 1.5} />
                <text x={cx} y={cy - 3} textAnchor="middle" dominantBaseline="central" fill={cfg.color} style={{ fontSize: "8px", fontWeight: 600 }}>{node.label}</text>
                <circle cx={cx + rx - 8} cy={cy - ry + 8} r="4" fill={stColor.color} opacity="0.8" />
              </g>
            );
          }

          return (
            <g key={node.id} onClick={() => onSelectNode(node)} className="cursor-pointer">
              <rect x={node.x} y={node.y} width={nodeW} height={nodeH} rx={node.type === "start" || node.type === "end" ? 25 : 10} fill="white" stroke={isSelected ? "#990803" : cfg.color} strokeWidth={isSelected ? 2.5 : 1.5} />
              <rect x={node.x} y={node.y} width={4} height={nodeH} rx={2} fill={cfg.color} opacity="0.6" />
              <circle cx={node.x + nodeW - 10} cy={node.y + 10} r="4" fill={stColor.color} opacity="0.8" />
              <text x={node.x + 14} y={node.y + 18} fill={cfg.color} style={{ fontSize: "8px", fontWeight: 700 }}>{node.label}</text>
              <text x={node.x + 14} y={node.y + 32} fill="#9ca3af" style={{ fontSize: "6.5px" }}>{node.description.slice(0, 28)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Templates Tab ───
function TemplatesTab() {
  return (
    <div className="space-y-3">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>Chọn template để tạo workflow nhanh</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {TEMPLATES.map(t => (
          <div key={t.id} onClick={() => { import("sonner").then(m => m.toast.info(`Chọn template: ${t.name}`)); }} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="text-center mb-2">
              <span style={{ fontSize: "32px" }}>{t.icon}</span>
            </div>
            <h4 className="text-gray-800 text-center mb-0.5" style={{ fontSize: "12px", fontWeight: 600 }}>{t.name}</h4>
            <p className="text-gray-400 text-center mb-2" style={{ fontSize: "10px" }}>{t.description}</p>
            <div className="flex items-center justify-between text-gray-300" style={{ fontSize: "9px" }}>
              <span>{t.nodes} nodes • {t.edges} edges</span>
              <span>{t.usage} lần dùng</span>
            </div>
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "8px" }}>{t.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Instances Tab ───
function InstancesTab() {
  return (
    <div className="space-y-2">
      <p className="text-gray-500 mb-1" style={{ fontSize: "12px" }}>{INSTANCES.length} workflow instances</p>
      {INSTANCES.map(inst => {
        const stCfg = INST_STATUS[inst.status];
        return (
          <div key={inst.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stCfg.color + "10" }}>
                {inst.status === "running" ? <Play className="w-5 h-5" style={{ color: stCfg.color }} /> :
                 inst.status === "completed" ? <CheckCircle className="w-5 h-5" style={{ color: stCfg.color }} /> :
                 inst.status === "failed" ? <XCircle className="w-5 h-5" style={{ color: stCfg.color }} /> :
                 <Clock className="w-5 h-5" style={{ color: stCfg.color }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{inst.workflowName}</h4>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.color + "10" }}>{stCfg.label}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "10px" }}>
                  <span>👤 {inst.startedBy}</span>
                  <span>⏰ {inst.startedAt}</span>
                  <span>📍 {inst.currentStep}</span>
                  {inst.completedAt !== "—" && <span>✅ {inst.completedAt}</span>}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-48">
                    <div className="h-full rounded-full transition-all" style={{ width: `${inst.progress}%`, backgroundColor: stCfg.color }} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color }}>{inst.progress}%</span>
                </div>
              </div>
              <button onClick={() => { import("sonner").then(m => m.toast.info(`Xem tiến độ: ${inst.workflowName}`)); }} className="p-1.5 text-gray-300 hover:text-[#990803] cursor-pointer"><Eye className="w-4 h-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Analytics Tab ───
function AnalyticsTab() {
  const catData = [
    { cat: "Đào tạo", count: 73, color: "#990803" },
    { cat: "Tài chính", count: 38, color: "#c8a84e" },
    { cat: "HR", count: 62, color: "#2563eb" },
    { cat: "Chứng chỉ", count: 55, color: "#7c3aed" },
    { cat: "Thi cử", count: 42, color: "#ea580c" },
    { cat: "Content", count: 35, color: "#16a34a" },
    { cat: "Compliance", count: 50, color: "#0d9488" },
  ];
  const maxCount = Math.max(...catData.map(c => c.count));

  // Monthly trend
  const months = ["T9", "T10", "T11", "T12", "T1", "T2", "T3"];
  const created = [12, 15, 18, 22, 25, 20, 28];
  const completed = [10, 13, 16, 20, 22, 18, 24];
  const maxM = Math.max(...created);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Workflow by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Instances theo Danh mục</h3>
          <svg width="100%" height="200" viewBox="0 0 350 200" preserveAspectRatio="xMidYMid meet">
            {catData.map((c, i) => {
              const y = 5 + i * 27;
              const barW = (c.count / maxCount) * 180;
              return (
                <g key={c.cat}>
                  <text x="5" y={y + 10} dominantBaseline="central" fill="#374151" style={{ fontSize: "9px" }}>{c.cat}</text>
                  <rect x="80" y={y} width={barW} height="20" rx="4" fill={c.color} opacity="0.5" />
                  <text x={85 + barW} y={y + 10} dominantBaseline="central" fill={c.color} style={{ fontSize: "9px", fontWeight: 700 }}>{c.count}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Xu hướng theo Tháng</h3>
          <svg width="100%" height="200" viewBox="0 0 350 200" preserveAspectRatio="xMidYMid meet">
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
              const y = 15 + (1 - r) * 140;
              return (
                <g key={i}>
                  <line x1="30" y1={y} x2="330" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                  <text x="25" y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{Math.round(maxM * r)}</text>
                </g>
              );
            })}
            <polyline points={created.map((v, i) => `${30 + i * 50},${15 + (1 - v / maxM) * 140}`).join(" ")} fill="none" stroke="#990803" strokeWidth="2" strokeLinejoin="round" />
            <polyline points={completed.map((v, i) => `${30 + i * 50},${15 + (1 - v / maxM) * 140}`).join(" ")} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 2" />
            {months.map((m, i) => (
              <text key={i} x={30 + i * 50} y={170} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>{m}</text>
            ))}
            <rect x="240" y="5" width="8" height="8" rx="2" fill="#990803" />
            <text x="252" y="12" fill="#6b7280" style={{ fontSize: "7px" }}>Tạo mới</text>
            <rect x="240" y="18" width="8" height="8" rx="2" fill="#16a34a" />
            <text x="252" y="25" fill="#6b7280" style={{ fontSize: "7px" }}>Hoàn thành</text>
          </svg>
        </div>
      </div>

      {/* Average Processing Time */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Thời gian Xử lý TB theo Template (giờ)</h3>
        <svg width="100%" height="80" viewBox="0 0 700 80" preserveAspectRatio="xMidYMid meet">
          {[
            { name: "Phê duyệt KH mới", hours: 18, color: "#990803" },
            { name: "Phê duyệt NS", hours: 36, color: "#c8a84e" },
            { name: "Onboarding", hours: 72, color: "#2563eb" },
            { name: "Cấp CC", hours: 24, color: "#7c3aed" },
            { name: "Đăng ký Thi", hours: 12, color: "#ea580c" },
            { name: "ĐT Ngoài", hours: 48, color: "#16a34a" },
            { name: "Review", hours: 8, color: "#0d9488" },
          ].map((t, i) => {
            const x = 10 + i * 98;
            const barH = (t.hours / 72) * 42;
            return (
              <g key={i}>
                <rect x={x} y={50 - barH} width="68" height={barH} rx="4" fill={t.color} opacity="0.5" />
                <text x={x + 34} y={46 - barH} textAnchor="middle" fill={t.color} style={{ fontSize: "8px", fontWeight: 700 }}>{t.hours}h</text>
                <text x={x + 34} y={62} textAnchor="middle" fill="#6b7280" style={{ fontSize: "6.5px" }}>{t.name}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}