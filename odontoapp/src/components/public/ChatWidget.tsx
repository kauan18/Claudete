"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, CalendarCheck } from "lucide-react";
import { ToothMark } from "@/components/ui/ToothMark";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  clinicId: string;
  slug: string;
  clinicName: string;
}

export function ChatWidget({ clinicId, slug, clinicName }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Olá! Sou a assistente virtual da ${clinicName}. Posso ajudar com dúvidas sobre serviços, horários e agendamento. Como posso ajudar?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Envia só os pares user/assistant da conversa (sem a saudação inicial).
        body: JSON.stringify({ clinicId, messages: next.slice(1) }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        res.ok && data.reply ? data.reply : "Desculpe, tive um problema. Tente novamente ou fale com a gente no WhatsApp.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Desculpe, não consegui responder agora. Tente novamente em instantes." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fechar chat" : "Abrir chat de atendimento"}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lift transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Painel */}
      {open && (
        <div className="fixed bottom-24 left-6 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <ToothMark className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Assistente {clinicName}</p>
              <p className="text-xs text-white/80">Tire suas dúvidas</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-subtle p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm " +
                    (m.role === "user"
                      ? "bg-primary text-white"
                      : "border border-line bg-surface text-ink")
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-ink-muted">digitando…</div>
              </div>
            )}
          </div>

          <div className="border-t border-line p-2">
            <a
              href={`/c/${slug}/agendar`}
              className="mb-2 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-center text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <CalendarCheck className="h-4 w-4" />
              Agendar consulta
            </a>
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Escreva sua mensagem…"
                maxLength={2000}
                className="flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Enviar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-center text-[10px] text-ink-muted">
              Assistente virtual — não substitui avaliação profissional.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
