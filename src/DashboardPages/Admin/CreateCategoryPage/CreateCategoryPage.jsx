import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { FaCloudUploadAlt, FaPlus, FaTimes, FaArrowLeft, FaLayerGroup } from "react-icons/fa";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // --- State ---
  const [loading, setLoading] = useState(false);
  
  // Category Image State
  const [catImage, setCatImage] = useState(null);
  const [catPreview, setCatPreview] = useState(null);

  // Subcategories State (Array of objects)
  const [subCats, setSubCats] = useState([
    { name: "", image: null, preview: null } // Start with one empty slot
  ]);

  // --- Handlers ---
  
  // Handle Category Image
  const handleCatImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCatImage(file);
      setCatPreview(URL.createObjectURL(file));
    }
  };

  // Handle Subcategory Changes
  const handleSubCatChange = (index, field, value) => {
    const updated = [...subCats];
    if (field === "image") {
       const file = value.target.files[0];
       if (file) {
          updated[index].image = file;
          updated[index].preview = URL.createObjectURL(file);
       }
    } else {
       updated[index].name = value;
    }
    setSubCats(updated);
  };

  const addSubCatField = () => {
    setSubCats([...subCats, { name: "", image: null, preview: null }]);
  };

  const removeSubCatField = (index) => {
    const updated = subCats.filter((_, i) => i !== index);
    setSubCats(updated);
  };

  // --- Submit Logic (The Chain) ---
  const onSubmit = async (data) => {
    if (!catImage) {
      return Swal.fire("Required", "Please upload a category image.", "warning");
    }

    setLoading(true);

    try {
      // 1. Create Parent Category
      const catFormData = new FormData();
      catFormData.append("category_name", data.category_name);
      catFormData.append("category_image", catImage);

      const catRes = await axiosInstance.post("/products/add-category/", catFormData, {
         headers: { "Content-Type": undefined }
      });
      
      const newCategoryId = catRes.data.category_id;
      
      // 2. Create Subcategories (Loop)
      // Filter out empty names
      const validSubCats = subCats.filter(sub => sub.name.trim() !== "");
      
      if (validSubCats.length > 0) {
        // We use a for loop to process them sequentially or Promise.all
        // Using Promise.all for speed
        const subCatPromises = validSubCats.map(sub => {
           const subFormData = new FormData();
           subFormData.append("subcategory_name", sub.name);
           if (sub.image) {
              subFormData.append("subcategory_image", sub.image);
           }
           // API endpoint: /products/add-subcategory/<category_id>/
           return axiosInstance.post(`/products/add-subcategory/${newCategoryId}/`, subFormData, {
              headers: { "Content-Type": undefined }
           });
        });

        await Promise.all(subCatPromises);
      }

      Swal.fire({
         title: "Success!",
         text: "Category and subcategories created successfully.",
         icon: "success",
         confirmButtonColor: "#1A2B23"
      }).then(() => {
         navigate("/admin/listing"); // Redirect back to listing
      });

    } catch (error) {
      console.error("Creation Error:", error);
      const msg = error.response?.data?.error || "Failed to create category structure.";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-inter pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-primary/60">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Create Category</h1>
          <p className="text-xs text-primary/60">Add a new main category and its sub-items.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* --- Parent Category Section --- */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-6">
           <h3 className="text-sm font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2 flex items-center gap-2">
             <FaLayerGroup /> Parent Category
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                 <label className="text-xs font-bold text-primary">Category Name</label>
                 <input 
                   {...register("category_name", { required: "Category name is required" })}
                   className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
                   placeholder="e.g. Menswear"
                 />
                 {errors.category_name && <span className="text-xs text-red-500">{errors.category_name.message}</span>}
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-primary">Cover Image</label>
                 <label className="flex flex-col items-center justify-center border-2 border-dashed border-accent/30 h-32 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden">
                    {catPreview ? (
                       <img src={catPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                       <div className="text-center p-4">
                          <FaCloudUploadAlt size={24} className="text-primary/40 mx-auto" />
                          <span className="text-[10px] text-primary/60 mt-1 block">Upload</span>
                       </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCatImageChange} />
                 </label>
              </div>
           </div>
        </div>

        {/* --- Subcategories Section --- */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-6">
           <div className="flex justify-between items-center border-b border-accent/10 pb-2">
             <h3 className="text-sm font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
               <MdSubdirectoryArrowRight /> Subcategories
             </h3>
             <button 
               type="button" 
               onClick={addSubCatField}
               className="text-[10px] uppercase font-bold text-secondary hover:text-primary flex items-center gap-1"
             >
               <FaPlus size={10} /> Add Row
             </button>
           </div>

           <div className="space-y-4">
              {subCats.map((sub, index) => (
                <div key={index} className="flex gap-4 items-start animate-in fade-in duration-300">
                   {/* Subcat Image */}
                   {/* <label className="w-12 h-12 flex-shrink-0 border border-accent/20 rounded-sm cursor-pointer hover:border-primary overflow-hidden relative bg-gray-50">
                      {sub.preview ? (
                         <img src={sub.preview} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-primary/20">
                           <FaCloudUploadAlt />
                         </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSubCatChange(index, "image", e)} />
                   </label> */}

                   {/* Subcat Name */}
                   <input 
                      type="text" 
                      value={sub.name}
                      onChange={(e) => handleSubCatChange(index, "name", e.target.value)}
                      placeholder="Subcategory Name (e.g. T-Shirts)"
                      className="flex-1 p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none h-12"
                   />

                   {/* Remove Button */}
                   <button 
                     type="button" 
                     onClick={() => removeSubCatField(index)}
                     disabled={subCats.length === 1}
                     className="h-12 w-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <FaTimes />
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button 
             type="submit" 
             disabled={loading}
             className="bg-primary text-white px-8 py-4 rounded-sm uppercase tracking-[0.2em] font-bold hover:bg-primary/90 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {loading ? "Creating Structure..." : "Save Category"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateCategoryPage;