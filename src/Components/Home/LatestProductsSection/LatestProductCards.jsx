import React from 'react';
import { FaBagShopping } from "react-icons/fa6";
import { Link } from 'react-router';
const LatestProductCards = ({ product }) => {
  console.log(product)
  return (
    <div className="group cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2F0EB] rounded-sm">
        <img
          src={product.image_urls[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/80 backdrop-blur-sm">
          <Link to={`/productdetailspage//${product._id}`} className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-white text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all">
            <FaBagShopping size={14}/>
            View
          </Link>
        </div>
        <span className="absolute top-4 left-4 bg-secondary text-white text-[10px] uppercase tracking-widest px-2 py-1">
            New In
          </span>
        {/* Badge (Optional) */}
        {/* {product.isNew && (
          
        )} */}
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        <h3 className="inter text-lg text-primary tracking-wide">
          {product.name}
        </h3>
        <p className="text-sm text-base-content/60 uppercase tracking-tighter">
          Menswear
          {}
        </p>
        <p className="text-primary font-medium">
          Tk{product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default LatestProductCards;