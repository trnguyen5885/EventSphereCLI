import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Image
} from 'react-native';
import { CardComponent, RowComponent } from '../../components';
import { appColors } from '../../constants/appColors';
import { globalStyles } from '../../constants/globalStyles';
import { AxiosInstance } from '../../services';
import { formatDate } from "../../services/utils/date";
import AsyncStorage from '@react-native-async-storage/async-storage';
import  Ionicons  from 'react-native-vector-icons/Ionicons';

const TicketEventScreen = ({navigation, route}) => {

  const { id } = route.params;
  const [userID, setUserID] = useState();

  const [eventInfo, setEventInfo] = useState({
      name: "",
      timeStart: 0,
      timeEnd: 0,
      location: "",
      ticketPrice: 0,
  });
  const [formData, setFormData] = useState({
      fullName: '',
      phone: '',
      email: '',
      tickets: {
        normal: 0,
        vip: 0
      },
      paymentMethod: ''
    });

    const ticketTypes = {
      normal: {
        name: 'Vé Thường',
        price: eventInfo ? eventInfo.ticketPrice : 0,
      },
      vip: {
        name: 'Vé VIP',
        price: eventInfo ? eventInfo.ticketPrice * 2 : 0,
      }
    };


  useEffect(() => {

      const getInfoEvent = async () => {
          const response = await AxiosInstance().get(`events/detail/${id}`);
          const userId = await AsyncStorage.getItem("userId");
          console.log(response.data)
          setEventInfo(response.data);
          setUserID(userId);

      };

      getInfoEvent();

      return () => {
          setEventInfo(null);
      };
  }, []);

    const updateTicketQuantity = (type, change) => {
      const newQuantity = formData.tickets[type] + change;
      if (newQuantity >= 0 && newQuantity <= 10) {
        setFormData({
          ...formData,
          tickets: {
            ...formData.tickets,
            [type]: newQuantity
          }
        });
      }
    };

    const calculateTotal = () => {
      return (formData.tickets.normal * ticketTypes.normal.price) +
             (formData.tickets.vip * ticketTypes.vip.price);
    };

    const isFormValid = () => {
      // return formData.fullName.trim() !== '' &&
      //        formData.phone.trim() !== '' &&
            return (formData.tickets.normal > 0 || formData.tickets.vip > 0) &&
             formData.paymentMethod !== '';
    };

    const handleNavigation = () => {
      navigation.goBack();
    };

    const confirmOrder = async() =>{
      // try{
      //   const body = {
      //     eventId: id,
      //     userId: userID,
      //     amount: formData.tickets.normal
      //   };
      //   const createOrder = await AxiosInstance().post("orders/createOrder", body);
      //   const totalAmount = calculateTotal();
      //   navigation.navigate("Payment",{
      //     id: createOrder.data,
      //     total: totalAmount,
      //   });
      // }catch(e){
      //   console.log("Tạo đơn hàng thất bại " + e);
      // }

      if(formData.paymentMethod === 'banking') {
        navigation.navigate("PaymentQRCode", {
          amount: eventInfo.ticketPrice
        })
      }
      if(formData.paymentMethod === 'momo') {
        console.log("Momo")
      }
      if(formData.paymentMethod === 'zalo') {
        console.log("Zalo")
      }
    };

      return (
        <View style={[globalStyles.container]}>
            <View style={styles.header}>
                <RowComponent onPress={handleNavigation}  styles = {{columnGap: 25}}>
                    <Ionicons name="chevron-back" size={26} color="white" />  
                    <Text style = {styles.headerTitle} >Thanh toán</Text>
                </RowComponent>
            </View>

          <ScrollView>
            {/* Event Information */}

             <CardComponent styles = {{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
             }}>
             <Text style={styles.title}>Thông tin sự kiện</Text>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{eventInfo.name}</Text>
                    <Text style={styles.eventDetail}>Ngày: {`${formatDate(eventInfo.timeStart)} - ${formatDate(eventInfo.timeEnd)} `}</Text>
                    <Text style={styles.eventDetail}>Thời gian: {eventInfo.time}</Text>
                    <Text style={styles.eventDetail}>Địa điểm: {eventInfo.location}</Text>
                </View>
             </CardComponent>


            {/* Personal Information */}
            {/* <CardComponent styles = {{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
             }}>

              <Text style={styles.title}>Thông tin cá nhân</Text>
              <TextInput
                  style={styles.input}
                  placeholder="Họ và tên"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({...formData, fullName: text})}
              />
              <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
              />
              <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
              />
           </CardComponent> */}

          {/* Ticket Selection */}
          <View style={styles.card}>
            <Text style={styles.title}>Chọn loại vé</Text>

            {/* Normal Ticket */}
            <View style={styles.ticketType}>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketName}>{ticketTypes.normal.name}</Text>
                <Text style={styles.ticketPrice}>
                  {ticketTypes.normal.price.toLocaleString('vi-VN')} VND
                </Text>
              </View>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[styles.button, formData.tickets.normal <= 0 && styles.buttonDisabled]}
                  onPress={() => updateTicketQuantity('normal', -1)}
                  disabled={formData.tickets.normal <= 0}
                >
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{formData.tickets.normal}</Text>
                <TouchableOpacity
                  style={[styles.button, formData.tickets.normal >= 10 && styles.buttonDisabled]}
                  onPress={() => updateTicketQuantity('normal', 1)}
                  disabled={formData.tickets.normal >= 10}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* VIP Ticket */}
            {/*
            <View style={styles.ticketType}>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketName}>{ticketTypes.vip.name}</Text>
                <Text style={styles.ticketPrice}>
                  {ticketTypes.vip.price.toLocaleString('vi-VN')} VND
                </Text>
              </View>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[styles.button, formData.tickets.vip <= 0 && styles.buttonDisabled]}
                  onPress={() => updateTicketQuantity('vip', -1)}
                  disabled={formData.tickets.vip <= 0}
                >
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{formData.tickets.vip}</Text>
                <TouchableOpacity
                  style={[styles.button, formData.tickets.vip >= 10 && styles.buttonDisabled]}
                  onPress={() => updateTicketQuantity('vip', 1)}
                  disabled={formData.tickets.vip >= 10}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            */}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng tiền:</Text>
              <Text style={styles.totalPrice}>
                {calculateTotal().toLocaleString('vi-VN')} VND
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.card}>
            <Text style={styles.title}>Phương thức thanh toán</Text>
            <TouchableOpacity
              style={[styles.paymentMethod, formData.paymentMethod === 'zalo' && styles.selectedPayment]}
              onPress={() => setFormData({...formData, paymentMethod: 'zalo'})}
            >
              <Text style={styles.paymentText}>Zalo Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentMethod, formData.paymentMethod === 'momo' && styles.selectedPayment]}
              onPress={() => setFormData({...formData, paymentMethod: 'momo'})}
            >
              <Text style={styles.paymentText}>Momo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentMethod, formData.paymentMethod === 'banking' && styles.selectedPayment]}
              onPress={() => setFormData({...formData, paymentMethod: 'banking'})}
            >
              <Text style={styles.paymentText}>Chuyển khoản ngân hàng</Text>
            </TouchableOpacity>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={[styles.checkoutButton, !isFormValid() && styles.buttonDisabled]}
            disabled={!isFormValid()}
            onPress={confirmOrder}
          >
            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
          </TouchableOpacity>

          
        </ScrollView>
      </View>
    );
};

