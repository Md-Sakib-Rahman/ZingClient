import React, { useState, useEffect } from "react";
import { FaPalette, FaRuler, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance"; // Adjust path as needed

const AttributesPage = () => {
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newColor, setNewColor] = useState("");
  const [newColorHash, setNewColorHash] = useState("#000000"); // Added state for Color Hex
  const [newSize, setNewSize] = useState("");
  const [submittingColor, setSubmittingColor] = useState(false);
  const [submittingSize, setSubmittingSize] = useState(false);

  // --- Fetch Attributes ---
  const fetchAttributes = async () => {
    try {
      const res = await axiosInstance.get("/products/get-attributes/");
      setColors(res.data.colors || []);
      setSizes(res.data.sizes || []);
    } catch (err) {
      console.error("Failed to load attributes", err);
      Swal.fire("Error", "Could not load attributes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  // --- Add Handlers ---
  const handleAddColor = async (e) => {
    e.preventDefault();
    if (!newColor.trim()) return;

    setSubmittingColor(true);
    try {
      // Updated payload to include color_hash
      await axiosInstance.post("/products/add-color/", { 
        color_name: newColor.trim(),
        color_hash: newColorHash
      });
      Swal.fire({ icon: "success", title: "Color Added", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      
      // Reset form
      setNewColor("");
      setNewColorHash("#000000"); 
      
      fetchAttributes();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Failed to add color", "error");
    } finally {
      setSubmittingColor(false);
    }
  };

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newSize.trim()) return;

    setSubmittingSize(true);
    try {
      await axiosInstance.post("/products/add-size/", { size_name: newSize.trim() });
      Swal.fire({ icon: "success", title: "Size Added", toast: true, position: "top-end", timer: 1500, showConfirmButton: false });
      setNewSize("");
      fetchAttributes();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Failed to add size", "error");
    } finally {
      setSubmittingSize(false);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteColor = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/products/delete-color/${id}/`, {
          data: { color_name: name }
        });
        Swal.fire("Deleted!", "Color has been removed.", "success");
        fetchAttributes();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete color.", "error");
      }
    }
  };

  const handleDeleteSize = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/products/delete-size/${id}/`, {
          data: { size_name: name }
        });
        Swal.fire("Deleted!", "Size has been removed.", "success");
        fetchAttributes();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete size.", "error");
      }
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><span className="loading loading-spinner text-primary"></span></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-inter pb-20">
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Attributes Management</h1>
        <p className="text-xs text-primary/60 mt-1">Manage colors and sizes available for product creation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- Colors Section --- */}
        <div className="bg-white rounded-sm border border-accent/20 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-accent/10 bg-gray-50 flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-sm"><FaPalette size={16} /></div>
             <h2 className="font-bold text-primary">Manage Colors</h2>
          </div>
          
          <div className="p-5 space-y-6 flex-1">
             <form onSubmit={handleAddColor} className="flex gap-2 items-center">
                {/* Color Picker Wrapper */}
                <div 
                  className="w-10 h-10 shrink-0 rounded-sm border border-accent/20 overflow-hidden relative cursor-pointer"
                  title="Pick a color"
                >
                  <input 
                    type="color" 
                    value={newColorHash}
                    onChange={(e) => setNewColorHash(e.target.value)}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                
                <input 
                  type="text" 
                  value={newColor} 
                  onChange={(e) => setNewColor(e.target.value)} 
                  placeholder="e.g. Burgundy, Navy Blue" 
                  className="flex-1 p-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
                  required
                />
                
                <button 
                  type="submit" 
                  disabled={submittingColor}
                  className="px-4 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FaPlus /> Add
                </button>
             </form>

             <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {colors.length === 0 ? <p className="text-xs text-gray-400 italic">No colors found.</p> : colors.map(color => (
                  <div key={color._id} className="flex items-center justify-between p-3 border border-accent/10 rounded-sm hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                       {/* Display the selected color circle */}
                       <span 
                         className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" 
                         style={{ backgroundColor: color.color_hash || color.name.toLowerCase().replace(" ", "") }} // Fallback to name if old data lacks hash
                       />
                       <span className="text-sm font-medium text-primary capitalize">
                          {color.name}
                          {/* Show the hash code if it exists */}
                          {color.color_hash && <span className="text-xs text-gray-400 font-normal ml-2">({color.color_hash.toUpperCase()})</span>}
                       </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteColor(color._id, color.name)}
                      className="text-red-400 hover:text-red-600 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Color"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* --- Sizes Section --- */}
        <div className="bg-white rounded-sm border border-accent/20 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-accent/10 bg-gray-50 flex items-center gap-3">
             <div className="p-2 bg-green-100 text-green-600 rounded-sm"><FaRuler size={16} /></div>
             <h2 className="font-bold text-primary">Manage Sizes</h2>
          </div>
          
          <div className="p-5 space-y-6 flex-1">
             <form onSubmit={handleAddSize} className="flex gap-2">
                <input 
                  type="text" 
                  value={newSize} 
                  onChange={(e) => setNewSize(e.target.value)} 
                  placeholder="e.g. XL, 42, Free Size" 
                  className="flex-1 p-2.5 bg-gray-50 border border-accent/20 rounded-sm text-sm focus:border-primary outline-none"
                  required
                />
                <button 
                  type="submit" 
                  disabled={submittingSize}
                  className="px-4 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FaPlus /> Add
                </button>
             </form>

             <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {sizes.length === 0 ? <p className="text-xs text-gray-400 italic">No sizes found.</p> : sizes.map(size => (
                  <div key={size._id} className="flex items-center justify-between p-3 border border-accent/10 rounded-sm hover:bg-gray-50 transition-colors group">
                    <span className="text-sm font-medium text-primary uppercase">{size.name}</span>
                    <button 
                      onClick={() => handleDeleteSize(size._id, size.name)}
                      className="text-red-400 hover:text-red-600 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Size"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttributesPage;
