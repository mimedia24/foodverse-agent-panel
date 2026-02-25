import React from "react";
import { Form, Input, Button, Card } from "antd";
import { PhoneOutlined, LockOutlined } from "@ant-design/icons";
import logo from "../assets/foodverse.webp";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const onFinish = (values) => {
    console.log("Login values:", values);
    login({
      phoneNumber: values.phone,
      password: values.password,
    });
    navigate("/");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={logo}
          alt="Foodverse Logo"
          style={{ width: 120, marginBottom: 20, margin: "auto" }}
        />
        <h2 style={{ marginBottom: 24 }} className={"text-2xl my-4 font-bold"}>
          Welcome Back
        </h2>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Please input your phone number!" },
            ]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Phone Number"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ borderRadius: 6 }}
            >
              Sign In
            </Button>
          </Form.Item>

          <div style={{ color: "#8c8c8c" }}>
            Don't have an account? <a href="/register">Register</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
