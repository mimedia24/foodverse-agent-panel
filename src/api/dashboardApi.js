import api from "/src/api/config.js";

const BD_TIMEZONE = "Asia/Dhaka";

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatDateKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getMonthKeyBD(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).format(date);
}

function getDayLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BD_TIMEZONE,
    weekday: "short",
  }).format(date);
}

function extractCount(payload, fallback = 0) {
  if (typeof payload === "number") return payload;
  if (!payload) return fallback;

  if (typeof payload?.totalCount === "number") return payload.totalCount;
  if (typeof payload?.count === "number") return payload.count;
  if (typeof payload?.total === "number") return payload.total;
  if (typeof payload?.orderCount === "number") return payload.orderCount;

  if (typeof payload?.data?.totalCount === "number")
    return payload.data.totalCount;
  if (typeof payload?.data?.count === "number") return payload.data.count;
  if (typeof payload?.data?.total === "number") return payload.data.total;
  if (typeof payload?.data?.orderCount === "number")
    return payload.data.orderCount;

  if (Array.isArray(payload?.data)) return payload.data.length;
  if (Array.isArray(payload?.result)) return payload.result.length;
  if (Array.isArray(payload?.orders)) return payload.orders.length;
  if (Array.isArray(payload)) return payload.length;

  return fallback;
}

function getArrayFromResponse(data) {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data)) return data;
  return [];
}

function getOrderDate(order) {
  return (
    order?.orderDate ||
    order?.createdAt ||
    order?.updatedAt ||
    order?.date ||
    null
  );
}

function isCurrentMonthOrder(order) {
  const rawDate = getOrderDate(order);
  if (!rawDate) return false;

  const orderDate = new Date(rawDate);
  if (Number.isNaN(orderDate.getTime())) return false;

  return getMonthKeyBD(orderDate) === getMonthKeyBD(new Date());
}

function isOlderThanCurrentMonth(order) {
  const rawDate = getOrderDate(order);
  if (!rawDate) return false;

  const orderDate = new Date(rawDate);
  if (Number.isNaN(orderDate.getTime())) return false;

  return getMonthKeyBD(orderDate) < getMonthKeyBD(new Date());
}

function getRestaurantId(order) {
  return (
    order?.restaurantId?._id ||
    order?.restaurantId ||
    order?.restaurant?._id ||
    order?.restaurant ||
    order?.restaurantInfo?._id ||
    null
  );
}

function getRestaurantName(order) {
  return (
    order?.restaurantId?.restaurantName ||
    order?.restaurantId?.name ||
    order?.restaurant?.restaurantName ||
    order?.restaurant?.name ||
    order?.restaurantInfo?.restaurantName ||
    order?.restaurantInfo?.name ||
    order?.rsName ||
    order?.restaurantName ||
    "Restaurant"
  );
}

function getRestaurantPhone(order) {
  return (
    order?.restaurantId?.phoneNumber ||
    order?.restaurantId?.phone ||
    order?.restaurantId?.mobile ||
    order?.restaurant?.phoneNumber ||
    order?.restaurant?.phone ||
    order?.restaurant?.mobile ||
    order?.restaurantInfo?.phoneNumber ||
    order?.restaurantInfo?.phone ||
    order?.restaurantPhone ||
    "N/A"
  );
}

function getRiderId(order) {
  return (
    order?.riderId?._id ||
    order?.riderId ||
    order?.rider?._id ||
    order?.rider ||
    order?.assignedRider?._id ||
    order?.assignedRider ||
    order?.riderInfo?._id ||
    order?.riderInfo ||
    order?.deliveryBoy?._id ||
    order?.deliveryBoy ||
    order?.deliveryMan?._id ||
    order?.deliveryMan ||
    null
  );
}

function getRiderName(order) {
  return (
    order?.riderId?.name ||
    order?.riderId?.fullName ||
    order?.riderId?.riderName ||
    order?.rider?.name ||
    order?.rider?.fullName ||
    order?.rider?.riderName ||
    order?.assignedRider?.name ||
    order?.assignedRider?.fullName ||
    order?.assignedRider?.riderName ||
    order?.riderInfo?.name ||
    order?.riderInfo?.fullName ||
    order?.riderInfo?.riderName ||
    order?.deliveryBoy?.name ||
    order?.deliveryBoy?.fullName ||
    order?.deliveryMan?.name ||
    order?.deliveryMan?.fullName ||
    order?.riderName ||
    order?.deliveryBoyName ||
    order?.deliveryManName ||
    ""
  );
}

