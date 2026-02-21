import React from 'react';
import LatestProductCards from './LatestProductCards';


const LatestProductSection = ({products}) => {
  // Mock Data - Replace with your API data
  // const products = [
  //   { id: 1, title: "Linen Blend Blazer", category: "Womenswear", price: 189.00, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop", isNew: true },
  //   { id: 2, title: "Classic Wool Trouser", category: "Menswear", price: 120.00, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=500&auto=format&fit=crop", isNew: true },
  //   { id: 3, title: "Minimalist Leather Tote", category: "Accessories", price: 310.00, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=500&auto=format&fit=crop", isNew: false },
  //   { id: 1, title: "Linen Blend Blazer", category: "Womenswear", price: 189.00, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop", isNew: true },
  //   ];

  return (
    <section className=" px-4  mx-auto bg-base-100">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-baseline  gap-4">
        <div className="">
          <h2 className="inter text-3xl max-md:text-xl text-primary leading-tight">
            The Latest Arrivals
          </h2>
          <p className="text-base-content/60 mt-2  text-sm">
            A curated selection of our newest pieces, designed for the modern wardrobe.
          </p>
        </div>
        
        <a href="/products" className="text-xs bg-accent hover:bg-primary  p-2 uppercase tracking-widest font-semibold border-b border-primary text-primary hover:text-secondary hover:border-secondary transition-colors pb-1">
          Explore All 
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>
      <hr className='my-10 text-gray-200'/>  
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {products.map((product, idx) => (
          <LatestProductCards key={idx} product={product} />
        ))}
      </div>
    </section>
  );
};

export default LatestProductSection;