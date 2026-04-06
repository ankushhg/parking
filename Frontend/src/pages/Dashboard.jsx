import { useState, useEffect } from "react";
import API from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useTheme } from "../hooks/useTheme";
import ConfirmDialog from "../components/ConfirmDialog";
import ReceiptModal from "../components/ReceiptModal";
import { SkeletonCard, SkeletonSlot, SkeletonRow } from "../components/Skeletons";

const NAV = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "slots", label: "Parking Slots", icon: "🅿" },
  { id: "bookings", label: "My Bookings", icon: "📋" },
];

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [slotNumber, setSlotNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [bookError, setBookError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queueInfo, setQueueInfo] = useState(null); // { inQueue, position }
  const [queueAssignedSlot, setQueueAssignedSlot] = useState(null); // banner state
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [now, setNow] = useState(Date.now());
  const toast = useToast();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const token = localStorage.getItem("token");
  const tokenPayload = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const userName = tokenPayload.name || tokenPayload.sub || "User";
  const userEmail = tokenPayload.sub || "";

  useEffect(() => { document.title = "My Dashboard — ParkFlow"; }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeBooking = myBookings.find(b => b.active) || null;

  const liveDuration = (start) => {
    if (!start) return "—";
    const mins = Math.round((now - new Date(start)) / 60000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const fetchSlots = async () => { const res = await API.get("/slots/all"); setSlots(res.data); };
  const fetchMyBookings = async () => { const res = await API.get("/bookings/my-bookings"); setMyBookings(res.data); };
  const fetchQueueInfo = async () => { try { const res = await API.get("/bookings/queue-position"); setQueueInfo(res.data); } catch { setQueueInfo(null); } };

  useEffect(() => {
    Promise.all([fetchSlots(), fetchMyBookings(), fetchQueueInfo()]).finally(() => setLoading(false));
    connectSocket(
      () => { fetchSlots(); fetchMyBookings(); fetchQueueInfo(); },
      userEmail,
      (slotNumber) => { setQueueAssignedSlot(slotNumber); fetchSlots(); fetchMyBookings(); fetchQueueInfo(); }
    );
    return () => disconnectSocket();
  }, []);

  const bookSlot = async (overrideSlot) => {
    setBookError("");
    const target = typeof overrideSlot === "string" ? overrideSlot : slotNumber;
    if (!target.trim()) return setBookError("Please enter a slot number.");
    try {
      const vn = vehicleNumber.trim();
      await API.post(`/bookings/book?slotNumber=${target}${vn ? `&vehicleNumber=${vn}` : ""}`);
      setSlotNumber(""); setVehicleNumber(""); fetchSlots(); fetchMyBookings();
      toast("Slot booked successfully!", "success");
    } catch (err) { setBookError(err.response?.data || "Booking failed."); }
  };

  const autoBook = async () => {
    setBookError("");
    try {
      await API.post("/bookings/auto-book");
      fetchSlots(); fetchMyBookings(); fetchQueueInfo();
      toast("Best slot auto-assigned!", "success");
    } catch (err) {
      const msg = err.response?.data || "Auto booking failed.";
      setBookError(msg);
      fetchQueueInfo(); // refresh queue status after being added
    }
  };

  const leaveQueue = async () => {
    try {
      await API.delete("/bookings/leave-queue");
      setQueueInfo(null);
      toast("Removed from waiting queue.", "info");
    } catch (err) {
      toast(err.response?.data || "Failed to leave queue.", "error");
    }
  };

  const releaseSlot = (bookingId) => setConfirm({ type: "release", bookingId });
  const cancelBooking = (bookingId) => setConfirm({ type: "cancel", bookingId });

  const handleConfirm = async () => {
    const { type, bookingId } = confirm;
    setConfirm(null);
    if (type === "release") {
      try {
        const res = await API.put(`/bookings/release/${bookingId}`);
        fetchSlots(); fetchMyBookings();
        setReceipt(res.data);
      }
      catch (err) { toast(err.response?.data || "Release failed.", "error"); }
    } else {
      try { await API.delete(`/bookings/cancel/${bookingId}`); fetchSlots(); fetchMyBookings(); toast("Booking cancelled.", "info"); }
      catch (err) { toast(err.response?.data || "Cancel failed.", "error"); }
    }
  };

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("role"); window.location.href = "/"; };

  const exportMyBookingsCSV = () => {
    const rows = [
      ["ID", "Slot", "Vehicle", "Booked At", "Exit At", "Duration", "Cost"],
      ...myBookings.map(b => {
        const mins = b.bookingTime && b.exitTime
          ? Math.round((new Date(b.exitTime) - new Date(b.bookingTime)) / 60000) : "";
        const duration = mins ? (mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`) : "";
        return [
          b.id,
          b.slotNumber,
          b.vehicleNumber ?? "",
          b.bookingTime ? new Date(b.bookingTime).toLocaleString("en-IN") : "",
          b.exitTime ? new Date(b.exitTime).toLocaleString("en-IN") : "",
          duration,
          b.cost ? `₹${b.cost.toFixed(0)}` : "",
        ];
      }),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalSlots = slots.length;
  const freeSlots = slots.filter(s => s.available).length;
  const occupiedSlots = slots.filter(s => !s.available).length;
  const activeBookings = myBookings.filter(b => b.active).length;
  const occupancyPct = totalSlots === 0 ? 0 : Math.round((occupiedSlots / totalSlots) * 100);

  const formatDuration = (start, end) => {
    if (!start || !end) return null;
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const filteredBookings = myBookings.filter(b =>
    b.slotNumber?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (b.vehicleNumber?.toLowerCase() || "").includes(bookingSearch.toLowerCase())
  );

  const stats = [
    { label: "Total Slots", value: totalSlots, icon: "🅿", bg: "bg-neutral-50", color: "text-neutral-950" },
    { label: "Available", value: freeSlots, icon: "✓", bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Occupied", value: occupiedSlots, icon: "✗", bg: "bg-red-50", color: "text-red-500" },
    { label: "My Active", value: activeBookings, icon: "★", bg: "bg-amber-50", color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-[#f6efe5] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">

      {confirm && (
        <ConfirmDialog
          title={confirm.type === "release" ? "Release slot?" : "Cancel booking?"}
          message={confirm.type === "release" ? "This will free up the slot for others." : "This will permanently cancel your booking."}
          confirmLabel={confirm.type === "release" ? "Release" : "Cancel booking"}
          confirmStyle={confirm.type === "release" ? "warning" : "danger"}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />

      {queueAssignedSlot && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-emerald-950 text-white px-5 py-3.5 shadow-xl shadow-black/30 animate-bounce">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-sm font-bold">Slot assigned!</p>
            <p className="text-xs text-emerald-300">You've been assigned slot <span className="font-bold text-white">{queueAssignedSlot}</span> from the waiting queue.</p>
          </div>
          <button onClick={() => setQueueAssignedSlot(null)} className="ml-2 text-emerald-400 hover:text-white transition text-lg leading-none">×</button>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 w-full">
        <div className="flex items-center justify-between px-6 py-3 w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)} className="md:hidden flex flex-col gap-1 p-2">
              <span className="block h-0.5 w-5 bg-neutral-700" />
              <span className="block h-0.5 w-5 bg-neutral-700" />
              <span className="block h-0.5 w-5 bg-neutral-700" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-white font-black text-sm">P</div>
              <span className="font-bold text-base tracking-tight">ParkFlow</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 px-3 py-1.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition" onClick={() => navigate("/profile")}>
              <div className="h-6 w-6 rounded-full bg-neutral-950 dark:bg-white dark:text-neutral-950 text-white text-xs font-bold flex items-center justify-center">{userName.charAt(0).toUpperCase()}</div>
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">{userName}</span>
              </div>
            <button onClick={toggle} className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition">
              {dark ? "☀️" : "🌙"}
            </button>
            <button onClick={logout} className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-4 py-1.5 text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400 transition">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className={`fixed md:sticky top-[53px] h-[calc(100vh-53px)] z-40 w-56 bg-white dark:bg-neutral-900 border-r border-black/5 dark:border-white/5 flex flex-col py-6 px-3 transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <nav className="flex flex-col gap-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => { setActiveNav(n.id); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left
                  ${activeNav === n.id ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                <span className="text-base">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-3">
            <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition mb-2">
              <span className="text-base">👤</span> Profile
            </Link>
            <div className="rounded-xl bg-neutral-50 border border-black/5 p-3">
              <p className="text-xs font-semibold text-neutral-500 mb-1">Occupancy</p>
              <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${occupancyPct >= 80 ? "bg-red-500" : occupancyPct >= 50 ? "bg-amber-400" : "bg-emerald-500"}`}
                  style={{ width: `${occupancyPct}%` }} />
              </div>
              <p className="text-xs text-neutral-400 mt-1">{occupancyPct}% full</p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full flex flex-col gap-8">

          {/* OVERVIEW */}
          {activeNav === "overview" && (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Good day, {userName} 👋</h1>
                <p className="mt-1 text-sm text-neutral-500">Here's your parking overview.</p>
              </div>

              {/* Active Booking Card */}
              {!loading && activeBooking && (
                <div className="rounded-2xl bg-emerald-950 text-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl">🅿</div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Currently Parked</p>
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-2xl font-black">{activeBooking.slotNumber}</span>
                      {activeBooking.vehicleNumber && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold">🚗 {activeBooking.vehicleNumber}</span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-emerald-300">
                      <span>⏱ {liveDuration(activeBooking.bookingTime)}</span>
                      <span>📅 {new Date(activeBooking.bookingTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => releaseSlot(activeBooking.id)}
                      className="rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs font-bold hover:bg-white/20 transition">
                      Release
                    </button>
                    <button onClick={() => cancelBooking(activeBooking.id)}
                      className="rounded-full bg-red-500/20 border border-red-400/30 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-500/30 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) :
                  stats.map(s => (
                    <div key={s.label} className={`rounded-2xl ${s.bg} border border-black/5 p-5 shadow-sm`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl">{s.icon}</span>
                        <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-500">{s.label}</p>
                    </div>
                  ))
                }
              </div>

              {/* Occupancy Bar */}
              <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-neutral-950">Lot Occupancy</h2>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${occupancyPct >= 80 ? "bg-red-100 text-red-600" : occupancyPct >= 50 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                    {loading ? "—" : `${occupancyPct}% full`}
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${occupancyPct >= 80 ? "bg-red-500" : occupancyPct >= 50 ? "bg-amber-400" : "bg-emerald-500"}`}
                    style={{ width: `${occupancyPct}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-neutral-400">
                  <span>{freeSlots} spots available</span>
                  <span>{occupiedSlots} / {totalSlots} occupied</span>
                </div>
              </div>

              {/* Quick Book */}
              <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-neutral-950 mb-4">Quick Book</h2>
                {queueInfo?.inQueue ? (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-4">
                    <p className="text-sm font-semibold text-blue-700">You are in the waiting queue</p>
                    <p className="text-xs text-blue-500 mt-1">Position: <span className="font-bold">#{queueInfo.position}</span> — You'll be auto-assigned when a slot frees up.</p>
                    <button onClick={leaveQueue} className="mt-3 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition">
                      Leave queue
                    </button>
                  </div>
                ) : activeBookings > 0 ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
                    You already have an active booking. Release it before booking a new slot.
                  </div>
                ) : (
                  <>
                    {bookError && <div className="mb-3 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{bookError}</div>}
                    <div className="flex gap-2 max-w-sm">
                      <input type="text" placeholder="Enter slot e.g. A1" value={slotNumber}
                        onChange={e => setSlotNumber(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && bookSlot()}
                        className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
                      <button onClick={bookSlot} className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white! hover:bg-neutral-800 transition">Book</button>
                    </div>
                    <input type="text" placeholder="Vehicle number e.g. MH12AB1234 (optional)" value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value)}
                      className="mt-2 max-w-sm w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
                    <button onClick={autoBook} className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition">
                      ✨ Auto-assign best slot
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* SLOTS */}
          {activeNav === "slots" && (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Parking Slots</h1>
                <p className="mt-1 text-sm text-neutral-500">Click a green slot to book instantly.</p>
              </div>

              {/* Book form */}
              {activeBookings === 0 && (
                <div className="rounded-2xl bg-white/80 border border-black/5 p-5 shadow-sm">
                  {bookError && <div className="mb-3 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{bookError}</div>}
                  <div className="flex gap-2 max-w-sm">
                    <input type="text" placeholder="Enter slot e.g. A1" value={slotNumber}
                      onChange={e => setSlotNumber(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && bookSlot()}
                      className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
                    <button onClick={bookSlot} className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white! hover:bg-neutral-800 transition">Book</button>
                    <button onClick={autoBook} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition">✨ Auto</button>
                  </div>
                  <input type="text" placeholder="Vehicle number e.g. MH12AB1234 (optional)" value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    className="mt-2 max-w-sm w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition" />
                </div>
              )}

              {/* Slot Grid */}
              <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6 text-xs font-semibold text-neutral-500">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" />Available</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-400" />Occupied</span>
                </div>
                {loading ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {Array(8).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-neutral-400">No slots available.</p>
                ) : (() => {
                  const floors = [...new Set(slots.map(s => s.floor))].sort();
                  return floors.map(floor => (
                    <div key={floor} className="mb-4">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Floor {floor}</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {slots.filter(s => s.floor === floor).map(slot => (
                          <button key={slot.id}
                            onClick={() => slot.available && activeBookings === 0 && bookSlot(slot.slotNumber)}
                            disabled={!slot.available || activeBookings > 0}
                            className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1 border-2 font-bold text-sm transition
                              ${slot.available && activeBookings === 0
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:scale-105 cursor-pointer"
                                : "bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-80"
                              }`}>
                            <span className={`h-2 w-2 rounded-full ${slot.available ? "bg-emerald-500" : "bg-red-400"}`} />
                            {slot.slotNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </>
          )}

          {/* BOOKINGS */}
          {activeNav === "bookings" && (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-950">My Bookings</h1>
                <p className="mt-1 text-sm text-neutral-500">View and manage your parking history.</p>
              </div>

              <div className="rounded-2xl bg-white/80 border border-black/5 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-black/5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{myBookings.length} booking{myBookings.length !== 1 ? "s" : ""}</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Search by slot or vehicle…"
                      value={bookingSearch}
                      onChange={e => setBookingSearch(e.target.value)}
                      className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition w-full sm:w-60"
                    />
                    <button
                      onClick={exportMyBookingsCSV}
                      disabled={myBookings.length === 0}
                      className="shrink-0 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
                      Export CSV
                    </button>
                  </div>
                </div>
                {loading ? (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-neutral-50 border-b border-black/5 text-left">
                      {["ID","Slot","Vehicle","Booked At","Exit At","Status","Cost","Actions"].map(h => <th key={h} className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-black/5">{Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)}</tbody>
                  </table>
                ) : filteredBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-2xl">🅿</div>
                    <p className="text-sm font-semibold text-neutral-500">{bookingSearch ? "No results found." : "No bookings yet"}</p>
                    {!bookingSearch && <button onClick={() => setActiveNav("slots")} className="text-xs text-neutral-950 underline">Browse slots →</button>}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-neutral-50 border-b border-black/5 text-left">
                        {["ID","Slot","Vehicle","Booked At","Exit At","Status","Cost","Actions"].map(h => <th key={h} className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">{h}</th>)}
                      </tr></thead>
                      <tbody className="divide-y divide-black/5">
                        {filteredBookings.map(b => (
                          <tr key={b.id} className="hover:bg-neutral-50/60 transition">
                            <td className="px-6 py-4 text-neutral-400 font-mono text-xs">#{b.id}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-sm font-bold text-neutral-950">🅿 {b.slotNumber}</span>
                            </td>
                            <td className="px-6 py-4">
                              {b.vehicleNumber
                                ? <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">🚗 {b.vehicleNumber}</span>
                                : <span className="text-neutral-300 text-xs">—</span>}
                            </td>
                            <td className="px-6 py-4 text-xs text-neutral-500">
                              {b.bookingTime ? new Date(b.bookingTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                            </td>
                            <td className="px-6 py-4 text-xs text-neutral-500">
                              {b.exitTime ? new Date(b.exitTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : <span className="text-neutral-300">—</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${b.active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${b.active ? "bg-emerald-500" : "bg-neutral-400"}`} />
                                {b.active ? "Active" : "Completed"}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              {b.active
                                ? <span className="text-neutral-400 text-xs">Pending</span>
                                : <div className="flex flex-col gap-0.5">
                                    <span className="text-emerald-700">₹{b.cost?.toFixed(0) ?? "—"}</span>
                                    {formatDuration(b.bookingTime, b.exitTime) && (
                                      <span className="text-xs text-neutral-400">{formatDuration(b.bookingTime, b.exitTime)}</span>
                                    )}
                                  </div>
                              }
                            </td>
                            <td className="px-6 py-4">
                              {b.active && (
                                <div className="flex gap-2">
                                  <button onClick={() => releaseSlot(b.id)} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition">Release</button>
                                  <button onClick={() => cancelBooking(b.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition">Cancel</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
