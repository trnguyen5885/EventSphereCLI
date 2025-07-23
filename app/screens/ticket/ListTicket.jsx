import { RowComponent } from '../../components';
import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, StatusBar, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { appColors } from '../../constants/appColors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.75;
const SWIPE_THRESHOLD = screenWidth * 0.25;

const SwipeTicketCard = ({ ticket, event, index, onSwipe, isTop }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD;

      if (shouldSwipeRight || shouldSwipeLeft) {
        // Animate card off screen
        translateX.value = withSpring(
          shouldSwipeRight ? screenWidth : -screenWidth,
          { velocity: event.velocityX }
        );
        translateY.value = withSpring(
          event.translationY + event.velocityY * 0.1,
          { velocity: event.velocityY }
        );
        opacity.value = withSpring(0);
        scale.value = withSpring(0.8);
        // Trigger callback after animation
        runOnJS(onSwipe)(ticket._id || ticket.ticketId, shouldSwipeRight ? 'right' : 'left');
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    })
    .enabled(isTop);

  const cardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-30, 0, 30],
      Extrapolation.CLAMP,
    );

    const cardScale = isTop ? scale.value : interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.95, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: cardScale },
      ],
      opacity: opacity.value,
    };
  });

  // Generate ticket code from ticketId
  const generateTicketCode = (ticketId) => {
    if (!ticketId) return 'HJRF2NN';
    return ticketId.substring(ticketId.length - 7).toUpperCase();
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle, { zIndex: -index }]}>
        {/* Ticket with voucher design */}
        <View style={styles.ticketContainer}>
          <View style={styles.notchLeft} />
          {/* Header Section */}
          <View style={styles.ticketHeader}>
            <Text style={styles.dreamBigTitle}>{event.name}</Text>
            <Text style={styles.subtitle}>{event.location}</Text>
            
            {/* Event Info */}
            <View style={styles.eventInfo}>
              <Text style={styles.eventDate}>
                {ticket.showtimeId?.startTime
                  ? `${new Date(ticket.showtimeId.startTime).toLocaleDateString('vi-VN', { 
                      day: '2-digit', 
                      month: '2-digit',
                      year: 'numeric'
                    })} ${new Date(ticket.showtimeId.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'N/A'}
              </Text>
              
              <View style={styles.ticketDetails}>
                <Text style={styles.ticketType}>
                  {event.typeBase === 'seat' 
                    ? `Ghế ${ticket.seat?.seatId || ticket.seat?._id || 'N/A'}`
                    : `Khu vực ${ticket.zone?.zoneName || 'N/A'}`
                  }
                </Text>
                <Text style={styles.locationDetail}>Mã đặt vé: {ticket.ticketId || 'N/A'}</Text>
              </View>
            </View>

            {/* Price and Ticket Number */}
            {/* <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Số vé</Text>
              <Text style={styles.ticketNumber}>#{ticket.ticketNumber || 'N/A'}</Text>
            </View> */}
          </View>

          {/* Dotted separator line */}
          <View style={styles.dottedLine} />

          {/* QR Section */}
          <View style={styles.qrSection}>
            {ticket.qrCode && ticket.qrCode.startsWith('data:image') ? (
              <Image
                source={{ uri: ticket.qrCode }}
                style={styles.qrCode}
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <View style={styles.qrPlaceholderBox} />
                <Text style={styles.qrPlaceholderText}>Không có QR</Text>
              </View>
            )}
            
            {/* <Text style={styles.ticketCode}>
              {generateTicketCode(ticket.ticketId)}
            </Text> */}
            
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>
                Bắt đầu: {ticket.showtimeId?.startTime
                  ? new Date(ticket.showtimeId.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </Text>
              <Text style={styles.timeText}>
                Kết thúc: {ticket.showtimeId?.endTime
                  ? new Date(ticket.showtimeId.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </Text>
            </View>
            
            <Text style={styles.instruction}>
              Đưa mã này cho nhân viên soát vé{'\n'}
              để nhận vé vào sự kiện
            </Text>

            {ticket.status === 'used' && (
            <View style={styles.watermarkWrapper}>
              <View style={styles.watermarkBackground} />
              <View style={styles.watermarkContent}>
               <Text style={styles.watermarkText}>VÉ ĐÃ SỬ DỤNG</Text>
              </View>
            </View>
            )}

            
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const ListTicket = ({ navigation, route }) => {
    const { event, user } = route.params;
    const tickets = event?.tickets || [];
    const [currentIndex, setCurrentIndex] = useState(0)

    console.log(tickets)

    const handleNavigation = () => {
        navigation.goBack();
    };

    const onSwipe = useCallback((ticketId, direction) => {
    console.log(`Swiped ${direction} on ticket ${ticketId}`);
    
    // Remove the swiped ticket after animation completes
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  }, []);

  const resetCards = useCallback(() => {
    setCurrentIndex(0);
  }, []);

    const visibleTickets = tickets.slice(currentIndex, currentIndex + 3);

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.headerRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleNavigation}
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Thông tin vé của tôi</Text>
                        <View style={{ width: 26 }} />
                    </View>
                </View>
                
                {/* <View style={styles.recipientInfo}>
                    <Text style={styles.recipientHeader}>Thông tin người nhận</Text>
                    <View style={styles.recipientDetail}>
                        <Text>Họ và tên</Text>
                        <Text>{user.username}</Text>
                    </View>
                    <View style={styles.recipientDetail}>
                        <Text>Số điện thoại</Text>
                        <Text>{user.phoneNumber || 'Không có'}</Text>
                    </View>
                    <View style={styles.recipientDetail}>
                        <Text>Email</Text>
                        <Text>{user.email}</Text>
                    </View>
                </View> */}
                <View style = {styles.holderBox}></View>

                <View style={styles.cardContainer}>
                    {visibleTickets.map((ticket, index) => (
                        <SwipeTicketCard
                            key={`${ticket._id || ticket.ticketId}-${currentIndex}`}
                            ticket={ticket}
                            event={event}
                            index={index}
                            onSwipe={onSwipe}
                            isTop={index === 0}
                        />
                    ))}
                    {currentIndex >= tickets.length && (
                        <View style={styles.noMoreCards}>
                            <Text style={styles.noMoreCardsText}>Không còn vé nào!</Text>
                            <TouchableOpacity onPress={resetCards}>
                                <Text style={styles.resetText}>Nhấn để xem lại</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Swipe Instructions */}
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsText}>Vuốt trái/phải để xem vé tiếp theo</Text>
                </View>


            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: appColors.primary,
        paddingTop: Platform.OS === 'ios' ? 30 : 10,
        paddingBottom: 15,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
        minHeight: CARD_HEIGHT + 30,
    },
    card: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    ticketContainer: {
         position: "relative",
        flex: 1,
        borderRadius: 20,
        backgroundColor: 'white',
        overflow: 'hidden',


    },
    ticketHeader: {
        backgroundColor: appColors.primary, // fallback for React Native
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    dreamBigTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 20,
    },
    eventInfo: {
        marginBottom: 20,
    },
    eventDate: {
        fontSize: 14,
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    ticketDetails: {
        alignItems: 'center',
    },
    ticketType: {
        fontSize: 14,
        color: 'white',
        marginBottom: 4,
        textAlign: 'center',
    },
    locationDetail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    ticketNumber: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
    dottedLine: {
        height: 1,
        backgroundColor: 'transparent',
        borderStyle: 'dotted',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginHorizontal: 20,
    },
    qrSection: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 24,
        backgroundColor: 'white',
    },
    qrCode: {
        width: 180,
        height: 180,
        marginBottom: 16,
        borderRadius: 8,
    },
    qrPlaceholder: {
        width: 120,
        height: 120,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    qrPlaceholderBox: {
        width: 80,
        height: 80,
        backgroundColor: '#ddd',
        borderRadius: 4,
        marginBottom: 4,
    },
    qrPlaceholderText: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
    },
    ticketCode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 2,
        marginBottom: 16,
    },
    timeInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    timeText: {
        fontSize: 14,
        marginVertical: 2,
        fontWeight: "bold"
    },
    instruction: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 14,
        letterSpacing: 0.5,
    },
    recipientInfo: {
        marginVertical: 20,
        marginHorizontal: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    recipientHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    recipientDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 6,
        paddingVertical: 4,
    },
    noMoreCards: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    noMoreCardsText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    resetText: {
        fontSize: 16,
        color: appColors.primary,
        fontWeight: '600',
    },
    instructionsContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    instructionsText: {
        fontSize: 14,
        
        textAlign: 'center',
        fontWeight: "400",
    },
    holderBox: {
      marginVertical: 10
    },
    watermarkWrapper: {
  position: 'absolute',
  bottom: 80,
  left: '10%',

  transform: [{ rotate: '-20deg' }],
  zIndex: 10,
  borderRadius: 15,
  overflow: 'hidden',
},

watermarkBackground: {
  ...StyleSheet.absoluteFillObject,

  borderWidth: 3,
  borderRadius: 10,
  margin: 10,
  borderColor: "#ffffff",
  zIndex: 2
  
},

watermarkContent: {
  paddingVertical: 18,
  paddingHorizontal: 20,
  borderWidth: 18,
  borderColor: 'rgba(255, 0, 0, 0.5)',
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent', // không bị opacity mờ,
  zIndex: 1,
  opacity: 0.5
},

watermarkText: {
  fontSize: 28,
  fontWeight: 'bold',
  color: 'rgba(255, 0, 0, 0.8)', // màu chữ rõ ràng
  letterSpacing: 1,
  opacity: 0.7
},

});

export default ListTicket;
