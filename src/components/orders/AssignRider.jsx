import { Button, Input, Spin } from "antd";
import React, { useState } from "react";
import GlobalModal from "../molecules/GlobalModal";
import api from "../../api/config";
import CustomAlert from "../molecules/CustomAlert";

function AssignRider({ orderId }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [riderId, setRider] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultModal, setResultModal] = useState({
    success: false,
    message: "",
    title: "",
    visible: false,
  });

  //   assign rider
  async function handleAssignRider(riderId) {
    try {
      if (!orderId || !riderId) {
        setResultModal((prev) => ({
          ...prev,
          success: false,
          visible: true,
          message: "Order id not found.",
        }));
        return;
      }

      setLoading(true);
      const { data } = await api.put(`/zone/assign-rider`, {
        riderId,
        orderId,
      });

      if (data?.success) {
        setResultModal((prev) => ({
          ...prev,
          visible: true,
          success: true,
          message: data.message || "Assign rider success",
          title: "Assign rider",
        }));
      }
    } catch (error) {
      console.log(error);
      setResultModal((prev) => ({
        ...prev,
        visible: true,
        success: false,
        message: error.message || "Assign rider failed",
        title: "Assign rider",
      }));
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  }

  return (
    <div>
      <Button type={"primary"} onClick={() => setModalOpen(true)}>
        Assign rider
      </Button>
      <GlobalModal
        title={"Assign rider"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => handleAssignRider(riderId)}
      >
        {loading ? (
          <Spin description={"Loading..."} size={"large"} />
        ) : (
          <Input
            placeholder={"Rider id"}
            value={riderId}
            onChange={(e) => setRider(e.target.value)}
          />
        )}
      </GlobalModal>

      <CustomAlert
        visible={resultModal.visible}
        description={resultModal.message}
        title={resultModal.title}
        type={resultModal.success ? "info" : "warning"}
        onOk={() => setResultModal((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}

export default AssignRider;
