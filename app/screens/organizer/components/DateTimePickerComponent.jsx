import React, { useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateTimePickerComponent = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [showPicker, setShowPicker] = useState({
    startDate: false,
    startTime: false,
    endDate: false,
    endTime: false,
  });

  const onChange = (event, selectedDate, type) => {
    setShowPicker(prev => ({ ...prev, [type]: false }));
    if (selectedDate) {
      if (type === 'startDate') setStartDate(selectedDate);
      if (type === 'startTime') setStartTime(selectedDate);
      if (type === 'endDate') setEndDate(selectedDate);
      if (type === 'endTime') setEndTime(selectedDate);
    }
  };

  const formatDateTime = (date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Thời gian bắt đầu:</Text>
      <Button title="Chọn ngày bắt đầu" onPress={() => setShowPicker(prev => ({ ...prev, startDate: true }))} />
      <Button title="Chọn giờ bắt đầu" onPress={() => setShowPicker(prev => ({ ...prev, startTime: true }))} />
      <Text>Bắt đầu: {formatDateTime(new Date(startDate.setHours(startTime.getHours(), startTime.getMinutes())))}</Text>

      <Text style={{ fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Thời gian kết thúc:</Text>
      <Button title="Chọn ngày kết thúc" onPress={() => setShowPicker(prev => ({ ...prev, endDate: true }))} />
      <Button title="Chọn giờ kết thúc" onPress={() => setShowPicker(prev => ({ ...prev, endTime: true }))} />
      <Text>Kết thúc: {formatDateTime(new Date(endDate.setHours(endTime.getHours(), endTime.getMinutes())))}</Text>

      {showPicker.startDate && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(e, d) => onChange(e, d, 'startDate')}
        />
      )}
      {showPicker.startTime && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(e, d) => onChange(e, d, 'startTime')}
        />
      )}
      {showPicker.endDate && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(e, d) => onChange(e, d, 'endDate')}
        />
      )}
      {showPicker.endTime && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={(e, d) => onChange(e, d, 'endTime')}
        />
      )}
    </View>
  );
};

export default DateTimePickerComponent;
