import React, { useEffect, useState } from 'react'
import Main from './main'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Splash from './Splash';
import 'expo-dev-client'

const _layout = () => {
  const [level, setLevel] = useState(null)
  const [healthLeft, setHealthLeft] = useState(null)

  const waitTime = 20
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('level');
      const temp = (jsonValue != null ? JSON.parse(jsonValue) : 1)
      try {
        const storedTime = await AsyncStorage.getItem('lastUpdateTime');
        if (storedTime) {
          const storedDate = new Date(storedTime);
          const currentDate = new Date();
          const timeDifferenceInSeconds = (currentDate - storedDate) / 1000;
          if (timeDifferenceInSeconds < waitTime * 60) {
            setHealthLeft(0)
          } else {
            setHealthLeft(3)
            await AsyncStorage.removeItem('lastUpdateTime')
          }
        } else {
          setHealthLeft(3)
        }
      } catch (error) {
      }
      setLevel(temp)
    } catch (e) {
    }
  };

  useEffect(() => {
    getData()
  }, [healthLeft])
  if (level == null || healthLeft == null) {
    return <Splash />
  }
  return (
    <Main gameLevel={level} waitTime={waitTime} healthLeft={healthLeft} />
  )
}

export default _layout