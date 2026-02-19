import React, { useEffect, useState } from "react";
import { MdShield, MdDelete, MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("admin"); // 'admin' or 'moderator'

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/auth/search/?role=${filterRole}&limit=100`);
      setEmployees(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filterRole]);

  // --- UPDATED HANDLER ---
  const handleManageRole = async (user) => {
    // Safely determine display name
    const displayName = user.first_name 
      ? `${user.first_name} ${user.last_name || ''}` 
      : (user.username || "Staff Member");
    
    // 1. Show Dropdown Popup
    const { value: newRole } = await Swal.fire({
      title: `Manage Role`,
      text: `Select a new role for ${displayName}:`,
      input: 'select',
      inputOptions: {
        'admin': 'Admin',
        'moderator': 'Moderator',
        'user': 'User (Remove from Staff)'
      },
      inputPlaceholder: 'Select a role',
      inputValue: user.role, // Pre-select current role
      showCancelButton: true,
      confirmButtonText: 'Update Role',
      confirmButtonColor: '#1A2B23',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to select a role!';
        }
        if (value === user.role) {
            return 'Please select a different role.';
        }
      }
    });

    // 2. If a valid role was selected, call API
    if (newRole) {
      try {
         // FIX: Updated endpoint to match your API documentation
         // Endpoint: /auth/admin-update-user/<id>/
         await axiosInstance.put(`/auth/admin-update-user/${user._id}/`, { 
             role: newRole 
         });
        
        let msg = `Role updated to ${newRole}.`;
        if (newRole === 'user') {
            msg = `${displayName} has been removed from the staff list.`;
        }

        Swal.fire('Success', msg, 'success');
        fetchEmployees(); // Refresh the list to remove/update the user
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to update role.', 'error');
      }
    }
  };

  return (
    <div className="p-6 font-inter text-primary">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        
        <div className="flex bg-gray-100 rounded-md p-1">
          <button 
            onClick={() => setFilterRole('admin')}
            className={`px-4 py-2 text-sm font-bold rounded-sm transition-all ${filterRole === 'admin' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            Admins
          </button>
          <button 
            onClick={() => setFilterRole('moderator')}
            className={`px-4 py-2 text-sm font-bold rounded-sm transition-all ${filterRole === 'moderator' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            Moderators
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <p className="col-span-3 text-center py-10">Loading Staff...</p>
        ) : employees.length === 0 ? (
           <p className="col-span-3 text-center py-10 text-gray-400">No {filterRole}s found.</p>
        ) : (
          employees.map(emp => {
            // Safely determine name and initial
            const displayName = emp.first_name 
              ? `${emp.first_name} ${emp.last_name || ''}` 
              : (emp.username || "Unknown Staff");
            
            const initial = emp.first_name 
              ? emp.first_name[0] 
              : (emp.username ? emp.username[0] : 'U');

            return (
              <div key={emp._id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${emp.role === 'admin' ? 'bg-purple-600' : 'bg-teal-500'}`}>
                      {initial.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg capitalize">{displayName}</h3>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border ${emp.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                        {emp.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                  <button 
                    onClick={() => handleManageRole(emp)}
                    className="text-xs font-bold uppercase text-gray-500 hover:text-primary flex items-center gap-1"
                  >
                    <MdEdit size={14} /> Manage Role
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
