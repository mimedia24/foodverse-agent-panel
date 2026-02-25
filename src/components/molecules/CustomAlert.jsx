import React from "react";
import { Modal, Button } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";

const CustomAlert = ({
  visible,
  onOk,
  onCancel,
  title,
  icon,
  description, // Fixed typo from 'descption'
  type = "success",
}) => {
  // Configuration for different alert types
  const config = {
    success: {
      color: "#52c41a",
      defaultIcon: <CheckCircleFilled />,
    },
    error: {
      color: "#ff4d4f",
      defaultIcon: <CloseCircleFilled />,
    },
    warning: {
      color: "#faad14",
      defaultIcon: <ExclamationCircleFilled />,
    },
    info: {
      color: "#1890ff",
      defaultIcon: <InfoCircleFilled />,
    },
  };

  const currentConfig = config[type] || config.success;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      centered
      footer={[
        <Button
          key="ok"
          type="primary"
          danger={type === "error"}
          onClick={onOk}
          className="rounded-md"
        >
          OK
        </Button>,
      ]}
      width={400}
    >
      <div className="flex flex-col items-center text-center py-4">
        {/* Render custom icon if provided, otherwise use default based on type */}
        <div className="text-5xl mb-4" style={{ color: currentConfig.color }}>
          {icon ? icon : currentConfig.defaultIcon}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>

        <p className="text-gray-500 text-base">{description}</p>
      </div>
    </Modal>
  );
};

export default CustomAlert;
