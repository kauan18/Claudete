/** Gera um slug ASCII-safe (sem acentos) a partir de um texto. */
export function slugify(text: string): string {
  let out = "";
  for (const ch of text.normalize("NFD")) {
    const code = ch.charCodeAt(0);
    if (code >= 0x0300 && code <= 0x036f) continue; // descarta diacríticos
    out += ch;
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
