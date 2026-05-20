// Public layer mock data types
// Geleximco STEM Platform V1

export type Tier = "minimum" | "basic" | "advanced";
export type GradeLevel = "MN" | "TH" | "THCS" | "THPT" | "LC" | "THPT_Nghe";
export type Program = "CT1" | "CT2" | "CT3" | "CT4" | "CT5";

export interface Stat {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
}

export interface SolutionTier {
  id: Tier;
  name: string;
  tagline: string;
  description: string;
  suitableFor: GradeLevel[];
  programsSupported: Program[];
  highlights: string[];
  bomCategories: string[];
  heroImage?: string;
  galleryImages?: string[];
}

export interface ProgramInfo {
  id: Program;
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  dimension: string; // "Môn × Bậc học" etc.
  schedulingMode: string; // "Chính khóa" / "Buổi 2" / "CLB"
  teacherType: string;
  suitableGrades: GradeLevel[];
  sgkMapping?: boolean;
  videoUrl?: string;
  sampleLessons?: string[];
  materialTypes?: string[];
}

export interface Partner {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  tagline: string;
  description: string;
  role: string;
  contributions: string[];
  website?: string;
  contactEmail?: string;
  schoolsServed?: number;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: number;
  thumbnail: string;
  featured?: boolean;
  body?: string; // markdown
  tags?: string[];
}

export interface EventItem {
  id: string;
  title: string;
  type: "Hội thảo" | "Tập huấn" | "Ngày hội STEM" | "Webinar";
  startDate: string;
  endDate?: string;
  location: string;
  online: boolean;
  registerUrl?: string;
  thumbnail?: string;
  description: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful?: number;
}

export interface KBArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  lastUpdated: string;
  tags?: string[];
}

export interface DownloadItem {
  id: string;
  title: string;
  description: string;
  category: string;
  fileType: "PDF" | "DOCX" | "XLSX" | "PPTX" | "ZIP";
  fileSize: string;
  url: string;
  updatedAt: string;
  targetAudience?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  school: string;
  avatarUrl?: string;
  schoolLogoUrl?: string;
}

export interface CmsContentBlock {
  heading?: string;
  subheading?: string;
  body?: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
}
