import React from "react";
import { Link, NavLink } from "react-router";
import Logo from "../Logo/Logo";
import { FaCartShopping } from "react-icons/fa6";
import { AuthContext } from "../../../Context/AuthContext";
import Swal from "sweetalert2";

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);

  const handleLogout = () => {
    logout();
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Logged out successfully',
      showConfirmButton: false,
      timer: 1500
    })
  }

  // Common styling for NavLinks to keep code clean
  const getNavLinkClass = ({ isActive }) => `
    nav-link-luxe
    hover:text-primary
    ${isActive 
      ? "text-primary border-b border-primary/40 pb-1 font-bold" 
      : "text-base-content/70"}
  `;

  return (
    <div className="fixed right-0 left-0 z-50 mx-auto navbar bg-base-100 shadow-md max-w-11/12 my-4 rounded-3xl px-5">
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          {/* MOBILE MENU */}
          <ul
            tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow inter font-bold gap-2"
          >
            <li><Link to="/">Home</Link></li>
            {/* Conditional Admin Link for Mobile */}
            {user?.role === 'admin' && (
               <li><Link to="/admin" className="text-primary">Dashboard</Link></li>
            )}
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/products">Products</Link></li>
          </ul>
        </div>
        <Link to="/"> <Logo/> </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        {/* DESKTOP MENU */}
        <ul className="menu menu-horizontal px-1 gap-5 text-sm inter tracking-widest">
           <li>
             <NavLink className={getNavLinkClass} to="/">Home</NavLink>
           </li>
           
           {/* Conditional Admin Link for Desktop */}
           {user?.role === 'admin' && (
             <li>
               <NavLink className={getNavLinkClass} to="/admin">Dashboard</NavLink>
             </li>
           )}

           <li>
             <NavLink className={getNavLinkClass} to="/categories">Categories</NavLink>
           </li>
           <li>
             <NavLink className={getNavLinkClass} to="/products">Products</NavLink>
           </li>
        </ul>
      </div>

      <div className="navbar-end flex items-center gap-6 rounded-2xl">
        <Link to={"/cart"}><FaCartShopping size={24}/> </Link>
        {user ? (
          <p onClick={handleLogout} className="btn btn-primary rounded-2xl btn-outline cursor-pointer">Logout</p>
        ) : (
          <Link to="/login">
            <p className="btn btn-primary rounded-2xl btn-outline">Login</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
// import React from "react";
// import { Link, NavLink } from "react-router";
// import Logo from "../Logo/Logo";
// import { FaCartShopping } from "react-icons/fa6";
// import { AuthContext } from "../../../Context/AuthContext";
// import Swal from "sweetalert2";
// const Navbar = () => {
//   const {user, logout}= React.useContext(AuthContext);

//   const handleLogout = () => {
//     logout();
//     Swal.fire({
//       position: 'center',
//       icon: 'success',
//       title: 'Logged out successfully',
//       showConfirmButton: false,
//       timer: 1500
//     })
//   }

//   return (
//     <div className=" fixed right-0 left-0 z-99 mx-auto navbar bg-base-100 shadow-md max-w-11/12  my-4 rounded-3xl px-5">
//       <div className="navbar-start">
//         <div className="dropdown">
//           <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               {" "}
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M4 6h16M4 12h8m-8 6h16"
//               />{" "}
//             </svg>
//           </div>
//           <ul
//             tabIndex="-1"
//             className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow inter  font-bold"
//           >
//             <li>Home</li>
//             <li>Categories</li>
//             <li>Products</li>
//             <li>About</li>
//           </ul>
//         </div>
//         <Link> <Logo/> </Link>
//       </div>
//       <div className="navbar-center hidden lg:flex">
//         <ul className="menu menu-horizontal px-1 gap-5 text-sm inter tracking-widest">
//            <li><NavLink className={({ isActive }) => `
//           nav-link-luxe
//           hover:text-primary
//           ${isActive 
//             ? "text-primary border-b border-primary/40 pb-1 font-bold" 
//             : "text-base-content/70"}
//         `} to="/">Home</NavLink></li>
//             <li><NavLink className={({ isActive }) => `
//           nav-link-luxe
//           hover:text-primary
//           ${isActive 
//             ? "text-primary border-b border-primary/40 pb-1 font-bold" 
//             : "text-base-content/70"}
//         `} to="/categories">Categories</NavLink></li>
//             <li><NavLink className={({ isActive }) => `
//           nav-link-luxe
//           hover:text-primary
//           ${isActive 
//             ? "text-primary border-b border-primary/40 pb-1 font-bold" 
//             : "text-base-content/70"}
//         `} to="/products">Products</NavLink></li>
             
//         </ul>
//       </div>
//       {
//         user ? (<div className=" navbar-end flex items-center gap-6 rounded-2xl "><Link to={"/cart"}><FaCartShopping size={24}/> </Link><p onClick={handleLogout} className="btn btn-primary rounded-2xl btn-outline">Logout</p></div>) : (<div className=" navbar-end flex items-center gap-6 rounded-2xl ">
//         <Link to={"/cart"}><FaCartShopping size={24}/> </Link>
//         <Link to="/login">
        
//         <p className="btn btn-primary rounded-2xl btn-outline">Login</p>
//       </Link>
//         </div>)
//       }
 
//     </div>
//   );
// };

// export default Navbar;