function getRiderPhone(order) {
  return (
    order?.riderId?.phoneNumber ||
    order?.riderId?.phone ||
    order?.riderId?.mobile ||
    order?.rider?.phoneNumber ||
    order?.rider?.phone ||
    order?.rider?.mobile ||
    order?.assignedRider?.phoneNumber ||
    order?.assignedRider?.phone ||
    order?.assignedRider?.mobile ||
    order?.riderInfo?.phoneNumber ||
    order?.riderInfo?.phone ||
    order?.riderInfo?.mobile ||
    order?.deliveryBoy?.phoneNumber ||
    order?.deliveryBoy?.phone ||
    order?.deliveryMan?.phoneNumber ||
    order?.deliveryMan?.phone ||
    order?.riderPhone ||
    order?.deliveryBoyPhone ||
    order?.deliveryManPhone ||
    "N/A"
  );
}

function getOrderMetrics(order) {
  const items = Array.isArray(order?.items) ? order.items : [];

  const restaurantFoodSale = items.reduce(
    (sum, item) =>
      sum + toNumber(item?.basedPrice) * toNumber(item?.quantity || 1),
    0
  );

  const customerFoodSale = items.reduce((sum, item) => {
    const selling =
      toNumber(item?.sellingPrice) > 0
        ? toNumber(item?.sellingPrice)
        : toNumber(item?.offerPrice);

    return sum + selling * toNumber(item?.quantity || 1);
  }, 0);

  const addonsTotal = items.reduce((sum, item) => {
    const addons = Array.isArray(item?.addons) ? item.addons : [];

    return (
      sum +
      addons.reduce(
        (addonSum, addon) =>
          addonSum + toNumber(addon?.price) * toNumber(addon?.quantity || 1),
        0
      )
    );
  }, 0);

  const fallbackFoodSell = toNumber(
    order?.foodSell ??
      order?.foodSales ??
      order?.totalSales ??
      order?.totalAmount ??
      order?.grandTotal ??
      order?.orderAmount ??
      0
  );

  const fallbackRestaurantSell = toNumber(
    order?.restaurantSell ??
      order?.restaurantSales ??
      order?.restaurantAmount ??
      order?.restaurantTotal ??
      order?.storeAmount ??
      0
  );

  const foodSell = customerFoodSale + addonsTotal || fallbackFoodSell;
  const restaurantSell =
    restaurantFoodSale + addonsTotal || fallbackRestaurantSell || foodSell;

  const riderTips = toNumber(
    order?.riderTips ?? order?.tips ?? order?.tip ?? order?.tipAmount ?? 0
  );

  const deliveryFee = toNumber(
    order?.deliveryChargeCollected ??
      order?.deliveryAmount ??
      order?.deliveryFee ??
      order?.deliveryCharge ??
      order?.delivery ??
      0
  );

  const riderCost = toNumber(
    order?.riderFee ??
      order?.riderCost ??
      order?.riderPayment ??
      order?.deliveryCost ??
      order?.riderEarning ??
      order?.deliveryBoyAmount ??
      0
  );

  return {
    foodSell,
    restaurantSell,
    deliveryFee,
    deliveryProfit: deliveryFee - riderCost,
    riderTips,
    riderCost,
  };
}

function getCashCollection(order) {
  return toNumber(
    order?.cashCollection ??
      order?.cashCollected ??
      order?.cashOnDelivery ??
      order?.codAmount ??
      order?.cashAmount ??
      0
  );
}

function isDeliveredOrder(order) {
  const status = String(
    order?.status || order?.orderStatus || order?.deliveryStatus || ""
  ).toLowerCase();

  return (
    status.includes("delivered") ||
    status.includes("complete") ||
    status.includes("completed")
  );
}

