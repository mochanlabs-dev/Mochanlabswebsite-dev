// A designed fragment of the ODTS dispatcher screen (demo data): orders
// grouped by dealer, oldest first, with their status - plus the dispatch form
// a dispatcher fills in for an accepted order.

type Status = "Order Placed" | "Accepted" | "Dispatched" | "On Hold";

const badge: Record<Status, string> = {
  "Order Placed": "border border-ink/15 text-ink/70",
  Accepted: "bg-accent-soft text-accent",
  Dispatched: "bg-ink text-card",
  "On Hold": "border border-dashed border-ink/30 text-ink/60",
};

const groups: { dealer: string; orders: { id: number; product: string; qty: string; place: string; status: Status }[] }[] = [
  {
    dealer: "Sharma Traders",
    orders: [
      { id: 1042, product: "Product A", qty: "12 MT", place: "Rake", status: "Order Placed" },
      { id: 1043, product: "Product B", qty: "8 MT", place: "Warehouse", status: "Accepted" },
    ],
  },
  {
    dealer: "Gupta Agencies",
    orders: [
      { id: 1038, product: "Product A", qty: "20 MT", place: "Rake", status: "Dispatched" },
      { id: 1040, product: "Product C", qty: "6 MT", place: "Warehouse", status: "On Hold" },
    ],
  },
];

export default function OdtsBoard() {
  return (
    <div aria-hidden className="relative">
      {/* Dispatch board */}
      <div className="rounded-md bg-card text-ink shadow-[0_20px_60px_-20px_rgb(0_0_0/0.5)]">
        <div className="flex items-center justify-between border-b border-ink/8 px-5 py-3.5">
          <span className="text-sm font-medium">Dispatch board</span>
          <span className="flex gap-1 text-[0.65rem]">
            {["Placed", "Accepted", "Dispatched"].map((f, i) => (
              <span key={f} className={`rounded-[3px] px-1.5 py-0.5 ${i < 2 ? "bg-ink text-card" : "bg-ink/[0.06] text-ink/60"}`}>
                {f}
              </span>
            ))}
          </span>
        </div>
        {groups.map((g) => (
          <div key={g.dealer} className="border-b border-ink/8 px-5 py-3 last:border-b-0">
            <p className="mb-2 text-xs text-ink/50">
              <span className="font-medium text-ink">{g.dealer}</span> · {g.orders.length} orders
            </p>
            {g.orders.map((o) => (
              <div key={o.id} className="grid grid-cols-[3.2rem_1fr_3.4rem_auto] items-center gap-2 py-1.5 text-xs">
                <span className="tabular-nums text-ink/45">#{o.id}</span>
                <span className="truncate">
                  {o.product} <span className="text-ink/40">· {o.place}</span>
                </span>
                <span className="text-right tabular-nums text-ink/70">{o.qty}</span>
                <span className={`rounded-[3px] px-1.5 py-0.5 text-[0.62rem] whitespace-nowrap ${badge[o.status]}`}>{o.status}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Dispatch form, overlapping */}
      <div className="relative z-10 -mt-6 ml-auto w-[min(17rem,80%)] rounded-md bg-card p-4 text-ink shadow-[0_24px_60px_-16px_rgb(0_0_0/0.55)] sm:-mt-10 sm:mr-[-1.5rem]">
        <p className="text-sm font-medium">
          Dispatch order <span className="tabular-nums text-ink/50">#1043</span>
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.68rem]">
          {[
            ["Vehicle no.", "UK07 CA 4412"],
            ["Driver phone", "98•• •• 4521"],
            ["Bilty no.", "BL-2291"],
            ["Loading from", "Rake"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink/45">{k}</dt>
              <dd className="mt-0.5 rounded-[3px] border border-ink/10 bg-paper px-1.5 py-1 tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[0.65rem] text-ink/45">Receipt uploaded ✓</span>
          <span className="rounded-[3px] bg-accent px-2.5 py-1 text-[0.68rem] font-medium text-card">Dispatched</span>
        </div>
      </div>
    </div>
  );
}
