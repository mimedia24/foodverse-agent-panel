import { Modal } from "antd";
import React from "react";

function GlobalModal({ title, open, onOk, onCancel, children }) {
  return (
    <Modal
      closable={{ "aria-label": "Custom Close Button" }}
      open={open}
      title={title}
      onOk={() => onOk()}
      onCancel={() => onCancel()}
    >
      {children}
    </Modal>
  );
}

export default GlobalModal;
