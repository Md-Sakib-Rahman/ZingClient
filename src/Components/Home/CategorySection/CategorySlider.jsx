import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";

// const categories = [
//   { name: "Menswear", count: "84 Items", img: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=500&auto=format&fit=crop" },
//   { name: "Womenswear", count: "156 Items", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=500&auto=format&fit=crop" },
//   { name: "Accessories", count: "42 Items", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=500&auto=format&fit=crop" },
//   { name: "Footwear", count: "68 Items", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500&auto=format&fit=crop" },
// ];

const CategorySlider = ({categories}) => {
  // console.log(categories)
  return (
    <section className=" px-4 max-w-7xl mx-auto inter">
      

      <Swiper
        slidesPerView={1.2}
        spaceBetween={20}
        grabCursor={true}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: true }}
        breakpoints={{
          640: { slidesPerView: 2.2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        modules={[Pagination, Autoplay]}
        className="categorySwiper !pb-14"
      >
        {categories.map((cat) => (
          <SwiperSlide key={cat._id} className="group cursor-pointer">
            <div className="relative overflow-hidden aspect-[3/2] rounded-sm transition-all duration-700">
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
              
              {/* Background Image */}
              <img 
                src={cat.image_url} 
                alt={cat.name} 
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 "
              />

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                <p className="text-white/80 text-[10px] uppercase tracking-[0.3em] mb-1 opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 font-sans">
                  {10}
                </p>
                <h3 className="text-white text-2xl   tracking-wide">
                  {cat.name}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default CategorySlider;