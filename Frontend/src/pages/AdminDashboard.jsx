import { useState, useEffect } from "react";
import API from "../services/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { SkeletonCard, SkeletonSlot, SkeletonRow } from "../components/Skeletons";
import { useTheme } from "../hooks/useTheme";

export default function AdminDashboard() {
  const [slots, setSlots] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [queue, setQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmForceRelease, setConfirmForceRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("all");
  const [slotSearch, setSlotSearch] = useState("");
  const [newSlotNumber, setNewSlotNumber] = useState("");
  const [newSlotFloor, setNewSlotFloor] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(20);
  const [rateInput, setRateInput] = useState("");
  const [editingRate, setEditingRate] = useState(false);
  const toast = useToast();
  const { dark, toggle } = useTheme();

  useEffect(() => { document.title = "Admin Dashboard — ParkFlow"; }, []);

  const fetchSlots = async () => {
    const res = await API.get("/slots/all");
    setSlots(res.data);
  };

  const fetchAllBookings = async () => {
    const res = await API.get("/admin/bookings");
    setAllBookings(res.data);
  };

  const fetchQueue = async () => {
    const res = await API.get("/admin/queue");
    setQueue(res.data);
  };

  const fetchUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  };

  const fetchAnalytics = async () => {
    const res = await API.get("/admin/analytics");
    setAnalytics(res.data);
  };

  const fetchConfig = async () => {
    const res = await API.get("/admin/config");
    setHourlyRate(res.data.hourlyRate);
  };

  const saveRate = async () => {
    const val = parseFloat(rateInput);
    if (!val || val <= 0) return;
    await API.put("/admin/config/rate", { hourlyRate: val });
    setHourlyRate(val);
    setEditingRate(false);
    toast(`Hourly rate updated to ₹${val}/hr`, "success");
  };

  const addSlot = async () => {
    if (!newSlotNumber.trim()) return;
    try {
      await API.post(`/admin/slot?slotNumber=${newSlotNumber.trim()}&floor=${newSlotFloor}`);
      setNewSlotNumber("");
      fetchSlots();
      toast(`Slot ${newSlotNumber.trim()} added on Floor ${newSlotFloor}.`, "success");
    } catch (err) {
      toast(err.response?.data || "Failed to add slot.", "error");
    }
  };

  useEffect(() => {
    Promise.all([fetchSlots(), fetchAllBookings(), fetchQueue(), fetchUsers(), fetchConfig(), fetchAnalytics()]).finally(() => setLoading(false));

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:3955/ws"),
      onConnect: () => {
        client.subscribe("/topic/slots", () => {
          fetchSlots();
          fetchAllBookings();
          fetchQueue();
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, []);

const deleteSlot = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete;
    setConfirmDelete(null);
    try {
      await API.delete(`/slots/${id}`);
      fetchSlots();
      toast("Slot deleted.", "info");
    } catch (err) {
      toast(err.response?.data || "Failed to delete slot.", "error");
    }
  };

  const handleForceRelease = async () => {
    const id = confirmForceRelease;
    setConfirmForceRelease(null);
    try {
      await API.post(`/admin/force-release/${id}`);
      fetchSlots(); fetchAllBookings(); fetchQueue();
      toast("Slot force-released.", "info");
    } catch (err) {
      toast(err.response?.data || "Force release failed.", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const totalSlots = slots.length;
  const freeSlots = slots.filter((s) => s.available).length;
  const occupiedSlots = slots.filter((s) => !s.available).length;
  const activeBookings = allBookings.filter((b) => b.active).length;

  const exportCSV = () => {
    const rows = [
      ["ID", "User Email", "Slot", "Vehicle", "Status"],
      ...allBookings.map((b) => [b.id, b.userEmail, b.slotNumber, b.vehicleNumber ?? "", b.active ? "Active" : "Inactive"]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredBookings = allBookings.filter((b) =>
    b.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    b.slotNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSlots = slots
    .filter(s => slotFilter === "all" || (slotFilter === "available" ? s.available : !s.available))
    .filter(s => s.slotNumber.toLowerCase().includes(slotSearch.toLowerCase()));
  const slotFloors = [...new Set(filteredSlots.map(s => s.floor))].sort();

  const stats = [
    { label: "Total Slots", value: totalSlots, color: "text-neutral-950" },
    { label: "Available", value: freeSlots, color: "text-emerald-600" },
    { label: "Occupied", value: occupiedSlots, color: "text-red-500" },
    { label: "Active Bookings", value: activeBookings, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-[#f6efe5] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">

      {confirmDelete && (
        <ConfirmDialog
          title="Delete slot?"
          message="This will permanently remove the slot and any associated bookings."
          confirmLabel="Delete"
          confirmStyle="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmForceRelease && (
        <ConfirmDialog
          title="Force release slot?"
          message="This will immediately release the slot and calculate the cost for the user."
          confirmLabel="Force Release"
          confirmStyle="warning"
          onConfirm={handleForceRelease}
          onCancel={() => setConfirmForceRelease(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/60 dark:bg-neutral-900/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 w-full">
        <div className="flex items-center justify-between px-8 py-4 w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-black">
              P
            </div>
            <span className="font-semibold text-lg tracking-tight">ParkFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              Admin
            </span>
            <button onClick={toggle} className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition">
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={logout}
              className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Page title */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">Slots are managed automatically. Monitor bookings in real time.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 px-4 py-3 shadow-sm">
            <span className="text-xs font-semibold text-neutral-500">Hourly Rate</span>
            {editingRate ? (
              <>
                <input type="number" value={rateInput} onChange={e => setRateInput(e.target.value)}
                  className="w-20 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20"
                  autoFocus onKeyDown={e => e.key === "Enter" && saveRate()} />
                <button onClick={saveRate} className="rounded-lg bg-neutral-950 dark:bg-white px-3 py-1 text-xs font-bold text-white! dark:text-neutral-950 hover:bg-neutral-800 transition">Save</button>
                <button onClick={() => setEditingRate(false)} className="text-xs text-neutral-400 hover:text-neutral-600 transition">Cancel</button>
              </>
            ) : (
              <>
                <span className="text-base font-black text-neutral-950 dark:text-white">₹{hourlyRate}/hr</span>
                <button onClick={() => { setRateInput(String(hourlyRate)); setEditingRate(true); }}
                  className="rounded-lg border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 transition">
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {["bookings", "users", "analytics"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition capitalize
                ${activeTab === tab ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950" : "bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"}`}>
              {tab === "bookings" ? "📋 Bookings" : tab === "users" ? "👥 Users" : "📊 Analytics"}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-5 shadow-sm">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-xs text-neutral-500 font-medium">{s.label}</p>
              </div>
            ))
          }
        </div>

        {/* Charts */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Slot Occupancy Chart */}
            <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white mb-4">Slot Occupancy</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Available", value: freeSlots, total: totalSlots, color: "bg-emerald-500" },
                  { label: "Occupied", value: occupiedSlots, total: totalSlots, color: "bg-red-400" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                      <span>{item.label}</span>
                      <span>{item.value} / {item.total}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                        style={{ width: item.total === 0 ? "0%" : `${Math.round((item.value / item.total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Status Chart */}
            <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white mb-4">Booking Status</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Active", value: allBookings.filter(b => b.active).length, color: "bg-emerald-500" },
                  { label: "Completed", value: allBookings.filter(b => !b.active && b.exitTime).length, color: "bg-blue-400" },
                  { label: "Cancelled", value: allBookings.filter(b => !b.active && !b.exitTime).length, color: "bg-neutral-400" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                        style={{ width: allBookings.length === 0 ? "0%" : `${Math.round((item.value / allBookings.length) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* All Slots */}
        <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">All Slots</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add slot */}
              <input type="text" placeholder="Slot e.g. C1" value={newSlotNumber}
                onChange={e => setNewSlotNumber(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSlot()}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition w-24" />
              <select value={newSlotFloor} onChange={e => setNewSlotFloor(Number(e.target.value))}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition">
                {[1,2,3,4,5].map(f => <option key={f} value={f}>Floor {f}</option>)}
              </select>
              <button onClick={addSlot}
                className="rounded-xl bg-neutral-950 dark:bg-white px-3 py-1.5 text-xs font-bold text-white! dark:text-neutral-950 hover:bg-neutral-800 transition">Add</button>
              <div className="w-px h-5 bg-black/10 dark:bg-white/10" />
              <input type="text" placeholder="Search slot…" value={slotSearch}
                onChange={e => setSlotSearch(e.target.value)}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition w-28" />
              {["all", "available", "occupied"].map(f => (
                <button key={f} onClick={() => setSlotFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition capitalize
                    ${slotFilter === f
                      ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex flex-wrap gap-2.5">
              {Array(6).fill(0).map((_, i) => <SkeletonSlot key={i} />)}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-neutral-400">No slots found.</p>
          ) : (
            <div>
              {slotFloors.map(floor => (
                <div key={floor} className="mb-4">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Floor {floor}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {filteredSlots.filter(s => s.floor === floor).map(slot => {
                      const booking = allBookings.find(b => b.slotNumber === slot.slotNumber && b.active);
                      return (
                        <div key={slot.id}
                          title={!slot.available && booking?.vehicleNumber ? `Vehicle: ${booking.vehicleNumber}` : undefined}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition cursor-default
                            ${slot.available ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                          <span className={`h-2 w-2 rounded-full ${slot.available ? "bg-emerald-500" : "bg-red-500"}`} />
                          {slot.slotNumber}
                          <span className="text-xs font-normal opacity-70">
                            {slot.available ? "Free" : booking ? (booking.vehicleNumber ? `${booking.userEmail} · ${booking.vehicleNumber}` : booking.userEmail) : "Booked"}
                          </span>
                          <button onClick={() => deleteSlot(slot.id)} className="ml-1 opacity-50 hover:opacity-100 transition text-xs leading-none">✕</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Bookings */}
        {activeTab === "bookings" && (
        <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-black/5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="text-base font-semibold text-neutral-950">All Bookings</h2>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search by email or slot…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/20 transition w-full sm:w-64"
              />
              <button
                onClick={exportCSV}
                disabled={allBookings.length === 0}
                className="shrink-0 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Export CSV
              </button>
            </div>
          </div>
          {loading ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-black/5 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">User Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Slot</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          ) : filteredBookings.length === 0 ? (
            <p className="px-6 py-5 text-sm text-neutral-400">{search ? "No results found." : "No bookings yet."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black/5 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">User Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Slot</th>
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/60 transition">
                      <td className="px-6 py-3.5 text-neutral-500 font-mono text-xs">{b.id}</td>
                      <td className="px-6 py-3.5 text-neutral-700">{b.userEmail}</td>
                      <td className="px-6 py-3.5 font-semibold text-neutral-950">{b.slotNumber}</td>
                      <td className="px-6 py-3.5">
                        {b.vehicleNumber
                          ? <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">🚗 {b.vehicleNumber}</span>
                          : <span className="text-neutral-300 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${b.active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${b.active ? "bg-emerald-500" : "bg-neutral-400"}`} />
                          {b.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm font-semibold">
                        {b.active
                          ? <span className="text-neutral-400 text-xs">Pending</span>
                          : <span className="text-emerald-700">₹{b.cost?.toFixed(0) ?? "—"}</span>
                        }
                      </td>
                      <td className="px-6 py-3.5">
                        {b.active && (
                          <button
                            onClick={() => setConfirmForceRelease(b.id)}
                            className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition">
                            Force Release
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5">
              <h2 className="text-base font-semibold text-neutral-950 dark:text-white">All Users <span className="ml-2 text-xs font-normal text-neutral-400">{users.length} registered</span></h2>
            </div>
            {loading ? (
              <p className="px-6 py-5 text-sm text-neutral-400">Loading...</p>
            ) : users.length === 0 ? (
              <p className="px-6 py-5 text-sm text-neutral-400">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800 border-b border-black/5 dark:border-white/5 text-left">
                      {["ID","Name","Email","Role","Total Bookings","Active"].map(h => (
                        <th key={h} className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/60 transition">
                        <td className="px-6 py-3.5 text-neutral-400 font-mono text-xs">{u.id}</td>
                        <td className="px-6 py-3.5 font-semibold text-neutral-950 dark:text-white">{u.name}</td>
                        <td className="px-6 py-3.5 text-neutral-600 dark:text-neutral-300">{u.email}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                            ${u.role === "ADMIN" ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-neutral-700 dark:text-neutral-300">{u.totalBookings}</td>
                        <td className="px-6 py-3.5">
                          {u.activeBookings > 0
                            ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{u.activeBookings} active</span>
                            : <span className="text-neutral-300 dark:text-neutral-600 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: `₹${analytics.totalRevenue?.toFixed(0) ?? 0}`, color: "text-emerald-600" },
                { label: "Total Bookings", value: analytics.totalBookings, color: "text-neutral-950 dark:text-white" },
                { label: "Completed", value: analytics.completedBookings, color: "text-blue-600" },
                { label: "Cancelled", value: analytics.cancelledBookings, color: "text-neutral-400" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-5 shadow-sm">
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="mt-1 text-xs text-neutral-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-neutral-950 dark:text-white mb-4">Top 5 Most Used Slots</h2>
                {analytics.topSlots.length === 0 ? <p className="text-sm text-neutral-400">No data yet.</p> : (
                  <div className="flex flex-col gap-3">
                    {analytics.topSlots.map((s, i) => (
                      <div key={s.slot}>
                        <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                          <span>#{i + 1} Slot {s.slot}</span><span>{s.count} bookings</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div className="h-full rounded-full bg-neutral-950 dark:bg-white transition-all duration-700"
                            style={{ width: `${Math.round((s.count / analytics.topSlots[0].count) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-neutral-950 dark:text-white mb-4">Top 5 Most Active Users</h2>
                {analytics.topUsers.length === 0 ? <p className="text-sm text-neutral-400">No data yet.</p> : (
                  <div className="flex flex-col gap-3">
                    {analytics.topUsers.map((u, i) => (
                      <div key={u.email}>
                        <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                          <span className="truncate max-w-[160px]">#{i + 1} {u.email}</span><span>{u.count} bookings</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-500 transition-all duration-700"
                            style={{ width: `${Math.round((u.count / analytics.topUsers[0].count) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
