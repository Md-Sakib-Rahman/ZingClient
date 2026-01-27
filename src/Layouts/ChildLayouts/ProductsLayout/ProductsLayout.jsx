import React from "react";
import ProductPage from "../../../Pages/Products/ProductPage";
import CatButtonContainer from "../../../Components/Products/CatButtonContainer/CatButtonContainer";
import { Outlet } from "react-router";

const ProductsLayout = () => {
  return (
    <div className="min-h-[calc(100vh-340px)] pt-10">
      {/* <ProductPage/> */}
       
        <CatButtonContainer/>
       
      <Outlet/> 
    </div>
  );
};

export default ProductsLayout;
