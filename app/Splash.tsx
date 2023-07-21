import { View, Text,Image } from 'react-native'
import React from 'react'

const Splash = () => {
  return (
    <Image source={require('../assets/images/splash.png')} className='w-full h-full object-contain' />
  )
}

export default Splash