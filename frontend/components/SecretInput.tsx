"use client";

import { useState } from "react";

interface SecretInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SecretInput({ value, onChange, disabled }: SecretInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative w-full">
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        placeholder="Confess your darkest secret... The Judge awaits."
        className={`
          w-full min-h-[80px] max-h-[120px] p-3
          bg-[#111] text-white font-mono text-sm
          border resize-none
          placeholder:text-vault-gray-light
          focus:outline-none
          transition-all duration-200
          ${
            isFocused
              ? "border-vault-red shadow-[0_0_10px_rgba(220,38,38,0.3)]"
              : "border-vault-gray"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      />

      {/* Character count */}
      <div className="absolute bottom-2 right-3 text-vault-gray-light font-mono text-xs">
        {value.length} chars
      </div>

      {/* Terminal-like corner accents */}
      <div
        className={`
          absolute top-0 left-0 w-2 h-2 border-t border-l
          ${isFocused ? "border-vault-red" : "border-vault-gray"}
          transition-colors duration-200
        `}
      />
      <div
        className={`
          absolute top-0 right-0 w-2 h-2 border-t border-r
          ${isFocused ? "border-vault-red" : "border-vault-gray"}
          transition-colors duration-200
        `}
      />
      <div
        className={`
          absolute bottom-0 left-0 w-2 h-2 border-b border-l
          ${isFocused ? "border-vault-red" : "border-vault-gray"}
          transition-colors duration-200
        `}
      />
      <div
        className={`
          absolute bottom-0 right-0 w-2 h-2 border-b border-r
          ${isFocused ? "border-vault-red" : "border-vault-gray"}
          transition-colors duration-200
        `}
      />
    </div>
  );
}
