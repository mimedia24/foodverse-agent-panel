import api from "./config";

class OrderService {
  static normalizeListResponse(data) {
    if (!data) {
      return {
        success: false,
        data: [],
        totalCount: 0,
      };
    }

    return {
      ...data,
      data: Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.result)
        ? data.result
        : [],
      totalCount:
        data?.totalCount ||
        data?.count ||
        data?.total ||
        (Array.isArray(data?.data) ? data.data.length : 0),
    };
  }

  static async getOrderList(page = 1, limit = 20, zoneId) {
    try {
      const { data } = await api.post(
        `/zone/order-list?page=${page}&limit=${limit}`,
        { zoneId }
      );

      return this.normalizeListResponse(data);
    } catch (error) {
      console.log("[OrderService] Failed to get order list:", error);
      return {
        success: false,
        data: [],
        totalCount: 0,
      };
    }
  }

  static async getOrdersByUserId(userId, page = 1, limit = 20) {
    try {
      const { data } = await api.get(
        `/zone/orders/user/${userId}?page=${page}&limit=${limit}`
      );

      return this.normalizeListResponse(data);
    } catch (error) {
      console.log("[OrderService] Failed to get orders by user id:", error);
      return {
        success: false,
        data: [],
        totalCount: 0,
      };
    }
  }

  static async getOrdersByPhoneNumber(phoneNumber) {
    try {
      const { data } = await api.get(`/zone/order/phone-number/${phoneNumber}`);

      return this.normalizeListResponse(data);
    } catch (error) {
      console.log("[OrderService] Failed to get orders by phone:", error);
      return {
        success: false,
        data: [],
        totalCount: 0,
      };
    }
  }

  static async getOrdersByRiderId(riderId) {
    try {
      const { data } = await api.get(`/zone/order/rider/${riderId}`);

      return this.normalizeListResponse(data);
    } catch (error) {
      console.log("[OrderService] Failed to get orders by rider id:", error);
      return {
        success: false,
        data: [],
        totalCount: 0,
      };
    }
  }

  static async getOrdersByUserSearch(userId) {
    try {
      const { data } = await api.get(`/zone/order/user/${userId}`);

      return this.normalizeListResponse(data);
    } catch (error) {
      console.log("[OrderService] Failed to search orders by user:", error);
      return {
        success: false,
        data: [],
        totalCount: 0,
      };
    }
  }
}

export default OrderService;