export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/80 border border-black/5 p-5 shadow-sm animate-pulse">
      <div className="h-8 w-12 bg-neutral-200 rounded-lg mb-2" />
      <div className="h-3 w-20 bg-neutral-100 rounded-md" />
    </div>
  );
}

export function SkeletonSlot() {
  return (
    <div className="h-9 w-24 rounded-full bg-neutral-200 animate-pulse" />
  );
}

export function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-3.5"><div className="h-3 w-8 bg-neutral-100 rounded animate-pulse" /></td>
      <td className="px-6 py-3.5"><div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" /></td>
      <td className="px-6 py-3.5"><div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" /></td>
      <td className="px-6 py-3.5"><div className="h-6 w-14 bg-neutral-100 rounded-full animate-pulse" /></td>
    </tr>
  );
}
