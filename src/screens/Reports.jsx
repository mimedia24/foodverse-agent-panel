import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { message } from "antd";
import {
  CalendarDays,
  Download,
  Share2,
  RefreshCcw,
  Store,
  Coins,
  Percent,
  Plus,
  Trash2,
  BadgeDollarSign,
  Bike,
  UtensilsCrossed,
  HandCoins,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useAuth } from "../context/authContext";

dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

const COMMISSION_KEY = "foodverse_agent_restaurant_commissions";
const DISCOUNT_KEY = "foodverse_agent_manual_discounts";
const DELIVERY_KEY = "foodverse_agent_delivery_profit_overrides";

const parseOrderDate = (value) => {
  if (!value) return null;
  const formats = [
    "DD/MM/YY",
    "DD/MM/YYYY",
    "MM/DD/YY",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "YYYY-MM-DDTHH:mm:ss",
    "YYYY-MM-DDTHH:mm:ssZ",
    "YYYY-MM-DD HH:mm:ss",
  ];
  for (const format of formats) {
    const parsed = dayjs(value, format, true);
    if (parsed.isValid()) return parsed;
  }
  const direct = dayjs(value);
  return direct.isValid() ? direct : null;
};

const num = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const money = (value) =>
  `BDT ${num(value).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;

const readStore = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const getOrderMetrics = (order) => {
  const items = Array.isArray(order?.items) ? order.items : [];

  const restaurantFoodSale = items.reduce(
    (sum, item) => sum + num(item?.basedPrice) * num(item?.quantity || 1),
    0,
  );

  const customerFoodSale = items.reduce((sum, item) => {
    const selling = num(item?.sellingPrice) > 0 ? num(item?.sellingPrice) : num(item?.offerPrice);
    return sum + selling * num(item?.quantity || 1);
  }, 0);

  const addonsTotal = items.reduce((sum, item) => {
    const addons = Array.isArray(item?.addons) ? item.addons : [];
    return (
      sum +
      addons.reduce(
        (addonSum, addon) => addonSum + num(addon?.price) * num(addon?.quantity || 1),
        0,
      )
    );
  }, 0);

  return {
    restaurantSale: restaurantFoodSale + addonsTotal,
    foodSale: customerFoodSale + addonsTotal,
    foodMargin: Math.max(customerFoodSale - restaurantFoodSale, 0),
    deliveryFee: num(order?.riderFee ?? order?.deliveryFee ?? order?.deliveryCharge),
    deliveryProfitAuto: num(order?.deliveryProfit ?? order?.deliveryMargin ?? order?.deliveryCommission),
    riderTips: num(order?.riderTips ?? order?.tipAmount ?? order?.tip),
  };
};

async function fetchAllOrders(zoneId) {
  const limit = 100;
  const maxPages = 50;
  let page = 1;
  let rows = [];
  let totalCount = 0;

  while (page <= maxPages) {
    const response = await api.post(`/zone/order-list?page=${page}&limit=${limit}`, { zoneId });
    const payload = response?.data;
    const chunk = Array.isArray(payload?.data) ? payload.data : [];
    totalCount = Number(payload?.totalCount || totalCount || 0);
    rows = [...rows, ...chunk];
    if (!chunk.length || chunk.length < limit || (totalCount && rows.length >= totalCount)) break;
    page += 1;
  }

  return Array.from(new Map(rows.map((item) => [item._id, item])).values());
}

const rangeBtn = (active) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
  }`;

const rowCard = "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3";

