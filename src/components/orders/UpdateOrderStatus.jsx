import React, { useState } from "react";
import { Button, Select } from "antd";
import GlobalModal from "../molecules/GlobalModal";

const { Option } = Select;

function UpdateOrderStatus({ currentStatus }) {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState(currentStatus || null);

  return (
    <div>
      <Button size="small" onClick={() => setIsVisible(true)}>
        Status
      </Button>

      {isVisible && (
        <GlobalModal
          open={true}
          onCancel={() => setIsVisible(false)}
          onOk={() => setIsVisible(false)}
        >
          <h2 style={{ marginBottom: 20 }}>Update Order Status</h2>

          <Select
            placeholder="Select order status"
            style={{ width: "100%" }}
            value={status}
            onChange={(value) => setStatus(value)}
          >
            <Option value="pending">Pending</Option>
            <Option value="accepted_by_restaurant">
              Accepted by Restaurant
            </Option>
            <Option value="accepted_by_rider">Accepted by Rider</Option>
            <Option value="ready_for_pickup">Ready for Pickup</Option>
            <Option value="picked_up">Picked Up</Option>
            <Option value="cancelled_by_restaurant">
              Cancelled by Restaurant
            </Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="delivered">Delivered</Option>
          </Select>
        </GlobalModal>
      )}
    </div>
  );
}

export default UpdateOrderStatus;