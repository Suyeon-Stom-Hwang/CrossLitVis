import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ConfirmableInput({
  title,
  value,
  onChange,
  onConfirm,
  onCancel,
  placeholder = "Enter text",
}: {
  title?: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-row gap-2 items-center">
      {title && title.length > 0 && (
        <span className="text-gray-500 shrink-0 text w-14 text-left">
          {title}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-1 border-gray-300 text-sm rounded px-2 py-1 w-full h-8"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onConfirm();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
      />
      <button
        onClick={onConfirm}
        className="bg-green-300 hover:bg-green-600 transition-bg duration-100 text-white rounded min-w-8 h-8 flex items-center justify-center"
      >
        <CheckIcon className="size-5 stroke-3" />
      </button>
      <button
        onClick={onCancel}
        className="bg-rose-300 hover:bg-rose-600 transition-bg duration-100 text-white rounded min-w-8 h-8 flex items-center justify-center"
      >
        <XMarkIcon className="size-5 stroke-3" />
      </button>
    </div>
  );
}
