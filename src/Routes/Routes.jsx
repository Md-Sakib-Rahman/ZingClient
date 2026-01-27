import React from 'react'
import { createBrowserRouter, Outlet } from 'react-router';
import Home from '../Pages/Home/Home';
import Root from '../Layouts/RootLayout/Root';
import Login from '../Pages/Auth/Login/Login';
import Register from '../Pages/Auth/Register/Register';
import Categories from '../Pages/Categories/Categories';
import ProductPage from '../Pages/Products/ProductPage';
import ProductsLayout from '../Layouts/ChildLayouts/ProductsLayout/ProductsLayout';
import AdminLayout from '../Layouts/AdminLayout/AdminLayout';
import ProductDetailsPage from '../Pages/Products/ProductDetailsPage';
import CartPage from '../Pages/CartPage/CartPage';
import AllProductPage from '../DashboardPages/Admin/AllProductPage/AllProductPage';
import CreateProduct from '../DashboardPages/Admin/CreateProduct/CreateProduct';
import CheckOutPage from '../Pages/CheckOutPage/CheckOutPage';
import ProductEdit from '../DashboardPages/Admin/ProductEdit/ProductEdit';
import AllCategoryPage from '../DashboardPages/Admin/AllCategoryPage/AllCategoryPage';
import CreateCategoryPage from '../DashboardPages/Admin/CreateCategoryPage/CreateCategoryPage';
import OrderPage from '../DashboardPages/Admin/OrderPage/OrderPage';
import AllUsersPage from '../DashboardPages/Admin/AllUsersPage/AllUsersPage';
import EmployeesPage from '../DashboardPages/Admin/EmployeesPage/EmployeesPage';
import AddEmployeePage from '../DashboardPages/Admin/AddEmployeePage/AddEmployeePage';
import ErrorPage from '../Pages/ErrorPage/ErrorPage';
import SetBanner from '../DashboardPages/SetBanner/SetBanner';
import AdminProtectedRoute from './AdminProtectedRoute';

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage/> ,
    children:[
      {
        index: true,
        element: <Home/>
      },
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/register",
        element: <Register/>
      },
      {
        path: "/categories",
        element: <Categories/>
      },
      {
        path: "/products",
        element: <ProductsLayout/>,
        children:[
          {
            index: true,
            element: <ProductPage/>
          },
          {
            path: ":id",
            element: <ProductPage/>
          },
        ]
      },
      {
        path: "/productdetailspage/:id",
        element: <ProductDetailsPage/>
      },
      {
        path: "/cart",
        element: <CartPage/>
      },
      {
        path: "/checkout",
        element: <CheckOutPage/>
      },
    ]
  },
  {
    path: "/admin",
    element: <AdminProtectedRoute><AdminLayout/></AdminProtectedRoute> ,
    children: [
      {
        path: '/admin/products',
        element: <AllProductPage/>
      },
      {
        path: '/admin/create-product',
        element: <CreateProduct/>
      },
      {
        path: '/admin/product/edit/:id',
        element: <ProductEdit/>
      },
      {
        path: '/admin/listing',
        element: <AllCategoryPage/>
      },
      {
        path: '/admin/create-category',
        element: <CreateCategoryPage/>
      },
      {
        path: '/admin/orders',
        element: <OrderPage/>
      },
      {
        path: '/admin/users',
        element: <AllUsersPage/>
      },
      {
        path: '/admin/users/employees',
        element: <EmployeesPage/>
      },
      {
        path: '/admin/create-employee',
        element: <AddEmployeePage/>
      },
      {
        path: '/admin/setbanner',
        element: <SetBanner/>
      },
      
    ]
  }
]);

export default Router
