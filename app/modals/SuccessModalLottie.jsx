import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native'
import { appColors } from '../constants/appColors'

const SuccessModalLottie = () => {
  return (
         <View style={styles.container}>
                <LottieView style={styles.lottieView} source={require("../../assets/lottie/success-lottie.json")} autoPlay loop />
         </View>
  )
}

export default SuccessModalLottie

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: appColors.white
    },
    lottieView: {
        flex: 1,
    }
})