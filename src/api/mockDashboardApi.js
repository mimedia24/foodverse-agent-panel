export function fetchDashboardData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        zoneName: "Noakhali Zone",
        stats: [
          { title: "Today Order", value: 148, sub: "Orders placed today", tone: "blue", icon: "orders" },
          { title: "Total Order", value: 5480, sub: "All-time orders", tone: "violet", icon: "package" },
          { title: "Total Rider", value: 47, sub: "Registered riders", tone: "indigo", icon: "rider" },
          { title: "Total Restaurant", value: 28, sub: "Active partner restaurants", tone: "amber", icon: "restaurant" }
        ],
        orderOverview: [
          { label: "Sat", foodSell: 7200, restaurantSell: 6200, deliveryFee: 920, deliveryProfit: 410, riderTips: 120, totalOrder: 24 },
          { label: "Sun", foodSell: 17840, restaurantSell: 15400, deliveryFee: 2100, deliveryProfit: 950, riderTips: 340, totalOrder: 68 },
          { label: "Mon", foodSell: 9470, restaurantSell: 8200, deliveryFee: 1100, deliveryProfit: 510, riderTips: 170, totalOrder: 32 },
          { label: "Tue", foodSell: 11980, restaurantSell: 10300, deliveryFee: 1460, deliveryProfit: 640, riderTips: 220, totalOrder: 48 },
          { label: "Wed", foodSell: 21190, restaurantSell: 18200, deliveryFee: 2580, deliveryProfit: 1190, riderTips: 430, totalOrder: 74 },
          { label: "Thu", foodSell: 15840, restaurantSell: 13700, deliveryFee: 1840, deliveryProfit: 830, riderTips: 300, totalOrder: 59 },
          { label: "Fri", foodSell: 6700, restaurantSell: 5800, deliveryFee: 810, deliveryProfit: 360, riderTips: 90, totalOrder: 21 }
        ],
        revenueOverview: [
          { label: "Sat", sellAmount: 7240 },
          { label: "Sun", sellAmount: 17840 },
          { label: "Mon", sellAmount: 9470 },
          { label: "Tue", sellAmount: 11980 },
          { label: "Wed", sellAmount: 21190 },
          { label: "Thu", sellAmount: 15840 },
          { label: "Fri", sellAmount: 6700 }
        ],
        topRestaurants: [
          { id: 1, name: "Kacchi Express", orders: 122, foodSell: 68400, restaurantSell: 61200, badge: "Hot Zone" },
          { id: 2, name: "Burger Castle", orders: 97, foodSell: 54200, restaurantSell: 48150, badge: "Fast Moving" }
        ],
        topRiders: [
          { id: 1, name: "Rakib Hasan", completed: 42, earnings: 8520, tips: 980, rating: 4.9, badge: "Top Performer" },
          { id: 2, name: "Siam Uddin", completed: 38, earnings: 7840, tips: 840, rating: 4.8, badge: "Fast Delivery" }
        ],
        salesSummary: [
          { title: "Today's Sell", foodSell: 36280, restaurantSell: 31100, deliveryFee: 4260, deliveryProfit: 1860, riderTips: 920, tone: "blue" },
          { title: "Weekly Sales", foodSell: 90690, restaurantSell: 77800, deliveryFee: 10810, deliveryProfit: 4890, riderTips: 1670, tone: "emerald" },
          { title: "Monthly Sales", foodSell: 266700, restaurantSell: 228400, deliveryFee: 31220, deliveryProfit: 14140, riderTips: 5520, tone: "violet" }
        ]
      });
    }, 250);
  });
}