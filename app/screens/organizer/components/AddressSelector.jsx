// components/AddressSelector.js
import React, { useEffect, useState } from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const AddressSelector = ({ address, setAddress }) => {
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          label: item.name,
          value: item.code,
        }));
        setAddress(prev => ({ ...prev, provinces: formatted }));
      });
  }, []);

  const onSelectProvince = item => {
    setAddress(prev => ({
      ...prev,
      selectedProvince: item,
      selectedDistrict: null,
      selectedWard: null,
      districts: [],
      wards: [],
    }));

    fetch(`https://provinces.open-api.vn/api/p/${item.value}?depth=2`)
      .then(res => res.json())
      .then(data => {
        const districts = data.districts.map(d => ({
          label: d.name,
          value: d.code,
        }));
        setAddress(prev => ({
          ...prev,
          districts,
        }));
      });
  };

  const onSelectDistrict = item => {
    setAddress(prev => ({
      ...prev,
      selectedDistrict: item,
      selectedWard: null,
      wards: [],
    }));

    fetch(`https://provinces.open-api.vn/api/d/${item.value}?depth=2`)
      .then(res => res.json())
      .then(data => {
        const wards = data.wards.map(w => ({
          label: w.name,
          value: w.code,
        }));
        setAddress(prev => ({
          ...prev,
          wards,
        }));
      });
  };

  return (
    <View>
      <Text style={styles.label}>Tỉnh/Thành</Text>
      <Dropdown
        data={address.provinces}
        style={styles.input}
        labelField="label"
        valueField="value"
        placeholder="Chọn tỉnh/thành"
        value={address.selectedProvince?.value}
        onChange={onSelectProvince}
        search
        searchPlaceholder="Tìm tỉnh/thành"
      />

      <Text style={styles.label}>Quận/Huyện</Text>
      <Dropdown
        data={address.districts}
        style={styles.input}
        labelField="label"
        valueField="value"
        placeholder="Chọn quận/huyện"
        value={address.selectedDistrict?.value}
        onChange={onSelectDistrict}
        
      />

      <Text style={styles.label}>Phường/Xã</Text>
      <Dropdown
        data={address.wards}
        style={styles.input}
        labelField="label"
        valueField="value"
        placeholder="Chọn phường/xã"
        value={address.selectedWard?.value}
        onChange={item => setAddress(prev => ({ ...prev, selectedWard: item }))}
      />

      <Text style={styles.label}>Số nhà, đường</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số nhà, tên đường..."
        placeholderTextColor="#A0A0A0"
        value={address.street}
        onChangeText={text => setAddress(prev => ({ ...prev, street: text }))}
      />
    </View>
  );
};

export default AddressSelector;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#FAFAFA',
  },
});