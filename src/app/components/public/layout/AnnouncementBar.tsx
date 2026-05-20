import { X, Megaphone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface AnnouncementBarProps {
  message?: string;
  linkLabel?: string;
  linkTo?: string;
}

export function AnnouncementBar({
  message = "Đăng ký nhận tư vấn miễn phí phòng STEM cho năm học 2026-2027",
  linkLabel = "Tìm hiểu ngay",
  linkTo = "/contact",
}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Megaphone className="size-4 shrink-0" />
          <span className="truncate">
            {message}{" "}
            <Link
              to={linkTo}
              className="underline underline-offset-2 hover:text-accent transition-colors ml-1"
            >
              {linkLabel} →
            </Link>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
          aria-label="Đóng thông báo"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
