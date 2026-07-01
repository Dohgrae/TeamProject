"use client";

interface Option {
  value: string;
  label: string;
}

interface ButtonGroupProps {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function ButtonGroup({ options, selected, onToggle }: ButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              isSelected
                ? "border-pink-500 bg-pink-500 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-pink-300"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
