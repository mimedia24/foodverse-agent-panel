import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import { fetchDashboardData } from "../api/dashboardApi";
import { useAuth } from "../context/authContext";
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
  AlertTriangle,
  RefreshCcw,
  Phone,
  Banknote,
  Hash,
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

const formatMoney = (value) => `BDT ${Number(value || 0).toLocaleString()}`;

function useAnimatedNumber(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const safeTarget = Number(target || 0);
    let start = 0;
    let raf = 0;
    const step = Math.max(
      1,
      Math.floor(safeTarget / Math.max(1, duration / 16))
    );

    const animate = () => {
      start += step;
      if (start >= safeTarget) {
        setValue(safeTarget);
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
  const numeric = Number(value || 0);
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!(active && payload && payload.length)) return null;
  const data = payload[0]?.payload || {};

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
      <p className="mb-2 border-b border-slate-100 pb-1 text-sm font-bold text-slate-800">
        {label}
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-8">
          <span className="text-[12px] text-slate-500">Food Sell</span>
          <span className="text-sm font-bold text-blue-600">
            {formatMoney(data.foodSell)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <span className="text-[12px] text-slate-500">Restaurant Sell</span>
          <span className="text-sm font-bold text-emerald-600">
            {formatMoney(data.restaurantSell)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <span className="text-[12px] text-slate-500">Delivery Fee</span>
          <span className="text-sm font-bold text-amber-600">
            {formatMoney(data.deliveryFee)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <span className="text-[12px] text-slate-500">Delivery Profit</span>
          <span className="text-sm font-bold text-violet-600">
            {formatMoney(data.deliveryProfit)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-8">
          <span className="text-[12px] text-slate-500">Rider Tips</span>
          <span className="text-sm font-bold text-rose-600">
            {formatMoney(data.riderTips)}
          </span>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        Total Order: {Number(data.totalOrder || 0).toLocaleString("en-BD")}
      </div>
    </div>
  );
};

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

        {isRestaurant ? (
          <>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-500" />
              <span>{item.phone || "N/A"}</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Flame className="h-3.5 w-3.5 text-rose-500" />
                {item.orders} orders
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-500" />
              <span>{item.phone || "N/A"}</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Delivered
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {item.completed}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Cash Collection
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatMoney(item.cashCollection)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Earning
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatMoney(item.earning)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Hash className="h-3.5 w-3.5 text-blue-500" />
                Total Delivered: {item.completed}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                Cash: {formatMoney(item.cashCollection)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                Rating {item.rating}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [data, setData] = useState({
    zoneName: "",
    stats: [],
    orderOverview: [],
    revenueOverview: [],
    topRestaurants: [],
    topRiders: [],
    salesSummary: [],
  });

  const loadDashboard = async () => {
    if (!user?.zoneId) return;

    try {
      setLoading(true);
      setErrorText("");
      const res = await fetchDashboardData(user);
      setData(res);
    } catch (error) {
      console.error("Dashboard load error:", error);
      setErrorText(
        error?.response?.data?.message ||
          error?.message ||
          "Dashboard data load failed."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user?.zoneId) {
      setLoading(false);
      setErrorText("Zone ID not found for this agent.");
      return;
    }

    loadDashboard();
  }, [authLoading, user?.zoneId]);

  const heroLabels = useMemo(
    () => [
      { label: "Agent Zone Orders Only", icon: Sparkles },
      { label: "Mobile Responsive", icon: Wallet },
      { label: "Zone Focused Data", icon: PackageSearch },
    ],
    []
  );

  if (loading || authLoading) {
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

  if (errorText) {
    return (
      <Layout>
        <div className="rounded-[30px] border border-red-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Dashboard data failed to load
                </h2>
                <p className="mt-1 text-sm text-slate-500">{errorText}</p>
              </div>
            </div>

            <button
              onClick={loadDashboard}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </button>
          </div>
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
              {data.zoneName || "Zone Dashboard"}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
              Only this agent zone restaurants and their orders are shown here.
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
            subtitle="Food sell, restaurant sell, delivery fee, delivery profit, rider tips and total order"
            badge="Zone Orders"
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.orderOverview}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[0, "auto"]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="foodSell"
                    fill="#2563eb"
                    radius={[10, 10, 0, 0]}
                    name="Food Sell"
                  />
                  <Bar
                    dataKey="restaurantSell"
                    fill="#22c55e"
                    radius={[10, 10, 0, 0]}
                    name="Restaurant Sell"
                  />
                  <Bar
                    dataKey="deliveryFee"
                    fill="#f59e0b"
                    radius={[10, 10, 0, 0]}
                    name="Delivery Fee"
                  />
                  <Bar
                    dataKey="chartDeliveryProfit"
                    fill="#8b5cf6"
                    radius={[10, 10, 0, 0]}
                    name="Delivery Profit"
                  />
                  <Bar
                    dataKey="riderTips"
                    fill="#ef4444"
                    radius={[10, 10, 0, 0]}
                    name="Rider Tips"
                  />
                  <Bar
                    dataKey="totalOrder"
                    fill="#0f172a"
                    radius={[10, 10, 0, 0]}
                    name="Total Order"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Revenue Overview"
            subtitle="Only food sales"
            badge="Zone Revenue"
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueOverview}>
                  <defs>
                    <linearGradient id="sellGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
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
                    dataKey="foodSell"
                    stroke="#2563eb"
                    strokeWidth={4}
                    fill="url(#sellGradient)"
                    name="Food Sales"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Top Restaurant"
            subtitle="Top 2 restaurants inside this zone only"
            badge="Zone Top 2"
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
            subtitle="Name, phone, delivered, cash collection and earning"
            badge="Zone Top 2"
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