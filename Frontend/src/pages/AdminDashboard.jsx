import { useState, useEffect } from "react";
import API from "../services/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { SkeletonCard, SkeletonSlot, SkeletonRow } from "../components/Skeletons";

export default function AdminDashboard() {
  const [slots, setSlots] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [queue, setQueue] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();

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

  useEffect(() => {
    Promise.all([fetchSlots(), fetchAllBookings(), fetchQueue()]).finally(() => setLoading(false));

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
      ["ID", "User Email", "Slot", "Status"],
      ...allBookings.map((b) => [b.id, b.userEmail, b.slotNumber, b.active ? "Active" : "Inactive"]),
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

  const stats = [
    { label: "Total Slots", value: totalSlots, color: "text-neutral-950" },
    { label: "Available", value: freeSlots, color: "text-emerald-600" },
    { label: "Occupied", value: occupiedSlots, color: "text-red-500" },
    { label: "Active Bookings", value: activeBookings, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-[#f6efe5] text-neutral-900 flex flex-col">

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

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-black/5 w-full">
        <div className="flex items-center justify-between px-8 py-4 w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-black">
              P
            </div>
            <span className="font-semibold text-lg tracking-tight">ParkFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
              Admin
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Slots are managed automatically. Monitor bookings in real time.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/80 border border-black/5 p-5 shadow-sm">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-xs text-neutral-500 font-medium">{s.label}</p>
              </div>
            ))
          }
        </div>

        {/* All Slots */}
        <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-neutral-950">All Slots</h2>
            <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">Auto-managed by system</span>
          </div>
          {loading ? (
            <div className="flex flex-wrap gap-2.5">
              {Array(6).fill(0).map((_, i) => <SkeletonSlot key={i} />)}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-neutral-400">No slots found. Add one above.</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {slots.map((slot) => {
                const booking = allBookings.find((b) => b.slotNumber === slot.slotNumber && b.active);
                return (
                  <div
                    key={slot.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition
                      ${slot.available
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-red-50 border-red-200 text-red-600"
                      }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${slot.available ? "bg-emerald-500" : "bg-red-500"}`} />
                    {slot.slotNumber}
                    <span className="text-xs font-normal opacity-70">
                      {slot.available ? "Free" : booking ? booking.userEmail : "Booked"}
                    </span>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="ml-1 opacity-50 hover:opacity-100 transition text-xs leading-none"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Bookings */}
        <div className="rounded-2xl bg-white/80 border border-black/5 shadow-sm overflow-hidden">
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
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/60 transition">
                      <td className="px-6 py-3.5 text-neutral-500 font-mono text-xs">{b.id}</td>
                      <td className="px-6 py-3.5 text-neutral-700">{b.userEmail}</td>
                      <td className="px-6 py-3.5 font-semibold text-neutral-950">{b.slotNumber}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
