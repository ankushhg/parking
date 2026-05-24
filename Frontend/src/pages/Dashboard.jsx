import { useState, useEffect } from "react";
import API from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useTheme } from "../hooks/useTheme";
import ConfirmDialog from "../components/ConfirmDialog";
import ReceiptModal from "../components/ReceiptModal";
import { SkeletonCard, SkeletonSlot, SkeletonRow } from "../components/Skeletons";
import LocationTab from "./LocationTab";

const NAV = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "slots", label: "Parking Slots", icon: "🅿" },
  { id: "bookings", label: "My Bookings", icon: "📋" },
  { id: "location", label: "Location", icon: "📍" },
  { id: "profile", label: "Profile", icon: "👤" },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeNav = searchParams.get("tab") || "overview";
  const setActiveNav = (tab) => setSearchParams({ tab });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | available | occupied
  const [filterFloor, setFilterFloor] = useState("all");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [now, setNow] = useState(Date.now());
  // Profile tab state
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const token = localStorage.getItem("token");
  const tokenPayload = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const userName = tokenPayload.name || tokenPayload.sub || "User";
  const userEmail = tokenPayload.sub || "";

  useEffect(() => { document.title = "My Dashboard — ParkFlow"; setNameInput(tokenPayload.name || ""); }, []);

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

  const fetchSlots = async () => {
    const res = await API.get("/user/slots");
    setSlots(res.data.map(s => ({ ...s, available: s.status === "AVAILABLE", floor: s.zone })));
  };
  const fetchMyBookings = async () => {
    const res = await API.get("/user/sessions");
    setMyBookings(res.data.map(s => ({
      id: s.sessionId,
      slotNumber: s.slotNumber,
      vehicleNumber: s.vehicleNumber,
      active: s.status === "ACTIVE",
      bookingTime: s.checkIn,
      exitTime: s.checkOut,
      cost: s.amountCharged,
    })));
  };
  const fetchQueueInfo = async () => { setQueueInfo(null); };

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
      const targetSlot = slots.find(s => s.slotNumber === target);
      if (!targetSlot) return setBookError("Slot not found.");
      const vn = vehicleNumber.trim();
      await API.post(`/user/checkin`, {
        vehicleNumber: vn || "UNKNOWN",
        vehicleType: targetSlot.vehicleType || "TWO_WHEELER",
        preferredZone: targetSlot.zone,
        slotId: targetSlot.id,
      });
      setSlotNumber(""); setVehicleNumber(""); fetchSlots(); fetchMyBookings();
      toast("Slot booked successfully!", "success");
    } catch (err) { setBookError(err.response?.data?.error || err.response?.data?.message || "Booking failed."); }
  };

  const autoBook = async () => {
    setBookError("");
    try {
      const availableSlot = slots.find(s => s.available);
      if (!availableSlot) return setBookError("No slots available.");
      await API.post(`/user/checkin`, {
        vehicleNumber: vehicleNumber.trim() || "UNKNOWN",
        vehicleType: availableSlot.vehicleType || "TWO_WHEELER",
        preferredZone: availableSlot.zone,
        slotId: availableSlot.id,
      });
      fetchSlots(); fetchMyBookings();
      toast("Best slot auto-assigned!", "success");
    } catch (err) {
      setBookError(err.response?.data?.error || err.response?.data?.message || "Auto booking failed.");
    }
  };

  const leaveQueue = async () => { setQueueInfo(null); };

  const releaseSlot = (bookingId) => setConfirm({ type: "release", bookingId });
  const cancelBooking = (bookingId) => setConfirm({ type: "cancel", bookingId });

  const handleConfirm = async () => {
    const { type, bookingId } = confirm;
    setConfirm(null);
    if (type === "release") {
      try {
        const res = await API.post(`/user/checkout/${bookingId}`);
        fetchSlots(); fetchMyBookings();
        setReceipt({ ...res.data, cost: res.data.amountCharged, slotNumber: res.data.slotNumber, bookingTime: res.data.checkIn, exitTime: res.data.checkOut });
      }
      catch (err) { toast(err.response?.data?.message || "Release failed.", "error"); }
    } else {
      try { await API.post(`/user/checkout/${bookingId}`); fetchSlots(); fetchMyBookings(); toast("Booking cancelled.", "info"); }
      catch (err) { toast(err.response?.data?.message || "Cancel failed.", "error"); }
    }
  };

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("role"); window.location.href = "/"; };

  const handleUpdateName = async () => {
    setNameError("");
    if (!nameInput.trim()) return setNameError("Name cannot be empty.");
    if (nameInput.trim() === userName) return;
    setNameLoading(true);
    try {
      const res = await API.put("/auth/update-name", { name: nameInput.trim() });
      localStorage.setItem("token", res.data.token);
      toast("Name updated!", "success");
      window.location.reload();
    } catch (err) {
      const d = err.response?.data;
      setNameError(typeof d === "string" ? d : d?.error || d?.message || "Failed to update name.");
    } finally { setNameLoading(false); }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!currentPassword || !newPassword || !confirmPassword) return setPwError("All fields are required.");
    if (newPassword !== confirmPassword) return setPwError("New passwords do not match.");
    if (newPassword.length < 8) return setPwError("Password must be at least 8 characters.");
    setPwLoading(true);
    try {
      await API.post("/auth/change-password", { currentPassword, newPassword });
      toast("Password changed!", "success");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      const d = err.response?.data;
      setPwError(typeof d === "string" ? d : d?.error || d?.message || "Failed to change password.");
    } finally { setPwLoading(false); }
  };

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
    <div className="min-h-screen dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col" style={{ background: "#0d0500", fontFamily: "'Lato',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');
        .t-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important; }
      `}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#ff6b00,#c9a84c,#ff6b00)", zIndex: 100 }} />

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
      <header className="sticky z-50 w-full" style={{ top: 4, background: "rgba(13,5,0,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="flex items-center justify-between px-6 py-3 w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)} className="md:hidden flex flex-col gap-1 p-2">
              <span className="block h-0.5 w-5 bg-neutral-700" />
              <span className="block h-0.5 w-5 bg-neutral-700" />
              <span className="block h-0.5 w-5 bg-neutral-700" />
            </button>
            <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: "1.3rem" }}>🕉</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", color: "#c9a84c", fontWeight: 700 }}>ParkFlow</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 cursor-pointer transition" style={{ borderRadius: 20, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", padding: "6px 12px" }} onClick={() => navigate("/profile")}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif" }}>{userName.charAt(0).toUpperCase()}</div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f0d080", fontFamily: "'Cinzel',serif" }}>{userName}</span>
              </div>
            <button onClick={toggle} style={{ borderRadius: 20, border: "1px solid rgba(201,168,76,0.2)", background: "rgba(255,255,255,0.04)", padding: "6px 12px", fontSize: "0.85rem", cursor: "pointer", color: "#fff" }}>
              {dark ? "☀️" : "🌙"}
            </button>
            <button onClick={logout} style={{ borderRadius: 20, border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.06)", padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", color: "rgba(255,120,120,0.9)", fontFamily: "'Cinzel',serif", letterSpacing: 1, transition: "all 0.2s" }}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className={`fixed md:sticky top-[53px] h-[calc(100vh-53px)] z-40 w-56 flex flex-col py-6 px-3 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`} style={{ background: "#100600", borderRight: "1px solid rgba(201,168,76,0.15)" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => { setActiveNav(n.id); setSidebarOpen(false); window.scrollTo(0,0); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.2s", textAlign: "left", fontFamily: "'Cinzel',serif", letterSpacing: 0.5, background: activeNav === n.id ? "linear-gradient(135deg,#ff6b00,#c04500)" : "transparent", color: activeNav === n.id ? "#fff" : "rgba(255,255,255,0.5)" }}>
                <span style={{ fontSize: "1rem" }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <div style={{ borderRadius: 8, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", padding: 12 }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Occupancy</p>
              <div style={{ height: 6, width: "100%", borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, transition: "width 0.7s", width: `${occupancyPct}%`, background: occupancyPct >= 80 ? "#ef4444" : occupancyPct >= 50 ? "#f59e0b" : "#10b981" }} />
              </div>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{occupancyPct}% full</p>
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
                <p className="mt-1 text-sm text-neutral-500">Select an available slot to book — just like booking a bus seat.</p>
              </div>

              {/* Filters */}
              <div className="rounded-2xl bg-white/80 border border-black/5 p-4 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500">Status:</span>
                  {["all", "available", "occupied"].map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                        filterStatus === f
                          ? f === "available" ? "bg-emerald-600 text-white border-emerald-600"
                            : f === "occupied" ? "bg-red-500 text-white border-red-500"
                            : "bg-neutral-950 text-white border-neutral-950"
                          : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                      }`}>
                      {f === "all" ? "All" : f === "available" ? "✓ Available" : "✗ Occupied"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500">Floor:</span>
                  {["all", ...[...new Set(slots.map(s => s.floor))].sort()].map(f => (
                    <button key={f} onClick={() => setFilterFloor(String(f))}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                        filterFloor === String(f)
                          ? "bg-neutral-950 text-white border-neutral-950"
                          : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                      }`}>
                      {f === "all" ? "All Floors" : `Floor ${f}`}
                    </button>
                  ))}
                </div>
                <button onClick={autoBook} disabled={activeBookings > 0}
                  className="ml-auto px-4 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  ✨ Auto-assign best slot
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 text-xs font-semibold text-neutral-500 px-1">
                <span className="flex items-center gap-2"><span className="h-7 w-7 rounded-lg bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 text-xs font-bold">P</span> Available</span>
                <span className="flex items-center gap-2"><span className="h-7 w-7 rounded-lg bg-red-100 border-2 border-red-300 flex items-center justify-center text-red-400 text-xs font-bold">P</span> Occupied</span>
                <span className="flex items-center gap-2"><span className="h-7 w-7 rounded-lg bg-blue-600 border-2 border-blue-700 flex items-center justify-center text-white text-xs font-bold">P</span> Selected</span>
              </div>

              {/* Slot Grid - RedBus Style */}
              <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
                {loading ? (
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                    {Array(10).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-neutral-400">No slots available.</p>
                ) : (() => {
                  const floors = [...new Set(slots.map(s => s.floor))].sort()
                    .filter(f => filterFloor === "all" || String(f) === filterFloor);
                  return floors.map(floor => {
                    const floorSlots = slots
                      .filter(s => s.floor === floor)
                      .filter(s => filterStatus === "all" ? true : filterStatus === "available" ? s.available : !s.available);
                    if (floorSlots.length === 0) return null;
                    return (
                      <div key={floor} className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Floor {floor}</span>
                          <span className="text-xs text-emerald-600 font-semibold">{floorSlots.filter(s => s.available).length} available</span>
                          <span className="text-xs text-red-500 font-semibold">{floorSlots.filter(s => !s.available).length} occupied</span>
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                          {floorSlots.map(slot => {
                            const isSelected = selectedSlot?.id === slot.id;
                            const canBook = slot.available && activeBookings === 0;
                            return (
                              <button key={slot.id}
                                onClick={() => canBook && setSelectedSlot(isSelected ? null : slot)}
                                disabled={!canBook}
                                title={!slot.available ? "Occupied" : activeBookings > 0 ? "You already have an active booking" : `Book slot ${slot.slotNumber}`}
                                className={`relative h-16 w-full rounded-xl flex flex-col items-center justify-center gap-1 border-2 font-bold text-sm transition-all duration-150
                                  ${ isSelected
                                      ? "bg-blue-600 border-blue-700 text-white scale-105 shadow-lg shadow-blue-200"
                                      : canBook
                                        ? "bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:scale-105 hover:shadow-md cursor-pointer"
                                        : "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-75"
                                  }`}>
                                <span className="text-lg">{slot.available ? "🟢" : "🔴"}</span>
                                <span className="text-xs font-black">{slot.slotNumber}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Booking Panel - appears when slot selected */}
              {selectedSlot && (
                <div className="sticky bottom-4 z-30 rounded-2xl bg-neutral-950 text-white p-5 shadow-2xl shadow-black/40 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black">{selectedSlot.slotNumber}</div>
                    <div>
                      <p className="text-sm font-bold">Slot {selectedSlot.slotNumber} selected</p>
                      <p className="text-xs text-neutral-400">Floor {selectedSlot.floor}</p>
                    </div>
                  </div>
                  <input type="text" placeholder="Vehicle number (optional)" value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-neutral-400 outline-none focus:ring-2 focus:ring-white/30 transition w-full sm:w-56" />
                  {bookError && <p className="text-xs text-red-400">{bookError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedSlot(null)}
                      className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 transition">
                      Cancel
                    </button>
                    <button onClick={() => { bookSlot(selectedSlot.slotNumber); setSelectedSlot(null); }}
                      className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold hover:bg-emerald-400 transition">
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}
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

          {/* LOCATION */}
          {activeNav === "location" && <LocationTab />}

          {/* PROFILE */}
          {activeNav === "profile" && (
            <>
              <div>
                <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.4rem", color: "#c9a84c", marginBottom: 4 }}>My Profile</h1>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>View your account details and manage your password.</p>
              </div>

              {/* Account Info */}
              <div style={ps.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", fontSize: "1.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Cinzel',serif" }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", color: "#f0d080", fontWeight: 600 }}>{userName}</p>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>{userEmail}</p>
                    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 20, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", padding: "2px 10px", fontSize: "0.7rem", fontWeight: 600, color: "#10b981", letterSpacing: 1 }}>Active account</span>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div style={ps.card}>
                <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "0.95rem", color: "#f0d080", marginBottom: 16, letterSpacing: 1 }}>Display Name</h2>
                {nameError && <div style={ps.error}>{nameError}</div>}
                <div style={{ display: "flex", gap: 10, maxWidth: 380 }}>
                  <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleUpdateName()}
                    placeholder="Your name" className="t-input" style={ps.input} />
                  <button onClick={handleUpdateName} disabled={nameLoading || nameInput.trim() === userName}
                    style={{ ...ps.btnPrimary, padding: "10px 20px", opacity: (nameLoading || nameInput.trim() === userName) ? 0.5 : 1, cursor: (nameLoading || nameInput.trim() === userName) ? "not-allowed" : "pointer", flexShrink: 0 }}>
                    {nameLoading ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div style={ps.card}>
                <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "0.95rem", color: "#f0d080", marginBottom: 16, letterSpacing: 1 }}>Change Password</h2>
                {pwError && <div style={ps.error}>{pwError}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[["Current password", currentPassword, setCurrentPassword], ["New password", newPassword, setNewPassword], ["Confirm new password", confirmPassword, setConfirmPassword]].map(([label, val, set]) => (
                    <div key={label}>
                      <label style={ps.label}>{label}</label>
                      <input type="password" value={val} onChange={e => set(e.target.value)}
                        placeholder="••••••••" className="t-input" style={ps.input}
                        onKeyDown={label === "Confirm new password" ? e => e.key === "Enter" && handleChangePassword() : undefined} />
                    </div>
                  ))}
                </div>
                <button onClick={handleChangePassword} disabled={pwLoading}
                  style={{ ...ps.btnPrimary, marginTop: 20, opacity: pwLoading ? 0.6 : 1, cursor: pwLoading ? "not-allowed" : "pointer" }}>
                  {pwLoading ? "Saving…" : "Update Password"}
                </button>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}

const ps = {
  card: { background: "linear-gradient(145deg,#1e0c02,#150800)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "28px 24px" },
  label: { display: "block", fontSize: "0.72rem", letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 5, color: "#fff", fontSize: "0.95rem", outline: "none", transition: "border-color 0.25s, box-shadow 0.25s", boxSizing: "border-box" },
  btnPrimary: { padding: "12px 28px", background: "linear-gradient(135deg,#ff6b00,#c04500)", color: "#fff", border: "none", borderRadius: 5, fontFamily: "'Cinzel',serif", fontSize: "0.85rem", letterSpacing: 2, transition: "all 0.3s", boxShadow: "0 4px 20px rgba(255,107,0,0.35)", textTransform: "uppercase", display: "inline-block", cursor: "pointer" },
  error: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 4, padding: "10px 14px", marginBottom: 16, fontSize: "0.82rem", color: "#ff7070" },
};
