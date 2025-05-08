import { Button, StyleSheet, Text, View, NativeModules } from 'react-native'
import React from 'react'

const { ZaloPayModule } = NativeModules;

const ZaloPayPaymentScreen = () => {
    async function handlePayOrder(zpTransToken) {
        try {
          const result = await ZaloPayModule.payOrder(zpTransToken);
          console.log('Thanh toán thành công:', result);
          // TODO: Update giao diện hoặc backend
        } catch (error) {
          console.error('Thanh toán lỗi:', error);
          // TODO: Thông báo lỗi
        }
      }
  return (
    <View style = {styles.container}>
      <Button title='Thanh toán' onPress={() => handlePayOrder("ACSZmEnHJvNi1B9pmYBKrlVg")} />
    </View>
  )
}

export default ZaloPayPaymentScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
})