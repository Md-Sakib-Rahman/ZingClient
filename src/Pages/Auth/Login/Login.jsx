import React from "react";
import { useForm } from "react-hook-form";
import { IoMailSharp } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";
import Swal from "sweetalert2";
import { AuthContext } from "../../../Context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const {setUser, setAccessToken} = React.useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const syncGuestCart = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem("zing_cart")) || [];
      
      if (localCart.length === 0) return;

      // Loop through local items and send them to the backend
      // We use a for...of loop to handle async/await correctly
      for (const item of localCart) {
        const payload = {
          product_id: item.product_id,
          quantity: item.quantity,
          // Map local structure (attributes.size) to API structure (size_id)
          color_id: item.attributes?.color || null,
          size_id: item.attributes?.size || null
        };

        // We ignore errors here (e.g. if item is out of stock) to ensure login proceeds
        await axiosInstance.post("cart/add/", payload).catch(err => console.warn("Sync item failed", err));
      }

      // Clear local storage after successful sync
      localStorage.removeItem("zing_cart");
      
    } catch (error) {
      console.error("Cart sync error", error);
    }
  };
  const onSubmit = async(data) => {
    try {
      const response = await axiosInstance.post("auth/login/", data);

      if (response.data.access_token) {
        // Save to LocalStorage
        setUser(response.data.user);
        localStorage.setItem("token", response.data.access_token);
        setAccessToken(response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        await syncGuestCart();
        Swal.fire({
          title: "Login Successful",
          text: `Welcome back, ${response.data.user.first_name}!`,
          icon: "success",
          confirmButtonColor: "#1A2B23",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/"); // Redirect to home
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: error.response?.data?.message || "Check your credentials.",
        icon: "error",
        confirmButtonColor: "#1A2B23",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-340px)] flex items-center justify-center bg-base-100 px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-sm shadow-sm border border-accent/30">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <h1 className="inter text-4xl text-primary tracking-wide mb-2">
            Welcome Back
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">
            Enter your details to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70 ml-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-primary/40">
                <IoMailSharp size={16} />
              </span>
              <input
                type="email"
                placeholder="email@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-base-100 border rounded-sm outline-none transition-all font-sans text-sm
                  ${errors.email ? "border-error" : "border-accent/50 focus:border-primary"}`}
                {...register("email", { 
                  required: "Email is required", 
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } 
                })}
              />
            </div>
            {errors.email && <span className="text-error text-[10px] uppercase tracking-tighter">{errors.email.message}</span>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70 ml-1">
                Password
              </label>
              <Link to="/forgot-password" size="sm" className="text-[10px] uppercase tracking-tighter text-secondary hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-primary/40">
                <FaLock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 bg-base-100 border rounded-sm outline-none transition-all font-sans text-sm
                  ${errors.password ? "border-error" : "border-accent/50 focus:border-primary"}`}
                {...register("password", { 
                  required: "Password is required", 
                  minLength: { value: 6, message: "Minimum 6 characters" } 
                })}
              />
            </div>
            {errors.password && <span className="text-error text-[10px] uppercase tracking-tighter">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-sm uppercase tracking-[0.2em] text-xs font-bold hover:bg-primary/90 transition-all group"
          >
            Sign In
            <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-accent/20">
          <p className="text-sm text-base-content/60">
            Don’t have an account?{" "}
            <Link to="/register" className="text-secondary font-bold hover:underline">
              Create One
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;