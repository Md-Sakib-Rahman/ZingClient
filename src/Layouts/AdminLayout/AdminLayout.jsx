import React, { useState } from "react";
import { Outlet, useLocation, Link, NavLink } from "react-router"; 
import { 
  MdDashboard, 
  MdLayers, 
  MdAddCircle, 
  MdPeople, 
  MdHistory, 
  MdAnalytics,
  MdOutlineInventory2,
  MdMenu,      // Added for Mobile Toggle
  MdClose      // Added for Close Button
} from "react-icons/md";
import { 
  FaBoxOpen, 
  FaClipboardList, 
  FaUserPlus, 
  FaUserShield,
  FaFileCsv
} from "react-icons/fa";
import DashboardOverview from "../../DashboardPages/Admin/DashboardOverview/DashboardOverview";
import SEO from "../../Components/SEO/SEO";

const AdminLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile sidebar
  const isBaseAdmin = location.pathname === "/admin" || location.pathname === "/admin/";

  // Expanded Menu Items
  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <MdDashboard size={20} />, section: "Overview" },
    { name: "Set Banner", path: "/admin/setbanner", icon: <MdAnalytics size={20} />, section: "Overview" },
    { name: "All Products", path: "/admin/products", icon: <MdOutlineInventory2 size={20} />, section: "Products" },
    { name: "Create Product", path: "/admin/create-product", icon: <FaBoxOpen size={18} />, section: "Products" },
    { name: "Categories", path: "/admin/listing", icon: <MdLayers size={20} />, section: "Catalog" },
    { name: "Create Category", path: "/admin/create-category", icon: <MdAddCircle size={20} />, section: "Catalog" },
    { name: "Order History & CSV", path: "/admin/orders", icon: <FaClipboardList size={18} />, section: "Orders" },
    { name: "All Users", path: "/admin/users", icon: <MdPeople size={20} />, section: "Users" },
    { name: "Employees", path: "/admin/users/employees", icon: <FaUserShield size={18} />, section: "Users" },
    { name: "Add Employee", path: "/admin/create-employee", icon: <FaUserPlus size={18} />, section: "Users" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter">
      <SEO title={"Dashboard"} description={"Dashboard"}/>
      <meta name="robots" content="noindex, nofollow" />
      {/* --- Mobile Overlay (Backdrop) --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- Sidebar --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        <div className="p-6 border-b border-white/10 shrink-0 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tighter italic">Zing Admin</Link>
          {/* Close Button for Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden text-white/70 hover:text-white"
          >
            <MdClose size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item, index) => {
            const showHeader = index === 0 || menuItems[index - 1].section !== item.section;
            return (
              <React.Fragment key={item.path}>
                {showHeader && (
                  <div className="mt-6 mb-2 px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                    {item.section}
                  </div>
                )}
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click (mobile UX)
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-sm transition-all text-[13px] tracking-wide
                    ${isActive 
                      ? "bg-secondary text-primary font-bold shadow-md" 
                      : "text-white/60 hover:bg-white/10 hover:text-white"}
                  `}
                >
                  <span className="opacity-80">{item.icon}</span>
                  {item.name}
                </NavLink>
              </React.Fragment>
            );
          })}
          
          {/* <div className="mt-8 px-4 pb-8">
             <button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-sm text-[11px] uppercase tracking-widest font-bold transition-all border border-white/10">
                <FaFileCsv size={14} /> Download Report
             </button>
          </div> */}
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 md:ml-64 transition-all duration-300 w-full">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          
          {/* Mobile Toggle Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-primary/70 hover:text-primary p-1"
            >
              <MdMenu size={24} />
            </button>
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40 hidden sm:block">
              System Management
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-primary">Admin User</p>
              <p className="text-[9px] uppercase tracking-widest text-primary/50">Super Admin</p>
            </div>
            <div className="w-9 h-9 rounded-sm bg-secondary flex items-center justify-center text-primary font-bold text-xs">
              AZ
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Area */}
        <div className="p-4 md:p-8">
          {isBaseAdmin ? (
            <DashboardOverview />
          ) : (
            <div className="bg-white p-4 md:p-8 rounded-sm shadow-sm border border-accent/20 min-h-[60vh]">
              <Outlet />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};



export default AdminLayout;

