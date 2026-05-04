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

function getDayLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BD_TIMEZONE,
    weekday: "short",
  }).format(date);
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

function getRestaurantId(order) {
  return (
    order?.restaurantId?._id ||
    order?.restaurantId ||
    order?.restaurant?._id ||
    order?.restaurant?._id ||
    null
  );
}

function getRestaurantName(order) {
  return (
    order?.restaurantId?.restaurantName ||
    order?.restaurantId?.name ||
    order?.restaurant?.restaurantName ||
    order?.restaurant?.name ||
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
    order?.restaurantPhone ||
    "N/A"
  );
}

function getRiderId(order) {
  return (
    order?.riderId?._id ||
    order?.riderId ||
    order?.rider?._id ||
    order?.assignedRider?._id ||
    order?.riderInfo?._id ||
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
    order?.riderName ||
    order?.deliveryBoyName ||
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
    order?.riderPhone ||
    order?.deliveryBoyPhone ||
    "N/A"
  );
}

function getOrderMetrics(order) {
  const items = Array.isArray(order?.items) ? order.items : [];

  const restaurantFoodSale = items.reduce(
    (sum, item) => sum + toNumber(item?.basedPrice) * toNumber(item?.quantity || 1),
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

  const foodSell = customerFoodSale + addonsTotal;
  const restaurantSell = restaurantFoodSale + addonsTotal;
  const riderTips = toNumber(order?.riderTips ?? order?.tips ?? order?.tip ?? 0);
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
    foodMargin: Math.max(customerFoodSale - restaurantFoodSale, 0),
    deliveryFee,
    deliveryProfit: deliveryFee - riderCost,
    riderTips,
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

function getMonthKeyBD(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).format(date);
}

function buildWeekDaysFromOrders(orders = []) {
  const now = new Date();

  const bdNow = new Date(
    now.toLocaleString("en-US", { timeZone: BD_TIMEZONE })
  );

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

async function fetchAllZoneOrders(zoneId) {
  let page = 1;
  const limit = 100;
  let allOrders = [];
  let totalCount = 0;
  let keepGoing = true;

  while (keepGoing) {
    const { data } = await api.post(
      `/zone/order-list?page=${page}&limit=${limit}`,
      { zoneId }
    );

    const batch = data?.data || data?.result || data?.orders || [];
    totalCount = data?.totalCount || data?.count || data?.total || totalCount;

    if (Array.isArray(batch)) {
      allOrders = [...allOrders, ...batch];
    }

    if (!Array.isArray(batch) || batch.length < limit) {
      keepGoing = false;
    } else if (totalCount && allOrders.length >= totalCount) {
      keepGoing = false;
    } else {
      page += 1;
    }
  }

  return Array.from(
    new Map(allOrders.map((item) => [item?._id, item])).values()
  );
}

async function fetchAllZoneRestaurants(zoneId) {
  let page = 1;
  const limit = 100;
  let allRestaurants = [];
  let keepGoing = true;

  while (keepGoing) {
    const { data } = await api.post("/zone/restaurant-list", {
      zoneId,
      page,
      limit,
    });

    const batch = Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data?.data)
      ? data.data
      : [];

    allRestaurants = [...allRestaurants, ...batch];

    if (batch.length < limit) {
      keepGoing = false;
    } else {
      page += 1;
    }
  }

  return Array.from(
    new Map(allRestaurants.map((item) => [item?._id, item])).values()
  );
}

async function fetchAllZoneRiders(zoneId) {
  let page = 1;
  const limit = 100;
  let allRiders = [];
  let keepGoing = true;

  while (keepGoing) {
    const { data } = await api.post(
      `/zone/rider-list?limit=${limit}&page=${page}`,
      { zoneId }
    );

    const batch = Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data?.data)
      ? data.data
      : [];

    allRiders = [...allRiders, ...batch];

    if (batch.length < limit) {
      keepGoing = false;
    } else {
      page += 1;
    }
  }

  return Array.from(
    new Map(allRiders.map((item) => [item?._id, item])).values()
  );
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
      sub: "Orders in your zone",
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

function normalizeTopRestaurants(restaurants = [], orders = []) {
  const map = new Map();

  restaurants.forEach((restaurant) => {
    map.set(restaurant?._id, {
      id: restaurant?._id,
      name: restaurant?.restaurantName || restaurant?.name || "Restaurant",
      phone:
        restaurant?.phoneNumber ||
        restaurant?.phone ||
        restaurant?.restaurantPhone ||
        "N/A",
      orders: 0,
      foodSell: 0,
      restaurantSell: 0,
      badge: "Top Performer",
    });
  });

  orders.forEach((order) => {
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

    if (!current.phone || current.phone === "N/A") {
      current.phone = getRestaurantPhone(order);
    }
  });

  return [...map.values()]
    .sort((a, b) => b.foodSell - a.foodSell || b.orders - a.orders)
    .slice(0, 2)
    .map((item) => ({
      ...item,
      foodSell: Math.trunc(item.foodSell),
      restaurantSell: Math.trunc(item.restaurantSell),
    }));
}

function normalizeTopRiders(riders = [], orders = []) {
  const map = new Map();

  riders.forEach((rider) => {
    map.set(rider?._id, {
      id: rider?._id,
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
      completed: 0,
      earning: toNumber(
        rider?.earning ??
          rider?.totalEarning ??
          rider?.wallet ??
          rider?.balance ??
          0
      ),
      cashCollection: toNumber(
        rider?.cashCollection ??
          rider?.cashCollected ??
          rider?.cash ??
          0
      ),
      rating: rider?.rating || 5,
      badge: "Top Performer",
    });
  });

  orders.forEach((order) => {
    const riderId = getRiderId(order);
    if (!riderId) return;

    if (!map.has(riderId)) {
      map.set(riderId, {
        id: riderId,
        name: getRiderName(order),
        phone: getRiderPhone(order),
        completed: 0,
        earning: 0,
        cashCollection: 0,
        rating: 5,
        badge: "Top Performer",
      });
    }

    const current = map.get(riderId);

    if (!current.name) current.name = getRiderName(order);
    if (!current.phone || current.phone === "N/A") {
      current.phone = getRiderPhone(order);
    }

    if (isDeliveredOrder(order)) {
      current.completed += 1;
    }

    current.earning += getOrderMetrics(order).deliveryFee - getOrderMetrics(order).deliveryProfit;
    current.cashCollection += getCashCollection(order);
  });

  return [...map.values()]
    .sort(
      (a, b) =>
        b.completed - a.completed ||
        b.earning - a.earning ||
        b.cashCollection - a.cashCollection
    )
    .slice(0, 2)
    .map((item, index) => ({
      id: item.id || index + 1,
      name: item.name || `Rider ${index + 1}`,
      phone: item.phone || "N/A",
      completed: item.completed,
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

  const [orders, restaurants, riders] = await Promise.all([
    fetchAllZoneOrders(zoneId),
    fetchAllZoneRestaurants(zoneId),
    fetchAllZoneRiders(zoneId),
  ]);

  const summary = buildSummaryFromOrders(orders);

  return {
    zoneName: user?.zoneName || user?.name || `Zone ${zoneId}`,
    stats: normalizeStats({
      todayOrders: summary.today.count,
      totalOrders: orders.length,
      totalRiders: riders.length,
      totalRestaurants: restaurants.length,
    }),
    orderOverview: normalizeOrderOverview(summary.weekDaySales),
    revenueOverview: normalizeRevenueOverview(summary.weekDaySales),
    topRestaurants: normalizeTopRestaurants(restaurants, orders),
    topRiders: normalizeTopRiders(riders, orders),
    salesSummary: normalizeSalesSummary(summary),
  };
}