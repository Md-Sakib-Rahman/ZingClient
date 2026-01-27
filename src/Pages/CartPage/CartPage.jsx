import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router"; // Ensure consistent import from 'react-router-dom'
import { FaTrash, FaArrowRight, FaMinus, FaPlus } from "react-icons/fa";
import { AuthContext } from "../../Context/AuthContext"; 
import axiosInstance from "../../Api/publicAxios/axiosInstance";
import Swal from "sweetalert2";

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState({ subtotal: 0, shipping: 0, total: 0 });

  // --- 1. Fetching & Hydration Logic ---
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        // Step A: Fetch Global Attributes (to map IDs -> Names like "Red", "XL")
        const attributesRes = await axiosInstance.get("products/get-attributes/");
        const { colors, sizes } = attributesRes.data;

        let rawItems = [];

        // Step B: Get the raw cart list (IDs only)
        if (user) {
          // SCENARIO: Logged In User
          const res = await axiosInstance.get("cart/");
          rawItems = res.data.items || [];
        } else {
          // SCENARIO: Guest
          rawItems = JSON.parse(localStorage.getItem("zing_cart")) || [];
        }

        // Step C: Hydrate items with Product Details
        if (rawItems.length > 0) {
          const hydratedItems = await Promise.all(
            rawItems.map(async (item) => {
              try {
                // 1. Fetch the full product details (Images, Name, Current Price)
                const productRes = await axiosInstance.get(`products/product-details/${item.product_id}`);
                
                // 2. Resolve Attribute Names (Match ID to Global List)
                // Handle Guest (item.attributes.color) vs User (item.color_id)
                const colorId = item.color_id || item.attributes?.color;
                const sizeId = item.size_id || item.attributes?.size;

                const resolvedColor = colors.find(c => c._id === colorId);
                const resolvedSize = sizes.find(s => s._id === sizeId);

                // 3. Return the fully formed object
                return {
                  ...item, // Keeps _id, quantity, etc.
                  product: productRes.data.product, // Adds name, image_urls, price
                  color: resolvedColor, // Adds { name: "Red", ... }
                  size: resolvedSize    // Adds { name: "XL", ... }
                };
              } catch (err) {
                console.error("Failed to load product", item.product_id);
                return null; // Skip invalid items
              }
            })
          );
          setCartItems(hydratedItems.filter(Boolean));
        } else {
          setCartItems([]);
        }

      } catch (err) {
        console.error("Cart fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  // --- 2. Totals Calculation ---
  useEffect(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      // Safety check: item.product might be missing if hydration failed
      const price = item.product?.price || 0;
      return acc + (price * item.quantity);
    }, 0);
    
    const shipping = subtotal > 200 ? 0 : 25; 
    
    setOrderSummary({
      subtotal,
      shipping: subtotal === 0 ? 0 : shipping,
      total: subtotal + (subtotal === 0 ? 0 : shipping)
    });
  }, [cartItems]);

  // --- 3. Update Quantity ---
  const handleQuantityChange = async (index, newQty) => {
    if (newQty < 1) return;

    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQty;
    setCartItems(updatedItems);

    const itemToUpdate = updatedItems[index];

    if (user) {
      // API Call: PUT /cart/update-quantity/
      try {
        await axiosInstance.put(`cart/update-quantity/`, { 
          item_id: itemToUpdate.item_id || itemToUpdate._id, // Ensure we use the Cart Item ID
          quantity: newQty 
        });
      } catch (err) {
        console.error("Update failed", err);
      }
    } else {
      // Guest: Update LocalStorage
      const localCart = updatedItems.map(item => ({
        product_id: item.product_id || item.product._id,
        quantity: item.quantity,
        attributes: item.attributes
      }));
      localStorage.setItem("zing_cart", JSON.stringify(localCart));
    }
  };


  // --- 4. Remove Item (Fixed) ---
  // const handleRemoveItem = async (index) => {
  //   const itemToRemove = cartItems[index];
  //   // Ensure we get the correct ID
  //   const itemIdToSend = itemToRemove.item_id || itemToRemove._id;

  //   if (!itemIdToSend) {
  //     return Swal.fire("Error", "Could not find Item ID. Refresh the page.", "error");
  //   }

  //   if (user) {
  //     try {
  //       console.log("Deleting Item ID:", itemIdToSend);

  //       // FIX: Send ID in the URL, not the body
  //       // Matches Backend: remove_cart_item(request, item_id)
  //       await axiosInstance.delete(`cart/remove-item/${itemIdToSend}/`);

  //       // Update UI only on success
  //       const updatedItems = cartItems.filter((_, i) => i !== index);
  //       setCartItems(updatedItems);
        
  //       Swal.fire({
  //           icon: 'success',
  //           title: 'Removed',
  //           toast: true,
  //           position: 'top-end',
  //           showConfirmButton: false,
  //           timer: 2000
  //       });

  //     } catch (err) {
  //       console.error("Remove failed:", err);
  //       const msg = err.response?.data?.error || "Failed to remove item.";
  //       Swal.fire("Error", msg, "error");
  //     }
  //   } else {
  //     // Guest Logic (LocalStorage) - Remains unchanged
  //     const updatedItems = cartItems.filter((_, i) => i !== index);
  //     setCartItems(updatedItems);
      
  //     const localCart = JSON.parse(localStorage.getItem("zing_cart")) || [];
  //     const newLocalCart = localCart.filter(item => {
  //       const isSameProduct = item.product_id === (itemToRemove.product_id || itemToRemove.product._id);
  //       const isSameSize = item.attributes?.size === (itemToRemove.size?._id || itemToRemove.attributes?.size);
  //       const isSameColor = item.attributes?.color === (itemToRemove.color?._id || itemToRemove.attributes?.color);
  //       return !(isSameProduct && isSameSize && isSameColor);
  //     });
  //     localStorage.setItem("zing_cart", JSON.stringify(newLocalCart));
  //   }
  // };

  // --- 4. Remove Item (Fixed for Guest) ---
  const handleRemoveItem = async (index) => {
    const itemToRemove = cartItems[index];

    // SCENARIO A: Logged In User
    if (user) {
      // 1. Get the ID strictly for the backend
      const itemIdToSend = itemToRemove.item_id || itemToRemove._id;

      // 2. Validation ONLY for logged-in users
      if (!itemIdToSend) {
        return Swal.fire("Error", "Could not find Item ID. Refresh the page.", "error");
      }

      try {
        await axiosInstance.delete(`cart/remove-item/${itemIdToSend}/`);

        // Update UI
        const updatedItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedItems);
        
        Swal.fire({
            icon: 'success', title: 'Removed', toast: true,
            position: 'top-end', showConfirmButton: false, timer: 2000
        });
      } catch (err) {
        console.error("Remove failed:", err);
        Swal.fire("Error", "Failed to remove item.", "error");
      }
    } 
    
    // SCENARIO B: Guest (No ID needed, just remove by index/matching)
    else {
      // 1. Update UI State immediately
      const updatedItems = cartItems.filter((_, i) => i !== index);
      setCartItems(updatedItems);
      
      // 2. Update LocalStorage
      // We read the raw data, remove the item at the specific index, and save back.
      const localCart = JSON.parse(localStorage.getItem("zing_cart")) || [];
      
      // Using splice is safer than filtering by ID for guests because 
      // guests might have duplicate products with different attributes
      if (index >= 0 && index < localCart.length) {
        localCart.splice(index, 1); 
        localStorage.setItem("zing_cart", JSON.stringify(localCart));
        
        // Trigger event so Navbar updates count
        window.dispatchEvent(new Event("storage"));
        
        Swal.fire({
          icon: 'success', title: 'Removed', toast: true,
          position: 'top-end', showConfirmButton: false, timer: 2000
      });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 font-inter pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Shopping Bag</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary/50 mt-2">
            {cartItems.length} Items
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-t border-b border-accent/20">
            <p className="text-primary/40 italic mb-6">Your bag is currently empty.</p>
            <Link to="/products" className="px-8 py-3 bg-primary text-white text-[10px] uppercase tracking-widest font-bold hover:bg-primary/90 transition-all">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Cart Items List */}
            <div className="flex-1 space-y-6">
              {cartItems.map((item, idx) => {
                // Safe Accessors
                const productName = item.product?.name || "Loading Product...";
                const productImage = item.product?.image_urls?.[0];
                const productPrice = item.product?.price || 0;
                
                // Display Names (Resolved from Hydration)
                const sizeName = item.size?.name || "N/A";
                const colorName = item.color?.name || "N/A";

                return (
                  <div key={idx} className="flex gap-6 py-6 border-b border-accent/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Image */}
                    <div className="w-24 h-32 bg-accent/10 rounded-sm overflow-hidden flex-shrink-0">
                      {productImage && (
                        <img 
                          src={productImage} 
                          alt={productName} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-primary tracking-wide">
                            <Link to={`/products/${item.product_id}`} className="hover:underline">
                              {productName}
                            </Link>
                          </h3>
                          <p className="text-sm font-serif italic text-primary font-bold">
                            ${(productPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Dynamic Attributes Display */}
                        <div className="mt-2 text-[10px] uppercase tracking-widest text-primary/50 space-y-1">
                          {item.size && <p>Size: {sizeName}</p>}
                          {item.color && <p>Color: {colorName}</p>}
                          <p>${productPrice} each</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-accent/20 rounded-sm h-8">
                          <button 
                            onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
                          >
                            <FaMinus size={8} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-primary">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
                          >
                            <FaPlus size={8} />
                          </button>
                        </div>

                        <button 
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[9px] uppercase tracking-widest text-error/60 hover:text-error flex items-center gap-1 transition-colors"
                        >
                          <FaTrash size={10} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Panel */}
            <div className="lg:w-96">
              <div className="bg-white p-8 rounded-sm border border-accent/20 sticky top-24">
                <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6 pb-4 border-b border-accent/10">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm text-primary/70">
                    <span>Subtotal</span>
                    <span>${orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary/70">
                    <span>Shipping Estimate</span>
                    <span>
                      {orderSummary.shipping === 0 ? (
                        <span className="text-secondary font-bold text-[10px] uppercase tracking-widest">Free</span>
                      ) : (
                        `$${orderSummary.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6 border-t border-accent/10 mb-8">
                  <span className="text-sm font-bold text-primary">Total</span>
                  <span className="text-2xl font-serif italic text-primary font-bold">
                    ${orderSummary.total.toFixed(2)}
                  </span>
                </div>

                <button 
                  onClick={() => navigate(user ? "/checkout" : "/login?redirect=checkout")}
                  className="w-full bg-primary text-white py-4 text-[11px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all group"
                >
                  {user ? "Proceed to Checkout" : "Login to Checkout"}
                  <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[9px] text-center text-primary/30 mt-4 leading-relaxed">
                  Taxes and shipping calculated at checkout. <br/>
                  Secure SSL Encryption.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
