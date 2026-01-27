import React from 'react'
import Slider from './Slider'

const HeroBanner = ({banners}) => {
  return (
    <div className='w-full'>
      <Slider banners={banners}/>
      
    </div>
  )
}

export default HeroBanner
