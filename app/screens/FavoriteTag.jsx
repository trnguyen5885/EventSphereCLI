import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AxiosInstance from '../services/api/AxiosInstance';

const FavoriteTag = () => {
  const navigation = useNavigation();
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mapping tags với icon tương ứng
  const tagIcons = {
    "2025": "🎉",
    "âm nhạc": "🎵",
    "Ẩm thực": "🍽️",
    "Cải Lương": "🎭",
    "concert": "🎤",
    "Gia đình": "👨‍👩‍👧‍👦",
    "Giải trí": "🎪",
    "Hài Kịch": "😂",
    "Hội chợ": "🎪",
    "Hội thảo": "📚",
    "Kịch": "🎭",
    "Kịch thiếu nhi": "🧸",
    "Lễ hội": "🎊",
    "live": "📺",
    "Nghệ thuật": "🎨",
    "rock": "🎸",
    "Sân khấu kịch": "🎬",
    "Sơn Tùng": "🎤",
    "Thể thao": "⚽",
    "Workshop": "🛠️"
  };

  // Gọi API để lấy danh sách tags
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError('');
      const axiosJWT = AxiosInstance();
      const res = await axiosJWT.get('tags/suggest');

      // API trả về mảng string trực tiếp
      if (res.data) {
        console.log('Fetched tags:', res);
        setTags(res.data);
      } else {
        // Fallback data với dữ liệu chính xác từ API
        setTags([
          "2025", "âm nhạc", "Ẩm thực", "Cải Lương", "concert",
          "Gia đình", "Giải trí", "Hài Kịch", "Hội chợ", "Hội thảo",
          "Kịch", "Kịch thiếu nhi", "Lễ hội", "live", "Nghệ thuật",
          "rock", "Sân khấu kịch", "Sơn Tùng", "Thể thao", "Workshop"
        ]);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Không thể tải danh sách thể loại');
      // Sử dụng dữ liệu chính xác từ API làm fallback
      setTags([
        "2025", "âm nhạc", "Ẩm thực", "Cải Lương", "concert",
        "Gia đình", "Giải trí", "Hài Kịch", "Hội chợ", "Hội thảo",
        "Kịch", "Kịch thiếu nhi", "Lễ hội", "live", "Nghệ thuật",
        "rock", "Sân khấu kịch", "Sơn Tùng", "Thể thao", "Workshop"
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn/bỏ chọn tag
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      // Bỏ chọn tag
      setSelectedTags(selectedTags.filter(item => item !== tag));
    } else {
      // Chọn tag (chỉ cho phép chọn tối đa 5)
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        Alert.alert(
          'Thông báo',
          'Bạn chỉ có thể chọn tối đa 5 thể loại yêu thích',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Xử lý nút Tiếp tục
  const handleContinue = () => {
    if (selectedTags.length !== 5) {
      Alert.alert(
        'Thông báo',
        'Vui lòng chọn đúng 5 thể loại yêu thích để tiếp tục',
        [{ text: 'OK' }]
      );
      return;
    }

    // Có thể lưu selectedTags vào AsyncStorage hoặc context
    console.log('Selected tags:', selectedTags);

    // Navigate to Welcome screen
    navigation.navigate('Welcome');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5669FF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn thể loại của bạn</Text>
        <Text style={styles.headerSubtitle}>
          Dựa trên danh mục của bạn, chúng tôi sẽ hiển thị cho bạn các chủ đề liên quan
        </Text>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Đã chọn: {selectedTags.length}/5
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(selectedTags.length / 5) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Tags Grid */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTags}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tagsGrid}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tagItem,
                  selectedTags.includes(tag) && styles.tagItemSelected
                ]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagIcon}>
                  {tagIcons[tag] || "🎯"}
                </Text>
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextSelected
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedTags.length === 5 && styles.continueButtonActive
          ]}
          onPress={handleContinue}
          disabled={selectedTags.length !== 5}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            selectedTags.length === 5 && styles.continueButtonTextActive
          ]}>
            Tiếp tục
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5669FF',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 14,
    color: '#5669FF',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5669FF',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#5669FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tagItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tagItemSelected: {
    backgroundColor: '#5669FF',
    borderColor: '#5669FF',
  },
  tagIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    textAlign: 'center',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#5669FF',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default FavoriteTag;