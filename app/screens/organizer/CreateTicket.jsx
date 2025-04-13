import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import AddEventHeaderComponent from '../../components/AddEventHeaderComponent';
import { ButtonComponent } from '@/app/components';
import AntDesign from '@expo/vector-icons/AntDesign';

const CreateTicket = () => {
    return (
        <ScrollView>
            <View style={styles.container}>
                <AddEventHeaderComponent currentStep={2} />
                <View style={styles.sectionContainer}>
                    <Text style={styles.inputLabel}>Tên vé</Text>
                    <TextInput style={styles.inputField} placeholder="Tên vé" />
                    <Text style={styles.inputLabel}>Giá vé</Text>
                    <TextInput style={[styles.inputField,
                    { width: 170, color: 'red' }]}
                        placeholder="0"
                        placeholderTextColor={'red'} />
                    <Text style={styles.inputLabel}>Số lượng vé </Text>
                    <TextInput style={styles.inputField} placeholder="Số lượng vé" />
                    <Text style={styles.inputLabel}>Thời gian bắt đầu bán vé</Text>
                    <View style={[styles.inputField,
                    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <TextInput placeholder="Ngày bắt đầu bán vé" />
                        <AntDesign name="calendar" size={24} color="black" />
                    </View>
                    <Text style={styles.inputLabel}>Thời gian bắt đầu bán vé</Text>
                    <View style={[styles.inputField,
                    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <TextInput placeholder="Ngày kết thúc bán vé" />
                        <AntDesign name="calendar" size={24} color="black" />
                    </View>
                    <Text style={styles.inputLabel}>Thông tin vé</Text>
                    <TextInput style={[styles.inputField, { height: 140 }]} placeholder='Mô tả' />
                    <Text style={styles.inputLabel}>Hình ảnh vé</Text>
                    <TouchableOpacity style={[styles.imageUploadContainer,
                         { backgroundColor: 'grey',
                          height: 170,
                           borderRadius:10 }]} />
                </View>
                <View style={styles.buttonContainer}>
          <ButtonComponent type='primary' text='ĐẶT LẠI' textColor='black' color='white' styles={{ borderWidth: 1, width: 150 }} />
          <ButtonComponent type='primary' text='TIẾP' styles={{ width: 200 }} />
        </View>
            </View>
        </ScrollView>
    )
}

export default CreateTicket

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 50,
        paddingHorizontal: 14,
        backgroundColor: '#FCFCFC',
    },
    sectionContainer: {
        borderRadius: 30,
        borderColor: '#5669FF',
        borderWidth: 2,
        padding: 20,
        marginVertical: 10,
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    inputField: {
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 15,
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
      },
})