function getTodayRangeBD() {
  return formatDateKey(new Date());
}

function buildWeekDaysFromOrders(orders = []) {
  const now = new Date();
  const bdNow = new Date(now.toLocaleString("en-US", { timeZone: BD_TIMEZONE }));

  const day = bdNow.getDay();
  const diffToSaturday = (day + 1) % 7;

  const start = new Date(bdNow);
  start.setDate(bdNow.getDate() - diffToSaturday);
  start.setHours(0, 0, 0, 0);

  const weekMap = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);

    return {
      key: formatDateKey(d),
      label: getDayLabel(d),
      date: formatDateKey(d),
      totalSales: 0,
      restaurantSales: 0,
      deliveryAmount: 0,
      riderTips: 0,
      deliveryProfit: 0,
      totalOrders: 0,
      isUpcoming: d > bdNow,
    };
  });

  const lookup = Object.fromEntries(weekMap.map((d) => [d.key, d]));

  orders.forEach((order) => {
    const rawDate = getOrderDate(order);
    if (!rawDate) return;

    const key = formatDateKey(new Date(rawDate));
    if (!lookup[key]) return;

    const metrics = getOrderMetrics(order);

    lookup[key].totalSales += metrics.foodSell;
    lookup[key].restaurantSales += metrics.restaurantSell;
    lookup[key].deliveryAmount += metrics.deliveryFee;
    lookup[key].riderTips += metrics.riderTips;
    lookup[key].deliveryProfit += metrics.deliveryProfit;
    lookup[key].totalOrders += 1;
  });

  return weekMap.map((item) => ({
    day: item.label,
    date: item.date,
    totalSales: Math.trunc(item.totalSales),
    restaurantSales: Math.trunc(item.restaurantSales),
    deliveryAmount: Math.trunc(item.deliveryAmount),
    riderTips: Math.trunc(item.riderTips),
    deliveryProfit: Math.trunc(item.deliveryProfit),
    totalOrders: item.totalOrders,
    isUpcoming: item.isUpcoming,
  }));
}

async function fetchZoneOrdersForDashboard(zoneId) {
  let page = 1;
  const limit = 100;
  const MAX_MONTH_PAGES = 12;

  let allMonthOrders = [];
  let totalCount = 0;

  while (page <= MAX_MONTH_PAGES) {
    try {
      const { data } = await api.post(
        `/zone/order-list?page=${page}&limit=${limit}`,
        { zoneId }
      );

      const batch = getArrayFromResponse(data);
      const pageTotal = extractCount(data, 0);

      if (pageTotal) totalCount = pageTotal;

      if (!batch.length) break;

      const currentMonthBatch = batch.filter(isCurrentMonthOrder);
      allMonthOrders = [...allMonthOrders, ...currentMonthBatch];

      const hasOlderOrder = batch.some(isOlderThanCurrentMonth);
      if (hasOlderOrder && currentMonthBatch.length > 0) break;

      if (batch.length < limit) break;
      page += 1;
    } catch (error) {
      console.warn(
        `Dashboard order page ${page} failed. Showing loaded month orders only.`,
        error?.response?.data?.message || error?.message
      );
      break;
    }
  }

  const orders = Array.from(
    new Map(
      allMonthOrders
        .filter(Boolean)
        .map((item, index) => [item?._id || item?.id || `order-${index}`, item])
    ).values()
  );

  return {
    orders,
    totalOrders: totalCount || orders.length,
  };
}

async function fetchAllZoneRestaurants(zoneId) {
  try {
    const { data } = await api.post("/zone/restaurant-list", {
      zoneId,
      page: 1,
      limit: 300,
    });

    const restaurants = getArrayFromResponse(data);

    return Array.from(
      new Map(
        restaurants
          .filter(Boolean)
          .map((item, index) => [item?._id || item?.id || `restaurant-${index}`, item])
      ).values()
    );
  } catch (error) {
    console.warn(
      "Dashboard restaurant list failed.",
      error?.response?.data?.message || error?.message
    );
    return [];
  }
}

