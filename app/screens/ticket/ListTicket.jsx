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

// Responsive calculations
const getResponsiveDimensions = () => {
  const isSmallDevice = screenWidth < 360;
  const isMediumDevice = screenWidth >= 360 && screenWidth < 414;
  const isLargeDevice = screenWidth >= 414;
  
  return {
    CARD_WIDTH: Math.min(screenWidth * 0.92, 400), // Max width 400px
    CARD_HEIGHT: Math.min(screenHeight * 0.72, isSmallDevice ? 520 : isMediumDevice ? 580 : 640),
    SWIPE_THRESHOLD: screenWidth * 0.25,
    QR_SIZE: isSmallDevice ? 140 : isMediumDevice ? 160 : 180,
    HEADER_PADDING: isSmallDevice ? 16 : 20,
    CONTENT_PADDING: isSmallDevice ? 16 : 20,
  };
};

const SwipeTicketCard = ({ ticket, event, index, onSwipe, isTop }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const dimensions = getResponsiveDimensions();

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const shouldSwipeRight = translateX.value > dimensions.SWIPE_THRESHOLD;
      const shouldSwipeLeft = translateX.value < -dimensions.SWIPE_THRESHOLD;

      if (shouldSwipeRight || shouldSwipeLeft) {
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
        runOnJS(onSwipe)(ticket._id || ticket.ticketId, shouldSwipeRight ? 'right' : 'left');
      } else {
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
      [0, dimensions.SWIPE_THRESHOLD],
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

  const generateTicketCode = (ticketId) => {
    if (!ticketId) return 'HJRF2NN';
    return ticketId.substring(ticketId.length - 7).toUpperCase();
  };

  const responsiveStyles = getResponsiveStyles();

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[
        responsiveStyles.card, 
        cardStyle, 
        { 
          zIndex: -index,
          width: dimensions.CARD_WIDTH,
          height: dimensions.CARD_HEIGHT,
        }
      ]}>
        <View style={responsiveStyles.ticketContainer}>
          {/* Header Section */}
          <View style={[responsiveStyles.ticketHeader, { paddingHorizontal: dimensions.HEADER_PADDING }]}>
            <Text style={responsiveStyles.dreamBigTitle} numberOfLines={2} adjustsFontSizeToFit>
              {event.name}
            </Text>
            <Text style={responsiveStyles.subtitle} numberOfLines={1}>
              {event.location}
            </Text>
            
            {/* Event Info */}
            <View style={responsiveStyles.eventInfo}>
              <Text style={responsiveStyles.eventDate} numberOfLines={2}>
                {ticket.showtimeId?.startTime
                  ? `${new Date(ticket.showtimeId.startTime).toLocaleDateString('vi-VN', { 
                      day: '2-digit', 
                      month: '2-digit',
                      year: 'numeric'
                    })} ${new Date(ticket.showtimeId.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'N/A'}
              </Text>
              
              <View style={responsiveStyles.ticketDetails}>
                <Text style={responsiveStyles.ticketType} numberOfLines={1}>
                  {event.typeBase === 'seat' 
                    ? `Ghế ${ticket.seat?.seatId || ticket.seat?._id || 'N/A'}`
                    : `Khu vực ${ticket.zone?.zoneName || 'N/A'}`
                  }
                </Text>
                <Text style={responsiveStyles.locationDetail} numberOfLines={1}>
                  Mã đặt vé: {ticket.ticketId || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Dotted separator line */}
          <View style={responsiveStyles.dottedLine} />

          {/* QR Section */}
          <View style={[responsiveStyles.qrSection, { paddingHorizontal: dimensions.CONTENT_PADDING }]}>
            {ticket.qrCode && ticket.qrCode.startsWith('data:image') ? (
              <Image
                source={{ uri: ticket.qrCode }}
                style={[responsiveStyles.qrCode, { 
                  width: dimensions.QR_SIZE, 
                  height: dimensions.QR_SIZE 
                }]}
                resizeMode="contain"
              />
            ) : (
              <View style={[responsiveStyles.qrPlaceholder, { 
                width: dimensions.QR_SIZE * 0.7, 
                height: dimensions.QR_SIZE * 0.7 
              }]}>
                <View style={responsiveStyles.qrPlaceholderBox} />
                <Text style={responsiveStyles.qrPlaceholderText}>Không có QR</Text>
              </View>
            )}
            
            <View style={responsiveStyles.timeInfo}>
              <Text style={responsiveStyles.timeText} numberOfLines={1}>
                Bắt đầu: {ticket.showtimeId?.startTime
                  ? new Date(ticket.showtimeId.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </Text>
              <Text style={responsiveStyles.timeText} numberOfLines={1}>
                Kết thúc: {ticket.showtimeId?.endTime
                  ? new Date(ticket.showtimeId.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </Text>
            </View>
            
            <Text style={responsiveStyles.instruction} numberOfLines={3}>
              Đưa mã này cho nhân viên soát vé{'\n'}
              để nhận vé vào sự kiện
            </Text>

            {ticket.status === 'used' && (
              <View style={responsiveStyles.watermarkWrapper}>
                <View style={responsiveStyles.watermarkBackground} />
                <View style={responsiveStyles.watermarkContent}>
                  <Text style={responsiveStyles.watermarkText}>VÉ ĐÃ SỬ DỤNG</Text>
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const dimensions = getResponsiveDimensions();

    console.log(tickets);

    const handleNavigation = () => {
        navigation.goBack();
    };

    const onSwipe = useCallback((ticketId, direction) => {
        console.log(`Swiped ${direction} on ticket ${ticketId}`);
        
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 300);
    }, []);

    const resetCards = useCallback(() => {
        setCurrentIndex(0);
    }, []);

    const visibleTickets = tickets.slice(currentIndex, currentIndex + 3);
    const responsiveStyles = getResponsiveStyles();

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={responsiveStyles.container}>
            <View style={responsiveStyles.container}>
                {/* Header */}
                <View style={responsiveStyles.header}>
                    <View style={responsiveStyles.headerRow}>
                        <TouchableOpacity
                            style={responsiveStyles.backButton}
                            onPress={handleNavigation}
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={responsiveStyles.headerTitle} numberOfLines={1}>
                            Thông tin vé của tôi
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                
                <View style={responsiveStyles.holderBox} />

                <View style={[responsiveStyles.cardContainer, { minHeight: dimensions.CARD_HEIGHT + 40 }]}>
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
                        <View style={responsiveStyles.noMoreCards}>
                            <Text style={responsiveStyles.noMoreCardsText}>Không còn vé nào!</Text>
                            <TouchableOpacity onPress={resetCards}>
                                <Text style={responsiveStyles.resetText}>Nhấn để xem lại</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Swipe Instructions */}
                <View style={responsiveStyles.instructionsContainer}>
                    <Text style={responsiveStyles.instructionsText}>
                        Vuốt trái/phải để xem vé tiếp theo
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

// Responsive styles function
const getResponsiveStyles = () => {
    const isSmallDevice = screenWidth < 360;
    const isMediumDevice = screenWidth >= 360 && screenWidth < 414;
    
    return StyleSheet.create({
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            color: 'white',
            fontSize: isSmallDevice ? 18 : 20,
            fontWeight: '600',
            flex: 1,
            textAlign: 'center',
            marginHorizontal: 10,
        },
        cardContainer: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 16,
        },
        card: {
            position: 'absolute',
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
            backgroundColor: appColors.primary,
            paddingVertical: isSmallDevice ? 16 : 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        dreamBigTitle: {
            fontSize: isSmallDevice ? 24 : isMediumDevice ? 28 : 32,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 4,
            lineHeight: isSmallDevice ? 28 : isMediumDevice ? 32 : 36,
        },
        subtitle: {
            fontSize: isSmallDevice ? 9 : 10,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            letterSpacing: 1,
            marginBottom: isSmallDevice ? 16 : 20,
        },
        eventInfo: {
            marginBottom: isSmallDevice ? 16 : 20,
        },
        eventDate: {
            fontSize: isSmallDevice ? 12 : 14,
            color: 'white',
            marginBottom: 8,
            textAlign: 'center',
            lineHeight: isSmallDevice ? 16 : 18,
        },
        ticketDetails: {
            alignItems: 'center',
        },
        ticketType: {
            fontSize: isSmallDevice ? 12 : 14,
            color: 'white',
            marginBottom: 4,
            textAlign: 'center',
        },
        locationDetail: {
            fontSize: isSmallDevice ? 11 : 12,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
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
            paddingVertical: isSmallDevice ? 20 : 30,
            backgroundColor: 'white',
            justifyContent: 'center',
        },
        qrCode: {
            marginBottom: isSmallDevice ? 12 : 16,
            borderRadius: 8,
        },
        qrPlaceholder: {
            marginBottom: isSmallDevice ? 12 : 16,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
        },
        qrPlaceholderBox: {
            width: '70%',
            height: '70%',
            backgroundColor: '#ddd',
            borderRadius: 4,
            marginBottom: 4,
        },
        qrPlaceholderText: {
            fontSize: isSmallDevice ? 9 : 10,
            color: '#999',
            textAlign: 'center',
        },
        timeInfo: {
            alignItems: 'center',
            marginBottom: isSmallDevice ? 12 : 16,
        },
        timeText: {
            fontSize: isSmallDevice ? 12 : 14,
            marginVertical: 2,
            fontWeight: "bold",
        },
        instruction: {
            fontSize: isSmallDevice ? 11 : 12,
            color: '#666',
            textAlign: 'center',
            lineHeight: isSmallDevice ? 13 : 14,
            letterSpacing: 0.5,
        },
        noMoreCards: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
        },
        noMoreCardsText: {
            fontSize: isSmallDevice ? 16 : 18,
            color: '#666',
            marginBottom: 10,
        },
        resetText: {
            fontSize: isSmallDevice ? 14 : 16,
            color: appColors.primary,
            fontWeight: '600',
        },
        instructionsContainer: {
            alignItems: 'center',
            paddingBottom: 20,
            paddingHorizontal: 16,
        },
        instructionsText: {
            fontSize: isSmallDevice ? 13 : 14,
            textAlign: 'center',
            fontWeight: "400",
        },
        holderBox: {
            marginVertical: 10,
        },
        watermarkWrapper: {
            position: 'absolute',
            bottom: isSmallDevice ? 60 : 80,
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
            zIndex: 2,
        },
        watermarkContent: {
            paddingVertical: isSmallDevice ? 12 : 18,
            paddingHorizontal: isSmallDevice ? 15 : 20,
            borderWidth: isSmallDevice ? 12 : 18,
            borderColor: 'rgba(255, 0, 0, 0.5)',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            zIndex: 1,
            opacity: 0.5,
        },
        watermarkText: {
            fontSize: isSmallDevice ? 20 : 28,
            fontWeight: 'bold',
            color: 'rgba(255, 0, 0, 0.8)',
            letterSpacing: 1,
            opacity: 0.7,
        },
    });
};

export default ListTicket;