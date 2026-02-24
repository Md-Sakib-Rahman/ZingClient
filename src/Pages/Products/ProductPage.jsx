import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { MdSearch } from "react-icons/md";
import axiosInstance from "../../Api/publicAxios/axiosInstance";
import ProductCard from "../../Components/Products/ProductCard/ProductCard";
import ProductPagination from "../../Components/Products/Pagination/ProductPagination";
import SEO from "../../Components/SEO/SEO";

const ProductPage = () => {
  const { id: categoryId } = useParams(); 
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // URL Params
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const activeSubCat = searchParams.get("subcategory_id") || "";
  const searchQuery = searchParams.get("search") || "";

  // Local state for search input typing
  const [searchInput, setSearchInput] = useState(searchQuery);

  // 1. Safe access logic
  const mainCatName = subCategories.length > 0 
    ? subCategories[0]?.category_id?.name || "Category" 
    : "Products";

  const subCatName = subCategories.find(
    (sub) => sub._id === activeSubCat
  )?.name;

  // 2. Format the title and description
  const seoTitle = activeSubCat 
    ? `${mainCatName} | ${subCatName || '...'}` 
    : `${mainCatName} | All Products`;

  const seoDescription = `Shop the best ${subCatName || mainCatName} gadgets at Zing. Discover premium electronics at unbeatable prices.`;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `products/search-products?page=${currentPage}&limit=10`;

      if (activeSubCat) url += `&subcategory_id=${activeSubCat}`;
      else if (categoryId) url += `&category_id=${categoryId}`;

      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await axiosInstance.get(url);
      setProducts(res.data.results || []);
      setTotalPages(Math.ceil(res.data.total_products / 10)); 
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    if (!categoryId) return;
    try {
      const res = await axiosInstance.get(
        `products/get-subcategories/${categoryId}`,
      );
      setSubCategories(res.data.subcategories || []);
    } catch (err) {
      console.log("Filter Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId, activeSubCat, currentPage, searchQuery]);

  useEffect(() => {
    fetchFilters();
  }, [categoryId]);

  const handleFilterChange = (subId) => {
    const params = Object.fromEntries(searchParams);
    params.subcategory_id = subId;
    params.page = 1;
    setSearchParams(params);
  };

  // Handle Search Form Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = Object.fromEntries(searchParams);
    if (searchInput.trim()) {
      params.search = searchInput.trim();
    } else {
      delete params.search;
    }
    params.page = 1; // Reset to page 1 on new search
    setSearchParams(params);
  };

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} />
      <div className="max-w-7xl mx-auto px-4 py-10 font-inter">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Sidebar: Filters */}
          <aside className="w-full md:w-[200px] space-y-8">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-6 border-b pb-2">
                Subcategories
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const params = Object.fromEntries(searchParams);
                    delete params.subcategory_id;
                    params.page = 1;
                    setSearchParams(params);
                  }}
                  className={`text-left text-xs uppercase tracking-widest transition-all ${!activeSubCat ? "text-secondary font-bold bg-primary p-2 rounded-xl" : "text-primary/50 hover:text-primary"}`}
                >
                  All Products
                </button>
                {subCategories.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => handleFilterChange(sub._id)}
                    className={`text-left text-xs uppercase tracking-widest transition-all ${activeSubCat === sub._id ? "text-secondary font-bold bg-primary p-2 rounded-xl" : "text-primary/50 hover:text-primary"}`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Section: Products */}
          <main className="flex-1">
            
            {/* Search Bar */}
            <div className="mb-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-12 pl-10 px-24 py-3 bg-white border border-accent/20 rounded-full text-sm focus:border-primary outline-none shadow-sm transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 bg-primary text-white  px-4 m-1 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors "
                >
                  Search
                </button>
              </form>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product, idx) => (
                      <ProductCard key={idx} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-primary/40">
                    <p className="italic mb-2">No products found.</p>
                    {searchQuery && (
                      <button 
                        onClick={() => { setSearchInput(""); setSearchParams({}); }}
                        className="text-xs uppercase font-bold underline hover:text-primary"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center">
                    <ProductPagination
                      current={currentPage}
                      total={totalPages}
                      onPageChange={(p) =>
                        setSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: p,
                        })
                      }
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
