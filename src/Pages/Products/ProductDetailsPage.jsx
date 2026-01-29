import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { 
  FaChevronRight, 
  FaChevronLeft, 
  FaShieldAlt 
} from "react-icons/fa";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../Api/publicAxios/axiosInstance";
import { AuthContext } from "../../Context/AuthContext";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // --- Selection State ---
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1); 

  // --- 1. Data Fetching ---
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

        // Hydrate Colors & Sizes
        if (productData.color_ids?.length > 0) {
          productData.color_ids = productData.color_ids.map(id => 
            allAttributes.colors.find(c => c._id === id)
          ).filter(Boolean);
        }

        if (productData.size_ids?.length > 0) {
          productData.size_ids = productData.size_ids.map(id => 
            allAttributes.sizes.find(s => s._id === id)
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
      toastWarning("Please select a size");
      return;
    }
    if (product.color_ids?.length > 0 && !selectedColor) {
      toastWarning("Please select a color");
      return;
    }

    try {
      if (user) {
        const payload = {
          product_id: product._id,
          quantity: quantity,
          color_id: selectedColor || null,
          size_id: selectedSize || null
        };
        await axiosInstance.post('/cart/add/', payload);
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        const localCart = JSON.parse(localStorage.getItem('zing_cart')) || [];
        const existingIndex = localCart.findIndex(item => 
          item.product_id === product._id && 
          item.attributes?.size === selectedSize &&
          item.attributes?.color === selectedColor
        );

        if (existingIndex > -1) {
          localCart[existingIndex].quantity += quantity;
        } else {
          localCart.push({
            product_id: product._id,
            quantity: quantity,
            attributes: { size: selectedSize, color: selectedColor }
          });
        }
        localStorage.setItem('zing_cart', JSON.stringify(localCart));
        window.dispatchEvent(new Event("storage"));
      }

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Added to Bag",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        background: '#ffffff',
        color: '#1A2B23',
        customClass: { popup: 'shadow-xl border border-gray-100' }
      });

    } catch (error) {
      console.error("Add to cart error:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Could not add item." });
    }
  };

  const toastWarning = (title) => {
    Swal.fire({
      icon: "info",
      title: title,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      background: '#fff',
      color: '#333'
    });
  };

  if (loading) return <LoadingScreen />;
  if (!product) return <NotFoundScreen />;

  // --- 3. Discount Calculation Logic ---
  const hasDiscount = product.discount && product.discount > 0 && product.discount < 1;
  const discountedPrice = hasDiscount ? product.price * (1 - product.discount) : product.price;
  const discountPercentage = hasDiscount ? Math.round(product.discount * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-300px)]  font-inter text-gray-800 pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link> 
          <FaChevronRight size={8} />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link> 
          <FaChevronRight size={8} />
          <span className="text-primary font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- Left Column: Images (7/12) --- */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/3] w-full bg-gray-50 rounded-xl overflow-hidden group border border-gray-100">
              
              {/* Discount Badge on Image */}
              {hasDiscount && (
                <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider rounded shadow-md animate-in fade-in zoom-in duration-300">
                  -{discountPercentage}% OFF
                </span>
              )}

              <img
                src={product.image_urls[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500"
              />
              
              {/* Navigation Arrows */}
              <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.image_urls.length - 1)}
                  className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white text-primary transition-all active:scale-95"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => setActiveImage(prev => prev < product.image_urls.length - 1 ? prev + 1 : 0)}
                  className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white text-primary transition-all active:scale-95"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.image_urls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all
                    ${activeImage === idx ? 'border-primary ring-1 ring-primary/20' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* --- Right Column: Details (5/12) --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-8">
              
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.stock > 0 ? (
                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> In Stock
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                  )}
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                  {product.name}
                </h1>

                {/* --- Price Display Section (Modified) --- */}
                <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
                  {hasDiscount ? (
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-3">
                        <p className="text-3xl font-bold text-primary">
                          Tk {discountedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <span className="text-lg text-gray-400 line-through decoration-red-400 decoration-1">
                          Tk {product.price.toLocaleString()}
                        </span>
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-red-100">
                          Save {discountPercentage}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-primary">
                      Tk {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm text-gray-600 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* Selectors */}
              <div className="space-y-6">
                
                {/* Size Selector */}
                {product.size_ids?.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-900">Select Size</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {product.size_ids.map((sizeObj, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedSize(sizeObj._id)}
                          className={`py-3 text-sm font-medium rounded-lg transition-all border
                            ${selectedSize === sizeObj._id 
                              ? 'bg-primary text-white border-primary shadow-md' 
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                        >
                          {sizeObj.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.color_ids?.length > 0 && (
                  <div>
                    <span className="text-sm font-bold text-gray-900 mb-3 block">Select Color</span>
                    <div className="flex flex-wrap gap-3">
                      {product.color_ids.map((colorObj, idx) => {
                        const isSelected = selectedColor === colorObj._id;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedColor(colorObj._id)}
                            title={colorObj.name}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`}
                            style={{ backgroundColor: colorObj.name.toLowerCase().replace(/\s+/g, '') }}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                {/* Quantity */}
                <div className="flex items-center border border-gray-300 rounded-lg h-12 w-32">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-lg"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 h-12 rounded-lg font-bold uppercase tracking-wide text-xs flex items-center justify-center gap-2 transition-all shadow-md
                    ${product.stock > 0 
                      ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {product.stock > 0 ? (
                    <>
                      <MdOutlineAddShoppingCart size={18} /> Add to Bag
                    </>
                  ) : "Sold Out"}
                </button>
              </div>

              {/* Service Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-xs text-gray-500">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaShieldAlt className="text-primary text-lg" />
                  <div>
                    <p className="font-bold text-gray-900">Secure Payment</p>
                    <p>100% Protected</p>
                  </div>
                </div>
              </div>

              {/* Admin Info */}
              {user?.role === 'admin' && (
                <div className="pt-4 border-t border-dashed border-gray-200 mt-4">
                  <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 flex justify-between items-center">
                    <span>Admin Mode: Created by <strong>{product.created_by}</strong></span>
                    <Link to={`/admin/product/edit/${product._id}`} className="underline font-bold hover:text-blue-900">Edit Product</Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-sm text-gray-400 animate-pulse uppercase tracking-widest">Loading Product...</p>
    </div>
  </div>
);

const NotFoundScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-4">
    <FaBoxOpen className="text-6xl text-gray-200 mb-4" />
    <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
    <p className="text-gray-500 mt-2">The item you are looking for might have been removed.</p>
    <Link to="/products" className="mt-6 px-6 py-2 bg-primary text-white rounded-full text-sm font-bold">Back to Shop</Link>
  </div>
);

export default ProductDetailsPage;
// import React, { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate, Link } from "react-router";
// import { 
//   FaChevronRight, 
//   FaChevronLeft, 
//   FaStar, 
//   FaTruck, 
//   FaBoxOpen, 
//   FaShieldAlt 
// } from "react-icons/fa";
// import { MdOutlineAddShoppingCart, MdExpandMore } from "react-icons/md";
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

//   // --- Selection State ---
//   const [selectedSize, setSelectedSize] = useState(null);
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [quantity, setQuantity] = useState(1); // Added Quantity State

//   // --- 1. Data Fetching ---
//   useEffect(() => {
//     const fetchProductAndHydrate = async () => {
//       setLoading(true);
//       try {
//         const [productRes, attributesRes] = await Promise.all([
//           axiosInstance.get(`products/product-details/${id}`),
//           axiosInstance.get(`products/get-attributes/`)
//         ]);

//         let productData = productRes.data.product;
//         const allAttributes = attributesRes.data;

//         // Hydrate Colors & Sizes
//         if (productData.color_ids?.length > 0) {
//           productData.color_ids = productData.color_ids.map(id => 
//             allAttributes.colors.find(c => c._id === id)
//           ).filter(Boolean);
//         }

//         if (productData.size_ids?.length > 0) {
//           productData.size_ids = productData.size_ids.map(id => 
//             allAttributes.sizes.find(s => s._id === id)
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
//     // Validation
//     if (product.size_ids?.length > 0 && !selectedSize) {
//       toastWarning("Please select a size");
//       return;
//     }
//     if (product.color_ids?.length > 0 && !selectedColor) {
//       toastWarning("Please select a color");
//       return;
//     }

//     try {
//       if (user) {
//         // Logged In
//         const payload = {
//           product_id: product._id,
//           quantity: quantity,
//           color_id: selectedColor || null,
//           size_id: selectedSize || null
//         };
//         await axiosInstance.post('/cart/add/', payload);
//       } else {
//         // Guest
//         const localCart = JSON.parse(localStorage.getItem('zing_cart')) || [];
//         const existingIndex = localCart.findIndex(item => 
//           item.product_id === product._id && 
//           item.attributes?.size === selectedSize &&
//           item.attributes?.color === selectedColor
//         );

//         if (existingIndex > -1) {
//           localCart[existingIndex].quantity += quantity;
//         } else {
//           localCart.push({
//             product_id: product._id,
//             quantity: quantity,
//             attributes: { size: selectedSize, color: selectedColor }
//           });
//         }
//         localStorage.setItem('zing_cart', JSON.stringify(localCart));
//         window.dispatchEvent(new Event("storage"));
//       }

//       Swal.fire({
//         position: "top-end",
//         icon: "success",
//         title: "Added to Bag",
//         showConfirmButton: false,
//         timer: 1500,
//         toast: true,
//         background: '#ffffff',
//         color: '#1A2B23',
//         customClass: { popup: 'shadow-xl border border-gray-100' }
//       });

//     } catch (error) {
//       console.error("Add to cart error:", error);
//       Swal.fire({ icon: "error", title: "Error", text: "Could not add item." });
//     }
//   };

//   const toastWarning = (title) => {
//     Swal.fire({
//       icon: "info",
//       title: title,
//       toast: true,
//       position: "top-end",
//       showConfirmButton: false,
//       timer: 3000,
//       background: '#fff',
//       color: '#333'
//     });
//   };

//   if (loading) return <LoadingScreen />;
//   if (!product) return <NotFoundScreen />;

//   return (
//     <div className="min-h-screen bg-white font-inter text-gray-800 pt-6 pb-20">
//       <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
//         {/* Breadcrumb */}
//         <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
//           <Link to="/" className="hover:text-primary transition-colors">Home</Link> 
//           <FaChevronRight size={8} />
//           <Link to="/products" className="hover:text-primary transition-colors">Products</Link> 
//           <FaChevronRight size={8} />
//           <span className="text-primary font-semibold">{product.name}</span>
//         </nav>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
//           {/* --- Left Column: Images (7/12) --- */}
//           <div className="lg:col-span-7 space-y-4">
//             {/* Main Image */}
//             <div className="relative aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/3] w-full bg-gray-50 rounded-xl overflow-hidden group border border-gray-100">
//               <img
//                 src={product.image_urls[activeImage]}
//                 alt={product.name}
//                 className="w-full h-full object-cover object-center transition-transform duration-500"
//               />
              
//               {/* Navigation Arrows */}
//               <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
//                 <button 
//                   onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.image_urls.length - 1)}
//                   className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white text-primary transition-all active:scale-95"
//                 >
//                   <FaChevronLeft size={14} />
//                 </button>
//                 <button 
//                   onClick={() => setActiveImage(prev => prev < product.image_urls.length - 1 ? prev + 1 : 0)}
//                   className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white text-primary transition-all active:scale-95"
//                 >
//                   <FaChevronRight size={14} />
//                 </button>
//               </div>
//             </div>

//             {/* Thumbnails */}
//             <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
//               {product.image_urls.map((url, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setActiveImage(idx)}
//                   className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all
//                     ${activeImage === idx ? 'border-primary ring-1 ring-primary/20' : 'border-transparent hover:border-gray-300'}`}
//                 >
//                   <img src={url} className="w-full h-full object-cover" alt="" />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* --- Right Column: Details (5/12) --- */}
//           <div className="lg:col-span-5">
//             <div className="sticky top-24 space-y-8">
              
//               {/* Header Info */}
//               <div>
//                 <div className="flex items-center gap-2 mb-2">
                  
//                   {product.stock > 0 ? (
//                     <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
//                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> In Stock
//                     </span>
//                   ) : (
//                     <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
//                   )}
//                 </div>
                
//                 <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
//                   {product.name}
//                 </h1>

//                 <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
//                   <p className="text-2xl font-bold text-primary">
//                     Tk {product.price.toLocaleString()}
//                   </p>
                  
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="prose prose-sm text-gray-600 leading-relaxed">
//                 <p>{product.description}</p>
//               </div>

//               {/* Selectors */}
//               <div className="space-y-6">
                
//                 {/* Size Selector */}
//                 {product.size_ids?.length > 0 && (
//                   <div>
//                     <div className="flex justify-between items-center mb-3">
//                       <span className="text-sm font-bold text-gray-900">Select Size</span>
                      
//                     </div>
//                     <div className="grid grid-cols-4 gap-2">
//                       {product.size_ids.map((sizeObj, idx) => (
//                         <button 
//                           key={idx} 
//                           onClick={() => setSelectedSize(sizeObj._id)}
//                           className={`py-3 text-sm font-medium rounded-lg transition-all border
//                             ${selectedSize === sizeObj._id 
//                               ? 'bg-primary text-white border-primary shadow-md' 
//                               : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
//                         >
//                           {sizeObj.name}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Color Selector */}
//                 {product.color_ids?.length > 0 && (
//                   <div>
//                     <span className="text-sm font-bold text-gray-900 mb-3 block">Select Color</span>
//                     <div className="flex flex-wrap gap-3">
//                       {product.color_ids.map((colorObj, idx) => {
//                         const isSelected = selectedColor === colorObj._id;
//                         return (
//                           <button
//                             key={idx}
//                             onClick={() => setSelectedColor(colorObj._id)}
//                             title={colorObj.name}
//                             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`}
//                             style={{ backgroundColor: colorObj.name.toLowerCase().replace(/\s+/g, '') }}
//                           >
//                             {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-4 pt-4">
//                 {/* Quantity */}
//                 <div className="flex items-center border border-gray-300 rounded-lg h-12 w-32">
//                   <button 
//                     onClick={() => setQuantity(q => Math.max(1, q - 1))}
//                     className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-lg"
//                   >
//                     -
//                   </button>
//                   <span className="flex-1 text-center font-bold text-gray-900">{quantity}</span>
//                   <button 
//                     onClick={() => setQuantity(q => q + 1)}
//                     className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-lg"
//                   >
//                     +
//                   </button>
//                 </div>

//                 <button 
//                   onClick={handleAddToCart}
//                   disabled={product.stock === 0}
//                   className={`flex-1 h-12 rounded-lg font-bold uppercase tracking-wide text-xs flex items-center justify-center gap-2 transition-all shadow-md
//                     ${product.stock > 0 
//                       ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]' 
//                       : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
//                 >
//                   {product.stock > 0 ? (
//                     <>
//                       <MdOutlineAddShoppingCart size={18} /> Add to Bag
//                     </>
//                   ) : "Sold Out"}
//                 </button>
//               </div>

//               {/* Service Features */}
//               <div className="grid grid-cols-2 gap-4 pt-6 text-xs text-gray-500">
                
//                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                   <FaShieldAlt className="text-primary text-lg" />
//                   <div>
//                     <p className="font-bold text-gray-900">Secure Payment</p>
//                     <p>100% Protected</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Admin Info */}
//               {user?.role === 'admin' && (
//                 <div className="pt-4 border-t border-dashed border-gray-200 mt-4">
//                   <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 flex justify-between items-center">
//                     <span>Admin Mode: Created by <strong>{product.created_by}</strong></span>
//                     <Link to={`/admin/product/edit/${product._id}`} className="underline font-bold hover:text-blue-900">Edit Product</Link>
//                   </div>
//                 </div>
//               )}

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Helper Components ---
// const LoadingScreen = () => (
//   <div className="min-h-screen flex items-center justify-center bg-white">
//     <div className="flex flex-col items-center gap-4">
//       <span className="loading loading-spinner loading-lg text-primary"></span>
//       <p className="text-sm text-gray-400 animate-pulse uppercase tracking-widest">Loading Product...</p>
//     </div>
//   </div>
// );

// const NotFoundScreen = () => (
//   <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-4">
//     <FaBoxOpen className="text-6xl text-gray-200 mb-4" />
//     <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
//     <p className="text-gray-500 mt-2">The item you are looking for might have been removed.</p>
//     <Link to="/products" className="mt-6 px-6 py-2 bg-primary text-white rounded-full text-sm font-bold">Back to Shop</Link>
//   </div>
// );

// export default ProductDetailsPage;
