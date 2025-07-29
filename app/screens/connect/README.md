# GroupScreen - Refactored Architecture

## 📚 **Overview**

Đây là version cải thiện của `GroupScreen` với kiến trúc modular, TypeScript support, và performance optimization.

## 🏗️ **Architecture**

### **File Structure**
```
connect/
├── GroupScreen.tsx                 # Main component (refactored)
├── types/
│   └── GroupTypes.ts              # TypeScript interfaces
├── utils/
│   └── locationUtils.ts           # Location & distance utilities
├── hooks/
│   ├── useGroupMembers.ts         # Members management logic
│   └── useErrorHandler.ts         # Error handling logic
├── components/
│   ├── GroupHeader.tsx            # Header with stats
│   ├── ActionButtons.tsx          # Location sharing buttons
│   ├── MembersList.tsx            # Optimized members list
│   ├── ErrorBoundary.tsx          # Error boundary wrapper
│   └── GroupMap.jsx               # Existing map component
└── README.md                      # This file
```

## ✨ **Key Improvements**

### **1. TypeScript Integration**
```typescript
interface GroupScreenProps {
  route: {
    params: {
      groupId: string;
      userLocation?: LocationCoordinates;
      groupName?: string;
      ownerId?: { _id: string };
    };
  };
  navigation: any;
}
```

### **2. Modular Components**
- **GroupHeader**: Header với stats và navigation
- **ActionButtons**: Location sharing controls  
- **MembersList**: Optimized list với animations
- **ErrorBoundary**: Error handling wrapper

### **3. Custom Hooks**
```typescript
// Location và member management
const { stats, onlineMembers, calculateDistance } = useGroupMembers({
  members, locations, userId, initialUserLocation
});

// Enhanced error handling
const { error, handleError, clearError } = useErrorHandler();
```

### **4. Utility Functions**
```typescript
// Distance calculations
export const calculateDistance = (lat1, lon1, lat2, lon2) => { ... }
export const formatDistance = (distance: number) => { ... }
export const getDistanceToMember = (userLocation, member) => { ... }

// Location parsing
export const parseLocationData = (location: LocationData) => { ... }
export const getMembersWithLocation = (members, locations) => { ... }
```

### **5. Performance Optimizations**
- **Memoization**: `useMemo`, `useCallback` cho expensive operations
- **Virtual scrolling**: FlatList optimization
- **Component memoization**: `React.memo` cho sub-components
- **Efficient re-renders**: Proper dependency arrays

### **6. Enhanced Error Handling**
```typescript
const { error, handleError, showErrorAlert } = useErrorHandler();

try {
  await inviteToGroup(groupId, email);
} catch (err) {
  handleError(err, 'invite member'); // Context-aware error handling
}
```

### **7. Accessibility Support**
```typescript
<TouchableOpacity
  accessibilityLabel="Chia sẻ vị trí"
  accessibilityRole="button"
  accessibilityState={{ selected: isSharing }}
>
```

## 🚀 **Usage**

### **Basic Usage**
```typescript
import GroupScreen from './screens/connect/GroupScreen';
import ErrorBoundary from './screens/connect/components/ErrorBoundary';

// With error boundary
<ErrorBoundary>
  <GroupScreen route={route} navigation={navigation} />
</ErrorBoundary>
```

### **Individual Components**
```typescript
import { GroupHeader, ActionButtons, MembersList } from './components';

<GroupHeader
  groupName="My Group"
  isOwner={true}
  stats={{ totalMembers: 5, onlineMembers: 3 }}
  onBack={() => navigation.goBack()}
/>
```

## 📊 **Performance Metrics**

### **Before Refactoring**
- **File size**: 970 lines
- **Re-renders**: Excessive due to large component
- **Memory usage**: High due to inefficient lists
- **Error handling**: Basic alert() only

### **After Refactoring**  
- **File size**: ~600 lines (main component)
- **Re-renders**: Optimized with memoization
- **Memory usage**: Reduced with virtual scrolling
- **Error handling**: Context-aware with retry logic

## 🛠️ **Development Guidelines**

### **Adding New Features**
1. Create types in `types/GroupTypes.ts`
2. Add utility functions in `utils/`
3. Create custom hooks in `hooks/`
4. Build reusable components in `components/`
5. Update main `GroupScreen.tsx`

### **Error Handling Pattern**
```typescript
const { handleError } = useErrorHandler();

const someAsyncFunction = async () => {
  try {
    await apiCall();
  } catch (err) {
    handleError(err, 'context description');
  }
};
```

### **Testing**
```typescript
// Unit tests for utilities
describe('locationUtils', () => {
  test('calculateDistance should return correct distance', () => {
    expect(calculateDistance(0, 0, 0, 1)).toBeCloseTo(111.32);
  });
});

// Component tests
describe('GroupHeader', () => {
  test('should render group name correctly', () => {
    // Test implementation
  });
});
```

## 🔧 **Configuration**

### **TypeScript Config**
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true
  }
}
```

### **Performance Config**
```typescript
// FlatList optimization
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  getItemLayout={getItemLayout} // For fixed item heights
/>
```

## 🐛 **Common Issues**

### **Location Permission Issues**
```typescript
// Handle in useErrorHandler
if (error.message?.includes('permission')) {
  // Show permission dialog
  // Guide user to settings
}
```

### **Network Errors**
```typescript
// Retry mechanism
const retryableError: GroupError = {
  type: 'network',
  message: 'Connection failed',
  retry: () => refetchData()
};
```

## 📈 **Future Improvements**

1. **Offline Support**: Cache data với AsyncStorage
2. **Push Notifications**: Real-time updates
3. **Advanced Animations**: Shared element transitions
4. **Testing Coverage**: Unit & integration tests
5. **Performance Monitoring**: Flipper integration
6. **A11y Testing**: Screen reader compatibility

## 🤝 **Contributing**

1. Follow TypeScript strict mode
2. Add proper error handling
3. Include accessibility props
4. Write unit tests for utilities
5. Update documentation

---

*Refactored with ❤️ for better maintainability và user experience* 