import React, { useRef } from 'react';
import { View, Button, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

export default function TestSheet() {
  const sheetRef = useRef(null);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Open Sheet" onPress={() => sheetRef.current?.expand()} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={['50%']}
        enablePanDownToClose
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ textAlign: 'center' }}>Hello from BottomSheet!</Text>
        </View>
      </BottomSheet>
    </View>
  );
} 