import React, { useMemo, useState } from "react";
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

const signedMoney = (value) => {
  const n = num(value);
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";

  return `${sign}BDT ${Math.abs(n).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
};

const minusMoney = (value) =>
  `-BDT ${Math.abs(num(value)).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;

const valueColorClass = (value) => {
  const n = num(value);
  if (n < 0) return "text-red-400";
  if (n > 0) return "text-emerald-300";
  return "text-white";
};

const getOrderRestaurantId = (order) =>
  order?.restaurantId?._id ||
  order?.restaurantId ||
  order?.restaurant?._id ||
  null;

const getOrderRestaurantName = (order) =>
  order?.restaurantName ||
  order?.restaurantId?.name ||
  order?.restaurantId?.restaurantName ||
  order?.restaurant?.name ||
  order?.restaurant?.restaurantName ||
  "Unknown Restaurant";

const getOrderMetrics = (order) => {
  const items = Array.isArray(order?.items) ? order.items : [];

  const restaurantFoodSale = items.reduce(
    (sum, item) => sum + num(item?.basedPrice) * num(item?.quantity || 1),
    0
  );

  const customerFoodSale = items.reduce((sum, item) => {
    const selling =
      num(item?.sellingPrice) > 0
        ? num(item?.sellingPrice)
        : num(item?.offerPrice);

    return sum + selling * num(item?.quantity || 1);
  }, 0);

  const addonsTotal = items.reduce((sum, item) => {
    const addons = Array.isArray(item?.addons) ? item.addons : [];

    return (
      sum +
      addons.reduce(
        (addonSum, addon) =>
          addonSum + num(addon?.price) * num(addon?.quantity || 1),
        0
      )
    );
  }, 0);

  const deliveryFee = num(
    order?.deliveryFee ??
      order?.deliveryCharge ??
      order?.deliveryAmount ??
      order?.deliveryChargeCollected ??
      0
  );

  const riderFee = num(
    order?.riderFee ??
      order?.riderCost ??
      order?.riderPayment ??
      order?.deliveryCost ??
      0
  );

  return {
    restaurantSale: restaurantFoodSale + addonsTotal,
    foodSale: customerFoodSale + addonsTotal,
    foodMargin: Math.max(customerFoodSale - restaurantFoodSale, 0),
    deliveryFee,
    deliveryProfitAuto: deliveryFee - riderFee,
    riderTips: num(order?.riderTips ?? order?.tipAmount ?? order?.tip),
  };
};

const getOrderStatusText = (order) => {
  return String(
    order?.orderStatus ||
      order?.status ||
      order?.deliveryStatus ||
      order?.paymentStatus ||
      order?.currentStatus ||
      ""
  ).toLowerCase();
};

const isCompletedOrder = (order) => {
  const status = getOrderStatusText(order);

  const successStatuses = [
    "complete",
    "completed",
    "success",
    "successful",
    "delivered",
    "delivery completed",
    "order completed",
  ];

  return successStatuses.some((item) => status.includes(item));
};

async function fetchAllOrders(zoneId) {
  const limit = 100;
  const maxPages = 50;
  let page = 1;
  let rows = [];
  let totalCount = 0;

  while (page <= maxPages) {
    const response = await api.post(
      `/zone/order-list?page=${page}&limit=${limit}`,
      { zoneId }
    );

    const payload = response?.data;
    const chunk = Array.isArray(payload?.data) ? payload.data : [];

    totalCount = Number(payload?.totalCount || totalCount || 0);
    rows = [...rows, ...chunk];

    if (
      !chunk.length ||
      chunk.length < limit ||
      (totalCount && rows.length >= totalCount)
    ) {
      break;
    }

    page += 1;
  }

  return Array.from(new Map(rows.map((item) => [item._id, item])).values());
}

async function fetchAllRestaurants(zoneId) {
  const limit = 100;
  const maxPages = 50;
  let page = 1;
  let rows = [];

  while (page <= maxPages) {
    const response = await api.post("/zone/restaurant-list", {
      zoneId,
      page,
      limit,
    });

    const payload = response?.data;

    const chunk = Array.isArray(payload?.result)
      ? payload.result
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    rows = [...rows, ...chunk];

    if (!chunk.length || chunk.length < limit) break;

    page += 1;
  }

  return Array.from(new Map(rows.map((item) => [item._id, item])).values());
}

async function fetchApprovedManualDiscounts(zoneId, startDate, endDate) {
  const response = await api.get("/zone/manual-discount/approved", {
    params: {
      zoneId,
      startDate,
      endDate,
    },
  });

  const payload = response?.data;

  return Array.isArray(payload?.result)
    ? payload.result
    : Array.isArray(payload?.data)
    ? payload.data
    : [];
}

async function fetchManualDiscountRequests(zoneId, startDate, endDate) {
  const response = await api.get("/zone/manual-discount/list", {
    params: {
      zoneId,
      startDate,
      endDate,
    },
  });

  const payload = response?.data;

  return Array.isArray(payload?.result)
    ? payload.result
    : Array.isArray(payload?.data)
    ? payload.data
    : [];
}

const rangeBtn = (active) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-blue-600 text-white"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
  }`;

const rowCard = "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3";

function Reports() {
  const { user } = useAuth();

  const zoneId = user?.zoneId || user?.zoneID || user?.zone?._id || null;

  const zoneName =
    user?.zoneName ||
    user?.zone?.name ||
    user?.zone?.zoneName ||
    user?.name ||
    user?.managerName ||
    "Zone Agent";

  const zoneNumber =
    user?.zoneNumber ||
    user?.zone?.phoneNumber ||
    user?.zone?.number ||
    user?.phoneNumber ||
    user?.mobile ||
    "N/A";

  const today = dayjs().format("YYYY-MM-DD");

  const [rangeType, setRangeType] = useState("today");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountNote, setDiscountNote] = useState("");

  const {
    data: orders = [],
    isFetching: ordersFetching,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["report-orders", zoneId],
    queryFn: () => fetchAllOrders(zoneId),
    enabled: !!zoneId,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const {
    data: restaurants = [],
    isFetching: restaurantsFetching,
    refetch: refetchRestaurants,
  } = useQuery({
    queryKey: ["report-restaurants", zoneId],
    queryFn: () => fetchAllRestaurants(zoneId),
    enabled: !!zoneId,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const {
    data: approvedDiscounts = [],
    isFetching: discountsFetching,
    refetch: refetchApprovedDiscounts,
  } = useQuery({
    queryKey: ["approved-manual-discounts", zoneId, startDate, endDate],
    queryFn: () => fetchApprovedManualDiscounts(zoneId, startDate, endDate),
    enabled: !!zoneId && !!startDate && !!endDate,
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const {
    data: manualDiscountRequests = [],
    refetch: refetchManualDiscountRequests,
  } = useQuery({
    queryKey: ["manual-discount-requests", zoneId, startDate, endDate],
    queryFn: () => fetchManualDiscountRequests(zoneId, startDate, endDate),
    enabled: !!zoneId && !!startDate && !!endDate,
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
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

  const restaurantMap = useMemo(() => {
    const map = {};

    restaurants.forEach((restaurant) => {
      map[String(restaurant?._id)] = {
        id: restaurant?._id,
        name:
          restaurant?.name ||
          restaurant?.restaurantName ||
          "Unknown Restaurant",
        commissionRate: num(restaurant?.commissionRate),
      };
    });

    return map;
  }, [restaurants]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const parsed = parseOrderDate(
          order?.orderDate || order?.createdAt || order?.updatedAt
        );

        if (!parsed) return false;

        const current = parsed.format("YYYY-MM-DD");
        const isInDateRange = current >= startDate && current <= endDate;

        return isInDateRange && isCompletedOrder(order);
      }),
    [orders, startDate, endDate]
  );

  const selectedDiscounts = useMemo(
    () =>
      approvedDiscounts
        .filter(
          (entry) =>
            entry.status === "approved" &&
            entry.date >= startDate &&
            entry.date <= endDate
        )
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [approvedDiscounts, startDate, endDate]
  );

  const discountTotal = useMemo(
    () => selectedDiscounts.reduce((sum, item) => sum + num(item.amount), 0),
    [selectedDiscounts]
  );

  const restaurantRows = useMemo(() => {
    const map = new Map();

    filteredOrders.forEach((order) => {
      const metrics = getOrderMetrics(order);
      const restaurantId = String(getOrderRestaurantId(order) || "unknown");
      const restaurantName = getOrderRestaurantName(order);

      if (!map.has(restaurantId)) {
        const savedRestaurant = restaurantMap[restaurantId];

        map.set(restaurantId, {
          restaurantId,
          restaurantName: savedRestaurant?.name || restaurantName,
          restaurantSale: 0,
          foodSale: 0,
          foodMargin: 0,
          orderCount: 0,
          rate: num(savedRestaurant?.commissionRate),
        });
      }

      const row = map.get(restaurantId);

      row.restaurantSale += metrics.restaurantSale;
      row.foodSale += metrics.foodSale;
      row.foodMargin += metrics.foodMargin;
      row.orderCount += 1;

      const savedRestaurant = restaurantMap[restaurantId];

      if (savedRestaurant) {
        row.rate = num(savedRestaurant.commissionRate);
        row.restaurantName = savedRestaurant.name || row.restaurantName;
      }
    });

    return Array.from(map.values())
      .map((row) => ({
        ...row,
        commissionProfit: (row.restaurantSale * num(row.rate)) / 100,
      }))
      .sort((a, b) => b.restaurantSale - a.restaurantSale);
  }, [filteredOrders, restaurantMap]);

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
      }
    );

    const restaurantCommissionProfit = restaurantRows.reduce(
      (sum, row) => sum + row.commissionProfit,
      0
    );

    const deliveryProfit = base.deliveryProfitAuto;

    const grossProfit =
      restaurantCommissionProfit + base.foodMargin + deliveryProfit;

    const netProfit = grossProfit - discountTotal;

    return {
      ...base,
      restaurantCommissionProfit,
      deliveryProfit,
      grossProfit,
      manualDiscount: discountTotal,
      netProfit,
    };
  }, [filteredOrders, restaurantRows, discountTotal]);

  const dailyRows = useMemo(() => {
    const dates = new Map();

    filteredOrders.forEach((order) => {
      const parsed = parseOrderDate(
        order?.orderDate || order?.createdAt || order?.updatedAt
      );

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
          const restaurantId = String(getOrderRestaurantId(order) || "unknown");
          const rate = num(restaurantMap[restaurantId]?.commissionRate);

          return sum + (metrics.restaurantSale * rate) / 100;
        }, 0);

        const deliveryProfit = row.deliveryProfitAuto;

        const manualDiscount = approvedDiscounts
          .filter((item) => item.status === "approved" && item.date === row.date)
          .reduce((sum, item) => sum + num(item.amount), 0);

        return {
          date: row.date,
          orderCount: row.orders.length,
          restaurantSale: row.restaurantSale,
          foodSale: row.foodSale,
          deliveryProfit,
          manualDiscount,
          netProfit:
            commissionProfit + row.foodMargin + deliveryProfit - manualDiscount,
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filteredOrders, restaurantMap, approvedDiscounts]);

  const addDiscount = async () => {
    if (!num(discountAmount) || startDate !== endDate) {
      message.error(
        "For manual discount, choose a single day and enter a valid amount."
      );
      return;
    }

    if (!discountNote.trim()) {
      message.error("Please write a note/reason for this discount request.");
      return;
    }

    try {
      await api.post("/zone/manual-discount/request", {
        zoneId,
        agentId: user?._id,
        agentName: zoneName,
        agentPhoneNumber: zoneNumber,
        date: startDate,
        amount: num(discountAmount),
        note: discountNote.trim(),
      });

      setDiscountAmount("");
      setDiscountNote("");

      await Promise.all([
        refetchManualDiscountRequests(),
        refetchApprovedDiscounts(),
      ]);

      message.success("Manual discount request sent to admin.");
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          "Failed to send manual discount request."
      );
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchOrders(),
      refetchRestaurants(),
      refetchApprovedDiscounts(),
      refetchManualDiscountRequests(),
    ]);

    message.success("Reports refreshed");
  };

  const shareText = useMemo(
    () =>
      [
        "Food Verse Agent Report",
        `Zone Name: ${zoneName}`,
        `Zone ID: ${zoneId || "N/A"}`,
        `Zone Number: ${zoneNumber}`,
        `Range: ${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(
          endDate
        ).format("DD MMM YYYY")}`,
        `Completed Orders: ${report.orderCount}`,
        `Food Sale: ${money(report.foodSale)}`,
        `Restaurant Sale: ${money(report.restaurantSale)}`,
        `Delivery Fee: ${money(report.deliveryFee)}`,
        `Delivery Profit: ${signedMoney(report.deliveryProfit)}`,
        `Restaurant Commission Profit: ${signedMoney(
          report.restaurantCommissionProfit
        )}`,
        `Food Sell Margin: ${signedMoney(report.foodMargin)}`,
        `Manual Discount: ${
          report.manualDiscount > 0 ? minusMoney(report.manualDiscount) : money(0)
        }`,
        `Net Profit: ${signedMoney(report.netProfit)}`,
      ].join("\n"),
    [report, startDate, endDate, zoneName, zoneId, zoneNumber]
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Food Verse Agent Report",
          text: shareText,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      message.success("Report summary copied.");
    } catch {
      message.error("Share failed.");
    }
  };

  const handleExportPdf = () => {
    const generatedAt = dayjs().format("DD MMM YYYY, hh:mm A");
    const periodText = `${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(
      endDate
    ).format("DD MMM YYYY")}`;

    const pdfValueClass = (value) => {
      const n = num(value);
      if (n < 0) return "negative";
      if (n > 0) return "positive";
      return "neutral";
    };

    const html = `
      <html>
        <head>
          <title>Food Verse Agent Report</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: Arial, sans-serif;
              color: #0f172a;
              background: #eef4ff;
              padding: 24px;
            }

            .page {
              max-width: 980px;
              margin: 0 auto;
              border-radius: 28px;
              overflow: hidden;
              background: #ffffff;
              border: 1px solid #dbeafe;
              box-shadow: 0 24px 70px rgba(15, 23, 42, 0.15);
            }

            .hero {
              background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #06b6d4 100%);
              color: #ffffff;
              padding: 32px;
              position: relative;
            }

            .badge {
              display: inline-block;
              border-radius: 999px;
              padding: 8px 14px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              background: rgba(255,255,255,0.16);
              border: 1px solid rgba(255,255,255,0.25);
            }

            h1 {
              margin: 14px 0 6px;
              font-size: 34px;
              line-height: 1.1;
            }

            .subtitle {
              margin: 0;
              font-size: 13px;
              color: rgba(255,255,255,0.82);
            }

            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-top: 24px;
            }

            .meta-card {
              background: rgba(255,255,255,0.13);
              border: 1px solid rgba(255,255,255,0.22);
              border-radius: 18px;
              padding: 14px;
            }

            .meta-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.18em;
              color: rgba(255,255,255,0.72);
              margin-bottom: 6px;
            }

            .meta-value {
              font-size: 15px;
              font-weight: 800;
              color: #ffffff;
            }

            .content {
              padding: 28px 32px 32px;
            }

            .section-title {
              margin: 0 0 14px;
              font-size: 18px;
              font-weight: 900;
              color: #0f172a;
            }

            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 14px;
            }

            .card {
              border-radius: 20px;
              padding: 16px;
              border: 1px solid #e2e8f0;
              background: linear-gradient(180deg, #ffffff, #f8fafc);
            }

            .card.blue {
              background: linear-gradient(135deg, #eff6ff, #dbeafe);
              border-color: #bfdbfe;
            }

            .card.green {
              background: linear-gradient(135deg, #ecfdf5, #d1fae5);
              border-color: #a7f3d0;
            }

            .card.red {
              background: linear-gradient(135deg, #fff1f2, #ffe4e6);
              border-color: #fecdd3;
            }

            .card.dark {
              background: linear-gradient(135deg, #0f172a, #1e293b);
              border-color: #334155;
              color: #ffffff;
            }

            .card-label {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #64748b;
              margin-bottom: 8px;
            }

            .card.dark .card-label {
              color: #cbd5e1;
            }

            .card-value {
              font-size: 22px;
              font-weight: 900;
              color: #0f172a;
            }

            .card-value.positive {
              color: #047857;
            }

            .card-value.negative {
              color: #dc2626;
            }

            .card-value.neutral {
              color: #334155;
            }

            .card.dark .card-value.positive {
              color: #86efac;
            }

            .card.dark .card-value.negative {
              color: #fca5a5;
            }

            .footer {
              margin-top: 28px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              gap: 12px;
              font-size: 11px;
              color: #64748b;
            }

            @media print {
              body {
                background: #ffffff;
                padding: 0;
              }

              .page {
                box-shadow: none;
                border-radius: 0;
                max-width: none;
                border: none;
              }

              .hero {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .card,
              .meta-card {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>
          <div class="page">
            <div class="hero">
              <span class="badge">Food Verse Agent Report</span>
              <h1>Agent Report</h1>
              <p class="subtitle">Only completed/successful orders are counted. Approved manual discounts are applied.</p>

              <div class="meta-grid">
                <div class="meta-card">
                  <div class="meta-label">Zone Name</div>
                  <div class="meta-value">${zoneName}</div>
                </div>

                <div class="meta-card">
                  <div class="meta-label">Zone ID</div>
                  <div class="meta-value">${zoneId || "N/A"}</div>
                </div>

                <div class="meta-card">
                  <div class="meta-label">Zone Number</div>
                  <div class="meta-value">${zoneNumber}</div>
                </div>

                <div class="meta-card">
                  <div class="meta-label">Report Period</div>
                  <div class="meta-value">${periodText}</div>
                </div>

                <div class="meta-card">
                  <div class="meta-label">Generated At</div>
                  <div class="meta-value">${generatedAt}</div>
                </div>

                <div class="meta-card">
                  <div class="meta-label">Completed Orders</div>
                  <div class="meta-value">${report.orderCount}</div>
                </div>
              </div>
            </div>

            <div class="content">
              <h2 class="section-title">Financial Summary</h2>

              <div class="summary-grid">
                <div class="card blue">
                  <div class="card-label">Food Sale</div>
                  <div class="card-value positive">${money(report.foodSale)}</div>
                </div>

                <div class="card blue">
                  <div class="card-label">Restaurant Sale</div>
                  <div class="card-value positive">${money(
                    report.restaurantSale
                  )}</div>
                </div>

                <div class="card green">
                  <div class="card-label">Delivery Fee</div>
                  <div class="card-value positive">${money(report.deliveryFee)}</div>
                </div>

                <div class="card ${num(report.deliveryProfit) < 0 ? "red" : "green"}">
                  <div class="card-label">Delivery Profit</div>
                  <div class="card-value ${pdfValueClass(report.deliveryProfit)}">${signedMoney(
                    report.deliveryProfit
                  )}</div>
                </div>

                <div class="card green">
                  <div class="card-label">Restaurant Commission</div>
                  <div class="card-value positive">${signedMoney(
                    report.restaurantCommissionProfit
                  )}</div>
                </div>

                <div class="card green">
                  <div class="card-label">Food Sell Margin</div>
                  <div class="card-value positive">${signedMoney(report.foodMargin)}</div>
                </div>

                <div class="card red">
                  <div class="card-label">Approved Manual Discount</div>
                  <div class="card-value negative">${
                    report.manualDiscount > 0
                      ? minusMoney(report.manualDiscount)
                      : money(0)
                  }</div>
                </div>

                <div class="card dark">
                  <div class="card-label">Gross Profit</div>
                  <div class="card-value ${pdfValueClass(report.grossProfit)}">${signedMoney(
                    report.grossProfit
                  )}</div>
                </div>

                <div class="card dark">
                  <div class="card-label">Net Profit</div>
                  <div class="card-value ${pdfValueClass(report.netProfit)}">${signedMoney(
                    report.netProfit
                  )}</div>
                </div>
              </div>

              <div class="footer">
                <div>Food Verse Delivery • Agent Report</div>
                <div>Generated from completed orders and approved discounts only</div>
              </div>
            </div>
          </div>

          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=1100,height=850");

    if (!win) return message.error("Popup blocked. Please allow popups.");

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const sellLines = [
    { icon: UtensilsCrossed, label: "Food Sell", value: money(report.foodSale) },
    {
      icon: Store,
      label: "Restaurant Sell",
      value: money(report.restaurantSale),
    },
    { icon: Bike, label: "Delivery Fee", value: money(report.deliveryFee) },
    {
      icon: HandCoins,
      label: "Delivery Profit",
      value: signedMoney(report.deliveryProfit),
      valueClass:
        report.deliveryProfit < 0 ? "text-red-200" : "text-emerald-200",
    },
    { icon: Coins, label: "Rider Tips", value: money(report.riderTips) },
  ];

  const profitLines = [
    {
      icon: Percent,
      label: "Restaurant Commission Profit",
      value: signedMoney(report.restaurantCommissionProfit),
      valueClass: valueColorClass(report.restaurantCommissionProfit),
    },
    {
      icon: UtensilsCrossed,
      label: "Food Sell Margin",
      value: signedMoney(report.foodMargin),
      valueClass: valueColorClass(report.foodMargin),
    },
    {
      icon: HandCoins,
      label: "Delivery Profit",
      value: signedMoney(report.deliveryProfit),
      valueClass: valueColorClass(report.deliveryProfit),
    },
    {
      icon: Trash2,
      label: "Approved Manual Discount",
      value: report.manualDiscount > 0 ? minusMoney(report.manualDiscount) : money(0),
      danger: true,
      valueClass: "text-red-300",
    },
    {
      icon: BadgeDollarSign,
      label: "Gross Profit",
      value: signedMoney(report.grossProfit),
      valueClass: valueColorClass(report.grossProfit),
    },
  ];

  return (
    <Layout>
      <div className="space-y-4 pb-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-blue-600">
                Food Verse Agent Report Control
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Profit Reports
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Only completed/successful orders are counted. Profit =
                restaurant commission + food sell margin + delivery profit -
                approved manual discount.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCcw
                  size={16}
                  className={
                    ordersFetching || restaurantsFetching || discountsFetching
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Share2 size={16} /> Share
              </button>

              <button
                onClick={handleExportPdf}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
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
              <button
                key={key}
                onClick={() => setRangeType(key)}
                className={rangeBtn(rangeType === key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className={rowCard}>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Start Date
              </label>

              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <CalendarDays size={16} className="text-slate-400" />

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setRangeType("custom");
                    setStartDate(e.target.value);
                  }}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className={rowCard}>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                End Date
              </label>

              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <CalendarDays size={16} className="text-slate-400" />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setRangeType("custom");
                    setEndDate(e.target.value);
                  }}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className={rowCard}>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Completed Orders
              </label>

              <div className="mt-3 text-3xl font-black text-slate-950">
                {report.orderCount}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Only completed/successful orders in this range
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[30px] bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold opacity-90">
                  {rangeType === "today"
                    ? "Today's Completed Sell"
                    : "Selected Range Completed Sell"}
                </p>

                <h3 className="mt-2 text-4xl font-black tracking-tight">
                  {money(report.foodSale)}
                </h3>
              </div>

              <div className="rounded-2xl bg-white/15 p-3">
                <BadgeDollarSign size={22} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {sellLines.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <item.icon size={16} /> {item.label}
                  </div>

                  <div
                    className={`text-sm font-bold ${
                      item.valueClass || "text-white"
                    }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold opacity-90">
                  Profit Summary
                </p>

                <h3
                  className={`mt-2 text-4xl font-black tracking-tight ${
                    report.netProfit < 0 ? "text-red-300" : "text-emerald-300"
                  }`}
                >
                  {signedMoney(report.netProfit)}
                </h3>

                <p className="mt-2 text-xs opacity-80">
                  Completed orders only + approved discount only
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 p-3">
                <Coins size={22} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {profitLines.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <item.icon size={16} /> {item.label}
                  </div>

                  <div
                    className={`text-sm font-bold ${
                      item.valueClass || (item.danger ? "text-red-200" : "")
                    }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-xl font-black text-slate-950">
              Daily Breakdown
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Daily profit summary for completed/successful orders only
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Completed Orders</th>
                    <th className="px-3 py-3">Restaurant Sale</th>
                    <th className="px-3 py-3">Food Sale</th>
                    <th className="px-3 py-3">Delivery Profit</th>
                    <th className="px-3 py-3">Approved Discount</th>
                    <th className="px-3 py-3">Net Profit</th>
                  </tr>
                </thead>

                <tbody>
                  {dailyRows.length ? (
                    dailyRows.map((row) => (
                      <tr
                        key={row.date}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-3 py-3 font-semibold text-slate-800">
                          {dayjs(row.date).format("DD MMM YYYY")}
                        </td>

                        <td className="px-3 py-3 text-slate-600">
                          {row.orderCount}
                        </td>

                        <td className="px-3 py-3 text-emerald-600 font-semibold">
                          {money(row.restaurantSale)}
                        </td>

                        <td className="px-3 py-3 text-emerald-600 font-semibold">
                          {money(row.foodSale)}
                        </td>

                        <td
                          className={`px-3 py-3 font-semibold ${
                            row.deliveryProfit < 0
                              ? "text-red-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {signedMoney(row.deliveryProfit)}
                        </td>

                        <td className="px-3 py-3 text-red-500 font-semibold">
                          {row.manualDiscount > 0
                            ? minusMoney(row.manualDiscount)
                            : money(0)}
                        </td>

                        <td
                          className={`px-3 py-3 font-bold ${
                            row.netProfit < 0
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {signedMoney(row.netProfit)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-8 text-center text-slate-500"
                      >
                        No completed/successful orders found in this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <h2 className="text-xl font-black text-slate-950">
                Manual Discount Request
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Send discount request to main admin. Only approved discount will
                affect report.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="Discount amount"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  type="text"
                  value={discountNote}
                  onChange={(e) => setDiscountNote(e.target.value)}
                  placeholder="Reason / note required"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <button
                  onClick={addDiscount}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={16} /> Send Request
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {manualDiscountRequests.length ? (
                  manualDiscountRequests.map((entry) => (
                    <div
                      key={entry._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {money(entry.amount)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {entry.note || "Manual discount"} •{" "}
                            {dayjs(entry.date).format("DD MMM YYYY")}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            entry.status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : entry.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </div>

                      {entry.reviewNote ? (
                        <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs text-slate-500">
                          Admin note: {entry.reviewNote}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                    No manual discount request in this range.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <h2 className="text-xl font-black text-slate-950">
                Profit Formula
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This final profit is calculated from completed orders and
                approved discounts only.
              </p>

              <div className="mt-4 space-y-3">
                {[
                  [
                    "Restaurant Commission Profit",
                    signedMoney(report.restaurantCommissionProfit),
                    report.restaurantCommissionProfit < 0
                      ? "text-red-500"
                      : "text-emerald-600",
                  ],
                  [
                    "Food Sell Margin",
                    signedMoney(report.foodMargin),
                    report.foodMargin < 0 ? "text-red-500" : "text-emerald-600",
                  ],
                  [
                    "Delivery Profit",
                    signedMoney(report.deliveryProfit),
                    report.deliveryProfit < 0
                      ? "text-red-500"
                      : "text-emerald-600",
                  ],
                  [
                    "Approved Manual Discount",
                    report.manualDiscount > 0
                      ? minusMoney(report.manualDiscount)
                      : money(0),
                    "text-red-500",
                  ],
                  [
                    "Net Profit",
                    signedMoney(report.netProfit),
                    report.netProfit < 0 ? "text-red-600" : "text-emerald-600",
                  ],
                ].map(([label, value, cls]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className={`text-sm font-bold ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-xl font-black text-slate-950">
            Restaurant Commission Setup
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Auto loaded from main admin restaurant settings
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-3 py-3">Restaurant</th>
                  <th className="px-3 py-3">Completed Orders</th>
                  <th className="px-3 py-3">Restaurant Sale</th>
                  <th className="px-3 py-3">Food Sale</th>
                  <th className="px-3 py-3">Food Margin</th>
                  <th className="px-3 py-3">Commission %</th>
                  <th className="px-3 py-3">Commission Profit</th>
                </tr>
              </thead>

              <tbody>
                {restaurantRows.length ? (
                  restaurantRows.map((row) => (
                    <tr
                      key={row.restaurantId}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {row.restaurantName}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {row.orderCount}
                      </td>

                      <td className="px-3 py-3 text-emerald-600 font-semibold">
                        {money(row.restaurantSale)}
                      </td>

                      <td className="px-3 py-3 text-emerald-600 font-semibold">
                        {money(row.foodSale)}
                      </td>

                      <td className="px-3 py-3 font-semibold text-emerald-600">
                        {signedMoney(row.foodMargin)}
                      </td>

                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700">
                          {num(row.rate)}%
                        </span>
                      </td>

                      <td className="px-3 py-3 font-bold text-emerald-600">
                        {signedMoney(row.commissionProfit)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      No completed/successful restaurant sales found in this
                      range.
                    </td>
                  </tr>
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