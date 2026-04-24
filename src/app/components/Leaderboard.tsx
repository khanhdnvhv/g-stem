import { useState } from "react";
import { Trophy, Medal, Star, TrendingUp, Clock, Award, Flame, ChevronUp, ChevronDown, Minus, Crown, Zap, Target, Users } from "lucide-react";
import { useAuth } from "./AuthContext";

interface LeaderboardEntry {
  rank: number;
  prevRank: number;
  name: string;
  subsidiary: string;
  department: string;
  avatar: string;
  initials: string;
  points: number;
  courses: number;
  hours: number;
  certificates: number;
  streak: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, prevRank: 1, name: "Hoàng Thị Lan", subsidiary: "Tập đoàn Geleximco", department: "Ban Pháp chế & Tuân thủ", avatar: "", initials: "HL", points: 4850, courses: 12, hours: 96, certificates: 5, streak: 45 },
  { rank: 2, prevRank: 4, name: "Nguyễn Văn Minh", subsidiary: "Tập đoàn Geleximco", department: "Ban Giám đốc Tập đoàn", avatar: "", initials: "NM", points: 4620, courses: 11, hours: 88, certificates: 4, streak: 32 },
  { rank: 3, prevRank: 2, name: "Đỗ Minh Châu", subsidiary: "Tập đoàn Geleximco", department: "Ban CNTT & Chuyển đổi số", avatar: "", initials: "MC", points: 4510, courses: 10, hours: 82, certificates: 4, streak: 28 },
  { rank: 4, prevRank: 3, name: "Trần Thị Hương", subsidiary: "Tập đoàn Geleximco", department: "Ban Nhân sự Tập đoàn", avatar: "", initials: "TH", points: 4380, courses: 10, hours: 78, certificates: 3, streak: 21 },
  { rank: 5, prevRank: 6, name: "Phạm Quốc Bảo", subsidiary: "Nhiệt điện Thăng Long", department: "Ban Vận hành Nhà máy Điện", avatar: "", initials: "PB", points: 4150, courses: 9, hours: 75, certificates: 4, streak: 18 },
  { rank: 6, prevRank: 5, name: "Lê Văn Hải", subsidiary: "Khoáng sản Geleximco", department: "Ban An toàn Mỏ & Lao động", avatar: "", initials: "LH", points: 4020, courses: 9, hours: 72, certificates: 5, streak: 15 },
  { rank: 7, prevRank: 9, name: "Nguyễn Thanh Tùng", subsidiary: "Chứng khoán An Bình (ABS)", department: "Khối Quản trị Rủi ro", avatar: "", initials: "NT", points: 3890, courses: 8, hours: 68, certificates: 3, streak: 22 },
  { rank: 8, prevRank: 7, name: "Vũ Đức Thắng", subsidiary: "KCN Quang Minh", department: "Ban Kỹ thuật - Vận hành", avatar: "", initials: "VT", points: 3750, courses: 8, hours: 65, certificates: 3, streak: 12 },
  { rank: 9, prevRank: 10, name: "Đào Mạnh Kháng", subsidiary: "Ngân hàng TMCP An Bình (ABBank)", department: "Khối Ngân hàng Doanh nghiệp", avatar: "", initials: "DK", points: 3680, courses: 8, hours: 62, certificates: 2, streak: 19 },
  { rank: 10, prevRank: 8, name: "Ngô Thị Mai", subsidiary: "BĐS Geleximco - KĐT Lê Trọng Tấn", department: "Ban Kinh doanh BĐS", avatar: "", initials: "NM", points: 3520, courses: 7, hours: 58, certificates: 2, streak: 10 },
  { rank: 11, prevRank: 12, name: "Lê Hoàng Nam", subsidiary: "Ngân hàng TMCP An Bình (ABBank)", department: "Khối Ngân hàng Bán lẻ", avatar: "", initials: "LN", points: 3410, courses: 7, hours: 55, certificates: 2, streak: 7 },
  { rank: 12, prevRank: 11, name: "Trần Minh Đức", subsidiary: "Xi măng Thăng Long", department: "Ban Kỹ thuật - Vận hành", avatar: "", initials: "TD", points: 3280, courses: 7, hours: 52, certificates: 3, streak: 14 },
];

