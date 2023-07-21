import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View,Text } from "react-native";

export function isPrime(number: number) {
    if (number <= 1) return false;
    if (number <= 3) return true;

    if (number % 2 === 0 || number % 3 === 0) return false;

    let i = 5;
    while (i * i <= number) {
        if (number % i === 0 || number % (i + 2) === 0) return false;
        i += 6;
    }

    return true;
}
export function generateFirstNPrimes(n: number) {
    const primes = [];
    let number = 2;

    while (primes.length < n) {
        if (isPrime(number)) {
            primes.push(number);
        }
        number++;
    }

    return primes;
}


function isComposite(number: number) {
    if (number <= 1) return true;

    // A composite number has factors other than 1 and itself.
    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            return true;
        }
    }

    return false;
}

export function generateFirstNComposites(n: number) {
    const composites = [];
    let number = 1; // Start from 1, which is considered a composite number.

    while (composites.length < n) {
        if (isComposite(number)) {
            composites.push(number);
        }
        number++;
    }

    return composites;
}

export const Level = ({ level }: any) => {
    return (
        <View className='ml-auto mt-6 mr-6 flex flex-row '>
            <View className='my-auto'>
                <FontAwesome5 name="crown" size={24} color="#9f9f9f" />
            </View>
            <Text className='text-xl text-gray-500 ml-2 my-auto'>{level}</Text>
        </View>
    )
}

export const SecondsToMinutesAndSeconds = (totalSeconds:number) => {
    const secondsToMinutesAndSeconds = (totalSeconds:number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return { minutes, seconds };
    };

    const { minutes, seconds } = secondsToMinutesAndSeconds(totalSeconds);

    return minutes + " : " + seconds
};

export async function addTimer() {
    try {
        await AsyncStorage.setItem('lastUpdateTime', (new Date()).toISOString())
    }
    catch (e) {

    }
}