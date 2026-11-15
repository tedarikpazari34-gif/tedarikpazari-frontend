export type SenderFileReviewStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type SenderFileReview = {
  id: string;
  createdAt: string;
  fileName: string;
  status: SenderFileReviewStatus;
};

type Labels = {
  title: string;
  pending: string;
  approved: string;
  rejected: string;
  refresh: string;
  loading: string;
  error: string;
};

const LABELS: Record<string, Labels> = {
  tr: {
    title: "Gönderdiğim dosyalar",
    pending: "İncelemede",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    refresh: "Yenile",
    loading: "Yükleniyor...",
    error: "Dosya durumları alınamadı.",
  },
  en: {
    title: "Files I sent",
    pending: "Under review",
    approved: "Approved",
    rejected: "Rejected",
    refresh: "Refresh",
    loading: "Loading...",
    error: "Could not load file statuses.",
  },
  ka: {
    title: "ჩემ მიერ გაგზავნილი ფაილები",
    pending: "განხილვის პროცესშია",
    approved: "დამტკიცებულია",
    rejected: "უარყოფილია",
    refresh: "განახლება",
    loading: "იტვირთება...",
    error: "ფაილების სტატუსების მიღება ვერ მოხერხდა.",
  },
  ru: {
    title: "Отправленные мной файлы",
    pending: "На проверке",
    approved: "Одобрено",
    rejected: "Отклонено",
    refresh: "Обновить",
    loading: "Загрузка...",
    error: "Не удалось загрузить статусы файлов.",
  },
  de: {
    title: "Meine gesendeten Dateien",
    pending: "In Prüfung",
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    refresh: "Aktualisieren",
    loading: "Wird geladen...",
    error: "Dateistatus konnten nicht geladen werden.",
  },
  ar: {
    title: "الملفات التي أرسلتها",
    pending: "قيد المراجعة",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
    refresh: "تحديث",
    loading: "جارٍ التحميل...",
    error: "تعذر تحميل حالات الملفات.",
  },
  uz: {
    title: "Men yuborgan fayllar",
    pending: "Tekshirilmoqda",
    approved: "Tasdiqlandi",
    rejected: "Rad etildi",
    refresh: "Yangilash",
    loading: "Yuklanmoqda...",
    error: "Fayl holatlarini yuklab bo‘lmadi.",
  },
};

const VALID_STATUSES = new Set<SenderFileReviewStatus>([
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
]);

const SAFE_FILE_NAMES = new Set([
  "Belge.pdf",
  "Gorsel.jpg",
  "Gorsel.png",
  "Gorsel.webp",
  "Dosya",
]);

export function senderFileReviewLabels(language: string): Labels {
  const lang = language.toLowerCase().split("-")[0];
  return LABELS[lang] ?? LABELS.tr;
}

export function parseSenderFileReviews(
  payload: unknown,
): SenderFileReview[] {
  if (!payload || typeof payload !== "object") return [];

  const raw = (payload as { items?: unknown }).items;
  if (!Array.isArray(raw)) return [];

  const result: SenderFileReview[] = [];

  for (const value of raw.slice(0, 50)) {
    if (!value || typeof value !== "object") continue;

    const item = value as Record<string, unknown>;

    if (
      typeof item.id !== "string" ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(item.id) ||
      typeof item.status !== "string" ||
      !VALID_STATUSES.has(
        item.status as SenderFileReviewStatus,
      ) ||
      typeof item.createdAt !== "string" ||
      !Number.isFinite(Date.parse(item.createdAt))
    ) {
      continue;
    }

    const fileName =
      typeof item.fileName === "string" &&
      SAFE_FILE_NAMES.has(item.fileName)
        ? item.fileName
        : "Dosya";

    result.push({
      id: item.id,
      createdAt: item.createdAt,
      fileName,
      status: item.status as SenderFileReviewStatus,
    });
  }

  return result;
}
