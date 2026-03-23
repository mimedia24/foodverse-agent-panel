import { Button, Input, message } from "antd";
import React, { useState } from "react";
import GlobalModal from "../molecules/GlobalModal";
import api from "../../api/config";
import { useQueryClient } from "@tanstack/react-query";

function UpdateDiscount({ id, currentDiscountRate = 0 }) {
  const [showModal, setShowModal] = useState(false);
  const [discountRate, setDiscountRate] = useState(currentDiscountRate);

  const queryClient = useQueryClient();

  async function handleUpdateDiscountRate() {
    try {
      const { data } = await api.put(`/zone/menu/update-discount-rate`, {
        menuId: id,
        discountRate,
      });

      if (data?.success) {
        message.success(data?.message);
        setShowModal(false);
        queryClient.invalidateQueries(["menu"]);
      }
    } catch (error) {
      console.log("[Failed to update discount rate]", error?.response);
      message.error(error?.response?.data?.message);
    }
  }

  return (
    <div>
      <Button type={"primary"} onClick={() => setShowModal(true)}>
        Discount
      </Button>

      <GlobalModal
        open={showModal}
        title={"Update discount rate"}
        onCancel={() => setShowModal(false)}
        onOk={handleUpdateDiscountRate}
      >
        <Input
          value={discountRate}
          placeholder={"Enter your required discount"}
          onChange={(e) => setDiscountRate(e.target.value)}
        />
      </GlobalModal>
    </div>
  );
}

export default UpdateDiscount;
