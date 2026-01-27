import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaRegHeart, FaEye } from "react-icons/fa";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import Swal from 'sweetalert2';
import { AuthContext } from '../../../Context/AuthContext'; // Adjust path
import axiosInstance from '../../../Api/publicAxios/axiosInstance'; // Adjust path

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { _id, name, price, image_urls, category_name, stock, size_ids, color_ids } = product;

  // --- Logic: Add to Cart ---
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent Link navigation if wrapped
    e.stopPropagation();

    // 1. Check for Variants (Size/Color)
    // If product requires a choice, send them to the details page instead of guessing
    if ((size_ids && size_ids.length > 0) || (color_ids && color_ids.length > 0)) {
      navigate(`/productdetailspage/${_id}`);
      return;
    }

    const cartItem = {
      product_id: _id,
      quantity: 1,
      attributes: {} // No attributes for simple items (like bags/watches)
    };

    try {
      if (user) {
        // SCENARIO A: Logged In -> API Call
        await axiosInstance.post('/cart/add', cartItem);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Added to bag",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          background: '#F9F7F2',
          color: '#1A2B23'
        });
      } else {
        // SCENARIO B: Guest -> LocalStorage
        const localCart = JSON.parse(localStorage.getItem('zing_cart')) || [];
        
        // Check if item exists to increment quantity
        const existingIndex = localCart.findIndex(item => item.product_id === _id);
        
        if (existingIndex > -1) {
          localCart[existingIndex].quantity += 1;
        } else {
          localCart.push(cartItem);
        }

        localStorage.setItem('zing_cart', JSON.stringify(localCart));
        
        // Visual Feedback
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Added to bag",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          background: '#F9F7F2',
          color: '#1A2B23'
        });
        
        // Optional: Trigger a custom event so the Navbar updates count immediately
        window.dispatchEvent(new Event("storage"));
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Could not add item to cart",
        confirmButtonColor: "#1A2B23",
      });
    }
  };

  return (
    <div className="group relative bg-accent font-inter pb-2">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-base-100 rounded-sm">
        <img
          src={image_urls[0]}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {image_urls[1] && (
          <img
            src={image_urls[1]}
            alt={`${name} alternative`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100"
          />
        )}

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 flex items-end justify-center p-4 lg:translate-y-4 lg:opacity-0 transition-all duration-300 lg:group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex gap-2 w-full">
            
            {/* ADD TO CART BUTTON */}
            <Link 
              to={`/productdetailspage/${_id}`}
              className="flex-1 bg-primary text-white py-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <FaEye size={14} /> <p className="ml-1 text-[10px] uppercase font-bold">View</p>
            </Link>

            
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-4 space-y-1 px-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-primary/40 font-bold">
              {category_name || "New Collection"}
            </p>
            <h3 className="text-sm font-medium text-primary tracking-tight mt-1">
              <Link to={`/productdetailspage/${_id}`} className="hover:underline underline-offset-4 decoration-secondary">
                {name}
              </Link>
            </h3>
          </div>
          <p className="text-sm font-bold text-primary italic">
            Tk {price.toFixed(2)}
          </p>
        </div>
        
        {stock < 5 && stock > 0 && (
          <p className="text-[9px] uppercase tracking-widest text-secondary font-bold">
            Only {stock} remaining
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
