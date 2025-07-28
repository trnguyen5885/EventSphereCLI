import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AxiosInstance from '../../services/api/AxiosInstance';
import {appColors} from '../../../app/constants/appColors';
import RowComponent from '../../../app/components/RowComponent';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingModal from '../../modals/LoadingModal';

const ZonesScreen = ({navigation, route}: any) => {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Thay đổi: sử dụng object để lưu số lượng của từng zone
  const [zoneQuantities, setZoneQuantities] = useState<{[key: string]: number}>(
    {},
  );
  const {id, showtimeId, typeBase} = route.params;

  // Tính tổng tiền từ tất cả các zone đã chọn
  const totalPrice = zones.reduce((total, zone) => {
    const quantity = zoneQuantities[zone._id] || 0;
    return total + zone.price * quantity;
  }, 0);

  // Tính tổng số lượng vé đã chọn
  const totalQuantity = Object.values(zoneQuantities).reduce(
    (total, qty) => total + qty,
    0,
  );

  useEffect(() => {
    const getZone = async () => {
      try {
        const response = await AxiosInstance().get(
          `/events/getZone/${id}?showtimeId=${showtimeId}`,
        );
        setZones(response.zones || []);
      } catch (error) {
        console.error('Failed to fetch zones:', error);
      } finally {
        setLoading(false);
      }
    };
    getZone();
  }, []);

  const handleContinue = async () => {
    if (totalQuantity === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một vé');
      return;
    }

    // Hiển thị loading
    setLoading(true);

    try {
      // Tạo array các zone đã chọn theo format API yêu cầu
      const zonesData = zones
        .filter(zone => zoneQuantities[zone._id] > 0)
        .map(zone => ({
          zoneId: zone._id,
          quantity: zoneQuantities[zone._id],
        }));

      const requestData = {
        eventId: id,
        zones: zonesData,
        showtimeId: showtimeId,
        quantity: totalQuantity,
      };

      console.log('Request data:', requestData);

      // Gọi API reserve tickets
      const response = await AxiosInstance().post(
        '/zones/reserveZoneTicket',
        requestData,
      );

      console.log('API Response:', response);

      const reservations = response.reservations;

      navigation.navigate('Ticket', {
        id: id,
        typeBase: typeBase,
        totalPrice: totalPrice,
        quantity: totalQuantity,
        bookingIds: reservations.map((r: any) => r.bookingId),
        showtimeId: showtimeId,
      });
    } catch (error) {
      console.error('Error in handleContinue:', error);

      // Hiển thị lỗi chi tiết
      if (error.response) {
        console.error('Error response:', error.response.data);
        Alert.alert(
          'Lỗi',
          error.response.data.message || 'Có lỗi xảy ra khi đặt vé',
        );
      } else {
        Alert.alert('Lỗi', 'Không thể kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật số lượng cho từng zone
  const updateZoneQuantity = (
    zoneId: string,
    newQuantity: number,
    maxQuantity: number,
  ) => {
    const clampedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));
    setZoneQuantities(prev => ({
      ...prev,
      [zoneId]: clampedQuantity,
    }));
  };

  // Component hiển thị control số lượng cho từng zone
  const renderQuantityControls = (zone: any) => {
    const currentQuantity = zoneQuantities[zone._id] || 0;

    return (
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() =>
            updateZoneQuantity(
              zone._id,
              currentQuantity - 1,
              zone.availableCount,
            )
          }
          style={[
            styles.qtyButton,
            currentQuantity === 0 && styles.qtyButtonDisabled,
          ]}>
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.qtyText}>{currentQuantity}</Text>

        <TouchableOpacity
          onPress={() =>
            updateZoneQuantity(
              zone._id,
              currentQuantity + 1,
              zone.availableCount,
            )
          }
          style={[
            styles.qtyButton,
            currentQuantity >= zone.availableCount && styles.qtyButtonDisabled,
          ]}
          disabled={currentQuantity >= zone.availableCount}>
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
          <Text style={styles.headerTitle}>Khu vực vé</Text>
        </RowComponent>

        
      </View>

      <ScrollView style={{flex: 1}}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Loại vé</Text>
          <Text style={styles.sectionTitle}>Số lượng</Text>
        </View>

        {zones.map(zone => {
          const isSoldOut = zone.availableCount < 1;
          const currentQuantity = zoneQuantities[zone._id] || 0;
          const isSelected = currentQuantity > 0;

          return (
            <View
              key={zone._id}
              style={[
                styles.zoneWrapper,
                isSelected && styles.selectedZone,
                isSoldOut && styles.soldOutZone,
              ]}>
              <View style={styles.zoneItem}>
                <View style={styles.zoneInfo}>
                  <Text
                    style={[styles.zoneText, isSoldOut && styles.soldOutText]}>
                    {zone.name}
                  </Text>
                  <Text
                    style={[
                      styles.zonePrice,
                      isSoldOut && styles.soldOutPrice,
                    ]}>
                    {isSoldOut
                      ? 'Hết vé'
                      : `${zone.price.toLocaleString('vi-VN')} đ`}
                  </Text>
                </View>

                {!isSoldOut && renderQuantityControls(zone)}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerQuantity}>Tổng số vé: {totalQuantity}</Text>
          <Text style={styles.footerTotal}>
            Tổng:{' '}
            <Text style={styles.totalAmount}>
              {totalPrice.toLocaleString('vi-VN')} đ
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

export default ZonesScreen;

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
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  zoneWrapper: {
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
  selectedZone: {
    borderColor: appColors.primary,
    borderWidth: 1,
  },
  soldOutZone: {
    opacity: 0.5,
    backgroundColor: '#f8f9fa',
  },
  zoneItem: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  zonePrice: {
    fontSize: 14,
    color: appColors.primary,
    fontWeight: 'bold',
  },
  soldOutText: {
    color: '#6c757d',
  },
  soldOutPrice: {
    color: '#e74c3c',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
