export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const { slotNumber, vehicleNumber, bookingTime, exitTime, cost } = receipt;

  const formatDuration = (start, end) => {
    if (!start || !end) return "—";
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatDate = (dt) =>
    dt ? new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-black/5 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-neutral-950 px-6 py-5 text-white text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl mx-auto mb-2">🧾</div>
          <h3 className="text-base font-bold">Parking Receipt</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Your session has ended</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <Row label="Slot" value={<span className="font-bold text-neutral-950">🅿 {slotNumber}</span>} />
          {vehicleNumber && <Row label="Vehicle" value={<span className="font-bold text-blue-700">🚗 {vehicleNumber}</span>} />}
          <Row label="Checked in" value={formatDate(bookingTime)} />
          <Row label="Checked out" value={formatDate(exitTime)} />
          <Row label="Duration" value={formatDuration(bookingTime, exitTime)} />
          <div className="border-t border-black/5 pt-3 mt-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-500">Total Cost</span>
            <span className="text-2xl font-black text-emerald-600">₹{cost?.toFixed(0) ?? "—"}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button onClick={onClose}
            className="w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white! hover:bg-neutral-800 transition">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-neutral-400">{label}</span>
      <span className="text-sm text-neutral-700">{value}</span>
    </div>
  );
}
