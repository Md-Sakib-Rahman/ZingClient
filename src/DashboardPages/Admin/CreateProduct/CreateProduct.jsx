import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCloudUploadAlt, FaTimes, FaBox, FaRuler, FaPalette } from "react-icons/fa";
import { MdCategory, MdSubdirectoryArrowRight } from "react-icons/md";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const CreateProduct = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  // --- State Management ---
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState({ colors: [], sizes: [], categories: [] });
  const [subcategories, setSubcategories] = useState([]);
  const [isSubCatLoading, setIsSubCatLoading] = useState(false);
  
  // Multi-select States
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  
  // Image State
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // --- 1. Fetch Attributes on Load ---
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await axiosInstance.get("/products/get-attributes/");
        setAttributes(res.data);
      } catch (err) {
        console.error("Failed to load attributes", err);
        Swal.fire("Error", "Could not load form attributes", "error");
      }
    };
    fetchAttributes();
  }, []);

  // --- 2. Handle Category Change -> Fetch Subcategories ---
  const selectedCategoryId = watch("category"); // Watch the category input

  useEffect(() => {
    if (selectedCategoryId) {
      const fetchSubcategories = async () => {
        setIsSubCatLoading(true);
        try {
          const res = await axiosInstance.get(`/products/get-subcategories/${selectedCategoryId}/`);
          setSubcategories(res.data.subcategories || []);
        } catch (err) {
          console.error(err);
          setSubcategories([]);
        } finally {
          setIsSubCatLoading(false);
        }
      };
      fetchSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  // --- 3. Handle Image Selection ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);

      // Create preview URLs
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- 4. Toggle Selection Helpers ---
  const toggleSelection = (id, state, setState) => {
    if (state.includes(id)) {
      setState(state.filter((item) => item !== id));
    } else {
      setState([...state, id]);
    }
  };

  // --- 5. Form Submission ---
//   const onSubmit = async (data) => {
//     if (imageFiles.length === 0) {
//       return Swal.fire("Missing Images", "Please upload at least one product image.", "warning");
//     }
//     if (selectedColors.length === 0 || selectedSizes.length === 0) {
//       return Swal.fire("Missing Attributes", "Please select at least one color and size.", "warning");
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();

//       // Append Basic Fields
//       formData.append("name", data.name);
//       formData.append("description", data.description);
//       formData.append("price", data.price);
//       formData.append("stock", data.stock);
//       formData.append("gender", data.gender);
//       formData.append("type", data.type); // "type" acts as subcategory_id based on your previous examples
//       formData.append("category", data.category); // Your API expects "category", not "category_id"

//       // Append Arrays (Colors & Sizes)
//       // Note: We append the same key multiple times for arrays in FormData
//       selectedColors.forEach((id) => formData.append("color_ids", id));
//       selectedSizes.forEach((id) => formData.append("size_ids", id));

//       // Append Images
//       imageFiles.forEach((file) => {
//         formData.append("images", file);
//       });

//       // API Call
//       console.log("Submitting Form Data:", formData); // For debugging
//       await axiosInstance.post("/products/create-product/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       Swal.fire({
//         title: "Success!",
//         text: "Product created successfully.",
//         icon: "success",
//         confirmButtonColor: "#1A2B23"
//       }).then(() => {
//         navigate("/admin/products"); // Redirect to listing
//       });

//     } catch (error) {
//       console.error(error);
//       Swal.fire("Error", "Failed to create product. Check console.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };
const onSubmit = async (data) => {
    // Validation checks...
    if (imageFiles.length === 0) {
      return Swal.fire("Missing Images", "Please upload at least one product image.", "warning");
    }
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      return Swal.fire("Missing Attributes", "Please select at least one color and size.", "warning");
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // --- FIX 1: Match Field Names to Postman ---
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("stock", data.stock);
      formData.append("gender", data.gender);
      
      // CHANGED: 'category' -> 'category_id' (Matches Postman)
      formData.append("category_id", data.category); 
      
      // CHANGED: 'type' -> 'subcategory_id' (Matches Error Message & Postman)
      formData.append("subcategory_id", data.type); 

      // Append Arrays
      selectedColors.forEach((id) => formData.append("color_ids", id));
      selectedSizes.forEach((id) => formData.append("size_ids", id));

      // Append Images
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // --- FIX 2: Remove Manual Headers ---
      // Do NOT set "Content-Type": "multipart/form-data". 
      // Axios detects the FormData object and adds the correct header + boundary automatically.
    //   await axiosInstance.post("/products/create-product/", formData);
      await axiosInstance.post("/products/create-product/", formData, {
        headers: { 
          "Content-Type": undefined 
        },
        timeout: 120000
      });
      Swal.fire({
        title: "Success!",
        text: "Product created successfully.",
        icon: "success",
        confirmButtonColor: "#1A2B23"
      }).then(() => {
        navigate("/admin/products");
      });

    } catch (error) {
      console.error(error);
      // Show the specific error from backend if available
      const errMsg = error.response?.data?.error || "Failed to create product.";
      Swal.fire("Error", errMsg, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Create New Product</h1>
        <p className="text-xs text-primary/60 mt-1">Fill in the details to add a new item to the inventory.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2 mb-4">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary">Product Name</label>
              <input 
                {...register("name", { required: "Name is required" })}
                className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
                placeholder="e.g. Navy Oxford Shirt"
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary">Gender / Target</label>
              <select 
                {...register("gender", { required: true })}
                className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary">Description</label>
            <textarea 
              {...register("description", { required: "Description is required" })}
              rows={4}
              className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
              placeholder="Product details, material, care instructions..."
            />
          </div>
        </div>

        {/* Section 2: Classification */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2 mb-4">
            Classification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary flex items-center gap-2">
                <MdCategory /> Category
              </label>
              <select 
                {...register("category", { required: "Category is required" })}
                className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
              >
                <option value="">Select Category</option>
                {attributes.categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
            </div>

            {/* Subcategory Dropdown (Dependent) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary flex items-center gap-2">
                <MdSubdirectoryArrowRight /> Subcategory
              </label>
              <select 
                {...register("type", { required: "Subcategory is required" })}
                disabled={!selectedCategoryId || isSubCatLoading}
                className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {isSubCatLoading ? "Loading..." : selectedCategoryId ? "Select Subcategory" : "Select Category First"}
                </option>
                {subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
              {errors.type && <span className="text-xs text-red-500">{errors.type.message}</span>}
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Inventory */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2 mb-4">
            Pricing & Inventory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary flex items-center gap-2">
                Price (Tk)
              </label>
              <input 
                type="number"
                {...register("price", { required: true, min: 0 })}
                className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary flex items-center gap-2">
                <FaBox /> Stock Quantity
              </label>
              <input 
                type="number"
                {...register("stock", { required: true, min: 0 })}
                className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Variants (Colors & Sizes) */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2 mb-4">
            Variants
          </h3>
          
          {/* Colors */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-primary flex items-center gap-2">
              <FaPalette /> Available Colors (Multi-select)
            </label>
            <div className="flex flex-wrap gap-3">
              {attributes.colors.map((color) => {
                const isSelected = selectedColors.includes(color._id);
                return (
                  <button
                    type="button"
                    key={color._id}
                    onClick={() => toggleSelection(color._id, selectedColors, setSelectedColors)}
                    className={`
                      px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2
                      ${isSelected ? "border-primary bg-primary text-white" : "border-accent/20 bg-white text-primary hover:border-primary"}
                    `}
                  >
                    <span 
                      className="w-3 h-3 rounded-full border border-white/30" 
                      style={{ backgroundColor: color.name.toLowerCase().replace(" ", "") }}
                    />
                    {color.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3 mt-6">
            <label className="text-xs font-bold text-primary flex items-center gap-2">
              <FaRuler /> Available Sizes (Multi-select)
            </label>
            <div className="flex flex-wrap gap-2">
              {attributes.sizes.map((size) => {
                const isSelected = selectedSizes.includes(size._id);
                return (
                  <button
                    type="button"
                    key={size._id}
                    onClick={() => toggleSelection(size._id, selectedSizes, setSelectedSizes)}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-sm text-xs font-bold uppercase border transition-all
                      ${isSelected ? "border-primary bg-primary text-white" : "border-accent/20 bg-white text-primary hover:border-primary"}
                    `}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 5: Image Upload */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2 mb-4">
            Product Images
          </h3>
          
          <div className="border-2 border-dashed border-accent/30 rounded-sm p-8 text-center bg-gray-50 hover:bg-white transition-colors">
            <input 
              type="file" 
              multiple 
              accept="image/*"
              id="file-upload"
              className="hidden"
              onChange={handleImageChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <FaCloudUploadAlt size={40} className="text-primary/40" />
              <span className="text-sm font-bold text-primary">Click to upload images</span>
              <span className="text-xs text-primary/50">Supports JPG, PNG, WEBP</span>
            </label>
          </div>

          {/* Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative aspect-square border border-accent/20 rounded-sm overflow-hidden group">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-white px-8 py-4 rounded-sm uppercase tracking-[0.2em] font-bold hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {loading ? "Creating..." : "Publish Product"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateProduct;