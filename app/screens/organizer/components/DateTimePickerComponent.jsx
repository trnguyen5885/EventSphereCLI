import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateTimePickerComponent = ({ onTimeChange }) => {
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

  const combineDateTime = (date, time) => {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  };

  const toUnixTimestamp = (date) => {
    return date.getTime(); // ✅ milliseconds
  };

  const formatDateTime = (date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // ⏱️ Mỗi khi thay đổi date/time thì gọi hàm gửi về EventCreate
  useEffect(() => {
    const finalStart = combineDateTime(startDate, startTime);
    const finalEnd = combineDateTime(endDate, endTime);

    const timeStart = toUnixTimestamp(finalStart);
    const timeEnd = toUnixTimestamp(finalEnd);

    onTimeChange({ timeStart, timeEnd });
  }, [startDate, startTime, endDate, endTime, onTimeChange]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Thời gian bắt đầu:</Text>
      <Button title="Chọn ngày bắt đầu" onPress={() => setShowPicker(prev => ({ ...prev, startDate: true }))} />
      <Button title="Chọn giờ bắt đầu" onPress={() => setShowPicker(prev => ({ ...prev, startTime: true }))} />
      <Text>Bắt đầu: {formatDateTime(combineDateTime(startDate, startTime))}</Text>

      <Text style={{ fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Thời gian kết thúc:</Text>
      <Button title="Chọn ngày kết thúc" onPress={() => setShowPicker(prev => ({ ...prev, endDate: true }))} />
      <Button title="Chọn giờ kết thúc" onPress={() => setShowPicker(prev => ({ ...prev, endTime: true }))} />
      <Text>Kết thúc: {formatDateTime(combineDateTime(endDate, endTime))}</Text>

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
