import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaEye } from "react-icons/fa";
import Swal from 'sweetalert2';
import { AuthContext } from '../../../Context/AuthContext'; 
import axiosInstance from '../../../Api/publicAxios/axiosInstance'; 

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { _id, name, price, image_urls, category_name, stock, size_ids, color_ids, discount } = product;

  // --- Logic: Discount Calculation ---
  const hasDiscount = discount && discount > 0 && discount < 1;
  const discountedPrice = hasDiscount ? price * (1 - discount) : price;
  const discountPercentage = hasDiscount ? Math.round(discount * 100) : 0;

  // --- Logic: Add to Cart ---
  const handleAddToCart = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if ((size_ids && size_ids.length > 0) || (color_ids && color_ids.length > 0)) {
      navigate(`/productdetailspage/${_id}`);
      return;
    }

    const cartItem = {
      product_id: _id,
      quantity: 1,
      attributes: {}
    };

    try {
      if (user) {
        await axiosInstance.post('/cart/add', cartItem);
        showSuccessToast();
      } else {
        const localCart = JSON.parse(localStorage.getItem('zing_cart')) || [];
        const existingIndex = localCart.findIndex(item => item.product_id === _id);
        
        if (existingIndex > -1) {
          localCart[existingIndex].quantity += 1;
        } else {
          localCart.push(cartItem);
        }

        localStorage.setItem('zing_cart', JSON.stringify(localCart));
        showSuccessToast();
        window.dispatchEvent(new Event("storage"));
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      Swal.fire({
        icon: "error", title: "Oops...", text: "Could not add item to cart", confirmButtonColor: "#1A2B23",
      });
    }
  };

  const showSuccessToast = () => {
    Swal.fire({
      position: "top-end", icon: "success", title: "Added to bag",
      showConfirmButton: false, timer: 1500, toast: true,
      background: '#F9F7F2', color: '#1A2B23'
    });
  };

  return (
    <div className="group relative bg-accent font-inter pb-2 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-base-100 rounded-sm w-full">
        
        {/* NEW: Stock Tag (Top Left) */}
        {stock > 0 ? (
           <span className="absolute top-2 left-2 z-20 bg-green-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-sm">
             In Stock
           </span>
        ) : (
           <span className="absolute top-2 left-2 z-20 bg-gray-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-sm">
             Out of Stock
           </span>
        )}

        {/* Discount Badge (Top Right) */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 z-20 bg-red-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-sm">
            -{discountPercentage}%
          </span>
        )}

        <img
          src={image_urls[0]}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${stock === 0 ? 'opacity-80 grayscale-[40%]' : ''}`}
        />
        
        {image_urls[1] && (
          <img
            src={image_urls[1]}
            alt={`${name} alternative`}
            className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100 ${stock === 0 ? 'grayscale-[40%]' : ''}`}
          />
        )}

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 flex items-end justify-center p-4 lg:translate-y-4 lg:opacity-0 transition-all duration-300 lg:group-hover:translate-y-0 group-hover:opacity-100 bg-gradient-to-t from-black/20 to-transparent">
          <Link 
            to={`/productdetailspage/${_id}`}
            className="w-full bg-primary text-white py-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg backdrop-blur-sm"
          >
            <FaEye size={14} /> <span className="ml-1">View Details</span>
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-4 px-2 flex flex-col flex-grow justify-between space-y-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-primary/40 font-bold mb-1">
            {category_name || "Collection"}
          </p>
          <h3 className="text-sm font-medium text-primary tracking-tight leading-snug line-clamp-2 min-h-[2.5em]">
            <Link to={`/productdetailspage/${_id}`} className="hover:underline underline-offset-4 decoration-secondary">
              {name}
            </Link>
          </h3>
        </div>

        <div className="flex justify-between items-end border-t border-primary/5 pt-2 mt-auto">
          {/* Price Section */}
          <div className="flex flex-col">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-primary italic">
                  Tk {discountedPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-primary/40 line-through decoration-red-400">
                  Tk {price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-primary italic">
                Tk {price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
