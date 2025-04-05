import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const AddEventHeaderComponent = ({ currentStep }) => {
  return (
    <View>
      <Text style={styles.headerTitle}>Thêm sự kiện</Text>
      <View style={styles.headerSectionContainer}>
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <View
                style={[
                  styles.headerSectionIndex,
                  currentStep === step
                    ? { backgroundColor: '#5669FF' }
                    : { backgroundColor: 'white' },
                ]}
              >
                <Text
                  style={[
                    styles.headerSectionIndexNumber,
                    currentStep === step ? { color: 'white' } : { color: 'black' },
                  ]}
                >
                  {step}
                </Text>
              </View>
            </View>
            {step !== 3 && <View style={styles.headerSectionLine}></View>}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.headerSectionTitleContainer}>
        <Text style={styles.headerSectionTitle}>Thông tin</Text>
        <Text style={styles.headerSectionTitle}>Tạo vé</Text>
        <Text style={styles.headerSectionTitle}>Thanh toán</Text>
      </View>
    </View>
  );
};

export default AddEventHeaderComponent;

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 29,
    fontWeight: '400',
    width: '100%',
    textAlign: 'center',
  },
  headerSectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 12,
  },
  headerSectionIndex: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSectionIndexNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSectionLine: {
    borderWidth: 1,
    borderColor: '#5669FF',
    backgroundColor: '#5669FF',
    width: 90,
    height: 5,
    borderRadius: 10,
    opacity: 0.1,
  },
  headerSectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  headerSectionTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
});
