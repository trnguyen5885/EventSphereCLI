import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { AxiosInstance } from '../../../services';
import { appColors } from '../../../constants/appColors';

const ListInviteComponent = ({ sheetRef, eventId, onInvite }) => {
  const [selected, setSelected] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const snapPoints = useMemo(() => ['75%'], []);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const res = await AxiosInstance().get('friends/list');
        console.log("Friends data:", JSON.stringify(res));
        setFriends(res.friends || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const handleInvite = async () => {
    if (selected.length === 0) return;
    const selectedFriends = friends.filter(x => selected.includes(x._id));
    try {
      if (onInvite) {
        await onInvite(selectedFriends);
      } else {
        const body = {
          eventId: eventId,
          userIds: selectedFriends.map(x => x._id)
        };
        console.log("Body:", JSON.stringify(body));
        await AxiosInstance().post('friends/invites', body);
      }
      setSelected([]);
      sheetRef.current?.close();
    } catch (error) {
      console.error('Error inviting friends:', error);
    }
  };

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleSelect(item._id)}
      style={[
        styles.item,
        selected.includes(item._id) && styles.selectedItem
      ]}
      activeOpacity={0.7}
      accessible
      accessibilityLabel={`Select ${item.username}`}
      accessibilityHint="Double tap to select or unselect this friend"
    >
      <View style={styles.itemContainer}>
        <View style={styles.avatarContainer}>
          {item.picUrl ? (
            <Image 
              source={{ uri: item.picUrl }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.username?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.username}>
          {item.username}
        </Text>
        
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox,
            selected.includes(item._id) && styles.checkboxSelected
          ]}>
            <Image source={require('../../../../assets/images/tick.png')} style={styles.checkmark}/>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <Text style={styles.emptyText}>Đang tải danh sách bạn bè...</Text>
      ) : (
        <Text style={styles.emptyText}>Không tìm thấy bạn bè nào</Text>
      )}
    </View>
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mời bạn bè tham gia</Text>
          <Text style={styles.subtitle}>
            Đã chọn {selected.length} {selected.length === 1 ? 'người' : 'người'}
          </Text>
        </View>

        <FlatList
          data={friends}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyListComponent}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity 
          onPress={handleInvite} 
          style={[
            styles.button,
            selected.length === 0 && styles.buttonDisabled
          ]}
          disabled={selected.length === 0}
        >
          <Text style={styles.buttonText}>
            Gửi lời mời
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ListInviteComponent;

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    flex: 1, 
    backgroundColor: '#fff'
  },
  header: {
    marginBottom: 16,
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 4,
    color: '#222'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingBottom: 16,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  username: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  checkboxContainer: {
    paddingLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E2E2'
  },
  checkboxSelected: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  checkmark: {
    color: 'white',
    height: 10,
    width: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: appColors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '70%',
    height: 60,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20
  },
  buttonDisabled: {
    display: 'none'
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});