import React, { useEffect, useState } from "react";
import { MdSearch, MdDelete, MdEmail, MdPhone, MdPerson } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Correct URL: /auth/search/
      const res = await axiosInstance.get(
        `/auth/search/?role=user&page=${page}&limit=10&email=${searchTerm}`
      );
      console.log(res.data.users);
      setUsers(res.data.users || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete user!'
    });

    if (result.isConfirmed) {
      try {
        // FIX: Changed from /account/ to /auth/ to match your API structure
        await axiosInstance.delete(`/auth/delete-user/${id}/`);
        Swal.fire('Deleted!', 'User has been removed.', 'success');
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete user.', 'error');
      }
    }
  };

  return (
    <div className="p-6 font-inter text-primary">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Registered Users</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by email..."
            className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:border-primary"
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs uppercase font-bold text-gray-500">Username / ID</th>
              <th className="p-4 text-xs uppercase font-bold text-gray-500">Contact Info</th>
              <th className="p-4 text-xs uppercase font-bold text-gray-500">Status</th>
              <th className="p-4 text-xs uppercase font-bold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">No users found.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex flex-col">
                        {/* Display Username */}
                        <span className="font-bold text-sm text-primary flex items-center gap-2">
                           <MdPerson className="text-gray-400"/> 
                           {user.username || "Unknown User"}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 font-mono">ID: {user._id}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2"><MdEmail size={14} className="text-gray-400"/> {user.email}</span>
                      <span className="flex items-center gap-2"><MdPhone size={14} className="text-gray-400"/> {user.phone || "N/A"}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded border w-fit font-bold uppercase ${user.logged_in ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {user.logged_in ? 'Online' : 'Offline'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete User"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-end gap-2">
            <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 text-sm hover:bg-gray-50"
            >Previous</button>
            <span className="px-4 py-2 text-sm text-gray-600 flex items-center">Page {page} of {totalPages}</span>
            <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 text-sm hover:bg-gray-50"
            >Next</button>
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;