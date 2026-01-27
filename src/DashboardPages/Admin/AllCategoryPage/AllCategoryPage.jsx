import React, { useEffect, useState } from "react";
import { Link } from "react-router"; 
import { 
  MdAdd, 
  MdDelete, 
  MdCategory, 
  MdRefresh,
  MdSubdirectoryArrowRight,
  MdClose,
  MdPlaylistAdd
} from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const AllCategoryPage = () => {
  // --- State ---
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [attrRes, subRes] = await Promise.all([
        axiosInstance.get("/products/get-attributes/"),
        axiosInstance.get("/products/all-subcategories/")
      ]);

      setCategories(attrRes.data.categories || []);
      setSubcategories(subRes.data.subcategories || []);
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire("Error", "Failed to load category data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. Add Subcategory (New Feature) ---
 
  const handleAddSubcategory = async (categoryId) => {
    const { value: subCategoryName } = await Swal.fire({
      title: 'Add New Subcategory',
      input: 'text',
      inputPlaceholder: 'Enter subcategory name',
      showCancelButton: true,
      confirmButtonText: 'Add',
      confirmButtonColor: '#1A2B23',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
      }
    });

    if (subCategoryName) {
      try {
        const formData = new FormData();
        formData.append('subcategory_name', subCategoryName);
        // No image appended

        const res = await axiosInstance.post(`/products/add-subcategory/${categoryId}/`, formData, {
          headers: { "Content-Type": undefined }
        });

        // Optimistic UI Update
        const newSub = {
          _id: res.data.subcategory_id,
          name: subCategoryName,
          parent_id: categoryId,
        };
        
        setSubcategories(prev => [...prev, newSub]);
        
        Swal.fire({
            icon: 'success',
            title: 'Added!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });

      } catch (error) {
        console.error("Add failed:", error);
        const msg = error.response?.data?.error || "Failed to add subcategory";
        Swal.fire('Error', msg, 'error');
      }
    }
  };

  // --- 3. Delete Parent Category ---
  const handleDeleteCategory = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: "This will remove the category and may affect products linked to it.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/products/delete-category/${id}/`);
        Swal.fire('Deleted!', 'Category has been removed.', 'success');
        fetchData(); 
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire('Error', 'Failed to delete category.', 'error');
      }
    }
  };

  // --- 4. Delete Subcategory ---
  const handleDeleteSubcategory = async (subId) => {
    const result = await Swal.fire({
      title: 'Remove Subcategory?',
      text: "Are you sure you want to delete this subcategory?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/products/delete-subcategory/${subId}/`);
        setSubcategories(prev => prev.filter(sub => sub._id !== subId));
        Swal.fire('Deleted!', 'Subcategory removed.', 'success');
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire('Error', 'Failed to delete subcategory.', 'error');
      }
    }
  };

  const getChildSubcategories = (parentId) => {
    return subcategories.filter(sub => sub.parent_id === parentId);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter text-primary pb-20">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          <p className="text-xs text-primary/60 mt-1">Organize your product catalog structure.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="p-2 border border-accent/20 rounded-sm text-primary/60 hover:text-primary hover:bg-white transition-colors"
            title="Refresh Data"
          >
            <MdRefresh size={20} />
          </button>
          <Link 
            to="/admin/create-category" 
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-primary/90 transition-all shadow-sm"
          >
            <MdAdd size={16} /> Create New Category
          </Link>
        </div>
      </div>

      {/* --- Content Grid --- */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-accent/20 border-dashed rounded-sm text-primary/40">
          <MdCategory size={48} className="mb-4 opacity-50" />
          <p className="text-sm font-bold">No Categories Found</p>
          <p className="text-xs">Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const children = getChildSubcategories(category._id);

            return (
              <div 
                key={category._id} 
                className="bg-white group rounded-sm border border-accent/20 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Category Image Header */}
                <div className="h-40 w-full bg-gray-100 relative overflow-hidden border-b border-accent/10">
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-white text-lg font-bold tracking-wide shadow-black drop-shadow-md capitalize">
                        {category.name}
                      </h3>
                      <span className="text-[10px] text-white/80 uppercase tracking-wider">
                         {children.length} Sub-items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  
                  {/* Subcategories List */}
                  <div className="flex-1 space-y-3 mb-6">
                    {children.length > 0 ? (
                      children.map(sub => (
                        <div key={sub._id} className="flex items-center justify-between text-xs text-primary/70 pl-2 border-l-2 border-accent/20 hover:border-primary transition-colors group/sub">
                          <div className="flex items-center gap-2">
                             <MdSubdirectoryArrowRight className="text-primary/30" />
                             <span className="capitalize">{sub.name}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteSubcategory(sub._id)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover/sub:opacity-100 transition-opacity"
                            title="Remove Subcategory"
                          >
                            <MdClose size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-primary/30 italic pl-2">No subcategories yet.</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-accent/10">
                    <button 
                      onClick={() => handleAddSubcategory(category._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] uppercase font-bold text-primary/70 bg-gray-50 hover:bg-primary hover:text-white rounded-sm transition-all"
                    >
                      <MdPlaylistAdd size={16} /> Add Sub-Item
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category._id)}
                      className="w-8 flex items-center justify-center py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                      title="Delete Category"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllCategoryPage;
