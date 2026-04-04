export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", confirmStyle = "danger", onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-black/5 shadow-2xl p-6">
        <h3 className="text-base font-bold text-neutral-950">{title}</h3>
        <p className="mt-2 text-sm text-neutral-500 leading-6">{message}</p>

        <div className="mt-6 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-bold text-white! shadow-sm transition
              ${confirmStyle === "danger" ? "bg-red-500 hover:bg-red-600 shadow-red-200" : ""}
              ${confirmStyle === "warning" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : ""}
              ${confirmStyle === "default" ? "bg-neutral-950 hover:bg-neutral-800 shadow-black/20" : ""}
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
