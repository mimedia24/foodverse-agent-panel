
import api from "./config.js"

class OrderService {


    /**
     * 
     * @param {number} page - search page
     * @param {number} limit - limit
     * @param {number} zoneId - zoneId
     */
    static async getOrderList(page, limit, zoneId) {
        try {

            const { data } = await api.post(`/zone/order-list`, {
                zoneId
            })

            if (data.success) {
                return data
            } else {
                return null
            }

        } catch (error) {
            console.log("[Order Query] : Failed to get order.")
            return null
        }
    }
}