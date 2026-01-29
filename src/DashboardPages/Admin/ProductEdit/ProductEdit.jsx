import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import { FaCloudUploadAlt, FaTimes, FaBox, FaRuler, FaPalette, FaSave, FaArrowLeft } from "react-icons/fa";
import { MdCategory, MdSubdirectoryArrowRight } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data Sources
  const [attributes, setAttributes] = useState({ colors: [], sizes: [], categories: [] });
  const [subcategories, setSubcategories] = useState([]);
  
  // Selection State (Current)
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  
  // Selection State (Initial - for Diffing)
  const [initialColors, setInitialColors] = useState([]);
  const [initialSizes, setInitialSizes] = useState([]);

  // Image State
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // --- 1. Initial Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attrRes, productRes] = await Promise.all([
          axiosInstance.get("/products/get-attributes/"),
          axiosInstance.get(`/products/product-details/${id}`)
        ]);

        setAttributes(attrRes.data);
        const product = productRes.data.product;

        // Populate Form Fields
        setValue("name", product.name);
        setValue("description", product.description);
        setValue("price", product.price);
        setValue("discount", product.discount || 0); // NEW: Populate Discount
        setValue("stock", product.stock);
        setValue("gender", product.gender);
        setValue("category", product.category_id);
        setValue("type", product.type || product.subcategory_id);

        // Setup Selection States
        setSelectedColors(product.color_ids || []);
        setInitialColors(product.color_ids || []);

        setSelectedSizes(product.size_ids || []);
        setInitialSizes(product.size_ids || []);

        // Setup Images
        setExistingImages(product.image_urls || []);

        // Fetch subcategories
        if (product.category_id) {
          const subRes = await axiosInstance.get(`/products/get-subcategories/${product.category_id}/`);
          setSubcategories(subRes.data.subcategories || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        Swal.fire("Error", "Failed to load product details", "error");
        setLoading(false);
      }
    };
    fetchData();
  }, [id, setValue]);

  // --- 2. Watch Category Change ---
  const watchedCategory = watch("category");
  useEffect(() => {
    if (watchedCategory) {
       axiosInstance.get(`/products/get-subcategories/${watchedCategory}/`)
         .then(res => setSubcategories(res.data.subcategories || []))
         .catch(err => console.error(err));
    } else {
      setSubcategories([]);
    }
  }, [watchedCategory]);


  // --- 3. Handlers ---
  const toggleSelection = (id, currentList, setList) => {
    if (currentList.includes(id)) {
      setList(currentList.filter(item => item !== id));
    } else {
      setList([...currentList, id]);
    }
  };

  const handleNewImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewImageFiles(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const markExistingImageForDeletion = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
    setImagesToRemove(prev => [...prev, url]);
  };

  // --- 4. Submit Logic ---
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // --- PART A: Update Text Details ---
      const diffPayload = {
        name: data.name,
        price: Number(data.price),
        discount: Number(data.discount), // NEW: Send Discount
        description: data.description,
        stock: Number(data.stock),
        gender: data.gender,
        category_id: data.category,
        subcategory_id: data.type,
      };

      // Diffing Colors/Sizes
      const addedColors = selectedColors.filter(id => !initialColors.includes(id));
      const removedColors = initialColors.filter(id => !selectedColors.includes(id));
      if (addedColors.length > 0) diffPayload.add_color_ids = addedColors;
      if (removedColors.length > 0) diffPayload.remove_color_ids = removedColors;

      const addedSizes = selectedSizes.filter(id => !initialSizes.includes(id));
      const removedSizes = initialSizes.filter(id => !selectedSizes.includes(id));
      if (addedSizes.length > 0) diffPayload.add_size_ids = addedSizes;
      if (removedSizes.length > 0) diffPayload.remove_size_ids = removedSizes;

      // 1. Send Product Update
      await axiosInstance.put(`/products/update-product/${id}/`, diffPayload, {
        timeout: 60000 
      });

      // --- PART B: Update Images ---
      if (newImageFiles.length > 0 || imagesToRemove.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach(file => formData.append("add_images", file));
        imagesToRemove.forEach(url => formData.append("remove_images", url));

        await axiosInstance.put(`/products/update-product-images/${id}/`, formData, {
            headers: { "Content-Type": undefined },
            timeout: 120000 
        });
      }

      Swal.fire("Success", "Product updated successfully!", "success").then(() => {
        navigate("/admin/products");
      });

    } catch (error) {
      console.error("Update Error:", error);
      if (error.code === 'ECONNABORTED') {
        return Swal.fire("Timeout", "Server took too long.", "warning");
      }
      const msg = error.response?.data?.message || "Failed to update product.";
      Swal.fire("Update Failed", typeof msg === 'object' ? JSON.stringify(msg) : msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary"></span></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 font-inter">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-primary/60">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Edit Product</h1>
          <p className="text-xs text-primary/60">Update product information and inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2">Basic Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2">
                        <label className="text-xs font-bold text-primary mb-1 block">Product Name</label>
                        <input {...register("name")} className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
                     </div>
                     
                     {/* Row: Price, Discount, Stock */}
                     <div className="col-span-2 grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-primary mb-1 block">Price</label>
                            <input type="number" step="0.01" {...register("price")} className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-primary mb-1 block">Discount (0-1)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                max="1" 
                                placeholder="e.g. 0.2 for 20%" 
                                {...register("discount")} 
                                className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-primary mb-1 block">Stock</label>
                            <input type="number" {...register("stock")} className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
                        </div>
                     </div>

                     <div className="col-span-2">
                        <label className="text-xs font-bold text-primary mb-1 block">Description</label>
                        <textarea rows={4} {...register("description")} className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
                     </div>
                  </div>
                </div>

                {/* Attributes */}
                <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-6">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2">Attributes</h3>
                   
                   {/* Colors */}
                   <div>
                      <label className="text-xs font-bold text-primary mb-2 flex items-center gap-2"><FaPalette /> Colors</label>
                      <div className="flex flex-wrap gap-2">
                         {attributes.colors.map(color => (
                            <button
                               type="button"
                               key={color._id}
                               onClick={() => toggleSelection(color._id, selectedColors, setSelectedColors)}
                               className={`px-3 py-1.5 rounded-sm text-xs font-bold border flex items-center gap-2 transition-all ${selectedColors.includes(color._id) ? "bg-primary text-white border-primary" : "bg-white text-primary border-accent/20"}`}
                            >
                               <span className="w-2 h-2 rounded-full bg-gray-200" style={{ backgroundColor: color.name.toLowerCase().replace(" ", "") }} />
                               {color.name}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Sizes */}
                   <div>
                      <label className="text-xs font-bold text-primary mb-2 flex items-center gap-2"><FaRuler /> Sizes</label>
                      <div className="flex flex-wrap gap-2">
                         {attributes.sizes.map(size => (
                            <button
                               type="button"
                               key={size._id}
                               onClick={() => toggleSelection(size._id, selectedSizes, setSelectedSizes)}
                               className={`w-10 h-10 flex items-center justify-center rounded-sm text-xs font-bold border transition-all ${selectedSizes.includes(size._id) ? "bg-primary text-white border-primary" : "bg-white text-primary border-accent/20"}`}
                            >
                               {size.name}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
            </div>

            {/* Right Column: Classification & Images */}
            <div className="space-y-6">
                
                {/* Categories */}
                <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2">Category</h3>
                   <div>
                      <label className="text-xs font-bold text-primary mb-1 block">Gender</label>
                      <select {...register("gender")} className="w-full p-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm outline-none">
                         <option value="male">Male</option>
                         <option value="female">Female</option>
                         <option value="unisex">Unisex</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-primary mb-1 block">Category</label>
                      <select {...register("category")} className="w-full p-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm outline-none">
                         <option value="">Select...</option>
                         {attributes.categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-primary mb-1 block">Subcategory</label>
                      <select {...register("type")} className="w-full p-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm outline-none">
                         <option value="">Select...</option>
                         {subcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                      </select>
                   </div>
                </div>

                {/* Images */}
                <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2">Images</h3>
                   
                   {existingImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                         {existingImages.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border group">
                               <img src={url} alt="product" className="w-full h-full object-cover" />
                               <button 
                                 type="button" 
                                 onClick={() => markExistingImageForDeletion(url)}
                                 className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  <FaTimes size={10} />
                               </button>
                            </div>
                         ))}
                      </div>
                   )}

                   {newImagePreviews.length > 0 && (
                      <div className="border-t pt-4">
                          <p className="text-[10px] uppercase font-bold text-green-600 mb-2">Adding {newImagePreviews.length} New</p>
                          <div className="grid grid-cols-3 gap-2">
                            {newImagePreviews.map((src, idx) => (
                                <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border">
                                <img src={src} alt="new-preview" className="w-full h-full object-cover opacity-80" />
                                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-gray-600 text-white p-1 rounded-full">
                                    <FaTimes size={10} />
                                </button>
                                </div>
                            ))}
                          </div>
                      </div>
                   )}

                   <label className="flex flex-col items-center justify-center border-2 border-dashed border-accent/30 p-4 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors">
                      <FaCloudUploadAlt size={24} className="text-primary/40" />
                      <span className="text-xs font-bold text-primary mt-2">Upload New Images</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleNewImageSelect} />
                   </label>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-primary text-white py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                   <FaSave /> {submitting ? "Updating..." : "Save Changes"}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useParams, useNavigate } from "react-router";
// import { FaCloudUploadAlt, FaTimes, FaBox, FaRuler, FaPalette, FaSave, FaArrowLeft } from "react-icons/fa";
// import { MdCategory, MdSubdirectoryArrowRight } from "react-icons/md";
// import Swal from "sweetalert2";
// import axiosInstance from "../../../Api/publicAxios/axiosInstance";

// const ProductEdit = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

//   // --- State ---
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
  
//   // Data Sources
//   const [attributes, setAttributes] = useState({ colors: [], sizes: [], categories: [] });
//   const [subcategories, setSubcategories] = useState([]);
  
//   // Selection State (Current)
//   const [selectedColors, setSelectedColors] = useState([]);
//   const [selectedSizes, setSelectedSizes] = useState([]);
  
//   // Selection State (Initial - for Diffing)
//   const [initialColors, setInitialColors] = useState([]);
//   const [initialSizes, setInitialSizes] = useState([]);

//   // Image State
//   const [existingImages, setExistingImages] = useState([]); // URLs from DB
//   const [imagesToRemove, setImagesToRemove] = useState([]); // URLs marked for deletion
//   const [newImageFiles, setNewImageFiles] = useState([]);   // New Files to upload
//   const [newImagePreviews, setNewImagePreviews] = useState([]);

//   // --- 1. Initial Data Fetching ---
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Parallel Fetch: Attributes + Product Details
//         const [attrRes, productRes] = await Promise.all([
//           axiosInstance.get("/products/get-attributes/"),
//           axiosInstance.get(`/products/product-details/${id}`)
//         ]);

//         setAttributes(attrRes.data);
//         const product = productRes.data.product;

//         // Populate Form Fields
//         setValue("name", product.name);
//         setValue("description", product.description);
//         setValue("price", product.price);
//         setValue("stock", product.stock);
//         setValue("gender", product.gender);
//         setValue("category", product.category_id);
//         setValue("type", product.type || product.subcategory_id); // Handle variation in naming

//         // Setup Selection States
//         // Note: API returns array of IDs strings for color_ids/size_ids
//         setSelectedColors(product.color_ids || []);
//         setInitialColors(product.color_ids || []);

//         setSelectedSizes(product.size_ids || []);
//         setInitialSizes(product.size_ids || []);

//         // Setup Images
//         setExistingImages(product.image_urls || []);

//         // Fetch subcategories for the current category immediately
//         if (product.category_id) {
//           const subRes = await axiosInstance.get(`/products/get-subcategories/${product.category_id}/`);
//           setSubcategories(subRes.data.subcategories || []);
//         }

//         setLoading(false);
//       } catch (err) {
//         console.error("Fetch Error:", err);
//         Swal.fire("Error", "Failed to load product details", "error");
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [id, setValue]);

//   // --- 2. Watch Category Change for Subcategories ---
//   const watchedCategory = watch("category");
//   useEffect(() => {
//     if (watchedCategory) {
//        // Only fetch if it's different (optional optimization)
//        axiosInstance.get(`/products/get-subcategories/${watchedCategory}/`)
//          .then(res => setSubcategories(res.data.subcategories || []))
//          .catch(err => console.error(err));
//     } else {
//       setSubcategories([]);
//     }
//   }, [watchedCategory]);


//   // --- 3. Handlers ---
  
//   // Toggle Selection (Colors/Sizes)
//   const toggleSelection = (id, currentList, setList) => {
//     if (currentList.includes(id)) {
//       setList(currentList.filter(item => item !== id));
//     } else {
//       setList([...currentList, id]);
//     }
//   };

//   // Image Handling
//   const handleNewImageSelect = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 0) {
//       setNewImageFiles(prev => [...prev, ...files]);
//       const previews = files.map(file => URL.createObjectURL(file));
//       setNewImagePreviews(prev => [...prev, ...previews]);
//     }
//   };

//   const removeNewImage = (index) => {
//     setNewImageFiles(prev => prev.filter((_, i) => i !== index));
//     setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
//   };

//   const markExistingImageForDeletion = (url) => {
//     setExistingImages(prev => prev.filter(img => img !== url));
//     setImagesToRemove(prev => [...prev, url]);
//   };

//   // --- 4. Submit Logic (The Complex Part) ---
// //   const onSubmit = async (data) => {
// //     setSubmitting(true);
// //     try {
// //       // --- PART A: Update Text Details & Relations ---
// //       const diffPayload = {
// //         name: data.name,
// //         price: Number(data.price),
// //         description: data.description,
// //         stock: Number(data.stock),
// //         gender: data.gender,
// //         category: data.category,
// //         subcategory_id: data.type
// //       };

// //       // Calculate Diffs for Colors
// //       const addedColors = selectedColors.filter(id => !initialColors.includes(id));
// //       const removedColors = initialColors.filter(id => !selectedColors.includes(id));
// //       if (addedColors.length > 0) diffPayload.add_color_ids = addedColors;
// //       if (removedColors.length > 0) diffPayload.remove_color_ids = removedColors;

// //       // Calculate Diffs for Sizes
// //       const addedSizes = selectedSizes.filter(id => !initialSizes.includes(id));
// //       const removedSizes = initialSizes.filter(id => !selectedSizes.includes(id));
// //       if (addedSizes.length > 0) diffPayload.add_size_ids = addedSizes;
// //       if (removedSizes.length > 0) diffPayload.remove_size_ids = removedSizes;

// //       // 1. Send Product Update Request
// //       await axiosInstance.put(`/products/update-product/${id}/`, diffPayload);


// //       // --- PART B: Update Images (If needed) ---
// //       if (newImageFiles.length > 0 || imagesToRemove.length > 0) {
// //         const formData = new FormData();
        
// //         // Append new files
// //         newImageFiles.forEach(file => {
// //           formData.append("add_images", file);
// //         });

// //         // Append removals (URLs)
// //         imagesToRemove.forEach(url => {
// //           formData.append("remove_images", url);
// //         });

// //         // 2. Send Image Update Request
// //         // IMPORTANT: Content-Type: undefined allows browser to set boundary
// //         await axiosInstance.put(`/products/update-product-images/${id}/`, formData, {
// //             headers: { "Content-Type": undefined }
// //         });
// //       }

// //       Swal.fire("Success", "Product updated successfully!", "success").then(() => {
// //         navigate("/admin/products");
// //       });

// //     } catch (error) {
// //       console.error("Update Error:", error);
// //       const msg = error.response?.data?.message || error.response?.data?.error || "Failed to update product.";
// //       Swal.fire("Update Failed", typeof msg === 'object' ? JSON.stringify(msg) : msg, "error");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };
// const onSubmit = async (data) => {
//     setSubmitting(true);
//     try {
//       // --- PART A: Update Text Details ---
//       const diffPayload = {
//         name: data.name,
//         price: Number(data.price),
//         description: data.description,
//         stock: Number(data.stock),
//         gender: data.gender,
//         category_id: data.category,      // CHANGED: category -> category_id
//         subcategory_id: data.type,
//       };

//       // ... (Diffing logic remains the same) ...
//       const addedColors = selectedColors.filter(id => !initialColors.includes(id));
//       const removedColors = initialColors.filter(id => !selectedColors.includes(id));
//       if (addedColors.length > 0) diffPayload.add_color_ids = addedColors;
//       if (removedColors.length > 0) diffPayload.remove_color_ids = removedColors;

//       const addedSizes = selectedSizes.filter(id => !initialSizes.includes(id));
//       const removedSizes = initialSizes.filter(id => !selectedSizes.includes(id));
//       if (addedSizes.length > 0) diffPayload.add_size_ids = addedSizes;
//       if (removedSizes.length > 0) diffPayload.remove_size_ids = removedSizes;

//       // 1. Send Product Update Request (Text Data)
//       // Added timeout: 60000 (1 minute)
//       await axiosInstance.put(`/products/update-product/${id}/`, diffPayload, {
//         timeout: 60000 
//       });


//       // --- PART B: Update Images ---
//       if (newImageFiles.length > 0 || imagesToRemove.length > 0) {
//         const formData = new FormData();
        
//         newImageFiles.forEach(file => {
//           formData.append("add_images", file);
//         });

//         imagesToRemove.forEach(url => {
//           formData.append("remove_images", url);
//         });

//         // 2. Send Image Update Request (Heavy payload)
//         // Added timeout: 120000 (2 minutes) for slower connections/large files
//         await axiosInstance.put(`/products/update-product-images/${id}/`, formData, {
//             headers: { "Content-Type": undefined },
//             timeout: 120000 
//         });
//       }

//       Swal.fire("Success", "Product updated successfully!", "success").then(() => {
//         navigate("/admin/products");
//       });

//     } catch (error) {
//       console.error("Update Error:", error);
      
//       // Handle Timeout specifically
//       if (error.code === 'ECONNABORTED') {
//         return Swal.fire("Timeout", " The server took too long to respond. The image might still be processing in the background.", "warning");
//       }

//       const msg = error.response?.data?.message || error.response?.data?.error || "Failed to update product.";
//       Swal.fire("Update Failed", typeof msg === 'object' ? JSON.stringify(msg) : msg, "error");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary"></span></div>;

//   return (
//     <div className="max-w-5xl mx-auto pb-20 font-inter">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-primary/60">
//           <FaArrowLeft />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-primary tracking-tight">Edit Product</h1>
//           <p className="text-xs text-primary/60">Update product information and inventory.</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
//             {/* Left Column: Details */}
//             <div className="lg:col-span-2 space-y-6">
                
//                 {/* Basic Info */}
//                 <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
//                   <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2">Basic Info</h3>
//                   <div className="grid grid-cols-2 gap-4">
//                      <div className="col-span-2">
//                         <label className="text-xs font-bold text-primary mb-1 block">Product Name</label>
//                         <input {...register("name")} className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
//                      </div>
//                      <div>
//                         <label className="text-xs font-bold text-primary mb-1 block">Price</label>
//                         <input type="number" {...register("price")} className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
//                      </div>
//                      <div>
//                         <label className="text-xs font-bold text-primary mb-1 block">Stock</label>
//                         <input type="number" {...register("stock")} className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
//                      </div>
//                      <div className="col-span-2">
//                         <label className="text-xs font-bold text-primary mb-1 block">Description</label>
//                         <textarea rows={4} {...register("description")} className="w-full p-3 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none" />
//                      </div>
//                   </div>
//                 </div>

//                 {/* Attributes */}
//                 <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-6">
//                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2">Attributes</h3>
                   
//                    {/* Colors */}
//                    <div>
//                       <label className="text-xs font-bold text-primary mb-2 flex items-center gap-2"><FaPalette /> Colors</label>
//                       <div className="flex flex-wrap gap-2">
//                          {attributes.colors.map(color => (
//                             <button
//                                type="button"
//                                key={color._id}
//                                onClick={() => toggleSelection(color._id, selectedColors, setSelectedColors)}
//                                className={`px-3 py-1.5 rounded-sm text-xs font-bold border flex items-center gap-2 transition-all ${selectedColors.includes(color._id) ? "bg-primary text-white border-primary" : "bg-white text-primary border-accent/20"}`}
//                             >
//                                <span className="w-2 h-2 rounded-full bg-gray-200" style={{ backgroundColor: color.name.toLowerCase().replace(" ", "") }} />
//                                {color.name}
//                             </button>
//                          ))}
//                       </div>
//                    </div>

//                    {/* Sizes */}
//                    <div>
//                       <label className="text-xs font-bold text-primary mb-2 flex items-center gap-2"><FaRuler /> Sizes</label>
//                       <div className="flex flex-wrap gap-2">
//                          {attributes.sizes.map(size => (
//                             <button
//                                type="button"
//                                key={size._id}
//                                onClick={() => toggleSelection(size._id, selectedSizes, setSelectedSizes)}
//                                className={`w-10 h-10 flex items-center justify-center rounded-sm text-xs font-bold border transition-all ${selectedSizes.includes(size._id) ? "bg-primary text-white border-primary" : "bg-white text-primary border-accent/20"}`}
//                             >
//                                {size.name}
//                             </button>
//                          ))}
//                       </div>
//                    </div>
//                 </div>
//             </div>

//             {/* Right Column: Classification & Images */}
//             <div className="space-y-6">
                
//                 {/* Categories */}
//                 <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
//                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2">Category</h3>
//                    <div>
//                       <label className="text-xs font-bold text-primary mb-1 block">Gender</label>
//                       <select {...register("gender")} className="w-full p-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm outline-none">
//                          <option value="male">Male</option>
//                          <option value="female">Female</option>
//                          <option value="unisex">Unisex</option>
//                       </select>
//                    </div>
//                    <div>
//                       <label className="text-xs font-bold text-primary mb-1 block">Category</label>
//                       <select {...register("category")} className="w-full p-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm outline-none">
//                          <option value="">Select...</option>
//                          {attributes.categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
//                       </select>
//                    </div>
//                    <div>
//                       <label className="text-xs font-bold text-primary mb-1 block">Subcategory</label>
//                       <select {...register("type")} className="w-full p-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm outline-none">
//                          <option value="">Select...</option>
//                          {subcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
//                       </select>
//                    </div>
//                 </div>

//                 {/* Images */}
//                 <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm space-y-4">
//                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 border-b border-accent/10 pb-2">Images</h3>
                   
//                    {/* Existing Images */}
//                    {existingImages.length > 0 && (
//                       <div className="grid grid-cols-3 gap-2">
//                          {existingImages.map((url, idx) => (
//                             <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border group">
//                                <img src={url} alt="product" className="w-full h-full object-cover" />
//                                <button 
//                                  type="button" 
//                                  onClick={() => markExistingImageForDeletion(url)}
//                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                                >
//                                   <FaTimes size={10} />
//                                </button>
//                             </div>
//                          ))}
//                       </div>
//                    )}

//                    {/* New Previews */}
//                    {newImagePreviews.length > 0 && (
//                       <div className="border-t pt-4">
//                           <p className="text-[10px] uppercase font-bold text-green-600 mb-2">Adding {newImagePreviews.length} New</p>
//                           <div className="grid grid-cols-3 gap-2">
//                             {newImagePreviews.map((src, idx) => (
//                                 <div key={idx} className="relative aspect-square rounded-sm overflow-hidden border">
//                                 <img src={src} alt="new-preview" className="w-full h-full object-cover opacity-80" />
//                                 <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-gray-600 text-white p-1 rounded-full">
//                                     <FaTimes size={10} />
//                                 </button>
//                                 </div>
//                             ))}
//                           </div>
//                       </div>
//                    )}

//                    {/* Upload Button */}
//                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-accent/30 p-4 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors">
//                       <FaCloudUploadAlt size={24} className="text-primary/40" />
//                       <span className="text-xs font-bold text-primary mt-2">Upload New Images</span>
//                       <input type="file" multiple accept="image/*" className="hidden" onChange={handleNewImageSelect} />
//                    </label>
//                 </div>

//                 <button 
//                   type="submit" 
//                   disabled={submitting}
//                   className="w-full bg-primary text-white py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
//                 >
//                    <FaSave /> {submitting ? "Updating..." : "Save Changes"}
//                 </button>
//             </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ProductEdit;