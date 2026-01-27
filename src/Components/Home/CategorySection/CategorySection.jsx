import React from 'react'
import CategorySlider from './CategorySlider'
import { Link } from 'react-router'

const CategorySection = ({categories}) => {
  return (
    <div>
      <div className="flex justify-between items-end my-5 border-b border-accent pb-4">
        <div>
          <h2 className="  text-3xl max-md:text-xl text-primary tracking-tight font-semibold">
            Curated Collections
          </h2>
          <p className="text-sm text-base-content/60 uppercase  mt-2">
            Explore the latest essentials
          </p>
        </div>
        <Link to="/categories" className="text-xs bg-accent hover:bg-primary  p-2 uppercase tracking-widest font-semibold border-b border-primary text-primary hover:text-secondary hover:border-secondary transition-colors pb-1">
          View All
        </Link>
      </div> 
      <div>
        <CategorySlider categories={categories}/>
      </div>
    </div>
  )
}

export default CategorySection
