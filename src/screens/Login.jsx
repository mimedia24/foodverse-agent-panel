import React, { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import {
  PhoneOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  FireOutlined,
} from "@ant-design/icons";
import logo from "../assets/foodverse.webp";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router";

const featurePills = [
  "Live Order Control",
  "Restaurant Access",
  "Rider Monitoring",
  "Agent Analytics",
];

const statCards = [
  {
    icon: <ThunderboltOutlined />,
    title: "Fast Control",
    value: "Real-time agent actions",
  },
  {
    icon: <FireOutlined />,
    title: "Smart UI",
    value: "Compact, modern, premium",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Secure Access",
    value: "Zone manager protected login",
  },
];

const inputStyle = {
  height: 54,
  borderRadius: 18,
  borderColor: "#E2E8F0",
  background: "rgba(255,255,255,0.96)",
  boxShadow: "none",
};

const Login = () => {
  const { login, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await login({
        phoneNumber: values.phone,
        password: values.password,
      });
    } finally {
      setTimeout(() => {
        setSubmitting(false);
      }, 300);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.28),_transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#020617_100%)]" />
      <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 md:p-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_100px_rgba(2,6,23,0.65)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative hidden min-h-[720px] overflow-hidden lg:block">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(37,99,235,0.92),rgba(14,165,233,0.86)_55%,rgba(6,182,212,0.84))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_32%)]" />

            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
                  Food Verse Agent Admin
                </div>

                <div className="mt-10 max-w-xl">
                  <h1 className="text-5xl font-black leading-tight">
                    Aggressive control panel for orders, riders and restaurant operations.
                  </h1>
                  <p className="mt-5 text-base leading-7 text-white/85">
                    Monitor sales, manage menus, track deliveries, and keep your
                    agent operations sharp from one clean dashboard.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {featurePills.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/95"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {statCards.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl text-white">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-white/75">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[720px] items-center justify-center bg-white/90 p-4 sm:p-8 lg:bg-white/92 lg:p-10">
            <div className="absolute left-8 top-8 hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 shadow-sm lg:inline-flex">
              Agent Login
            </div>

            <div className="w-full max-w-md">
              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:p-8">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-inner">
                    <img
                      src={logo}
                      alt="Foodverse Logo"
                      className="h-20 w-20 object-contain"
                    />
                  </div>

                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.34em] text-blue-600">
                    Food Verse Agent Admin
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Sign in to manage your zone operations with full control.
                  </p>
                </div>

                <Form
                  name="login_form"
                  layout="vertical"
                  onFinish={onFinish}
                  size="large"
                  className="mt-8"
                >
                  <Form.Item
                    name="phone"
                    label={
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Phone Number
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please input your phone number" },
                    ]}
                  >
                    <Input
                      prefix={
                        <PhoneOutlined style={{ color: "#64748B", marginRight: 6 }} />
                      }
                      placeholder="Enter phone number"
                      style={inputStyle}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Password
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please input your password" },
                    ]}
                  >
                    <Input.Password
                      prefix={
                        <LockOutlined style={{ color: "#64748B", marginRight: 6 }} />
                      }
                      placeholder="Enter password"
                      style={inputStyle}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginTop: 8, marginBottom: 14 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={submitting || isLoading}
                      style={{
                        height: 56,
                        borderRadius: 18,
                        border: "none",
                        fontWeight: 800,
                        fontSize: 16,
                        background:
                          "linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #06b6d4 100%)",
                        boxShadow: "0 16px 30px rgba(37,99,235,0.30)",
                      }}
                    >
                      Sign In
                    </Button>
                  </Form.Item>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <a
                      href="/register"
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Register
                    </a>
                  </div>
                </Form>
              </div>

              <div className="mt-5 text-center text-xs font-medium text-white/70 lg:text-slate-500">
                Powered by Food Verse Agent Control
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;