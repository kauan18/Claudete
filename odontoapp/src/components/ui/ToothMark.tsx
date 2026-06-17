/**
 * Ícone de dente — desenhado à mão porque o Lucide não inclui "tooth".
 * Estilo de linha (stroke) para combinar com os demais ícones Lucide.
 */
export function ToothMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.5 3.5C5.5 3.5 4 5 4 7.5c0 2 .6 3.4 1.2 5.6.5 1.8.7 4.1 1.3 5.6.4 1 .8 1.8 1.5 1.8.9 0 1.1-1.3 1.4-2.8.3-1.5.5-2.9 1.1-2.9s.8 1.4 1.1 2.9c.3 1.5.5 2.8 1.4 2.8.7 0 1.1-.8 1.5-1.8.6-1.5.8-3.8 1.3-5.6C19.4 10.9 20 9.5 20 7.5 20 5 18.5 3.5 16.5 3.5c-1.6 0-2.6 1-4.5 1s-2.9-1-4.5-1Z" />
    </svg>
  );
}
