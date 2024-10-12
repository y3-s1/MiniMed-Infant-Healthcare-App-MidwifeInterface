import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const VaccHome = () => {

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://th.bing.com/th/id/OIP.4bsmHh7S0U9rrg0mbIu4CwHaE8?w=278&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7' }} 
        style={styles.image}
      />
      <View style={styles.tabButton}>

        <TouchableOpacity
          style={[styles.buttonSecondary, styles.scheduleButton]} // Add custom style
          onPress={() => router.navigate('/vaccination/upcomingVaccinations')}
        >
          <Text style={styles.buttonTextSecondary}>Schedule Vaccinations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonSecondary, styles.allVaccinationsButton]} // Add custom style
          onPress={() => router.navigate('/vaccination/allVaccinationSessions')}
        >
          <Text style={styles.buttonTextSecondary}>All Vaccinations</Text>
        </TouchableOpacity>
      </View>

      {/* Add button at the bottom */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.navigate('/vaccination/createForm')}
      >
        <Text style={styles.buttonText}>Add Session</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB', // Light, clean background
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    marginBottom: 30,
    resizeMode: 'cover',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: '#1E4E8C',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonTextSecondary: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  scheduleButton: {
    backgroundColor: '#7d9ffe', // Custom color for "Schedule Vaccinations"
  },
  allVaccinationsButton: {
    backgroundColor: '#7d9ffe', // Custom color for "All Vaccinations"
  },
  addButton: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    backgroundColor: '#0b66c7',
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },  
});

export default VaccHome;
