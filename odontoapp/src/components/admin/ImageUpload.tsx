"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";
import { labelClass } from "@/components/ui/form";

/**
 * Ilha cliente para upload de imagem.
 * Faz o upload via POST /api/upload, mostra preview e grava a URL resultante
 * num <input type="hidden"> com o `name` informado — assim a server action do
 * formulário só precisa ler uma string de URL (não o binário).
 */
export function ImageUpload({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload");
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar imagem");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input type="hidden" name={name} value={url} />

      <div
        onClick={() => !loading && inputRef.current?.click()}
        className="group relative flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-line bg-subtle transition-colors hover:border-primary"
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-soft">
                <Upload className="h-3.5 w-3.5" /> Trocar
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUrl("");
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-danger"
              aria-label="Remover imagem"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-ink-muted">
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            ) : (
              <ImageIcon className="h-7 w-7" />
            )}
            <span className="text-sm font-medium">
              {loading ? "Enviando..." : "Clique para enviar"}
            </span>
            <span className="text-xs">JPG, PNG ou WebP — até 8MB</span>
          </div>
        )}

        {loading && url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