export default TicketEventScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
      },
      header: {
       flexDirection: 'row',
       alignItems: "center",
       justifyContent: 'space-between',
       padding: 12,
       backgroundColor: appColors.primary,
       paddingTop: Platform.OS === "ios" ? 66 : 22
      },
      headerTitle: {
      color: appColors.white2,
      fontSize: 22,
      fontWeight: "500" },
      card: {
        backgroundColor: 'white',
        margin: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
      },
      eventInfo: {
        marginBottom: 8,
      },
      eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
      },
      eventDetail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
      },
      input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
      },
      ticketType: {
        marginBottom: 16,
      },
      ticketInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      ticketName: {
        fontSize: 16,
        fontWeight: '500',
      },
      ticketPrice: {
        fontSize: 16,
        color: '#666',
      },
      quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      button: {
        width: 36,
        height: 36,
        backgroundColor: appColors.primary,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
      },
      buttonDisabled: {
        backgroundColor: '#ccc',
      },
      buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
      },
      quantity: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 20,
      },
      totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
      },
      totalLabel: {
        fontSize: 16,
        color: '#666',
      },
      totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: appColors.primary,
      },
      paymentMethod: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 8,
      },
      selectedPayment: {
        borderColor: appColors.primary,
        backgroundColor: '#f0f9ff',
      },
      paymentText: {
        fontSize: 16,
      },
      checkoutButton: {
        backgroundColor: appColors.primary,
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
      },
      checkoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
      qrImage: {
        width: 200,
        height: 200
      }
});