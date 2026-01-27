import React from 'react';
import { Link } from 'react-router';

const CategoryCards = ({ item }) => {
  return (
    <Link 
      to={`/products/${item._id}`}
      className='group relative block overflow-hidden rounded-sm bg-accent/20 aspect-[3/4]'
    >
      {/* Background Image with Hover Zoom */}
      <img
        src={item.image_url}
        alt={item.name}
        className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
      />

      {/* Elegant Overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80'></div>

      {/* Text Content */}
      <div className='absolute bottom-0 left-0 w-full p-6 transform transition-transform duration-500 group-hover:-translate-y-2'>
        <h3 className='text-white text-xl font-semibold tracking-wide uppercase italic md:not-italic'>
          {item.name}
        </h3>
        <p className='text-white/70 text-[10px] uppercase tracking-[0.3em] mt-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
          Explore Collection
        </p>
      </div>

      {/* Decorative Border on Hover */}
      <div className='absolute inset-4 border border-white/20 scale-95 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100'></div>
    </Link>
  );
};

export default CategoryCards;