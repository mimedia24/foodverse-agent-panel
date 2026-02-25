import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Smartphone, Receipt, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

function RiderPayment() {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [method, setMethod] = useState('bkash');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Your API call logic here
    console.log({ amount, transactionId, method });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Confirm Rider Payout</h1>
          <p className="text-gray-500 text-sm">Record manual MFS transfers to keep rider balances updated.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select MFS Provider</label>
                <div className="grid grid-cols-3 gap-3">
                  {['bkash', 'nagad', 'rocket'].map((mfs) => (
                    <button
                      key={mfs}
                      type="button"
                      onClick={() => setMethod(mfs)}
                      className={`py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        method === mfs ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mfs === 'bkash' ? 'bg-[#D12053]' : mfs === 'nagad' ? 'bg-[#ED1C24]' : 'bg-[#8C3494]'
                      }`}>
                        <Smartphone className="text-white" size={20} />
                      </div>
                      <span className="capitalize text-xs font-bold">{mfs}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Payment Amount (BDT)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">৳</span>
                    <input
                      required
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-pink-500 font-semibold"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">MFS Transaction ID (TrxID)</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: AM89KL092"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-pink-500 font-mono"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 group"
              >
                Submit Payment Record
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <ShieldCheck className="mb-4 opacity-80" size={28} />
              <h3 className="font-bold text-lg leading-tight">Safety Protocol</h3>
              <p className="text-blue-100 text-xs mt-2">
                Ensure the TrxID matches the SMS confirmation from {method.toUpperCase()} before submitting. 
                Incorrect IDs may delay rider balance reconciliation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt size={18} className="text-gray-400" />
                Preview
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rider ID</span>
                  <span className="font-semibold">#RID-8801</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-semibold capitalize">{method}</span>
                </div>
                <div className="pt-3 border-t flex justify-between">
                  <span className="text-gray-900 font-bold">Total Payout</span>
                  <span className="text-green-600 font-bold">৳ {amount || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default RiderPayment;