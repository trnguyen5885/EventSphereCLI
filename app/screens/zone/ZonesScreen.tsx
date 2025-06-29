import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AxiosInstance from '../../services/api/AxiosInstance';
import {appColors} from '../../../app/constants/appColors';
import RowComponent from '../../../app/components/RowComponent';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ZonesScreen = ({navigation, route}: any) => {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const {id, showtimeId, typeBase} = route.params;

  const selectedZone = zones.find(z => z._id === selectedZoneId);
  const totalPrice = selectedZone ? selectedZone.price * quantity : 0;

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
    if (!selectedZone) return;
    console.log({
      eventId: id,
      zoneId: selectedZoneId,
      showtimeId: showtimeId,
      quantity: quantity,
    });
    try {
      const response = await AxiosInstance().post('/zones/reserveZoneTicket', {
        eventId: id,
        zoneId: selectedZoneId,
        showtimeId: showtimeId,
        quantity: quantity,
      });
      navigation.navigate('Ticket', {
        id: id, // EventID
        typeBase: typeBase, // typeBase Event
        totalPrice: totalPrice,
        quantity: quantity,
        bookingId: response.bookingId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const renderQuantitySection = zone => (
    <View style={styles.quantitySection}>
      <Text style={styles.subTitle}>Số lượng vé</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
          style={styles.qtyButton}>
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.qtyText}>{quantity}</Text>

        <TouchableOpacity
          onPress={() =>
            setQuantity(Math.min(quantity + 1, zone.availableCount))
          }
          style={styles.qtyButton}
          activeOpacity={0.5}>
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Đang tải khu vực...</Text>
      </View>
    );
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

        <TouchableOpacity>
          <Ionicons name="map-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView style={{flex: 1}}>
        <Text style={styles.sectionTitle}>Chọn khu vực:</Text>
        {zones.map(zone => {
          const isSelected = selectedZoneId === zone._id;
          const isSoldOut = zone.availableCount < 1;

          return (
            <View
              key={zone._id}
              style={[styles.zoneWrapper, isSelected && styles.selectedZone]}>
              <TouchableOpacity
                disabled={isSoldOut}
                style={[
                  styles.zoneItem,
                  isSoldOut && {opacity: 0.5}, // làm mờ khu hết vé
                ]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedZoneId(null);
                  } else {
                    setSelectedZoneId(zone._id);
                    setQuantity(1);
                  }
                }}>
                <Text style={styles.zoneText}>{zone.name}</Text>
                <Text
                  style={[styles.zonePrice, isSoldOut && {color: '#e74c3c'}]}>
                  {isSoldOut
                    ? 'Hết vé'
                    : `${zone.price.toLocaleString('vi-VN')} đ`}
                </Text>
              </TouchableOpacity>
              {!isSoldOut && isSelected && renderQuantitySection(zone)}
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTotal}>
          Tổng:{' '}
          <Text
            style={{
              color: appColors.primary,
              fontWeight: 'bold',
              fontSize: 20,
            }}>
            {totalPrice.toLocaleString('vi-VN')} đ
          </Text>
        </Text>
        <TouchableOpacity
          style={[styles.button, !selectedZone && {backgroundColor: '#ccc'}]}
          onPress={handleContinue}
          activeOpacity={0.6}
          disabled={!selectedZone}>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {fontSize: 16, fontWeight: '600', margin: 16},
  zoneWrapper: {
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  zoneItem: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoneText: {fontSize: 16, fontWeight: '500'},
  zonePrice: {fontSize: 16, color: appColors.primary, fontWeight: 'bold'},
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  subTitle: {marginTop: 8, fontSize: 16, fontWeight: '500'},
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    columnGap: 10,
  },
  qtyButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(86, 105, 255, 0.85)',
    width: 35,
    height: 35,
    borderRadius: 5,
  },
  qtyButtonText: {fontSize: 20, fontWeight: 'bold', color: appColors.white2},
  qtyText: {fontSize: 16},
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  footerTotal: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    backgroundColor: appColors.primary,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
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
