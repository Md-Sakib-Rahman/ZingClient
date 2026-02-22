import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { 
  MdSearch, 
  MdFilterList, 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdChevronLeft, 
  MdChevronRight,
  MdRefresh
} from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const AllProductPage = () => {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Attributes for Dropdowns & Hydration
  const [attributes, setAttributes] = useState({ colors: [], sizes: [], categories: [] });
  const [subcategories, setSubcategories] = useState([]);

  // Filters & Pagination
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    subcategory: "",
    min_price: "",
    max_price: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalProducts: 0
  });

  // --- 1. Initial Load: Get Attributes ---
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await axiosInstance.get("/products/get-attributes/");
        setAttributes(res.data);
      } catch (err) {
        console.error("Failed to load attributes", err);
      }
    };
    fetchAttributes();
  }, []);

  // --- 2. Fetch Products (Main Data) ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page);
      params.append("limit", pagination.limit);
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category_id", filters.category);
      if (filters.subcategory) params.append("subcategory_id", filters.subcategory);
      if (filters.min_price) params.append("min_price", filters.min_price);

      const res = await axiosInstance.get(`/products/search-products/?${params.toString()}`);
      setProducts(res.data.results || []);
      
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.total_pages,
        totalProducts: res.data.total_products
      }));
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 3. Dynamic Subcategories ---
  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFilters(prev => ({ ...prev, category: categoryId, subcategory: "" }));
    
    if (categoryId) {
      try {
        const res = await axiosInstance.get(`/products/get-subcategories/${categoryId}`);
        setSubcategories(res.data.subcategories);
      } catch (err) {
        console.error("Failed to load subcategories", err);
      }
    } else {
      setSubcategories([]);
    }
  };

  // --- Helpers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); 
  };

  const getCategoryName = (id) => attributes.categories.find(c => c._id === id)?.name || "N/A";
  
  const getColorHex = (id) => {
    const color = attributes.colors.find(c => c._id === id);
    return color ? color.name.toLowerCase().replace(" ", "") : "#eee";
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/products/delete-product/${productId}/`);
        Swal.fire('Deleted!', 'Your product has been deleted.', 'success');
        fetchProducts(); 
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire('Error!', 'Failed to delete product. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 font-inter text-primary">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
          <p className="text-xs text-primary/60 mt-1">Manage, filter, and track your inventory</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchProducts}
            className="p-2 border border-accent/20 rounded-sm text-primary/60 hover:text-primary hover:bg-white transition-colors"
          >
            <MdRefresh size={20} />
          </button>
          <Link 
            to="/admin/create-product" 
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            <MdAdd size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* --- Filter Bar --- */}
      <div className="bg-white p-5 rounded-sm border border-accent/20 shadow-sm grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="md:col-span-2 relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
          <input 
            type="text" 
            name="search"
            placeholder="Search by product name..." 
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none transition-colors"
          />
        </div>

        <select 
          name="category" 
          value={filters.category}
          onChange={handleCategoryChange}
          className="px-3 py-2.5 bg-white border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
        >
          <option value="">All Categories</option>
          {attributes.categories.map((cat, idx) => (
            <option key={idx} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <select 
          name="subcategory" 
          value={filters.subcategory}
          onChange={handleFilterChange}
          disabled={!filters.category}
          className="px-3 py-2.5 bg-white border border-accent/20 rounded-sm text-sm focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">All Subcategories</option>
          {subcategories.map((sub, idx) => (
            <option key={idx} value={sub._id}>{sub.name}</option>
          ))}
        </select>

        <select className="px-3 py-2.5 bg-white border border-accent/20 rounded-sm text-sm focus:border-primary outline-none">
          <option value="">Stock Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-sm border border-accent/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-accent/20">
              <tr>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-primary/60 w-16">Image</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-primary/60">Product Name</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-primary/60">Category</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-primary/60">Price</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-primary/60">Inventory</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-primary/60">Variants</th>
                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-primary/60 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-accent/10">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-10 w-10 bg-gray-200 rounded-sm"></div></td>
                    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded-sm"></div></td>
                    <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded-sm"></div></td>
                    <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded-sm"></div></td>
                    <td className="p-4"><div className="h-4 w-12 bg-gray-200 rounded-sm"></div></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded-sm"></div></td>
                    <td className="p-4"><div className="h-8 w-16 bg-gray-200 rounded-sm ml-auto"></div></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-primary/40 italic">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => {
                  
                  // --- DISCOUNT CALCULATION ---
                  const hasDiscount = product.discount && product.discount > 0 && product.discount < 1;
                  const discountedPrice = hasDiscount ? product.price * (1 - product.discount) : product.price;
                  const discountPercentage = hasDiscount ? Math.round(product.discount * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      
                      {/* Image */}
                      <td className="p-4">
                        <div className="h-10 w-10 rounded-sm overflow-hidden bg-gray-100 border border-accent/10 relative">
                           {/* Tiny discount dot on image for quick scan */}
                           {hasDiscount && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-bl-sm"></div>}
                           
                          {product.image_urls?.[0] ? (
                            <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <FaBoxOpen className="h-full w-full p-2 text-gray-300" />
                          )}
                        </div>
                      </td>

                      {/* Name & ID */}
                      <td className="p-4">
                        <p className="font-bold text-sm text-primary truncate max-w-[200px]" title={product.name}>
                          {product.name}
                        </p>
                        <p className="text-[9px] text-primary/40 font-mono mt-0.5">ID: {product._id.slice(-6).toUpperCase()}</p>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-sm bg-accent/5 text-[10px] font-bold text-primary/70 uppercase tracking-wider">
                          {getCategoryName(product.category_id)}
                        </span>
                      </td>

                      {/* Price (UPDATED LOGIC) */}
                      <td className="p-4">
                         {hasDiscount ? (
                            <div className="flex flex-col items-start">
                               <div className="flex items-center gap-2">
                                  <span className="font-bold text-primary">Tk {discountedPrice.toLocaleString()}</span>
                                  <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-1 rounded font-bold">-{discountPercentage}%</span>
                               </div>
                               <span className="text-[10px] text-gray-400 line-through decoration-red-300">Tk {product.price.toLocaleString()}</span>
                            </div>
                         ) : (
                            <span className="font-serif italic font-bold">Tk {product.price.toLocaleString()}</span>
                         )}
                      </td>

                      {/* Stock */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-secondary' : product.stock > 0 ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                           <span className={`text-xs font-medium ${product.stock === 0 ? 'text-red-500' : 'text-primary/80'}`}>
                             {product.stock} units
                           </span>
                        </div>
                      </td>

                      {/* Variants */}
                      <td className="p-4">
                        <div className="flex -space-x-1">
                          {product.color_ids?.slice(0, 4).map((id, idx) => (
                            <div 
                              key={idx} 
                              className="w-4 h-4 rounded-full border border-white ring-1 ring-gray-100"
                              style={{ backgroundColor: getColorHex(id) }}
                              title="Color Variant"
                            />
                          ))}
                          {(product.color_ids?.length > 4) && (
                            <div className="w-4 h-4 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] text-gray-500 font-bold">
                              +
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/admin/product/edit/${product._id}`)}
                            className="p-1.5 text-primary/60 hover:text-secondary hover:bg-secondary/10 rounded-sm transition-colors"
                            title="Edit Product"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button 
                             onClick={() => handleDeleteProduct(product._id)}
                             className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                             title="Delete Product"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Footer --- */}
        <div className="bg-gray-50 border-t border-accent/20 p-4 flex items-center justify-between">
          <p className="text-xs text-primary/50">
            Showing <span className="font-bold text-primary">{products.length}</span> of <span className="font-bold text-primary">{pagination.totalProducts}</span> products
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="p-1.5 border border-accent/20 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:border-primary transition-all"
            >
              <MdChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold px-2">Page {pagination.page}</span>
            <button 
              disabled={!products.length || products.length < pagination.limit} 
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="p-1.5 border border-accent/20 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:border-primary transition-all"
            >
              <MdChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProductPage;