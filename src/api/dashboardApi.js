import api from "./config";

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getDayLabel(item, index) {
  return (
    item?.day ||
    item?.label ||
    item?.name ||
    item?.weekDay ||
    ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][index] ||
    `Day ${index + 1}`
  );
}

function normalizeWeekSales(list = []) {
  return list.map((item, index) => ({
    label: getDayLabel(item, index),
    foodSell: toNumber(item?.totalSales),
    restaurantSell: toNumber(item?.restaurantSales),
    deliveryFee: toNumber(item?.deliveryAmount),
    deliveryProfit: toNumber(item?.deliveryProfit),
    riderTips: toNumber(item?.riderTips),
    totalOrder: toNumber(item?.totalOrders),
  }));
}

function normalizeRevenueOverview(list = []) {
  return list.map((item, index) => ({
    label: getDayLabel(item, index),
    sellAmount: toNumber(item?.totalSales),
  }));
}

function normalizeStats(payload) {
  return [
    {
      title: "Today Order",
      value:
        toNumber(payload?.todayOrder) ||
        toNumber(payload?.todayOrders) ||
        toNumber(payload?.today?.totalOrders),
      sub: "Orders placed today",
      tone: "blue",
      icon: "orders",
    },
    {
      title: "Total Order",
      value:
        toNumber(payload?.totalOrder) ||
        toNumber(payload?.totalOrders) ||
        toNumber(payload?.ordersCount),
      sub: "All-time orders",
      tone: "violet",
      icon: "package",
    },
    {
      title: "Total Rider",
      value:
        toNumber(payload?.totalRider) ||
        toNumber(payload?.totalRiders) ||
        toNumber(payload?.ridersCount),
      sub: "Registered riders",
      tone: "indigo",
      icon: "rider",
    },
    {
      title: "Total Restaurant",
      value:
        toNumber(payload?.totalRestaurant) ||
        toNumber(payload?.totalRestaurants) ||
        toNumber(payload?.restaurantsCount),
      sub: "Active partner restaurants",
      tone: "amber",
      icon: "restaurant",
    },
  ];
}

function normalizeTopRestaurants(list = []) {
  return list.slice(0, 2).map((item, index) => ({
    id: item?._id || item?.id || index + 1,
    name: item?.name || item?.restaurantName || `Restaurant ${index + 1}`,
    orders: toNumber(item?.orders || item?.totalOrders),
    foodSell: toNumber(item?.foodSell || item?.totalSales),
    restaurantSell: toNumber(item?.restaurantSell || item?.restaurantSales),
    badge: item?.badge || "Top Performer",
  }));
}

function normalizeTopRiders(list = []) {
  return list.slice(0, 2).map((item, index) => ({
    id: item?._id || item?.id || index + 1,
    name: item?.name || item?.riderName || `Rider ${index + 1}`,
    completed: toNumber(item?.completed || item?.completedOrders || item?.totalOrders),
    earnings: toNumber(item?.earnings || item?.totalEarning || item?.deliveryProfit),
    tips: toNumber(item?.tips || item?.riderTips),
    rating: item?.rating || 5,
    badge: item?.badge || "Top Performer",
  }));
}

function normalizeSalesSummary(payload) {
  return [
    {
      title: "Today's Sell",
      foodSell: toNumber(payload?.today?.totalSales),
      restaurantSell: toNumber(payload?.today?.restaurantSales),
      deliveryFee: toNumber(payload?.today?.deliveryAmount),
      deliveryProfit: toNumber(payload?.today?.deliveryProfit),
      riderTips: toNumber(payload?.today?.riderTips),
      tone: "blue",
    },
    {
      title: "Weekly Sales",
      foodSell: toNumber(payload?.weekly?.totalSales),
      restaurantSell: toNumber(payload?.weekly?.restaurantSales),
      deliveryFee: toNumber(payload?.weekly?.deliveryAmount),
      deliveryProfit: toNumber(payload?.weekly?.deliveryProfit),
      riderTips: toNumber(payload?.weekly?.riderTips),
      tone: "emerald",
    },
    {
      title: "Monthly Sales",
      foodSell: toNumber(payload?.monthly?.totalSales),
      restaurantSell: toNumber(payload?.monthly?.restaurantSales),
      deliveryFee: toNumber(payload?.monthly?.deliveryAmount),
      deliveryProfit: toNumber(payload?.monthly?.deliveryProfit),
      riderTips: toNumber(payload?.monthly?.riderTips),
      tone: "violet",
    },
  ];
}

export async function fetchDashboardData() {
  const response = await api.get("/admin/dashboard/information");

  const payload = response?.data?.data || response?.data || {};
  const weekDaySales = Array.isArray(payload?.weekDaySales)
    ? payload.weekDaySales
    : [];

  return {
    zoneName:
      payload?.zoneName ||
      payload?.zone?.name ||
      payload?.name ||
      "Zone Dashboard",
    stats: normalizeStats(payload),
    orderOverview: normalizeWeekSales(weekDaySales),
    revenueOverview: normalizeRevenueOverview(weekDaySales),
    topRestaurants: normalizeTopRestaurants(
      payload?.topRestaurants || payload?.restaurants || []
    ),
    topRiders: normalizeTopRiders(
      payload?.topRiders || payload?.riders || []
    ),
    salesSummary: normalizeSalesSummary(payload),
  };
}