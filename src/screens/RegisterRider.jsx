import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import api from "../api/config";

function RegisterRider() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    riderType: "",
    vehicleNumber: "",
  });

  const [files, setFiles] = useState({
    profileImage: null,
    nidFront: null,
    nidBack: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({ ...files, [name]: selectedFiles[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.address ||
      !formData.riderType ||
      !formData.vehicleNumber ||
      !files.profileImage ||
      !files.nidFront ||
      !files.nidBack
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      submitData.append("profileImage", files.profileImage);
      submitData.append("nidFront", files.nidFront);
      submitData.append("nidBack", files.nidBack);

      await api.post("/zone/rider/register", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Rider Registered Successfully");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10">

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Register New Rider
          </h2>
          <p className="text-gray-500 mb-10">
            Fill all details carefully to onboard a new delivery rider.
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-6">
                Personal Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">

                <input type="text" name="fullName" placeholder="Full Name" className="input" onChange={handleChange} />
                <input type="email" name="email" placeholder="Email Address" className="input" onChange={handleChange} />
                <input type="text" name="phone" placeholder="Phone Number" className="input" onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" className="input" onChange={handleChange} />
                <input type="text" name="address" placeholder="Permanent Address" className="input md:col-span-2" onChange={handleChange} />

              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-6">
                Rider Details
              </h3>

              <div className="grid md:grid-cols-2 gap-6">

                <select
                  name="riderType"
                  className="input"
                  onChange={handleChange}
                >
                  <option value="">Select Rider Type</option>
                  <option value="bike">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car / Van</option>
                </select>

                <input
                  type="text"
                  name="vehicleNumber"
                  placeholder="Vehicle Plate Number"
                  className="input"
                  onChange={handleChange}
                />

              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-6">
                Identity Documents
              </h3>

              <div className="grid md:grid-cols-3 gap-6">

                <FileUpload label="Profile Photo" name="profileImage" onChange={handleFileChange} file={files.profileImage} />
                <FileUpload label="NID Front" name="nidFront" onChange={handleFileChange} file={files.nidFront} />
                <FileUpload label="NID Back" name="nidBack" onChange={handleFileChange} file={files.nidBack} />

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200"
            >
              {loading ? "Registering..." : "Finalize Registration"}
            </button>

          </form>
        </div>
      </div>
    </Layout>
  );
}

function FileUpload({ label, name, onChange, file }) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-all duration-200">
      <p className="text-gray-600 mb-3 font-medium">{label}</p>

      <input
        type="file"
        name={name}
        accept="image/*"
        onChange={onChange}
        className="hidden"
        id={name}
      />

      <label htmlFor={name} className="cursor-pointer text-indigo-600 font-semibold">
        Click to Upload
      </label>

      {file && (
        <p className="mt-3 text-sm text-green-600">
          {file.name}
        </p>
      )}
    </div>
  );
}

export default RegisterRider;