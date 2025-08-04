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
  StatusBar,
  BackHandler,
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
import {getSocket} from '../../socket/socket';
import RowComponent from '../../../app/components/RowComponent';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoadingModal from '../../modals/LoadingModal';

enum SeatStatus {
  NORMAL = 0, // vé thường chưa đặt
  VIP = 1, // vé V.I.P chưa đặt
  BOOKED = 2, // đã đặt
  RESERVED = 3,
}

interface Seat {
  id: string;
  label: string;
  row: number;
  col: number;

  price: number;
  area: string;
  status: SeatStatus;
  color: string;
}

const SeatsScreen = ({navigation, route}: any) => {
  const {id, typeBase, showtimeId} = route.params;
  const [seats, setSeats] = useState<Seat[][]>([]);
  const [zoneId, setZoneId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState([]);
  const [colorVIP, setColorVIP] = useState([]);
  const [colorNomal, setColorNormal] = useState([]);

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [pendingSeats, setPendingSeats] = useState<string[]>([]);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    const socket = getSocket();
    fetchSeatsFromApi();
    if (!socket) return;

    console.log('join room', `event_${id}_showtime_${showtimeId}`);
    socket.emit('joinRoom', `event_${id}_showtime_${showtimeId}`);

    // Khi có sự kiện cập nhật ghế hoặc zone, gọi lại fetchSeatsFromApi
    const handleSeatUpdated = (data: any) => {
      console.log('[SOCKET] seat_updated:', data);
      fetchSeatsFromApi();
    };
    const handleZoneChanged = (data: any) => {
      console.log('[SOCKET] zone_data_changed:', data);
      fetchSeatsFromApi();
    };
    const handlePeriodicMessage = (data: any) => {
      console.log('[SOCKET] periodicMessage:', data);
    };

    // Log mọi event nhận được từ server
    const handleAnyEvent = (event: string, ...args: any[]) => {
      console.log(`[SOCKET][ANY] Event: ${event}`, ...args);
    };

    socket.on('seat_updated', handleSeatUpdated);
    socket.on('zone_data_changed', handleZoneChanged);
    socket.on('periodicMessage', handlePeriodicMessage);
    socket.onAny(handleAnyEvent);

    // Cleanup khi rời màn
    return () => {
      socket.off('seat_updated', handleSeatUpdated);
      socket.off('zone_data_changed', handleZoneChanged);
      socket.off('periodicMessage', handlePeriodicMessage);
      socket.offAny(handleAnyEvent);
      socket.emit('leave', {room: `event_${id}_showtime_${showtimeId}`});
      setSeats([]);
      setSelectedSeats([]);
    };
  }, [id, showtimeId]);

  useEffect(() => {
    const onBackPress = () => {
      if (selectedSeats.length === 0) {
        return false; // xử lý back mặc định
      }

      Alert.alert(
        'Xác nhận thoát',
        'Bạn có chắc chắn muốn quay lại? Tất cả ghế đã chọn sẽ bị huỷ.',
        [
          {text: 'Hủy', style: 'cancel'},
          {
            text: 'Thoát',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                await AxiosInstance().post('/users/cancelAllReservedSeats');
                setSelectedSeats([]);
                navigation.goBack(); // thoát màn hình
              } catch (error) {
                Alert.alert('Lỗi', 'Không thể huỷ vé. Vui lòng thử lại.');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
        {cancelable: true},
      );

      return true; // chặn hành vi mặc định
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => backHandler.remove();
  }, [selectedSeats]);

  const fetchSeatsFromApi = async () => {
    // setIsLoading(true);
    try {
      const response = await AxiosInstance().get(
        `/events/getZone/${id}?showtimeId=${showtimeId}`,
      );

      console.log(response.zones[0].layout.seats);

      const seatObjects = response.zones[0].layout.seats.map((item: any) => {
        let status: SeatStatus;
        if (item.status === 'booked') {
          status = SeatStatus.BOOKED;
        } else if (item.area === 'Vip') {
          status = SeatStatus.VIP;
        } else if (item.status === 'reserved') {
          status = SeatStatus.RESERVED;
        } else if (item.area !== 'none') {
          status = SeatStatus.NORMAL;
        }

        return {
          id: item.seatId,
          label: item.label,
          row: item.row,
          col: item.col,
          price: item.price,
          area: item.area,
          color: item.color,
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
      const vipSeat = seatObjects.find(seat => seat.status === SeatStatus.VIP);
      const normalSeat = seatObjects.find(
        seat => seat.status === SeatStatus.NORMAL,
      );

      if (vipSeat) {
        setColorVIP([vipSeat.color]);
        console.log(vipSeat.color);
      }
      if (normalSeat) {
        setColorNormal([normalSeat.color]);
        console.log(normalSeat.color);
      }
      // setIsLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ghế:', error);
      // setIsLoading(false);
    }
  };

  const handleSeatPress = async (rowIndex: number, colIndex: number) => {
    if (isLoading) return;
    const seat = seats[rowIndex][colIndex];

    // Nếu ghế đang xử lý hoặc đã chọn => chặn spam
    if (pendingSeats.includes(seat.id)) {
      console.log('Ghế đang được xử lý, vui lòng đợi...');
      return;
    }

    const existingIndex = selectedSeats.findIndex(
      s => String(s.id) === String(seat.id),
    );

    if (existingIndex !== -1) {
      // Huỷ ghế đã chọn
      Alert.alert(
        'Xác nhận',
        `Bạn có chắc muốn huỷ vé ${seat.label}?`,
        [
          {text: 'Không', style: 'cancel'},
          {
            text: 'Huỷ',
            onPress: async () => {
              try {
                setPendingSeats(prev => [...prev, seat.id]);
                await AxiosInstance().post('/zones/reserveSeats', {
                  eventId: id,
                  showtimeId: showtimeId,
                  seat: {seatId: seat.id, zoneId: zoneId},
                  action: 'deselect',
                });

                setSelectedSeats(prev =>
                  prev.filter((_, idx) => idx !== existingIndex),
                );
              } catch (error) {
                Alert.alert(
                  'Lỗi',
                  'Có lỗi xảy ra khi huỷ vé. Vui lòng thử lại.',
                );
              } finally {
                setPendingSeats(prev => prev.filter(id => id !== seat.id));
              }
            },
          },
        ],
        {cancelable: true},
      );
    } else if (seat.status === SeatStatus.BOOKED) {
      return;
    } else if (seat.status === SeatStatus.RESERVED) {
      Alert.alert('Thông báo', 'Ghế đang được giữ bởi người khác.');
      return;
    } else {
      try {
        setPendingSeats(prev => [...prev, seat.id]);

        const response = await AxiosInstance().post('/zones/reserveSeats', {
          eventId: id,
          showtimeId: showtimeId,
          seat: {seatId: seat.id, zoneId: zoneId},
          action: 'select',
        });

        if (bookingId.length <= 0) bookingId.push(response.bookingId);

        if (response.message === 'Ghế đã được chọn trước đó.') {
          Alert.alert(
            'Lỗi',
            'Bạn đã chọn ghế này trước đó, vui lòng thử lại sau 1 phút.',
          );
        } else {
          setSelectedSeats(prev => [...prev, seat]);
        }
      } catch (error: any) {
        if (error.response?.status === 409) {
          Alert.alert('Ghế đã được đặt', 'Ghế bạn chọn đã có người khác đặt.');
          fetchSeatsFromApi();
        } else {
          Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.');
        }
      } finally {
        setPendingSeats(prev => prev.filter(id => id !== seat.id));
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
        bookingIds: bookingId,
        showtimeId: showtimeId,
      });
    } catch (error) {}
  };

  const handleGoback = () => {
    if (selectedSeats.length === 0) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Xác nhận thoát',
      'Bạn có chắc chắn muốn quay lại? Tất cả ghế đã chọn sẽ bị huỷ.',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Thoát',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await AxiosInstance().post(
                '/users/cancelAllReservedSeats',
              );

              setSelectedSeats([]);
              navigation.goBack();
            } catch (error) {
              console.error('Huỷ ghế thất bại:', error);
              Alert.alert('Lỗi', 'Không thể huỷ vé. Vui lòng thử lại.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      {cancelable: true},
    );
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

  if (isLoading) {
    return <LoadingModal visible={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <StatusBar animated backgroundColor={appColors.primary} />
        <RowComponent onPress={handleGoback} styles={{columnGap: 25}}>
          <TouchableOpacity onPress={handleGoback} style={styles.backButton} onPress={handleGoback}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn khu vực ghế</Text>
        </RowComponent>
      </View>
      <View style={styles.screenContainer}>
        <View style={styles.screen} />
        <Text style={styles.screenLabel}>SÂN KHẤU</Text>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.seatsContainer, animatedStyle]}>
          {seats.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((seat, colIndex) => {
                const isHidden = seat.area == 'none';
                const isSelected = selectedSeats.some(s => s.id === seat.id);
                let bgColor;
                if (seat.status === SeatStatus.BOOKED) {
                  bgColor = '#ccc';
                } else if (isSelected) {
                  bgColor = appColors.primary;
                } else if (seat.status === SeatStatus.VIP) {
                  bgColor = seat.color;
                } else if (seat.status === SeatStatus.RESERVED) {
                  bgColor = '#000';
                } else {
                  bgColor = seat.color;
                }

                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.seat,
                      {backgroundColor: bgColor},
                      isHidden && {opacity: 0},
                    ]}
                    onPress={() => handleSeatPress(rowIndex, colIndex)}
                    disabled={isHidden || seat.status === SeatStatus.BOOKED}>
                    <Text style={styles.seatLabel}>{seat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>

      {/* LEGEND */}
      {/* <View style={styles.legend}>
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
        <TouchableOpacity
          style={[
            styles.bookButton,
            selectedSeats.length === 0 && styles.bookButtonDisabled,
          ]}
          disabled={selectedSeats.length === 0}
          onPress={handleBookTicket}>
          <Text style={styles.bookButtonText}>ĐẶT VÉ</Text>
        </TouchableOpacity>
      </View> */}

      <View style={styles.bottomContainer}>
        {/* Legend section - sắp xếp theo 2 hàng */}
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendIcon,
                  {
                    backgroundColor: colorNomal[0] || '#c9b6f3',
                    borderColor: colorNomal[0] || '#c9b6f3',
                  },
                ]}
              />
              <Text style={styles.legendText}>Vé thường</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendIcon,
                  // styles.seatVip,
                  {
                    backgroundColor: colorVIP[0] || '#7C89FF',
                    borderColor: colorVIP[0] || '#7C89FF',
                  },
                ]}
              />
              <Text style={styles.legendText}>Vé V.I.P</Text>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.seatChoosing]} />
              <Text style={styles.legendText}>Đang chọn</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendIcon, {marginRight: 8}, styles.bookedSeat]}
              />
              <Text style={styles.legendText}>Đã đặt </Text>
            </View>
          </View>
        </View>

        {/* Summary và Book button - layout ngang */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryText}>
              Đã chọn: {selectedSeats.length} ghế
            </Text>
            <Text style={styles.summaryPrice}>
              Tổng tiền:{' '}
              <Text style={{color: appColors.primary}}>
                {totalPrice.toLocaleString('vi-VN')} VND
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.bookButton,
              selectedSeats.length === 0 && styles.bookButtonDisabled,
            ]}
            disabled={selectedSeats.length === 0}
            onPress={handleBookTicket}>
            <Text style={styles.bookButtonText}>ĐẶT VÉ</Text>
          </TouchableOpacity>
        </View>
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
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: appColors.primary,
    zIndex: 2,
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
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legend: {
    // flexDirection: 'row',
    // justifyContent: 'space-around',
    // padding: 16,
    // backgroundColor: '#fff',
    // borderTopWidth: 1,
    // borderTopColor: '#e0e0e0',
    marginBottom: 16,
  },
  legendRow: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  legendIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  seatNormal: {
    backgroundColor: '#c9b6f3',
    borderColor: '#bbb',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryInfo: {
    flex: 1,
    // justifyContent: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
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
  bookButtonDisabled: {
    backgroundColor: '#aaa',
    elevation: 0,
  },
});

export default SeatsScreen;
