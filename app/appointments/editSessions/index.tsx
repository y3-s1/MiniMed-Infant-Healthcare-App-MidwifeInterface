import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/FireBaseConfig'; // Ensure the correct Firebase config path

interface Session {
  id: string;
  startTime: string;
  endTime: string;
  location: string;
  bookedSlots: string[];
  sessionType: string;
  date: string;
  noOfSlots: number;
}

const areas = ['Malabe', 'Gampaha', 'Kaduwela', 'Biyagama', 'Kelaniya', 'Baththaramulla', 'Rajagiriya'];
const clinics = ['Kaduwela', 'Malabe', 'Nugegoda', 'Biyagama', 'Rajagiriya', 'Kelaniya'];

// Manually setting the midwife document ID (replace with dynamic ID once login is implemented)
const midwifeDocumentID = 'DZ3G0ZOnt8KzFRD3MI02';

export default function EditSessions() {
  const route = useRoute();
  const navigation = useNavigation();
  const { sessionId } = route.params as { sessionId: string };

  const [loading, setLoading] = useState<boolean>(true);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('Home Visit');
  const [noOfSlots, setNoOfSlots] = useState<number>(0);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      setLoading(true);
      try {
        const sessionRef = doc(db, `Midwives/${midwifeDocumentID}/MidwifeSessions`, sessionId);
        const docSnapshot = await getDoc(sessionRef);

        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as Session;
          setSessionData(data);
          setStartTime(data.startTime);
          setEndTime(data.endTime);
          setLocation(data.location);
          setSessionType(data.sessionType);
          setNoOfSlots(data.noOfSlots);
        } else {
          Alert.alert('Error', 'Session not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        Alert.alert('Error', 'Failed to fetch session details');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const handleSaveChanges = async () => {
    if (!startTime || !endTime || !location || !sessionType || noOfSlots <= 0) {
      Alert.alert('Error', 'Please fill in all fields correctly');
      return;
    }

    setLoading(true);
    try {
      const sessionRef = doc(db, `Midwives/${midwifeDocumentID}/MidwifeSessions`, sessionId); // Adjust the midwife ID if needed
      await updateDoc(sessionRef, {
        startTime,
        endTime,
        location,
        sessionType,
        noOfSlots,
      });

      Alert.alert('Success', 'Session updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating session:', error);
      Alert.alert('Error', 'Failed to update session');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Location Selector component to handle areas or clinics based on session type
  const LocationSelector = ({ locations }: { locations: string[] }) => {
    return (
      <FlatList
        data={locations}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setLocation(item)}>
            <Text className={`p-2 ${location === item ? 'bg-blue-300 text-white' : ''}`}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-2">Edit Session</Text>
      

      {/* Session Type Selector */}
      <View className="bg-blue-400 my-2 mx-8 mt-10 flex mb-5 justify-center rounded-lg">
        <Text className="ml-3 mt-3 text-lg font-semibold text-white">Type</Text>
        <View className="flex-row justify-center mb-5 mt-1 bg-blue-300 w-3/6 mx-auto rounded-full">
          <TouchableOpacity
            onPress={() => setSessionType('Home Visit')}
            className={`px-6 py-2 rounded-full ${sessionType === 'Home Visit' ? 'bg-white' : 'bg-blue-300'}`}
          >
            <Text className={`${sessionType === 'Home Visit' ? 'text-blue-500' : 'text-white'} font-poppins`}>
              Home Visit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSessionType('Clinic')}
            className={`mx-4 px-6 py-2 rounded-full ${sessionType === 'Clinic' ? 'bg-white' : 'bg-blue-300'}`}
          >
            <Text className={`${sessionType === 'Clinic' ? 'text-blue-500' : 'text-white'} font-poppins`}>
              Clinic
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Selector */}
      <Text className="text-lg my-2">{sessionType === 'Home Visit' ? 'Select Area' : 'Select Clinic'}</Text>
      {sessionType === 'Home Visit' ? <LocationSelector locations={areas} /> : <LocationSelector locations={clinics} />}

      {/* Save Changes Button */}
      <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mt-3 items-center mb-5" onPress={handleSaveChanges}>
        <Text className="text-white text-lg">Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}
