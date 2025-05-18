import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateTimePickerComponent = ({ onTimeChange, initialStart, initialEnd }) => {
  const [startDate, setStartDate] = useState(initialStart ? new Date(initialStart) : new Date());
  const [startTime, setStartTime] = useState(initialStart ? new Date(initialStart) : new Date());
  const [endDate, setEndDate] = useState(initialEnd ? new Date(initialEnd) : new Date());
  const [endTime, setEndTime] = useState(initialEnd ? new Date(initialEnd) : new Date());


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

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // ⏱️ Mỗi khi thay đổi date/time thì gọi hàm gửi về EventCreate
  useEffect(() => {
    const finalStart = combineDateTime(startDate, startTime);
    const finalEnd = combineDateTime(endDate, endTime);

    if (finalEnd < finalStart) {
      // Chỉ cập nhật nếu ngày giờ kết thúc thực sự khác ngày giờ bắt đầu
      if (
        endDate.getTime() !== startDate.getTime() ||
        endTime.getHours() !== startTime.getHours() ||
        endTime.getMinutes() !== startTime.getMinutes()
      ) {
        setEndDate(startDate);
        setEndTime(startTime);
        return; // Tránh gọi onTimeChange khi đang cập nhật lại state
      }
    } else {
      onTimeChange({ timeStart: finalStart.getTime(), timeEnd: finalEnd.getTime() });
    }
  }, [startDate, startTime, endDate, endTime, onTimeChange]);


  return (
    <View style={styles.container}>
      <View style={styles.dateTimeSection}>
        <Text style={styles.sectionTitle}>Thời gian bắt đầu:</Text>

        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateTimePicker}
            onPress={() => setShowPicker(prev => ({ ...prev, startDate: true }))}
          >
            <Icon name="calendar" size={16} color="#555" style={styles.icon} />
            <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimePicker}
            onPress={() => setShowPicker(prev => ({ ...prev, startTime: true }))}
          >
            <Icon name="clock-o" size={16} color="#555" style={styles.icon} />
            <Text style={styles.dateTimeText}>{formatTime(startTime)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateTimeSection}>
        <Text style={styles.sectionTitle}>Thời gian kết thúc:</Text>

        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateTimePicker}
            onPress={() => setShowPicker(prev => ({ ...prev, endDate: true }))}
          >
            <Icon name="calendar" size={16} color="#555" style={styles.icon} />
            <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimePicker}
            onPress={() => setShowPicker(prev => ({ ...prev, endTime: true }))}
          >
            <Icon name="clock-o" size={16} color="#555" style={styles.icon} />
            <Text style={styles.dateTimeText}>{formatTime(endTime)}</Text>
          </TouchableOpacity>
        </View>
      </View>

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

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dateTimeSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '500',
    marginBottom: 8,
    fontSize: 15,
    color: '#444',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateTimePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  icon: {
    marginRight: 8,
  },
  dateTimeText: {
    color: '#333',
  },
});