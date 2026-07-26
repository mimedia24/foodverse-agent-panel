import { useState } from "react";
import { Button, Empty, Tag, Timeline, Typography, message } from "antd";
import dayjs from "dayjs";
import GlobalModal from "../molecules/GlobalModal";
import OrderService from "../../api/order.service";

const { Text } = Typography;

const formatTime = (value) =>
  value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "Time not recorded";

const stateColor = (state) => {
  if (state === "COMPLETED") return "green";
  if (state === "SKIPPED") return "red";
  return "gray";
};

function OrderTimeline({ orderId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState(null);

  const showTimeline = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const response = await OrderService.getOrderTimeline(orderId);
      setTimeline(response?.result || null);
    } catch (error) {
      setTimeline(null);
      message.error(
        error?.response?.data?.message || "Failed to load order timeline."
      );
    } finally {
      setLoading(false);
    }
  };

  const stages = Array.isArray(timeline?.stages) ? timeline.stages : [];

  return (
    <div>
      <Button size="small" onClick={showTimeline} loading={loading && !open}>
        Timeline
      </Button>

      <GlobalModal
        title="Order Timeline"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading timeline...</div>
        ) : stages.length ? (
          <>
            <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-sm text-slate-500">Current status</span>
              <Tag color={timeline?.isCancelled ? "red" : "blue"}>
                {timeline?.currentStatus || "pending"}
              </Tag>
            </div>
            <Timeline
              items={stages.map((item) => ({
                color: stateColor(item.state),
                children: (
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      {item.label}
                      <Tag color={stateColor(item.state)}>{item.state}</Tag>
                    </div>
                    <Text type="secondary">{formatTime(item.timestamp)}</Text>
                    {item.reason ? (
                      <p className="mt-1 text-xs text-red-500">{item.reason}</p>
                    ) : null}
                  </div>
                ),
              }))}
            />
          </>
        ) : (
          <Empty description="No timeline data found" />
        )}
      </GlobalModal>
    </div>
  );
}

export default OrderTimeline;
