import { View, Text, TouchableOpacity, LogBox, ToastAndroid, Image, Touchable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av'
import { Level, SecondsToMinutesAndSeconds, addTimer, generateFirstNComposites, generateFirstNPrimes } from './functions';
import { SafeAreaView } from 'react-native-safe-area-context';
import Confetti from 'react-native-confetti';
import { EvilIcons } from '@expo/vector-icons';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
const adUnitId = !__DEV__ ? TestIds.REWARDED : 'ca-app-pub-5538246857770534/4284500685';
const adUnitId2 =! __DEV__ ? TestIds.REWARDED : 'ca-app-pub-5538246857770534/7483533184';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
    keywords: ['fashion', 'clothing'],
});
const rewarded2 = RewardedAd.createForAdRequest(adUnitId2, {
    requestNonPersonalizedAdsOnly: true,
    keywords: ['fashion', 'clothing'],
});

const Main = ({ gameLevel, waitTime, healthLeft }: any) => {
    LogBox.ignoreAllLogs()
    const confetti = useRef()
    const [toggleRemoveAd, setTogglRemoveAd] = useState(false)
    const [reviveReward, setReviveReward] = useState(false)
    const [backReward, setBackReward] = useState(false)
    const [loaded, setLoaded] = useState(false);
    const [loaded2, setLoaded2] = useState(false);
    const [level, setLevel] = useState(gameLevel)
    const primes = generateFirstNPrimes(1000);
    const composites = generateFirstNComposites(12);
    const [val, setVal] = useState('')
    const [toggle, setToggle] = useState(true)
    const [selected, setSelected] = useState([])
    const [allow, setAllow] = useState(0)
    const [buttonSound, setButtonSound] = useState()
    const [interfaceSound, setInterfaceSound] = useState()
    const [sucessSound, setSucessSound] = useState()
    const [failureSound, setFailureSound] = useState()
    const [showPause, setShowPause] = useState(false)
    const [health, setHealth] = useState(healthLeft)
    const [time, setTime] = useState(0)
    function runRemoveSucess() {

        let split = val.match(/(?:\d+|[+\-*])/g)
        const removed = split?.pop()
        setToggle(true)
        if (split?.length == 0) {
            setVal("")
            setToggle(true)
            setSelected([])
        } else if (split?.length == 1) {
            setVal(split[0])
            setToggle(false)
        } else {
            setVal(split?.join(''))
            if (removed == "+" || removed == "-" || removed == "*") {
                setToggle(false)

            } else {
                const temp = selected
                const x = temp.filter((number) => number != removed);
                setSelected([...x])

                setToggle(true)
            }
        }
    }


    function solveEquation(equation: string) {
        if (equation) {
            if (equation.length == 1) {
                return equation
            }
            let res = equation.charAt(equation.length - 1);
            var result;
            if (res == "+" || res == "-" || res == "*") {
                equation = equation.slice(0, -1).replace(/\s/g, '');
                result = eval(equation);
            } else {
                equation = equation.replace(/\s/g, '');
                result = eval(equation);
            }

            return (result)
        } else {
            return ""
        }
    }

    useEffect(() => {
        if (backReward == true) {
            console.log(val)
            runRemoveSucess()
            setBackReward(false)
            rewarded.load()
            setTogglRemoveAd(!toggle)

        }
    }, [backReward])

    useEffect(() => {

        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setLoaded(true);
        });
        const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {

                setBackReward(true)

            },
        );

        rewarded.load();
        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();

        };
    }, [toggleRemoveAd]);

    async function removeUpdateTime() {
        await AsyncStorage.removeItem('lastUpdateTime')
        setTime(0)
        setHealth(3)
    }
    useEffect(() => {
        if (reviveReward == true) {
            removeUpdateTime()
            setReviveReward(false)
        }
    }, [reviveReward])
    useEffect(() => {
        const unsubscribeLoaded = rewarded2.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setLoaded2(true)
        });
        const unsubscribeEarned = rewarded2.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('User earned reward of ', reward);
                setReviveReward(true)

                //runRemoveSucess(temp)
            },
        );
        rewarded2.load();
        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, []);


    useEffect(() => {
        setAllow(5 + Math.floor((level - 1) / 13))
    }, [level])

    const levelUp = async () => {
        await AsyncStorage.setItem('level', (0 + 1).toString());
        setLevel(level + 1)
    }

    async function onPressNumber(item: number) {
        await playNumberSound()
        setVal(val + item.toString());
        setToggle(false);
        let temp = selected;
        temp.push(item);
        setSelected([...temp])
        if (solveEquation(val + item.toString()) == primes[level + 4]) {
            playSucess()
            setShowPause(true)
            confetti.current.startConfetti()


        }
        if (temp.length == allow) {
            playFailure()
            if (health - 1 != -1) {
                if (health - 1 == 0) {
                    addTimer()
                }
                setHealth(health - 1)
            }
            setSelected([])
            setToggle(true)
            setVal("")
        }
    }





    const compareWithStoredTime = async () => {
        try {
            const storedTime = await AsyncStorage.getItem('lastUpdateTime');
            if (storedTime) {
                const storedDate = new Date(storedTime);
                const currentDate = new Date();
                const timeDifferenceInSeconds = (currentDate - storedDate) / 1000;

                if (timeDifferenceInSeconds < waitTime * 60) {
                    setHealth(0)
                    setTime(waitTime * 60 - timeDifferenceInSeconds)
                } else {
                    setHealth(3)
                    await AsyncStorage.removeItem('lastUpdateTime')
                }
                // You can perform any comparison based on the time difference here
            } else {
                setHealth(3)
                console.log('No stored time found.');
            }
        } catch (error) {
            console.log('Error reading stored time:', error);
        }
    };
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Your logic here
            if (health == 0) {
                compareWithStoredTime()
            }
        }, 1000); // Interval set to 1000 milliseconds (1 second)

        // Clean up the interval when the component unmounts or when the dependency array changes.
        return () => clearInterval(intervalId);

    }, [health])
    //sound UseStart
    React.useEffect(() => {
        return sucessSound
            ? () => {
                sucessSound.unloadAsync();
            }
            : undefined;
    }, [sucessSound]);
    React.useEffect(() => {
        return failureSound
            ? () => {
                failureSound.unloadAsync();
            }
            : undefined;
    }, [failureSound]);
    React.useEffect(() => {
        return interfaceSound
            ? () => {
                interfaceSound.unloadAsync();
            }
            : undefined;
    }, [interfaceSound]);

    React.useEffect(() => {
        return buttonSound
            ? () => {
                buttonSound.unloadAsync();
            }
            : undefined;
    }, [buttonSound]);

    async function playFailure() {
        const { sound } = await Audio.Sound.createAsync(require('../assets/failure.mp3')
        );
        setFailureSound(sound);
        await sound.playAsync();
    }
    async function playNumberSound() {
        const { sound } = await Audio.Sound.createAsync(require('../assets/number.mp3')
        );
        setButtonSound(sound);
        await sound.playAsync();
    }


    async function playInterfaceSound() {
        const { sound } = await Audio.Sound.createAsync(require('../assets/symbol.mp3')
        );
        setInterfaceSound(sound);
        await sound.playAsync();
    }

    async function playSucess() {
        const { sound } = await Audio.Sound.createAsync(require('../assets/sucess.mp3')
        );
        setSucessSound(sound);
        await sound.playAsync();
    }
    async function onInterfaceButton(symbol: string) {
        await playInterfaceSound()
        setVal(val + symbol);
        setToggle(true)
    }

    //Sound Use Stop


    const removeLast = () => {
        if (val.length == 0) {
        } else {
            if (rewarded.loaded) {
                rewarded.show()
            } else {
                rewarded.load()
                ToastAndroid.showWithGravity(
                    'Try Again',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                )
            }
        }
    }
    const watchAd = () => {

        if (rewarded2.loaded) {
            rewarded2.show()
        } else {
            rewarded2.load()
            ToastAndroid.showWithGravity(
                'Try Again',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            )
        }


    }

    return (
        <>
            {health == null ? <></> :
                <>
                    {showPause &&
                        <TouchableOpacity onPress={() => {
                            setShowPause(false)
                            setSelected([])
                            setToggle(true)
                            setVal("")
                            levelUp()
                            confetti.current.stopConfetti()
                        }} activeOpacity={0.6} className='absolute w-full h-full bg-black z-50 opacity-80 items-center justify-center'>
                            <View className='mb-44 flex flex-col'>
                                <View className='mx-auto'>
                                    <FontAwesome5 name="crown" size={70} color="#9f9f9f" />
                                </View>
                                <Text className='text-base text-[#9f9f9f] text-center font-light my-4'>Level: {level}</Text>
                                <Text className='text-xl text-[#9f9f9f] text-center font-light my-4'>Press to continue...</Text>
                            </View>

                        </TouchableOpacity>
                    }
                    {health == 0 &&
                        <TouchableOpacity onPress={() => {

                        }} activeOpacity={0.8} className='absolute w-full h-full bg-black z-50 opacity-90 items-center justify-center'>
                            <View className='mb-60 flex flex-col'>
                                <View className='mr-auto mt-6 ml-6 flex flex-col justify-center'>
                                    <View className='mx-auto'>
                                        <AntDesign name="hearto" size={70} color="#9f9f9f" />
                                    </View>
                                    <Text className='text-base text-[#9f9f9f] text-center font-light my-4'>No Lives Remaining</Text>
                                    <Text className='text-2xl text-[#9f9f9f] text-center font-light my-4'>{SecondsToMinutesAndSeconds(parseInt(time.toFixed(0)))}  sec</Text>
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => watchAd()} className='flex flex-row justify-center rounded-2xl bg-red-700 p-4'>
                                        <Text className='text-sm text-[#fff] text-center font-light my-auto '>Watch Ad to Revive</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </TouchableOpacity>
                    }
                    <SafeAreaView className='flex-1 flex flex-col '>
                        <Confetti untilStopped={true} duration={500} size={2} ref={ref => confetti.current = ref} />
                        <View className='flex-1 flex flex-col'>
                            <View className='flex flex-row'>
                                <View className='mr-auto mt-6 ml-6 flex flex-row justify-center'>
                                    <AntDesign name="heart" size={24} color="#9f9f9f" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
                                    <AntDesign name="close" size={16} color="#9f9f9f" style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 10 }} />
                                    <Text className='my-auto text-[#9f9f9f]'>{health}</Text>
                                </View>

                                <Level level={level} />
                            </View>
                            <View className='flex-1'>
                                <Text className='text-6xl my-auto text-center'>{primes[level + 4]}</Text>
                                <View className='my-auto flex flex-row mx-auto'>

                                    <Text className='text-4xl text-gray-300'>{val != "" ? val : ""}</Text>
                                    <Text className='text-4xl text-gray-300'>{val != "" ? "=" + solveEquation(val) : ""}</Text>
                                </View>
                            </View>
                            <View className='mr-auto mt-auto my-6 ml-2 flex flex-row justify-center'>
                                <TouchableOpacity onPress={() => {
                                    playFailure()
                                    if (health - 1 != -1) {
                                        if (health - 1 == 0) {
                                            addTimer()
                                        }
                                        setHealth(health - 1)
                                    }
                                    setSelected([])
                                    setToggle(true)
                                    setVal("")
                                }} activeOpacity={0.8} className='bg-gray-400 p-3 rounded-md items-center justify-center'>
                                    <EvilIcons name="undo" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View className='flex-1 flex flex-row'>

                            <View className='flex flex-row flex-wrap mx-auto flex-1 overflow-y-scroll'>
                                {composites.map((item: any, index: any) => {
                                    return (
                                        <>
                                            {index < allow ?
                                                <>
                                                    {selected.includes(item) ?
                                                        <TouchableOpacity key={index} activeOpacity={0.7} disabled={true} className='bg-gray-100 w-1/3 h-1/4 items-center justify-center border border-white'>
                                                            <Text className={'text-[#9f9f9f] text-2xl'}>{item}</Text>
                                                        </TouchableOpacity>
                                                        :
                                                        <TouchableOpacity key={index} activeOpacity={0.7} disabled={!toggle} onPressIn={() => onPressNumber(item)} className={toggle ? 'bg-slate-700 w-1/3 h-1/4 items-center justify-center border border-white' : 'bg-[#d2d4da] w-1/3 h-1/4 items-center justify-center border border-white'}>
                                                            <Text className={toggle ? 'text-white text-2xl' : 'text-[#9f9f9f] text-2xl'}>{item}</Text>
                                                        </TouchableOpacity>}
                                                </>
                                                :
                                                <TouchableOpacity key={index} activeOpacity={0.7} onPress={() => ToastAndroid.showWithGravity(
                                                    'Level Up To Unlock',
                                                    ToastAndroid.SHORT,
                                                    ToastAndroid.CENTER,
                                                )} className='bg-gray-100 w-1/3 h-1/4 border border-gray-200'>
                                                    <View className=' mx-auto my-auto'>
                                                        <Ionicons name="md-lock-closed" size={22} color="#afafaf" />
                                                    </View>

                                                </TouchableOpacity>
                                            }
                                        </>
                                    )
                                })}
                            </View>
                            <View className='bg-blackflex flex-col mx-auto w-1/4'>
                                <TouchableOpacity activeOpacity={0.9} onPress={() => { removeLast() }} className={'w-full h-1/4 items-center justify-center bg-slate-900 '}>
                                    <View style={{ transform: [{ rotateZ: '45deg' }] }} className='absolute top-0 right-0 bg-red-700 rounded-md p-2'>
                                        <Text className='text-white text-[12px]'>Ads</Text>
                                    </View>
                                    <Ionicons name="backspace-outline" size={28} color="#fff" />

                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.8} onPressIn={() => onInterfaceButton('+')} disabled={toggle} className={!toggle ? 'w-full h-1/4 items-center justify-center bg-slate-700 border-b border-b-white' : 'w-full h-1/4 items-center justify-center bg-[#d2d4da] border-b border-b-white'}>
                                    <AntDesign name="plus" size={20} color={toggle ? "#7f7f7f" : "#fff"} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.8} onPressIn={() => onInterfaceButton('-')} disabled={toggle} className={!toggle ? 'w-full h-1/4 items-center justify-center bg-slate-700 border-b border-b-white' : 'w-full h-1/4 items-center justify-center bg-[#d2d4da] border-b border-b-white'}>
                                    <AntDesign name="minus" size={20} color={toggle ? "#7f7f7f" : "#fff"} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.8} onPressIn={() => onInterfaceButton('*')} disabled={toggle} className={!toggle ? 'w-full h-1/4 items-center justify-center bg-slate-700 border-b border-b-white' : 'w-full h-1/4 items-center justify-center bg-[#d2d4da] border-b border-b-white'}>
                                    <AntDesign name="close" size={20} color={toggle ? "#7f7f7f" : "#fff"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView >
                </>
            }
        </>
    )
}



export default Main