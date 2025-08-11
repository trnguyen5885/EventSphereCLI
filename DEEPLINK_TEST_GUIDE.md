# 🔗 Hướng dẫn Test Deeplink Airbridge

## 📱 Trước khi test

### 1. Build và cài đặt app
```bash
cd android
./gradlew app:assembleDebug
./gradlew app:installDebug
```

### 2. Verify app đã được cài đặt
```bash
adb shell pm list packages | grep eventspherecli
# Should show: package:com.eventspherecli
```

## 🧪 Các phương pháp test

### Method 1: ADB Command (Khuyến nghị)
```bash
# Test khi app đang mở
adb shell am start -W -a android.intent.action.VIEW -d "eventsphere://event/123456" com.eventspherecli

# Test khi app đã đóng  
adb shell am force-stop com.eventspherecli
adb shell am start -W -a android.intent.action.VIEW -d "eventsphere://profile" com.eventspherecli

# Test deeplink tới trang lời mời
adb shell am start -W -a android.intent.action.VIEW -d "eventsphere://invite" com.eventspherecli
adb shell am start -W -a android.intent.action.VIEW -d "eventsphere://invitation" com.eventspherecli

# Test Airbridge tracking URL cho invite (giống như share trong EventDetailScreen)
adb shell am start -W -a android.intent.action.VIEW -d "https://abr.ge/@eventsphere/invite?route=invite&sub_id=invite&og_tag_id=205617036&routing_short_id=f32zsz&tracking_template_id=21687cf7c4cfd6219ee9e5311acf807c&ad_type=click" com.eventspherecli

# Test với data phức tạp
adb shell am start -W -a android.intent.action.VIEW -d "eventsphere://event/507f1f77bcf86cd799439011" com.eventspherecli
```

### Method 2: Browser Test
1. Mở browser trên Android device
2. Nhập vào address bar: `eventsphere://event/123456`
3. Tap "Go" hoặc Enter
4. App sẽ mở nếu deeplink hoạt động

### Method 3: QR Code Test
1. Tạo QR code với nội dung: `eventsphere://event/123456`
2. Scan QR code bằng camera app
3. Tap link để mở app

### Method 4: Share Intent Test  
```javascript
// Trong React Native app khác hoặc web app
Share.share({
  message: 'Check out this event: eventsphere://event/123456',
  url: 'eventsphere://event/123456'
});
```

## 📊 Monitor & Debug

### 1. React Native Logs
```bash
# Terminal 1: Start Metro
npx react-native start

# Terminal 2: View logs
npx react-native log-android

# Filter for deeplink logs
npx react-native log-android | grep -i "deeplink\|airbridge"
```

### 2. ADB Logs
```bash
# View all app logs
adb logcat | grep com.eventspherecli

# Filter for deeplink specific logs
adb logcat | grep -E "(Airbridge|deeplink|Navigation)"

# Clear logs and test
adb logcat -c
# Run deeplink test
adb logcat | grep -i airbridge

# Debug invite deeplink specifically
npx react-native log-android | grep -E "(🔍 Invite URL Debug|📨 Navigating to invite|invite)"
```

## ✅ Success Indicators

Khi deeplink hoạt động, bạn sẽ thấy:

### Console Logs:
```
✅ Airbridge React Native SDK initialized successfully  
📱 App Name: eventsphere
🔗 Airbridge deeplink received: eventsphere://event/123456
📝 Processing deeplink: eventsphere://event/123456
🎯 Navigating to event detail with ID: 123456

# Cho invite deeplink:
🔗 Airbridge deeplink received: eventsphere://invite
📝 Processing deeplink: eventsphere://invite
📨 Navigating to invite screen

# Cho Airbridge tracking URL:
🔗 Airbridge deeplink received: https://abr.ge/@eventsphere/invite?route=invite&sub_id=invite
📝 Processing deeplink: https://abr.ge/@eventsphere/invite?route=invite&sub_id=invite
📨 Navigating to invite screen
```

### App Behavior:
- App mở (nếu đã đóng)
- Navigate đến đúng screen (event detail, profile, etc.)
- Không có error messages

## ❌ Troubleshooting

### Issue: App không mở
```bash
# Check app đã cài đặt chưa
adb shell pm list packages | grep eventspherecli

# Check intent filters
adb shell dumpsys package com.eventspherecli | grep -A 10 -B 10 "android.intent.action.VIEW"
```

### Issue: App mở nhưng không navigate
- Check console logs for navigation errors
- Verify navigationRef đã được set
- Check route names match với navigation structure

### Issue: Deeplink không được receive
- Check AndroidManifest.xml intent-filters
- Verify scheme name đúng
- Test với scheme khác: `adb shell am start -W -a android.intent.action.VIEW -d "https://eventsphere.io.vn/event/123" com.eventspherecli`

### Issue: Airbridge URL dẫn đến Google Play thay vì app
**Nguyên nhân:**
- URL format không đúng (phải dùng `https://abr.ge/@eventsphere/` giống EventDetailScreen)
- App chưa được cài đặt
- Thiếu các parameters tracking cần thiết

**Giải pháp:**
- Sử dụng URL đúng format: `https://abr.ge/@eventsphere/invite?route=invite&sub_id=invite&og_tag_id=205617036&routing_short_id=f32zsz&tracking_template_id=21687cf7c4cfd6219ee9e5311acf807c&ad_type=click`
- Kiểm tra app đã cài đặt: `adb shell pm list packages | grep eventspherecli`
- Test custom scheme trước: `eventsphere://invite`

## 🎯 Test Cases

### Basic Tests:
- `eventsphere://` (mở home screen)
- `eventsphere://event/123456` (mở event detail)  
- `eventsphere://profile` (mở profile)
- `eventsphere://invite` (mở trang lời mời nhóm)
- `eventsphere://invitation` (mở trang lời mời nhóm)

### Advanced Tests:
- `eventsphere://event/507f1f77bcf86cd799439011` (MongoDB ObjectId)
- `eventsphere://search?q=music` (với query parameters)
- `https://eventsphere.io.vn/event/123` (Universal links)
- `https://abr.ge/@eventsphere/invite?route=invite&sub_id=invite` (Airbridge tracking URL cho invite)

### Edge Cases:
- App chưa cài đặt (sẽ mở Play Store)
- App đã cài nhưng chưa mở lần nào
- App đang chạy trong background
- App đã bị force close

## 📈 Advanced Monitoring

### Airbridge Dashboard:
1. Login to Airbridge dashboard
2. Go to **Raw Data > App Real-time Logs**  
3. Filter by device IDFA/GAID
4. Look for deeplink events

### Custom Logging:
```javascript
// Add to AirbridgeService.js
handleDeeplink(url) {
  console.log('🔗 DEEPLINK RECEIVED:', url);
  console.log('📱 Navigation ready:', this.navigationRef?.isReady());
  console.log('📍 Current route:', this.navigationRef?.getCurrentRoute()?.name);
  
  // Your existing code...
}
```