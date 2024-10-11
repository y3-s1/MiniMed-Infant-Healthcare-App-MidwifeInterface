import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
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

export default function EditSessions() {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { sessionId } = route.params as { sessionId: string };

  const [loading, setLoading] = useState<boolean>(true);
  const [sessionData, setSessionData] = useState<Session | null>(null);

  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('');
  const [noOfSlots, setNoOfSlots] = useState<number>(0);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      setLoading(true);
      try {
        const sessionRef = doc(db, `Midwives/DZ3G0ZOnt8KzFRD3MI02/MidwifeSessions`, sessionId); // Adjust the midwife ID if needed
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
      const sessionRef = doc(db, `Midwives/DZ3G0ZOnt8KzFRD3MI02/MidwifeSessions`, sessionId); // Adjust the midwife ID if needed
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

  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-2">Edit Session</Text>
      <View className="mb-4">
        <Text className="text-base font-semibold mb-1">Start Time:</Text>
        <TextInput
          value={startTime}
          onChangeText={setStartTime}
          className="border border-gray-300 p-2 rounded"
          placeholder="Enter start time (e.g., 4:00 PM)"
        />
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold mb-1">End Time:</Text>
        <TextInput
          value={endTime}
          onChangeText={setEndTime}
          className="border border-gray-300 p-2 rounded"
          placeholder="Enter end time (e.g., 5:00 PM)"
        />
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold mb-1">Location:</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          className="border border-gray-300 p-2 rounded"
          placeholder="Enter location"
        />
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold mb-1">Session Type:</Text>
        <TextInput
          value={sessionType}
          onChangeText={setSessionType}
          className="border border-gray-300 p-2 rounded"
          placeholder="Enter session type (Clinic or Home Visit)"
        />
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold mb-1">Number of Slots:</Text>
        <TextInput
          value={noOfSlots.toString()}
          onChangeText={(value) => setNoOfSlots(parseInt(value))}
          keyboardType="numeric"
          className="border border-gray-300 p-2 rounded"
          placeholder="Enter number of slots"
        />
      </View>

      <Button title="Save Changes" onPress={handleSaveChanges} />
    </View>
  );
}
