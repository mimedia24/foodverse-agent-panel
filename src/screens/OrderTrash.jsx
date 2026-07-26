import { useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Popconfirm, Select, Table, Tag, message } from "antd";
import { ArchiveRestore, RefreshCcw, Search, Trash2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import OrderService from "../api/order.service";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("en-BD", { timeZone: "Asia/Dhaka" }) : "N/A";

export default function OrderTrash() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [restoringId, setRestoringId] = useState("");

  const queryKey = useMemo(
    () => ["archived-orders", page, limit, search, status, startDate, endDate],
    [page, limit, search, status, startDate, endDate]
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      OrderService.getArchivedOrders({
        page,
        limit,
        search,
        status,
        startDate,
        endDate,
      }),
    placeholderData: keepPreviousData,
  });

  const restoreOrder = async (orderId) => {
    try {
      setRestoringId(orderId);
      const response = await OrderService.restoreArchivedOrder(orderId);
      message.success(response?.message || "Order restored successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["archived-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order-map-orders"] }),
      ]);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to restore archived order."
      );
    } finally {
      setRestoringId("");
    }
  };

  const columns = [
    {
      title: "Order",
      dataIndex: "_id",
      width: 150,
      render: (value) => (
        <span className="font-semibold text-blue-600">
          #{String(value || "").slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      title: "Restaurant",
      dataIndex: "restaurantName",
      render: (value) => value || "Unknown Restaurant",
    },
    {
      title: "Customer",
      dataIndex: "customerPhone",
      render: (value) => value || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color="blue">{value || "N/A"}</Tag>,
    },
    {
      title: "Archive reason",
      dataIndex: "archiveReason",
      render: (value) => value || "Archived from order management",
    },
    {
      title: "Archived at",
      dataIndex: "archivedAt",
      width: 190,
      render: formatDate,
    },
    {
      title: "Action",
      fixed: "right",
      width: 120,
      render: (_, row) => (
        <Popconfirm
          title="Restore this order?"
          description="It will return to the normal historical order list."
          onConfirm={() => restoreOrder(row._id)}
        >
          <Button
            type="primary"
            icon={<ArchiveRestore size={15} />}
            loading={restoringId === row._id}
          >
            Restore
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen space-y-5 bg-slate-50 p-3 md:p-6">
        <section className="rounded-[30px] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">
                Recoverable order archive
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-3xl font-black">
                <Trash2 /> Order Trash
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Only archived orders from your authenticated zone are shown.
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

        <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input
              prefix={<Search size={15} />}
              placeholder="Order, phone, restaurant..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              allowClear
            />
            <Select
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All status" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
                {
                  value: "cancelled by restaurant",
                  label: "Cancelled by restaurant",
                },
              ]}
            />
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
            <Button
              onClick={() => {
                setSearch("");
                setStatus("all");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
            >
              Reset filters
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={data?.data || []}
            loading={isLoading || isFetching}
            scroll={{ x: 1150 }}
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.totalCount || 0,
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
