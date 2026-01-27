import React, { useEffect } from 'react'
import CategoryButton from '../CategoryButtons/CategoryButton'
import axiosInstance from '../../../Api/publicAxios/axiosInstance';

const CatButtonContainer = () => {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState([]);
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
  },[])
  if(loading){
    return <div>Loading...</div>
  }
  if(categories.length === 0){
    return <div>No Categories Found</div>
  }
  return (
    <div className='flex gap-4 justify-center items-center flex-wrap  w-full'>
      {
        categories.map((category) => (
          <CategoryButton key={category} category={category}/>
        ))
      }
       
    </div>

  )
}

export default CatButtonContainer
