import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { TextComponent } from '../../../components';
import { appColors } from '../../../constants/appColors';

interface TabComponentProps {
  activeTab: number;
  setActiveTab: (tabId: number) => void;
}

const TabComponent = ({ activeTab, setActiveTab }: TabComponentProps) => {
    const tabs = [
        {id: 0, name: "Đề xuất"},
        {id: 1, name: "Nổi bật"},
        {id: 2, name: "Sắp diễn ra"},
      ];
  return (
    <View style={styles.tabContainer}>
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab;

      return (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, isActive && styles.activeTabItem]}
          onPress={() => setActiveTab(tab.id)}
        >
          <TextComponent
            text={tab.name}
            color={isActive ? appColors.white : appColors.gray2}
            styles={{ fontWeight: isActive ? "bold" : "normal" }}
          />
          {isActive && <View style={styles.underline} />}
        </TouchableOpacity>
      );
    })}
</View>
  )
}

export default TabComponent

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
      },
      tabItem: {
        alignItems: 'center',
        paddingHorizontal: 10,
      },
      activeTabItem: {
        // Có thể thêm style riêng khi tab active nếu cần
      },
      underline: {
        marginTop: 4,
        height: 3,
        width: '100%',
        backgroundColor: appColors.white,
        borderRadius: 999,
      },
})