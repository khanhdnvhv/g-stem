import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   STUDENT LMS DESIGN SYSTEM — 4 cấp học
   Mầm Non (3-5) · Tiểu Học (6-10) · THCS (11-14) · THPT (15-18)
   ═══════════════════════════════════════════════════════════════════════ */

type Level = 'mamnon' | 'tieuhoc' | 'thcs' | 'thpt';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const TOKENS = {
  mamnon: {
    label: 'Mầm Non', age: '3 – 5 tuổi', emoji: '🌈',
    tagline: 'Vui nhộn · Tò mò · Khám phá',
    pageBg: '#FFFBF0',
    sidebarBg: '#FF6B35',
    primary: '#FF6B35', primaryDark: '#f59e0b',
    secondary: '#FFD93D',
    green: '#6BCF7F', pink: '#FF8FAB', blue: '#74C0FC', purple: '#7c3aed',
    card: '#FFFFFF', border: 'rgba(255,107,53,0.18)',
    text: '#3D2B1F', muted: '#8B6955',
    radius: 28, btnRadius: 24,
    fontFamily: "'Nunito', 'Comic Sans MS', cursive, sans-serif",
    heroSize: 40, titleSize: 26, bodySize: 20, labelSize: 16,
    fontWeight: 800,
    subjects: [
      { name: 'Toán Vui', emoji: '🔢', color: '#FF6B35', bg: '#FFF0E6', progress: 60 },
      { name: 'Tiếng Việt', emoji: '📖', color: '#FF8FAB', bg: '#FFF0F5', progress: 75 },
      { name: 'Mỹ Thuật', emoji: '🎨', color: '#7c3aed', bg: '#F5F0FF', progress: 90 },
      { name: 'Âm Nhạc', emoji: '🎵', color: '#74C0FC', bg: '#F0F8FF', progress: 80 },
      { name: 'Thể Dục', emoji: '⚽', color: '#6BCF7F', bg: '#F0FFF4', progress: 85 },
      { name: 'Khám Phá', emoji: '🔍', color: '#FFD93D', bg: '#FFFCE6', progress: 70 },
    ],
    schedule: [
      { time: '7:30', label: 'Buổi Sáng', emoji: '🌞',
        items: [{ name: 'Chào Cờ & Thể Dục', emoji: '🏃', color: '#6BCF7F' },
                { name: 'Toán Vui', emoji: '🔢', color: '#FF6B35' },
                { name: 'Tiếng Việt', emoji: '📖', color: '#FF8FAB' }] },
      { time: '10:00', label: 'Giải Lao', emoji: '🍎',
        items: [{ name: 'Ăn Sáng & Vui Chơi', emoji: '🍎', color: '#FFD93D' }] },
      { time: '10:30', label: 'Giữa Buổi', emoji: '🎨',
        items: [{ name: 'Mỹ Thuật', emoji: '🎨', color: '#7c3aed' },
                { name: 'Âm Nhạc', emoji: '🎵', color: '#74C0FC' }] },
      { time: '14:00', label: 'Buổi Chiều', emoji: '🌤️',
        items: [{ name: 'Khám Phá Thế Giới', emoji: '🔍', color: '#FF8FAB' },
                { name: 'Thể Dục Vui', emoji: '⚽', color: '#6BCF7F' }] },
    ],
    palette: [
      { label: 'Cam Năng Lượng', value: '#FF6B35', usage: 'Màu chủ — CTA, Header' },
      { label: 'Vàng Vui Tươi', value: '#FFD93D', usage: 'Accent — Điểm thưởng, Badge' },
      { label: 'Xanh Tươi Mát', value: '#6BCF7F', usage: 'Success — Hoàn thành bài' },
      { label: 'Hồng Dịu Dàng', value: '#FF8FAB', usage: 'Accent 2 — Tiếng Việt' },
      { label: 'Xanh Dương Bầu Trời', value: '#74C0FC', usage: 'Accent 3 — Âm nhạc' },
      { label: 'Tím Phép Thuật', value: '#7c3aed', usage: 'Accent 4 — Mỹ thuật' },
      { label: 'Nền Kem Ấm', value: '#FFFBF0', usage: 'Page background' },
      { label: 'Trắng Trong Sáng', value: '#FFFFFF', usage: 'Card surface' },
    ],
    guidelines: [
      { icon: '🔤', rule: 'Font lớn 20–40px', desc: 'Trẻ đang học đọc, cần chữ cực to và rõ ràng' },
      { icon: '🖼️', rule: 'Hình minh họa 60–80px', desc: 'Emoji và hình ảnh phải to hơn chữ' },
      { icon: '👆', rule: 'Nút tối thiểu 64px', desc: 'Ngón tay nhỏ cần diện tích chạm lớn' },
      { icon: '🎨', rule: '≤4 màu chính / màn hình', desc: 'Tránh quá tải thị giác, dùng màu tươi sáng' },
      { icon: '✏️', rule: 'Tối đa 5 từ / dòng', desc: 'Trẻ chưa đọc thành thạo, dùng câu cực ngắn' },
      { icon: '⭐', rule: 'Reward ngay lập tức', desc: 'Sao vàng, confetti sau mỗi hành động đúng' },
      { icon: '🔄', rule: 'Animation vui nhộn', desc: 'Bounce, wobble, spring cho mọi interaction' },
      { icon: '🧭', rule: '≤3 mục / màn hình', desc: 'Phân cấp thông tin tối giản, không scroll dài' },
    ],
  },

  tieuhoc: {
    label: 'Tiểu Học', age: '6 – 10 tuổi', emoji: '⭐',
    tagline: 'Năng Động · Thú Vị · Thành Tích',
    pageBg: '#FFF8F8',
    sidebarBg: '#990803',
    primary: '#990803', primaryDark: '#7a0602',
    secondary: '#f59e0b',
    green: '#16A34A', yellow: '#c8a84e', purple: '#990803', pink: '#d4183d',
    card: '#FFFFFF', border: 'rgba(153,8,3,0.1)',
    text: '#1E293B', muted: '#64748B',
    radius: 16, btnRadius: 12,
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    heroSize: 28, titleSize: 20, bodySize: 15, labelSize: 13,
    fontWeight: 700,
    subjects: [
      { name: 'Toán', icon: '➕', color: '#990803', bg: 'rgba(153,8,3,0.1)', stars: 4, progress: 78 },
      { name: 'Tiếng Việt', icon: '✏️', color: '#d4183d', bg: '#FCE7F3', stars: 5, progress: 92 },
      { name: 'Khoa Học', icon: '🔬', color: '#16A34A', bg: '#DCFCE7', stars: 3, progress: 65 },
      { name: 'Lịch Sử', icon: '🏛️', color: '#f59e0b', bg: '#FFEDD5', stars: 4, progress: 71 },
      { name: 'Địa Lý', icon: '🌍', color: '#990803', bg: '#FFF8F8', stars: 3, progress: 55 },
      { name: 'Tiếng Anh', icon: '🌐', color: '#c8a84e', bg: '#FEF9C3', stars: 5, progress: 88 },
    ],
    schedule: [
      { day: 'T2', subjects: [
        { name: 'Toán', color: '#990803', period: 1 },
        { name: 'T. Việt', color: '#d4183d', period: 2 },
        { name: 'T. Anh', color: '#c8a84e', period: 3 },
        { name: 'KH Tự Nhiên', color: '#16A34A', period: 4 },
        { name: 'Thể Dục', color: '#990803', period: 5 },
      ]},
      { day: 'T3', subjects: [
        { name: 'Toán', color: '#990803', period: 1 },
        { name: 'T. Việt', color: '#d4183d', period: 2 },
        { name: 'Lịch Sử', color: '#f59e0b', period: 3 },
        { name: 'Địa Lý', color: '#990803', period: 4 },
        { name: 'Mỹ Thuật', color: '#d4183d', period: 5 },
      ]},
      { day: 'T4', subjects: [
        { name: 'Toán', color: '#990803', period: 1 },
        { name: 'T. Việt', color: '#d4183d', period: 2 },
        { name: 'T. Anh', color: '#c8a84e', period: 3 },
        { name: 'KTTT', color: '#16A34A', period: 4 },
        { name: 'Âm Nhạc', color: '#f59e0b', period: 5 },
      ]},
      { day: 'T5', subjects: [
        { name: 'Toán', color: '#990803', period: 1 },
        { name: 'T. Việt', color: '#d4183d', period: 2 },
        { name: 'KH XH', color: '#990803', period: 3 },
        { name: 'Địa Lý', color: '#f59e0b', period: 4 },
        { name: 'Thể Dục', color: '#990803', period: 5 },
      ]},
      { day: 'T6', subjects: [
        { name: 'Toán', color: '#990803', period: 1 },
        { name: 'T. Việt', color: '#d4183d', period: 2 },
        { name: 'T. Anh', color: '#c8a84e', period: 3 },
        { name: 'TNXH', color: '#16A34A', period: 4 },
        { name: 'SHCK', color: '#64748B', period: 5 },
      ]},
    ],
    palette: [
      { label: 'Xanh Tin Tưởng', value: '#990803', usage: 'Primary — Toán, CTA chính' },
      { label: 'Cam Năng Động', value: '#f59e0b', usage: 'Secondary — Sự kiện, Nổi bật' },
      { label: 'Xanh Thành Công', value: '#16A34A', usage: 'Success — Hoàn thành, Điểm tốt' },
      { label: 'Vàng Phần Thưởng', value: '#c8a84e', usage: 'Achievement — Sao, huy hiệu' },
      { label: 'Tím Sáng Tạo', value: '#990803', usage: 'Creative — Mỹ thuật, Địa lý' },
      { label: 'Hồng Tiếng Việt', value: '#d4183d', usage: 'Ngữ văn, Tiếng Việt' },
      { label: 'Nền Xanh Nhạt', value: '#FFF8F8', usage: 'Page background' },
      { label: 'Viền Card', value: 'rgba(153,8,3,0.1)', usage: 'Border, divider' },
    ],
    guidelines: [
      { icon: '🎮', rule: 'Gamification nhẹ', desc: 'Điểm XP, streak, sao — hiện thị mọi nơi' },
      { icon: '📊', rule: 'Progress bar rõ ràng', desc: 'Trẻ cần thấy mình tiến bộ bao nhiêu %' },
      { icon: '🏆', rule: 'Badge & thành tích', desc: 'Huy hiệu thu thập được sau mỗi mốc hoàn thành' },
      { icon: '👆', rule: 'Nút tối thiểu 48px', desc: 'Vẫn cần vùng chạm đủ lớn' },
      { icon: '🔥', rule: 'Streak & Momentum', desc: 'Duy trì chuỗi học liên tiếp tạo thói quen tốt' },
      { icon: '📱', rule: 'Layout 2 cột', desc: '2 cột card môn học, thêm thông tin hơn mầm non' },
      { icon: '⚡', rule: 'Animation thưởng', desc: 'Stars bay ra khi làm đúng, confetti khi đạt mốc' },
      { icon: '📅', rule: 'Lịch học rõ ràng', desc: 'Hiện đủ 5 buổi/tuần theo màu môn học' },
    ],
  },

  thcs: {
    label: 'THCS', age: '11 – 14 tuổi', emoji: '🚀',
    tagline: 'Cá Tính · Khám Phá · Cộng Đồng',
    pageBg: '#0F0F1A',
    sidebarBg: '#12122A',
    primary: '#990803', primaryDark: '#7C3AED',
    secondary: '#2563eb',
    green: '#16a34a', yellow: '#F59E0B', red: '#d4183d', neon: '#F0ABFC',
    card: '#1A1A2E', cardHover: '#1E1E3F', border: '#2D2D50',
    text: '#F1F5F9', muted: '#94A3B8',
    radius: 12, btnRadius: 8,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    heroSize: 24, titleSize: 18, bodySize: 14, labelSize: 12,
    fontWeight: 600,
    subjects: [
      { name: 'Toán', tag: 'MATH', color: '#990803', grad: ['#7C3AED', '#990803'], xp: 840, progress: 78, streak: 12 },
      { name: 'Vật Lý', tag: 'PHY', color: '#2563eb', grad: ['#2563eb', '#16a34a'], xp: 620, progress: 65, streak: 7 },
      { name: 'Hóa Học', tag: 'CHEM', color: '#16a34a', grad: ['#16a34a', '#16a34a'], xp: 710, progress: 82, streak: 9 },
      { name: 'Sinh Học', tag: 'BIO', color: '#F59E0B', grad: ['#D97706', '#c8a84e'], xp: 530, progress: 71, streak: 5 },
      { name: 'Ngữ Văn', tag: 'LIT', color: '#d4183d', grad: ['#d4183d', '#d4183d'], xp: 890, progress: 88, streak: 15 },
      { name: 'Tiếng Anh', tag: 'ENG', color: '#990803', grad: ['#990803', '#7a0602'], xp: 760, progress: 90, streak: 20 },
    ],
    schedule: [
      { day: 'Thứ 2', dark: true, subjects: [
        { name: 'Toán', color: '#990803', teacher: 'Cô Hà', room: 'P.201' },
        { name: 'Vật Lý', color: '#2563eb', teacher: 'Thầy Minh', room: 'P.Lab' },
        { name: 'Văn', color: '#d4183d', teacher: 'Cô Lan', room: 'P.102' },
        { name: 'Anh', color: '#990803', teacher: 'Cô Trang', room: 'P.301' },
      ]},
      { day: 'Thứ 3', dark: true, subjects: [
        { name: 'Hóa', color: '#16a34a', teacher: 'Thầy Nam', room: 'P.Hóa' },
        { name: 'Toán', color: '#990803', teacher: 'Cô Hà', room: 'P.201' },
        { name: 'Sinh', color: '#F59E0B', teacher: 'Cô Mai', room: 'P.Bio' },
        { name: 'Sử', color: '#f59e0b', teacher: 'Thầy Đức', room: 'P.103' },
      ]},
      { day: 'Thứ 4', dark: true, subjects: [
        { name: 'Toán', color: '#990803', teacher: 'Cô Hà', room: 'P.201' },
        { name: 'Anh', color: '#990803', teacher: 'Cô Trang', room: 'P.301' },
        { name: 'Vật Lý', color: '#2563eb', teacher: 'Thầy Minh', room: 'P.Lab' },
        { name: 'GDCD', color: '#94A3B8', teacher: 'Cô Thu', room: 'P.104' },
      ]},
    ],
    palette: [
      { label: 'Tím Cá Tính', value: '#990803', usage: 'Primary — Brand, CTA chính' },
      { label: 'Cyan Công Nghệ', value: '#2563eb', usage: 'Secondary — Vật lý, Tech' },
      { label: 'Emerald Thành Công', value: '#16a34a', usage: 'Success, Hóa học' },
      { label: 'Amber Thách Thức', value: '#F59E0B', usage: 'Warning, Sinh học' },
      { label: 'Neon Hồng', value: '#F0ABFC', usage: 'Accent — Highlight, trend' },
      { label: 'Nền Tối Sâu', value: '#0F0F1A', usage: 'Page background (dark mode)' },
      { label: 'Card Tối', value: '#1A1A2E', usage: 'Card surface dark' },
      { label: 'Viền Tối', value: '#2D2D50', usage: 'Border dark mode' },
    ],
    guidelines: [
      { icon: '🌙', rule: 'Dark mode mặc định', desc: 'Gen Z ưa dark mode — tránh chói mắt khi học tối' },
      { icon: '⚡', rule: 'XP & Level system', desc: 'Gamification sâu — cấp độ, kinh nghiệm, ranking' },
      { icon: '🏅', rule: 'Leaderboard', desc: 'Bảng xếp hạng lớp tạo tính cạnh tranh lành mạnh' },
      { icon: '🎴', rule: 'Card kiểu social', desc: 'Layout giống Instagram — card content học tập' },
      { icon: '✨', rule: 'Gradient headers', desc: 'Gradient tím-cyan cho cảm giác năng động, hiện đại' },
      { icon: '🔔', rule: 'Streak & thông báo', desc: 'Nhắc học hàng ngày, streak mạnh = động lực cao' },
      { icon: '🤝', rule: 'Tính cộng đồng', desc: 'Xem bạn học gì, ai đứng đầu lớp, bình luận bài' },
      { icon: '🎯', rule: 'Mission hàng ngày', desc: 'To-do list nhiệm vụ ngày — cảm giác hoàn thành nhiều thứ' },
    ],
  },

  thpt: {
    label: 'THPT', age: '15 – 18 tuổi', emoji: '🎓',
    tagline: 'Nghiêm Túc · Hiệu Quả · Chuyên Nghiệp',
    pageBg: '#F8FAFC',
    sidebarBg: '#1E293B',
    primary: '#7a0602', primaryDark: '#7a0602',
    secondary: '#0EA5E9',
    green: '#16a34a', yellow: '#D97706', red: '#d4183d', slate: '#475569',
    card: '#FFFFFF', border: '#E2E8F0',
    text: '#0F172A', muted: '#64748B',
    radius: 8, btnRadius: 6,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    heroSize: 22, titleSize: 16, bodySize: 14, labelSize: 12,
    fontWeight: 500,
    subjects: [
      { name: 'Toán', code: 'MATH', color: '#7a0602', progress: 78, grade: '8.5', nextExam: '22/05' },
      { name: 'Vật Lý', code: 'PHY', color: '#0369A1', progress: 65, grade: '7.8', nextExam: '24/05' },
      { name: 'Hóa Học', code: 'CHEM', color: '#2563eb', progress: 82, grade: '8.9', nextExam: '27/05' },
      { name: 'Sinh Học', code: 'BIO', color: '#16a34a', progress: 71, grade: '8.1', nextExam: '30/05' },
      { name: 'Ngữ Văn', code: 'LIT', color: '#7C3AED', progress: 88, grade: '9.0', nextExam: '02/06' },
      { name: 'Tiếng Anh', code: 'ENG', color: '#D97706', progress: 90, grade: '9.2', nextExam: '05/06' },
    ],
    schedule: [
      { day: 'Thứ 2', periods: [
        { p: 1, name: 'Toán', room: '101', teacher: 'Cô Ngọc Hà', time: '7:00' },
        { p: 2, name: 'Vật Lý', room: '201', teacher: 'Thầy Quang Minh', time: '8:45' },
        { p: 3, name: 'Hóa Học', room: '301', teacher: 'Thầy Trung Nam', time: '10:30' },
      ]},
      { day: 'Thứ 3', periods: [
        { p: 1, name: 'Ngữ Văn', room: '102', teacher: 'Cô Lan Anh', time: '7:00' },
        { p: 2, name: 'Tiếng Anh', room: '202', teacher: 'Cô Thu Trang', time: '8:45' },
        { p: 3, name: 'Sinh Học', room: '302', teacher: 'Cô Phương Mai', time: '10:30' },
      ]},
      { day: 'Thứ 4', periods: [
        { p: 1, name: 'Toán', room: '101', teacher: 'Cô Ngọc Hà', time: '7:00' },
        { p: 2, name: 'Hóa Học', room: '301', teacher: 'Thầy Trung Nam', time: '8:45' },
        { p: 3, name: 'GDQP', room: 'Sân', teacher: 'Thầy Hùng', time: '10:30' },
      ]},
      { day: 'Thứ 5', periods: [
        { p: 1, name: 'Vật Lý', room: '201', teacher: 'Thầy Quang Minh', time: '7:00' },
        { p: 2, name: 'Tiếng Anh', room: '202', teacher: 'Cô Thu Trang', time: '8:45' },
        { p: 3, name: 'Toán', room: '101', teacher: 'Cô Ngọc Hà', time: '10:30' },
      ]},
    ],
    palette: [
      { label: 'Navy Chuyên Nghiệp', value: '#7a0602', usage: 'Primary — Toán, CTA chính' },
      { label: 'Xanh Dương Sáng', value: '#0EA5E9', usage: 'Secondary — Link, Info' },
      { label: 'Xanh Lá Tích Cực', value: '#16a34a', usage: 'Success — Điểm cao, Hoàn thành' },
      { label: 'Vàng Cảnh Báo', value: '#D97706', usage: 'Warning — Deadline gần, Thấp điểm' },
      { label: 'Đỏ Nguy Hiểm', value: '#d4183d', usage: 'Danger — Trễ deadline, Điểm kém' },
      { label: 'Xám Thông Tin', value: '#475569', usage: 'Muted text, Label phụ' },
      { label: 'Nền Trắng Xám', value: '#F8FAFC', usage: 'Page background' },
      { label: 'Viền Tinh Tế', value: '#E2E8F0', usage: 'Border, divider' },
    ],
    guidelines: [
      { icon: '📊', rule: 'Dashboard data-driven', desc: 'Hiện GPA, % tiến độ, ngày thi — đầy đủ số liệu' },
      { icon: '⏰', rule: 'Countdown đến kỳ thi', desc: 'Hiện số ngày còn lại của từng kỳ kiểm tra quan trọng' },
      { icon: '📋', rule: 'Tối giản — không decoration', desc: 'Bỏ emoji, animation rườm rà — tập trung vào nội dung' },
      { icon: '🗂️', rule: 'Thông tin dày đặc', desc: 'Có thể hiển thị nhiều thông tin hơn — học sinh xử lý được' },
      { icon: '📈', rule: 'Progress tracking chi tiết', desc: 'Biểu đồ tiến độ, so sánh kỳ trước, ranking trong lớp' },
      { icon: '🔲', rule: 'Layout 3 cột', desc: 'Header stats / Subject list / Schedule — compact và đầy đủ' },
      { icon: '🎨', rule: 'Màu sắc tiết chế', desc: 'Navy + xám chủ đạo, màu sắc chỉ dùng để phân biệt' },
      { icon: '📱', rule: 'Tương thích mobile', desc: 'Học sinh học trên điện thoại — responsive quan trọng' },
    ],
  },
} as const;

