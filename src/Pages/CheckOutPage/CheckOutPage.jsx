import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router"; 
import { FaLock, FaMoneyBillWave, FaPhoneAlt, FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { AuthContext } from "../../Context/AuthContext"; 
import axiosInstance from "../../Api/publicAxios/axiosInstance";

const CheckOutPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // --- State ---
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trxId, setTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState({ subtotal: 0, shipping: 0, total: 0 });

  // --- 1. Fetch & Hydrate Cart Logic ---
  useEffect(() => {
    // If not logged in, force login
    if (!loading && !user) {
      navigate("/login?redirect=checkout");
      return;
    }

    const fetchCartData = async () => {
      setLoading(true);
      try {
        // A. Fetch Global Attributes
        const attributesRes = await axiosInstance.get("products/get-attributes/");
        const { colors, sizes } = attributesRes.data;

        // B. Fetch Raw Cart Items
        const cartRes = await axiosInstance.get("cart/");
        const rawItems = cartRes.data.items || [];

        if (rawItems.length === 0) {
            Swal.fire("Cart is Empty", "Please add items before checking out.", "info");
            navigate("/products");
            return;
        }

        // C. Hydrate Items with Product Details
        const hydratedItems = await Promise.all(
          rawItems.map(async (item) => {
            try {
              const productRes = await axiosInstance.get(`products/product-details/${item.product_id}`);
              
              const colorId = item.color_id || item.attributes?.color;
              const sizeId = item.size_id || item.attributes?.size;

              return {
                ...item,
                // CRITICAL: Preserve the 'item_id' for the select-item PATCH request
                item_id: item.item_id || item._id, 
                product: productRes.data.product,
                color: colors.find(c => c._id === colorId),
                size: sizes.find(s => s._id === sizeId)
              };
            } catch (err) {
              return null;
            }
          })
        );
        
        setCartItems(hydratedItems.filter(Boolean));

      } catch (err) {
        console.error("Checkout Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCartData();
  }, [user, navigate]);

  // --- 2. Calculate Totals ---
  useEffect(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + (price * item.quantity);
    }, 0);
    
    // Shipping Logic (e.g., Free over 200)
    const shipping = subtotal > 200 ? 0 : 25; 
    
    setOrderSummary({
      subtotal,
      shipping: subtotal === 0 ? 0 : shipping,
      total: subtotal + (subtotal === 0 ? 0 : shipping)
    });
  }, [cartItems]);

  // --- 3. Handle Order Placement ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!trxId.trim()) {
      return Swal.fire("Required", "Please enter your bKash Transaction ID.", "warning");
    }

    setSubmitting(true);

    try {
      // --- STEP 1: FORCE SELECT ALL ITEMS (The Fix) ---
      // We assume the user wants to checkout everything currently in their cart view.
      const itemIds = cartItems.map(item => item.item_id);
      
      if (itemIds.length > 0) {
        // Matches your API: PATCH /cart/select-item/ with { item_ids: [], is_selected: true }
        await axiosInstance.patch("cart/select-item/", {
          item_ids: itemIds,
          is_selected: true
        });
      }

      // --- STEP 2: PLACE ORDER ---
      // Matches your API: POST /order/place/ with { transection_id: "..." }
      const response = await axiosInstance.post("order/place/", {
        transection_id: trxId 
      });

      // --- STEP 3: SUCCESS ---
      localStorage.removeItem("zing_cart");

      Swal.fire({
        title: "Order Placed!",
        text: `Order #${response.data.order_id} placed successfully. We will call you shortly.`,
        icon: "success",
        confirmButtonColor: "#1A2B23",
        confirmButtonText: "Okay, Got it!"
      }).then(() => {
        navigate("/"); 
      });

    } catch (error) {
      console.error("Order Error:", error);
      
      // Smart Error Message Handling
      const errorData = error.response?.data;
      let msg = "Failed to place order.";
      
      if (errorData) {
        if (errorData.error) msg = errorData.error;
        else if (errorData.message) msg = errorData.message;
        else if (typeof errorData === "string") msg = errorData;
      }

      Swal.fire("Order Failed", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-8 text-center md:text-left">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* --- LEFT COLUMN: Order Summary --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-accent/10 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-6 border-b border-accent/10 pb-2">
                Order Items ({cartItems.length})
              </h2>
              
              <div className="space-y-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-16 h-20 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0 border border-accent/10">
                      <img 
                        src={item.product?.image_urls?.[0]} 
                        alt={item.product?.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-primary">{item.product?.name}</h3>
                        <p className="text-sm font-bold text-primary">
                          ${(item.product?.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="mt-1 text-xs text-primary/60 space-y-0.5">
                        <p>Qty: {item.quantity}</p>
                        <p>
                          {item.size && <span className="mr-2">Size: {item.size.name}</span>}
                          {item.color && <span>Color: {item.color.name}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-accent/10 space-y-3">
                <div className="flex justify-between text-sm text-primary/70">
                  <span>Subtotal</span>
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-primary/70">
                  <span>Shipping</span>
                  <span>${orderSummary.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary pt-4 border-t border-accent/10">
                  <span>Total to Pay</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Payment --- */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-sm border border-accent/20 shadow-md sticky top-24">
              
              <div className="flex items-center gap-3 mb-6 text-primary">
                <FaLock size={20} className="text-secondary" />
                <h2 className="text-lg font-bold tracking-tight">Payment Details</h2>
              </div>

              <div className="bg-pink-50 border border-pink-100 p-4 rounded-sm mb-6 flex items-start gap-3">
                <FaMoneyBillWave className="text-pink-600 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-pink-700">Payment via bKash</h4>
                  <p className="text-xs text-pink-600/80 mt-1 leading-relaxed">
                    Merchant: <strong>017XXXXXXXX</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary/70">
                    Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 9G765HJK12"
                    className="w-full p-4 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none font-mono tracking-wider transition-all"
                  />
                  <p className="text-[10px] text-primary/40 flex items-center gap-1">
                    <FaCheckCircle size={10} /> Enter the ID from your confirmation SMS
                  </p>
                </div>

                <div className="bg-base-100 p-4 rounded-sm flex items-center gap-3 text-primary/60 border border-accent/10">
                  <FaPhoneAlt size={16} />
                  <p className="text-xs leading-relaxed">
                    A sales representative will call your registered number to verify the payment.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                >
                  {submitting ? "Processing..." : `Place Order ($${orderSummary.total.toFixed(2)})`}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;