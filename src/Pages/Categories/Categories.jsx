import React, { useEffect, useState } from 'react';
import CategoriesContainer from '../../Components/Categories/CategoriesContainer/CategoriesContainer';
import axiosInstance from '../../Api/publicAxios/axiosInstance';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("products/get-attributes/");
        // Extracting only the categories part from the response
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className='min-h-[calc(100vh-340px)] bg-base-100 font-inter'>
      <div className='max-w-7xl mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-primary tracking-tight'>
            Browse By Catalogues
          </h2>
          <div className='w-20 h-1 bg-secondary mx-auto mt-4 opacity-60'></div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <CategoriesContainer categories={categories} />
        )}
      </div>
    </div>
  );
};

export default Categories;