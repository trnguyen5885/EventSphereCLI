import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import AxiosInstance from '../../services/api/AxiosInstance';
import LoadingModal from '../../modals/LoadingModal';
import {appColors} from '../../../app/constants/appColors';
import RowComponent from '../../../app/components/RowComponent';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NonesScreen = ({navigation, route}) => {
  const {id, showtimeId, typeBase} = route.params;

  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    tickets: {
      normal: 0,
      vip: 0,
    },
  });

  useEffect(() => {
    const getInfoEvent = async () => {
      try {
        const response = await AxiosInstance().get(`/events/detail/${id}`);
        setEventInfo(response.data);
      } catch (error) {
        console.error('Lỗi khi fetch event info:', error);
      } finally {
        setLoading(false);
      }
    };
    getInfoEvent();
  }, [id]);

  const ticketTypes = {
    normal: {
      name: 'Vé tiêu chuẩn',
      price: eventInfo?.showtimes?.[0]?.ticketPrice || 0,
    },
    // vip: {
    //   name: 'Vé VIP',
    //   price: eventInfo?.showtimes?.[0]?.ticketPrice || 0,
    // },
  };

  const handleChangeQuantity = (type, value) => {
    setFormData(prev => {
      const currentQty = prev.tickets[type];
      const newQty = currentQty + value;

      // Không cho giảm dưới 0 hoặc tăng quá 10
      if (newQty < 0 || newQty > 10) return prev;

      return {
        ...prev,
        tickets: {
          ...prev.tickets,
          [type]: newQty,
        },
      };
    });
  };

  const calculateTotal = () => {
    return Object.keys(ticketTypes).reduce((total, type) => {
      const quantity = formData.tickets[type];
      const price = ticketTypes[type].price;
      return total + quantity * price;
    }, 0);
  };

  const totalQuantity = Object.values(formData.tickets).reduce(
    (sum, q) => sum + q,
    0,
  );

  const handleContinue = () => {
    navigation.navigate('Ticket', {
      id,
      typeBase,
      totalPrice: calculateTotal(),
      quantity: formData.tickets.normal + formData.tickets.vip,

      showtimeId,
      tickets: formData.tickets,
    });
  };

  // Component hiển thị control số lượng cho từng ticket type
  const renderQuantityControls = type => {
    const quantity = formData.tickets[type];

    return (
      <View style={styles.quantityContainer}>
        {/* Nút giảm */}
        <TouchableOpacity
          onPress={() => handleChangeQuantity(type, -1)}
          style={[styles.qtyButton, quantity === 0 && styles.qtyButtonDisabled]}
          disabled={quantity === 0}>
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>

        {/* Hiển thị số lượng */}
        <Text style={styles.qtyText}>{quantity}</Text>

        {/* Nút tăng */}
        <TouchableOpacity
          onPress={() => handleChangeQuantity(type, 1)}
          style={[
            styles.qtyButton,
            quantity === 10 && styles.qtyButtonDisabled,
          ]}
          disabled={quantity === 10}>
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <LoadingModal visible={true} />;
  }

  return (
    <View style={[styles.container, {backgroundColor: '#F7FAFC'}]}>
      <View style={styles.header}>
        <StatusBar animated backgroundColor={appColors.primary} />
        <RowComponent styles={{columnGap: 25}}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn loại vé</Text>
        </RowComponent>
      </View>

      <ScrollView style={{flex: 1}}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Loại vé</Text>
          <Text style={styles.sectionTitle}>Số lượng</Text>
        </View>

        {Object.keys(ticketTypes).map(type => {
          const quantity = formData.tickets[type];
          const {name, price} = ticketTypes[type];
          const isSelected = quantity > 0;

          return (
            <View
              key={type}
              style={[
                styles.ticketWrapper,
                isSelected && styles.selectedTicket,
              ]}>
              <View style={styles.ticketItem}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketText}>{name}</Text>
                  <Text style={styles.ticketPrice}>
                    {price.toLocaleString('vi-VN')} đ
                  </Text>
                </View>

                {renderQuantityControls(type)}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerQuantity}>Tổng số vé: {totalQuantity}/10</Text>
          <Text style={styles.footerTotal}>
            Tổng:{' '}
            <Text style={styles.totalAmount}>
              {calculateTotal().toLocaleString('vi-VN')} đ
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, totalQuantity === 0 && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.6}
          disabled={totalQuantity === 0}>
          <Text style={styles.buttonText}>Tiếp tục thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 66 : 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: '500',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  ticketWrapper: {
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedTicket: {
    borderColor: appColors.primary,
    borderWidth: 1,
  },
  ticketItem: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 14,
    color: appColors.primary,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  qtyButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.primary,
    width: 35,
    height: 35,
    borderRadius: 5,
  },
  qtyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.white2,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  footerInfo: {
    marginBottom: 12,
  },
  footerQuantity: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#6c757d',
  },
  footerTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    color: appColors.primary,
    fontWeight: 'bold',
    fontSize: 20,
  },
  button: {
    backgroundColor: appColors.primary,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NonesScreen;