async function fetchAllZoneRiders(zoneId) {
  try {
    const { data } = await api.post(`/zone/rider-list?limit=200&page=1`, {
      zoneId,
    });

    const riders = getArrayFromResponse(data);

    return Array.from(
      new Map(
        riders
          .filter(Boolean)
          .map((item, index) => [item?._id || item?.id || `rider-${index}`, item])
      ).values()
    );
  } catch (error) {
    console.warn(
      "Dashboard rider list failed.",
      error?.response?.data?.message || error?.message
    );
    return [];
  }
}

function normalizeStats({
  todayOrders,
  totalOrders,
  totalRiders,
  totalRestaurants,
}) {
  return [
    {
      title: "Today Order",
      value: todayOrders,
      sub: "Orders placed today",
      tone: "blue",
      icon: "orders",
    },
    {
      title: "Total Order",
      value: totalOrders,
      sub: "All-time zone orders",
      tone: "violet",
      icon: "package",
    },
    {
      title: "Total Rider",
      value: totalRiders,
      sub: "Zone riders",
      tone: "indigo",
      icon: "rider",
    },
    {
      title: "Total Restaurant",
      value: totalRestaurants,
      sub: "Zone restaurants",
      tone: "amber",
      icon: "restaurant",
    },
  ];
}

function buildSummaryFromOrders(orders = []) {
  const todayKey = getTodayRangeBD();
  const currentMonthKey = getMonthKeyBD(new Date());
  const weekDaySales = buildWeekDaysFromOrders(orders);
  const weekKeys = new Set(weekDaySales.map((item) => item.date));

  const today = {
    totalSales: 0,
    restaurantSales: 0,
    deliveryAmount: 0,
    riderTips: 0,
    deliveryProfit: 0,
    count: 0,
  };

  const weekly = {
    totalSales: 0,
    restaurantSales: 0,
    deliveryAmount: 0,
    riderTips: 0,
    deliveryProfit: 0,
  };

  const monthly = {
    totalSales: 0,
    restaurantSales: 0,
    deliveryAmount: 0,
    riderTips: 0,
    deliveryProfit: 0,
  };

  orders.forEach((order) => {
    const rawDate = getOrderDate(order);
    if (!rawDate) return;

    const dateObj = new Date(rawDate);
    const dateKey = formatDateKey(dateObj);
    const monthKey = getMonthKeyBD(dateObj);

    const metrics = getOrderMetrics(order);

    if (dateKey === todayKey) {
      today.totalSales += metrics.foodSell;
      today.restaurantSales += metrics.restaurantSell;
      today.deliveryAmount += metrics.deliveryFee;
      today.riderTips += metrics.riderTips;
      today.deliveryProfit += metrics.deliveryProfit;
      today.count += 1;
    }

    if (weekKeys.has(dateKey)) {
      weekly.totalSales += metrics.foodSell;
      weekly.restaurantSales += metrics.restaurantSell;
      weekly.deliveryAmount += metrics.deliveryFee;
      weekly.riderTips += metrics.riderTips;
      weekly.deliveryProfit += metrics.deliveryProfit;
    }

    if (monthKey === currentMonthKey) {
      monthly.totalSales += metrics.foodSell;
      monthly.restaurantSales += metrics.restaurantSell;
      monthly.deliveryAmount += metrics.deliveryFee;
      monthly.riderTips += metrics.riderTips;
      monthly.deliveryProfit += metrics.deliveryProfit;
    }
  });

  return {
    today: {
      count: today.count,
      totalSales: Math.trunc(today.totalSales),
      restaurantSales: Math.trunc(today.restaurantSales),
      deliveryAmount: Math.trunc(today.deliveryAmount),
      riderTips: Math.trunc(today.riderTips),
      deliveryProfit: Math.trunc(today.deliveryProfit),
    },
    weekly: {
      totalSales: Math.trunc(weekly.totalSales),
      restaurantSales: Math.trunc(weekly.restaurantSales),
      deliveryAmount: Math.trunc(weekly.deliveryAmount),
      riderTips: Math.trunc(weekly.riderTips),
      deliveryProfit: Math.trunc(weekly.deliveryProfit),
    },
    monthly: {
      totalSales: Math.trunc(monthly.totalSales),
      restaurantSales: Math.trunc(monthly.restaurantSales),
      deliveryAmount: Math.trunc(monthly.deliveryAmount),
      riderTips: Math.trunc(monthly.riderTips),
      deliveryProfit: Math.trunc(monthly.deliveryProfit),
    },
    weekDaySales,
  };
}

