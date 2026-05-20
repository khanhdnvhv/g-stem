import { useState, useMemo } from "react";
import {
  CheckCircle2, XCircle, Clock, ChevronRight,
  FileText, BookOpen, Calendar, MessageCircle, Search,
  Filter, Eye, Send, RotateCcw, Shield,
  UserPlus, Award, Target, X,
  ChevronDown, Paperclip, History,
  AlertTriangle, CheckSquare, Square,
  Download, Trash2,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { toast } from "@/app/lib/toast";

// ─── Types ───
type RequestStatus = "pending" | "approved" | "rejected" | "revision";
type RequestType = "course_publish" | "enrollment" | "certificate" | "budget" | "event" | "content_update";
type Priority = "low" | "medium" | "high" | "urgent";

interface TimelineEntry {
  action: string;
  user: string;
  date: string;
  note?: string;
}

interface Comment {
  id: string;
  user: string;
  initials: string;
  date: string;
  text: string;
}

interface ApprovalRequest {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  requestedBy: { name: string; initials: string; department: string; subsidiary: string };
  requestedAt: string;
  status: RequestStatus;
  priority: Priority;
  assignedTo: string;
  reviewedAt?: string;
  reviewerNote?: string;
  details: Record<string, string>;
  attachments: number;
  comments: Comment[];
  timeline: TimelineEntry[];
  dueDate?: string;
}

const typeConfig: Record<RequestType, { label: string; icon: typeof BookOpen; color: string; bg: string }> = {
  course_publish: { label: "Xuất bản Khóa học", icon: BookOpen, color: "#990803", bg: "#99080310" },
  enrollment: { label: "Đăng ký Hàng loạt", icon: UserPlus, color: "#2e86de", bg: "#2e86de10" },
  certificate: { label: "Cấp Chứng chỉ", icon: Award, color: "#c8a84e", bg: "#c8a84e10" },
  budget: { label: "Ngân sách Đào tạo", icon: Target, color: "#27ae60", bg: "#27ae6010" },
  event: { label: "Sự kiện Đào tạo", icon: Calendar, color: "#8b5cf6", bg: "#8b5cf610" },
  content_update: { label: "Cập nhật Nội dung", icon: FileText, color: "#f97316", bg: "#f9731610" },
};

const statusConfig: Record<RequestStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Chờ duyệt", color: "#f59e0b", bg: "#f59e0b15", icon: Clock },
  approved: { label: "Đã duyệt", color: "#22c55e", bg: "#22c55e15", icon: CheckCircle2 },
  rejected: { label: "Từ chối", color: "#ef4444", bg: "#ef444415", icon: XCircle },
  revision: { label: "Yêu cầu sửa", color: "#f97316", bg: "#f9731615", icon: RotateCcw },
};

const priorityConfig: Record<Priority, { label: string; color: string; sort: number }> = {
  urgent: { label: "Khẩn cấp", color: "#ef4444", sort: 4 },
  high: { label: "Cao", color: "#f97316", sort: 3 },
  medium: { label: "Trung bình", color: "#f59e0b", sort: 2 },
  low: { label: "Thấp", color: "#94a3b8", sort: 1 },
};

