import { createElement, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Input, Select, Table, Tag } from "antd";
import { Banknote, CheckCircle2, RefreshCcw, WalletCards, XCircle } from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";
import { useAuth } from "../context/authContext";

const money = (value) =>
  `BDT ${Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })
    : "N/A";

export default function BkashLedger() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["agent-bkash-ledger", page, limit, startDate, endDate, status],
    queryFn: async () => {
      const response = await api.get("/zone/bkash/summary", {
        params: {
          page,
          limit,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: status || undefined,
        },
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const summary = data?.summary || {};
  const failedCount = Math.max(
    0,
    Number(summary.transactionCount || 0) - Number(summary.successfulCount || 0)
  );

  const cards = [
    {
      label: "Total bKash Orders",
      value: summary.transactionCount || 0,
      icon: WalletCards,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Successful",
      value: summary.successfulCount || 0,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Failed / Pending",
      value: failedCount,
      icon: XCircle,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Gross Received",
      value: money(summary.grossAmount),
      icon: Banknote,
      tone: "bg-fuchsia-50 text-fuchsia-700",
    },
    {
      label: "Net Received",
      value: money(summary.netAmount),
      icon: Banknote,
      tone: "bg-cyan-50 text-cyan-700",
    },
  ];

  const columns = [
    {
      title: "Payment / TrxID",
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate-900">
            {row.trxID || row.paymentID || "Historical order"}
          </p>
          <p className="text-xs text-slate-400">{row.source}</p>
        </div>
      ),
    },
    {
      title: "Order",
      dataIndex: "orderId",
      render: (value) => value || "N/A",
    },
    {
      title: "Restaurant / Customer",
      render: (_, row) => (
        <div>
          <p className="font-semibold">{row.restaurantName || "Unknown"}</p>
          <p className="text-xs text-slate-500">{row.customerPhone || "N/A"}</p>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "grossAmount",
      render: money,
    },
    {
      title: "Status",
      render: (_, row) => (
        <Tag color={row.successful ? "green" : "red"}>{row.status}</Tag>
      ),
    },
    {
      title: "Record time",
      dataIndex: "createdAt",
      render: dateTime,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen space-y-5 bg-slate-50 p-3 md:p-6">
        <section className="rounded-[30px] bg-gradient-to-r from-slate-950 via-fuchsia-950 to-pink-800 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-pink-200">
                Single merchant reconciliation
              </p>
              <h1 className="mt-2 text-3xl font-black">bKash Zone Ledger</h1>
              <p className="mt-2 text-sm text-pink-100">
                {user?.agentName || user?.zoneName || "Agent"} — only your zone's
                trusted bKash orders.
              </p>
            </div>
            <Button
              icon={<RefreshCcw size={16} />}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </section>

        <section className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <Input
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => {
              setEndDate(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All statuses" },
              { value: "success", label: "Successful" },
              { value: "failed", label: "Failed / pending" },
            ]}
          />
          <Button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setStatus("");
              setPage(1);
            }}
          >
            All available dates
          </Button>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map(({ label, value, icon, tone }) => (
            <div
              key={label}
              className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className={`inline-flex rounded-2xl p-3 ${tone}`}>
                {createElement(icon, { size: 19 })}
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {label}
              </p>
              <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <Table
            rowKey={(row) => row._id}
            columns={columns}
            dataSource={data?.transactions || []}
            loading={isLoading || isFetching}
            scroll={{ x: 1000 }}
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.pagination?.total || 0,
              showSizeChanger: true,
              onChange: (nextPage, nextLimit) => {
                setPage(nextPage);
                setLimit(nextLimit);
              },
            }}
          />
        </section>
      </div>
    </Layout>
  );
}
