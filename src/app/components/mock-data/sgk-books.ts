/* ================================================================ */
/*  SGK BOOKS — Danh mục SGK Bộ GD&ĐT (mock subset)                  */
/*  Phục vụ SGK picker trong CT1/CT2 metadata                        */
/* ================================================================ */

export type SGKPublisher = "Cánh Diều" | "Kết Nối Tri Thức" | "Chân Trời Sáng Tạo";

export interface SGKLesson {
  id: string;
  name: string;
}

export interface SGKChapter {
  id: string;
  name: string;
  lessons: SGKLesson[];
}

export interface SGKBook {
  id: string;
  grade: string;        // VD "THCS 8", "Tiểu học 5"
  subject: string;      // VD "Toán", "Vật lý"
  publisher: SGKPublisher;
  chapters: SGKChapter[];
}

export const SGK_BOOKS: SGKBook[] = [
  /* ============ TOÁN ============ */
  {
    id: "TOAN-8-KNTT",
    grade: "THCS 8",
    subject: "Toán",
    publisher: "Kết Nối Tri Thức",
    chapters: [
      { id: "C1", name: "Chương 1: Đa thức", lessons: [
        { id: "L1.1", name: "Bài 1: Đơn thức và đa thức nhiều biến" },
        { id: "L1.2", name: "Bài 2: Các phép toán với đa thức" },
        { id: "L1.3", name: "Bài 3: Hằng đẳng thức đáng nhớ" },
      ]},
      { id: "C2", name: "Chương 2: Phân thức đại số", lessons: [
        { id: "L2.1", name: "Bài 4: Phân thức đại số" },
        { id: "L2.2", name: "Bài 5: Phép cộng và phép trừ phân thức" },
      ]},
      { id: "C3", name: "Chương 3: Tứ giác", lessons: [
        { id: "L3.1", name: "Bài 10: Tứ giác" },
        { id: "L3.2", name: "Bài 11: Hình thang cân" },
      ]},
    ],
  },
  {
    id: "TOAN-7-CD",
    grade: "THCS 7",
    subject: "Toán",
    publisher: "Cánh Diều",
    chapters: [
      { id: "C1", name: "Chương 1: Số hữu tỉ", lessons: [
        { id: "L1.1", name: "Bài 1: Tập hợp Q các số hữu tỉ" },
        { id: "L1.2", name: "Bài 2: Cộng, trừ, nhân, chia số hữu tỉ" },
      ]},
      { id: "C2", name: "Chương 2: Số thực", lessons: [
        { id: "L2.1", name: "Bài 1: Số vô tỉ. Căn bậc hai số học" },
      ]},
    ],
  },

  /* ============ VẬT LÝ ============ */
  {
    id: "LY-8-KNTT",
    grade: "THCS 8",
    subject: "Lý",
    publisher: "Kết Nối Tri Thức",
    chapters: [
      { id: "C1", name: "Chương 1: Cơ học", lessons: [
        { id: "L1.1", name: "Bài 1: Chuyển động cơ" },
        { id: "L1.2", name: "Bài 24: Lực ma sát" },
        { id: "L1.3", name: "Bài 25: Đòn bẩy và ứng dụng" },
      ]},
      { id: "C2", name: "Chương 2: Áp suất", lessons: [
        { id: "L2.1", name: "Bài 7: Áp suất chất rắn" },
        { id: "L2.2", name: "Bài 8: Áp suất chất lỏng" },
      ]},
    ],
  },
  {
    id: "LY-10-CTST",
    grade: "THPT 10",
    subject: "Lý",
    publisher: "Chân Trời Sáng Tạo",
    chapters: [
      { id: "C1", name: "Mở đầu", lessons: [
        { id: "L1.1", name: "Bài 1: Khái quát về môn Vật lí" },
      ]},
      { id: "C2", name: "Chương 1: Mô tả chuyển động", lessons: [
        { id: "L2.1", name: "Bài 4: Chuyển động thẳng" },
        { id: "L2.2", name: "Bài 5: Chuyển động tổng hợp" },
      ]},
    ],
  },

  /* ============ HOÁ ============ */
  {
    id: "HOA-8-KNTT",
    grade: "THCS 8",
    subject: "Hóa",
    publisher: "Kết Nối Tri Thức",
    chapters: [
      { id: "C1", name: "Chương 1: Phản ứng hoá học", lessons: [
        { id: "L1.1", name: "Bài 1: Biến đổi vật lí và biến đổi hoá học" },
        { id: "L1.2", name: "Bài 2: Phản ứng hoá học" },
      ]},
      { id: "C2", name: "Chương 2: Một số hợp chất thông dụng", lessons: [
        { id: "L2.1", name: "Bài 6: Acid" },
        { id: "L2.2", name: "Bài 7: Base. Thang pH" },
      ]},
    ],
  },

  /* ============ SINH ============ */
  {
    id: "SINH-8-CD",
    grade: "THCS 8",
    subject: "Sinh",
    publisher: "Cánh Diều",
    chapters: [
      { id: "C1", name: "Chương 1: Sinh học cơ thể người", lessons: [
        { id: "L1.1", name: "Bài 28: Hệ vận động ở người" },
        { id: "L1.2", name: "Bài 29: Dinh dưỡng và an toàn thực phẩm" },
      ]},
    ],
  },
  {
    id: "SINH-12-KNTT",
    grade: "THPT 12",
    subject: "Sinh",
    publisher: "Kết Nối Tri Thức",
    chapters: [
      { id: "C1", name: "Chương 1: Di truyền học", lessons: [
        { id: "L1.1", name: "Bài 1: Gene và sự tái bản DNA" },
        { id: "L1.2", name: "Bài 5: Di truyền học Mendel" },
      ]},
    ],
  },

  /* ============ TIN HỌC ============ */
  {
    id: "TIN-8-CD",
    grade: "THCS 8",
    subject: "Tin học",
    publisher: "Cánh Diều",
    chapters: [
      { id: "C1", name: "Chủ đề A: Máy tính và cộng đồng", lessons: [
        { id: "L1.1", name: "Bài 1: Lịch sử phát triển máy tính" },
      ]},
      { id: "C2", name: "Chủ đề F: Lập trình", lessons: [
        { id: "L2.1", name: "Bài 4: Sử dụng cấu trúc lặp trong chương trình" },
        { id: "L2.2", name: "Bài 5: Lập trình trực quan với Scratch" },
      ]},
    ],
  },
  {
    id: "TIN-9-KNTT",
    grade: "THCS 9",
    subject: "Tin học",
    publisher: "Kết Nối Tri Thức",
    chapters: [
      { id: "C1", name: "Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính", lessons: [
        { id: "L1.1", name: "Bài 1: Vai trò của máy tính trong cuộc sống" },
        { id: "L1.2", name: "Bài 2: Thuật toán và biểu diễn thuật toán" },
      ]},
    ],
  },

  /* ============ CÔNG NGHỆ ============ */
  {
    id: "CN-8-CTST",
    grade: "THCS 8",
    subject: "Công nghệ",
    publisher: "Chân Trời Sáng Tạo",
    chapters: [
      { id: "C1", name: "Chương 1: Vẽ kỹ thuật", lessons: [
        { id: "L1.1", name: "Bài 1: Một số tiêu chuẩn trình bày bản vẽ kĩ thuật" },
      ]},
      { id: "C2", name: "Chương 4: Kỹ thuật điện", lessons: [
        { id: "L2.1", name: "Bài 12: Mạch điện" },
        { id: "L2.2", name: "Bài 13: Mạch điện điều khiển" },
      ]},
    ],
  },

  /* ============ TỰ NHIÊN (Tiểu học) ============ */
  {
    id: "TN-4-KNTT",
    grade: "Tiểu học 4",
    subject: "Khoa học Tự nhiên",
    publisher: "Kết Nối Tri Thức",
    chapters: [
      { id: "C1", name: "Chủ đề: Năng lượng", lessons: [
        { id: "L1.1", name: "Bài 7: Năng lượng và sự cần thiết của năng lượng" },
        { id: "L1.2", name: "Bài 8: Ánh sáng và sự truyền ánh sáng" },
      ]},
    ],
  },
  {
    id: "TN-5-CD",
    grade: "Tiểu học 5",
    subject: "Khoa học Tự nhiên",
    publisher: "Cánh Diều",
    chapters: [
      { id: "C1", name: "Chủ đề: Vật chất và năng lượng", lessons: [
        { id: "L1.1", name: "Bài 1: Sự biến đổi hoá học" },
        { id: "L1.2", name: "Bài 4: Mạch điện đơn giản" },
      ]},
    ],
  },

  /* ============ TOÁN THPT ============ */
  {
    id: "TOAN-11-KNTT",
    grade: "THPT 11",
    subject: "Toán",
    publisher: "Kết Nối Tri Thức",
    chapters: [
      { id: "C1", name: "Chương 1: Hàm số lượng giác", lessons: [
        { id: "L1.1", name: "Bài 1: Giá trị lượng giác của một góc lượng giác" },
        { id: "L1.2", name: "Bài 2: Công thức lượng giác" },
      ]},
      { id: "C2", name: "Chương 5: Giới hạn", lessons: [
        { id: "L2.1", name: "Bài 16: Giới hạn của dãy số" },
      ]},
    ],
  },

  /* ============ HOÁ THPT ============ */
  {
    id: "HOA-11-CD",
    grade: "THPT 11",
    subject: "Hóa",
    publisher: "Cánh Diều",
    chapters: [
      { id: "C1", name: "Chương 1: Sự điện li", lessons: [
        { id: "L1.1", name: "Bài 1: Khái niệm về cân bằng hoá học" },
      ]},
    ],
  },

  /* ============ MỸ THUẬT ============ */
  {
    id: "MT-7-CTST",
    grade: "THCS 7",
    subject: "Mỹ thuật",
    publisher: "Chân Trời Sáng Tạo",
    chapters: [
      { id: "C1", name: "Chủ đề 1: Mỹ thuật tạo hình", lessons: [
        { id: "L1.1", name: "Bài 1: Hình họa cơ bản" },
      ]},
    ],
  },
];

export function findSGKBooks(grade?: string, subject?: string): SGKBook[] {
  return SGK_BOOKS.filter((b) => {
    if (grade && !b.grade.toLowerCase().includes(grade.toLowerCase())) return false;
    if (subject && b.subject !== subject) return false;
    return true;
  });
}

export function findSGKLesson(bookId: string, lessonId: string): { book: SGKBook; chapter: SGKChapter; lesson: SGKLesson } | null {
  const book = SGK_BOOKS.find((b) => b.id === bookId);
  if (!book) return null;
  for (const chapter of book.chapters) {
    const lesson = chapter.lessons.find((l) => l.id === lessonId);
    if (lesson) return { book, chapter, lesson };
  }
  return null;
}

/** Encode SGK ref thành string ngắn: "TOAN-8-KNTT/C1/L1.2" */
export function encodeSGKRef(bookId: string, chapterId?: string, lessonId?: string): string {
  return [bookId, chapterId, lessonId].filter(Boolean).join("/");
}
