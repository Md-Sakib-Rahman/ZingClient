import React, { useEffect, useState, useCallback } from "react";
import { Link, NavLink } from "react-router"; // or 'react-router-dom' depending on your version
import Logo from "../Logo/Logo";
import { FaCartShopping } from "react-icons/fa6";
import { AuthContext } from "../../../Context/AuthContext";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  // --- Logic: Calculate Cart Count ---
  const updateCartCount = useCallback(async () => {
    try {
      if (user) {
        // SCENARIO A: Logged In -> Fetch from Server
        const res = await axiosInstance.get("/cart/");
        // Sum up the quantities of all items (not just the array length)
        const totalQty = res.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(totalQty);
      } else {
        // SCENARIO B: Guest -> Fetch from LocalStorage
        const localCart = JSON.parse(localStorage.getItem("zing_cart")) || [];
        const totalQty = localCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalQty);
      }
    } catch (error) {
      console.error("Failed to update cart count", error);
      // If API fails (e.g. 404 empty cart), default to 0
      setCartCount(0);
    }
  }, [user]);

  // --- Effect: Listen for changes ---
  useEffect(() => {
    updateCartCount(); // Initial Load

    // Listen for our custom event "cart-updated"
    window.addEventListener("cart-updated", updateCartCount);
    
    // Listen for storage changes (for cross-tab sync)
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, [updateCartCount]);

  const handleLogout = () => {
    logout();
    setCartCount(0); // Reset count immediately
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Logged out successfully',
      showConfirmButton: false,
      timer: 1500
    });
  }

  // Common styling for NavLinks
  const getNavLinkClass = ({ isActive }) => `
    nav-link-luxe
    hover:text-primary
    ${isActive 
      ? "text-primary border-b border-primary/40 pb-1 font-bold" 
      : "text-base-content/70"}
  `;

  return (
    <div className="fixed right-0 left-0 z-50 mx-auto navbar bg-base-100 shadow-md max-w-11/12 my-4 rounded-3xl px-5">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          {/* MOBILE MENU */}
          <ul
            tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow inter font-bold gap-2"
          >
            <li><Link to="/">Home</Link></li>
            {user?.role === 'admin' && (
               <li><Link to="/admin" className="text-primary">Dashboard</Link></li>
            )}
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/products">Products</Link></li>
          </ul>
        </div>
        <Link to="/"> <Logo/> </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        {/* DESKTOP MENU */}
        <ul className="menu menu-horizontal px-1 gap-5 text-sm inter tracking-widest">
           <li>
             <NavLink className={getNavLinkClass} to="/">Home</NavLink>
           </li>
           
           {user?.role === 'admin' && (
             <li>
               <NavLink className={getNavLinkClass} to="/admin">Dashboard</NavLink>
             </li>
           )}

           <li>
             <NavLink className={getNavLinkClass} to="/categories">Categories</NavLink>
           </li>
           <li>
             <NavLink className={getNavLinkClass} to="/products">Products</NavLink>
           </li>
        </ul>
      </div>

      <div className="navbar-end flex items-center gap-6 rounded-2xl">
        
        {/* CART ICON WITH BADGE */}
        <Link to={"/cart"} className="relative group">
          <FaCartShopping size={24} className="text-primary group-hover:text-primary/80 transition-colors"/> 
          
          {/* Notification Badge - Only visible if count > 0 */}
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-primary text-[9px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in duration-300">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <p onClick={handleLogout} className="btn btn-primary rounded-2xl btn-outline cursor-pointer">Logout</p>
        ) : (
          <Link to="/login">
            <p className="btn btn-primary rounded-2xl btn-outline">Login</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
