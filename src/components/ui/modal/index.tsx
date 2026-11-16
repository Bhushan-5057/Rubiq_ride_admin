import React, { useEffect } from "react";
import { CircleX } from "lucide-react";

export function Modal({
  title,
  children,
  onClose,
  isOpen = true,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  isOpen?: boolean;
  className?: string;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-xl rounded-xl bg-white p-6 shadow-lg ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {title ? (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            onClick={onClose}
          >
            <CircleX size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
