import { createServer } from "vite";
import react from "@vitejs/plugin-react";

const entry = "/__nex_shipping_review.tsx";
const virtualId = "\0nex-shipping-review";
const emptyId = "\0nex-shipping-empty";
const invoiceId = "\0nex-shipping-invoice";
const mockComponents = new Set([
  "InvoiceUploadForm", "InvoiceList", "SellerDisputesPanel",
  "BuyerDisputesPanel", "BuyerDisputeAction", "BuyerPaymentIssueInfo",
  "AdminSidebar",
]);

const entrySource = `
import React from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import i18n from "/src/i18n/index.ts";
import Buyer from "/src/pages/BuyerOrdersPage.tsx";
import Seller from "/src/pages/SellerOrdersPage.tsx";
import Admin from "/src/pages/AdminOrdersPage.tsx";

const params = new URLSearchParams(location.search);
const role = params.get("role") || "seller";
const language = params.get("lang") || "tr";
const orders = [
  {
    id: "review-cargo", status: "SHIPPED",
    productTitleSnapshot: "NEX TEST CARGO", quantity: 2, totalAmount: 900,
    shippingMethod: "CARGO", shippingCompany: "TEST CARGO",
    shippingTrackingNo: "KRG-123",
    shippedAt: "2026-11-04T10:00:00Z",
    buyer: { id: "test-buyer" },
  },
  {
    id: "review-freight", status: "COMPLETED",
    productTitleSnapshot: "NEX TEST FREIGHT", quantity: 4, totalAmount: 2400,
    shippingMethod: "FREIGHT", shippingCompany: "TEST FREIGHT",
    shippingTrackingNo: "AMB-456", shippingDispatchNo: "IRS-789",
    shippedAt: "2026-11-04T10:00:00Z",
    buyer: { id: "test-buyer" },
  },
  {
    id: "review-preparing", status: "PREPARING",
    productTitleSnapshot: "NEX TEST PREPARING", quantity: 2, totalAmount: 500,
    buyer: { id: "test-buyer" },
  },
];

window.__nexUnexpectedRequests = [];
window.fetch = async (input, options = {}) => {
  const url = new URL(
    typeof input === "string" ? input : input.url || String(input),
    location.origin,
  );
  const method = (options.method || "GET").toUpperCase();
  if (method === "GET" && url.pathname === "/api/orders") {
    return new Response(JSON.stringify(orders), {
      headers: { "Content-Type": "application/json" },
    });
  }
  const order = orders.find(item => url.pathname === "/api/orders/" + item.id);
  if (method === "GET" && order) {
    return new Response(JSON.stringify(order), {
      headers: { "Content-Type": "application/json" },
    });
  }
  window.__nexUnexpectedRequests.push(method + " " + url.pathname);
  throw new Error("Review blocked unexpected request: " + method + " " + url.pathname);
};
localStorage.setItem("token", "LOCAL_REVIEW_ONLY");
window.alert = message => { window.__nexLastAlert = String(message); };

await i18n.changeLanguage(language);
window.__nexReview = {
  role, language,
  text: key => String(i18n.t(key)),
};
const Page = role === "buyer" ? Buyer : role === "admin" ? Admin : Seller;
createRoot(document.getElementById("root")).render(
  React.createElement(MemoryRouter, null, React.createElement(Page))
);
`;

export async function startPreview(root = process.cwd()) {
  const server = await createServer({
    configFile: false,
    root,
    envFile: false,
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify("/api"),
    },
    server: { host: "127.0.0.1", port: 0, hmr: false, open: false },
    plugins: [
      {
        name: "nex-isolated-shipping-review",
        enforce: "pre",
        resolveId(source) {
          if (source === entry) return virtualId;
          const name = source.split("/").pop()?.replace(/\.(tsx?|jsx?)$/, "");
          if (mockComponents.has(name)) return emptyId;
          if (name === "invoiceApi") return invoiceId;
        },
        load(id) {
          if (id === virtualId) return entrySource;
          if (id === emptyId) return "export default function Empty(){return null}";
          if (id === invoiceId) return `
            export const invoiceApi = new Proxy({}, {
              get: () => async () => []
            });
          `;
        },
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            res.setHeader("Content-Security-Policy",
              "default-src 'self'; script-src 'self' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; connect-src 'self'; " +
              "img-src 'self' data:; font-src 'self'; " +
              "frame-src 'none'; form-action 'none'; base-uri 'none'");
            if (req.url?.split("?")[0] !== "/__nex_shipping_review") {
              return next();
            }
            try {
              const html = await server.transformIndexHtml(
                "/__nex_shipping_review",
                '<!doctype html><html><head><meta charset="utf-8">' +
                '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                '<title>Nex Local Shipping Review</title></head>' +
                '<body style="margin:0"><div id="root"></div>' +
                '<script type="module" src="' + entry + '"></script></body></html>',
              );
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end(html);
            } catch (error) {
              next(error);
            }
          });
        },
      },
      react(),
    ],
  });
  try {
    await server.listen();
    const address = server.httpServer.address();
    return {
      server,
      url: "http://127.0.0.1:" + address.port + "/__nex_shipping_review",
    };
  } catch (error) {
    await server.close();
    throw error;
  }
}
