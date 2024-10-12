import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/FireBaseConfig';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

const EditVaccinationSchedule = ({ sessionId }) => {
  const route = useRoute();
  const midwifeId = 'DZ3G0ZOnt8KzFRD3MI02'; // Midwife ID

  const navigation = useNavigation();

  const [vaccinationData, setVaccinationData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    selectedArea: '',
    selectedCenter: '',
    selectedParticipants: [],
    selectedVaccine: '',
    status: ''
  });

  useEffect(() => {


    navigation.setOptions({
      headerTitle: 'Create Vaccination Session',
      headerStyle: {
        backgroundColor: '#3b82f6', // Set the header background color
      },
      headerTintColor: '#fff', // Set the back arrow and title color
    });
    const fetchVaccinationSession = async () => {
      try {
        const sessionDocRef = doc(db, 'Midwives', midwifeId, 'VaccinationSessions', sessionId);
        const sessionDoc = await getDoc(sessionDocRef);

        if (sessionDoc.exists()) {
          const sessionData = sessionDoc.data();
  
          // Extract the date and time components
          const date = sessionData.date.toDate().toISOString().split('T')[0]; // Only the date part (YYYY-MM-DD)
          const startTime = sessionData.startTime.toDate().toISOString().split('T')[1].slice(0, 5); // Only the time part (HH:MM)
          const endTime = sessionData.endTime.toDate().toISOString().split('T')[1].slice(0, 5); // Only the time part (HH:MM)
  
          setVaccinationData({
            date: date, // Set the date field
            startTime: startTime, // Set start time (HH:MM)
            endTime: endTime, // Set end time (HH:MM)
            selectedArea: sessionData.selectedArea || '',
            selectedCenter: sessionData.selectedCenter || '',
            selectedParticipants: sessionData.selectedParticipants || [],
            selectedVaccine: sessionData.selectedVaccine || '',
            status: sessionData.status || ''
          });
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchVaccinationSession();
  }, [sessionId]);

  const handleUpdate = async () => {
    try {
      // Combine date and time fields into valid Date objects
      const dateOnly = new Date(vaccinationData.date); // Date field (YYYY-MM-DD)
  
      const startTime = new Date(`${vaccinationData.date}T${vaccinationData.startTime}:00`); // Combine date with start time
      const endTime = new Date(`${vaccinationData.date}T${vaccinationData.endTime}:00`); // Combine date with end time
  
      // Reference to the session document
      const sessionDocRef = doc(db, 'Midwives', midwifeId, 'VaccinationSessions', sessionId);
  
      // Update the document with the newly created Date objects
      await updateDoc(sessionDocRef, {
        date: dateOnly, // Update the date field
        startTime: startTime, // Update the start time
        endTime: endTime, // Update the end time
        selectedArea: vaccinationData.selectedArea,
        selectedCenter: vaccinationData.selectedCenter,
        selectedParticipants: vaccinationData.selectedParticipants,
        selectedVaccine: vaccinationData.selectedVaccine,
        status: vaccinationData.status,
        updatedAt: new Date() // Update the updatedAt field
      });
  
      alert('Vaccination session updated successfully!');
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Failed to update session');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Vaccination Schedule</Text>
      
      {/* Date */}
      <Text style={styles.label}>Date:</Text>
      <TextInput
        value={vaccinationData.date}
        onChangeText={(text) => setVaccinationData({ ...vaccinationData, date: text })}
        placeholder="Enter date"
        style={styles.input}
      />
      
      {/* Start Time */}
      <Text style={styles.label}>Start Time:</Text>
      <TextInput
        value={vaccinationData.startTime}
        onChangeText={(text) => setVaccinationData({ ...vaccinationData, startTime: text })}
        placeholder="Enter start time"
        style={styles.input}
      />
      
      {/* End Time */}
      <Text style={styles.label}>End Time:</Text>
      <TextInput
        value={vaccinationData.endTime}
        onChangeText={(text) => setVaccinationData({ ...vaccinationData, endTime: text })}
        placeholder="Enter end time"
        style={styles.input}
      />
      
      {/* Selected Center */}
      <Text style={styles.label}>Selected Center:</Text>
      <TextInput
        value={vaccinationData.selectedCenter}
        onChangeText={(text) => setVaccinationData({ ...vaccinationData, selectedCenter: text })}
        placeholder="Enter selected center"
        style={styles.input}
      />
      
      {/* Selected Vaccine */}
      <Text style={styles.label}>Selected Vaccine:</Text>
      <TextInput
        value={vaccinationData.selectedVaccine}
        onChangeText={(text) => setVaccinationData({ ...vaccinationData, selectedVaccine: text })}
        placeholder="Enter selected vaccine"
        style={styles.input}
      />
      
      {/* Status */}
      <Text style={styles.label}>Status:</Text>
      <TextInput
        value={vaccinationData.status}
        onChangeText={(text) => setVaccinationData({ ...vaccinationData, status: text })}
        placeholder="Enter status"
        style={styles.input}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Session</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f8fa',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditVaccinationSchedule;
