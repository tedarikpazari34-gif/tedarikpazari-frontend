export const popularCategoryTranslations = {
  "tr": {
    "eyebrow": "ALIŞVERİŞE BAŞLA",
    "names": {
      "Ambalaj ve Paketleme": "Ambalaj ve Paketleme",
      "Temizlik ve Hijyen": "Temizlik ve Hijyen",
      "Gıda ve Horeca": "Gıda ve Horeca",
      "Elektrik ve Aydınlatma": "Elektrik ve Aydınlatma",
      "İş Güvenliği": "İş Güvenliği",
      "Otomotiv ve Yedek Parça": "Otomotiv ve Yedek Parça",
      "Hırdavat": "Hırdavat",
      "Lojistik ve Depolama": "Lojistik ve Depolama"
    }
  },
  "en": {
    "eyebrow": "START SHOPPING",
    "names": {
      "Ambalaj ve Paketleme": "Packaging and Packing",
      "Temizlik ve Hijyen": "Cleaning and Hygiene",
      "Gıda ve Horeca": "Food and HoReCa",
      "Elektrik ve Aydınlatma": "Electrical and Lighting",
      "İş Güvenliği": "Occupational Safety",
      "Otomotiv ve Yedek Parça": "Automotive and Spare Parts",
      "Hırdavat": "Hardware and Tools",
      "Lojistik ve Depolama": "Logistics and Warehousing"
    }
  },
  "ka": {
    "eyebrow": "დაიწყეთ შესყიდვა",
    "names": {
      "Ambalaj ve Paketleme": "შეფუთვა და შესაფუთი მასალები",
      "Temizlik ve Hijyen": "დასუფთავება და ჰიგიენა",
      "Gıda ve Horeca": "საკვები და HoReCa",
      "Elektrik ve Aydınlatma": "ელექტროობა და განათება",
      "İş Güvenliği": "შრომის უსაფრთხოება",
      "Otomotiv ve Yedek Parça": "ავტომობილები და სათადარიგო ნაწილები",
      "Hırdavat": "სამუშაო იარაღები",
      "Lojistik ve Depolama": "ლოგისტიკა და საწყობები"
    }
  },
  "ru": {
    "eyebrow": "НАЧНИТЕ ПОКУПКИ",
    "names": {
      "Ambalaj ve Paketleme": "Упаковка и упаковочные материалы",
      "Temizlik ve Hijyen": "Уборка и гигиена",
      "Gıda ve Horeca": "Продукты питания и HoReCa",
      "Elektrik ve Aydınlatma": "Электрика и освещение",
      "İş Güvenliği": "Охрана труда",
      "Otomotiv ve Yedek Parça": "Автомобили и запчасти",
      "Hırdavat": "Инструменты и крепёж",
      "Lojistik ve Depolama": "Логистика и складирование"
    }
  },
  "de": {
    "eyebrow": "JETZT EINKAUFEN",
    "names": {
      "Ambalaj ve Paketleme": "Verpackung und Verpackungsmaterial",
      "Temizlik ve Hijyen": "Reinigung und Hygiene",
      "Gıda ve Horeca": "Lebensmittel und HoReCa",
      "Elektrik ve Aydınlatma": "Elektrotechnik und Beleuchtung",
      "İş Güvenliği": "Arbeitssicherheit",
      "Otomotiv ve Yedek Parça": "Automobil und Ersatzteile",
      "Hırdavat": "Werkzeuge und Eisenwaren",
      "Lojistik ve Depolama": "Logistik und Lagerung"
    }
  },
  "ar": {
    "eyebrow": "ابدأ التسوق",
    "names": {
      "Ambalaj ve Paketleme": "التعبئة والتغليف",
      "Temizlik ve Hijyen": "التنظيف والنظافة",
      "Gıda ve Horeca": "الأغذية والضيافة",
      "Elektrik ve Aydınlatma": "الكهرباء والإضاءة",
      "İş Güvenliği": "السلامة المهنية",
      "Otomotiv ve Yedek Parça": "السيارات وقطع الغيار",
      "Hırdavat": "العدد والأدوات",
      "Lojistik ve Depolama": "الخدمات اللوجستية والتخزين"
    }
  },
  "uz": {
    "eyebrow": "XARIDNI BOSHLANG",
    "names": {
      "Ambalaj ve Paketleme": "Qadoqlash va o‘rash",
      "Temizlik ve Hijyen": "Tozalik va gigiyena",
      "Gıda ve Horeca": "Oziq-ovqat va HoReCa",
      "Elektrik ve Aydınlatma": "Elektr jihozlari va yoritish",
      "İş Güvenliği": "Mehnat xavfsizligi",
      "Otomotiv ve Yedek Parça": "Avtomobillar va ehtiyot qismlar",
      "Hırdavat": "Asbob-uskunalar",
      "Lojistik ve Depolama": "Logistika va omborxona"
    }
  }
} as const;


type PopularCopy = {
  eyebrow: string;
  names: Record<string, string>;
};

export function getPopularCategoryCopy(
  language: string
): PopularCopy {
  const code = language.toLowerCase().split("-")[0];

  if (Object.prototype.hasOwnProperty.call(
    popularCategoryTranslations, code
  )) {
    return popularCategoryTranslations[
      code as keyof typeof popularCategoryTranslations
    ];
  }

  return popularCategoryTranslations.tr;
}
