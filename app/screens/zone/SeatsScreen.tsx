/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-sparse-arrays */
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {appColors} from '../../constants/appColors';
import {AxiosInstance} from '../../services';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

enum SeatStatus {
  NORMAL = 0, // vé thường chưa đặt
  VIP = 1, // vé V.I.P chưa đặt
  BOOKED = 2, // đã đặt
}

interface Seat {
  id: string;
  label: string;
  row: number;
  col: number;

  price: number;
  area: string;
  status: SeatStatus;
}

const SeatsScreen = ({navigation, route}: any) => {
  const {id, typeBase, showtimeId} = route.params;
  const [seats, setSeats] = useState<Seat[][]>([]);
  const [zoneId, setZoneId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState();

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    fetchSeatsFromApi();

    return () => {
      setSelectedSeats([]);
    };
  }, []);

  const fetchSeatsFromApi = async () => {
    try {
      const response = await AxiosInstance().get(
        `/events/getZone/${id}?showtimeId=${showtimeId}`,
      );

      const seatObjects = response.zones[0].layout.seats.map((item: any) => {
        let status: SeatStatus;
        if (item.status === 'booked') {
          status = SeatStatus.BOOKED;
        } else if (item.area === 'vip') {
          status = SeatStatus.VIP;
        } else {
          status = SeatStatus.NORMAL;
        }
        return {
          id: item.seatId,
          label: item.label,
          row: item.row,
          col: item.col,
          price: item.price,
          area: item.area,
          status,
        };
      });

      // Group theo row
      const grouped: Seat[][] = [];
      for (let seat of seatObjects) {
        const rowIndex = seat.row - 1;
        if (!grouped[rowIndex]) grouped[rowIndex] = [];
        grouped[rowIndex][seat.col - 1] = seat;
      }

      setSeats(grouped);
      setZoneId(response.zones[0]._id);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ghế:', error);
    }
  };

  const handleSeatPress = async (rowIndex: number, colIndex: number) => {
    const seat = seats[rowIndex][colIndex];
    if (seat.status === SeatStatus.BOOKED) return;

    const existingIndex = selectedSeats.findIndex(s => s.id === seat.id);
    if (existingIndex !== -1) {
      // Đã chọn rồi → bỏ chọn
      const newSelected = [...selectedSeats];
      newSelected.splice(existingIndex, 1);
      setSelectedSeats(newSelected);
    } else {
      try {
        setIsLoading(true);
        // Thêm vào danh sách chọn
        const response = await AxiosInstance().post('/zones/reserveSeats', {
          eventId: id,
          showtimeId: showtimeId,
          seat: {
            seatId: seat.id,
            zoneId: zoneId,
          },
          action: 'select',
        });
        setBookingId(response.bookingId);
        if (response.message === 'Ghế đã được chọn trước đó.') {
          Alert.alert(
            'Lỗi',
            'Bạn đang chọn ghế này trước đó vui lòng thử lại sau 1 phút',
          );
        } else {
          setSelectedSeats([...selectedSeats, seat]);
        }
        setIsLoading(false);
      } catch (error) {
        if (error.response?.status === 409) {
          Alert.alert(
            'Ghế đã được đặt',
            'Một số ghế bạn chọn đã được người khác đặt. Vui lòng chọn ghế khác.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setSelectedSeats([]);
                  fetchSeatsFromApi();
                },
              },
            ],
          );
        } else {
          Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.');
        }
      }
    }
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const handleBookTicket = async () => {
    try {
      const payload = selectedSeats.map(seat => ({
        seatId: seat.id,
        type: seat.area,
      }));

      navigation.navigate('Ticket', {
        id: id, // EventID
        typeBase: typeBase, // typeBase Event
        totalPrice: totalPrice,
        quantity: selectedSeats.length,
        bookingId: bookingId,
      });
    } catch (error) {}
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Không cần làm gì ở đây nếu offset đã có
    })
    .onUpdate(event => {
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;
    })
    .onEnd(() => {
      // Cập nhật offset khi kết thúc gesture
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}, {translateY: translateY.value}],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        <View style={styles.screen} />
        <Text style={styles.screenLabel}>SÂN KHẤU</Text>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.seatsContainer, animatedStyle]}>
          {seats.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((seat, colIndex) => {
                const isSelected = selectedSeats.some(s => s.id === seat.id);
                let bgColor;
                if (seat.status === SeatStatus.BOOKED) {
                  bgColor = '#ccc';
                } else if (isSelected) {
                  bgColor = appColors.primary;
                } else if (seat.status === SeatStatus.VIP) {
                  bgColor = '#7C89FF';
                } else {
                  bgColor = '#c9b6f3';
                }

                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[styles.seat, {backgroundColor: bgColor}]}
                    onPress={() => handleSeatPress(rowIndex, colIndex)}
                    disabled={seat.status === SeatStatus.BOOKED}>
                    <Text style={styles.seatLabel}>{seat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>

      {/* LEGEND */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, styles.seatNormal]} />
          <Text style={styles.legendText}>Vé thường</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, styles.seatVip]} />
          <Text style={styles.legendText}>Vé V.I.P</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, styles.seatChoosing]} />
          <Text style={styles.legendText}>Đang chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, styles.bookedSeat]} />
          <Text style={styles.legendText}>Đã đặt</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryText}>
            Đã chọn: {selectedSeats.length} ghế
          </Text>
          <Text style={styles.summaryPrice}>
            Tổng tiền: {totalPrice.toLocaleString('vi-VN')} VND
          </Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookTicket}>
          <Text style={styles.bookButtonText}>ĐẶT VÉ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  screenContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    zIndex: 2,
  },
  screen: {
    width: '80%',
    height: 8,
    backgroundColor: appColors.primary,
    borderRadius: 5,
  },
  screenLabel: {
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  seatsContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    // borderWidth: 8,
  },
  seatsContentContainer: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  rowLabel: {
    width: 10,
    textAlign: 'center',
    color: '#555',
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  seat: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  bookedSeat: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  seatVip: {
    backgroundColor: '#7C89FF',
    borderColor: '#7C89FF',
  },
  seatChoosing: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  seatLabel: {
    fontSize: 12,
    color: appColors.white2,
  },
  bookedSeatLabel: {
    color: '#777',
  },
  selectedSeatLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    width: 18,
    height: 18,
    borderRadius: 3,
    marginRight: 8,
    borderWidth: 1,
  },
  seatNormal: {
    backgroundColor: '#c9b6f3',
    borderColor: '#bbb',
  },
  legendText: {
    color: '#555',
    fontSize: 12,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 2,
  },
  summaryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryText: {
    color: '#555',
    fontSize: 14,
  },
  summaryPrice: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  bookButton: {
    backgroundColor: '#4a66d8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SeatsScreen;
