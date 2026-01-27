import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { FaRegHeart, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../Api/publicAxios/axiosInstance";
import { AuthContext } from "../../Context/AuthContext";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // user can be null!
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // --- Selection State (Stores IDs) ---
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // --- 1. Data Fetching & Hydration ---
  useEffect(() => {
    const fetchProductAndHydrate = async () => {
      setLoading(true);
      try {
        const [productRes, attributesRes] = await Promise.all([
          axiosInstance.get(`products/product-details/${id}`),
          axiosInstance.get(`products/get-attributes/`)
        ]);

        let productData = productRes.data.product;
        const allAttributes = attributesRes.data;

        if (productData.color_ids && productData.color_ids.length > 0) {
          productData.color_ids = productData.color_ids.map(id => 
            allAttributes.colors.find(globalColor => globalColor._id === id)
          ).filter(Boolean);
        }

        if (productData.size_ids && productData.size_ids.length > 0) {
          productData.size_ids = productData.size_ids.map(id => 
            allAttributes.sizes.find(globalSize => globalSize._id === id)
          ).filter(Boolean);
        }

        setProduct(productData);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndHydrate();
  }, [id]);

  // --- 2. Cart Handler ---
  const handleAddToCart = async () => {
    if (product.size_ids?.length > 0 && !selectedSize) {
      Swal.fire({
        icon: "warning",
        title: "Please select a size",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: '#F9F7F2',
        color: '#1A2B23'
      });
      return;
    }

    if (product.color_ids?.length > 0 && !selectedColor) {
      Swal.fire({
        icon: "warning",
        title: "Please select a color",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: '#F9F7F2',
        color: '#1A2B23'
      });
      return;
    }

    try {
      if (user) {
        const payload = {
          product_id: product._id,
          quantity: 1,
          color_id: selectedColor || null,
          size_id: selectedSize || null
        };
        await axiosInstance.post('/cart/add/', payload);
      } else {
        const localCart = JSON.parse(localStorage.getItem('zing_cart')) || [];
        const existingIndex = localCart.findIndex(item => 
          item.product_id === product._id && 
          item.attributes?.size === selectedSize &&
          item.attributes?.color === selectedColor
        );

        if (existingIndex > -1) {
          localCart[existingIndex].quantity += 1;
        } else {
          localCart.push({
            product_id: product._id,
            quantity: 1,
            attributes: {
              size: selectedSize,
              color: selectedColor
            }
          });
        }

        localStorage.setItem('zing_cart', JSON.stringify(localCart));
        window.dispatchEvent(new Event("storage"));
      }

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Added to Shopping Bag",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        background: '#F9F7F2',
        color: '#1A2B23'
      });

    } catch (error) {
      console.error("Add to cart error:", error);
      Swal.fire({
        icon: "error",
        title: "Could not add item",
        text: "Please try again later.",
        confirmButtonColor: "#1A2B23",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary/40 italic">
        Product not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 font-inter pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/40 mb-10">
          <span>Home</span> <FaChevronRight size={8} />
          <span>Shop</span> <FaChevronRight size={8} />
          <span className="text-primary font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/3] overflow-hidden bg-accent/10 rounded-sm group">
              <img
                src={product.image_urls[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700"
              />
              <button 
                onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.image_urls.length - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <FaChevronLeft size={14} />
              </button>
              <button 
                onClick={() => setActiveImage(prev => prev < product.image_urls.length - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {product.image_urls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-[3/4] overflow-hidden border transition-all ${activeImage === idx ? 'border-secondary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="border-b border-accent/20 pb-6 mb-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-secondary font-bold mb-1">
                {product.gender} • {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-primary italic">
                Tk {product.price.toFixed(2)}
              </p>
            </div>

            <div className="space-y-8 mb-10">
              <div className="bg-secondary/40 rounded-2xl py-4 px-2">
                <p className="text-sm text-primary/70 leading-relaxed font-sans">
                {product.description}
              </p>
              </div>

              {/* Dynamic Size Selection */}
              {product.size_ids && product.size_ids.length > 0 && (
                <div className="bg-secondary/40 rounded-2xl py-4 px-2">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-primary mb-4">
                    Select Size
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {product.size_ids.map((sizeObj, idx) => {
                      const label = sizeObj.name || "N/A";
                      const value = sizeObj._id;
                      const isSelected = selectedSize === value;
                      
                      return (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedSize(value)}
                          className={`min-w-[3rem] px-4 h-12 flex items-center justify-center border text-xs font-bold transition-all rounded-2xl uppercase
                            ${isSelected 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-transparent text-primary border-primary/30 hover:border-primary'
                            }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Color Selection */}
              {product.color_ids && product.color_ids.length > 0 && (
                <div className="bg-secondary/40 rounded-2xl py-4 px-3">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-primary mb-4">
                    Select Color: 
                    <span className="text-secondary normal-case tracking-normal ml-2 font-medium">
                      {selectedColor && product.color_ids.find(c => c._id === selectedColor)?.name}
                    </span>
                  </h4>
                  
                  <div className="flex flex-wrap gap-3">
                    {product.color_ids.map((colorObj, idx) => {
                      const colorName = colorObj.name || "gray"; 
                      const colorId = colorObj._id; 
                      const isSelected = selectedColor === colorId;

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(colorId)}
                          title={colorName}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                            ${isSelected 
                              ? 'ring-1 ring-primary ring-offset-2 scale-110' 
                              : 'hover:scale-110 hover:opacity-80'
                            }`}
                        >
                          <span 
                            className="w-full h-full rounded-full border border-primary/10 shadow-sm"
                            style={{ 
                              backgroundColor: colorName.toLowerCase().replace(/\s+/g, '') 
                            }} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-5 text-[11px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 transition-all group
                  ${product.stock > 0 
                    ? 'bg-primary text-white hover:bg-primary/95' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {product.stock > 0 ? (
                  <>
                    <MdOutlineAddShoppingCart size={18} />
                    Add to Shopping Bag
                    <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  "Sold Out"
                )}
              </button>
            </div>

            {/* Extra Info - FIX: Added Optional Chaining here */}
            {
              user?.role === 'admin' && ( // <--- user?.role instead of user.role
                <div className="mt-12 pt-8 border-t border-accent/10 space-y-4">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-primary/40">
                    <span>Created By</span>
                    <span className="text-primary">{product.created_by}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-primary/40">
                    <span>Shipping</span>
                    <span className="text-primary">Free Standard Delivery</span>
                  </div>
                </div>
              )
            }
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;


// import React, { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate } from "react-router";
// import { FaRegHeart, FaChevronRight, FaChevronLeft } from "react-icons/fa";
// import { MdOutlineAddShoppingCart } from "react-icons/md";
// import Swal from "sweetalert2";
// import axiosInstance from "../../Api/publicAxios/axiosInstance";
// import { AuthContext } from "../../Context/AuthContext";

// const ProductDetailsPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
  
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeImage, setActiveImage] = useState(0);

//   // --- Selection State (Stores IDs) ---
//   const [selectedSize, setSelectedSize] = useState(null);
//   const [selectedColor, setSelectedColor] = useState(null);

//   // --- 1. Data Fetching & Hydration ---
//   useEffect(() => {
//     const fetchProductAndHydrate = async () => {
//       setLoading(true);
//       try {
//         // Parallel Fetch: Get Product Details AND All Global Attributes
//         const [productRes, attributesRes] = await Promise.all([
//           axiosInstance.get(`products/product-details/${id}`),
//           axiosInstance.get(`products/get-attributes/`)
//         ]);

//         let productData = productRes.data.product;
//         const allAttributes = attributesRes.data; // { colors: [], sizes: [], ... }

//         // Hydrate Colors: Match IDs in product to full objects in global list
//         if (productData.color_ids && productData.color_ids.length > 0) {
//           productData.color_ids = productData.color_ids.map(id => 
//             allAttributes.colors.find(globalColor => globalColor._id === id)
//           ).filter(Boolean); // Remove undefined if id not found
//         }

//         // Hydrate Sizes: Match IDs in product to full objects in global list
//         if (productData.size_ids && productData.size_ids.length > 0) {
//           productData.size_ids = productData.size_ids.map(id => 
//             allAttributes.sizes.find(globalSize => globalSize._id === id)
//           ).filter(Boolean);
//         }

//         setProduct(productData);

//       } catch (err) {
//         console.error("Error fetching data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductAndHydrate();
//   }, [id]);

//   // --- 2. Cart Handler ---
//   const handleAddToCart = async () => {
//     // Validation: Ensure Size is selected if available
//     if (product.size_ids?.length > 0 && !selectedSize) {
//       Swal.fire({
//         icon: "warning",
//         title: "Please select a size",
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 3000,
//         background: '#F9F7F2',
//         color: '#1A2B23'
//       });
//       return;
//     }

//     // Validation: Ensure Color is selected if available
//     if (product.color_ids?.length > 0 && !selectedColor) {
//       Swal.fire({
//         icon: "warning",
//         title: "Please select a color",
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 3000,
//         background: '#F9F7F2',
//         color: '#1A2B23'
//       });
//       return;
//     }

//     try {
//       if (user) {
//         // SCENARIO A: Logged In -> Send to Backend (Flat Structure)
//         // Payload matches your API requirement: { product_id, color_id, size_id, quantity }
//         const payload = {
//           product_id: product._id,
//           quantity: 1,
//           color_id: selectedColor || null,
//           size_id: selectedSize || null
//         };
        
//         await axiosInstance.post('/cart/add/', payload);

//       } else {
//         // SCENARIO B: Guest -> Save to LocalStorage
//         const localCart = JSON.parse(localStorage.getItem('zing_cart')) || [];
        
//         // Check if exact variant exists
//         const existingIndex = localCart.findIndex(item => 
//           item.product_id === product._id && 
//           item.attributes?.size === selectedSize &&
//           item.attributes?.color === selectedColor
//         );

//         if (existingIndex > -1) {
//           localCart[existingIndex].quantity += 1;
//         } else {
//           localCart.push({
//             product_id: product._id,
//             quantity: 1,
//             attributes: {
//               size: selectedSize,
//               color: selectedColor
//             }
//           });
//         }

//         localStorage.setItem('zing_cart', JSON.stringify(localCart));
//         window.dispatchEvent(new Event("storage")); // Trigger Navbar update
//       }

//       // Success Feedback
//       Swal.fire({
//         position: "top-end",
//         icon: "success",
//         title: "Added to Shopping Bag",
//         showConfirmButton: false,
//         timer: 1500,
//         toast: true,
//         background: '#F9F7F2',
//         color: '#1A2B23'
//       });

//     } catch (error) {
//       console.error("Add to cart error:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Could not add item",
//         text: "Please try again later.",
//         confirmButtonColor: "#1A2B23",
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-base-100">
//         <span className="loading loading-spinner loading-lg text-primary"></span>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-primary/40 italic">
//         Product not found.
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-base-100 font-inter pt-10 pb-20">
//       <div className="max-w-7xl mx-auto px-4 md:px-8">
        
//         {/* Breadcrumb */}
//         <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/40 mb-10">
//           <span>Home</span> <FaChevronRight size={8} />
//           <span>Shop</span> <FaChevronRight size={8} />
//           <span className="text-primary font-bold">{product.name}</span>
//         </nav>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
//           {/* Left: Image Gallery */}
//           <div className="space-y-4">
//             <div className="relative aspect-[3/3] overflow-hidden bg-accent/10 rounded-sm group">
//               <img
//                 src={product.image_urls[activeImage]}
//                 alt={product.name}
//                 className="w-full h-full object-cover transition-transform duration-700"
//               />
//               {/* Navigation Arrows */}
//               <button 
//                 onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.image_urls.length - 1)}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
//               >
//                 <FaChevronLeft size={14} />
//               </button>
//               <button 
//                 onClick={() => setActiveImage(prev => prev < product.image_urls.length - 1 ? prev + 1 : 0)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
//               >
//                 <FaChevronRight size={14} />
//               </button>
//             </div>
            
//             {/* Thumbnails */}
//             <div className="grid grid-cols-4 gap-4">
//               {product.image_urls.map((url, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setActiveImage(idx)}
//                   className={`aspect-[3/4] overflow-hidden border transition-all ${activeImage === idx ? 'border-secondary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
//                 >
//                   <img src={url} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Right: Product Info */}
//           <div className="flex flex-col">
//             <div className="border-b border-accent/20 pb-6 mb-4">
//               <p className="text-[11px] uppercase tracking-[0.3em] text-secondary font-bold mb-1">
//                 {product.gender} • {product.stock > 0 ? "In Stock" : "Out of Stock"}
//               </p>
//               <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-2">
//                 {product.name}
//               </h1>
//               <p className="text-2xl font-bold text-primary italic">
//                 Tk {product.price.toFixed(2)}
//               </p>
//             </div>

//             <div className="space-y-8 mb-10">
//               <div className="bg-secondary/40 rounded-2xl py-4 px-2">
//                 <p className="text-sm text-primary/70 leading-relaxed font-sans">
//                 {product.description}
//               </p>
//               </div>

//               {/* Dynamic Size Selection */}
//               {product.size_ids && product.size_ids.length > 0 && (
//                 <div className="bg-secondary/40 rounded-2xl py-4 px-2">
//                   <h4 className="text-[10px] uppercase tracking-widest font-bold text-primary mb-4">
//                     Select Size
//                   </h4>
//                   <div className="flex flex-wrap gap-3">
//                     {product.size_ids.map((sizeObj, idx) => {
//                       const label = sizeObj.name || "N/A";
//                       const value = sizeObj._id;
//                       const isSelected = selectedSize === value;
                      
//                       return (
//                         <button 
//                           key={idx} 
//                           onClick={() => setSelectedSize(value)}
//                           className={`min-w-[3rem] px-4 h-12 flex items-center justify-center border text-xs font-bold transition-all rounded-2xl uppercase
//                             ${isSelected 
//                               ? 'bg-primary text-white border-primary' 
//                               : 'bg-transparent text-primary border-primary/30 hover:border-primary'
//                             }`}
//                         >
//                           {label}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Dynamic Color Selection */}
//               {product.color_ids && product.color_ids.length > 0 && (
//                 <div className="bg-secondary/40 rounded-2xl py-4 px-3">
//                   <h4 className="text-[10px] uppercase tracking-widest font-bold text-primary mb-4">
//                     Select Color: 
//                     <span className="text-secondary normal-case tracking-normal ml-2 font-medium">
//                       {selectedColor && product.color_ids.find(c => c._id === selectedColor)?.name}
//                     </span>
//                   </h4>
                  
//                   <div className="flex flex-wrap gap-3">
//                     {product.color_ids.map((colorObj, idx) => {
//                       const colorName = colorObj.name || "gray"; 
//                       const colorId = colorObj._id; 
//                       const isSelected = selectedColor === colorId;

//                       return (
//                         <button
//                           key={idx}
//                           onClick={() => setSelectedColor(colorId)}
//                           title={colorName}
//                           className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
//                             ${isSelected 
//                               ? 'ring-1 ring-primary ring-offset-2 scale-110' 
//                               : 'hover:scale-110 hover:opacity-80'
//                             }`}
//                         >
//                           <span 
//                             className="w-full h-full rounded-full border border-primary/10 shadow-sm"
//                             style={{ 
//                               // CSS safe color name (lowercase, no spaces)
//                               backgroundColor: colorName.toLowerCase().replace(/\s+/g, '') 
//                             }} 
//                           />
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Actions */}
//             <div className="flex flex-col sm:flex-row gap-4 pt-6">
//               <button 
//                 onClick={handleAddToCart}
//                 disabled={product.stock === 0}
//                 className={`flex-1 py-5 text-[11px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 transition-all group
//                   ${product.stock > 0 
//                     ? 'bg-primary text-white hover:bg-primary/95' 
//                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
//               >
//                 {product.stock > 0 ? (
//                   <>
//                     <MdOutlineAddShoppingCart size={18} />
//                     Add to Shopping Bag
//                     <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
//                   </>
//                 ) : (
//                   "Sold Out"
//                 )}
//               </button>
              
              
//             </div>

//             {/* Extra Info */}
//             {
//               user.role === 'admin' && (
//                 <div className="mt-12 pt-8 border-t border-accent/10 space-y-4">
//               <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-primary/40">
//                 <span>Created By</span>
//                 <span className="text-primary">{product.created_by}</span>
//               </div>
//               <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-primary/40">
//                 <span>Shipping</span>
//                 <span className="text-primary">Free Standard Delivery</span>
//               </div>
//             </div>
//               )
//             }
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetailsPage;


