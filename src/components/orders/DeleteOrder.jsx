import { Button, Popconfirm } from "antd";
import React, { useState } from "react";
import CustomAlert from "../molecules/CustomAlert";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/config";

function DeleteOrder({ orderId }) {
  const [deleteResponseModal, setDeleteResponseModal] = useState({
    visible: false,
    message: "",
    title: "Move Order to Trash",
    type: "info",
  });

  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function handleDeleteOrder(orderId) {
    try {
      setLoading(true);
      const { data } = await api.delete(`/zone/order/${orderId}`);
      if (data.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["orders"] }),
          queryClient.invalidateQueries({ queryKey: ["archived-orders"] }),
          queryClient.invalidateQueries({ queryKey: ["order-map-orders"] }),
        ]);
        setDeleteResponseModal((prev) => ({
          ...prev,
          visible: true,
          message: data?.message || "Order moved to Trash successfully.",
          type: "success",
        }));
      }
    } catch (error) {
      setDeleteResponseModal((prev) => ({
        ...prev,
        visible: true,
        message:
          error?.response?.data?.message ||
          "Only cancelled or delivered orders can be moved to Trash.",
        type: "warning",
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Popconfirm
        title="Move this order to Trash?"
        description="The order can be restored later. Active orders must be cancelled first."
        onConfirm={() => handleDeleteOrder(orderId)}
        okText="Yes"
        cancelText="No"
      >
        <Button size="small" danger loading={loading}>
          Trash
        </Button>
      </Popconfirm>

      <CustomAlert
        visible={deleteResponseModal.visible}
        onOk={() =>
          setDeleteResponseModal((prev) => ({ ...prev, visible: false }))
        }
        type={deleteResponseModal.type}
        description={deleteResponseModal.message}
        title={deleteResponseModal.title}
      />
    </div>
  );
}

export default DeleteOrder;
