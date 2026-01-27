import React from 'react';
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const ProductPagination = ({ current, total, onPageChange }) => {
  // Define the window size (current + next 5)
  const windowSize = 6; 
  
  // Calculate start and end indices
  // If we are at page 5, the start should shift to 5. 
  // Before that, we start from 1.
  const startPage = current < 5 ? 1 : current;
  const endPage = Math.min(startPage + windowSize - 1, total);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-3 font-inter">
      {/* Previous Arrow - Only shows if not on first window */}
      {current > 1 && (
        <button
          onClick={() => onPageChange(current - 1)}
          className="w-8 h-8 flex items-center justify-center border border-accent/20 text-primary/40 hover:text-primary transition-all rounded-sm"
        >
          <FaChevronLeft size={10} />
        </button>
      )}

      {/* Dynamic Page Numbers */}
      <div className="flex items-center gap-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 text-[10px] font-bold transition-all border rounded-sm
              ${current === page 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'text-primary/40 border-accent/10 hover:border-primary'}`}
          >
            {String(page).padStart(2, '0')}
          </button>
        ))}
      </div>

      {/* Explore More Arrow */}
      {total > endPage && (
        <button
          onClick={() => onPageChange(endPage + 1)}
          className="flex items-center gap-2 px-3 h-10 border border-accent/10 text-[10px] uppercase tracking-widest font-bold text-primary/40 hover:text-secondary hover:border-secondary transition-all group rounded-sm"
        >
          <span>More</span>
          <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default ProductPagination;

// import React from 'react'

// const ProductPagination = ({ current, total, onPageChange }) => {
//   return (
//     <div>
//       <div className="flex items-center gap-4">
//       {[...Array(total)].map((_, i) => (
//         <button
//           key={i + 1}
//           onClick={() => onPageChange(i + 1)}
//           className={`w-8 h-8 text-[10px] font-bold transition-all border rounded-sm
//             ${current === i + 1 
//               ? 'bg-primary text-white border-primary' 
//               : 'text-primary/40 border-accent/20 hover:border-primary'}`}
//         >
//           {String(i + 1).padStart(2, '0')}
//         </button>
//       ))}
//     </div>
//     </div>
//   )
// }

// export default ProductPagination
