import React from "react";
import { useForm } from "react-hook-form";
import { IoMailSharp } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { Link, Navigate, useNavigate } from "react-router";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";
import { FaLocationDot } from "react-icons/fa6";
const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    console.log("onsubit trigered with data:", data);
    try {
      console.log("inside try block");
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        password: data.password,
        email: data.email,
        address: data.address,
        phone: data.phone,
      };
      // API call to your Django backend
      const response = await axiosInstance.post("auth/register/", payload);
      console.log("after response");
       
      if (response.data.success) {
        console.log("inside if statement", response.data.success);
        // Success Alert
        console.log("Registration Successful:", response.data);
        Swal.fire({
          title: "Account Created!",
          text: response.data.success,
          icon: "success",
          confirmButtonColor: "#1A2B23", // Matching your Forest Green theme
          iconColor: "#C5A386", // Matching your Camel/Tan theme
        }).then(() => {
          // Redirect to login after user clicks OK
          navigate("/login");
        });
      }
    } catch (error) {
      // Error Handling
      Swal.fire({
        title: "Registration Failed",
        text:
          error.response?.data?.error ||
          "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonColor: "#1A2B23",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-340px)] flex items-center justify-center bg-base-100 px-4 py-12 font-inter">
      <div className="w-full max-w-xl bg-white p-8 md:p-12 rounded-sm shadow-sm border border-accent/30">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-base-content/50">
            Join the Zing community for a curated experience
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70 ml-1">
                First Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-primary/30">
                  <FaUserAlt size={16} />
                </span>
                <input
                  type="text"
                  placeholder="John"
                  className={`w-full pl-10 pr-4 py-3 bg-base-100 border rounded-sm outline-none transition-all text-sm
                    ${
                      errors.firstName
                        ? "border-error"
                        : "border-accent/50 focus:border-primary"
                    }`}
                  {...register("firstName", { required: "Required" })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70 ml-1">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Doe"
                  className={`w-full px-4 py-3 bg-base-100 border rounded-sm outline-none transition-all text-sm
                    ${
                      errors.lastName
                        ? "border-error"
                        : "border-accent/50 focus:border-primary"
                    }`}
                  {...register("lastName", { required: "Required" })}
                />
              </div>
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70 ml-1">
              Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-primary/30">
                <FaLocationDot size={16} />
              </span>
              <input
                type="text"
                placeholder="Enter your address"
                className={`w-full pl-10 pr-4 py-3 bg-base-100 border rounded-sm outline-none transition-all text-sm
                  ${
                    errors.address
                      ? "border-error"
                      : "border-accent/50 focus:border-primary"
                  }`}
                {...register("address", {
                  required: "Address is required",
                })}
              />
            </div>
            {errors.address && (
              <span className="text-error text-[10px] uppercase font-medium">
                {errors.address.message}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70 ml-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-primary/30">
                <IoMailSharp size={16} />
              </span>
              <input
                type="email"
                placeholder="name@email.com"
                className={`w-full pl-10 pr-4 py-3 bg-base-100 border rounded-sm outline-none transition-all text-sm
                  ${
                    errors.email
                      ? "border-error"
                      : "border-accent/50 focus:border-primary"
                  }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
              />
            </div>
            {errors.email && (
              <span className="text-error text-[10px] uppercase font-medium">
                {errors.email.message}
              </span>
            )}
          </div>
          {/* Phone Field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70 ml-1">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-primary/30">
                <IoMailSharp size={16} />
              </span>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                className={`w-full pl-10 pr-4 py-3 bg-base-100 border rounded-sm outline-none transition-all text-sm
                  ${
                    errors.phone
                      ? "border-error"
                      : "border-accent/50 focus:border-primary"
                  }`}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^01\d{9}$/,
                    message: "Invalid BD phone number",
                  },
                })}
              />
            </div>
            {errors.phone && (
              <span className="text-error text-[10px] uppercase font-medium">
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70 ml-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-primary/30">
                <FaLock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 bg-base-100 border rounded-sm outline-none transition-all text-sm
                  ${
                    errors.password
                      ? "border-error"
                      : "border-accent/50 focus:border-primary"
                  }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
              />
            </div>
            {errors.password && (
              <span className="text-error text-[10px] uppercase font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-sm uppercase tracking-[0.25em] text-[11px] font-bold hover:bg-primary/95 transition-all group mt-4"
          >
            Create Account
            <FaArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center pt-8 border-t border-accent/20">
          <p className="text-sm text-base-content/60">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline decoration-secondary underline-offset-4 transition-all"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
