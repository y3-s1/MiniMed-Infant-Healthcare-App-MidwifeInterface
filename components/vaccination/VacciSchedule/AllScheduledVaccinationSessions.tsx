import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { collection, doc, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import { router, useNavigation } from 'expo-router';
// Optionally import SearchBar from react-native-elements if you prefer it:
// import { SearchBar } from 'react-native-elements'; 

// Main component
const AllScheduledVaccinationSessions = () => {
  const [vaccinationSessions, setVaccinationSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);  // State for filtered results
  const [searchQuery, setSearchQuery] = useState('');  // State for search input
  const navigation = useNavigation();

  // Function to handle the deletion of a session
  const handleDeleteSession = async (sessionId) => {
    try {
      const midwifeDocRef = doc(db, 'Midwives', 'DZ3G0ZOnt8KzFRD3MI02'); 
      const sessionDocRef = doc(midwifeDocRef, 'VaccinationSessions', sessionId);

      // Confirm the deletion with the user
      Alert.alert(
        "Delete Session",
        "Are you sure you want to delete this session?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              await deleteDoc(sessionDocRef); // Delete the session from Firestore
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting session: ', error);
    }
  };

  // Fetch vaccination sessions when component mounts
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'All Vaccinations',
      headerStyle: {
        backgroundColor: '#3b82f6', // Set the header background color
      },
      headerTintColor: '#fff', // Set the back arrow and title color
    });

    const midwifeDocRef = doc(db, 'Midwives', 'DZ3G0ZOnt8KzFRD3MI02'); 
    const sessionsCollectionRef = collection(midwifeDocRef, 'VaccinationSessions');
    
    // Set up the real-time listener with onSnapshot
    const unsubscribe = onSnapshot(sessionsCollectionRef, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().selectedVaccine,
        time: `${new Date(doc.data().startTime.seconds * 1000).toLocaleTimeString()} to ${new Date(doc.data().endTime.seconds * 1000).toLocaleTimeString()}`,
        location: doc.data().selectedCenter,
        bookedSlots: `${doc.data().selectedParticipants.length}/10`,
      }));
      setVaccinationSessions(sessionsData); // Update the state with real-time data
      setFilteredSessions(sessionsData);    // Initialize filtered sessions
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Filter sessions based on the search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredSessions(vaccinationSessions);
    } else {
      const filtered = vaccinationSessions.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSessions(filtered);
    }
  }, [searchQuery, vaccinationSessions]);

  // Render each session
  const renderSession = ({ item }) => (
    <View style={styles.sessionCard}>
      <Text style={styles.sessionTitle}>{item.title}</Text>
      <Text style={styles.sessionTime}>{item.time}</Text>
      <Text style={styles.sessionLocation}>{item.location}</Text>
      <Text style={styles.bookedSlots}>Booked Slots: {item.bookedSlots}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => {
          router.navigate({
            pathname: '/vaccination/vaccineSessionDetails',
            params: { sessionId: item.id },
          });
        }}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSession(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Vaccine or Location"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* FlatList to render filtered sessions */}
      <FlatList
        data={filteredSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  sessionLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  bookedSlots: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Styles for the search bar
  searchInput: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    fontSize: 16,
    color: '#333',
  },
});

export default AllScheduledVaccinationSessions;
