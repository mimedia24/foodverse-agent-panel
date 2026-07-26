import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, InputNumber, message } from "antd";
import { ArrowLeft, ShieldCheck, Wallet } from "lucide-react";
import Layout from "../components/layout/Layout";
import api from "../api/config";

export default function RiderPayment() {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submitPayment = async () => {
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      message.error("Enter a positive payment amount.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.put("/zone/rider-payment", {
        riderId,
        amount: Number(amount),
      });
      if (!data?.success) throw new Error(data?.message || "Payment failed.");
      setResult(data);
      setAmount(null);
      message.success(data.message || "Rider payment successful.");
    } catch (error) {
      message.error(
        error?.response?.data?.message || error?.message || "Rider payment failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate("/riders")}>
          Back to Riders
        </Button>

        <section className="rounded-[30px] bg-gradient-to-r from-slate-950 to-blue-900 p-6 text-white shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">
            Zone-secured direct payout
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-black">
            <Wallet /> Rider Payment
          </h1>
          <p className="mt-3 break-all text-sm text-slate-300">
            Rider ID: {riderId}
          </p>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <ShieldCheck className="mb-2" size={20} />
            The server verifies this Rider belongs to your zone and checks the
            available earning balance before making one atomic deduction.
          </div>

          <label className="mt-6 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Payment amount (BDT)
          </label>
          <InputNumber
            min={0.01}
            precision={2}
            value={amount}
            onChange={setAmount}
            placeholder="Enter amount"
            className="mt-2 !w-full"
            size="large"
          />
          <Button
            type="primary"
            block
            size="large"
            className="mt-4"
            loading={loading}
            onClick={submitPayment}
          >
            Confirm Rider Payment
          </Button>

          {result ? (
            <div className="mt-5 grid gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase">Paid</p>
                <p className="font-black">BDT {result.payableAmount}</p>
              </div>
              <div>
                <p className="text-xs uppercase">Remaining earning</p>
                <p className="font-black">BDT {result.balance}</p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </Layout>
  );
}
