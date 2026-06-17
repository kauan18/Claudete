"use client";

/**
 * Botão de submit com confirmação. Precisa ser Client Component porque
 * Server Components não podem passar event handlers (onClick) a elementos.
 * O `action` (server action) continua no <form> pai.
 */
export function ConfirmSubmitButton({
  children,
  confirmMessage,
  className,
}: {
  children: React.ReactNode;
  confirmMessage: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
