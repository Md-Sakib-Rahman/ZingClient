import React from 'react'
import Navbar from '../../Components/Shared/Navbar/Navbar'
import { Outlet } from 'react-router'
import Footer from '../../Components/Shared/Footer/Footer'

const Root = () => {
  return (
    <>
        <Navbar/>
        <div className='w-11/12 mx-auto pt-20'>
            <Outlet/>
        </div>
        <Footer/>
    </>
  )
}

export default Root
