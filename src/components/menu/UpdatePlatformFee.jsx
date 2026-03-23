import { Button, Input, message } from "antd";
import React, { useState } from "react";
import GlobalModal from "../molecules/GlobalModal";
import api from "../../api/config";
import { useQueryClient } from "@tanstack/react-query";

function UpdateFlatformFee({ id, currentFee = 0 }) {
  const [showModal, setShowModal] = useState(false);
  const [platformFee, setPlatformFee] = useState(currentFee);

  const queryClient = useQueryClient();

  async function handleUpdateDiscountRate() {
    try {
      const { data } = await api.put(`/zone/menu/update-platform-fee`, {
        menuId: id,
        platformFee: platformFee,
      });

      if (data?.success) {
        message.success(data?.message);
        setShowModal(false);
        queryClient.invalidateQueries(["menu"]);
      }
    } catch (error) {
      console.log("[Failed to update plateform rate]", error?.response);
      message.error(error?.response?.data?.message);
    }
  }

  return (
    <div>
      <Button type={"primary"} onClick={() => setShowModal(true)}>
        Platform fee
      </Button>

      <GlobalModal
        open={showModal}
        title={"Update plateform rate"}
        onCancel={() => setShowModal(false)}
        onOk={handleUpdateDiscountRate}
      >
        <Input
          value={platformFee}
          placeholder={"Enter your required fee"}
          onChange={(e) => setPlatformFee(e.target.value)}
        />
      </GlobalModal>
    </div>
  );
}

export default UpdateFlatformFee;
