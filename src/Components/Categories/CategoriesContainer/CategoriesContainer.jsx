import React from 'react';
import CategoryCards from '../CategoryCards/CategoryCards';

const CategoriesContainer = ({ categories }) => {
  if (categories.length === 0) {
    return (
      <div className="text-center py-10 text-base-content/50">
        No categories found.
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
      {categories.map((item) => (
        <CategoryCards key={item._id} item={item} />
      ))}
    </div>
  );
};

export default CategoriesContainer;