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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AxiosInstance} from '../../services';
import {globalStyles} from '../../constants/globalStyles';
import {
  ButtonComponent,
  CircleComponent,
  RowComponent,
  TextComponent,
} from '../../components';
import {appColors} from '../../constants/appColors';
import {formatDate} from '../../services/index';
import {formatPrice} from '../../services/utils/price';
import RatingAndReview from '../review/RatingAndReview';
import {EventModel} from '@/app/models';
import ListInviteComponent from './components/ListInviteComponent';
import InviteComponent from './components/InviteComponent';

const EventDetailScreen = ({navigation, route}: any) => {
  const {id} = route.params;
  const [detailEvent, setDetailEvent] = useState<EventModel | null>();
  const sheetRef = useRef<any>(null);
  const handleNavigation = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const getDetailEvent = async () => {
      try {
        const response = await AxiosInstance().get(`events/detail/${id}`);
        setDetailEvent(response.data);
      } catch (e) {
        console.log(e);
      }
    };

    getDetailEvent();

    return () => {
      setDetailEvent(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInviteList = () => {
    if (sheetRef.current && typeof sheetRef.current.expand === 'function') {
      sheetRef.current?.expand();
      console.log('sheetRef.current', sheetRef.current)
    } else {
      console.error('Bottom sheet reference or present method is not available');
    }
  }

  return (
    <View style={[globalStyles.container]}>
      <View style={styles.header}>
        <StatusBar animated backgroundColor={appColors.primary} />
        <RowComponent onPress={handleNavigation} styles={{columnGap: 25}}>
          <Ionicons name="chevron-back" size={26} color="white" />

          <Text style={styles.headerTitle}>Chi tiết sự kiện</Text>
        </RowComponent>

        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color="white" />
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
          <View style={{ width: '100%', alignItems: 'center' }}>
              <InviteComponent onPress={handleInviteList} eventId = {id}/>
            </View>
        </ImageBackground>
        <View style={styles.aboutSection}>
          <TextComponent text="Thông tin sự kiện" size={24} />
          <Text style={styles.aboutText}>{detailEvent?.description}</Text>
        </View>

        <RatingAndReview detailEventId={detailEvent?._id} />
      </ScrollView>

      <View>
        <ButtonComponent
          onPress={() => {
            navigation.navigate('Ticket', {
              id: detailEvent?._id,
            });
          }}
          text={`Mua vé với giá ${formatPrice(detailEvent?.ticketPrice)}`}
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
      <ListInviteComponent
        sheetRef={sheetRef}
        eventId={detailEvent?._id}
      />
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
    marginTop: 24,
  },
  buyTicketText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
