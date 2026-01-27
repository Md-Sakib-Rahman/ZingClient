import React, { useState } from "react";
import { MdSearch, MdPersonAdd, MdCheckCircle } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const AddEmployeePage = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("moderator");

  const handleSearch = async (e) => {
    e.preventDefault();
    if(!searchEmail) return;
    
    setLoading(true);
    setFoundUser(null);
    
    try {
      const res = await axiosInstance.get(`/auth/search/?email=${searchEmail}&role=user`);
      
      if (res.data.users && res.data.users.length > 0) {
        const exactMatch = res.data.users.find(u => u.email === searchEmail);
        if(exactMatch) {
            setFoundUser(exactMatch);
        } else {
            Swal.fire("Not Found", "User not found or is already an admin/moderator.", "info");
        }
      } else {
        Swal.fire("Not Found", "No registered user found with this email.", "warning");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Search failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!foundUser) return;

    try {
      await axiosInstance.put(`/auth/create-modarator_or_admin/${foundUser._id}/`, {
        role: selectedRole
      });

      // FIX: Safe name access for alert
      const name = foundUser.first_name || foundUser.username || "User";

      Swal.fire({
        icon: 'success',
        title: 'Promotion Successful!',
        text: `${name} is now a ${selectedRole}.`,
        confirmButtonColor: '#1A2B23'
      });

      setFoundUser(null);
      setSearchEmail("");

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update user role.", "error");
    }
  };

  // Helper for safe display
  const getSafeInitial = (user) => {
    if (user.first_name) return user.first_name[0];
    if (user.username) return user.username[0];
    return "U";
  };

  const getSafeName = (user) => {
    if (user.first_name) return `${user.first_name} ${user.last_name || ''}`;
    return user.username || "Unknown User";
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-inter text-primary">
      <h1 className="text-2xl font-bold mb-2">Add New Employee</h1>
      <p className="text-sm text-gray-500 mb-8">Search for an existing registered user to promote them to staff status.</p>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-3.5 text-gray-400" size={20}/>
            <input 
              type="email" 
              required
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter user email address"
              className="w-full pl-10 p-3 border rounded-md focus:border-primary focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-md font-bold uppercase text-xs tracking-widest hover:bg-opacity-90 disabled:opacity-70"
          >
            {loading ? "Searching..." : "Find User"}
          </button>
        </form>
      </div>

      {/* Result Section */}
      {foundUser && (
        <div className="bg-white border-l-4 border-primary rounded-r-lg shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                {/* FIX: Use safe initial */}
                {getSafeInitial(foundUser).toUpperCase()}
              </div>
              <div>
                {/* FIX: Use safe name */}
                <h3 className="text-xl font-bold capitalize">{getSafeName(foundUser)}</h3>
                <p className="text-gray-500">{foundUser.email}</p>
                <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Current Role: {foundUser.role}</span>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 flex items-center gap-1">
                        <MdCheckCircle /> Eligible
                    </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Select New Role</label>
              <div className="flex gap-4 items-center">
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="flex-1 p-2 border rounded-md bg-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                
                <button 
                  onClick={handlePromote}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-md font-bold uppercase text-xs tracking-widest hover:bg-green-700 transition-colors"
                >
                  <MdPersonAdd size={16} /> Promote User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployeePage;