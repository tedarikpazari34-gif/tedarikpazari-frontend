import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BuyerPaymentIssueInfo({
  orderId,
}: {
  orderId: string;
}) {
  const { t } = useTranslation();

  return (
    <details
      style={{
        marginTop: 16,
        padding: 15,
        border: "1px solid #B8DFDE",
        borderRadius: 12,
        background: "#F1FAF9",
        color: "#17324D",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 700,
          color: "#087F83",
        }}
      >
        {t("buyerOrdersPage.paymentIssueHelpTitle", {
          defaultValue: "Sipariş ve Ödeme Sorunları",
        })}
      </summary>

      <div style={{ marginTop: 13, lineHeight: 1.65 }}>
        <p>
          {t("buyerOrdersPage.paymentIssueHelpText", {
            defaultValue:
              "Ürün teslim edilmediyse, siparişle ilgili sorun yaşadıysanız " +
              "veya ödeme tutarında bir hata olduğunu düşünüyorsanız " +
              "Nex Tedarik Pazarı destek kanalı üzerinden bilgi verebilirsiniz.",
          })}
        </p>

        <p>
          <strong>
            {t("buyerOrdersPage.paymentIssueOrderLabel", {
              defaultValue: "Sipariş numarası:",
            })}
          </strong>{" "}
          <span style={{ overflowWrap: "anywhere" }}>
            {orderId}
          </span>
        </p>

        <Link
          to="/iletisim"
          style={{
            display: "inline-block",
            padding: "10px 15px",
            background: "#079B9B",
            color: "white",
            borderRadius: 9,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          {t("buyerOrdersPage.paymentIssueContact", {
            defaultValue: "Destek ve İletişim",
          })}
        </Link>

        <p style={{ fontSize: 13, color: "#526579" }}>
          {t("buyerOrdersPage.paymentIssueBankInfo", {
            defaultValue:
              "Kartınızla yapılan bir işleme resmi harcama itirazında " +
              "bulunmak istiyorsanız kartınızı veren bankaya başvurmanız gerekir. " +
              "Bu bilgilendirme alanı bankaya itiraz başvurusu oluşturmaz.",
          })}
        </p>

        <p style={{ fontSize: 13, color: "#526579" }}>
          {t("buyerOrdersPage.paymentIssueSecurity", {
            defaultValue:
              "Kart bilgilerinizin izinsiz kullanıldığını düşünüyorsanız " +
              "gecikmeden bankanızla iletişime geçin.",
          })}
        </p>
      </div>
    </details>
  );
}
