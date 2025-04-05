import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

const data = [
    { ticket: 50, other: 20 },
    { ticket: 30, other: 10 },
    { ticket: 80, other: 30 },
    { ticket: 60, other: 25 },
    { ticket: 90, other: 40 },
    { ticket: 40, other: 15 },
    { ticket: 100, other: 50 }
];
const maxRevenue = Math.max(...data.map(d => d.ticket + d.other));

const Chart = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thống kê</Text>
            <Text style={styles.subTitle}>Tổng quan</Text>
            <View style={styles.totalRevenueContainer}>
                <View style={[styles.totalRevenueItem, { backgroundColor: '#4A43EC' }]}> 
                    <Text style={styles.totalRevenueItemTitle}>Vé</Text>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <Text style={styles.revenue}>$230</Text>
                        <Text style={styles.revenueDifference}><AntDesign name="caretup" size={10} color="#117B34" /> 5.39%</Text>
                    </View>
                </View>
                <View style={[styles.totalRevenueItem, { backgroundColor: '#FF5733' }]}> 
                    <Text style={styles.totalRevenueItemTitle}>Doanh thu</Text>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <Text style={styles.revenue}>$135</Text>
                        <Text style={styles.revenueDifference}><AntDesign name="caretup" size={10} color="#117B34" /> 5.39%</Text>
                    </View>
                </View>
            </View>

         
            <View style={styles.chartContainer}>
                {data.map((value, index) => (
                    <View key={index} style={styles.barWrapper}>
                        <View style={[styles.bar, { height: `${(value.ticket / maxRevenue) * 100}%`, backgroundColor: '#4A43EC' }]} />
                        <View style={[styles.bar, { height: `${(value.other / maxRevenue) * 100}%`, backgroundColor: '#FF5733' }]} />
                    </View>
                ))}
            </View>
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#4A43EC' }]} />
                    <Text>Vé</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FF5733' }]} />
                    <Text>Doanh thu</Text>
                </View>
            </View>
        </View>
    )
}

export default Chart

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 18
    },
    title: {
        fontSize: 24,
        fontWeight: '500',
        marginBottom: 10,
        textAlign: 'center'
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    totalRevenueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
        marginVertical: 10
    },
    totalRevenueItem: {
        width: '48%',
        height: 110,
        borderRadius: 10,
        justifyContent: 'center',
        padding: 20
    },
    totalRevenueItemTitle: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold'
    },
    revenue: {
        fontSize: 30,
        color: '#fff',
        fontWeight: 'bold'
    },
    revenueDifference: {
        paddingVertical: 2,
        paddingHorizontal: 7,
        backgroundColor: '#EEFDF3',
        borderRadius: 50,
        fontSize: 11
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 200,
        padding: 10,
        borderRadius: 10
    },
    barWrapper: {
        flexDirection: 'column',
        alignItems: 'center',
        width: 20
    },
    bar: {
        width: 25,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10
    },
    legendColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5
    }
})
