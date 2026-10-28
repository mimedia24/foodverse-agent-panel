import { Button, Input, Spin } from "antd";
import React, { useState } from "react";
import GlobalModal from "../molecules/GlobalModal";
import api from "../../api/config";
import CustomAlert from "../molecules/CustomAlert";

function AssignRider({ orderId, currentStatus }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [riderId, setRider] = useState("");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const normalizedStatus = String(currentStatus || "").trim().toLowerCase().replace(/_/g, " ");
  const recoveryMode = ["picked up", "out for delivery", "on delivery"].includes(normalizedStatus);
  const [resultModal, setResultModal] = useState({
    success: false,
    message: "",
    title: "",
    visible: false,
  });

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
      if (recoveryMode && !reason.trim()) {
        throw new Error("A recovery reason is required.");
      }
      const { data } = await api.put(`/zone/${recoveryMode ? "recovery-reassign-rider" : "assign-rider"}`, {
        riderId,
        orderId,
        ...(recoveryMode ? { reason: reason.trim() } : {}),
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
      setResultModal((prev) => ({
        ...prev,
        visible: true,
        success: false,
        message: error?.response?.data?.message || error.message || "Assign rider failed",
        title: "Assign rider",
      }));
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  }

  return (
    <div>
      <Button size="small" type="primary" onClick={() => setModalOpen(true)}>
        {recoveryMode ? "Recovery Reassign" : "Assign"}
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
          <>
            <Input
              placeholder={"Rider id"}
              value={riderId}
              onChange={(e) => setRider(e.target.value)}
            />
            {recoveryMode ? (
              <Input.TextArea
                style={{ marginTop: 10 }}
                placeholder="Recovery reason (required)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            ) : null}
          </>
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
