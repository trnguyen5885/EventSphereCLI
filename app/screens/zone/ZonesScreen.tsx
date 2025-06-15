import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AxiosInstance from '../../services/api/AxiosInstance';

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
      <Text style={styles.subTitle}>Số lượng vé:</Text>
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
          style={styles.qtyButton}>
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalPrice}>
        Tổng: {(zone.price * quantity).toLocaleString('vi-VN')} đ
      </Text>
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
    <View style={styles.container}>
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
          Tổng: {totalPrice.toLocaleString('vi-VN')} đ
        </Text>
        <TouchableOpacity
          style={[styles.button, !selectedZone && {backgroundColor: '#ccc'}]}
          onPress={handleContinue}
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
  sectionTitle: {fontSize: 16, fontWeight: '600', margin: 16},
  zoneWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  selectedZone: {
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff',
  },
  zoneItem: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoneText: {fontSize: 16},
  zonePrice: {fontSize: 16, color: '#888'},
  quantitySection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  subTitle: {marginTop: 8, fontSize: 14},
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  qtyButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  qtyButtonText: {fontSize: 20, fontWeight: 'bold'},
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
    backgroundColor: '#3498db',
    paddingVertical: 12,
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
