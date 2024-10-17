import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { collection, doc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import { router, useNavigation } from 'expo-router';

const UpcomingVacci = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); 

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Scheduled Vaccinations',
      headerStyle: {
        backgroundColor: '#3b82f6', // Set the header background color
      },
      headerTintColor: '#fff', // Set the back arrow and title color
    });

    fetchVaccinationSessions();
  }, [selectedDate]);

  // Real-time fetch data from Firestore
  const fetchVaccinationSessions = async () => {
    setLoading(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    const midwifeDocRef = doc(db, 'Midwives', 'DZ3G0ZOnt8KzFRD3MI02');
    const sessionsCollectionRef = collection(midwifeDocRef, 'VaccinationSessions');

    // Real-time listener for the vaccination sessions
    const unsubscribe = onSnapshot(sessionsCollectionRef, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? format(data.date.toDate(), 'yyyy-MM-dd') : data.date,
          startTime: data.startTime instanceof Timestamp ? format(data.startTime.toDate(), 'hh:mm a') : data.startTime,
          endTime: data.endTime instanceof Timestamp ? format(data.endTime.toDate(), 'hh:mm a') : data.endTime,
        };
      });

      const filtered = sessionsData.filter((session) => session.date === formattedDate);
      setFilteredSessions(filtered);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  };

  // Handle session deletion
  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const midwifeDocRef = doc(db, 'Midwives', 'DZ3G0ZOnt8KzFRD3MI02');
              const sessionDocRef = doc(midwifeDocRef, 'VaccinationSessions', sessionId);
              await deleteDoc(sessionDocRef); // Delete the session
            } catch (error) {
              console.error('Error deleting session: ', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const renderSession = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.sessionTitle}>Vaccination</Text>
      <Text>{`${item.startTime} to ${item.endTime}`}</Text>
      <Text>{item.selectedCenter}</Text>
      <Text>{item.selectedVaccine}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => {
            router.navigate({
              pathname: '/vaccination/vaccineSessionDetails',
              params: { sessionId: item.id },
            });
          }}
          style={styles.viewButton}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSession(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Date Picker */}
      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{format(selectedDate, 'yyyy-MM-dd')}</Text>
        </TouchableOpacity>
        <Text style={styles.dateText2}>( Pick a Date )</Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Display Vaccination Sessions or Loading Message */}
      <Text style={styles.dateTitle}>{format(selectedDate, 'dd MMMM')}</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : filteredSessions.length > 0 ? (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
        />
      ) : (
        <Text style={styles.noSessionsText}>No scheduled vaccination for today.</Text>
      )}

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
    padding: 16,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    color: '#3b82f6',
    marginRight: 10,
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
  dateText2: {
    color: '#b0b0b0',
  },
  dateTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#ff5c5c',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  noSessionsText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default UpcomingVacci;