// ─── Mock Data ───
const INITIAL_REQUESTS: ApprovalRequest[] = [
  {
    id: "WF001", type: "course_publish", title: "Khóa học: Chuyển đổi số trong Ngân hàng Bán lẻ",
    description: "Khóa học mới về ứng dụng công nghệ Fintech, AI/ML trong nghiệp vụ ngân hàng bán lẻ tại ABBank. Bao gồm 20 bài học video, 5 bài kiểm tra, tổng 15 giờ nội dung. Đã được bộ phận Compliance review.",
    requestedBy: { name: "ThS. Lê Thị Thu Hà", initials: "TH", department: "Khối QTRR", subsidiary: "ABBank" },
    requestedAt: "09/03/2026 14:30", status: "pending", priority: "high",
    assignedTo: "Nguyễn Văn Minh", dueDate: "15/03/2026",
    details: { "Danh mục": "CNTT & Chuyển đổi số", "Cấp độ": "Trung cấp", "Thời lượng": "15 giờ", "Đối tượng": "Khối NHBL — ABBank", "Số bài": "20 bài học", "Bài kiểm tra": "5 bài" },
    attachments: 3,
    comments: [
      { id: "c1", user: "ThS. Lê Thị Thu Hà", initials: "TH", date: "09/03/2026 14:30", text: "Đã hoàn thành nội dung và được bên Compliance review. Xin phê duyệt để xuất bản Q1/2026." },
      { id: "c2", user: "Nguyễn Văn Minh", initials: "NM", date: "10/03/2026 09:15", text: "Đang review nội dung khóa học. Sẽ phản hồi trong 2 ngày." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "ThS. Lê Thị Thu Hà", date: "09/03/2026 14:30" },
      { action: "Gán cho Nguyễn Văn Minh", user: "Hệ thống", date: "09/03/2026 14:31" },
    ],
  },
  {
    id: "WF002", type: "enrollment", title: "Đăng ký hàng loạt: An toàn Lao động Q2/2026",
    description: "Đăng ký 280 nhân sự khối Sản xuất & Khoáng sản tham gia khóa An toàn Lao động bắt buộc hàng năm theo quy định Bộ LĐTB&XH. Deadline hoàn thành trước 31/03/2026.",
    requestedBy: { name: "Vũ Thị Mai", initials: "VM", department: "Ban Nhân sự TĐ", subsidiary: "Tập đoàn Geleximco" },
    requestedAt: "08/03/2026 10:15", status: "pending", priority: "urgent",
    assignedTo: "Nguyễn Văn Minh", dueDate: "12/03/2026",
    details: { "Số lượng": "280 nhân sự", "Đơn vị": "Khoáng sản GX, Xi măng TL", "Khóa học": "An toàn Lao động XD&KK", "Deadline": "31/03/2026", "Ngân sách": "Đã duyệt Q1", "Bắt buộc": "Có — Luật ATVSLĐ" },
    attachments: 2,
    comments: [
      { id: "c3", user: "Vũ Thị Mai", initials: "VM", date: "08/03/2026 10:15", text: "Khẩn! Khóa ATLĐ bắt buộc theo Nghị định 44/2016. Cần hoàn thành trước 31/03 để đáp ứng thanh tra." },
      { id: "c4", user: "Phạm Đức Mạnh", initials: "PM", date: "08/03/2026 11:00", text: "Tôi đã sẵn sàng giảng dạy. Đề xuất chia 4 lớp, mỗi lớp 70 người." },
      { id: "c5", user: "Trần Thị Hương", initials: "TH", date: "08/03/2026 14:20", text: "Ngân sách ATLĐ Q1 đã được duyệt. Có thể triển khai ngay." },
      { id: "c6", user: "Nguyễn Văn Minh", initials: "NM", date: "09/03/2026 08:30", text: "Đã xác minh danh sách 280 nhân sự. Hợp lệ." },
      { id: "c7", user: "Vũ Thị Mai", initials: "VM", date: "09/03/2026 16:00", text: "Xin admin xem xét khẩn. Thanh tra Sở LĐTB&XH dự kiến T4/2026." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "Vũ Thị Mai", date: "08/03/2026 10:15" },
      { action: "Đánh dấu Khẩn cấp", user: "Hệ thống", date: "08/03/2026 10:15" },
      { action: "Gán cho Nguyễn Văn Minh", user: "Hệ thống", date: "08/03/2026 10:16" },
    ],
  },
  {
    id: "WF003", type: "budget", title: "Phê duyệt ngân sách: Chương trình LDP Cohort 2",
    description: "Ngân sách 4.2 tỷ VNĐ cho chương trình Leadership Development Program Cohort 2 gồm 50 cán bộ quản lý cấp trung từ 8 đơn vị. ROI dự kiến 3.2x dựa trên kết quả Cohort 1.",
    requestedBy: { name: "Trần Thị Hương", initials: "TH", department: "Ban Nhân sự TĐ", subsidiary: "Tập đoàn Geleximco" },
    requestedAt: "07/03/2026 16:45", status: "pending", priority: "high",
    assignedTo: "Nguyễn Văn Minh", dueDate: "17/03/2026",
    details: { "Ngân sách": "4.2 tỷ VNĐ", "Số người": "50 cán bộ QL", "Thời gian": "Q2-Q3/2026", "ROI kỳ vọng": "3.2x", "Cohort 1": "ROI thực tế 3.5x", "Đơn vị": "8 đơn vị thành viên" },
    attachments: 5,
    comments: [
      { id: "c8", user: "Trần Thị Hương", initials: "TH", date: "07/03/2026 16:45", text: "Đính kèm báo cáo ROI Cohort 1 và đề xuất chi tiết Cohort 2. Đề nghị ban lãnh đạo xem xét." },
      { id: "c9", user: "Lê Quốc Vương", initials: "LV", date: "08/03/2026 09:00", text: "Tôi ủng hộ chương trình này. Cohort 1 đã cho kết quả tích cực tại Geleximco Land." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "Trần Thị Hương", date: "07/03/2026 16:45" },
      { action: "Gán cho Nguyễn Văn Minh", user: "Hệ thống", date: "07/03/2026 16:46" },
    ],
  },
  {
    id: "WF004", type: "certificate", title: "Cấp chứng chỉ: Batch An toàn Mỏ T2/2026",
    description: "Cấp chứng chỉ hoàn thành cho 145 nhân sự đã pass bài kiểm tra An toàn Mỏ tháng 2/2026 với tỷ lệ đạt 92% và điểm trung bình 82.5.",
    requestedBy: { name: "KS. Trần Minh Đức", initials: "TĐ", department: "Ban Kỹ thuật", subsidiary: "Xi măng Thăng Long" },
    requestedAt: "06/03/2026 09:00", status: "approved", priority: "medium",
    assignedTo: "Nguyễn Văn Minh",
    reviewedAt: "07/03/2026 11:30", reviewerNote: "Đã xác minh danh sách 145 nhân sự và kết quả thi. Tất cả đạt điểm ≥ 70. Phê duyệt cấp chứng chỉ hàng loạt.",
    details: { "Số lượng": "145 chứng chỉ", "Khóa học": "An toàn Mỏ & Lao động", "Tỷ lệ pass": "92%", "Điểm TB": "82.5", "Template": "CERT-ATLĐ-2026", "Hiệu lực": "12 tháng" },
    attachments: 2,
    comments: [
      { id: "c10", user: "KS. Trần Minh Đức", initials: "TĐ", date: "06/03/2026 09:00", text: "File danh sách và bảng điểm đính kèm. Xin phê duyệt cấp chứng chỉ." },
      { id: "c11", user: "Nguyễn Văn Minh", initials: "NM", date: "07/03/2026 11:30", text: "Đã xác minh. Phê duyệt. Chứng chỉ sẽ được tạo tự động trong 24h." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "KS. Trần Minh Đức", date: "06/03/2026 09:00" },
      { action: "Phê duyệt", user: "Nguyễn Văn Minh", date: "07/03/2026 11:30", note: "Đã xác minh danh sách và điểm thi." },
    ],
  },
  {
    id: "WF005", type: "event", title: "Sự kiện: Workshop Lãnh đạo 5 Cấp độ",
    description: "Tổ chức workshop 2 ngày về Mô hình Lãnh đạo 5 Cấp độ (John Maxwell) cho 80 cán bộ quản lý cấp cao toàn tập đoàn.",
    requestedBy: { name: "Phạm Anh Tuấn", initials: "PT", department: "Ban Marketing BĐS", subsidiary: "BĐS Geleximco - KĐT An Khánh" },
    requestedAt: "05/03/2026 11:20", status: "approved", priority: "medium",
    assignedTo: "Nguyễn Văn Minh",
    reviewedAt: "06/03/2026 14:00", reviewerNote: "Phê duyệt. Yêu cầu phối hợp Ban Hành chính đặt phòng hội nghị Tầng 15, 36 Hoàng Cầu. Chuẩn bị tài liệu cho 80 người.",
    details: { "Ngày": "25-26/03/2026", "Địa điểm": "36 Hoàng Cầu, HN", "Số người": "80 người", "Chi phí": "350 triệu", "Speaker": "Dr. Nguyễn Hữu Lam", "Format": "Workshop 2 ngày" },
    attachments: 3,
    comments: [
      { id: "c12", user: "Phạm Anh Tuấn", initials: "PT", date: "05/03/2026 11:20", text: "Đề xuất tổ chức workshop theo format thành công của Geleximco Land năm 2025." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "Phạm Anh Tuấn", date: "05/03/2026 11:20" },
      { action: "Phê duyệt", user: "Nguyễn Văn Minh", date: "06/03/2026 14:00", note: "Phê duyệt. Phối hợp Ban HC đặt phòng." },
    ],
  },
  {
    id: "WF006", type: "content_update", title: "Cập nhật: Module Quản trị Rủi ro Basel IV",
    description: "Cập nhật nội dung module QTRR theo quy định Basel IV mới có hiệu lực từ 01/2027. Tăng từ 45 lên 62 slide, thêm 3 video và 15 câu quiz mới.",
    requestedBy: { name: "Nguyễn Thanh Tùng", initials: "NT", department: "Khối QTRR", subsidiary: "Chứng khoán An Bình (ABS)" },
    requestedAt: "04/03/2026 08:30", status: "revision", priority: "medium",
    assignedTo: "Nguyễn Văn Minh",
    reviewedAt: "05/03/2026 10:00", reviewerNote: "Nội dung tốt nhưng cần bổ sung: (1) Case study thực tế từ ABS và ABBank, (2) So sánh Basel III vs IV, (3) Impact analysis cho Geleximco Group. Deadline sửa: 15/03.",
    details: { "Module": "QTRR-Basel IV", "Số slide": "45 → 62", "Video mới": "3 video", "Quiz mới": "15 câu", "Deadline sửa": "15/03/2026", "Reviewer": "Trần Thị Hương" },
    attachments: 1,
    comments: [
      { id: "c13", user: "Nguyễn Thanh Tùng", initials: "NT", date: "04/03/2026 08:30", text: "Cập nhật theo regulatory update của SBV về Basel IV roadmap." },
      { id: "c14", user: "Nguyễn Văn Minh", initials: "NM", date: "05/03/2026 10:00", text: "Cần bổ sung thêm case study và impact analysis. Xem ghi chú chi tiết." },
      { id: "c15", user: "Nguyễn Thanh Tùng", initials: "NT", date: "06/03/2026 11:00", text: "Đã ghi nhận. Đang liên hệ Risk team ABBank lấy số liệu thực tế." },
      { id: "c16", user: "Trần Thị Hương", initials: "TH", date: "07/03/2026 09:30", text: "Team QTRR ABBank sẵn sàng cung cấp data cho case study. ETA: 12/03." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "Nguyễn Thanh Tùng", date: "04/03/2026 08:30" },
      { action: "Yêu cầu chỉnh sửa", user: "Nguyễn Văn Minh", date: "05/03/2026 10:00", note: "Cần bổ sung case study và impact analysis." },
    ],
  },
  {
    id: "WF007", type: "course_publish", title: "Khóa học: ESG & Phát triển Bền vững cho Lãnh đạo",
    description: "Khóa ESG chuyên sâu cho cấp GĐ/PGĐ các đơn vị, bao gồm Carbon footprint, SDGs, và báo cáo bền vững theo GRI Standards.",
    requestedBy: { name: "Đỗ Quốc Hùng", initials: "QH", department: "Ban Chiến lược", subsidiary: "Tập đoàn Geleximco" },
    requestedAt: "03/03/2026 15:00", status: "rejected", priority: "low",
    assignedTo: "Nguyễn Văn Minh",
    reviewedAt: "04/03/2026 09:30", reviewerNote: "Nội dung chưa đủ chuyên sâu cho đối tượng GĐ/PGĐ. Cần: (1) Mời chuyên gia ESG bên ngoài (PwC/KPMG) co-develop, (2) Bổ sung case study từ doanh nghiệp niêm yết VN, (3) Thêm phần compliance ESG cho ngành BĐS & Năng lượng. Đề xuất nộp lại sau khi hoàn thiện.",
    details: { "Danh mục": "ESG & Phát triển Bền vững", "Thời lượng": "12 giờ", "Cấp độ": "Nâng cao", "Đối tượng": "GĐ/PGĐ đơn vị", "Standards": "GRI, TCFD, SASB" },
    attachments: 1,
    comments: [
      { id: "c17", user: "Đỗ Quốc Hùng", initials: "QH", date: "03/03/2026 15:00", text: "Phiên bản đầu tiên. Mong nhận góp ý để hoàn thiện." },
      { id: "c18", user: "Nguyễn Văn Minh", initials: "NM", date: "04/03/2026 09:30", text: "Nội dung chưa đạt yêu cầu. Xem ghi chú chi tiết." },
      { id: "c19", user: "Lê Quốc Vương", initials: "LV", date: "05/03/2026 14:00", text: "Đồng ý cần mời chuyên gia bên ngoài. Tôi có contact PwC ESG team." },
      { id: "c20", user: "Đỗ Quốc Hùng", initials: "QH", date: "06/03/2026 10:00", text: "Đã note. Sẽ liên hệ PwC và nộp lại bản cập nhật." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "Đỗ Quốc Hùng", date: "03/03/2026 15:00" },
      { action: "Từ chối", user: "Nguyễn Văn Minh", date: "04/03/2026 09:30", note: "Nội dung chưa đạt yêu cầu cho đối tượng GĐ/PGĐ." },
    ],
  },
  {
    id: "WF008", type: "enrollment", title: "Đăng ký: Khóa Excel VBA cho Khối Tài chính",
    description: "Đăng ký 65 nhân sự Khối Kế toán-Tài chính từ 5 đơn vị tham gia khóa Excel VBA Automation.",
    requestedBy: { name: "Bùi Thị Hà", initials: "BH", department: "Kế toán - Tài chính", subsidiary: "Tập đoàn Geleximco" },
    requestedAt: "10/03/2026 08:00", status: "pending", priority: "medium",
    assignedTo: "Nguyễn Văn Minh", dueDate: "18/03/2026",
    details: { "Số lượng": "65 nhân sự", "Đơn vị": "5 đơn vị thành viên", "Khóa học": "Excel VBA Automation", "Bắt đầu": "01/04/2026", "Thời lượng": "16 giờ" },
    attachments: 1,
    comments: [
      { id: "c21", user: "Bùi Thị Hà", initials: "BH", date: "10/03/2026 08:00", text: "Danh sách 65 nhân sự kèm theo. Đã confirm với các đơn vị." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "Bùi Thị Hà", date: "10/03/2026 08:00" },
    ],
  },
  {
    id: "WF009", type: "event", title: "Sự kiện: Hackathon Chuyển đổi số Geleximco 2026",
    description: "Tổ chức cuộc thi Hackathon nội bộ về chuyển đổi số, quy mô 200 người, 3 ngày, giải thưởng 500 triệu VNĐ.",
    requestedBy: { name: "Dr. Trần Hùng", initials: "TH", department: "Ban CNTT & Chuyển đổi số", subsidiary: "Tập đoàn Geleximco" },
    requestedAt: "11/03/2026 09:00", status: "pending", priority: "high",
    assignedTo: "Nguyễn Văn Minh", dueDate: "20/03/2026",
    details: { "Ngày": "15-17/04/2026", "Quy mô": "200 người / 40 team", "Giải thưởng": "500 triệu VNĐ", "Chi phí tổ chức": "800 triệu", "Địa điểm": "Trung tâm Hội nghị GX" },
    attachments: 4,
    comments: [
      { id: "c22", user: "Dr. Trần Hùng", initials: "TH", date: "11/03/2026 09:00", text: "Đề xuất Hackathon DX 2026 với 5 track: AI, Cloud, IoT, Blockchain, Green Tech. Chi tiết đính kèm." },
    ],
    timeline: [
      { action: "Tạo yêu cầu", user: "Dr. Trần Hùng", date: "11/03/2026 09:00" },
    ],
  },
];

