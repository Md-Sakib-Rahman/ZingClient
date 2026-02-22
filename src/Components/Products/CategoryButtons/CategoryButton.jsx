import React from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import SEO from '../../SEO/SEO';

const CategoryButton = ({category}) => {
  const { id } = useParams();
  return (
    <>
    
    <Link to={`/products/${category._id}`}  className={`btn btn-outline-primary ${id === category._id ? 'btn-primary' : ''} rounded-3xl`}>
      {category.name}
    </Link>
    </>
    
  )
}

export default CategoryButton
