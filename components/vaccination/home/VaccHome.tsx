import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const VaccHome = () => {

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://th.bing.com/th/id/OIP.4bsmHh7S0U9rrg0mbIu4CwHaE8?w=278&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7' }} // Replace with the actual image URL
        style={styles.image}
      />
      <View style={styles.tabButton}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          // onPress={() => navigation.navigate('TodayVaccinations')}
        >
          <Text style={styles.buttonTextPrimary}>Today Vaccinations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.navigate('/vaccination/upcomingVaccinations')}
        >
          <Text style={styles.buttonTextSecondary}>Schedule Vaccinations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.navigate('/vaccination/allVaccinationSessions')}
        >
          <Text style={styles.buttonTextSecondary}>All Vaccinations</Text>
        </TouchableOpacity>
      </View>

      {/* Add button at the bottom */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.navigate('/vaccination/createForm')}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 300,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    marginBottom: 30,
  },
  buttonPrimary: {
    backgroundColor: '#43B0F1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 18,
  },
  tabButton: {
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#000',
    fontSize: 18,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 30, // Adjust this to control how far from the bottom the button is
    width: '100%',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#43B0F1',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VaccHome;
