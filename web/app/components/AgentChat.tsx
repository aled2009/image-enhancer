"use client";

import { FormEvent, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type AgentChatProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export default function AgentChat({ isOpen, onToggle }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nextId = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = input.trim();

    if (!question || loading) {
      return;
    }

    setError("");
    setInput("");
    setLoading(true);

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      content: question,
    };

    const assistantMessage: Message = {
      id: nextId.current++,
      role: "assistant",
      content: "",
    };

    setMessages((previous) => [...previous, userMessage, assistantMessage]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/api/agent/chat/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
          body: JSON.stringify({ message: question }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.message || "No se pudo obtener una respuesta del agente.",
        );
      }

      if (!response.body) {
        throw new Error("El navegador no pudo recibir la respuesta.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        answer += decoder.decode(value, { stream: true });

        const currentAnswer = answer;

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: currentAnswer }
              : message,
          ),
        );

        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      }

      answer += decoder.decode();

      if (answer) {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: answer }
              : message,
          ),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al comunicarse con el agente.",
      );

      setMessages((previous) =>
        previous.filter(
          (message) =>
            message.id !== assistantMessage.id || message.content.length > 0,
        ),
      );
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-3 rounded-full border border-violet-400/30 bg-zinc-900 px-5 py-4 text-sm font-medium text-white shadow-2xl shadow-violet-950/40 transition hover:bg-zinc-800"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
            </svg>
          </span>
          <span className="text-left">
            <span className="block">Chatea con tu asistente</span>
            <span className="mt-1 block text-xs text-zinc-400">
              Enhancer AI
            </span>
          </span>
        </button>
      )}

      {isOpen && (
        <section className="fixed inset-y-3 right-3 z-50 flex w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-violet-950/30 sm:right-4 sm:w-96 lg:right-5">
          <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-linear-to-r from-violet-950/70 to-zinc-900 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15">
              <svg
                viewBox="0 0 64 64"
                className="h-10 w-10"
                role="img"
                aria-label="Mascota de Enhancer AI"
              >
                <path
                  d="M32 7v7"
                  stroke="#C4B5FD"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="32" cy="5" r="3" fill="#C4B5FD" />
                <rect
                  x="10"
                  y="15"
                  width="44"
                  height="37"
                  rx="13"
                  fill="#8B5CF6"
                />
                <rect
                  x="17"
                  y="23"
                  width="30"
                  height="19"
                  rx="8"
                  fill="#272044"
                />
                <circle cx="25" cy="32" r="3" fill="#A7F3D0" />
                <circle cx="39" cy="32" r="3" fill="#A7F3D0" />
                <path
                  d="M25 46q7 6 14 0"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <rect
                  x="3"
                  y="27"
                  width="6"
                  height="15"
                  rx="3"
                  fill="#A78BFA"
                />
                <rect
                  x="55"
                  y="27"
                  width="6"
                  height="15"
                  rx="3"
                  fill="#A78BFA"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-white">Enhancer AI</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Tu asistente de Image Enhancer
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Asistente virtual
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              aria-label="Cerrar chat"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-xl text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              ×
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="m-auto max-w-sm py-6 text-center">
                <h3 className="font-medium text-white">
                  ¿En qué puedo ayudarte?
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Pregúntame cómo mejorar tus imágenes, qué significa el
                  escalado 2× o 4×, o cómo resolver un problema.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setInput(
                      "¿Cuál es la diferencia entre el escalado 2x y 4x?",
                    )
                  }
                  className="mt-4 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-violet-200 transition hover:border-violet-500/60 hover:bg-violet-500/10"
                >
                  Diferencia entre 2× y 4×
                </button>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-md bg-violet-600 text-white"
                      : "rounded-bl-md border border-zinc-700 bg-zinc-800 text-zinc-100"
                  }`}
                >
                  {message.content ? (
                    message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-white">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          ul: ({ children }) => (
                            <ul className="my-2 list-disc space-y-1 pl-5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="my-2 list-decimal space-y-1 pl-5">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                          code: ({ children }) => (
                            <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-violet-200">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )
                  ) : (
                    <span className="inline-flex items-center gap-2 text-zinc-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                      Generando respuesta...
                    </span>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="shrink-0 border-t border-zinc-800 bg-zinc-950/60 p-3"
          >
            <label htmlFor="agent-question" className="sr-only">
              Escribe tu pregunta
            </label>

            <div className="flex items-end gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 p-2 transition focus-within:border-violet-500">
              <textarea
                id="agent-question"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Pregúntale algo a Enhancer AI..."
                maxLength={2000}
                rows={2}
                disabled={loading}
                className="max-h-32 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-500 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Enviar pregunta"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                )}
              </button>
            </div>

            <p className="mt-2 px-1 text-xs text-zinc-500">
              Enter para enviar · Shift + Enter para una nueva línea
            </p>
          </form>
        </section>
      )}
    </>
  );
}
