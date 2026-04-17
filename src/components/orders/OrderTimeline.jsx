import React, { useMemo, useState } from "react";
import { Button, Empty, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import GlobalModal from "../molecules/GlobalModal";

const { Text } = Typography;

function formatTime(value) {
  if (!value) return null;
  return dayjs(value).format("DD MMM YYYY, hh:mm A");
}

function OrderTimeline({ order }) {
  const [open, setOpen] = useState(false);

  const timelineItems = useMemo(() => {
    if (!order) return [];

    const items = [
      {
        label: "Order Accepted",
        time: order.restaurantAcceptTime || order.orderDate || order.createdAt,
      },
      {
        label: "Rider Assigned",
        time: order.riderAssignTime,
      },
      {
        label: "Picked Up",
        time: order.pickupTime,
      },
      {
        label: "Delivered",
        time: order.deliveredTime,
      },
    ];

    return items.filter((item) => item.time);
  }, [order]);

  return (
    <div>
      <Button size="small" onClick={() => setOpen(true)}>
        Timeline
      </Button>

      <GlobalModal
        title="Order Timeline"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        {timelineItems.length ? (
          <Timeline
            items={timelineItems.map((item) => ({
              color: "green",
              children: (
                <div>
                  <div className="font-semibold">{item.label}</div>
                  <Text type="secondary">{formatTime(item.time)}</Text>
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="No timeline data found" />
        )}
      </GlobalModal>
    </div>
  );
}

export default OrderTimeline;