type Config = typeof TOKENS[Level];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ProgressBar({ value, color, height = 8, radius = 99 }: {
  value: number; color: string; height?: number; radius?: number;
}) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: radius, height, overflow: 'hidden' }}>
      <div style={{
        width: `${value}%`, height: '100%', background: color,
        borderRadius: radius, transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

function Stars({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 14, color: i <= count ? color : '#D1D5DB' }}>★</span>
      ))}
    </div>
  );
}

// ─── Moodboard / Color Palette ────────────────────────────────────────────────
function Moodboard({ cfg }: { cfg: Config }) {
  const isDark = cfg.pageBg === TOKENS.thcs.pageBg;
  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12,
      }}>
        {cfg.palette.map((c) => (
          <div key={c.value} style={{
            borderRadius: 12, overflow: 'hidden',
            border: `1px solid ${isDark ? '#2D2D50' : '#E2E8F0'}`,
            background: isDark ? '#1A1A2E' : '#fff',
          }}>
            <div style={{ height: 72, background: c.value }} />
            <div style={{ padding: '10px 12px' }}>
              <div style={{
                fontWeight: 700, fontSize: 12,
                color: isDark ? '#F1F5F9' : '#1E293B',
                marginBottom: 2,
              }}>{c.label}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 11,
                color: isDark ? '#990803' : '#990803',
                marginBottom: 4,
              }}>{c.value}</div>
              <div style={{ fontSize: 11, color: isDark ? '#94A3B8' : '#64748B' }}>{c.usage}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Typography Specimen ──────────────────────────────────────────────────────
function TypographySpec({ cfg }: { cfg: Config }) {
  const isDark = cfg.pageBg === TOKENS.thcs.pageBg;
  const rows = [
    { label: 'Hero / Tiêu đề lớn', size: cfg.heroSize, weight: cfg.fontWeight, sample: 'Chào mừng em học sinh!' },
    { label: 'Section Title', size: cfg.titleSize, weight: cfg.fontWeight, sample: 'Môn học hôm nay' },
    { label: 'Body Text', size: cfg.bodySize, weight: 400, sample: 'Tiến độ học tập của em đang rất tốt. Hãy tiếp tục cố gắng nhé!' },
    { label: 'Label / Caption', size: cfg.labelSize, weight: 500, sample: 'Cập nhật lúc 8:30 sáng · 18/05/2026' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map((r) => (
        <div key={r.label} style={{
          padding: '14px 18px',
          background: isDark ? '#1A1A2E' : '#F8FAFC',
          borderRadius: 10,
          border: `1px solid ${isDark ? '#2D2D50' : '#E2E8F0'}`,
        }}>
          <div style={{ fontSize: 11, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            {r.label} — {r.size}px / {r.weight}
          </div>
          <div style={{
            fontFamily: cfg.fontFamily,
            fontSize: r.size,
            fontWeight: r.weight,
            color: isDark ? '#F1F5F9' : '#0F172A',
            lineHeight: 1.3,
          }}>{r.sample}</div>
        </div>
      ))}
    </div>
  );
}

// ─── UX Guidelines ────────────────────────────────────────────────────────────
function Guidelines({ cfg }: { cfg: Config }) {
  const isDark = cfg.pageBg === TOKENS.thcs.pageBg;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: 12,
    }}>
      {cfg.guidelines.map((g, i) => (
        <div key={i} style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '14px 16px',
          background: isDark ? '#1A1A2E' : '#FFFFFF',
          border: `1px solid ${isDark ? '#2D2D50' : '#E2E8F0'}`,
          borderRadius: 10,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>{g.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: isDark ? '#F1F5F9' : '#1E293B', marginBottom: 4 }}>{g.rule}</div>
            <div style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', lineHeight: 1.5 }}>{g.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MẦM NON DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function MamNonDashboard() {
  const cfg = TOKENS.mamnon;
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ background: cfg.pageBg, borderRadius: cfg.radius, overflow: 'hidden', fontFamily: cfg.fontFamily }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${cfg.primary} 0%, #FF8C42 100%)`,
        padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 700, marginBottom: 4 }}>
            🌞 Thứ Hai, 18 tháng 5
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
            Chào Bé Linh! 👋
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: 700 }}>
            Hôm nay học gì thú vị nhỉ? 🎉
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 20, padding: '12px 20px', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: 36 }}>⭐</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>5 Sao</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>Hôm nay!</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px 24px' }}>
        {/* Subject Grid */}
        <div style={{ fontSize: 22, fontWeight: 900, color: cfg.text, marginBottom: 16 }}>
          📚 Chọn môn học nào!
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24,
        }}>
          {cfg.subjects.map((s) => (
            <button key={s.name} onClick={() => setSelected(s.name)}
              style={{
                background: selected === s.name ? s.color : s.bg,
                border: `3px solid ${selected === s.name ? s.color : 'transparent'}`,
                borderRadius: cfg.radius,
                padding: '18px 8px',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: selected === s.name ? `0 8px 24px ${s.color}55` : '0 2px 8px rgba(0,0,0,0.06)',
                transform: selected === s.name ? 'scale(1.05)' : 'scale(1)',
              }}>
              <span style={{ fontSize: 44 }}>{s.emoji}</span>
              <span style={{
                fontSize: 16, fontWeight: 900,
                color: selected === s.name ? '#fff' : s.color,
              }}>{s.name}</span>
              {selected === s.name && (
                <span style={{
                  background: 'rgba(255,255,255,0.3)',
                  color: '#fff', fontSize: 12, fontWeight: 800,
                  padding: '3px 10px', borderRadius: 99,
                }}>Đang chọn ✓</span>
              )}
            </button>
          ))}
        </div>

        {selected && (
          <div style={{
            background: `linear-gradient(135deg, ${cfg.primary}22 0%, ${cfg.secondary}22 100%)`,
            border: `2px solid ${cfg.primary}44`,
            borderRadius: cfg.radius, padding: '18px 22px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, color: cfg.muted, fontWeight: 700, marginBottom: 4 }}>Em chọn</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: cfg.text }}>{selected} 🎉</div>
            </div>
            <button style={{
              background: cfg.primary, color: '#fff',
              border: 'none', borderRadius: cfg.btnRadius,
              padding: '14px 28px', fontSize: 18, fontWeight: 900,
              cursor: 'pointer', boxShadow: `0 6px 20px ${cfg.primary}55`,
            }}>
              Vào Học! 🚀
            </button>
          </div>
        )}

        {/* Today Schedule */}
        <div style={{ fontSize: 22, fontWeight: 900, color: cfg.text, marginBottom: 14 }}>
          📅 Lịch Hôm Nay
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cfg.schedule.map((block) => (
            <div key={block.time} style={{
              background: '#fff',
              borderRadius: 20, padding: '16px 20px',
              border: `2px solid ${cfg.border}`,
              display: 'flex', gap: 16, alignItems: 'flex-start',
            }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 28 }}>{block.emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: cfg.primary }}>{block.time}</div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: cfg.muted, marginBottom: 8 }}>
                  {block.label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {block.items.map(item => (
                    <span key={item.name} style={{
                      background: item.color + '22',
                      border: `2px solid ${item.color}44`,
                      color: item.color,
                      borderRadius: 14, padding: '5px 14px',
                      fontSize: 14, fontWeight: 800,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      {item.emoji} {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIỂU HỌC DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function TieuHocDashboard() {
  const cfg = TOKENS.tieuhoc;

  return (
    <div style={{ background: cfg.pageBg, borderRadius: cfg.radius, overflow: 'hidden', fontFamily: cfg.fontFamily }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${cfg.primary} 0%, #990803 100%)`,
        padding: '18px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Thứ Hai, 18/05/2026</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Chào Minh An! 👋</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              borderRadius: 14, padding: '10px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22 }}>🏆</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>285</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Điểm XP</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              borderRadius: 14, padding: '10px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22 }}>🔥</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>7</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Ngày liên tiếp</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { icon: '🥇', label: 'Siêu sao Toán', color: '#FCD34D' },
            { icon: '🎯', label: '7 ngày streak', color: '#f59e0b' },
            { icon: '📚', label: 'Đọc 10 bài', color: '#990803' },
          ].map(b => (
            <div key={b.label} style={{
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 99, padding: '4px 12px',
              fontSize: 12, fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {b.icon} {b.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 240px', gap: 18 }}>
        {/* Left: Subjects */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: cfg.text, marginBottom: 12 }}>📚 Môn Học</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {cfg.subjects.map((s) => (
              <div key={s.name} style={{
                background: cfg.card,
                border: `1.5px solid ${cfg.border}`,
                borderRadius: cfg.radius, overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  background: s.bg, borderBottom: `2px solid ${s.color}33`,
                  padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.name}</span>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Stars count={s.stars} color={s.color} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.progress}%</span>
                  </div>
                  <ProgressBar value={s.progress} color={s.color} height={7} />
                  <button style={{
                    width: '100%', marginTop: 10,
                    background: s.color, color: '#fff',
                    border: 'none', borderRadius: 8,
                    padding: '7px 0', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}>
                    Học tiếp →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Schedule + Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Today Schedule */}
          <div style={{ background: cfg.card, borderRadius: cfg.radius, border: `1.5px solid ${cfg.border}`, overflow: 'hidden' }}>
            <div style={{
              background: `${cfg.primary}12`, padding: '10px 14px',
              borderBottom: `1.5px solid ${cfg.border}`,
              fontSize: 14, fontWeight: 800, color: cfg.primary,
            }}>
              📅 Lịch Hôm Nay — Thứ 2
            </div>
            <div style={{ padding: '8px 0' }}>
              {cfg.schedule[0].subjects.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 14px',
                  borderLeft: `3px solid ${i === 0 ? s.color : 'transparent'}`,
                  background: i === 0 ? `${s.color}08` : 'transparent',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: s.color, flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cfg.text }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: cfg.muted }}>Tiết {s.period} · {i === 0 ? '🔴 Đang học' : `${6 + i}:50`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div style={{ background: cfg.card, borderRadius: cfg.radius, border: `1.5px solid ${cfg.border}` }}>
            <div style={{
              padding: '10px 14px',
              borderBottom: `1.5px solid ${cfg.border}`,
              fontSize: 14, fontWeight: 800, color: '#c8a84e',
            }}>
              🏆 Thành Tích Gần Đây
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🥇', label: 'Siêu Sao Toán', desc: 'Làm đúng 20 bài liên tiếp', color: '#c8a84e' },
                { icon: '🔥', label: 'Lửa 7 Ngày', desc: 'Học 7 ngày không nghỉ', color: '#f59e0b' },
                { icon: '📗', label: 'Mọt Sách', desc: 'Đọc xong 10 bài học', color: '#16A34A' },
              ].map(a => (
                <div key={a.label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: cfg.text }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: cfg.muted }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// THCS DASHBOARD (Dark Mode)
// ═══════════════════════════════════════════════════════════════════════════════
function THCSDashboard() {
  const cfg = TOKENS.thcs;

  return (
    <div style={{ background: cfg.pageBg, borderRadius: cfg.radius, overflow: 'hidden', fontFamily: cfg.fontFamily, color: cfg.text }}>
      {/* Header / Profile */}
      <div style={{
        background: `linear-gradient(135deg, #5a0401 0%, ${cfg.primary}88 50%, #5a0401 100%)`,
        padding: '20px 24px',
        borderBottom: `1px solid ${cfg.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `linear-gradient(135deg, ${cfg.primary}, ${cfg.secondary})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
              border: `2px solid ${cfg.primary}88`,
            }}>H</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: cfg.text }}>Trần Quang Hùng</div>
              <div style={{ fontSize: 12, color: cfg.muted }}>Lớp 8A3 · Trường THCS Nguyễn Du</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              background: `${cfg.primary}22`, border: `1px solid ${cfg.primary}44`,
              borderRadius: 8, padding: '8px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: cfg.muted, marginBottom: 2 }}>CẤP ĐỘ</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: cfg.primary }}>Lv.15</div>
            </div>
            <div style={{
              background: `${cfg.secondary}22`, border: `1px solid ${cfg.secondary}44`,
              borderRadius: 8, padding: '8px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: cfg.muted, marginBottom: 2 }}>XP</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: cfg.secondary }}>2,840</div>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: cfg.muted }}>⚡ Tiến độ lên Lv.16</span>
            <span style={{ fontSize: 12, color: cfg.primary, fontWeight: 600 }}>2,840 / 3,000 XP</span>
          </div>
          <div style={{ background: `${cfg.primary}22`, borderRadius: 99, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: '94%', height: '100%',
              background: `linear-gradient(90deg, ${cfg.primary}, ${cfg.secondary})`,
              borderRadius: 99,
            }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left: Subjects + Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Subject Cards */}
          <div style={{ fontSize: 14, fontWeight: 700, color: cfg.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
            🎯 Môn Học
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {cfg.subjects.map((s) => (
              <div key={s.name} style={{
                background: cfg.card,
                border: `1px solid ${cfg.border}`,
                borderRadius: cfg.radius, overflow: 'hidden',
                cursor: 'pointer',
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${s.grad[0]}, ${s.grad[1]})`,
                  padding: '10px 12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>{s.tag}</span>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 99,
                  }}>🔥 {s.streak} ngày</span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cfg.text, marginBottom: 6 }}>{s.name}</div>
                  <ProgressBar value={s.progress} color={s.color} height={5} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: cfg.muted }}>⚡ {s.xp} XP</span>
                    <span style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>{s.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard + Missions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Leaderboard */}
          <div style={{
            background: cfg.card,
            border: `1px solid ${cfg.border}`,
            borderRadius: cfg.radius, overflow: 'hidden',
          }}>
            <div style={{
              padding: '10px 14px',
              borderBottom: `1px solid ${cfg.border}`,
              fontSize: 13, fontWeight: 700, color: '#F59E0B',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>🏆 Bảng Xếp Hạng Lớp</div>
            <div style={{ padding: '8px 0' }}>
              {[
                { rank: 1, name: 'Bùi Thị Mai', xp: 3100, medal: '🥇' },
                { rank: 2, name: 'Nguyễn Hùng (Bạn)', xp: 2840, medal: '🥈', me: true },
                { rank: 3, name: 'Trần Anh Tuấn', xp: 2720, medal: '🥉' },
                { rank: 4, name: 'Lê Minh Khoa', xp: 2580, medal: '' },
                { rank: 5, name: 'Phạm Thu Hà', xp: 2430, medal: '' },
              ].map(r => (
                <div key={r.rank} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 14px',
                  background: r.me ? `${cfg.primary}18` : 'transparent',
                  borderLeft: r.me ? `3px solid ${cfg.primary}` : '3px solid transparent',
                }}>
                  <span style={{ fontSize: r.medal ? 18 : 13, minWidth: 24 }}>
                    {r.medal || `${r.rank}.`}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: r.me ? 700 : 400, color: r.me ? cfg.primary : cfg.text }}>
                    {r.name}
                  </span>
                  <span style={{ fontSize: 12, color: cfg.muted, fontWeight: 600 }}>⚡{r.xp.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Missions */}
          <div style={{
            background: cfg.card,
            border: `1px solid ${cfg.border}`,
            borderRadius: cfg.radius, overflow: 'hidden',
          }}>
            <div style={{
              padding: '10px 14px',
              borderBottom: `1px solid ${cfg.border}`,
              fontSize: 13, fontWeight: 700, color: cfg.green,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>🎯 Nhiệm Vụ Hôm Nay</div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { done: true, text: 'Xem video: Phương trình bậc hai', xp: 50, color: cfg.primary },
                { done: false, text: 'Làm 10 bài Toán tự luyện', xp: 80, color: cfg.primary },
                { done: false, text: 'Kiểm tra 15 phút Hóa học', xp: 120, color: cfg.green },
                { done: false, text: 'Tham gia buổi học Tiếng Anh', xp: 60, color: '#990803' },
              ].map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  opacity: m.done ? 0.5 : 1,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `2px solid ${m.done ? cfg.green : cfg.border}`,
                    background: m.done ? cfg.green : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {m.done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 12, color: cfg.text,
                    textDecoration: m.done ? 'line-through' : 'none',
                  }}>{m.text}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: m.color,
                    background: `${m.color}18`, padding: '2px 7px', borderRadius: 99,
                  }}>+{m.xp}XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Today */}
          <div style={{
            background: cfg.card, border: `1px solid ${cfg.border}`,
            borderRadius: cfg.radius, overflow: 'hidden',
          }}>
            <div style={{
              padding: '10px 14px', borderBottom: `1px solid ${cfg.border}`,
              fontSize: 13, fontWeight: 700, color: cfg.secondary,
            }}>📅 Lịch Hôm Nay</div>
            <div style={{ padding: '8px 0' }}>
              {cfg.schedule[0].subjects.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 14px',
                  borderLeft: i === 0 ? `3px solid ${s.color}` : '3px solid transparent',
                  background: i === 0 ? `${s.color}10` : 'transparent',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: cfg.text }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: cfg.muted }}>{s.teacher} · {s.room}</div>
                  </div>
                  {i === 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#d4183d',
                      background: '#d4183d20', padding: '2px 7px', borderRadius: 99,
                    }}>LIVE</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// THPT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function THPTDashboard() {
  const cfg = TOKENS.thpt;

  return (
    <div style={{ background: cfg.pageBg, borderRadius: cfg.radius, overflow: 'hidden', fontFamily: cfg.fontFamily, color: cfg.text }}>
      {/* Header */}
      <div style={{
        background: cfg.card,
        borderBottom: `1px solid ${cfg.border}`,
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: cfg.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
            Thứ Hai, 18 tháng 5 năm 2026
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: cfg.text }}>
            Nguyễn Thị Mai · Lớp 12A1
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {[
            { label: 'GPA Kỳ Này', value: '8.7', trend: '↑0.3', color: cfg.green },
            { label: 'Xếp Hạng', value: '5/42', trend: 'Top 12%', color: cfg.primary },
            { label: 'Chuyên Cần', value: '98%', trend: '0 vắng', color: cfg.secondary },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: cfg.muted, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.trend}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: 16 }}>
        {/* Subjects Progress */}
        <div>
          <div style={{
            fontSize: 12, fontWeight: 600, color: cfg.muted,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
          }}>Tiến Độ Học Tập</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cfg.subjects.map((s) => (
              <div key={s.name} style={{
                background: cfg.card,
                border: `1px solid ${cfg.border}`,
                borderRadius: cfg.radius, padding: '12px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 6, height: 22, borderRadius: 3,
                      background: s.color, flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: cfg.text }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: cfg.muted }}>Thi ngày: {s.nextExam}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.grade}</div>
                    <div style={{ fontSize: 11, color: cfg.muted }}>{s.progress}%</div>
                  </div>
                </div>
                <ProgressBar value={s.progress} color={s.color} height={5} />
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <div style={{
            fontSize: 12, fontWeight: 600, color: cfg.muted,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
          }}>Thời Khóa Biểu Tuần Này</div>
          <div style={{
            background: cfg.card, border: `1px solid ${cfg.border}`,
            borderRadius: cfg.radius, overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '70px 1fr 60px 60px',
              padding: '8px 14px',
              background: '#F1F5F9',
              borderBottom: `1px solid ${cfg.border}`,
              fontSize: 11, fontWeight: 600, color: cfg.muted,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              <span>Ngày</span><span>Môn Học</span><span>GV</span><span>Phòng</span>
            </div>
            {cfg.schedule.flatMap((day) =>
              day.periods.map((p, pi) => (
                <div key={`${day.day}-${pi}`} style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr 60px 60px',
                  padding: '7px 14px',
                  borderBottom: `1px solid ${cfg.border}`,
                  alignItems: 'center',
                  background: day.day === 'Thứ 2' && pi === 0 ? `${cfg.primary}08` : 'transparent',
                }}>
                  <span style={{ fontSize: 12, color: cfg.muted }}>
                    {pi === 0 ? day.day : ''}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: cfg.text }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: cfg.muted }}>{p.time}</div>
                  </div>
                  <span style={{ fontSize: 11, color: cfg.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.teacher.split(' ').slice(-1)[0]}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: cfg.primary,
                    background: `${cfg.primary}12`, padding: '2px 6px', borderRadius: 4,
                    textAlign: 'center',
                  }}>{p.room}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Exams + Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 600, color: cfg.muted,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
            }}>Kỳ Thi Sắp Tới</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { subject: 'Toán 15\'', date: '22/05', days: 4, color: cfg.primary },
                { subject: 'Vật Lý 1t', date: '24/05', days: 6, color: cfg.secondary },
                { subject: 'Hóa 15\'', date: '27/05', days: 9, color: '#2563eb' },
                { subject: 'Thi HK2', date: '10/06', days: 23, color: cfg.yellow },
              ].map(e => (
                <div key={e.subject} style={{
                  background: cfg.card, border: `1px solid ${cfg.border}`,
                  borderRadius: cfg.radius, padding: '10px 12px',
                  borderLeft: `3px solid ${e.color}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: cfg.text }}>{e.subject}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: e.days <= 5 ? cfg.red : e.days <= 10 ? cfg.yellow : cfg.green,
                    }}>{e.days}d</span>
                  </div>
                  <div style={{ fontSize: 11, color: cfg.muted }}>{e.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Time */}
          <div style={{
            background: cfg.card, border: `1px solid ${cfg.border}`,
            borderRadius: cfg.radius, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: cfg.muted, marginBottom: 10 }}>
              ⏱ Giờ Học Tuần Này
            </div>
            {[
              { day: 'T2', hours: 4.5 }, { day: 'T3', hours: 3.0 },
              { day: 'T4', hours: 5.0 }, { day: 'T5', hours: 2.5 },
              { day: 'T6', hours: 3.5 },
            ].map(d => (
              <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: cfg.muted, width: 20 }}>{d.day}</span>
                <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(d.hours / 6) * 100}%`, height: '100%',
                    background: cfg.primary, borderRadius: 4,
                  }} />
                </div>
                <span style={{ fontSize: 11, color: cfg.muted, width: 28, textAlign: 'right' }}>{d.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULE SHOWCASE — Tiểu Học & THCS Weekly
// ═══════════════════════════════════════════════════════════════════════════════
function TieuHocSchedule() {
  const cfg = TOKENS.tieuhoc;
  const times = ['7:00', '7:50', '8:40', '9:30', '10:20'];
  return (
    <div style={{ background: cfg.card, border: `1.5px solid ${cfg.border}`, borderRadius: cfg.radius, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)',
        background: `${cfg.primary}12`, borderBottom: `2px solid ${cfg.border}`,
      }}>
        <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: cfg.muted }}>Tiết</div>
        {cfg.schedule.map(d => (
          <div key={d.day} style={{ padding: '10px 8px', fontSize: 13, fontWeight: 800, color: cfg.primary, textAlign: 'center' }}>
            {d.day}
          </div>
        ))}
      </div>

      {[0,1,2,3,4].map(pi => (
        <div key={pi} style={{
          display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)',
          borderBottom: `1px solid ${cfg.border}`,
          background: pi % 2 === 0 ? '#fff' : '#F8FBFF',
        }}>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: cfg.primary }}>Tiết {pi+1}</div>
            <div style={{ fontSize: 11, color: cfg.muted }}>{times[pi]}</div>
          </div>
          {cfg.schedule.map(d => {
            const s = d.subjects[pi];
            return (
              <div key={d.day} style={{
                padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s ? (
                  <div style={{
                    background: s.color + '18',
                    border: `1.5px solid ${s.color}44`,
                    borderRadius: 8, padding: '5px 10px',
                    textAlign: 'center', width: '100%',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.name}</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function THCSSchedule() {
  const cfg = TOKENS.thcs;
  return (
    <div style={{ background: cfg.card, border: `1px solid ${cfg.border}`, borderRadius: cfg.radius, overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        borderBottom: `1px solid ${cfg.border}`,
      }}>
        {cfg.schedule.map(d => (
          <div key={d.day} style={{
            padding: '10px 14px',
            borderRight: `1px solid ${cfg.border}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: cfg.primary, marginBottom: 10 }}>{d.day}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {d.subjects.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px',
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}30`,
                  borderRadius: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: cfg.text }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: cfg.muted }}>{s.teacher} · {s.room}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, isDark, children }: {
  title: string; subtitle?: string; isDark: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{
          fontSize: 18, fontWeight: 700, margin: 0,
          color: isDark ? '#F1F5F9' : '#1E293B',
        }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', margin: '4px 0 0' }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Level Tab Button ─────────────────────────────────────────────────────────
function LevelTab({ level, current, onClick }: { level: Level; current: Level; onClick: () => void }) {
  const cfg = TOKENS[level];
  const active = level === current;
  const colors: Record<Level, string> = {
    mamnon: '#FF6B35', tieuhoc: '#990803', thcs: '#990803', thpt: '#7a0602',
  };

  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '12px 20px',
      background: active ? colors[level] : 'transparent',
      border: `2px solid ${active ? colors[level] : 'rgba(0,0,0,0.1)'}`,
      borderRadius: 14, cursor: 'pointer',
      transition: 'all 0.2s',
      flex: 1,
    }}>
      <span style={{ fontSize: 24 }}>{cfg.emoji}</span>
      <span style={{
        fontSize: 14, fontWeight: 800,
        color: active ? '#fff' : '#1E293B',
      }}>{cfg.label}</span>
      <span style={{
        fontSize: 12,
        color: active ? 'rgba(255,255,255,0.85)' : '#64748B',
      }}>{cfg.age}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function StudentLMSDesign() {
  const [level, setLevel] = useState<Level>('mamnon');
  const cfg = TOKENS[level];
  const isDark = level === 'thcs';

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: isDark ? '#0A0A15' : '#F1F5F9',
    padding: '24px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: '0 auto',
  };

  const sectionBg: React.CSSProperties = {
    background: isDark ? '#0F0F1A' : '#FFFFFF',
    border: `1px solid ${isDark ? '#1E1E3A' : '#E2E8F0'}`,
    borderRadius: 16, padding: '24px',
    marginBottom: 24,
  };

  const levelColors: Record<Level, string> = {
    mamnon: '#FF6B35', tieuhoc: '#990803', thcs: '#990803', thpt: '#7a0602',
  };
  const accent = levelColors[level];

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: accent, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20,
            }}>🎓</div>
            <div>
              <h1 style={{
                fontSize: 24, fontWeight: 800, margin: 0,
                color: isDark ? '#F1F5F9' : '#0F172A',
              }}>
                LMS Student UI Design System
              </h1>
              <p style={{ fontSize: 14, color: isDark ? '#94A3B8' : '#64748B', margin: '2px 0 0' }}>
                4 cấp học · Tâm lý lứa tuổi · Moodboard + Dashboard + Component
              </p>
            </div>
          </div>
        </div>

        {/* ── Level Selector ── */}
        <div style={{ ...sectionBg, padding: '16px' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
          }}>Chọn cấp học để xem thiết kế</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['mamnon', 'tieuhoc', 'thcs', 'thpt'] as Level[]).map(l => (
              <LevelTab key={l} level={l} current={level} onClick={() => setLevel(l)} />
            ))}
          </div>
        </div>

        {/* ── Level Identity Banner ── */}
        <div style={{
          ...sectionBg, padding: 0, overflow: 'hidden',
          background: isDark
            ? `linear-gradient(135deg, #5a0401 0%, ${accent}55 50%, #5a0401 100%)`
            : `linear-gradient(135deg, ${accent}22 0%, ${accent}08 100%)`,
          border: `2px solid ${accent}44`,
        }}>
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 44, marginBottom: 8 }}>{cfg.emoji}</div>
                <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0, color: isDark ? '#F1F5F9' : accent }}>
                  {cfg.label}
                </h2>
                <div style={{ fontSize: 16, color: isDark ? '#94A3B8' : `${accent}BB`, marginTop: 4, fontWeight: 600 }}>
                  {cfg.age}
                </div>
                <div style={{
                  marginTop: 12, display: 'inline-block',
                  background: isDark ? `${accent}33` : `${accent}18`,
                  border: `1px solid ${accent}55`,
                  borderRadius: 99, padding: '6px 18px',
                  fontSize: 14, fontWeight: 700,
                  color: isDark ? '#F1F5F9' : accent,
                }}>
                  {cfg.tagline}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }}>
                  <b style={{ color: isDark ? '#F1F5F9' : cfg.text }}>Font:</b> {cfg.fontFamily.split(',')[0].replace(/'/g, '')}
                </div>
                <div style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }}>
                  <b style={{ color: isDark ? '#F1F5F9' : cfg.text }}>Border Radius:</b> {cfg.radius}px
                </div>
                <div style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }}>
                  <b style={{ color: isDark ? '#F1F5F9' : cfg.text }}>Base Font Size:</b> {cfg.bodySize}px
                </div>
                <div style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }}>
                  <b style={{ color: isDark ? '#F1F5F9' : cfg.text }}>Font Weight:</b> {cfg.fontWeight}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Moodboard & Color Palette ── */}
        <div style={sectionBg}>
          <Section title="🎨 Moodboard & Bảng Màu" subtitle="Tông màu chủ đạo theo tâm lý lứa tuổi" isDark={isDark}>
            <Moodboard cfg={cfg} />
          </Section>
        </div>

        {/* ── Typography ── */}
        <div style={sectionBg}>
          <Section title="🔤 Typography Specimen" subtitle="Scale chữ phù hợp khả năng đọc của từng lứa tuổi" isDark={isDark}>
            <TypographySpec cfg={cfg} />
          </Section>
        </div>

        {/* ── UX Guidelines ── */}
        <div style={sectionBg}>
          <Section title="📐 UX Guidelines" subtitle="Nguyên tắc thiết kế theo tâm lý học lứa tuổi" isDark={isDark}>
            <Guidelines cfg={cfg} />
          </Section>
        </div>

        {/* ── Dashboard Preview ── */}
        <div style={sectionBg}>
          <Section title="🖥️ Dashboard Preview" subtitle="Giao diện trang chủ thực tế cho học sinh" isDark={isDark}>
            {level === 'mamnon' && <MamNonDashboard />}
            {level === 'tieuhoc' && <TieuHocDashboard />}
            {level === 'thcs' && <THCSDashboard />}
            {level === 'thpt' && <THPTDashboard />}
          </Section>
        </div>

        {/* ── Schedule ── */}
        {(level === 'tieuhoc' || level === 'thcs') && (
          <div style={sectionBg}>
            <Section
              title="📅 Ví Dụ Lịch Học"
              subtitle={level === 'tieuhoc' ? 'Thời khóa biểu tuần — màu sắc theo môn' : 'Lịch học dark mode theo ngày'}
              isDark={isDark}
            >
              {level === 'tieuhoc' ? <TieuHocSchedule /> : <THCSSchedule />}
            </Section>
          </div>
        )}

        {/* ── Comparison Table ── */}
        <div style={sectionBg}>
          <Section title="📊 Bảng So Sánh 4 Cấp Học" isDark={isDark}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: isDark ? '#1A1A2E' : '#F8FAFC' }}>
                    {['Tiêu chí', 'Mầm Non 🌈', 'Tiểu Học ⭐', 'THCS 🚀', 'THPT 🎓'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left',
                        fontSize: 12, fontWeight: 700,
                        color: isDark ? '#94A3B8' : '#64748B',
                        borderBottom: `2px solid ${isDark ? '#2D2D50' : '#E2E8F0'}`,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Màu sắc', 'Cam, Vàng, Xanh, Hồng', 'Xanh dương, Cam, Xanh lá', 'Tím, Cyan, Emerald (dark)', 'Navy, Xanh sáng, Slate'],
                    ['Border Radius', '28px — rất tròn', '16px — tròn', '12px — bo nhẹ', '8px — vuông vức'],
                    ['Font size (body)', '20px', '15px', '14px', '14px'],
                    ['Font weight', '800 (Extra Bold)', '700 (Bold)', '600 (Semi Bold)', '500 (Medium)'],
                    ['Gamification', '⭐ Sao, Nhãn dán', '🏆 XP, Badge, Streak', '⚡ Level, Leaderboard', '📊 GPA, Deadline'],
                    ['Mật độ thông tin', '≤3 mục / màn hình', '4-6 card môn học', 'Nhiều — 2 cột + feed', 'Cao — 3 cột + bảng'],
                    ['Animation', 'Bounce, Wobble, Confetti', 'Stars bay, Slide', 'Smooth, Fade, Glow', 'Subtle, Minimal'],
                    ['Theme', 'Light — kem ấm', 'Light — xanh nhạt', 'Dark mode ưu tiên', 'Light — trắng sạch'],
                    ['Navigation', 'Bottom tab 3 mục', 'Sidebar + Bottom nav', 'Sidebar + Feed', 'Sidebar compact'],
                    ['Schedule view', 'Block buổi sáng/chiều', 'Grid 5 ngày × 5 tiết', 'Card ngày có chi tiết GV', 'Bảng đầy đủ + Phòng'],
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : (isDark ? '#0D0D1F' : '#FAFBFC') }}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{
                          padding: '9px 14px',
                          color: ci === 0 ? (isDark ? '#94A3B8' : '#64748B') : (isDark ? '#F1F5F9' : '#1E293B'),
                          fontWeight: ci === 0 ? 600 : 400,
                          borderBottom: `1px solid ${isDark ? '#1E1E3A' : '#F1F5F9'}`,
                          fontSize: 12,
                        }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '16px 0', color: isDark ? '#475569' : '#94A3B8', fontSize: 12 }}>
          Geleximco STEM Platform · Student LMS Design System · 4 cấp học · 2026
        </div>
      </div>
    </div>
  );
}

export default StudentLMSDesign;
