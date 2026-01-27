import React, { useState, useEffect } from "react";
import { MdCloudUpload, MdDelete, MdTitle, MdSubtitles, MdCategory } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../Api/publicAxios/axiosInstance";

const SetBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    type: "hero_section", // Default type
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- 1. Fetch Existing Banners ---
  const fetchBanners = async () => {
    try {
      // FIX 1: Corrected Endpoint to /banner/search/
      const res = await axiosInstance.get("/banner/search/");
      
      // FIX 2: Correctly access the 'banners' array from response
      setBanners(res.data.banners || []); 
    } catch (err) {
      console.error("Failed to fetch banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // --- 2. Handle Input Changes ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- 3. Submit Banner (POST) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      Swal.fire("Error", "Please select an image", "warning");
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("subtitle", formData.subtitle);
    data.append("type", formData.type);
    data.append("banner_image", formData.image);

    try {
      await axiosInstance.post("/banner/add/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Success", "Banner uploaded successfully!", "success");
      
      // Reset Form
      setFormData({ title: "", subtitle: "", type: "hero_section", image: null });
      setPreviewUrl(null);
      
      // Refresh List
      fetchBanners();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to upload banner.", "error");
    } finally {
      setUploading(false);
    }
  };

  // --- 4. Delete Banner (DELETE) ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/banner/delete/${id}/`);
        
        Swal.fire("Deleted!", "Banner has been removed.", "success");
        fetchBanners(); // Refresh list
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete banner.", "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-inter text-primary">
      <h1 className="text-2xl font-bold mb-8 text-primary">Banner Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left: Upload Form --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MdCloudUpload className="text-secondary" /> Upload New Banner
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Banner Type</label>
                <div className="relative">
                  <MdCategory className="absolute left-3 top-3 text-gray-400" />
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-2 border rounded-md text-sm outline-none focus:border-primary appearance-none bg-white"
                  >
                    <option value="hero_section">Hero Section</option>
                    <option value="promo_section">Promo Section</option>
                    <option value="footer_section">Footer Section</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                <div className="relative">
                  <MdTitle className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter banner title"
                    className="w-full pl-10 p-2 border rounded-md text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Subtitle</label>
                <div className="relative">
                  <MdSubtitles className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Enter banner description"
                    className="w-full pl-10 p-2 border rounded-md text-sm outline-none focus:border-primary h-24 resize-none"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Banner Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition-colors relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                  ) : (
                    <div className="text-gray-400 py-4">
                      <MdCloudUpload size={30} className="mx-auto mb-2" />
                      <p className="text-xs">Click or Drag to upload</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-primary text-white py-3 rounded-md font-bold uppercase text-xs tracking-widest hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                {uploading ? "Uploading..." : "Publish Banner"}
              </button>
            </form>
          </div>
        </div>

        {/* --- Right: Existing Banners List --- */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold mb-4">Active Banners</h2>
          
          {loading ? (
            <p className="text-center py-10 text-gray-400">Loading banners...</p>
          ) : banners.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
              <p className="text-gray-400">No banners found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => (
                <div key={banner._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                  <div className="relative h-40">
                    {/* FIX 3: Use 'banner_url' from your API response */}
                    <img 
                      src={banner.img_url || "https://via.placeholder.com/400x200"} 
                      alt={banner.title} 
                      className="w-full h-full object-cover"
                    />
                    
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">
                      {banner.type?.replace('_', ' ')}
                    </span>

                    <button 
                      onClick={() => handleDelete(banner._id)}
                      className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      title="Delete Banner"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-primary truncate" title={banner.title}>
                      {banner.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {banner.subtitle}
                    </p>
                    
                    <p className="text-[9px] text-gray-300 mt-3 font-mono">
                      ID: {banner._id.slice(-6)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SetBanner;