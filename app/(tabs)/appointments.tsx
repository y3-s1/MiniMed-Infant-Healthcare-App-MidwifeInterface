// app\(tabs)\appointments.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

export default function Appointments() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Banner */}
      {/* <Image source={require('../assets/banner.png')} style={styles.banner} /> */}

      {/* Navigation Cards */}
      <View style={styles.cardsContainer}>
        {/* <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('todaySessions')}>
          <Text style={styles.cardText}>Today's Sessions</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.card} 
          onPress={() => router.navigate({
            pathname: '/appointments/sheduleSessions',
            // params: { vaccineId: item.id, status: item.status },  
          })}
        >
          <Text style={styles.cardText}>Schedule Sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} 
          onPress={() => router.navigate({
            pathname: '/appointments/upcomingAppointments',
            // params: {},
          })}
        >
          <Text style={styles.cardText}>Upcoming Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} 
          onPress={() => router.navigate({
            pathname: '/appointments/appointmentsHistory',
            // params: {},
          })}
        >
          <Text style={styles.cardText}>Appointments History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  banner: {
    width: '100%',
    height: 150,
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#E6F7FF',
    padding: 20,
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    color: 'black',
  },
});