const NOW = "13/03/2026";
const NOW_TIME = "13/03/2026 " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export function WorkflowApproval() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const isAdmin = user?.role === "admin";

  const [requests, setRequests] = useState<ApprovalRequest[]>(INITIAL_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority">("priority");
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Computed
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const urgentCount = requests.filter(r => r.status === "pending" && r.priority === "urgent").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;
  const revisionCount = requests.filter(r => r.status === "revision").length;

  const filtered = useMemo(() => {
    let result = requests.filter(r => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      if (filterPriority !== "all" && r.priority !== filterPriority) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.requestedBy.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      }
      return true;
    });
    if (sortBy === "priority") {
      result.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return priorityConfig[b.priority].sort - priorityConfig[a.priority].sort;
      });
    }
    return result;
  }, [requests, filterStatus, filterType, filterPriority, searchQ, sortBy]);

  const pendingFiltered = filtered.filter(r => r.status === "pending");

  // ─── Actions ───
  const updateRequest = (id: string, changes: Partial<ApprovalRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r));
    if (selectedRequest?.id === id) {
      setSelectedRequest(prev => prev ? { ...prev, ...changes } : null);
    }
  };

  const handleApprove = async (req: ApprovalRequest, note: string) => {
    const confirmed = await confirm({
      title: "Phê duyệt yêu cầu",
      message: `Bạn xác nhận phê duyệt "${req.title}"?`,
      confirmLabel: "Phê duyệt",
      cancelLabel: "Hủy",
      variant: "info",
    });
    if (!confirmed) return false;
    updateRequest(req.id, {
      status: "approved",
      reviewedAt: NOW_TIME,
      reviewerNote: note || "Đã phê duyệt.",
      timeline: [...req.timeline, { action: "Phê duyệt", user: user?.name || "Admin", date: NOW_TIME, note: note || undefined }],
      comments: [...req.comments, ...(note ? [{ id: `ca${Date.now()}`, user: user?.name || "Admin", initials: "AD", date: NOW_TIME, text: `[Phê duyệt] ${note}` }] : [])],
    });
    toast.success(`Đã phê duyệt "${req.title}"`);
    return true;
  };

  const handleReject = async (req: ApprovalRequest, note: string) => {
    if (!note.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return false; }
    const confirmed = await confirm({
      title: "Từ chối yêu cầu",
      message: `Bạn xác nhận từ chối "${req.title}"? Người yêu cầu sẽ nhận được thông báo kèm lý do.`,
      confirmLabel: "Từ chối",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!confirmed) return false;
    updateRequest(req.id, {
      status: "rejected",
      reviewedAt: NOW_TIME,
      reviewerNote: note,
      timeline: [...req.timeline, { action: "Từ chối", user: user?.name || "Admin", date: NOW_TIME, note }],
      comments: [...req.comments, { id: `cr${Date.now()}`, user: user?.name || "Admin", initials: "AD", date: NOW_TIME, text: `[Từ chối] ${note}` }],
    });
    toast.success(`Đã từ chối "${req.title}"`);
    return true;
  };

  const handleRevision = async (req: ApprovalRequest, note: string) => {
    if (!note.trim()) { toast.error("Vui lòng nhập yêu cầu chỉnh sửa"); return false; }
    const confirmed = await confirm({
      title: "Yêu cầu chỉnh sửa",
      message: `Gửi yêu cầu chỉnh sửa cho "${req.title}"? Người yêu cầu sẽ nhận được thông báo kèm ghi chú.`,
      confirmLabel: "Gửi yêu cầu sửa",
      cancelLabel: "Hủy",
      variant: "warning",
    });
    if (!confirmed) return false;
    updateRequest(req.id, {
      status: "revision",
      reviewedAt: NOW_TIME,
      reviewerNote: note,
      timeline: [...req.timeline, { action: "Yêu cầu chỉnh sửa", user: user?.name || "Admin", date: NOW_TIME, note }],
      comments: [...req.comments, { id: `cv${Date.now()}`, user: user?.name || "Admin", initials: "AD", date: NOW_TIME, text: `[Yêu cầu sửa] ${note}` }],
    });
    toast.success(`Đã gửi yêu cầu chỉnh sửa cho "${req.title}"`);
    return true;
  };

  const handleBulkApprove = async () => {
    const pending = [...selectedIds].filter(id => requests.find(r => r.id === id)?.status === "pending");
    if (pending.length === 0) { toast.error("Không có yêu cầu nào đang chờ duyệt trong lựa chọn"); return; }
    const confirmed = await confirm({
      title: "Phê duyệt hàng loạt",
      message: `Bạn xác nhận phê duyệt ${pending.length} yêu cầu đã chọn?`,
      confirmLabel: `Phê duyệt ${pending.length} yêu cầu`,
      cancelLabel: "Hủy",
      variant: "info",
    });
    if (!confirmed) return;
    setRequests(prev => prev.map(r => {
      if (!pending.includes(r.id)) return r;
      return {
        ...r, status: "approved" as const, reviewedAt: NOW_TIME, reviewerNote: "Phê duyệt hàng loạt.",
        timeline: [...r.timeline, { action: "Phê duyệt (hàng loạt)", user: user?.name || "Admin", date: NOW_TIME }],
      };
    }));
    setSelectedIds(new Set());
    toast.success(`Đã phê duyệt ${pending.length} yêu cầu`);
  };

  const handleDelete = async (req: ApprovalRequest) => {
    const confirmed = await confirm({
      title: "Xóa yêu cầu",
      message: `Bạn có chắc muốn xóa yêu cầu "${req.title}"? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (confirmed) {
      setRequests(prev => prev.filter(r => r.id !== req.id));
      if (selectedRequest?.id === req.id) setSelectedRequest(null);
      toast.success(`Đã xóa yêu cầu "${req.title}"`);
    }
  };

  const handleExport = () => {
    const header = "ID,Loại,Tiêu đề,Người yêu cầu,Đơn vị,Trạng thái,Độ ưu tiên,Ngày tạo,Ngày duyệt\n";
    const rows = requests.map(r =>
      `${r.id},${typeConfig[r.type].label},${r.title},${r.requestedBy.name},${r.requestedBy.subsidiary},${statusConfig[r.status].label},${priorityConfig[r.priority].label},${r.requestedAt},${r.reviewedAt || "—"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `approvals_${NOW.replace(/\//g, "-")}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất danh sách phê duyệt (CSV)");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === pendingFiltered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(pendingFiltered.map(r => r.id)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground">Quy trình Phê duyệt</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            Quản lý workflow phê duyệt khóa học, đăng ký, chứng chỉ và ngân sách đào tạo
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-700" style={{ fontSize: "12px", fontWeight: 600 }}>{pendingCount} chờ duyệt</span>
              {urgentCount > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white rounded" style={{ fontSize: "9px", fontWeight: 700 }}>{urgentCount} khẩn</span>}
            </div>
          )}
          {isAdmin && (
            <button onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              style={{ fontSize: "12px" }}>
              <Download className="w-3.5 h-3.5" /> Xuất CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Chờ duyệt", value: pendingCount, icon: Clock, color: "#f59e0b", onClick: () => setFilterStatus("pending") },
          { label: "Đã duyệt", value: approvedCount, icon: CheckCircle2, color: "#22c55e", onClick: () => setFilterStatus("approved") },
          { label: "Từ chối", value: rejectedCount, icon: XCircle, color: "#ef4444", onClick: () => setFilterStatus("rejected") },
          { label: "Yêu cầu sửa", value: revisionCount, icon: RotateCcw, color: "#f97316", onClick: () => setFilterStatus("revision") },
        ].map((stat) => (
          <div key={stat.label} onClick={stat.onClick}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "15" }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{stat.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Tìm kiếm yêu cầu, người gửi..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              style={{ fontSize: "13px" }} />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {["all", "pending", "approved", "rejected", "revision"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${filterStatus === s ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}
                style={{ fontSize: "12px", fontWeight: 500 }}>
                {s === "all" ? "Tất cả" : statusConfig[s as RequestStatus].label}
                {s === "pending" && pendingCount > 0 && <span className="ml-1 px-1 py-0.5 rounded text-white bg-yellow-500" style={{ fontSize: "9px" }}>{pendingCount}</span>}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
            style={{ fontSize: "12px" }}>
            <Filter className="w-3.5 h-3.5" /> Lọc thêm
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Loại yêu cầu</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                <option value="all">Tất cả loại</option>
                {Object.entries(typeConfig).map(([key, conf]) => <option key={key} value={key}>{conf.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Độ ưu tiên</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                <option value="all">Tất cả</option>
                {Object.entries(priorityConfig).map(([key, conf]) => <option key={key} value={key}>{conf.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Sắp xếp</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                <option value="priority">Ưu tiên cao nhất</option>
                <option value="date">Mới nhất</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="bg-[#990803]/5 border border-[#990803]/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#990803]" />
            <span className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 600 }}>{selectedIds.size} yêu cầu đã chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleBulkApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 500 }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt tất cả
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              style={{ fontSize: "12px" }}>
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Select all for pending */}
      {isAdmin && pendingFiltered.length > 0 && filterStatus !== "approved" && filterStatus !== "rejected" && (
        <div className="flex items-center gap-2">
          <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
            {selectedIds.size === pendingFiltered.length ? <CheckSquare className="w-4 h-4 text-[#990803]" /> : <Square className="w-4 h-4" />}
            {selectedIds.size === pendingFiltered.length ? "Bỏ chọn tất cả" : `Chọn tất cả chờ duyệt (${pendingFiltered.length})`}
          </button>
        </div>
      )}

      {/* Request List */}
      {filtered.length === 0 ? (
        <EmptyState variant="search" title="Không tìm thấy yêu cầu" message="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" />
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <RequestCard key={request.id} request={request} isAdmin={isAdmin}
              isSelected={selectedIds.has(request.id)}
              onToggleSelect={() => toggleSelect(request.id)}
              onView={() => setSelectedRequest(request)}
              onApprove={(note) => handleApprove(request, note)}
              onReject={(note) => handleReject(request, note)}
              onRevision={(note) => handleRevision(request, note)}
              onDelete={() => handleDelete(request)}
            />
          ))}
        </div>
      )}

      <div className="text-center text-muted-foreground py-2" style={{ fontSize: "11px" }}>
        Hiển thị {filtered.length} / {requests.length} yêu cầu
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          isAdmin={isAdmin}
          onClose={() => setSelectedRequest(null)}
          onApprove={(note) => handleApprove(selectedRequest, note)}
          onReject={(note) => handleReject(selectedRequest, note)}
          onRevision={(note) => handleRevision(selectedRequest, note)}
          onDelete={() => handleDelete(selectedRequest)}
          onAddComment={(text) => {
            const newComment: Comment = {
              id: `cu${Date.now()}`, user: user?.name || "Admin", initials: "AD", date: NOW_TIME, text,
            };
            const updated = {
              comments: [...selectedRequest.comments, newComment],
              timeline: [...selectedRequest.timeline, { action: "Bình luận", user: user?.name || "Admin", date: NOW_TIME }],
            };
            updateRequest(selectedRequest.id, updated);
            toast.success("Đã thêm bình luận");
          }}
        />
      )}
    </div>
  );
}

// ─── Request Card ───
function RequestCard({ request, isAdmin, isSelected, onToggleSelect, onView, onApprove, onReject, onRevision, onDelete }: {
  request: ApprovalRequest; isAdmin: boolean; isSelected: boolean;
  onToggleSelect: () => void; onView: () => void;
  onApprove: (note: string) => void; onReject: (note: string) => void; onRevision: (note: string) => void;
  onDelete: () => void;
}) {
  const tConf = typeConfig[request.type];
  const sConf = statusConfig[request.status];
  const pConf = priorityConfig[request.priority];
  const StatusIcon = sConf.icon;
  const TypeIcon = tConf.icon;
  const isPending = request.status === "pending";
  const isUrgent = isPending && request.priority === "urgent";

  return (
    <div className={`bg-card rounded-xl border p-5 hover:shadow-md transition-all group ${isUrgent ? "border-red-200 ring-1 ring-red-100" : "border-border"}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox (admin + pending) */}
        {isAdmin && isPending && (
          <button onClick={onToggleSelect} className="mt-1 cursor-pointer shrink-0">
            {isSelected ? <CheckSquare className="w-4 h-4 text-[#990803]" /> : <Square className="w-4 h-4 text-muted-foreground" />}
          </button>
        )}

        {/* Type icon */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 cursor-pointer" style={{ backgroundColor: tConf.bg }} onClick={onView}>
          <TypeIcon className="w-5 h-5" style={{ color: tConf.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: tConf.color, backgroundColor: tConf.bg }}>{tConf.label}</span>
            <span className="px-2 py-0.5 rounded flex items-center gap-1" style={{ fontSize: "10px", fontWeight: 600, color: sConf.color, backgroundColor: sConf.bg }}>
              <StatusIcon className="w-3 h-3" /> {sConf.label}
            </span>
            <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: pConf.color, backgroundColor: pConf.color + "15" }}>{pConf.label}</span>
            {isUrgent && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded flex items-center gap-0.5" style={{ fontSize: "9px", fontWeight: 700 }}>
                <AlertTriangle className="w-2.5 h-2.5" /> KHẨN
              </span>
            )}
            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{request.id}</span>
          </div>

          <h4 className="text-foreground mb-1 group-hover:text-[#990803] transition-colors" style={{ fontSize: "14px", fontWeight: 600 }}>{request.title}</h4>
          <p className="text-muted-foreground line-clamp-2" style={{ fontSize: "12px", lineHeight: 1.6 }}>{request.description}</p>

          {/* Detail chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(request.details).slice(0, 4).map(([key, value]) => (
              <span key={key} className="px-2 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "10px" }}>
                <span style={{ fontWeight: 600 }}>{key}:</span> {value}
              </span>
            ))}
            {Object.keys(request.details).length > 4 && (
              <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "10px" }}>+{Object.keys(request.details).length - 4}</span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>{request.requestedBy.initials}</div>
              <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{request.requestedBy.name}</span>
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>• {request.requestedBy.subsidiary}</span>
            </div>
            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{request.requestedAt}</span>
            {request.dueDate && isPending && (
              <span className="flex items-center gap-0.5 text-red-500" style={{ fontSize: "10px", fontWeight: 500 }}>
                <Clock className="w-3 h-3" /> Due: {request.dueDate}
              </span>
            )}
            {request.attachments > 0 && (
              <span className="flex items-center gap-0.5 text-muted-foreground" style={{ fontSize: "10px" }}><Paperclip className="w-3 h-3" /> {request.attachments}</span>
            )}
            <span className="flex items-center gap-0.5 text-muted-foreground" style={{ fontSize: "10px" }}><MessageCircle className="w-3 h-3" /> {request.comments.length}</span>
          </div>

          {/* Reviewer note */}
          {request.reviewerNote && (
            <div className={`mt-3 p-3 rounded-lg border ${request.status === "approved" ? "bg-green-50 border-green-200" : request.status === "rejected" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="w-3 h-3" style={{ color: sConf.color }} />
                <span style={{ fontSize: "10px", fontWeight: 600, color: sConf.color }}>Nhận xét ({request.reviewedAt})</span>
              </div>
              <p className="text-foreground" style={{ fontSize: "12px", lineHeight: 1.5 }}>{request.reviewerNote}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {isAdmin && isPending && (
          <div className="flex flex-col gap-1.5 shrink-0">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer transition-colors"
              style={{ fontSize: "11px", fontWeight: 500 }}
              onClick={(e) => { e.stopPropagation(); onApprove(""); }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors"
              style={{ fontSize: "11px", fontWeight: 500 }}
              onClick={(e) => { e.stopPropagation(); onView(); }}>
              <Eye className="w-3.5 h-3.5" /> Chi tiết
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer transition-colors"
              style={{ fontSize: "11px", fontWeight: 500 }}
              onClick={(e) => { e.stopPropagation(); onView(); }}>
              <XCircle className="w-3.5 h-3.5" /> Từ chối
            </button>
          </div>
        )}

        {/* View button for non-pending */}
        {(!isPending || !isAdmin) && (
          <button onClick={onView} className="shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Detail Modal ───
function RequestDetailModal({ request, isAdmin, onClose, onApprove, onReject, onRevision, onDelete, onAddComment }: {
  request: ApprovalRequest; isAdmin: boolean;
  onClose: () => void;
  onApprove: (note: string) => Promise<boolean>;
  onReject: (note: string) => Promise<boolean>;
  onRevision: (note: string) => Promise<boolean>;
  onDelete: () => void;
  onAddComment: (text: string) => void;
}) {
  const tConf = typeConfig[request.type];
  const sConf = statusConfig[request.status];
  const pConf = priorityConfig[request.priority];
  const StatusIcon = sConf.icon;
  const isPending = request.status === "pending";

  const [tab, setTab] = useState<"details" | "comments" | "timeline">("details");
  const [approvalNote, setApprovalNote] = useState("");
  const [commentText, setCommentText] = useState("");
  const [processing, setProcessing] = useState(false);

  const doAction = async (fn: (note: string) => Promise<boolean>) => {
    setProcessing(true);
    const ok = await fn(approvalNote);
    setProcessing(false);
    if (ok) { setApprovalNote(""); onClose(); }
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tConf.bg }}>
                <tConf.icon className="w-4 h-4" style={{ color: tConf.color }} />
              </div>
              <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{request.id}</span>
              <span className="px-2 py-0.5 rounded flex items-center gap-1" style={{ fontSize: "10px", fontWeight: 600, color: sConf.color, backgroundColor: sConf.bg }}>
                <StatusIcon className="w-3 h-3" /> {sConf.label}
              </span>
              <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: pConf.color, backgroundColor: pConf.color + "15" }}>{pConf.label}</span>
              {request.dueDate && isPending && (
                <span className="flex items-center gap-0.5 text-red-500" style={{ fontSize: "10px", fontWeight: 500 }}>
                  <Clock className="w-3 h-3" /> Due: {request.dueDate}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <h3 className="text-foreground mb-1" style={{ fontSize: "18px", fontWeight: 600 }}>{request.title}</h3>
          <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.7 }}>{request.description}</p>

          {/* Requester */}
          <div className="flex items-center gap-3 mt-3 p-3 bg-secondary/50 rounded-lg border border-border">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>{request.requestedBy.initials}</div>
            <div className="flex-1">
              <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{request.requestedBy.name}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{request.requestedBy.department} — {request.requestedBy.subsidiary}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{request.requestedAt}</p>
              {request.attachments > 0 && <p className="text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5" style={{ fontSize: "10px" }}><Paperclip className="w-3 h-3" /> {request.attachments} đính kèm</p>}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {([
              { id: "details" as const, label: "Chi tiết", icon: FileText },
              { id: "comments" as const, label: `Bình luận (${request.comments.length})`, icon: MessageCircle },
              { id: "timeline" as const, label: `Lịch sử (${request.timeline.length})`, icon: History },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors ${tab === t.id ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                style={{ fontSize: "12px", fontWeight: tab === t.id ? 600 : 400 }}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "details" && (
            <div className="space-y-5">
              {/* Details table */}
              <div>
                <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Thông tin chi tiết</h4>
                <div className="bg-secondary/50 rounded-xl border border-border p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(request.details).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0" style={{ fontSize: "12px", fontWeight: 500 }}>{key}:</span>
                        <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviewer note */}
              {request.reviewerNote && (
                <div>
                  <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Nhận xét Phê duyệt</h4>
                  <div className={`p-4 rounded-xl border ${request.status === "approved" ? "bg-green-50 border-green-200" : request.status === "rejected" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4" style={{ color: sConf.color }} />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: sConf.color }}>{sConf.label}</span>
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>— {request.reviewedAt}</span>
                    </div>
                    <p className="text-foreground" style={{ fontSize: "13px", lineHeight: 1.7 }}>{request.reviewerNote}</p>
                  </div>
                </div>
              )}

              {/* Approval area for pending */}
              {isAdmin && isPending && (
                <div className="border-t border-border pt-5">
                  <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Quyết định Phê duyệt</h4>
                  <textarea value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder="Nhập ghi chú cho quyết định phê duyệt (bắt buộc khi từ chối hoặc yêu cầu sửa)..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none mb-3"
                    style={{ fontSize: "13px", resize: "vertical" }} />
                  <div className="flex items-center gap-2">
                    <button disabled={processing} onClick={() => doAction(onApprove)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-50"
                      style={{ fontSize: "13px", fontWeight: 500 }}>
                      <CheckCircle2 className="w-4 h-4" /> Phê duyệt
                    </button>
                    <button disabled={processing} onClick={() => doAction(onRevision)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50"
                      style={{ fontSize: "13px", fontWeight: 500 }}>
                      <RotateCcw className="w-4 h-4" /> Yêu cầu sửa
                    </button>
                    <button disabled={processing} onClick={() => doAction(onReject)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                      style={{ fontSize: "13px", fontWeight: 500 }}>
                      <XCircle className="w-4 h-4" /> Từ chối
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "comments" && (
            <div className="space-y-4">
              {request.comments.length === 0 ? (
                <EmptyState variant="empty" title="Chưa có bình luận" message="Hãy là người đầu tiên bình luận" compact />
              ) : (
                request.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>{c.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{c.user}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{c.date}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.6 }}>{c.text}</p>
                    </div>
                  </div>
                ))
              )}

              {/* Add comment */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") submitComment(); }}
                  placeholder="Nhập bình luận..."
                  className="flex-1 px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none"
                  style={{ fontSize: "13px" }} />
                <button onClick={submitComment} disabled={!commentText.trim()}
                  className="px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer disabled:opacity-50"
                  style={{ fontSize: "13px" }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {tab === "timeline" && (
            <div className="space-y-0">
              {request.timeline.length === 0 ? (
                <EmptyState variant="empty" title="Chưa có lịch sử" message="Chưa có hoạt động nào" compact />
              ) : (
                request.timeline.map((entry, i) => {
                  const isLast = i === request.timeline.length - 1;
                  const actionColor =
                    entry.action.includes("Phê duyệt") ? "#22c55e" :
                    entry.action.includes("Từ chối") ? "#ef4444" :
                    entry.action.includes("sửa") || entry.action.includes("Chỉnh") ? "#f97316" :
                    entry.action.includes("Khẩn") ? "#ef4444" : "#990803";
                  return (
                    <div key={i} className="flex gap-3 relative">
                      {/* Vertical line */}
                      {!isLast && <div className="absolute left-[11px] top-7 w-0.5 bg-border" style={{ bottom: "-8px" }} />}
                      {/* Dot */}
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 bg-card z-10"
                        style={{ borderColor: actionColor }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: actionColor }} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 pb-5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{entry.action}</span>
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>bởi {entry.user}</span>
                        </div>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{entry.date}</p>
                        {entry.note && (
                          <p className="mt-1 text-foreground bg-secondary/50 rounded-lg p-2 border border-border" style={{ fontSize: "12px", lineHeight: 1.5 }}>{entry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30">
          <div className="text-muted-foreground" style={{ fontSize: "11px" }}>
            Gán: {request.assignedTo} • {request.attachments} đính kèm • {request.comments.length} bình luận
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                style={{ fontSize: "12px" }}>
                <Trash2 className="w-3.5 h-3.5" /> Xóa
              </button>
            )}
            <button onClick={onClose}
              className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              style={{ fontSize: "13px" }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
