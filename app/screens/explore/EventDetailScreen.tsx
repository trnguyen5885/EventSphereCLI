/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
  Platform,
  useWindowDimensions,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AxiosInstance } from '../../services';
import { globalStyles } from '../../constants/globalStyles';
import {
  ButtonComponent,
  CircleComponent,
  RowComponent,
  TextComponent,
} from '../../components';
import { appColors } from '../../constants/appColors';
import { formatDate } from '../../services/index';
import RatingAndReview from '../review/RatingAndReview';
import { EventModel } from '@/app/models';
import MapPreview from '../map/MapPreview';
import { TypeBase } from '@/app/models/explore/ExploreModels';
import RenderHtml from 'react-native-render-html';
import { formatTimeRange } from '../../services/utils/time';
import LoadingModal from '../../modals/LoadingModal';

const getValidShowtime = (showtimes: any[]) => {
  const now = new Date();

  // Tìm xuất chiếu đang diễn ra (startTime <= now <= endTime)
  const currentShowtime = showtimes.find(st => {
    const startTime = new Date(st.startTime);
    const endTime = new Date(st.endTime);
    return startTime <= now && now <= endTime;
  });

  // Nếu có xuất chiếu đang diễn ra, ưu tiên hiển thị
  if (currentShowtime) {
    return currentShowtime;
  }

  // Tìm xuất chiếu gần nhất với thời gian hiện tại
  const sortedShowtimes = showtimes
    .map(st => ({
      ...st,
      startTime: new Date(st.startTime),
      endTime: new Date(st.endTime),
      timeDiff: Math.abs(new Date(st.startTime).getTime() - now.getTime())
    }))
    .sort((a, b) => a.timeDiff - b.timeDiff);

  return sortedShowtimes[0];
};


// Hàm kiểm tra xem suất chiếu đã kết thúc chưa
const isShowtimeExpired = (endTime: string) => {
  const now = new Date();
  const showtimeEnd = new Date(endTime);
  return showtimeEnd < now;
};

// Hàm kiểm tra xem có suất chiếu nào còn hiệu lực không
const hasValidShowtime = (showtimes: any[]) => {
  const now = new Date();
  return showtimes.some(st => new Date(st.endTime) > now);
};

