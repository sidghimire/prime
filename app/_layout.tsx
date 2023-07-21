import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import Main from './main'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Splash from './Splash';
import 'expo-dev-client'

const _layout = () => {
  const [level, setLevel] = useState(null)
  const [healthLeft, setHealthLeft] = useState(null)

  const waitTime=1
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('level');
      const temp = (jsonValue != null ? JSON.parse(jsonValue) : 1)
      setLevel(temp)
    } catch (e) {
      // error reading value
    }
  };
  const compareWithStoredTime = async () => {
    try {
        const storedTime = await AsyncStorage.getItem('lastUpdateTime');
        if (storedTime) {
            const storedDate = new Date(storedTime);
            const currentDate = new Date();
            const timeDifferenceInSeconds = (currentDate - storedDate) / 1000;

            if (timeDifferenceInSeconds < waitTime * 60) {
            } else {
                setHealthLeft(5)
                await AsyncStorage.removeItem('lastUpdateTime')
            }
            // You can perform any comparison based on the time difference here
        } else {
            setHealthLeft(5)
            console.log('No stored time found.');
        }
    } catch (error) {
        console.log('Error reading stored time:', error);
    }
};
  useEffect(() => {
    getData()
    compareWithStoredTime()
  }, [])
  if (level == null || healthLeft==null) {
    return <Splash/>
  }
  return (
    <Main gameLevel={level} waitTime={waitTime} healthLeft={healthLeft}/>
  )
}

export default _layout

/*

        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setLoaded(true);
        });
        const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('User earned reward of ', reward);
                if (reward.amount == 10) {
                    setBackReward(true)
                }
            },
        );
        const onCloseAd = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
            setLoaded(false);
            rewarded.load()
        });
        const onOpenAd = rewarded.addAdEventListener(AdEventType.OPENED, () => {
            setLoaded(false);
        });
        if (rewarded.loaded) {
            setLoaded(true)
        } else {
            rewarded.load();
        }
        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();

        };*/