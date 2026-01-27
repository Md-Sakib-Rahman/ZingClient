import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Corrected imports based on your uploaded filenames
import Banner1 from "../../../assets/Banner1.jpeg"; 
import Banner2 from "../../../assets/Banner2.jpeg";
import Banner3 from "../../../assets/Banner3.jpeg";

// Swiper Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Slider = ({banners}) => {
 

  return (
    <div className="w-full bg-base-100 py-10"> 
      <Swiper
        spaceBetween={0} // Zero space for a seamless high-end look
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 4000, // Slightly longer delay for a "quiet" luxury feel
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination]}
        className="mySwiper max-w-full mx-auto rounded-sm shadow-sm"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <div className="relative aspect-[10/4] md:aspect-[10/4] w-full overflow-hidden">
              <img 
                className="w-full h-full object-contain select-none" 
                src={banner.img_url} 
                alt={banner.title} 
              />
            </div>
          </SwiperSlide>
        ))}
        {/* {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative aspect-[10/4]  w-full overflow-hidden">
              <img 
                className="w-full h-full object-contain select-none" 
                src={slide.img} 
                alt={slide.alt} 
              />
            </div>
          </SwiperSlide>
        ))} */}
      </Swiper>
    </div>
  );
};

export default Slider;