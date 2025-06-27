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
  SpaceComponent,
  TextComponent,
} from '../../components';
import { appColors } from '../../constants/appColors';
import { formatDate } from '../../services/index';
import { formatPrice } from '../../services/utils/price';
import RatingAndReview from '../review/RatingAndReview';
import { EventModel } from '@/app/models';
import ListInviteComponent from './components/ListInviteComponent';
import InviteComponent from './components/InviteComponent';
import MapPreview from '../map/MapPreview';
import { TypeBase } from '@/app/models/explore/ExploreModels';
import RenderHtml from 'react-native-render-html';
import { formatTimeRange } from '../../services/utils/time';

const EventDetailScreen = ({ navigation, route }: any) => {
  const { id } = route.params;
  const [detailEvent, setDetailEvent] = useState<EventModel | null>();
  const [organizer, setOrganizer] = useState<any>(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<any>(null);
  const [isEventInfoExpanded, setIsEventInfoExpanded] = useState(false);
  const [isTicketInfoExpanded, setIsTicketInfoExpanded] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [ticketInfoPositionY, setTicketInfoPositionY] = useState(0);


  const sheetRef = useRef<any>(null);

  // Animation values
  const eventInfoAnimation = useRef(new Animated.Value(0)).current;
  const ticketInfoAnimation = useRef(new Animated.Value(0)).current;
  const locationAnimation = useRef(new Animated.Value(0)).current;

  console.log('Id Event: ', detailEvent?._id);
  console.log('Detail Event', detailEvent);

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

  const toggleEventInfo = () => {
    const toValue = isEventInfoExpanded ? 0 : 1;
    setIsEventInfoExpanded(!isEventInfoExpanded);

    Animated.timing(eventInfoAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleTicketInfo = () => {
    const toValue = isTicketInfoExpanded ? 0 : 1;
    setIsTicketInfoExpanded(!isTicketInfoExpanded);

    Animated.timing(ticketInfoAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleLocationInfo = () => {
    const toValue = isLocationExpanded ? 0 : 1;
    setIsLocationExpanded(!isLocationExpanded);

    Animated.timing(locationAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };



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

  const getTruncatedDescription = (
    description: string,
    maxLength: number = 500,
  ) => {
    if (!description) return '';

    // Nếu đã expand thì trả về HTML đầy đủ
    if (isEventInfoExpanded) return description;

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

  const scrollRef = useRef<ScrollView>(null);
  const showtimeSectionRef = useRef<View>(null);

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
                <Text style={styles.detailSubtitle}>{`${formatDate(
                  detailEvent?.timeStart,
                )} - ${formatDate(detailEvent?.timeEnd)} `}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location" size={22} color={appColors.primary} />
                <View>
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
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={toggleEventInfo}>
            <TextComponent
              text="Giới thiệu"
              size={18}
              styles={{ fontWeight: 'bold', color: '#2D3748' }}
            />
            <Ionicons
              name={isEventInfoExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#2D3748"
            />
          </TouchableOpacity>

          <View style={styles.sectionContent}>
            <View style={styles.contentWrapper}>
              {detailEvent?.description && (
                <RenderHtml
                  contentWidth={width - 40}
                  source={{
                    html: isEventInfoExpanded
                      ? detailEvent.description
                      : getTruncatedDescription(detailEvent.description, 500), // Sử dụng HTML gốc thay vì remove tags
                  }}
                  enableCSSInlineProcessing={true}
                  tagsStyles={{
                    strong: { fontWeight: 'bold', color: '#2D3748' },
                    b: { fontWeight: 'bold', color: '#2D3748' },
                    div: { marginBottom: 8 },
                    p: { color: '#4A5568', lineHeight: 20 },
                  }}
                />
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

            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={toggleTicketInfo}>
              <TextComponent
                text="Thông tin vé"
                size={18}
                styles={{ fontWeight: 'bold', color: '#2D3748' }}
              />
              <Ionicons
                name={isTicketInfoExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#2D3748"
              />
            </TouchableOpacity>

            <View style={styles.sectionContent}>
              <View style={styles.contentWrapper}>
                <View style={styles.showtimeContainer}>
                  {detailEvent.showtimes.map(showTime => (
                    <TouchableOpacity
                      key={showTime._id}
                      onPress={() => setSelectedShowtimeId(showTime._id)}
                      style={[styles.showtimeButton]}>
                      <View>
                        <Text style={[styles.showtimeText]}>
                          {formatTimeRange(
                            showTime.startTime,
                            showTime.endTime,
                          )}
                        </Text>
                        <Text style={[styles.showtimeDateText]}>
                          {formatDate(showTime.startTime)} -{' '}
                          {formatDate(showTime.endTime)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.buyTicketSmallButton}
                        onPress={() =>
                          handleNavigation(detailEvent?.typeBase, showTime._id)
                        }>
                        <Text style={styles.buyTicketSmallText}>
                          Mua vé ngay
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Location Section - Vị trí sự kiện */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={toggleLocationInfo}>
            <TextComponent
              text="Vị trí sự kiện"
              size={18}
              styles={{ fontWeight: 'bold', color: '#2D3748' }}
            />
            <Ionicons
              name={isLocationExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#2D3748"
            />
          </TouchableOpacity>

          {isLocationExpanded && (
            <View style={styles.sectionContent}>
              <View style={styles.contentWrapper}>
                <View style={styles.detailRowLocation}>
                  <Ionicons
                    name="location"
                    size={22}
                    color={appColors.primary}
                  />
                  <View>
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
          )}
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

        {/* Add some bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <ButtonComponent
          onPress={() => {
            scrollRef.current?.scrollTo({ y: ticketInfoPositionY - 15, animated: true });
          }}


          text={'Mua vé ngay'}
          styles={styles.buyTicketButton}
          type="primary"
          icon={
            <CircleComponent color={appColors.white}>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={appColors.primary}
              />
            </CircleComponent>
          }
          iconFlex="right"
        />
      </View>
      <ListInviteComponent sheetRef={sheetRef} eventId={detailEvent?._id} />
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
    backgroundColor: '#F7FAFC', // Light gray background for scroll area
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
  },
  detailRow: {
    columnGap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
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
    maxWidth: 320,
    lineHeight: 26,
    marginTop: 2,
  },
  titleLocation: {
    color: '#2D3748',
    maxWidth: 320,
    marginTop: 2,
    fontSize: 16,
    fontWeight: '500',
  },
  // Enhanced section containers
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
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
  // Enhanced organizer section
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
  // Enhanced showtime section
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
  // Enhanced bottom button
  bottomButtonContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    // paddingBottom: Platform.OS === 'ios' ? 16 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
});