export function Leaderboard() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "quarter" | "year">("quarter");

  const myRank = mockLeaderboard.find((e) => e.initials === user?.initials);

  const getRankChange = (curr: number, prev: number) => {
    if (curr < prev) return { icon: <ChevronUp className="w-3.5 h-3.5 text-green-500" />, text: `+${prev - curr}`, color: "text-green-500" };
    if (curr > prev) return { icon: <ChevronDown className="w-3.5 h-3.5 text-red-400" />, text: `-${curr - prev}`, color: "text-red-400" };
    return { icon: <Minus className="w-3.5 h-3.5 text-gray-300" />, text: "—", color: "text-gray-400" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>Bảng xếp hạng</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
            Xếp hạng học viên toàn Tập đoàn Geleximco — 14 đơn vị, 6,610 nhân sự
          </p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {([["week", "Tuần"], ["month", "Tháng"], ["quarter", "Quý"], ["year", "Năm"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTimeFilter(k)} className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${timeFilter === k ? "bg-card shadow-sm text-[#990803]" : "text-muted-foreground hover:text-foreground"}`} style={{ fontSize: "12px", fontWeight: 500 }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 0, 2].map((idx) => {
          const entry = mockLeaderboard[idx];
          if (!entry) return null;
          const isFirst = idx === 0;
          return (
            <div key={entry.rank} className={`bg-card rounded-xl border p-5 text-center ${isFirst ? "border-[#c8a84e] shadow-md relative -mt-2" : "border-border"}`}>
              {isFirst && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Crown className="w-7 h-7 text-[#c8a84e]" /></div>}
              <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white mb-3 ${isFirst ? "ring-3 ring-[#c8a84e]/30" : ""}`} style={{ fontSize: "16px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}>
                {entry.initials}
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {entry.rank === 1 && <span style={{ fontSize: "18px" }}>🥇</span>}
                {entry.rank === 2 && <span style={{ fontSize: "18px" }}>🥈</span>}
                {entry.rank === 3 && <span style={{ fontSize: "18px" }}>🥉</span>}
              </div>
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{entry.name}</h3>
              <p className="text-muted-foreground mb-2" style={{ fontSize: "11px" }}>{entry.subsidiary.replace("Tập đoàn Geleximco", "VP Tập đoàn").replace("Ngân hàng TMCP An Bình (ABBank)", "ABBank").replace("BĐS Geleximco - ", "")}</p>
              <div className="flex items-center justify-center gap-1 mb-3">
                <Zap className="w-4 h-4 text-[#c8a84e]" />
                <span className="text-[#c8a84e]" style={{ fontSize: "20px", fontWeight: 700 }}>{entry.points.toLocaleString()}</span>
                <span className="text-gray-400" style={{ fontSize: "11px" }}>XP</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{entry.courses}</p><p className="text-muted-foreground" style={{ fontSize: "10px" }}>Khóa</p></div>
                <div><p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{entry.hours}h</p><p className="text-muted-foreground" style={{ fontSize: "10px" }}>Giờ học</p></div>
                <div className="flex flex-col items-center"><div className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" /><span className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{entry.streak}</span></div><p className="text-muted-foreground" style={{ fontSize: "10px" }}>Streak</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* My rank highlight */}
      {myRank && (
        <div className="bg-[#990803]/5 border border-[#990803]/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "13px", fontWeight: 700 }}>#{myRank.rank}</div>
          <div className="flex-1">
            <p className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 600 }}>Vị trí của bạn: #{myRank.rank} — {myRank.points.toLocaleString()} XP</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{myRank.courses} khóa • {myRank.hours}h học • {myRank.certificates} chứng chỉ • Streak {myRank.streak} ngày</p>
          </div>
          <Target className="w-5 h-5 text-[#990803]" />
        </div>
      )}

      {/* Full Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary">
                <th className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Hạng</th>
                <th className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Học viên</th>
                <th className="px-4 py-3 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Đơn vị</th>
                <th className="px-4 py-3 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>XP</th>
                <th className="px-4 py-3 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Khóa</th>
                <th className="px-4 py-3 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Giờ</th>
                <th className="px-4 py-3 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>CC</th>
                <th className="px-4 py-3 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Streak</th>
                <th className="px-4 py-3 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Thay đổi</th>
              </tr>
            </thead>
            <tbody>
              {mockLeaderboard.map((entry) => {
                const change = getRankChange(entry.rank, entry.prevRank);
                const isMe = entry.initials === user?.initials;
                return (
                  <tr key={entry.rank} className={`border-t border-border/50 ${isMe ? "bg-[#990803]/5" : "hover:bg-secondary/50"}`}>
                    <td className="px-4 py-3">
                      <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center ${entry.rank <= 3 ? "bg-[#c8a84e]/10 text-[#c8a84e]" : "bg-secondary text-muted-foreground"}`} style={{ fontSize: "12px", fontWeight: 700 }}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] flex items-center justify-center text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{entry.initials}</div>
                        <div>
                          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: isMe ? 700 : 500 }}>{entry.name} {isMe && <span className="text-[#990803]">(Bạn)</span>}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{entry.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{entry.subsidiary.replace("Tập đoàn Geleximco", "VP Tập đoàn").replace("Ngân hàng TMCP An Bình (ABBank)", "ABBank").replace("Chứng khoán An Bình (ABS)", "CK An Bình").replace("BĐS Geleximco - ", "")}</td>
                    <td className="px-4 py-3 text-center"><span className="text-[#c8a84e]" style={{ fontSize: "13px", fontWeight: 700 }}>{entry.points.toLocaleString()}</span></td>
                    <td className="px-4 py-3 text-center text-foreground/70" style={{ fontSize: "13px" }}>{entry.courses}</td>
                    <td className="px-4 py-3 text-center text-foreground/70" style={{ fontSize: "13px" }}>{entry.hours}h</td>
                    <td className="px-4 py-3 text-center text-foreground/70" style={{ fontSize: "13px" }}>{entry.certificates}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 500 }}>{entry.streak}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`flex items-center justify-center gap-0.5 ${change.color}`} style={{ fontSize: "11px", fontWeight: 500 }}>
                        {change.icon} {change.text}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}