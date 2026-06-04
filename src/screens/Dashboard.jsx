import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import { fetchDashboardData } from "../api/dashboardApi";
import api from "../api/config";
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

const toNumber = (value) => {
  if (typeof value === "string") {
    const cleaned = value.replace(/[৳,+\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const pickNumber = (source, keys = []) => {
  for (const key of keys) {
    const value = toNumber(source?.[key]);
    if (value > 0) return value;
  }

  return 0;
};

const getPlatformFee = (item) =>
  toNumber(
    item?.plateformFee ??
      item?.platformFee ??
      item?.platformFees ??
      item?.adminFee ??
      item?.serviceFee ??
      0
  );

const getItemDiscountAmount = (item, beforeDiscount) => {
  const directDiscount = pickNumber(item, [
    "discountAmount",
    "menuDiscountAmount",
    "offerDiscountAmount",
    "itemDiscountAmount",
    "discountValue",
  ]);

  if (directDiscount > 0) return directDiscount;

  const discountRate = pickNumber(item, [
    "discountRate",
    "discountPercent",
    "discountPercentage",
    "offerDiscount",
    "discount",
  ]);

  if (discountRate > 0) {
    return (beforeDiscount * discountRate) / 100;
  }

  return 0;
};

const getDiscountedCustomerUnitPrice = (item) => {
  const basedPrice = toNumber(item?.basedPrice ?? item?.basePrice);
  const platformFee = getPlatformFee(item);
  const beforeDiscount = basedPrice + platformFee;

  if (beforeDiscount > 0) {
    const discountAmount = getItemDiscountAmount(item, beforeDiscount);
    const calculatedAfterDiscount = Math.max(0, beforeDiscount - discountAmount);

    const possiblePrices = [
      calculatedAfterDiscount,
      toNumber(item?.offerPrice),
      toNumber(item?.sellingPrice),
      toNumber(item?.price),
    ].filter((value) => value > 0);

    return possiblePrices.length ? Math.min(...possiblePrices) : 0;
  }

  return (
    toNumber(item?.offerPrice) ||
    toNumber(item?.sellingPrice) ||
    toNumber(item?.price) ||
    0
  );
};

const calculateDiscountedFoodSellFromItems = (items = []) => {
  if (!Array.isArray(items) || !items.length) return 0;

  return items.reduce((sum, item) => {
    const quantity = toNumber(item?.quantity || item?.qty || 1) || 1;
    return sum + getDiscountedCustomerUnitPrice(item) * quantity;
  }, 0);
};

const getSummaryDiscountAmount = (item) =>
  pickNumber(item, [
    "itemDiscount",
    "itemDiscountAmount",
    "menuDiscount",
    "menuDiscountAmount",
    "offerDiscountAmount",
    "productDiscount",
    "foodDiscount",
    "foodDiscountAmount",
    "discountAmount",
    "totalDiscount",
  ]);

const getCorrectFoodSell = (item) => {
  const explicitDiscounted = pickNumber(item, [
    "discountedFoodSell",
    "netFoodSell",
    "foodSellAfterDiscount",
    "afterDiscountFoodSell",
    "customerPayableFoodSell",
  ]);

  if (explicitDiscounted > 0) return explicitDiscounted;

  const itemsTotal = calculateDiscountedFoodSellFromItems(
    item?.items || item?.orderItems || item?.menus || []
  );

  if (itemsTotal > 0) return itemsTotal;

  const foodSellBeforeDiscount =
    pickNumber(item, ["foodSellBeforeDiscount", "grossFoodSell"]) ||
    toNumber(item?.foodSell);

  const discountAmount = getSummaryDiscountAmount(item);

  if (foodSellBeforeDiscount > 0 && discountAmount > 0) {
    return Math.max(0, foodSellBeforeDiscount - discountAmount);
  }

  return foodSellBeforeDiscount;
};

const normalizeSalesItem = (item) => {
  const foodSell = getCorrectFoodSell(item);

  return {
    ...item,
    foodSell,
  };
};

const normalizeDashboardData = (payload = {}) => {
  const salesSummary = Array.isArray(payload?.salesSummary)
    ? payload.salesSummary.map(normalizeSalesItem)
    : [];

  const orderOverview = Array.isArray(payload?.orderOverview)
    ? payload.orderOverview.map(normalizeSalesItem)
    : [];

  const revenueOverview = Array.isArray(payload?.revenueOverview)
    ? payload.revenueOverview.map(normalizeSalesItem)
    : [];

  const topRestaurants = Array.isArray(payload?.topRestaurants)
    ? payload.topRestaurants.map((restaurant) => ({
        ...restaurant,
        foodSell: getCorrectFoodSell(restaurant),
      }))
    : [];

  return {
    ...payload,
    salesSummary,
    orderOverview,
    revenueOverview,
    topRestaurants,
  };
};

const getUserZoneId = (user) =>
  user?.zoneId ||
  user?.zoneID ||
  user?.zone?._id ||
  user?.zone?.zoneId ||
  user?.assignedZone?._id ||
  user?.assignedZone?.zoneId ||
  user?.agentZone?._id ||
  user?.agentZone?.zoneId ||
  null;

const DASHBOARD_ORDER_CACHE_TTL = 60 * 1000;
const DASHBOARD_ORDER_PAGE_LIMIT = 500;
const DASHBOARD_ORDER_MAX_PAGES = 20;
const DASHBOARD_ORDER_CONCURRENCY = 4;

const getDashboardOrderCacheKey = (zoneId) => {
  const today = new Date().toISOString().slice(0, 10);
  return `agent-dashboard-orders-${zoneId}-${today}`;
};

const getCachedDashboardOrders = (zoneId) => {
  try {
    const raw = localStorage.getItem(getDashboardOrderCacheKey(zoneId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const createdAt = Number(parsed?.createdAt || 0);
    const orders = Array.isArray(parsed?.orders) ? parsed.orders : [];

    if (!createdAt || Date.now() - createdAt > DASHBOARD_ORDER_CACHE_TTL) {
      return null;
    }

    return orders;
  } catch (error) {
    return null;
  }
};

const setCachedDashboardOrders = (zoneId, orders = []) => {
  try {
    localStorage.setItem(
      getDashboardOrderCacheKey(zoneId),
      JSON.stringify({ createdAt: Date.now(), orders })
    );
  } catch (error) {
    // Ignore cache write errors.
  }
};

const extractOrderListPayload = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  if (Array.isArray(payload?.result?.orders)) return payload.result.orders;
  if (Array.isArray(payload)) return payload;
  return [];
};

const extractOrderTotalCount = (payload, fallback = 0) => {
  return Number(
    payload?.totalCount ||
      payload?.count ||
      payload?.total ||
      payload?.totalOrders ||
      payload?.pagination?.total ||
      payload?.meta?.total ||
      payload?.data?.totalCount ||
      payload?.data?.total ||
      payload?.result?.totalCount ||
      payload?.result?.total ||
      fallback ||
      0
  );
};

const uniqueOrders = (orders = []) => {
  return Array.from(
    new Map(
      orders
        .filter(Boolean)
        .map((item, index) => [item?._id || item?.id || `order-${index}`, item])
    ).values()
  );
};

const fetchOrderPage = async (zoneId, page, limit = DASHBOARD_ORDER_PAGE_LIMIT) => {
  const response = await api.post(`/zone/order-list?page=${page}&limit=${limit}`, {
    zoneId,
  });

  const payload = response?.data;

  return {
    rows: extractOrderListPayload(payload),
    totalCount: extractOrderTotalCount(payload),
  };
};

const runInBatches = async (items = [], batchSize = 4, worker) => {
  const results = [];

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    results.push(...batchResults);
  }

  return results;
};

const fetchAllDashboardOrders = async (user, options = {}) => {
  const zoneId = getUserZoneId(user);

  if (!zoneId) return [];

  const cachedOrders = options.useCache !== false ? getCachedDashboardOrders(zoneId) : null;

  if (cachedOrders) {
    return cachedOrders;
  }

  const firstPage = await fetchOrderPage(zoneId, 1);
  const firstRows = firstPage.rows;
  const totalCount = firstPage.totalCount;

  if (!firstRows.length) {
    setCachedDashboardOrders(zoneId, []);
    return [];
  }

  const totalPages = totalCount
    ? Math.min(DASHBOARD_ORDER_MAX_PAGES, Math.ceil(totalCount / DASHBOARD_ORDER_PAGE_LIMIT))
    : firstRows.length < DASHBOARD_ORDER_PAGE_LIMIT
    ? 1
    : DASHBOARD_ORDER_MAX_PAGES;

  if (totalPages <= 1) {
    const orders = uniqueOrders(firstRows);
    setCachedDashboardOrders(zoneId, orders);
    return orders;
  }

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);

  const remainingResults = await runInBatches(
    remainingPages,
    DASHBOARD_ORDER_CONCURRENCY,
    async (page) => {
      try {
        return await fetchOrderPage(zoneId, page);
      } catch (error) {
        console.error("Dashboard order page load error:", page, error);
        return { rows: [], totalCount: 0 };
      }
    }
  );

  const orders = uniqueOrders([
    ...firstRows,
    ...remainingResults.flatMap((item) => item.rows || []),
  ]);

  setCachedDashboardOrders(zoneId, orders);
  return orders;
};

const getOrderStatusText = (order) =>
  String(
    order?.orderStatus ||
      order?.status ||
      order?.deliveryStatus ||
      order?.paymentStatus ||
      order?.currentStatus ||
      ""
  ).toLowerCase();

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

const getOrderDate = (order) => {
  const dateValue =
    order?.deliveredAt ||
    order?.deliveryDate ||
    order?.orderDate ||
    order?.createdAt ||
    order?.updatedAt;

  const date = new Date(dateValue);

  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfWeek = (date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const startOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);

const isDateBetween = (date, start, end) => date >= start && date <= end;

const getOrderItems = (order) => {
  if (Array.isArray(order?.items)) return order.items;
  if (Array.isArray(order?.orderItems)) return order.orderItems;
  if (Array.isArray(order?.menus)) return order.menus;
  return [];
};

const getAddonTotalFromItems = (items = []) =>
  items.reduce((sum, item) => {
    const addons = Array.isArray(item?.addons) ? item.addons : [];

    return (
      sum +
      addons.reduce(
        (addonSum, addon) =>
          addonSum +
          toNumber(addon?.price || addon?.addonPrice) *
            (toNumber(addon?.quantity || addon?.qty || 1) || 1),
        0
      )
    );
  }, 0);

const getRestaurantUnitPrice = (item) =>
  toNumber(
    item?.restaurantPrice ??
      item?.restaurantAmount ??
      item?.restaurantEarning ??
      item?.basedPrice ??
      item?.basePrice ??
      item?.menuId?.basedPrice ??
      item?.menuId?.basePrice ??
      item?.menu?.basedPrice ??
      0
  );

const getOrderRestaurantSell = (order) => {
  const direct = pickNumber(order, [
    "restaurantFoodSell",
    "restaurantSell",
    "restaurantSale",
    "restaurantAmount",
    "restaurantEarning",
    "restaurantSubTotal",
  ]);

  if (direct > 0) return direct;

  const items = getOrderItems(order);
  const itemsTotal = items.reduce((sum, item) => {
    const quantity = toNumber(item?.quantity || item?.qty || 1) || 1;
    return sum + getRestaurantUnitPrice(item) * quantity;
  }, 0);

  return itemsTotal + getAddonTotalFromItems(items);
};

const getOrderFoodSell = (order) => {
  const items = getOrderItems(order);
  const itemsTotal = calculateDiscountedFoodSellFromItems(items);

  if (itemsTotal > 0) {
    return itemsTotal + getAddonTotalFromItems(items);
  }

  const beforeDiscount =
    pickNumber(order, [
      "foodSellBeforeDiscount",
      "grossFoodSell",
      "itemsTotalBeforeDiscount",
      "subTotalBeforeDiscount",
    ]) ||
    toNumber(order?.foodSell) ||
    toNumber(order?.totalAmount) ||
    toNumber(order?.grandTotal);

  const discount = pickNumber(order, [
    "discountAmount",
    "voucherDiscount",
    "couponDiscount",
    "offerDiscountAmount",
    "menuDiscountAmount",
    "foodDiscountAmount",
    "totalDiscount",
  ]);

  if (beforeDiscount > 0 && discount > 0) {
    return Math.max(0, beforeDiscount - discount);
  }

  return beforeDiscount;
};

const getOrderDeliveryFee = (order) =>
  toNumber(
    order?.deliveryFee ??
      order?.deliveryCharge ??
      order?.deliveryAmount ??
      order?.deliveryChargeCollected ??
      0
  );

const getOrderRiderFee = (order) =>
  toNumber(
    order?.riderFee ??
      order?.riderCost ??
      order?.riderPayment ??
      order?.deliveryCost ??
      0
  );

const getOrderRiderTips = (order) =>
  toNumber(
    order?.riderTips ??
      order?.riderTip ??
      order?.tipAmount ??
      order?.tip ??
      0
  );

const getOrderRestaurantId = (order) =>
  order?.restaurantId?._id ||
  order?.restaurantId ||
  order?.restaurant?._id ||
  order?.restaurant ||
  "unknown";

const getOrderRestaurantName = (order) =>
  order?.restaurantName ||
  order?.restaurantId?.name ||
  order?.restaurantId?.restaurantName ||
  order?.restaurant?.name ||
  order?.restaurant?.restaurantName ||
  "Unknown Restaurant";

const getOrderRestaurantPhone = (order) =>
  order?.restaurantId?.phoneNumber ||
  order?.restaurantId?.phone ||
  order?.restaurant?.phoneNumber ||
  order?.restaurant?.phone ||
  "N/A";

const calculateOrderMetrics = (orders = []) =>
  orders.reduce(
    (acc, order) => {
      const foodSell = getOrderFoodSell(order);
      const restaurantSell = getOrderRestaurantSell(order);
      const deliveryFee = getOrderDeliveryFee(order);
      const riderFee = getOrderRiderFee(order);
      const riderTips = getOrderRiderTips(order);

      acc.foodSell += foodSell;
      acc.restaurantSell += restaurantSell;
      acc.deliveryFee += deliveryFee;
      acc.deliveryProfit += deliveryFee - riderFee;
      acc.riderTips += riderTips;
      acc.totalOrder += 1;

      return acc;
    },
    {
      foodSell: 0,
      restaurantSell: 0,
      deliveryFee: 0,
      deliveryProfit: 0,
      riderTips: 0,
      totalOrder: 0,
    }
  );

const makeSalesCard = (title, orders, tone) => {
  const metrics = calculateOrderMetrics(orders);

  return {
    title,
    foodSell: metrics.foodSell,
    restaurantSell: metrics.restaurantSell,
    deliveryFee: metrics.deliveryFee,
    deliveryProfit: metrics.deliveryProfit,
    riderTips: metrics.riderTips,
    tone,
  };
};

const buildSalesSummaryFromOrders = (orders = []) => {
  const completedOrders = orders.filter(isCompletedOrder);
  const now = new Date();

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const todayOrders = completedOrders.filter((order) => {
    const date = getOrderDate(order);
    return date && isDateBetween(date, todayStart, todayEnd);
  });

  const weeklyOrders = completedOrders.filter((order) => {
    const date = getOrderDate(order);
    return date && date >= weekStart && date <= todayEnd;
  });

  const monthlyOrders = completedOrders.filter((order) => {
    const date = getOrderDate(order);
    return date && date >= monthStart && date <= todayEnd;
  });

  return [
    makeSalesCard("Today's Sales", todayOrders, "blue"),
    makeSalesCard("Weekly Sales", weeklyOrders, "emerald"),
    makeSalesCard("Monthly Sales", monthlyOrders, "violet"),
  ];
};

const makeShortDateLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });

const buildDailyOverviewFromOrders = (orders = [], days = 7) => {
  const completedOrders = orders.filter(isCompletedOrder);
  const rows = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = startOfDay(new Date());
    date.setDate(date.getDate() - index);

    const dateStart = startOfDay(date);
    const dateEnd = endOfDay(date);

    const dayOrders = completedOrders.filter((order) => {
      const orderDate = getOrderDate(order);
      return orderDate && isDateBetween(orderDate, dateStart, dateEnd);
    });

    const metrics = calculateOrderMetrics(dayOrders);

    rows.push({
      label: makeShortDateLabel(date),
      foodSell: metrics.foodSell,
      restaurantSell: metrics.restaurantSell,
      deliveryFee: metrics.deliveryFee,
      deliveryProfit: metrics.deliveryProfit,
      chartDeliveryProfit: Math.max(metrics.deliveryProfit, 0),
      riderTips: metrics.riderTips,
      totalOrder: metrics.totalOrder,
    });
  }

  return rows;
};

const buildTopRestaurantsFromOrders = (orders = []) => {
  const map = new Map();

  orders.filter(isCompletedOrder).forEach((order) => {
    const restaurantId = String(getOrderRestaurantId(order));

    if (!map.has(restaurantId)) {
      map.set(restaurantId, {
        id: restaurantId,
        name: getOrderRestaurantName(order),
        phone: getOrderRestaurantPhone(order),
        badge: "Completed sales",
        foodSell: 0,
        restaurantSell: 0,
        orders: 0,
      });
    }

    const row = map.get(restaurantId);

    row.foodSell += getOrderFoodSell(order);
    row.restaurantSell += getOrderRestaurantSell(order);
    row.orders += 1;
  });

  return Array.from(map.values())
    .sort((a, b) => b.foodSell - a.foodSell)
    .slice(0, 2);
};

const applyOrderBasedDashboardMetrics = (dashboardData = {}, orders = []) => {
  if (!Array.isArray(orders) || !orders.length) {
    return normalizeDashboardData(dashboardData);
  }

  const salesSummary = buildSalesSummaryFromOrders(orders);
  const orderOverview = buildDailyOverviewFromOrders(orders);
  const revenueOverview = orderOverview.map((item) => ({
    label: item.label,
    foodSell: item.foodSell,
  }));

  const topRestaurants = buildTopRestaurantsFromOrders(orders);

  const hasOrderMetrics = salesSummary.some(
    (item) =>
      item.foodSell > 0 ||
      item.restaurantSell > 0 ||
      item.deliveryFee > 0 ||
      item.riderTips > 0
  );

  if (!hasOrderMetrics) {
    return normalizeDashboardData(dashboardData);
  }

  return {
    ...normalizeDashboardData(dashboardData),
    salesSummary,
    orderOverview,
    revenueOverview,
    topRestaurants: topRestaurants.length
      ? topRestaurants
      : normalizeDashboardData(dashboardData).topRestaurants,
  };
};

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

function StatCard({ item, index, isUpdating = false }) {
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

          <div className="mt-3 min-h-[48px]">
            {isUpdating ? (
              <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <AnimatedValue
                value={item.value}
                className="block text-4xl font-black tracking-tight text-slate-950"
              />
            )}
          </div>

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

function SectionCard({ title, subtitle, children, badge, isUpdating = false }) {
  return (
    <div className="relative rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:p-6">
      {isUpdating ? (
        <div className="absolute right-5 top-5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          Updating...
        </div>
      ) : null}

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

function EmptyChartBox({ text = "Data loading..." }) {
  return (
    <div className="flex h-[340px] items-center justify-center rounded-3xl bg-slate-50 text-sm font-semibold text-slate-400">
      {text}
    </div>
  );
}

function SalesSummaryCard({ item, index, isUpdating = false }) {
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
            {isUpdating ? "Loading" : "Live"}
          </span>
        </div>

        <div className="mt-3 min-h-[60px]">
          {isUpdating ? (
            <div className="h-12 w-44 animate-pulse rounded-2xl bg-white/15" />
          ) : (
            <AnimatedValue
              value={item.foodSell}
              money
              className="block text-4xl font-black tracking-tight md:text-5xl"
            />
          )}
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
                  {isUpdating ? "..." : formatMoney(row.value)}
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
      const normalized = normalizeDashboardData(res);
      setData(normalized);

      const orders = await fetchAllDashboardOrders(user);
      setData(applyOrderBasedDashboardMetrics(res, orders));
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

  const dashboardLoading = loading || authLoading;

  const fallbackStats = [
    {
      title: "Today Order",
      value: 0,
      sub: "Orders placed today",
      tone: "blue",
      icon: "orders",
    },
    {
      title: "Total Order",
      value: 0,
      sub: "All-time zone orders",
      tone: "violet",
      icon: "package",
    },
    {
      title: "Total Rider",
      value: 0,
      sub: "Zone riders",
      tone: "indigo",
      icon: "rider",
    },
    {
      title: "Total Restaurant",
      value: 0,
      sub: "Zone restaurants",
      tone: "amber",
      icon: "restaurant",
    },
  ];

  const fallbackSalesSummary = [
    {
      title: "Today's Sales",
      foodSell: 0,
      restaurantSell: 0,
      deliveryFee: 0,
      deliveryProfit: 0,
      riderTips: 0,
      tone: "blue",
    },
    {
      title: "Weekly Sales",
      foodSell: 0,
      restaurantSell: 0,
      deliveryFee: 0,
      deliveryProfit: 0,
      riderTips: 0,
      tone: "emerald",
    },
    {
      title: "Monthly Sales",
      foodSell: 0,
      restaurantSell: 0,
      deliveryFee: 0,
      deliveryProfit: 0,
      riderTips: 0,
      tone: "violet",
    },
  ];

  const displayStats = data.stats?.length ? data.stats : fallbackStats;
  const displaySalesSummary = data.salesSummary?.length
    ? data.salesSummary
    : fallbackSalesSummary;

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
              {data.zoneName || user?.name || "Zone Dashboard"}
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

        {errorText ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{errorText}</span>
              </div>

              <button
                onClick={loadDashboard}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {displayStats.map((item, index) => (
            <StatCard
              key={item.title}
              item={item}
              index={index}
              isUpdating={dashboardLoading}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Order Overview"
            subtitle="Food sell, restaurant sell, delivery fee, delivery profit, rider tips and total order"
            badge="Zone Orders"
            isUpdating={dashboardLoading}
          >
            {data.orderOverview?.length ? (
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
            ) : (
              <EmptyChartBox text={dashboardLoading ? "Loading chart..." : "No order chart data found"} />
            )}
          </SectionCard>

          <SectionCard
            title="Revenue Overview"
            subtitle="Only food sales"
            badge="Zone Revenue"
            isUpdating={dashboardLoading}
          >
            {data.revenueOverview?.length ? (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueOverview}>
                    <defs>
                      <linearGradient
                        id="sellGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.5}
                        />
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
            ) : (
              <EmptyChartBox text={dashboardLoading ? "Loading revenue..." : "No revenue data found"} />
            )}
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Top Restaurant"
            subtitle="Top 2 restaurants inside this zone only"
            badge="Zone Top 2"
            isUpdating={dashboardLoading}
          >
            {data.topRestaurants?.length ? (
              <div className="grid gap-4">
                {data.topRestaurants.slice(0, 2).map((item, index) => (
                  <TopEntityCard
                    key={item.id || index}
                    item={item}
                    rank={index + 1}
                    type="restaurant"
                  />
                ))}
              </div>
            ) : (
              <EmptyChartBox text={dashboardLoading ? "Loading top restaurants..." : "No top restaurant data found"} />
            )}
          </SectionCard>

          <SectionCard
            title="Top Rider"
            subtitle="Name, phone, delivered, cash collection and earning"
            badge="Zone Top 2"
            isUpdating={dashboardLoading}
          >
            {data.topRiders?.length ? (
              <div className="grid gap-4">
                {data.topRiders.slice(0, 2).map((item, index) => (
                  <TopEntityCard
                    key={item.id || index}
                    item={item}
                    rank={index + 1}
                    type="rider"
                  />
                ))}
              </div>
            ) : (
              <EmptyChartBox text={dashboardLoading ? "Loading top riders..." : "No top rider data found"} />
            )}
          </SectionCard>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {displaySalesSummary.map((item, index) => (
            <SalesSummaryCard
              key={item.title}
              item={item}
              index={index}
              isUpdating={dashboardLoading}
            />
          ))}
        </section>
      </div>
    </Layout>
  );
}