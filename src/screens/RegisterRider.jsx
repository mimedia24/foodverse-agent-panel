import React, { useState } from 'react';
import { Form, Input, Button, Card, Upload, message, Select, Divider } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined, 
  CarOutlined, 
  HomeOutlined, 
  CloudUploadOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import Layout from '../components/layout/Layout';

const { Option } = Select;

function RegisterRider() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Basic Info
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('password', values.password);
      formData.append('address', values.address);
      
      // Vehicle Info
      formData.append('vehicleType', values.vehicleType);
      formData.append('vehicleNumber', values.vehicleNumber);

      // Files - using optional chaining to prevent crashes
      if (values.profileImage?.file?.originFileObj) {
        formData.append('profileImage', values.profileImage.file.originFileObj);
      }
      if (values.nidFront?.file?.originFileObj) {
        formData.append('nidFront', values.nidFront.file.originFileObj);
      }
      if (values.nidBack?.file?.originFileObj) {
        formData.append('nidBack', values.nidBack.file.originFileObj);
      }

      const response = await fetch('http://localhost:5000/api/riders/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Rider registered successfully!');
        form.resetFields();
      } else {
        message.error(data.message || 'Registration failed');
      }
    } catch (error) {
      message.error('Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Onboard New Rider</h1>
            <p className="text-gray-500 mt-2">Fill in the details to add a new rider to your fleet.</p>
          </div>

          <Card className="shadow-xl rounded-3xl border-none overflow-hidden">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="p-2 md:p-6"
            >
              {/* Section 1: Personal Information */}
              <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <UserOutlined className="text-xl" />
                <h3 className="text-lg font-bold m-0 uppercase tracking-wider text-gray-700">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[{ required: true, message: 'Please enter full name' }]}
                >
                  <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="John Doe" className="rounded-lg py-2" />
                </Form.Item>

                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
                >
                  <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="john@example.com" className="rounded-lg py-2" />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: true, message: 'Phone is required' }]}
                >
                  <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="+88017..." className="rounded-lg py-2" />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, min: 6 }]}
                >
                  <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Min 6 characters" className="rounded-lg py-2" />
                </Form.Item>

                <Form.Item
                  label="Permanent Address"
                  name="address"
                  className="md:col-span-2"
                  rules={[{ required: true }]}
                >
                  <Input prefix={<HomeOutlined className="text-gray-400" />} placeholder="House, Street, City, ZIP" className="rounded-lg py-2" />
                </Form.Item>
              </div>

              <Divider className="my-8" />

              {/* Section 2: Vehicle Information */}
              <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <CarOutlined className="text-xl" />
                <h3 className="text-lg font-bold m-0 uppercase tracking-wider text-gray-700">Vehicle Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <Form.Item
                  label="Vehicle Type"
                  name="vehicleType"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Vehicle" className="h-10">
                    <Option value="bike">Motorcycle</Option>
                    <Option value="bicycle">Bicycle</Option>
                    <Option value="car">Car / Van</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Vehicle Plate Number"
                  name="vehicleNumber"
                  rules={[{ required: true }]}
                >
                  <Input prefix={<IdcardOutlined className="text-gray-400" />} placeholder="Ex: DHA-12345" className="rounded-lg py-2" />
                </Form.Item>
              </div>

              <Divider className="my-8" />

              {/* Section 3: Document Uploads */}
              <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <CloudUploadOutlined className="text-xl" />
                <h3 className="text-lg font-bold m-0 uppercase tracking-wider text-gray-700">Identity Documents</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Form.Item
                  label="Profile Photo"
                  name="profileImage"
                  getValueFromEvent={(e) => e}
                  rules={[{ required: true }]}
                >
                  <Upload.Dragger beforeUpload={() => false} maxCount={1} className="bg-gray-50">
                    <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
                    <p className="ant-upload-text text-xs">Selfie</p>
                  </Upload.Dragger>
                </Form.Item>

                <Form.Item
                  label="NID Front"
                  name="nidFront"
                  getValueFromEvent={(e) => e}
                  rules={[{ required: true }]}
                >
                  <Upload.Dragger beforeUpload={() => false} maxCount={1} className="bg-gray-50">
                    <p className="ant-upload-drag-icon"><IdcardOutlined /></p>
                    <p className="ant-upload-text text-xs">Front Side</p>
                  </Upload.Dragger>
                </Form.Item>

                <Form.Item
                  label="NID Back"
                  name="nidBack"
                  getValueFromEvent={(e) => e}
                  rules={[{ required: true }]}
                >
                  <Upload.Dragger beforeUpload={() => false} maxCount={1} className="bg-gray-50">
                    <p className="ant-upload-drag-icon"><IdcardOutlined /></p>
                    <p className="ant-upload-text text-xs">Back Side</p>
                  </Upload.Dragger>
                </Form.Item>
              </div>

              <div className="mt-12">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading}
                  className="h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-bold shadow-lg shadow-indigo-100"
                >
                  Finalize Registration
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default RegisterRider;