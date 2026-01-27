import React, { useEffect, useState } from 'react'
import HeroBanner from '../../Components/Home/HeroBanner/HeroBanner'
import CategorySection from '../../Components/Home/CategorySection/CategorySection'
import LatestProductSection from '../../Components/Home/LatestProductsSection/LatestProductSection'
import axiosInstance from '../../Api/publicAxios/axiosInstance'
 

const Home = () => {
  const [data, setData] = useState({
    banners: [],
    categories: [],
    products: [],
    loading: true
  });
  

  useEffect( () => {
    const fetchHomeData = async () => {
      try {
        // Use Promise.all to fetch everything in parallel for maximum speed
        const [bannerRes, categoryRes, productRes] = await Promise.all([
          axiosInstance.get("banner/search/"),
          axiosInstance.get("products/get-attributes/"),
          axiosInstance.get("products/search-products?limit=4")
        ]);
        console.log(productRes.data.results )
        // "Batch" the state update into one single call to avoid cascading renders
        setData({
          banners: bannerRes.data.banners || [],
          categories: categoryRes.data.categories || [],
          products: productRes.data.results || [],
          loading: false
        });
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchHomeData();
    }, []);
  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }  
  return (
    <>            
        <HeroBanner banners={data.banners}/>
        <CategorySection categories={data.categories}/>
        <LatestProductSection products={data.products}/>
    </>
  )
}

export default Home
