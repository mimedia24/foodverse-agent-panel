import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Checkbox, Spin, message } from "antd";
import Layout from "../components/layout/Layout";
import api from "../api/config";

export default function PrivacyPolicy() {
  const [checked, setChecked] = useState(false);
  const policyQuery = useQuery({ queryKey: ["agent-policy"], queryFn: async () => (await api.get("/zone/privacy-policy")).data.result, staleTime: 5 * 60 * 1000 });
  const statusQuery = useQuery({ queryKey: ["agent-policy-status"], queryFn: async () => (await api.get("/zone/privacy-policy/acceptance-status")).data.result });
  const policy = policyQuery.data;
  const accepted = Boolean(statusQuery.data?.accepted);
  const canAccept = useMemo(() => Boolean(policy && checked && !accepted), [policy, checked, accepted]);
  const accept = async () => {
    try { await api.post("/zone/privacy-policy/acceptance"); message.success("Policy accepted successfully."); statusQuery.refetch(); window.location.reload(); }
    catch (error) { message.error(error?.response?.data?.message || "Could not save acceptance."); }
  };
  return <Layout><main className="mx-auto min-h-screen max-w-5xl bg-slate-50 px-4 py-6 md:px-8">
    <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
      {policyQuery.isLoading ? <div className="flex justify-center py-20"><Spin size="large" /></div> : policyQuery.isError ? <Alert type="error" showIcon message="Policy could not be loaded" action={<Button onClick={() => policyQuery.refetch()}>Retry</Button>} /> : <>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Food Verse Agent</p><h1 className="mt-2 text-3xl font-black text-slate-950">{policy.title}</h1><p className="mt-2 text-sm text-slate-500">Version {policy.version} · Effective {policy.effectiveDate}</p></div><Button onClick={() => window.print()}>Print / Save PDF</Button></div>
        <div className="mt-8 space-y-7">{policy.sections.map(section => <section key={section.title}><h2 className="text-lg font-bold text-slate-900">{section.title}</h2><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">{section.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>
        {!accepted && <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-4"><Checkbox checked={checked} onChange={e => setChecked(e.target.checked)}>I have read and agree to the current Food Verse Agent Policy.</Checkbox><div className="mt-3"><Button type="primary" disabled={!canAccept} onClick={accept}>Accept Policy</Button></div></div>}
        {accepted && <Alert className="mt-10" type="success" showIcon message="You have accepted the current policy version." />}
      </>}
    </div>
  </main></Layout>;
}
