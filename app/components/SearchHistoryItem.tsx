import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../constants/appColors';
import { SearchHistoryItem as SearchHistoryItemType } from '../services/searchHistoryService';

interface Props {
  item: SearchHistoryItemType;
  onPress: (query: string) => void;
  onRemove: (id: string) => void;
}

const SearchHistoryItem: React.FC<Props> = ({ item, onPress, onRemove }) => {
  const handlePress = () => {
    onPress(item.query);
  };

  const handleRemove = (e: any) => {
    e.stopPropagation();
    onRemove(item.id);
  };



  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.contentContainer}>
        <MaterialIcons 
          name="history" 
          size={20} 
          color={appColors.gray} 
          style={styles.historyIcon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.queryText} numberOfLines={1}>
            {item.query}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={handleRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="close" size={16} color={appColors.gray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default React.memo(SearchHistoryItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  queryText: {
    fontSize: 16,
    color: appColors.text,
    fontWeight: '400',
  },
  removeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
});