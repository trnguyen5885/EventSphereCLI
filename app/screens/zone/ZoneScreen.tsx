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
import React, {useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {appColors} from '../../constants/appColors';

// Giá vé
const NORMAL_PRICE = 85000;
const VIP_PRICE = 150000;
// Mã trạng thái ghế
enum SeatStatus {
  NORMAL = 0, // vé thường chưa đặt
  VIP = 1, // vé V.I.P chưa đặt
  BOOKED = 2, // đã đặt
}

interface Seat {
  id: string;
  status: SeatStatus;
}

const ZoneScreen = () => {
  const [seats, setSeats] = useState(generateSeatsData());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Generate Seats Data
  function generateSeatsData() {
    const rows = 10;
    const seatsPerRow = 10;
    const rowForVIP = 4;
    const seatsArray: Seat[][] = [];

    for (let i = 0; i < rows; i++) {
      const row: Seat[] = [];
      for (let j = 0; j < seatsPerRow; j++) {
        // Random seats
        const isBooked = Math.random() < 0.2;
        let status: SeatStatus;
        if (isBooked) {
          status = SeatStatus.BOOKED;
        } else if (i < rowForVIP) {
          status = SeatStatus.VIP;
        } else {
          status = SeatStatus.NORMAL;
        }
        row.push({
          id: `${String.fromCharCode(65 + i)}${j + 1}`,
          status,
        });
      }
      seatsArray.push(row);
    }
    return seatsArray;
  }

  // Handle choose seat
  const handleSeatPress = (rowIndex: any, colIndex: any) => {
    const newSeats = [...seats];
    const seat = newSeats[rowIndex][colIndex];

    if (seat.status === SeatStatus.BOOKED) return;

    const newSelected = new Set(selectedIds);
    if (newSelected.has(seat.id)) {
      newSelected.delete(seat.id);
    } else {
      newSelected.add(seat.id);
    }
    setSelectedIds(newSelected);
  };

  const totalPrice = useMemo(() => {
    let sum = 0;
    seats.forEach(row =>
      row.forEach(seat => {
        if (selectedIds.has(seat.id)) {
          sum += seat.status === SeatStatus.VIP ? VIP_PRICE : NORMAL_PRICE;
        }
      }),
    );
    return sum;
  }, [selectedIds, seats]);

  //   // Xử lý khi xác nhận đặt vé
  //   const handleBooking = () => {
  //     if (selectedSeats.length === 0) {
  //       Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một ghế');
  //       return;
  //     }

  //     const seatNames = selectedSeats.map(seat => seat.id).join(', ');
  //     Alert.alert(
  //       'Xác nhận đặt vé',
  //       `Bạn đã chọn ${
  //         selectedSeats.length
  //       } ghế: ${seatNames}\nTổng tiền: ${totalPrice.toLocaleString(
  //         'vi-VN',
  //       )} VND`,
  //       [
  //         {text: 'Hủy'},
  //         {
  //           text: 'Xác nhận',
  //           onPress: () => {
  //             // Chuyển trạng thái ghế đang chọn thành đã đặt
  //             const newSeats = [...seats];
  //             selectedSeats.forEach(selectedSeat => {
  //               const rowIndex = selectedSeat.id.charCodeAt(0) - 65;
  //               const colIndex = parseInt(selectedSeat.id.slice(1)) - 1;
  //               newSeats[rowIndex][colIndex].status = 1;
  //             });

  //             setSeats(newSeats);
  //             setSelectedSeats([]);
  //             setTotalPrice(0);
  //             Alert.alert('Thành công', 'Đặt vé thành công!');
  //           },
  //         },
  //       ],
  //     );
  //   };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        <View style={styles.screen} />
        <Text style={styles.screenLabel}>SÂN KHẤU</Text>
      </View>

      <ScrollView
        style={styles.seatsContainer}
        contentContainerStyle={styles.seatsContentContainer}>
        {seats.map((row, rowIndex) => {
          return (
            <View key={rowIndex} style={styles.row}>
              {row.map((seat, colIndex) => {
                const isSelected = selectedIds.has(seat.id);
                let bgColor;
                if (seat.status === SeatStatus.BOOKED) {
                  bgColor = '#ccc';
                } else if (isSelected) {
                  bgColor = appColors.primary;
                } // màu chọn
                else if (seat.status === SeatStatus.VIP) {
                  bgColor = '#7C89FF';
                } else {
                  bgColor = '#c9b6f3';
                }
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.seat,
                      rowIndex + 1 > 4
                        ? {backgroundColor: '#c9b6f3'}
                        : {backgroundColor: '#7C89FF'},
                      ,
                      {backgroundColor: bgColor},
                    ]}
                    onPress={() => handleSeatPress(rowIndex, colIndex)}
                    disabled={seat.status === SeatStatus.BOOKED}>
                    <Text style={[styles.seatLabel]}>
                      {String.fromCharCode(65 + rowIndex) + (colIndex + 1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

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
            Đã chọn: {selectedIds.size} ghế
          </Text>
          <Text style={styles.summaryPrice}>
            Tổng tiền: {totalPrice.toLocaleString('vi-VN')} VND
          </Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => {}}>
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
    marginVertical: 20,
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

    paddingHorizontal: 15,
    paddingVertical: 15,
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

export default ZoneScreen;
