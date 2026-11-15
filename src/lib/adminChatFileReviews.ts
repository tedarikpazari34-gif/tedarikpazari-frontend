export type PendingChatFileReview = {
  id: string;
  messageId: string;
  threadId: string;
  createdAt: string;
  fileType: string | null;
  status: "PENDING_REVIEW";
};

export type PendingChatFileReviewPage = {
  items: PendingChatFileReview[];
  nextCursor: string | null;
};

const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

const FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function parsePendingChatFileReviews(
  payload: unknown,
): PendingChatFileReviewPage {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid review response");
  }

  const data = payload as {
    items?: unknown;
    nextCursor?: unknown;
  };

  if (!Array.isArray(data.items) || data.items.length > 50) {
    throw new Error("Invalid review items");
  }

  const nextCursor = data.nextCursor;

  if (
    nextCursor !== null &&
    (typeof nextCursor !== "string" ||
      !ID_PATTERN.test(nextCursor))
  ) {
    throw new Error("Invalid review cursor");
  }

  const items: PendingChatFileReview[] = [];

  for (const value of data.items) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Invalid review item");
    }

    const item = value as Record<string, unknown>;

    if (
      typeof item.id !== "string" ||
      !ID_PATTERN.test(item.id) ||
      typeof item.messageId !== "string" ||
      !ID_PATTERN.test(item.messageId) ||
      typeof item.threadId !== "string" ||
      !ID_PATTERN.test(item.threadId) ||
      item.status !== "PENDING_REVIEW" ||
      typeof item.createdAt !== "string" ||
      !Number.isFinite(Date.parse(item.createdAt))
    ) {
      throw new Error("Invalid review item");
    }

    items.push({
      id: item.id,
      messageId: item.messageId,
      threadId: item.threadId,
      createdAt: item.createdAt,
      fileType:
        typeof item.fileType === "string" &&
        FILE_TYPES.has(item.fileType)
          ? item.fileType
          : null,
      status: "PENDING_REVIEW",
    });
  }

  return { items, nextCursor };
}

const LABELS = {
  tr: {
    title: "Bekleyen sohbet dosyaları",
    caution: "Güvenlik taraması tamamlanmadığı için önizleme ve onay kapalıdır.",
    loading: "Yükleniyor...",
    error: "Dosya inceleme listesi alınamadı.",
    empty: "Bekleyen dosya bulunmuyor.",
    refresh: "Yenile",
    note: "Ret gerekçesi",
    reject: "Reddet",
    approval: "Onay kapalı",
    confirm: "Bu dosya incelemesini reddetmek istiyor musunuz?",
    reason: "Ret gerekçesi zorunludur.",
    saved: "Ret kararı kaydedildi.",
    failed: "Ret kararı kaydedilemedi.",
    previous: "Önceki",
    next: "Sonraki",
  },
  en: {
    title: "Pending chat files",
    caution: "Preview and approval are disabled until security scanning is complete.",
    loading: "Loading...",
    error: "Could not load pending files.",
    empty: "No pending files.",
    refresh: "Refresh",
    note: "Rejection reason",
    reject: "Reject",
    approval: "Approval disabled",
    confirm: "Reject this file review?",
    reason: "A rejection reason is required.",
    saved: "Rejection saved.",
    failed: "Could not save rejection.",
    previous: "Previous",
    next: "Next",
  },
  ka: {
    title: "მოლოდინში მყოფი ჩატის ფაილები",
    caution: "უსაფრთხოების შემოწმებამდე ნახვა და დამტკიცება გამორთულია.",
    loading: "იტვირთება...",
    error: "ფაილების სიის მიღება ვერ მოხერხდა.",
    empty: "მოლოდინში ფაილები არ არის.",
    refresh: "განახლება",
    note: "უარყოფის მიზეზი",
    reject: "უარყოფა",
    approval: "დამტკიცება გამორთულია",
    confirm: "უარყოთ ეს ფაილი?",
    reason: "მიუთითეთ უარყოფის მიზეზი.",
    saved: "უარყოფა შენახულია.",
    failed: "უარყოფის შენახვა ვერ მოხერხდა.",
    previous: "წინა",
    next: "შემდეგი",
  },
  ru: {
    title: "Файлы чата на проверке",
    caution: "Просмотр и одобрение отключены до завершения проверки безопасности.",
    loading: "Загрузка...",
    error: "Не удалось загрузить список файлов.",
    empty: "Нет файлов на проверке.",
    refresh: "Обновить",
    note: "Причина отклонения",
    reject: "Отклонить",
    approval: "Одобрение отключено",
    confirm: "Отклонить этот файл?",
    reason: "Укажите причину отклонения.",
    saved: "Отклонение сохранено.",
    failed: "Не удалось сохранить решение.",
    previous: "Назад",
    next: "Далее",
  },
  de: {
    title: "Ausstehende Chat-Dateien",
    caution: "Vorschau und Freigabe bleiben bis zur Sicherheitsprüfung deaktiviert.",
    loading: "Wird geladen...",
    error: "Dateiliste konnte nicht geladen werden.",
    empty: "Keine ausstehenden Dateien.",
    refresh: "Aktualisieren",
    note: "Ablehnungsgrund",
    reject: "Ablehnen",
    approval: "Freigabe deaktiviert",
    confirm: "Diese Datei ablehnen?",
    reason: "Ein Ablehnungsgrund ist erforderlich.",
    saved: "Ablehnung gespeichert.",
    failed: "Ablehnung konnte nicht gespeichert werden.",
    previous: "Zurück",
    next: "Weiter",
  },
  ar: {
    title: "ملفات المحادثة قيد المراجعة",
    caution: "المعاينة والموافقة معطلتان حتى اكتمال الفحص الأمني.",
    loading: "جارٍ التحميل...",
    error: "تعذر تحميل قائمة الملفات.",
    empty: "لا توجد ملفات قيد المراجعة.",
    refresh: "تحديث",
    note: "سبب الرفض",
    reject: "رفض",
    approval: "الموافقة معطلة",
    confirm: "هل تريد رفض هذا الملف؟",
    reason: "سبب الرفض مطلوب.",
    saved: "تم حفظ قرار الرفض.",
    failed: "تعذر حفظ قرار الرفض.",
    previous: "السابق",
    next: "التالي",
  },
  uz: {
    title: "Tekshiruvdagi chat fayllari",
    caution: "Xavfsizlik tekshiruvi tugamaguncha ko‘rish va tasdiqlash o‘chirilgan.",
    loading: "Yuklanmoqda...",
    error: "Fayllar ro‘yxatini yuklab bo‘lmadi.",
    empty: "Tekshiruvdagi fayllar yo‘q.",
    refresh: "Yangilash",
    note: "Rad etish sababi",
    reject: "Rad etish",
    approval: "Tasdiqlash o‘chirilgan",
    confirm: "Bu faylni rad etasizmi?",
    reason: "Rad etish sababi majburiy.",
    saved: "Rad etish saqlandi.",
    failed: "Rad etishni saqlab bo‘lmadi.",
    previous: "Oldingi",
    next: "Keyingi",
  },
};

export function adminChatFileReviewLabels(language: string) {
  const lang = language.toLowerCase().split("-")[0];
  return LABELS[lang as keyof typeof LABELS] ?? LABELS.tr;
}
