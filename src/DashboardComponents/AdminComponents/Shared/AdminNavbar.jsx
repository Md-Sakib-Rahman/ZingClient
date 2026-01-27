import React from "react";
import { AuthContext } from "../../../Context/AuthContext";
import { Link, NavLink } from "react-router";
import Logo from "../../../Components/Shared/Logo/Logo";
import Swal from "sweetalert2";

const AdminNavbar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const handleLogout = () => {
    logout();
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Logged out successfully",
      showConfirmButton: false,
      timer: 1500,
    });
  };
  return (
    <div className=" fixed right-0 left-0 z-99 mx-auto navbar bg-base-100 shadow-md max-w-11/12  my-4 rounded-3xl px-5">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow inter  font-bold"
          >
            <li>
              <NavLink
                className={({ isActive }) => `
          nav-link-luxe
          hover:text-primary
          ${
            isActive
              ? "text-primary border-b border-primary/40 pb-1 font-bold"
              : "text-base-content/70"
          }
        `}
                to="/admin/listing"
              >
                Listing
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) => `
          nav-link-luxe
          hover:text-primary
          ${
            isActive
              ? "text-primary border-b border-primary/40 pb-1 font-bold"
              : "text-base-content/70"
          }
        `}
                to="/admin"
              >
                Employees
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) => `
          nav-link-luxe
          hover:text-primary
          ${
            isActive
              ? "text-primary border-b border-primary/40 pb-1 font-bold"
              : "text-base-content/70"
          }
        `}
                to="/products"
              >
                Orders
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) => `
          nav-link-luxe
          hover:text-primary
          ${
            isActive
              ? "text-primary border-b border-primary/40 pb-1 font-bold"
              : "text-base-content/70"
          }
        `}
                to="/about"
              >
                History
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-4 min-w-[200px]">
          <Link>
            {" "}
            <Logo />
          </Link>
          <div className=" w-0.5 h-10 bg-black "></div>
          <h2 className="font-bold max-sm:text-sm">Admin Dashboard</h2>
        </div>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-5 text-sm inter tracking-widest">
          <li>
            <NavLink
              className={({ isActive }) => `
          nav-link-luxe
          hover:text-primary
          ${
            isActive
              ? "text-primary border-b border-primary/40 pb-1 font-bold"
              : "text-base-content/70"
          }
        `}
              to="/admin/listing"
            >
              Listing
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) => `
          nav-link-luxe
          hover:text-primary
          ${
            isActive
              ? "text-primary border-b border-primary/40 pb-1 font-bold"
              : "text-base-content/70"
          }
        `}
              to="/admin/users"
            >
              Employees
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) => `
          nav-link-luxe
          hover:text-primary
          ${
            isActive
              ? "text-primary border-b border-primary/40 pb-1 font-bold"
              : "text-base-content/70"
          }
        `}
              to="/products"
            >
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) => `
          nav-link-luxe
          hover:text-primary
          ${
            isActive
              ? "text-primary border-b border-primary/40 pb-1 font-bold"
              : "text-base-content/70"
          }
        `}
              to="/about"
            >
              History
            </NavLink>
          </li>
        </ul>
      </div>
      {user ? (
        <div className=" navbar-end flex items-center gap-6 rounded-2xl ">
          {" "}
          <p
            onClick={handleLogout}
            className="btn btn-primary rounded-2xl btn-outline"
          >
            Logout
          </p>
        </div>
      ) : (
        <Link to="/login" className="navbar-end flex items-center ">
          <p className="btn btn-primary rounded-2xl btn-outline ">Login</p>
        </Link>
      )}
    </div>
  );
};

export default AdminNavbar;
