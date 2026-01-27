import React, { useEffect, useState, useCallback } from "react";
import { 
  MdSearch, 
  MdVisibility, 
  MdFileDownload, 
  MdChevronLeft, 
  MdChevronRight,
  MdClose,
  MdLocalShipping,
  MdDelete,
  MdPending,
  MdPerson,
  MdPhone,
  MdEmail
} from "react-icons/md";
import { FaMoneyBillWave, FaBoxOpen, FaClipboardList } from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const OrderPage = () => {
  // --- State ---
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // REMOVED: Customer state is no longer needed (data is in the order object)

  // Filters
  const [filters, setFilters] = useState({
    product_name: "",
    status: "",
    payment_status: "",
    date_range: "",
    min_price: "",
    max_price: ""
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0
  });

  // --- 1. Fetch Data ---
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page);
      params.append("page_size", pagination.limit);

      if (filters.product_name) params.append("product_name", filters.product_name);
      if (filters.status) params.append("status", filters.status);
      if (filters.payment_status) params.append("payment_status", filters.payment_status);
      if (filters.date_range) params.append("date_range", filters.date_range);
      if (filters.min_price) params.append("min_price", filters.min_price);
      if (filters.max_price) params.append("max_price", filters.max_price);

      const [searchRes, dashboardRes] = await Promise.all([
        axiosInstance.get(`/order/search/?${params.toString()}`),
        axiosInstance.get(`/analytics/dashboard/?${params.toString()}`) 
      ]);

      const searchData = searchRes.data;
      const dashboardData = dashboardRes.data;

      const pendingStat = dashboardData.order_status_distribution?.find(
        (item) => item._id === "pending"
      );
      const pendingCount = pendingStat ? pendingStat.count : 0;

      const mergedAnalytics = {
        total_revenue: dashboardData.total_revenue || 0,
        total_orders: searchData.analytics?.total_orders || 0,
        total_items_sold: searchData.analytics?.total_items_sold || 0,
        pending_orders: pendingCount
      };

      setAnalytics(mergedAnalytics);
      setOrders(searchData.orders || []);

      if (searchData.pagination) {
        setPagination((prev) => ({
          ...prev,
          totalPages: searchData.pagination.total_pages,
          totalRecords: searchData.pagination.total_records
        }));
      }

    } catch (err) {
      console.error("Fetch Error:", err);
      Swal.fire("Error", "Failed to load order data.", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // REMOVED: 2. Fetch Customer Details useEffect (Not needed anymore)

  // --- 3. Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/order/update-order/${orderId}/`, {
        order_status: newStatus
      });
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, order_status: newStatus } : order
      ));
      fetchOrders(); 
      
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
      });
      Toast.fire({ icon: 'success', title: `Order ${newStatus}` });
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Delete Order?', text: "This action cannot be undone.",
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/order/delete-order/${orderId}/`);
        Swal.fire('Deleted!', 'Order has been removed.', 'success');
        fetchOrders();
      } catch (err) {
        Swal.fire("Error", "Failed to delete order", "error");
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get('/order/export-csv/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      Swal.fire("Error", "Download failed", "error");
    }
  };

  const getStatusBadgeStyles = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6 font-inter pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Order Management</h1>
          <p className="text-xs text-primary/60">Track revenue and manage shipments.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-accent/20 px-4 py-2 rounded-sm text-xs font-bold text-primary hover:bg-gray-50 transition-colors">
          <MdFileDownload size={16} /> Export CSV
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-sm border border-accent/20 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-full"><FaMoneyBillWave /></div>
             <div>
                <p className="text-[10px] uppercase font-bold text-primary/40">Realized Revenue</p>
                <h3 className="text-xl font-bold text-primary">${analytics.total_revenue.toLocaleString()}</h3>
             </div>
          </div>
          <div className="bg-white p-5 rounded-sm border border-accent/20 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><FaClipboardList /></div>
             <div>
                <p className="text-[10px] uppercase font-bold text-primary/40">Total Orders</p>
                <h3 className="text-xl font-bold text-primary">{analytics.total_orders}</h3>
             </div>
          </div>
          <div className="bg-white p-5 rounded-sm border border-accent/20 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><FaBoxOpen /></div>
             <div>
                <p className="text-[10px] uppercase font-bold text-primary/40">Items Sold</p>
                <h3 className="text-xl font-bold text-primary">{analytics.total_items_sold}</h3>
             </div>
          </div>
          <div className="bg-white p-5 rounded-sm border border-accent/20 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><MdPending /></div>
             <div>
                <p className="text-[10px] uppercase font-bold text-primary/40">Pending Orders</p>
                <h3 className="text-xl font-bold text-primary">{analytics.pending_orders}</h3>
             </div>
          </div>
        </div>
      )}

      {/* Filters & Table */}
      <div className="bg-white p-4 rounded-sm border border-accent/20 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2 relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
          <input type="text" name="product_name" value={filters.product_name} onChange={handleFilterChange} placeholder="Search products..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
        </div>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 bg-white border border-accent/20 rounded-sm text-sm outline-none cursor-pointer">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select name="date_range" value={filters.date_range} onChange={handleFilterChange} className="px-3 py-2 bg-white border border-accent/20 rounded-sm text-sm outline-none cursor-pointer">
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="this_year">This Year</option>
        </select>
        <select name="payment_status" value={filters.payment_status} onChange={handleFilterChange} className="px-3 py-2 bg-white border border-accent/20 rounded-sm text-sm outline-none cursor-pointer">
          <option value="">Payment Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Unpaid</option>
        </select>
      </div>

      <div className="bg-white rounded-sm border border-accent/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-accent/20">
              <tr>
                <th className="p-4 text-[10px] uppercase font-bold text-primary/60">Order ID</th>
                <th className="p-4 text-[10px] uppercase font-bold text-primary/60">Date</th>
                <th className="p-4 text-[10px] uppercase font-bold text-primary/60">Customer</th>
                <th className="p-4 text-[10px] uppercase font-bold text-primary/60">Total</th>
                <th className="p-4 text-[10px] uppercase font-bold text-primary/60">Payment</th>
                <th className="p-4 text-[10px] uppercase font-bold text-primary/60">Status</th>
                <th className="p-4 text-[10px] uppercase font-bold text-primary/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-primary/50">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-primary/50">No orders found.</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4"><span className="font-mono text-xs text-primary/70">...{order._id.slice(-6)}</span></td>
                    <td className="p-4 text-xs text-primary/80">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}</td>
                    <td className="p-4 text-xs text-primary/80 truncate max-w-[120px]">User: {order.user_id.slice(0,8)}...</td>
                    <td className="p-4 text-sm font-bold text-primary">${(order.total_price || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-sm border ${['paid','complete'].includes(order.payment_status) ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{order.payment_status}</span>
                    </td>
                    <td className="p-4">
                      <select value={order.order_status} onChange={(e) => handleStatusUpdate(order._id, e.target.value)} className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-sm border cursor-pointer outline-none ${getStatusBadgeStyles(order.order_status)}`}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-primary/60 hover:text-blue-600 hover:bg-blue-50 rounded-sm"><MdVisibility size={16} /></button>
                          <button onClick={() => handleDeleteOrder(order._id)} className="p-1.5 text-primary/60 hover:text-red-600 hover:bg-red-50 rounded-sm"><MdDelete size={16} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-gray-50 border-t border-accent/20 p-4 flex justify-between items-center">
          <p className="text-xs text-primary/50">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
             <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))} className="p-1 border rounded-sm hover:bg-white disabled:opacity-30"><MdChevronLeft /></button>
             <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))} className="p-1 border rounded-sm hover:bg-white disabled:opacity-30"><MdChevronRight /></button>
          </div>
        </div>
      </div>

      {/* --- Modal with CUSTOMER INFO --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
             
             {/* Modal Header */}
             <div className="p-6 border-b border-accent/10 flex justify-between items-center bg-gray-50">
                <div>
                   <h2 className="text-lg font-bold text-primary">Order #{selectedOrder._id}</h2>
                   <p className="text-xs text-primary/60">
                     Placed on {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : "Unknown"}
                   </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-primary/40 hover:text-primary"><MdClose size={24} /></button>
             </div>
             
             {/* Modal Body */}
             <div className="p-6 space-y-6">
                
                {/* 1. Customer Details Section (UPDATED: Uses Order Data) */}
                <div className="bg-green-50 border border-green-100 p-4 rounded-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-green-700 mb-3 flex items-center gap-2">
                       <MdPerson size={16} /> Customer Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-green-600/60 uppercase flex items-center gap-1">
                                <MdPhone size={10} /> Phone Number
                            </p>
                            {/* Uses phone directly from the order */}
                            <p className="text-sm font-bold text-green-800">
                                {selectedOrder.phone || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-green-600/60 uppercase flex items-center gap-1">
                                <MdEmail size={10} /> Email Address
                            </p>
                            {/* Uses email directly from the order */}
                            <p className="text-sm font-bold text-green-800">
                                {selectedOrder.email || "N/A"}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-[10px] font-bold text-green-600/60 uppercase flex items-center gap-1">
                                <MdPerson size={10} /> User ID
                            </p>
                            <p className="font-mono text-xs text-green-800">
                                {selectedOrder.user_id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Transaction Info */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-sm flex justify-between items-center">
                   <div>
                      <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Transaction ID</p>
                      <p className="font-mono text-blue-900 text-sm">{selectedOrder.transection_id || "N/A"}</p>
                   </div>
                </div>

                {/* 3. Shipping */}
                <div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-2 border-b border-accent/10 pb-1 flex items-center gap-2">
                     <MdLocalShipping /> Shipping Details
                   </h3>
                   <div className="text-sm text-primary leading-relaxed bg-gray-50 p-3 rounded-sm border border-accent/10">
                      {selectedOrder.shipping_address || "No address provided."}
                   </div>
                </div>

                {/* 4. Items List */}
                <div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-2 border-b border-accent/10 pb-1 flex items-center gap-2">
                     <FaBoxOpen /> Items ({selectedOrder.items?.length || 0})
                   </h3>
                   <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm py-3 border-b border-accent/5 last:border-0 hover:bg-gray-50 px-2 rounded-sm">
                           <div>
                              <p className="font-bold text-primary">{item.name}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs text-primary/50">Qty: {item.quantity}</span>
                                <span className="text-xs text-primary/50">Size ID: {item.size_id?.slice(-4)}</span>
                                <span className="text-xs text-primary/50">Color ID: {item.color_id?.slice(-4)}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xs text-primary/40">${item.unit_price} each</p>
                              <p className="font-bold text-primary">${item.subtotal}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   
                   {/* Total Calculation */}
                   <div className="flex justify-between items-center mt-4 pt-4 border-t border-accent/20">
                      <span className="font-bold text-primary">Total Amount</span>
                      <span className="text-xl font-bold font-serif italic text-primary">
                        ${(selectedOrder.total_price || 0).toLocaleString()}
                      </span>
                   </div>
                </div>
             </div>

             {/* Modal Footer */}
             <div className="p-4 border-t border-accent/10 bg-gray-50 flex justify-end">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-primary/90 transition-all"
                >
                  Close Details
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderPage;