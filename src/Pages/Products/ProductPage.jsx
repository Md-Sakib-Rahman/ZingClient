import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import axiosInstance from "../../Api/publicAxios/axiosInstance";
import ProductCard from "../../Components/Products/ProductCard/ProductCard";
import ProductPagination from "../../Components/Products/Pagination/ProductPagination";
import SEO from "../../Components/SEO/SEO";
const ProductPage = () => {
  const { id: categoryId } = useParams(); // Category ID from URL
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Get current page and subcategory from URL search params
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const activeSubCat = searchParams.get("subcategory_id") || "";

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

      // If we have a category from params or a subcategory from filters
      if (activeSubCat) url += `&subcategory_id=${activeSubCat}`;
      else if (categoryId) url += `&category_id=${categoryId}`;

      const res = await axiosInstance.get(url);
      setProducts(res.data.results || []);
      setTotalPages(Math.ceil(res.data.total_products / 10)); // Assuming 'count' is total items
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Subcategories (Filters) based on the Main Category
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
  }, [categoryId, activeSubCat, currentPage]);

  useEffect(() => {
    fetchFilters();
  }, [categoryId]);

  const handleFilterChange = (subId) => {
    // Reset page to 1 when filter changes
    setSearchParams({ subcategory_id: subId, page: 1 });
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
                  onClick={() => setSearchParams({ page: 1 })}
                  className={`text-left text-xs uppercase tracking-widest transition-all ${!activeSubCat ? "text-secondary font-bold bg-primary p-2 rounded-xl" : "text-primary/50  hover:text-primary"}`}
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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 italic text-primary/40">
                    No products found in this category.
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