function Reports() {
  const { user } = useAuth();
  const zoneId = user?.zoneId || user?.zoneID || user?.zone?._id || null;
  const today = dayjs().format("YYYY-MM-DD");

  const [rangeType, setRangeType] = useState("today");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [commissionRates, setCommissionRates] = useState({});
  const [discounts, setDiscounts] = useState([]);
  const [deliveryOverrides, setDeliveryOverrides] = useState({});
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountNote, setDiscountNote] = useState("");

  const { data: orders = [], isFetching, refetch } = useQuery({
    queryKey: ["report-orders", zoneId],
    queryFn: () => fetchAllOrders(zoneId),
    enabled: !!zoneId,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setCommissionRates(readStore(COMMISSION_KEY, {}));
    setDiscounts(readStore(DISCOUNT_KEY, []));
    setDeliveryOverrides(readStore(DELIVERY_KEY, {}));
  }, []);

  useEffect(() => {
    const now = dayjs();
    if (rangeType === "today") {
      setStartDate(now.format("YYYY-MM-DD"));
      setEndDate(now.format("YYYY-MM-DD"));
    }
    if (rangeType === "week") {
      setStartDate(now.startOf("isoWeek").format("YYYY-MM-DD"));
      setEndDate(now.endOf("isoWeek").format("YYYY-MM-DD"));
    }
    if (rangeType === "month") {
      setStartDate(now.startOf("month").format("YYYY-MM-DD"));
      setEndDate(now.endOf("month").format("YYYY-MM-DD"));
    }
  }, [rangeType]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const parsed = parseOrderDate(order?.orderDate);
        if (!parsed) return false;
        const current = parsed.format("YYYY-MM-DD");
        return current >= startDate && current <= endDate;
      }),
    [orders, startDate, endDate],
  );

  const selectedDiscounts = useMemo(
    () =>
      discounts
        .filter((entry) => entry.date >= startDate && entry.date <= endDate)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [discounts, startDate, endDate],
  );

  const discountTotal = useMemo(
    () => selectedDiscounts.reduce((sum, item) => sum + num(item.amount), 0),
    [selectedDiscounts],
  );

  const restaurantRows = useMemo(() => {
    const map = new Map();

    filteredOrders.forEach((order) => {
      const metrics = getOrderMetrics(order);
      const key = order?.restaurantId || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          restaurantId: key,
          restaurantName: order?.restaurantName || "Unknown Restaurant",
          restaurantSale: 0,
          foodSale: 0,
          foodMargin: 0,
          orderCount: 0,
        });
      }
      const row = map.get(key);
      row.restaurantSale += metrics.restaurantSale;
      row.foodSale += metrics.foodSale;
      row.foodMargin += metrics.foodMargin;
      row.orderCount += 1;
    });

    return Array.from(map.values())
      .map((row) => {
        const rate = num(commissionRates[row.restaurantId]);
        return {
          ...row,
          rate,
          commissionProfit: (row.restaurantSale * rate) / 100,
        };
      })
      .sort((a, b) => b.restaurantSale - a.restaurantSale);
  }, [filteredOrders, commissionRates]);

  const overrideKey = `${startDate}_${endDate}`;
  const hasOverride = Object.prototype.hasOwnProperty.call(deliveryOverrides, overrideKey);
  const overrideValue = hasOverride ? num(deliveryOverrides[overrideKey]) : null;

  const report = useMemo(() => {
    const base = filteredOrders.reduce(
      (acc, order) => {
        const metrics = getOrderMetrics(order);
        acc.restaurantSale += metrics.restaurantSale;
        acc.foodSale += metrics.foodSale;
        acc.foodMargin += metrics.foodMargin;
        acc.deliveryFee += metrics.deliveryFee;
        acc.deliveryProfitAuto += metrics.deliveryProfitAuto;
        acc.riderTips += metrics.riderTips;
        acc.orderCount += 1;
        return acc;
      },
      {
        restaurantSale: 0,
        foodSale: 0,
        foodMargin: 0,
        deliveryFee: 0,
        deliveryProfitAuto: 0,
        riderTips: 0,
        orderCount: 0,
      },
    );

    const restaurantCommissionProfit = restaurantRows.reduce(
      (sum, row) => sum + row.commissionProfit,
      0,
    );
    const deliveryProfit = hasOverride ? overrideValue : base.deliveryProfitAuto;
    const grossProfit = restaurantCommissionProfit + base.foodMargin + deliveryProfit;
    const netProfit = grossProfit - discountTotal;

    return {
      ...base,
      restaurantCommissionProfit,
      deliveryProfit,
      grossProfit,
      manualDiscount: discountTotal,
      netProfit,
    };
  }, [filteredOrders, restaurantRows, hasOverride, overrideValue, discountTotal]);

  const dailyRows = useMemo(() => {
    const dates = new Map();

    filteredOrders.forEach((order) => {
      const parsed = parseOrderDate(order?.orderDate);
      if (!parsed) return;
      const key = parsed.format("YYYY-MM-DD");
      if (!dates.has(key)) {
        dates.set(key, {
          date: key,
          orders: [],
          restaurantSale: 0,
          foodSale: 0,
          foodMargin: 0,
          deliveryProfitAuto: 0,
        });
      }
      const row = dates.get(key);
      const metrics = getOrderMetrics(order);
      row.orders.push(order);
      row.restaurantSale += metrics.restaurantSale;
      row.foodSale += metrics.foodSale;
      row.foodMargin += metrics.foodMargin;
      row.deliveryProfitAuto += metrics.deliveryProfitAuto;
    });

    return Array.from(dates.values())
      .map((row) => {
        const commissionProfit = row.orders.reduce((sum, order) => {
          const metrics = getOrderMetrics(order);
          return sum + (metrics.restaurantSale * num(commissionRates[order?.restaurantId])) / 100;
        }, 0);
        const dayKey = `${row.date}_${row.date}`;
        const deliveryProfit = Object.prototype.hasOwnProperty.call(deliveryOverrides, dayKey)
          ? num(deliveryOverrides[dayKey])
          : row.deliveryProfitAuto;
        const manualDiscount = discounts
          .filter((item) => item.date === row.date)
          .reduce((sum, item) => sum + num(item.amount), 0);
        return {
          date: row.date,
          orderCount: row.orders.length,
          restaurantSale: row.restaurantSale,
          foodSale: row.foodSale,
          deliveryProfit,
          manualDiscount,
          netProfit: commissionProfit + row.foodMargin + deliveryProfit - manualDiscount,
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filteredOrders, commissionRates, deliveryOverrides, discounts]);

  const updateCommissionRate = (restaurantId, value) => {
    const next = { ...commissionRates, [restaurantId]: value };
    setCommissionRates(next);
    writeStore(COMMISSION_KEY, next);
  };

  const updateDeliveryOverride = (value) => {
    const next = { ...deliveryOverrides };
    if (value === "") delete next[overrideKey];
    else next[overrideKey] = num(value);
    setDeliveryOverrides(next);
    writeStore(DELIVERY_KEY, next);
  };

  const addDiscount = () => {
    if (!num(discountAmount) || startDate !== endDate) {
      message.error("For manual discount, choose a single day and enter a valid amount.");
      return;
    }
    const next = [
      {
        id: String(Date.now()),
        date: startDate,
        amount: num(discountAmount),
        note: discountNote || "Manual discount",
      },
      ...discounts,
    ];
    setDiscounts(next);
    writeStore(DISCOUNT_KEY, next);
    setDiscountAmount("");
    setDiscountNote("");
    message.success("Discount added.");
  };

  const removeDiscount = (id) => {
    const next = discounts.filter((item) => item.id !== id);
    setDiscounts(next);
    writeStore(DISCOUNT_KEY, next);
  };

  const shareText = useMemo(
    () =>
      [
        "Food Verse Agent Report",
        `Range: ${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(endDate).format("DD MMM YYYY")}`,
        `Orders: ${report.orderCount}`,
        `Food Sale: ${money(report.foodSale)}`,
        `Restaurant Sale: ${money(report.restaurantSale)}`,
        `Delivery Fee: ${money(report.deliveryFee)}`,
        `Delivery Profit: ${money(report.deliveryProfit)}`,
        `Restaurant Commission Profit: ${money(report.restaurantCommissionProfit)}`,
        `Food Sell Margin: ${money(report.foodMargin)}`,
        `Manual Discount: ${money(report.manualDiscount)}`,
        `Net Profit: ${money(report.netProfit)}`,
      ].join("\n"),
    [report, startDate, endDate],
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Food Verse Agent Report", text: shareText });
        return;
      } catch {
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      message.success("Report summary copied.");
    } catch {
      message.error("Share failed.");
    }
  };

  const handleExportPdf = () => {
    const html = `
      <html>
        <head>
          <title>Food Verse Agent Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 6px; }
            .muted { color: #64748b; margin-bottom: 18px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
            .card { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Food Verse Agent Report</h1>
          <div class="muted">${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(endDate).format("DD MMM YYYY")}</div>
          <div class="grid">
            <div class="card"><strong>Food Sale</strong><div>${money(report.foodSale)}</div></div>
            <div class="card"><strong>Restaurant Sale</strong><div>${money(report.restaurantSale)}</div></div>
            <div class="card"><strong>Delivery Fee</strong><div>${money(report.deliveryFee)}</div></div>
            <div class="card"><strong>Delivery Profit</strong><div>${money(report.deliveryProfit)}</div></div>
            <div class="card"><strong>Restaurant Commission Profit</strong><div>${money(report.restaurantCommissionProfit)}</div></div>
            <div class="card"><strong>Food Sell Margin</strong><div>${money(report.foodMargin)}</div></div>
            <div class="card"><strong>Manual Discount</strong><div>${money(report.manualDiscount)}</div></div>
            <div class="card"><strong>Net Profit</strong><div>${money(report.netProfit)}</div></div>
          </div>
          <table>
            <thead><tr><th>Date</th><th>Orders</th><th>Restaurant Sale</th><th>Food Sale</th><th>Net Profit</th></tr></thead>
            <tbody>
              ${dailyRows
                .map(
                  (row) => `<tr><td>${dayjs(row.date).format("DD MMM YYYY")}</td><td>${row.orderCount}</td><td>${money(row.restaurantSale)}</td><td>${money(row.foodSale)}</td><td>${money(row.netProfit)}</td></tr>`,
                )
                .join("")}
            </tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) return message.error("Popup blocked. Please allow popups.");
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const sellLines = [
    { icon: UtensilsCrossed, label: "Food Sell", value: money(report.foodSale) },
    { icon: Store, label: "Restaurant Sell", value: money(report.restaurantSale) },
    { icon: Bike, label: "Delivery Fee", value: money(report.deliveryFee) },
    { icon: HandCoins, label: "Delivery Profit", value: money(report.deliveryProfit) },
    { icon: Coins, label: "Rider Tips", value: money(report.riderTips) },
  ];

  const profitLines = [
    { icon: Percent, label: "Restaurant Commission Profit", value: money(report.restaurantCommissionProfit) },
    { icon: UtensilsCrossed, label: "Food Sell Margin", value: money(report.foodMargin) },
    { icon: HandCoins, label: "Delivery Profit", value: money(report.deliveryProfit) },
    { icon: Trash2, label: "Manual Discount", value: money(report.manualDiscount), danger: true },
    { icon: BadgeDollarSign, label: "Gross Profit", value: money(report.grossProfit) },
  ];

  return (
    <Layout>
      <div className="space-y-4 pb-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-blue-600">Food Verse Agent Report Control</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Profit Reports</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">Restaurant commission + food sell margin + delivery profit - manual discount.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <RefreshCcw size={16} className={isFetching ? "animate-spin" : ""} /> Refresh
              </button>
              <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Share2 size={16} /> Share
              </button>
              <button onClick={handleExportPdf} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["today", "Today"],
              ["week", "This Week"],
              ["month", "This Month"],
              ["custom", "Custom Range"],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setRangeType(key)} className={rangeBtn(rangeType === key)}>{label}</button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className={rowCard}>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Start Date</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <CalendarDays size={16} className="text-slate-400" />
                <input type="date" value={startDate} onChange={(e) => { setRangeType("custom"); setStartDate(e.target.value); }} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className={rowCard}>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">End Date</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <CalendarDays size={16} className="text-slate-400" />
                <input type="date" value={endDate} onChange={(e) => { setRangeType("custom"); setEndDate(e.target.value); }} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className={rowCard}>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Orders</label>
              <div className="mt-3 text-3xl font-black text-slate-950">{report.orderCount}</div>
              <p className="mt-1 text-xs text-slate-500">Filtered real orders in this range</p>
            </div>
            <div className={rowCard}>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Delivery Profit Override</label>
              <input type="number" value={hasOverride ? overrideValue : ""} onChange={(e) => updateDeliveryOverride(e.target.value)} placeholder="0" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" />
              <p className="mt-1 text-xs text-slate-500">Leave empty to use API value if available</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[30px] bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold opacity-90">{rangeType === "today" ? "Today's Sell" : "Selected Range Sell"}</p>
                <h3 className="mt-2 text-4xl font-black tracking-tight">{money(report.foodSale)}</h3>
              </div>
              <div className="rounded-2xl bg-white/15 p-3"><BadgeDollarSign size={22} /></div>
            </div>
            <div className="mt-5 space-y-3">
              {sellLines.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-white/90"><item.icon size={16} /> {item.label}</div>
                  <div className="text-sm font-bold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold opacity-90">Profit Summary</p>
                <h3 className="mt-2 text-4xl font-black tracking-tight">{money(report.netProfit)}</h3>
                <p className="mt-2 text-xs opacity-80">Restaurant commission + food sell margin + delivery profit - discount</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3"><Coins size={22} /></div>
            </div>
            <div className="mt-5 space-y-3">
              {profitLines.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-white/90"><item.icon size={16} /> {item.label}</div>
                  <div className={`text-sm font-bold ${item.danger ? "text-red-200" : ""}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-xl font-black text-slate-950">Daily Breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">Daily profit summary for the selected range</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-3 py-3">Date</th><th className="px-3 py-3">Orders</th><th className="px-3 py-3">Restaurant Sale</th><th className="px-3 py-3">Food Sale</th><th className="px-3 py-3">Delivery Profit</th><th className="px-3 py-3">Discount</th><th className="px-3 py-3">Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRows.length ? dailyRows.map((row) => (
                    <tr key={row.date} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-3 font-semibold text-slate-800">{dayjs(row.date).format("DD MMM YYYY")}</td>
                      <td className="px-3 py-3 text-slate-600">{row.orderCount}</td>
                      <td className="px-3 py-3 text-slate-600">{money(row.restaurantSale)}</td>
                      <td className="px-3 py-3 text-slate-600">{money(row.foodSale)}</td>
                      <td className="px-3 py-3 text-slate-600">{money(row.deliveryProfit)}</td>
                      <td className="px-3 py-3 text-red-500">{money(row.manualDiscount)}</td>
                      <td className="px-3 py-3 font-bold text-emerald-600">{money(row.netProfit)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">No orders found in this range.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <h2 className="text-xl font-black text-slate-950">Manual Discount</h2>
              <p className="mt-1 text-sm text-slate-500">Add agent discount for a single selected day</p>
              <div className="mt-4 space-y-3">
                <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="Discount amount" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                <input type="text" value={discountNote} onChange={(e) => setDiscountNote(e.target.value)} placeholder="Reason / note" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                <button onClick={addDiscount} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"><Plus size={16} /> Add Discount</button>
              </div>
              <div className="mt-4 space-y-2">
                {selectedDiscounts.length ? selectedDiscounts.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{money(entry.amount)}</p>
                      <p className="text-xs text-slate-500">{entry.note} • {dayjs(entry.date).format("DD MMM YYYY")}</p>
                    </div>
                    <button onClick={() => removeDiscount(entry.id)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"><Trash2 size={14} /></button>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">No manual discount in this range.</div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <h2 className="text-xl font-black text-slate-950">Profit Formula</h2>
              <p className="mt-1 text-sm text-slate-500">This final profit is calculated from the values below</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Restaurant Commission Profit", money(report.restaurantCommissionProfit), "text-emerald-600"],
                  ["Food Sell Margin", money(report.foodMargin), "text-blue-600"],
                  ["Delivery Profit", money(report.deliveryProfit), "text-violet-600"],
                  ["Manual Discount", money(report.manualDiscount), "text-red-500"],
                  ["Net Profit", money(report.netProfit), "text-slate-950"],
                ].map(([label, value, cls]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className={`text-sm font-bold ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-xl font-black text-slate-950">Restaurant Commission Setup</h2>
          <p className="mt-1 text-sm text-slate-500">Set each restaurant commission rate to calculate real profit</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-3 py-3">Restaurant</th><th className="px-3 py-3">Orders</th><th className="px-3 py-3">Restaurant Sale</th><th className="px-3 py-3">Food Sale</th><th className="px-3 py-3">Food Margin</th><th className="px-3 py-3">Commission %</th><th className="px-3 py-3">Commission Profit</th>
                </tr>
              </thead>
              <tbody>
                {restaurantRows.length ? restaurantRows.map((row) => (
                  <tr key={row.restaurantId} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3 font-semibold text-slate-800">{row.restaurantName}</td>
                    <td className="px-3 py-3 text-slate-600">{row.orderCount}</td>
                    <td className="px-3 py-3 text-slate-600">{money(row.restaurantSale)}</td>
                    <td className="px-3 py-3 text-slate-600">{money(row.foodSale)}</td>
                    <td className="px-3 py-3 font-semibold text-blue-600">{money(row.foodMargin)}</td>
                    <td className="px-3 py-3"><input type="number" value={row.rate || ""} onChange={(e) => updateCommissionRate(row.restaurantId, e.target.value)} placeholder="0" className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" /></td>
                    <td className="px-3 py-3 font-bold text-emerald-600">{money(row.commissionProfit)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">No restaurant sales found in this range.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Reports;