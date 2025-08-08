import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../constants/appColors';
import { SearchHistoryItem as SearchHistoryItemType } from '../services/searchHistoryService';
import SearchHistoryItem from './SearchHistoryItem';

interface Props {
  searchHistory: SearchHistoryItemType[];
  onSelectHistory: (query: string) => void;
  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;
  loading?: boolean;
}

const SearchHistoryList: React.FC<Props> = ({
  searchHistory,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
  loading = false,
}) => {
  const handleClearAll = () => {
    if (searchHistory.length === 0) return;

    Alert.alert(
      'Xóa lịch sử tìm kiếm',
      'Bạn có chắc chắn muốn xóa toàn bộ lịch sử tìm kiếm?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: onClearHistory,
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: SearchHistoryItemType }) => (
    <SearchHistoryItem
      item={item}
      onPress={onSelectHistory}
      onRemove={onRemoveHistory}
    />
  );

  const keyExtractor = (item: SearchHistoryItemType) => item.id;

  const ListHeader = useMemo(() => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <MaterialIcons name="history" size={20} color={appColors.text} />
        <Text style={styles.title}>Lịch sử tìm kiếm</Text>
      </View>
      {searchHistory.length > 0 && (
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [searchHistory.length]);

  const EmptyState = useMemo(() => (
    <View style={styles.emptyState}>
      <MaterialIcons name="history" size={48} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có lịch sử tìm kiếm</Text>
      <Text style={styles.emptySubText}>
        Tìm kiếm sự kiện để xem lịch sử tại đây
      </Text>
    </View>
  ), []);

  if (loading) {
    return (
      <View style={styles.container}>
        {ListHeader}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={searchHistory}
        keyExtractor={keyExtractor}
        renderItem={renderHistoryItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </View>
  );
};

export default React.memo(SearchHistoryList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    marginLeft: 8,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: appColors.primary,
  },
  clearText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: appColors.gray,
  },
});