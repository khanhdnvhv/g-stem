import { Link } from "react-router";
import { Calendar, Clock } from "lucide-react";
import type { NewsArticle } from "../mock-data";
import { cn } from "../../ui/utils";

interface NewsCardProps {
  article: NewsArticle;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

export function NewsCard({ article, variant = "default", className }: NewsCardProps) {
  const date = new Date(article.publishedAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (variant === "featured") {
    return (
      <Link
        to={`/news/${article.slug}`}
        className={cn(
          "group grid md:grid-cols-5 gap-6 rounded-xl overflow-hidden hover:bg-secondary/50 transition-colors p-4",
          className
        )}
      >
        <div className="md:col-span-3 aspect-video md:aspect-auto rounded-lg overflow-hidden bg-secondary">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="md:col-span-2 flex flex-col justify-center">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            {article.category}
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
            {article.title}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" /> {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {article.readTime} phút đọc
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/news/${article.slug}`}
      className={cn(
        "group flex flex-col rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all",
        className
      )}
    >
      <div className="aspect-video overflow-hidden bg-secondary">
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
          {article.category}
        </span>
        <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        {variant === "default" && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" /> {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> {article.readTime} phút
          </span>
        </div>
      </div>
    </Link>
  );
}
