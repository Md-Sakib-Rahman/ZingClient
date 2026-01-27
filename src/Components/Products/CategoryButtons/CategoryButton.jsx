import React from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

const CategoryButton = ({category}) => {
  const { id } = useParams();
  console.log(id)
  return (
    <Link to={`/products/${category._id}`}  className={`btn btn-outline-primary ${id === category._id ? 'btn-primary' : ''} rounded-3xl`}>
      {category.name}
    </Link>
  )
}

export default CategoryButton
