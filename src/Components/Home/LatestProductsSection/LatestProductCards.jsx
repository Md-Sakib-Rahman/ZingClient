import React, { useState, useEffect } from 'react';
import { FaBagShopping } from "react-icons/fa6";
import { Link } from 'react-router'; // Ensure correct import for your router version
import axiosInstance from '../../../Api/publicAxios/axiosInstance'; // Adjust path if needed

// Global cache to prevent multiple API calls when rendering many cards
let cachedCategories = null;

const LatestProductCards = ({ product }) => {
  const [categoryName, setCategoryName] = useState("Loading...");

  // --- 1. Fetch & Hydrate Category Name ---
  useEffect(() => {
    // If the API ever updates to send the name directly, use it immediately
    if (product.category_name) {
      setCategoryName(product.category_name);
      return;
    }

    const assignCategory = (categories) => {
      const cat = categories.find((c) => c._id === product.category_id);
      setCategoryName(cat ? cat.name : "Collection"); // Fallback to "Collection" if not found
    };

    if (cachedCategories) {
      // Use cached data if already fetched by another card
      assignCategory(cachedCategories);
    } else {
      // Fetch from API and cache it
      axiosInstance.get("/products/get-attributes/")
        .then((res) => {
          cachedCategories = res.data.categories;
          assignCategory(cachedCategories);
        })
        .catch((err) => {
          console.error("Failed to fetch categories", err);
          setCategoryName("Collection");
        });
    }
  }, [product.category_id, product.category_name]);

  // --- 2. Discount Calculation (from your data) ---
  const hasDiscount = product.discount && product.discount > 0 && product.discount < 1;
  const discountedPrice = hasDiscount ? product.price * (1 - product.discount) : product.price;

  return (
    <div className="group cursor-pointer flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2F0EB] rounded-sm">
        <img
          src={product.image_urls[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Quick Add Overlay - FIX: Removed comments inside the string */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-sm transition-transform duration-300 translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0">
          <Link 
            to={`/productdetailspage/${product._id}`} 
            className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-white text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all"
          >
            <FaBagShopping size={14}/>
            View
          </Link>
        </div>

        <span className="absolute top-4 left-4 bg-secondary text-white text-[10px] uppercase tracking-widest px-2 py-1 shadow-sm">
            New In
        </span>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-1 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="inter text-lg text-primary tracking-wide line-clamp-1" title={product.name}>
            {product.name}
          </h3>
          
          {/* Dynamic Category Name */}
          <p className="text-sm text-base-content/60 uppercase tracking-tighter">
            {categoryName}
          </p>
        </div>

        {/* Dynamic Pricing (Shows discount if applicable) */}
        <div className="pt-1">
          {hasDiscount ? (
             <div className="flex items-baseline gap-2">
               <span className="text-primary font-medium">
                 Tk {discountedPrice.toLocaleString()}
               </span>
               <span className="text-[10px] text-primary/40 line-through">
                 Tk {product.price.toLocaleString()}
               </span>
             </div>
          ) : (
             <p className="text-primary font-medium">
               Tk {product.price.toLocaleString()}
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestProductCards;

// import React from 'react';
// import { FaBagShopping } from "react-icons/fa6";
// import { Link } from 'react-router'; // Ensure correct import for your router version

// const LatestProductCards = ({ product }) => {
//   console.log(product)
//   return (
//     <div className="group cursor-pointer">
//       {/* Image Container */}
//       <div className="relative aspect-[3/4] overflow-hidden bg-[#F2F0EB] rounded-sm">
//         <img
//           src={product.image_urls[0]}
//           alt={product.name}
//           className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
//         />
        
//         {/* Quick Add Overlay */}
//         <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-sm transition-transform duration-300
//           {/* MOBILE: Always Visible (translate-y-0) */}
//           translate-y-0
          
//           {/* DESKTOP (lg): Hidden by default (translate-y-full), Slide up on hover */}
//           lg:translate-y-full lg:group-hover:translate-y-0"
//         >
//           {/* Fixed double slash in URL path below */}
//           <Link 
//             to={`/productdetailspage/${product._id}`} 
//             className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-white text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all"
//           >
//             <FaBagShopping size={14}/>
//             View
//           </Link>
//         </div>

//         <span className="absolute top-4 left-4 bg-secondary text-white text-[10px] uppercase tracking-widest px-2 py-1">
//             New In
//         </span>
//       </div>

//       {/* Product Info */}
//       <div className="mt-4 space-y-1">
//         <h3 className="inter text-lg text-primary tracking-wide">
//           {product.name}
//         </h3>
//         <p className="text-sm text-base-content/60 uppercase tracking-tighter">
//           Menswear
//         </p>
//         <p className="text-primary font-medium">
//           Tk{product.price.toFixed(2)}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LatestProductCards;
