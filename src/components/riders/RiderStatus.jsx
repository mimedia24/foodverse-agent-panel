import React, { useState } from 'react';
import {
  ChevronDown,
  UserCheck,
  Clock,
  ShieldAlert,
  UserMinus,
  Truck,
  Coffee,
  PowerOff,
} from 'lucide-react';
import { Button, Dropdown } from 'antd';

function RiderStatus({ initialAccount, initialDuty }) {

  const [accountStatus, setAccountStatus] = useState(initialAccount || 'active');
  const [workingStatus, setWorkingStatus] = useState(initialDuty || 'available');

  // Account Menu Items
  const accountItems = [
    {
      key: 'active',
      label: (
        <div className="flex items-center gap-2 text-green-600">
          <UserCheck size={18} />
          Active
        </div>
      ),
    },
    {
      key: 'busy',
      label: (
        <div className="flex items-center gap-2 text-orange-600">
          <Clock size={18} />
          Busy
        </div>
      ),
    },
    {
      key: 'banned',
      label: (
        <div className="flex items-center gap-2 text-red-600">
          <ShieldAlert size={18} />
          Banned
        </div>
      ),
    },
    {
      key: 'waiting for approved',
      label: (
        <div className="flex items-center gap-2 text-blue-600">
          <UserMinus size={18} />
          waiting for approved
        </div>
      ),
    },
  ];

  // Duty Menu Items
  const dutyItems = [
    {
      key: 'available',
      label: (
        <div className="flex items-center gap-2 text-emerald-600">
          <UserCheck size={18} />
          Available
        </div>
      ),
    },
    {
      key: 'delivery',
      label: (
        <div className="flex items-center gap-2 text-purple-600">
          <Truck size={18} />
          Out for Delivery
        </div>
      ),
    },
    {
      key: 'break',
      label: (
        <div className="flex items-center gap-2 text-amber-600">
          <Coffee size={18} />
          On Break
        </div>
      ),
    },
    {
      key: 'offline',
      label: (
        <div className="flex items-center gap-2 text-gray-500">
          <PowerOff size={18} />
          Offline
        </div>
      ),
    },
  ];

  const handleAccountChange = ({ key }) => {
    setAccountStatus(key);
  };

  const handleDutyChange = ({ key }) => {
    setWorkingStatus(key);
  };

  const getAccountLabel = () => {
    return accountItems.find(item => item.key === accountStatus)?.label;
  };

  const getDutyLabel = () => {
    return dutyItems.find(item => item.key === workingStatus)?.label;
  };

  return (
    <div className="flex gap-4">

      {/* Account Status */}
      <Dropdown
        menu={{
          items: accountItems,
          onClick: handleAccountChange,
        }}
        placement="bottom"
      >
        <Button className="flex items-center gap-2">
          {getAccountLabel()}
          <ChevronDown size={16} />
        </Button>
      </Dropdown>

      {/* Duty Status */}
      <Dropdown
        menu={{
          items: dutyItems,
          onClick: handleDutyChange,
        }}
        placement="bottom"
      >
        <Button className="flex items-center gap-2">
          {getDutyLabel()}
          <ChevronDown size={16} />
        </Button>
      </Dropdown>

    </div>
  );
}

export default RiderStatus;