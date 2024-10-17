import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

export default function Appointments() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Banner */}
      <Image source={require('../../assets/images/appointmentsBanner.jpg')} style={styles.banner} />

      {/* Navigation Cards */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, styles.activeCard]} // Active card styling
          onPress={() =>
            router.navigate({
              pathname: '/appointments/todaySessions',
            })
          }
        >
          <Text style={[styles.cardText, styles.activeCardText]}>Today Sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.navigate({
              pathname: '/appointments/sheduleSessions',
            })
          }
        >
          <Text style={styles.cardText}>Schedule Sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.navigate({
              pathname: '/appointments/upcomingAppointments',
            })
          }
        >
          <Text style={styles.cardText}>Upcoming Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            router.navigate({
              pathname: '/appointments/appointmentsHistory',
            })
          }
        >
          <Text style={styles.cardText}>Completed Appointments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Match background color
  },
  banner: {
    width: '100%',
    height: 350,
    borderRadius: 10, // Slightly rounded banner corners
    marginBottom: 40,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Wrap cards to next row
    justifyContent: 'space-between', // Space between columns
    paddingHorizontal: 25,
  },
  card: {
    backgroundColor: '#FFFFFF', // White background for inactive cards
    padding: 20,
    width: '48%', // Each card takes about half of the row width
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC', // Light gray border
  },
  activeCard: {
    backgroundColor: '#64B5F6', // Teal color for active card (Today Sessions)
    borderColor: '#00BCD4', // Match border to background
  },
  cardText: {
    fontSize: 22,
    color: '#333333', // Darker text for inactive cards
    textAlign: 'center', // Center text for each card
  },
  activeCardText: {
    color: '#FFFFFF', // White text for active card
    fontWeight: 'bold', // Bold text for active card
  },
});
