import React, { useMemo, useState } from "react";
import { Button, Select } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import GlobalModal from "../molecules/GlobalModal";
import CustomAlert from "../molecules/CustomAlert";
import api from "../../api/config";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Accept by Restaurant", value: "accept by restaurant" },
  { label: "Accept by Rider", value: "accept by rider" },
  { label: "Ready for Pickup", value: "ready for pickup" },
  { label: "Picked Up", value: "picked up" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled by Restaurant", value: "cancelled by restaurant" },
  { label: "Cancelled", value: "cancelled" },
];

function normalizeIncomingStatus(status) {
  if (!status) return "pending";
  return String(status).trim().toLowerCase().replace(/_/g, " ");
}

function UpdateOrderStatus({ orderId, currentStatus }) {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultModal, setResultModal] = useState({
    visible: false,
    message: "",
    title: "Update Order Status",
    success: false,
  });

  const queryClient = useQueryClient();

  const initialStatus = useMemo(
    () => normalizeIncomingStatus(currentStatus),
    [currentStatus]
  );

  const [status, setStatus] = useState(initialStatus);

  const handleOpen = () => {
    setStatus(normalizeIncomingStatus(currentStatus));
    setIsVisible(true);
  };

  async function handleUpdateStatus() {
    try {
      if (!orderId) {
        setResultModal({
          visible: true,
          message: "Order id not found.",
          title: "Update Order Status",
          success: false,
        });
        return;
      }

      setLoading(true);

      const { data } = await api.put("/zone/update-order-status", {
        orderId,
        status,
      });

      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ["orders"] });

        setResultModal({
          visible: true,
          message: data?.message || "Update status successful.",
          title: "Update Order Status",
          success: true,
        });

        setIsVisible(false);
      } else {
        setResultModal({
          visible: true,
          message: data?.message || "Failed to update status.",
          title: "Update Order Status",
          success: false,
        });
      }
    } catch (error) {
      setResultModal({
        visible: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update status.",
        title: "Update Order Status",
        success: false,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button size="small" onClick={handleOpen}>
        Status
      </Button>

      <GlobalModal
        open={isVisible}
        onCancel={() => setIsVisible(false)}
        onOk={handleUpdateStatus}
        confirmLoading={loading}
      >
        <h2 style={{ marginBottom: 20 }}>Update Order Status</h2>

        <Select
          placeholder="Select order status"
          style={{ width: "100%" }}
          value={status}
          onChange={(value) => setStatus(value)}
          options={STATUS_OPTIONS}
        />
      </GlobalModal>

      <CustomAlert
        visible={resultModal.visible}
        description={resultModal.message}
        title={resultModal.title}
        type={resultModal.success ? "success" : "warning"}
        onOk={() =>
          setResultModal((prev) => ({
            ...prev,
            visible: false,
          }))
        }
      />
    </div>
  );
}

export default UpdateOrderStatus;