function normalizeTopRestaurants(restaurants = [], monthOrders = []) {
  const map = new Map();

  restaurants.forEach((restaurant) => {
    const id = restaurant?._id || restaurant?.id;
    if (!id) return;

    map.set(id, {
      id,
      name: restaurant?.restaurantName || restaurant?.name || "Restaurant",
      phone:
        restaurant?.phoneNumber ||
        restaurant?.phone ||
        restaurant?.restaurantPhone ||
        restaurant?.mobile ||
        "N/A",
      orders: 0,
      foodSell: 0,
      restaurantSell: 0,
      badge: "Top Performer",
    });
  });

  monthOrders.forEach((order) => {
    const restaurantId = getRestaurantId(order);
    if (!restaurantId) return;

    if (!map.has(restaurantId)) {
      map.set(restaurantId, {
        id: restaurantId,
        name: getRestaurantName(order),
        phone: getRestaurantPhone(order),
        orders: 0,
        foodSell: 0,
        restaurantSell: 0,
        badge: "Top Performer",
      });
    }

    const current = map.get(restaurantId);
    const metrics = getOrderMetrics(order);

    current.orders += 1;
    current.foodSell += metrics.foodSell;
    current.restaurantSell += metrics.restaurantSell;

    if (!current.name || current.name === "Restaurant") {
      current.name = getRestaurantName(order);
    }

    if (!current.phone || current.phone === "N/A") {
      current.phone = getRestaurantPhone(order);
    }
  });

  return [...map.values()]
    .filter((item) => item.foodSell > 0 || item.orders > 0)
    .sort(
      (a, b) =>
        b.foodSell - a.foodSell ||
        b.restaurantSell - a.restaurantSell ||
        b.orders - a.orders
    )
    .slice(0, 2)
    .map((item) => ({
      ...item,
      orders: Math.trunc(item.orders),
      foodSell: Math.trunc(item.foodSell),
      restaurantSell: Math.trunc(item.restaurantSell),
    }));
}

function normalizeTopRiders(riders = [], monthOrders = []) {
  const map = new Map();

  riders.forEach((rider) => {
    const id = rider?._id || rider?.id;
    if (!id) return;

    map.set(id, {
      id,
      name:
        rider?.name ||
        rider?.fullName ||
        rider?.riderName ||
        rider?.userName ||
        "",
      phone:
        rider?.phoneNumber ||
        rider?.phone ||
        rider?.mobile ||
        rider?.contactNumber ||
        "N/A",
      orders: 0,
      completed: 0,
      earning: toNumber(
        rider?.earning ??
          rider?.totalEarning ??
          rider?.wallet ??
          rider?.balance ??
          0
      ),
      cashCollection: toNumber(
        rider?.cashCollection ?? rider?.cashCollected ?? rider?.cash ?? 0
      ),
      rating: rider?.rating || 5,
      badge: "Top Performer",
    });
  });

  monthOrders.forEach((order) => {
    const riderId = getRiderId(order);
    if (!riderId) return;

    if (!map.has(riderId)) {
      map.set(riderId, {
        id: riderId,
        name: getRiderName(order),
        phone: getRiderPhone(order),
        orders: 0,
        completed: 0,
        earning: 0,
        cashCollection: 0,
        rating: 5,
        badge: "Top Performer",
      });
    }

    const current = map.get(riderId);
    const metrics = getOrderMetrics(order);

    current.orders += 1;
    current.earning += metrics.riderCost;
    current.cashCollection += getCashCollection(order);

    if (isDeliveredOrder(order)) current.completed += 1;
    if (!current.name) current.name = getRiderName(order);
    if (!current.phone || current.phone === "N/A") {
      current.phone = getRiderPhone(order);
    }
  });

  return [...map.values()]
    .filter((item) => item.orders > 0)
    .sort(
      (a, b) =>
        b.orders - a.orders ||
        b.completed - a.completed ||
        b.earning - a.earning
    )
    .slice(0, 2)
    .map((item, index) => ({
      id: item.id || index + 1,
      name: item.name || `Rider ${index + 1}`,
      phone: item.phone || "N/A",
      orders: Math.trunc(item.orders),
      completed: Math.trunc(item.completed || item.orders),
      earning: Math.trunc(item.earning),
      cashCollection: Math.trunc(item.cashCollection),
      rating: item.rating || 5,
      badge: item.badge || "Top Performer",
    }));
}

