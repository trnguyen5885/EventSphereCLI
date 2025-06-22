/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef} from 'react';
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
import {AxiosInstance} from '../../services';
import {globalStyles} from '../../constants/globalStyles';
import {
  ButtonComponent,
  CircleComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import {appColors} from '../../constants/appColors';
import {formatDate} from '../../services/index';
import {formatPrice} from '../../services/utils/price';
import RatingAndReview from '../review/RatingAndReview';
import {EventModel} from '@/app/models';
import ListInviteComponent from './components/ListInviteComponent';
import InviteComponent from './components/InviteComponent';
import MapPreview from '../map/MapPreview';
import {TypeBase} from '@/app/models/explore/ExploreModels';
import RenderHtml from 'react-native-render-html';
import {formatTimeRange} from '../../services/utils/time';

const EventDetailScreen = ({navigation, route}: any) => {
  const {id} = route.params;
  const [detailEvent, setDetailEvent] = useState<EventModel | null>();
  const [organizer, setOrganizer] = useState<any>(null); // Thêm state cho thông tin người tổ chức
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<any>(null);
  const [isEventInfoExpanded, setIsEventInfoExpanded] = useState(false);
  const [isTicketInfoExpanded, setIsTicketInfoExpanded] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [isOrganizerExpanded, setIsOrganizerExpanded] = useState(false); // Thêm state cho phần ban tổ chức
  const sheetRef = useRef<any>(null);

  // Animation values
  const eventInfoAnimation = useRef(new Animated.Value(0)).current;
  const ticketInfoAnimation = useRef(new Animated.Value(0)).current;
  const locationAnimation = useRef(new Animated.Value(0)).current;
  const organizerInfoAnimation = useRef(new Animated.Value(0)).current;
  console.log('Id Event: ', detailEvent?._id);
  console.log('Detail Event', detailEvent);

  useEffect(() => {
    const getDetailEvent = async () => {
      try {
        const response = await AxiosInstance().get(`events/detail/${id}`);
        setDetailEvent(response.data);
        console.log('Detail ', response.data);

        // Gọi API lấy thông tin người tổ chức nếu có userId
        if (response.data?.userId) {
          getOrganizerInfo(response.data.userId);
        }
      } catch (e) {
        console.log(e);
      }
    };

    // Hàm lấy thông tin người tổ chức
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
      setOrganizer(null); // Cleanup organizer state
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

  const toggleOrganizerInfo = () => {
    const toValue = isLocationExpanded ? 0 : 1;
    setIsOrganizerExpanded(!isOrganizerExpanded);

    Animated.timing(organizerInfoAnimation, {
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

  const {width} = useWindowDimensions();

  // Truncate description to show only first part
  const getTruncatedDescription = (
    description: string,
    maxLength: number = 500,
  ) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <View style={[globalStyles.container]}>
      <View style={styles.header}>
        <StatusBar animated backgroundColor={appColors.primary} />
        <RowComponent onPress={handleBackNavigation} styles={{columnGap: 25}}>
          <Ionicons name="chevron-back" size={26} color="white" />
          <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
        </RowComponent>

        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body}>
        <ImageBackground
          style={styles.imageBackground}
          blurRadius={8}
          source={{uri: detailEvent?.avatar}}>
          <View style={styles.containerEventDetail}>
            <Image
              source={{uri: detailEvent?.avatar}}
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
              styles={{fontWeight: 'bold', color: 'black'}}
            />
            <Ionicons
              name={isEventInfoExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="black"
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
                      : getTruncatedDescription(
                          detailEvent.description.replace(/<[^>]*>/g, ''),
                          500,
                        ),
                  }}
                  enableCSSInlineProcessing={true}
                  tagsStyles={{
                    strong: {fontWeight: 'bold'},
                    b: {fontWeight: 'bold'},
                    div: {marginBottom: 8},
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Ticket Info Section */}
        {detailEvent?.showtimes && detailEvent?.showtimes.length > 0 && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={toggleTicketInfo}>
              <TextComponent
                text="Thông tin vé"
                size={18}
                styles={{fontWeight: 'bold', color: 'black'}}
              />
              <Ionicons
                name={isTicketInfoExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="black"
              />
            </TouchableOpacity>

            <View style={styles.sectionContent}>
              <View style={styles.contentWrapper}>
                {/* Showtime Selection */}
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
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          backgroundColor: appColors.primary,
                          borderRadius: 5,
                        }}
                        onPress={() =>
                          handleNavigation(detailEvent?.typeBase, showTime._id)
                        }>
                        <Text style={{color: 'white', fontWeight: 'bold'}}>
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
              styles={{fontWeight: 'bold', color: 'black'}}
            />
            <Ionicons
              name={isLocationExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="black"
            />
          </TouchableOpacity>

          {isLocationExpanded && (
            <View style={styles.sectionContent}>
              <View style={styles.contentWrapper}>
                <View style={styles.detailRow}>
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
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={toggleOrganizerInfo}>
              <TextComponent
                text="Ban tổ chức"
                size={18}
                styles={{fontWeight: 'bold', color: 'black'}}
              />
              <Ionicons
                name={isOrganizerExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="black"
              />
            </TouchableOpacity>

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
                {isOrganizerExpanded && (
                  <View style={styles.organizerDetails}>
                    <View style={styles.organizerStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>25</Text>
                        <Text style={styles.statLabel}>Sự kiện</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>1.2K</Text>
                        <Text style={styles.statLabel}>Người theo dõi</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>4.8</Text>
                        <Text style={styles.statLabel}>Đánh giá</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.followButton}>
                      <Ionicons name="person-add" size={16} color="white" />
                      <Text style={styles.followButtonText}>Theo dõi</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <RatingAndReview detailEventId={detailEvent?._id} />
      </ScrollView>

      <View>
        <ButtonComponent
          onPress={() => {
            handleNavigation(detailEvent?.typeBase);
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: appColors.primary,
    paddingTop: Platform.OS === 'ios' ? 66 : 22,
  },
  headerTitle: {
    color: appColors.white2,
    fontSize: 22,
    fontWeight: '500',
  },
  body: {
    flex: 1,
  },
  imageBackground: {
    width: '100%',
    minHeight: 400,
    justifyContent: 'center',
  },
  containerEventDetail: {
    padding: 10,
  },
  imageEventDetail: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  containerEventDetailInfo: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  detailRow: {
    columnGap: 10,
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
    color: 'black',
    maxWidth: 320,
    marginTop: 2,
  },
  sectionContainer: {
    marginHorizontal: 12,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  sectionContent: {
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  contentWrapper: {
    padding: 16,
    paddingTop: 0,
  },
  ticketPriceContainer: {
    marginTop: 10,
  },
  ticketPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  ticketPriceLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketPriceValue: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Thêm styles cho phần Ban tổ chức
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  organizerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  organizerRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  organizerDetails: {
    marginTop: 16,
  },
  organizerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  aboutText: {
    textAlign: 'justify',
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.5,
  },
  buyTicketButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  buyTicketText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  showtimeContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  showtimeButton: {
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  showtimeText: {
    fontWeight: '600',
    fontSize: 16,
  },
  showtimeDateText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  ticketListContainer: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  ticketType: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  ticketPrice: {
    color: '#48BB78', // Green color for prices
    fontSize: 16,
    fontWeight: 'bold',
  },
});
