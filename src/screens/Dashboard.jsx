import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import { fetchDashboardData } from "../api/dashboardApi";
import {
  Bike,
  ShoppingBag,
  Store,
  PackageSearch,
  UtensilsCrossed,
  Wallet,
  HandCoins,
  Coins,
  Star,
  Flame,
  Trophy,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const iconMap = {
  orders: ShoppingBag,
  package: PackageSearch,
  rider: Bike,
  restaurant: Store,
};

const toneMap = {
  blue: {
    border: "border-blue-200",
    glow: "shadow-[0_10px_40px_rgba(37,99,235,0.16)]",
    icon: "bg-blue-500/10 text-blue-700 ring-1 ring-blue-200",
    summary: "from-blue-700 via-blue-600 to-cyan-500",
  },
  emerald: {
    border: "border-emerald-200",
    glow: "shadow-[0_10px_40px_rgba(5,150,105,0.16)]",
    icon: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-200",
    summary: "from-emerald-700 via-emerald-600 to-lime-500",
  },
  violet: {
    border: "border-violet-200",
    glow: "shadow-[0_10px_40px_rgba(124,58,237,0.18)]",
    icon: "bg-violet-500/10 text-violet-700 ring-1 ring-violet-200",
    summary: "from-violet-700 via-fuchsia-600 to-pink-500",
  },
  indigo: {
    border: "border-indigo-200",
    glow: "shadow-[0_10px_40px_rgba(67,56,202,0.16)]",
    icon: "bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-200",
    summary: "from-indigo-700 via-indigo-600 to-blue-500",
  },
  amber: {
    border: "border-amber-200",
    glow: "shadow-[0_10px_40px_rgba(245,158,11,0.16)]",
    icon: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-200",
    summary: "from-amber-600 via-orange-500 to-rose-500",
  },
};

const formatMoney = (value) => `BDT ${Number(value).toLocaleString()}`;

function useAnimatedNumber(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    let raf = 0;
    const step = Math.max(1, Math.floor(target / (duration / 16)));

    const animate = () => {
      start += step;
      if (start >= target) {
        setValue(target);
        return;
      }
      setValue(start);
      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function AnimatedValue({ value, money = false, className = "" }) {
  const numeric = Number(value);
  const animated = useAnimatedNumber(numeric);

  return (
    <span className={className}>
      {money ? formatMoney(animated) : animated.toLocaleString()}
    </span>
  );
}

function HeroChip({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function StatCard({ item, index }) {
  const Icon = iconMap[item.icon] || ShoppingBag;
  const tone = toneMap[item.tone] || toneMap.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-[30px] border bg-white p-5 ${tone.border} ${tone.glow} transition duration-300 hover:-translate-y-1 hover:scale-[1.01]`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-100/70 blur-2xl transition group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
            {item.title}
          </p>
          <AnimatedValue
            value={item.value}
            className="mt-3 block text-4xl font-black tracking-tight text-slate-950"
          />
          <p className="mt-2 text-sm text-slate-500">{item.sub}</p>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ${tone.icon}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, badge }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-950">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function SalesSummaryCard({ item, index }) {
  const tone = toneMap[item.tone] || toneMap.blue;

  const breakdown = [
    { label: "Food Sell", value: item.foodSell, icon: UtensilsCrossed },
    { label: "Restaurant Sell", value: item.restaurantSell, icon: Store },
    { label: "Delivery Fee", value: item.deliveryFee, icon: Wallet },
    { label: "Delivery Profit", value: item.deliveryProfit, icon: HandCoins },
    { label: "Rider Tips", value: item.riderTips, icon: Coins },
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-[34px] bg-gradient-to-br ${tone.summary} p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:p-6`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white/90">{item.title}</p>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
            Live
          </span>
        </div>

        <div className="mt-3">
          <AnimatedValue
            value={item.foodSell}
            money
            className="block text-4xl font-black tracking-tight md:text-5xl"
          />
        </div>

        <div className="mt-6 grid gap-3">
          {breakdown.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-3 py-3 backdrop-blur"
              >
                <span className="inline-flex items-center gap-2 text-sm text-white/90">
                  <Icon className="h-4 w-4" />
                  {row.label}
                </span>
                <span className="text-sm font-bold text-white">
                  {formatMoney(row.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TopEntityCard({ item, type = "restaurant", rank = 1 }) {
  const isRestaurant = type === "restaurant";

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-slate-100 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-950 text-sm font-black text-white">
              #{rank}
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-950">{item.name}</h4>
              <p className="mt-1 text-sm text-slate-500">{item.badge}</p>
            </div>
          </div>

          <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <Star className="mr-1 inline h-3.5 w-3.5" />
            {isRestaurant ? "Top Store" : item.rating}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {isRestaurant ? (
            <>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Food Sell
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatMoney(item.foodSell)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Restaurant Sell
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatMoney(item.restaurantSell)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Earnings
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatMoney(item.earnings)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Rider Tips
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatMoney(item.tips)}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            {isRestaurant ? `${item.orders} orders` : `${item.completed} deliveries`}
          </span>
          {!isRestaurant ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              Rating {item.rating}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    zoneName: "",
    stats: [],
    orderOverview: [],
    revenueOverview: [],
    topRestaurants: [],
    topRiders: [],
    salesSummary: [],
  });

  useEffect(() => {
    let active = true;
    fetchDashboardData().then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const heroLabels = useMemo(
    () => [
      { label: "Aggressive Live UI", icon: Sparkles },
      { label: "Mobile Responsive", icon: Wallet },
      { label: "Agent Focused Data", icon: PackageSearch },
    ],
    []
  );

  if (loading) {
    return (
      <Layout>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-[30px] bg-white shadow-sm ring-1 ring-slate-100"
            ></div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-3 md:p-6">
        <section className="relative overflow-hidden rounded-[34px] bg-[radial-gradient(circle_at_top_left,_#1e3a8a,_#020617_45%,_#2563eb_100%)] p-6 text-white shadow-[0_20px_65px_rgba(15,23,42,0.28)] md:p-8">
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="absolute bottom-0 right-20 h-36 w-36 rounded-full bg-blue-300/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-200">
              Food Verse Agent Admin Panel
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
              {data.zoneName}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
              Real-time business insights (Bangladesh Timezone)
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {heroLabels.map((item) => (
                <HeroChip key={item.label} icon={item.icon} label={item.label} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.stats.map((item, index) => (
            <StatCard key={item.title} item={item} index={index} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Order Overview"
            subtitle="Food sell, restaurant sell, delivery fee, delivery profit, rider tips, and total order"
            badge="Live Comparison"
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.orderOverview}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Total Order") return [value, name];
                      return [formatMoney(value), name];
                    }}
                    contentStyle={{
                      borderRadius: 18,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 12px 35px rgba(2,6,23,0.12)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="foodSell" fill="#2563eb" radius={[10, 10, 0, 0]} name="Food Sell" />
                  <Bar dataKey="restaurantSell" fill="#22c55e" radius={[10, 10, 0, 0]} name="Restaurant Sell" />
                  <Bar dataKey="deliveryFee" fill="#f59e0b" radius={[10, 10, 0, 0]} name="Delivery Fee" />
                  <Bar dataKey="deliveryProfit" fill="#8b5cf6" radius={[10, 10, 0, 0]} name="Delivery Profit" />
                  <Bar dataKey="riderTips" fill="#ef4444" radius={[10, 10, 0, 0]} name="Rider Tips" />
                  <Bar dataKey="totalOrder" fill="#0f172a" radius={[10, 10, 0, 0]} name="Total Order" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Revenue Overview"
            subtitle="Only sell amount, with aggressive visual emphasis"
            badge="Sell Amount Only"
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueOverview}>
                  <defs>
                    <linearGradient id="sellGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => formatMoney(value)}
                    contentStyle={{
                      borderRadius: 18,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 12px 35px rgba(2,6,23,0.12)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sellAmount"
                    stroke="#2563eb"
                    strokeWidth={4}
                    fill="url(#sellGradient)"
                    name="Sell Amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Top Restaurant"
            subtitle="Only top 2 restaurants, clearly highlighted"
            badge="Top 2"
          >
            <div className="grid gap-4">
              {data.topRestaurants.slice(0, 2).map((item, index) => (
                <TopEntityCard
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  type="restaurant"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Top Rider"
            subtitle="Only top 2 riders, clearly highlighted"
            badge="Top 2"
          >
            <div className="grid gap-4">
              {data.topRiders.slice(0, 2).map((item, index) => (
                <TopEntityCard
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  type="rider"
                />
              ))}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {data.salesSummary.map((item, index) => (
            <SalesSummaryCard key={item.title} item={item} index={index} />
          ))}
        </section>
      </div>
    </Layout>
  );
}