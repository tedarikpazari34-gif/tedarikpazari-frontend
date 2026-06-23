import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
type Thread = {
  id: string;
  buyer?: {
    name?: string;
  };
  seller?: {
    name?: string;
  };
  rfq?: {
    product?: {
      title?: string;
    };
  };
  order?: {
    id?: string;
  };
  messages?: Message[];
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
  readAt?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  sender?: {
    id: string;
  };
};

import { io } from "socket.io-client";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3002/api";

const socket = io(
  API.replace("/api", ""),
  {
    transports: ["websocket"],
    query: {
      userId: localStorage.getItem("userId") || "",
    },
  }
);

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token = localStorage.getItem("token");
  const myUserId = localStorage.getItem("userId");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);
  

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const loadThreads = async () => {
    try {
      const res = await fetch(`${API}/chat/threads`, { headers });
      const data = await res.json();

      setThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("THREAD LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const res = await fetch(`${API}/chat/threads/${threadId}/messages`, {
        headers,
      });

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("MESSAGE LOAD ERROR:", err);
      setMessages([]);
    }
  };
  const [isMobile, setIsMobile] = useState(
  window.innerWidth < 900
);
  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 900);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

  const sendMessage = async () => {
    if (!selectedThread || !content.trim()) return;

    try {
      const res = await fetch(
        `${API}/chat/threads/${selectedThread.id}/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            content,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err?.message || "Mesaj gönderilemedi");
        return;
      }

      setContent("");
      await loadMessages(selectedThread.id);
      await loadThreads();
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);
    }
  };
  const sendFile = async (file: File) => {
  if (!selectedThread) return;

  try {
    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch(
      `${API}/chat/threads/${selectedThread.id}/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const err = await res.json();

      alert(err?.message || "Dosya gönderilemedi");
      return;
    }

    await loadMessages(selectedThread.id);
    await loadThreads();
  } catch (err) {
    console.error("FILE SEND ERROR:", err);
  }
};
  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
  if (!selectedThread) return;

  loadMessages(selectedThread.id);

  socket.emit("joinThread", {
    threadId: selectedThread.id,
  });

  socket.on("newMessage", (message) => {
    setMessages((prev) => [...prev, message]);
    window.dispatchEvent(new Event("storage"));
  });

  return () => {
    socket.off("newMessage");
  };
}, [selectedThread?.id]);
  useEffect(() => {
  socket.on("typingStart", () => {
    setIsTyping(true);
  });

  socket.on("typingStop", () => {
    setIsTyping(false);
  });

  return () => {
    socket.off("typingStart");
    socket.off("typingStop");
  };
}, []);
  useEffect(() => {
  socket.on("userOnline", ({ userId }) => {
    setOnlineUsers((prev) =>
      prev.includes(userId)
        ? prev
        : [...prev, userId]
    );
  });

  socket.on("userOffline", ({ userId }) => {
    setOnlineUsers((prev) =>
      prev.filter((id) => id !== userId)
    );
  });

  return () => {
    socket.off("userOnline");
    socket.off("userOffline");
  };
}, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const selectedTitle =
    selectedThread?.rfq?.product?.title ||
    (selectedThread?.order?.id
      ? `Sipariş #${selectedThread.order.id.slice(0, 8)}`
      : "Chat");

  return (
    <main style={pageStyle}>
      <div
  style={{
    ...layoutStyle,
    gridTemplateColumns: isMobile
      ? "1fr"
      : "360px 1fr",
  }}
>
        <aside
  style={{
    ...sidebarStyle,
    height: isMobile
      ? "auto"
      : "calc(100vh - 48px)",
  }}
>
          <div style={sidebarHeaderStyle}>
            <div>
              <div style={eyebrowStyle}>GÜVENLİ MESAJLAŞMA</div>
              <h1 style={sidebarTitleStyle}>Mesajlar</h1>
            </div>

            <button onClick={loadThreads} style={refreshButtonStyle}>
              Yenile
            </button>
          </div>

          {loading ? (
            <div style={emptyStyle}>Yükleniyor...</div>
          ) : threads.length === 0 ? (
            <div style={emptyStyle}>Henüz konuşma yok</div>
          ) : (
            threads.map((thread) => {
              const lastMessage = thread.messages?.[0];
              const title =
                thread.rfq?.product?.title ||
                (thread.order?.id
                  ? `Sipariş #${thread.order.id.slice(0, 8)}`
                  : "Platform Chat");

              return (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  style={{
                    ...threadButtonStyle,
                    background:
                      selectedThread?.id === thread.id ? "#dbeafe" : "white",
                    borderColor:
                      selectedThread?.id === thread.id ? "#2563eb" : "#e2e8f0",
                  }}
                >
                  <div style={threadTopStyle}>
                    <strong>{title}</strong>
                    <span style={secureBadgeStyle}>Güvenli</span>
                  </div>

                  <span style={threadSubStyle}>
                    {thread.buyer?.name || "Buyer"} ↔️{" "}
                    {thread.seller?.name || "Seller"}
                  </span>

                  <span style={previewStyle}>
                    {lastMessage?.content || "Henüz mesaj yok"}
                  </span>
                </button>
              );
            })
          )}
        </aside>

        <section
  style={{
    ...chatAreaStyle,
    height: isMobile
      ? "75vh"
      : "calc(100vh - 48px)",
  }}
>
          {!selectedThread ? (
            <div style={emptyChatStyle}>
              <div style={emptyIconStyle}>💬</div>
              <strong>Bir konuşma seçin</strong>
              <span>Alıcı ve satıcı iletişim bilgileri gizli tutulur.</span>
            </div>
          ) : (
            <>
              <div style={chatHeaderStyle}>
                <div>
                  <strong style={chatTitleStyle}>{selectedTitle}</strong>
                  <div
  style={{
    ...chatSubStyle,
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}
>
  <span>
    {selectedThread.buyer?.name || "Buyer"} ↔️{" "}
    {selectedThread.seller?.name || "Seller"}
  </span>

  <span
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background:
        onlineUsers.length > 0
          ? "#22c55e"
          : "#94a3b8",
      display: "inline-block",
    }}
  />
</div>
                </div>

                <span style={headerBadgeStyle}>Platform içi iletişim</span>
              </div>

              <div style={messagesStyle}>
                {messages.length === 0 ? (
                  <div style={noMessageStyle}>
                    Henüz mesaj yok. İlk mesajı gönderin.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mine = msg.sender?.id === myUserId;

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          justifyContent: mine ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            ...messageBubbleStyle,
                            background: mine ? "#2563eb" : "white",
                            color: mine ? "white" : "#0f172a",
                            borderBottomRightRadius: mine ? 6 : 18,
                            borderBottomLeftRadius: mine ? 18 : 6,
                          }}
                        >
                          <>
  {msg.fileUrl ? (
    msg.fileType?.startsWith("image/") ? (
      <img
        src={`${API.replace("/api", "")}${msg.fileUrl}`}
        alt={msg.fileName || "file"}
        style={{
          maxWidth: 240,
          borderRadius: 12,
          display: "block",
        }}
      />
    ) : (
      <a
        href={`${API.replace("/api", "")}${msg.fileUrl}`}
        target="_blank"
        rel="noreferrer"
        style={{
          color: mine ? "white" : "#2563eb",
          fontWeight: 800,
        }}
      >
        📄 {msg.fileName || "Dosya"}
      </a>
    )
  ) : (
    <div>{msg.content}</div>
  )}
</>

                          <div
  style={{
    ...messageTimeStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  }}
>
  <span>
    {new Date(msg.createdAt).toLocaleString("tr-TR")}
  </span>

  {mine && (
    <span>
      {msg.isRead ? "✓✓" : "✓"}
    </span>
  )}
</div>
                        </div>
                      </div>
                    );
                  })
                )}
  {isTyping && (
  <div
    style={{
      color: "#64748b",
      fontSize: 13,
      paddingLeft: 8,
      fontStyle: "italic",
    }}
  >
    Yazıyor...
  </div>
)}
                <div ref={bottomRef} />
              </div>

              <div style={inputAreaStyle}>
               <>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*,.pdf"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        sendFile(file);
      }
    }}
  />

  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    style={uploadButtonStyle}
  >
    📎
  </button>