const EventDetailScreen = ({ navigation, route }: any) => {
  const { id } = route.params;
  const [detailEvent, setDetailEvent] = useState<EventModel | null>();
  console.log(detailEvent);

  const [organizer, setOrganizer] = useState<any>(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<any>(null);
  // Thay đổi: Đặt tất cả các section ở trạng thái mở rộng mặc định
  const [isEventInfoExpanded, setIsEventInfoExpanded] = useState(true);
  const [isTicketInfoExpanded, setIsTicketInfoExpanded] = useState(true);
  const [isLocationExpanded, setIsLocationExpanded] = useState(true);
  const [ticketInfoPositionY, setTicketInfoPositionY] = useState(0);
  const validShowtime =
    detailEvent?.showtimes ? getValidShowtime(detailEvent.showtimes) : null;

  const sheetRef = useRef<any>(null);

  // Animation values - Khởi tạo với giá trị 1 (mở rộng)
  const eventInfoAnimation = useRef(new Animated.Value(1)).current;
  const ticketInfoAnimation = useRef(new Animated.Value(1)).current;
  const locationAnimation = useRef(new Animated.Value(1)).current;

  console.log('Id Event: ', detailEvent?._id);
  console.log('Detail Event', detailEvent);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    const getDetailEvent = async () => {
      try {
        const response = await AxiosInstance().get(`events/detail/${id}`);
        setDetailEvent(response.data);
        console.log('Detail ', response.data);

        if (response.data?.userId) {
          getOrganizerInfo(response.data.userId);
        }
      } catch (e) {
        console.log(e);
      }
    };

    const getOrganizerInfo = async (userId: string) => {
      try {
        const response = await AxiosInstance().get(`users/getUser/${userId}`);
        setOrganizer(response.data);
        console.log('Organizer info: ', response.data);
      } catch (e) {
        console.log('Error getting organizer info: ', e);
      }
    };

    getDetailEvent();

    return () => {
      setDetailEvent(null);
      setOrganizer(null);
    };
  }, []);

  const handleNavigation = (
    typeBase: TypeBase | undefined,
    showtimeId?: any,
  ) => {
    switch (typeBase) {
      case 'seat':
        navigation.navigate('Seats', {
          id: detailEvent?._id,
          typeBase: detailEvent?.typeBase,
          showtimeId: selectedShowtimeId ?? showtimeId,
        });
        break;
      case 'zone':
        navigation.navigate('Zone', {
          id: detailEvent?._id,
          typeBase: detailEvent?.typeBase,
          showtimeId: selectedShowtimeId ?? showtimeId,
        });
        break;
      case 'none':
        navigation.navigate('Ticket', {
          id: detailEvent?._id,
          typeBase: detailEvent?.typeBase,
          showtimeId: selectedShowtimeId ?? showtimeId,
        });
        break;
      case undefined:
        navigation.navigate('Ticket', {
          id: detailEvent?._id,
          typeBase: detailEvent?.typeBase,
          showtimeId: selectedShowtimeId ?? showtimeId,
        });
        break;
      default:
        navigation.navigate('Ticket', {
          id: detailEvent?._id,
          typeBase: detailEvent?.typeBase,
          showtimeId: selectedShowtimeId ?? showtimeId,
        });
    }
  };

  const handleBackNavigation = () => {
    navigation.goBack();
  };

  const { width } = useWindowDimensions();

  // Thêm state để quản lý việc mở rộng nội dung description
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const getTruncatedDescription = (
    description: string,
    maxLength: number = 300, // Giảm độ dài để dễ thấy hiệu ứng
  ) => {
    if (!description) return '';

    // Nếu đã expand description thì trả về HTML đầy đủ
    if (isDescriptionExpanded) return description;

    // Nếu chưa expand, cắt HTML nhưng vẫn giữ format
    const textOnly = description.replace(/<[^>]*>/g, '');
    if (textOnly.length <= maxLength) return description;

    // Tìm vị trí cắt an toàn (không cắt giữa tag)
    let truncatedHtml = description;
    let currentLength = 0;
    let inTag = false;

    for (let i = 0; i < description.length; i++) {
      if (description[i] === '<') {
        inTag = true;
      } else if (description[i] === '>') {
        inTag = false;
      } else if (!inTag) {
        currentLength++;
        if (currentLength >= maxLength) {
          truncatedHtml = description.substring(0, i) + '...';
          break;
        }
      }
    }

    return truncatedHtml;
  };

  // Function để kiểm tra xem description có dài không
  const isDescriptionLong = (description: string, maxLength: number = 300) => {
    if (!description) return false;
    const textOnly = description.replace(/<[^>]*>/g, '');
    return textOnly.length > maxLength;
  };

  const scrollRef = useRef<ScrollView>(null);

  // Hàm xử lý nút mua vé chính
  const handleMainBuyTicket = () => {
    if (detailEvent?.showtimes && hasValidShowtime(detailEvent.showtimes)) {
      scrollRef.current?.scrollTo({
        y: ticketInfoPositionY - 15,
        animated: true,
      });
    }
  };

  if (!detailEvent) {
    return <LoadingModal visible={true} />;
  }

  return (
    <View style={[globalStyles.container, styles.mainContainer]}>
      <View style={styles.header}>
        <StatusBar animated backgroundColor={appColors.primary} />
        <RowComponent onPress={handleBackNavigation} styles={{ columnGap: 25 }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
        </RowComponent>

        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        showsVerticalScrollIndicator={false}>
        <ImageBackground
          style={styles.imageBackground}
          blurRadius={8}
          source={{ uri: detailEvent?.avatar }}>
          <View style={styles.containerEventDetail}>
            <Image
              source={{ uri: detailEvent?.avatar }}
              style={styles.imageEventDetail}
            />
            <View style={styles.containerEventDetailInfo}>
              <TextComponent
                text={detailEvent?.name ?? ''}
                size={16}
                styles={{
                  paddingVertical: 5,
                  color: appColors.white2,
                  fontWeight: 'bold',
                }}
              />
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={22} color={appColors.primary} />
                <View style={styles.detailTextContainer}>
                  {detailEvent?.showtimes?.length > 0 && (
                    <>
                      {validShowtime && (
                        <Text style={styles.detailSubtitle}>
                          {`${formatTime(validShowtime.startTime)} - ${formatTime(validShowtime.endTime)}, ${formatDate(validShowtime.startTime)}`}
                        </Text>
                      )}

                      {/* 👇 Thêm nút nếu có nhiều hơn 1 showtime */}
                      {detailEvent.showtimes.length > 1 && (
                        <TouchableOpacity
                          onPress={() => {
                            scrollRef.current?.scrollTo({
                              y: ticketInfoPositionY - 15,
                              animated: true,
                            });
                          }}
                          style={{
                            marginTop: 6,
                            alignSelf: 'flex-start',
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#CBD5E0',
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                          }}>
                          <Text style={{ color: '#1A202C', fontSize: 13, fontWeight: '600' }}>
                            + {detailEvent.showtimes.length - 1} ngày khác
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location" size={22} color={appColors.primary} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailSubtitle}>
                    {detailEvent?.location ?? ''}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Event Info Section - Giới thiệu */}
        <View style={styles.sectionContainer}>
          <View
            style={styles.sectionHeader}
          >
            <TextComponent
              text="Giới thiệu"
              size={18}
              styles={{ fontWeight: 'bold', color: '#2D3748' }}
            />

          </View>

          {/* Thay đổi: Luôn hiển thị content, không cần kiểm tra isEventInfoExpanded */}
          <View style={styles.sectionContent}>
            <View style={styles.contentWrapper}>
              {detailEvent?.description && (
                <>
                  <RenderHtml
                    contentWidth={width - 40}
                    source={{
                      html: getTruncatedDescription(detailEvent.description, 300),
                    }}
                    enableCSSInlineProcessing={true}
                    tagsStyles={{
                      strong: { fontWeight: 'bold', color: '#2D3748' },
                      b: { fontWeight: 'bold', color: '#2D3748' },
                      div: { marginBottom: 8 },
                      p: { color: '#4A5568', lineHeight: 20 },
                    }}
                  />

                  {/* Thêm nút "Xem thêm/Thu gọn" nếu nội dung dài */}
                  {isDescriptionLong(detailEvent.description, 300) && (
                    <TouchableOpacity
                      style={styles.expandButton}
                      onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                      <Text style={styles.expandButtonText}>
                        {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                      </Text>
                      <Ionicons
                        name={isDescriptionExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={appColors.primary}
                        style={styles.expandIcon}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </View>

        {/* Ticket Info Section */}
        {detailEvent?.showtimes && detailEvent?.showtimes.length > 0 && (
          <View
            style={styles.sectionContainer}
            onLayout={event =>
              setTicketInfoPositionY(event.nativeEvent.layout.y)
            }>
            <View
              style={styles.sectionHeader}
            >
              <TextComponent
                text="Thông tin vé"
                size={18}
                styles={{ fontWeight: 'bold', color: '#2D3748' }}
              />

            </View>

            {/* Thay đổi: Luôn hiển thị content */}
            <View style={styles.sectionContent}>
              <View style={styles.contentWrapper}>
                <View style={styles.showtimeContainer}>
                  {detailEvent.showtimes.map(showTime => {
                    const isExpired = isShowtimeExpired(showTime.endTime);

                    return (
                      <View key={showTime._id} style={[
                        styles.showtimeButton,
                        isExpired && styles.expiredShowtimeButton
                      ]}>
                        <View>
                          <Text style={[
                            styles.showtimeText,
                            isExpired && styles.expiredText
                          ]}>
                            {formatTime(showTime.startTime)} - {formatTime(showTime.endTime)}
                          </Text>
                          <Text style={[
                            styles.showtimeDateText,
                            isExpired && styles.expiredText
                          ]}>
                            {formatDate(showTime.startTime)}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.buyTicketSmallButton,
                            isExpired && styles.expiredButton
                          ]}
                          disabled={isExpired}
                          onPress={() =>
                            !isExpired && handleNavigation(detailEvent?.typeBase, showTime._id)
                          }>
                          <Text style={[
                            styles.buyTicketSmallText,
                            isExpired && styles.expiredButtonText
                          ]}>
                            {isExpired ? 'Đã kết thúc' : 'Mua vé ngay'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Location Section - Vị trí sự kiện */}
        <View style={styles.sectionContainer}>
          <View
            style={styles.sectionHeader}
          >
            <TextComponent
              text="Vị trí sự kiện"
              size={18}
              styles={{ fontWeight: 'bold', color: '#2D3748' }}
            />

          </View>

          {/* Thay đổi: Luôn hiển thị content khi isLocationExpanded = true */}
          <View style={styles.sectionContent}>
            <View style={styles.contentWrapper}>
              <View style={styles.detailRowLocation}>
                <Ionicons name="location" size={22} color={appColors.primary} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.titleLocation}>
                    {detailEvent?.location ?? ''}
                  </Text>
                </View>
              </View>
              <MapPreview
                latitude={detailEvent?.latitude}
                longitude={detailEvent?.longitude}
                location_map={detailEvent?.location_map}
              />
            </View>
          </View>
        </View>

        {/* Organizer Section - Ban tổ chức */}
        {organizer && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <TextComponent
                text="Ban tổ chức"
                size={18}
                styles={{ fontWeight: 'bold', color: '#2D3748' }}
              />
            </View>

            <View style={styles.sectionContent}>
              <View style={styles.contentWrapper}>
                <View style={styles.organizerContainer}>
                  <Image
                    source={{
                      uri:
                        organizer.picUrl ||
                        'https://via.placeholder.com/60x60?text=User',
                    }}
                    style={styles.organizerAvatar}
                  />
                  <View style={styles.organizerInfo}>
                    <Text style={styles.organizerName}>
                      {organizer.username || 'Người tổ chức'}
                    </Text>
                    <Text style={styles.organizerRole}>
                      Nhà tổ chức sự kiện
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        <RatingAndReview detailEventId={detailEvent?._id} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <ButtonComponent
          onPress={handleMainBuyTicket}
          text={
            detailEvent?.showtimes && hasValidShowtime(detailEvent.showtimes)
              ? 'Mua vé ngay'
              : 'Đã kết thúc'
          }
          styles={[
            styles.buyTicketButton,
            !(detailEvent?.showtimes && hasValidShowtime(detailEvent.showtimes)) &&
            styles.expiredMainButton
          ]}
          type="primary"
          disabled={!(detailEvent?.showtimes && hasValidShowtime(detailEvent.showtimes))}
          icon={
            detailEvent?.showtimes && hasValidShowtime(detailEvent.showtimes) ? (
              <CircleComponent color={appColors.white}>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={appColors.primary}
                />
              </CircleComponent>
            ) : null
          }
          iconFlex="right"
        />
      </View>
    </View>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  // Main container with white background
  mainContainer: {
    backgroundColor: '#FFFFFF',
  },
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
  body: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageBackground: {
    width: '100%',
    minHeight: 400,
    justifyContent: 'center',
  },
  containerEventDetail: {
    padding: 16,
  },
  imageEventDetail: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  containerEventDetailInfo: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
    flexShrink: 1,
  },
  detailRow: {
    columnGap: 12,
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
    marginTop: 8,
    marginBottom: 16,
    // Add flex properties for better wrapping
    flex: 1,
    flexWrap: 'wrap',
  },
  detailRowLocation: {
    columnGap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.white,
  },
  detailSubtitle: {
    color: appColors.white2,
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 22,
    marginTop: 2,
    fontSize: 14,
  },
  detailTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  locationTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  titleLocation: {
    color: '#2D3748',
    maxWidth: 320,
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  contentWrapper: {
    padding: 20,
    paddingTop: 16,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  organizerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  organizerRole: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  showtimeContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 8,
  },
  showtimeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  // Styles cho suất chiếu đã kết thúc
  expiredShowtimeButton: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  expiredText: {
    color: '#A0AEC0',
  },
  expiredButton: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E0',
  },
  expiredButtonText: {
    color: '#718096',
  },
  expiredMainButton: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E0',
  },
  showtimeText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2D3748',
  },
  showtimeDateText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    color: '#6B7280',
  },
  buyTicketSmallButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: appColors.primary,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buyTicketSmallText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomButtonContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  buyTicketButton: {
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buyTicketText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  aboutText: {
    textAlign: 'justify',
    color: '#4A5568',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.5,
  },
  ticketPriceContainer: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  ticketPriceLabel: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketPriceValue: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  ticketListContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  ticketType: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  ticketPrice: {
    color: '#48BB78',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Enhanced expand button for description
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignSelf: 'center',
  },
  expandButtonText: {
    color: appColors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  expandIcon: {
    marginLeft: 2,
  },
});