import { Button, Popconfirm } from "antd";
import React, { useState } from "react";
import CustomAlert from "../molecules/CustomAlert";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/config";

function DeleteOrder({ orderId }) {
  const [deleteResponseModal, setDeleteResponseModal] = useState({
    visible: false,
    message: "",
    title: "Delete Order",
    type: "info",
  });

  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function handleDeleteOrder(orderId) {
    try {
      setLoading(true);
      const { data } = await api.delete(`/zone/order/${orderId}`);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        setDeleteResponseModal((prev) => ({
          ...prev,
          visible: true,
          message: "Delete successful",
          type: "success",
        }));
      }
    } catch (error) {
      setDeleteResponseModal((prev) => ({
        ...prev,
        visible: true,
        message: error.message,
        type: "warning",
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Popconfirm
        title="Delete the order"
        description="Are you sure?"
        onConfirm={() => handleDeleteOrder(orderId)}
        okText="Yes"
        cancelText="No"
      >
        <Button size="small" danger>
          Del
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