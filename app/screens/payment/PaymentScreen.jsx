import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { AxiosInstance } from '../../services';
import { ButtonComponent, ContainerComponent, RowComponent, SectionComponent, TextComponent } from '../../components';
import { globalStyles } from '../../constants/globalStyles';
import LoadingModal from '../../modals/LoadingModal';

const PaymentScreen = ({ navigation, route }) => {

  const { id, total } = route.params;
  const [loading, setLoading] = useState(false);

  const createTicket = async () => {
    try {
      setLoading(true);
      const body = {
        orderId: id,
        paymentId: 123
      }
      const ticket = await AxiosInstance().post("/orders/createTicket", body);
      console.log(ticket.data);
      navigation.navigate("Drawer");
    } catch (e) {
      console.log("Tạo vé thất bại "+e);
    }
    finally{
      setLoading(false);
      
    }
  }
  return (
    <View style={[globalStyles.container, styles.container]}>
      <SectionComponent>
        <TextComponent text={"Xác Nhận Thanh Toán"} title/>
      </SectionComponent>
      <SectionComponent>
        <RowComponent justify='space-between'>
          <TextComponent text={"Mã hóa đơn: "}/>
          <TextComponent text={id}/>
        </RowComponent>
        <RowComponent justify='space-between'>
          <TextComponent text={"Ngày đặt vé: "}/>
          <TextComponent text={new Date().toLocaleDateString()}/>
        </RowComponent>
        <RowComponent justify='space-between'>
          <TextComponent text={"Tổng thanh toán: "}/>
          <TextComponent text={total}/>
        </RowComponent>
      </SectionComponent>
      <SectionComponent >
        <ButtonComponent onPress={createTicket} text={"Xác nhận thanh toán"} type="primary"/>
      </SectionComponent>
      <LoadingModal visible={loading} />
    </View>
  )
}

export default PaymentScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  } 
})