function normalizeOrderOverview(weekDaySales = []) {
  return weekDaySales.map((item) => ({
    label: item.day,
    foodSell: item.totalSales,
    restaurantSell: item.restaurantSales,
    deliveryFee: item.deliveryAmount,
    deliveryProfit: item.deliveryProfit,
    chartDeliveryProfit: item.deliveryProfit < 0 ? 0 : item.deliveryProfit,
    riderTips: item.riderTips,
    totalOrder: item.totalOrders,
  }));
}

function normalizeRevenueOverview(weekDaySales = []) {
  return weekDaySales.map((item) => ({
    label: item.day,
    foodSell: item.totalSales,
  }));
}

function normalizeSalesSummary(summary) {
  return [
    {
      title: "Today's Sales",
      foodSell: summary.today.totalSales,
      restaurantSell: summary.today.restaurantSales,
      deliveryFee: summary.today.deliveryAmount,
      deliveryProfit: summary.today.deliveryProfit,
      riderTips: summary.today.riderTips,
      tone: "blue",
    },
    {
      title: "Weekly Sales",
      foodSell: summary.weekly.totalSales,
      restaurantSell: summary.weekly.restaurantSales,
      deliveryFee: summary.weekly.deliveryAmount,
      deliveryProfit: summary.weekly.deliveryProfit,
      riderTips: summary.weekly.riderTips,
      tone: "emerald",
    },
    {
      title: "Monthly Sales",
      foodSell: summary.monthly.totalSales,
      restaurantSell: summary.monthly.restaurantSales,
      deliveryFee: summary.monthly.deliveryAmount,
      deliveryProfit: summary.monthly.deliveryProfit,
      riderTips: summary.monthly.riderTips,
      tone: "violet",
    },
  ];
}

export async function fetchDashboardData(user) {
  const zoneId = user?.zoneId;

  if (!zoneId) {
    throw new Error("Zone ID not found. Please login again.");
  }

  const [ordersResult, restaurantsResult, ridersResult] =
    await Promise.allSettled([
      fetchZoneOrdersForDashboard(zoneId),
      fetchAllZoneRestaurants(zoneId),
      fetchAllZoneRiders(zoneId),
    ]);

  const orderPayload =
    ordersResult.status === "fulfilled" && ordersResult.value
      ? ordersResult.value
      : { orders: [], totalOrders: 0 };

  const monthOrders = Array.isArray(orderPayload.orders)
    ? orderPayload.orders
    : [];

  const totalOrders =
    Number(orderPayload.totalOrders || 0) > 0
      ? Number(orderPayload.totalOrders)
      : monthOrders.length;

  const restaurants =
    restaurantsResult.status === "fulfilled" &&
    Array.isArray(restaurantsResult.value)
      ? restaurantsResult.value
      : [];

  const riders =
    ridersResult.status === "fulfilled" && Array.isArray(ridersResult.value)
      ? ridersResult.value
      : [];

  const summary = buildSummaryFromOrders(monthOrders);

  return {
    zoneName: user?.zoneName || user?.name || `Zone ${zoneId}`,
    stats: normalizeStats({
      todayOrders: summary.today.count,
      totalOrders,
      totalRiders: riders.length,
      totalRestaurants: restaurants.length,
    }),
    orderOverview: normalizeOrderOverview(summary.weekDaySales),
    revenueOverview: normalizeRevenueOverview(summary.weekDaySales),
    topRestaurants: normalizeTopRestaurants(restaurants, monthOrders),
    topRiders: normalizeTopRiders(riders, monthOrders),
    salesSummary: normalizeSalesSummary(summary),
  };
}