</> 
                <input
                  value={content}
                  onChange={(e) => {
  setContent(e.target.value);

  if (!selectedThread) return;

  socket.emit("typingStart", {
    threadId: selectedThread.id,
    userId: myUserId,
  });

  if (typingTimeoutRef.current) {
    window.clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = window.setTimeout(() => {
    socket.emit("typingStop", {
      threadId: selectedThread.id,
      userId: myUserId,
    });
  }, 1200);
}}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Mesaj yaz..."
                  style={inputStyle}
                />

                <button onClick={sendMessage} style={sendButtonStyle}>
                  Gönder
                </button>
              </div>

              <div style={warningStyle}>
                Telefon, e-mail, link, WhatsApp ve platform dışı iletişim
                paylaşımı yasaktır.
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #e0f2fe, #f8fafc)",
  padding: 16,
};

const layoutStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: 20,
  alignItems: "stretch",
};

const sidebarStyle: CSSProperties = {
  background: "white",
  borderRadius: 24,
  padding: 18,
  height: "calc(100vh - 48px)",
  overflow: "auto",
  boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
};

const sidebarHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 18,
};

const eyebrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 11,
  fontWeight: 900,
};

const sidebarTitleStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 24,
  fontWeight: 900,
};

const refreshButtonStyle: CSSProperties = {
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 12,
  padding: "9px 12px",
  fontWeight: 900,
  cursor: "pointer",
};

const threadButtonStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 14,
  marginBottom: 10,
  textAlign: "left",
  cursor: "pointer",
  display: "grid",
  gap: 7,
};

const threadTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  alignItems: "center",
};

const secureBadgeStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 11,
  fontWeight: 900,
};

const threadSubStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};

const previewStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 13,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const chatAreaStyle: CSSProperties = {
  background: "white",
  borderRadius: 24,
  display: "grid",
  gridTemplateRows: "84px 1fr auto auto",
  overflow: "hidden",
  height: "calc(100vh - 48px)",
  boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
};

const chatHeaderStyle: CSSProperties = {
  borderBottom: "1px solid #e2e8f0",
  padding: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const chatTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#0f172a",
};

const chatSubStyle: CSSProperties = {
  color: "#64748b",
  marginTop: 4,
  fontSize: 13,
  fontWeight: 700,
};

const headerBadgeStyle: CSSProperties = {
  background: "#dbeafe",
  color: "#1d4ed8",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 900,
};

const messagesStyle: CSSProperties = {
  padding: 20,
  overflow: "auto",
  display: "grid",
  gap: 12,
  background: "#f8fafc",
};

const messageBubbleStyle: CSSProperties = {
  maxWidth: 480,
  borderRadius: 18,
  padding: 14,
  boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
  lineHeight: 1.5,
};

const messageTimeStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 11,
  opacity: 0.7,
};

const inputAreaStyle: CSSProperties = {
  borderTop: "1px solid #e2e8f0",
  padding: 16,
  display: "flex",
  gap: 10,
};

const inputStyle: CSSProperties = {
  flex: 1,
  height: 52,
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  padding: "0 14px",
  fontSize: 15,
};
const uploadButtonStyle: CSSProperties = {
  width: 52,
  border: "1px solid #cbd5e1",
  background: "white",
  borderRadius: 14,
  fontSize: 22,
  cursor: "pointer",
};
const sendButtonStyle: CSSProperties = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "0 22px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const warningStyle: CSSProperties = {
  padding: 12,
  background: "#fef3c7",
  color: "#92400e",
  fontSize: 13,
  fontWeight: 800,
  textAlign: "center",
};

const emptyStyle: CSSProperties = {
  color: "#64748b",
};

const emptyChatStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  alignContent: "center",
  gap: 10,
  color: "#64748b",
  fontSize: 18,
  background: "#f8fafc",
};

const emptyIconStyle: CSSProperties = {
  width: 70,
  height: 70,
  borderRadius: 24,
  background: "#dbeafe",
  display: "grid",
  placeItems: "center",
  fontSize: 32,
};

const noMessageStyle: CSSProperties = {
  textAlign: "center",
  color: "#64748b",
  padding: 30,
};