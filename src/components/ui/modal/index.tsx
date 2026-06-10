
import React from "react";
import {CircleX} from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`bg-white  w-full max-w-xl rounded-xl shadow-lg p-6 ${className}`}
      >
        <div className="flex justify-between items-center mb-4">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : <span />}
          <button
            className="text-xl leading-none text-gray-900"
            onClick={onClose}
          >
            <CircleX />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
