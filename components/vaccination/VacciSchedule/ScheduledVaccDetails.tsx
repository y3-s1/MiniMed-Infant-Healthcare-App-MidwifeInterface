import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/FireBaseConfig'; // Import your Firestore config
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

interface Participant {
  id: string;
  name: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled';
}

interface VaccinationSession {
  startTime: string;
  endTime: string;
  selectedCenter: string;
  selectedVaccine: string;
  confirmedCount: number;
  rescheduledCount: number;
  participants: Participant[];
}

const ScheduledVaccDetails = ({ sessionId }: any) => {
  const [session, setSession] = useState<VaccinationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [initialConfirmedCount, setInitialConfirmedCount] = useState(0);
  const [initialRescheduledCount, setInitialRescheduledCount] = useState(0);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Sessions',
      headerStyle: {
        backgroundColor: '#3b82f6', // Set the header background color
      },
      headerTintColor: '#fff', // Set the back arrow and title color
    });

    fetchVaccinationSession(sessionId);
  }, [sessionId]);

  // Function to fetch Vaccination Session and Participants
  const fetchVaccinationSession = async (sessionId: string) => {
    try {
      const sessionDocRef = doc(db, 'Midwives', 'DZ3G0ZOnt8KzFRD3MI02', 'VaccinationSessions', sessionId);
      const sessionDocSnapshot = await getDoc(sessionDocRef);
  
      if (sessionDocSnapshot.exists()) {
        const sessionData = sessionDocSnapshot.data();
        let confirmedCount = 0;
        let rescheduledCount = 0;
        const participants: Participant[] = [];
        
        for (const childId of sessionData.selectedParticipants) {
          const vaccinationRecord = await fetchVaccinationRecord(childId, sessionId);
          if (vaccinationRecord) {
            const userId = vaccinationRecord.UserId;
            const childDocRef = doc(db, 'Users', userId, 'Childrens', childId);
            const childDocSnapshot = await getDoc(childDocRef);
  
            if (childDocSnapshot.exists()) {
              const childData = childDocSnapshot.data();
              const status = vaccinationRecord.status || 'Pending';
              if (status === 'Scheduled') confirmedCount++;
              else if (status === 'Rescheduled') rescheduledCount++;
  
              participants.push({
                id: childId,
                name: childData.name, 
                status,
              });
            }
          }
        }

        setInitialConfirmedCount(confirmedCount);
        setInitialRescheduledCount(rescheduledCount);

        setSession({
          startTime: new Date(sessionData.startTime.seconds * 1000).toLocaleTimeString(),
          endTime: new Date(sessionData.endTime.seconds * 1000).toLocaleTimeString(),
          selectedCenter: sessionData.selectedCenter,
          selectedVaccine: sessionData.selectedVaccine,
          confirmedCount,
          rescheduledCount,
          participants,
        });
      } else {
        Alert.alert('Error', 'Session not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch session details');
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchVaccinationRecord = async (childId: string, sessionId: string) => {
    try {
      const vaccinationRecordsQuery = query(
        collection(db, 'VaccinationRecords'),
        where('vaccinationSessionId', '==', sessionId),
        where('childId', '==', childId)
      );
      const recordsSnapshot = await getDocs(vaccinationRecordsQuery);
      return !recordsSnapshot.empty ? recordsSnapshot.docs[0].data() : null;
    } catch (error) {
      console.error('Error fetching vaccination record:', error);
      return null;
    }
  };

  // Function to update the vaccination status of a participant
  const updateParticipantStatus = async (childId: string, newStatus: 'Completed') => {
    try {
      const vaccinationRecordsQuery = query(
        collection(db, 'VaccinationRecords'),
        where('vaccinationSessionId', '==', sessionId),
        where('childId', '==', childId)
      );
      const recordsSnapshot = await getDocs(vaccinationRecordsQuery);
      if (!recordsSnapshot.empty) {
        const recordDocRef = recordsSnapshot.docs[0].ref;
        await updateDoc(recordDocRef, { status: newStatus });
        setSession((prevSession) => {
          if (!prevSession) return null;
          return {
            ...prevSession,
            participants: prevSession.participants.map((participant) =>
              participant.id === childId ? { ...participant, status: newStatus } : participant
            ),
          };
        });
        Alert.alert('Success', 'Participant status updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update participant status');
      console.error('Error updating participant status:', error);
    }
  };

  // Function to end the session and hide participant list
  const endSession = () => {
    setSessionStarted(false);
  };

  // Function to complete the session and update Firestore
  const completeSession = async () => {
    try {
      const sessionDocRef = doc(db, 'Midwives', 'DZ3G0ZOnt8KzFRD3MI02', 'VaccinationSessions', sessionId);
      await updateDoc(sessionDocRef, {
        status: 'Completed',
        confirmedCount: initialConfirmedCount,
        rescheduledCount: initialRescheduledCount,
      });
      setSessionCompleted(true);
      Alert.alert('Success', 'Session completed and counts saved.');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete the session.');
      console.error('Error completing session:', error);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Text>Session not found.</Text>;
  }

  return (
    <View style={styles.container}>

      {/* Edit Icon */}
      <TouchableOpacity
        style={styles.editIcon}
        onPress={() => router.navigate({
          pathname: '/vaccination/updateVaccinations',
          params: { sessionId: sessionId },
        })}
      >
        <Ionicons name="create-outline" size={24} color="black" />
      </TouchableOpacity>


      <Text className='pb-6 text-2xl text-slate-900 '>Vaccination Session Details</Text>

      <View style={styles.sessionDetails}>
        <View className='pb-5'>
          <View className='flex-row justify-between'>
            <Text style={styles.label}>Vaccine Name:</Text>
            <Text style={styles.sessionvaccineName}>{session?.selectedVaccine || 'Unknown Vaccine'}</Text>
          </View>

          <View className='flex-row justify-between'>
            <Text style={styles.label}>Scheduled Date:</Text>
            <Text style={styles.sessiondetails}>{'To be confirmed'}</Text>
          </View>

          <View className='flex-row justify-between'>
            <Text style={styles.label}>Start Time:</Text>
            <Text style={styles.sessiondetails}>{session?.startTime}</Text>
          </View>

          <View className='flex-row justify-between'>
            <Text style={styles.label}>End Time:</Text>
            <Text style={styles.sessiondetails}>{session?.endTime}</Text>
          </View>

          <View className='flex-row justify-between'>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.sessiondetails}>{session?.selectedCenter}</Text>
          </View>
        </View>

        <View style={styles.participantStats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{session.confirmedCount}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{session.rescheduledCount}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>
      </View>

      {!sessionStarted ? (
        <TouchableOpacity style={styles.startButton} onPress={() => setSessionStarted(true)}>
          <Text style={styles.buttonText}>Start Session</Text>
        </TouchableOpacity>
      ) : (
        <View>
          {/* Complete and End Session Buttons */}
          <View className='flex-row justify-around items-center '>
          <TouchableOpacity style={styles.completeButton} onPress={completeSession}>
            <Text  style={styles.buttonText}>Complete Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endButton} onPress={endSession}>
            <Text style={styles.buttonText}>End Session</Text>
          </TouchableOpacity>
          </View>

          {/* Participant List shown only when session is started and not completed */}
          {!sessionCompleted && (
            <FlatList
              data={session.participants}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.participantCard}>
                  <Text style={styles.participantName}>{item.name}</Text>
                  <Text>Status: {item.status}</Text>
                  {item.status === 'Scheduled' && (
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={() => updateParticipantStatus(item.id, 'Completed')}
                    >
                      <Text style={styles.buttonText}>Mark as Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sessionDetails: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#444',
  },
  sessiondetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1, // To bring the icon in front of other UI elements
  },
  sessionvaccineName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  participantStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    width: '45%',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  startButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  endButton: {
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  participantCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateButton: {
    marginTop: 10,
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
});

export default ScheduledVaccDetails;
