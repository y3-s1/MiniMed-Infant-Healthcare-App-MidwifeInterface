import { View, Text, TouchableOpacity, ListRenderItem, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import moment from 'moment';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from 'expo-router';

// Define the type for the session data
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

const index = () => {
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(false);  // Loading state
  const midwifeDocumentID = 'DZ3G0ZOnt8KzFRD3MI02'; // Midwife ID, adjust as needed

  useEffect(() => {
    fetchSessions();
  }, []);

  // Today's date in YYYY-MM-DD format
  const today = moment().format('YYYY-MM-DD');

  const timeToMinutes = (time: string): number => {
    const [timePart, modifier] = time.split(' '); // Split time and AM/PM
    const [hours, minutes] = timePart.split(':').map(Number); // Split hours and minutes
  
    let totalMinutes = (hours % 12) * 60 + minutes; // Convert hours and minutes to total minutes
    if (modifier === 'PM') {
      totalMinutes += 12 * 60; // Add 12 hours if PM
    }
  
    return totalMinutes;
  };



  const startSession = (session: Session) => {
    // Implement the logic to start the session, e.g., navigate to the session details screen
    console.log("Starting session:", session);
    // Example implementation: navigateToSessionDetailsScreen(session);
  };


  const fetchSessions = async () => {
    setLoading(true); // Start loading
  
    try {
      // Reference the midwife's sessions collection
      const sessionsRef = collection(db, `Midwives/${midwifeDocumentID}/MidwifeSessions`);
  
      // Query sessions based on the selected date
      const q = query(sessionsRef, where('date', '==', today));
      const querySnapshot = await getDocs(q);
  
      let fetchedSessions: Session[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Session[];
  
      // Sort the sessions by startTime in ascending order
      fetchedSessions = fetchedSessions.sort((a, b) => {
        const startMinutesA = timeToMinutes(a.startTime);
        const startMinutesB = timeToMinutes(b.startTime);
        return startMinutesA - startMinutesB;
      });
  
      console.log("Fetched and sorted sessions:", fetchedSessions);
  
      setTodaySessions(fetchedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false); // Stop loading once data is fetched
    }
  };



  // Define the render function for sessions
  const renderSession: ListRenderItem<Session> = ({ item, index }) => (
    <TouchableOpacity
      onPress={() =>
        router.navigate({
          pathname: '/appointments/singleSession',
          params: { 
            sessionId: item.id,
            startTime: item.startTime,
            endTime: item.endTime,
            location: item.location,
            bookedSlots: item.bookedSlots,
            sessionType: item.sessionType, 
            date: item.date,
            noOfSlots: item.noOfSlots,
            index: index + 1,
          },  
        })
      }
    >
      <View className="bg-white p-4 rounded-lg mb-4 border border-gray-300">
        <Text className="text-xl font-bold mb-2">Session {index + 1}</Text>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-lg mb-2">{item.startTime} - {item.endTime}</Text>
            {/* Conditionally append "clinic" or "area" to the location based on sessionType */}
            <Text className="text-lg mb-2">
              {item.location} {item.sessionType === 'Clinic' ? 'Clinic' : item.sessionType === 'Home Visit' ? 'Area Home Visit' : ''}
            </Text>
            {/* Count the number of booked slots using item.bookedSlots.length */}
            <Text className="text-lg mb-2">Booked Slots: {item.bookedSlots.length} / {item.noOfSlots}</Text>
          </View>
          <View className="flex justify-between">
            <View className="m-2 mx-5 items-end">
              {/* Conditionally render the icon based on sessionType */}
              {item.sessionType === 'Home Visit' ? (
                <FontAwesome5 name="briefcase-medical" size={24} color="black" />
              ) : item.sessionType === 'Clinic' ? (
                <FontAwesome5 name="clinic-medical" size={24} color="black" />
              ) : (
                <Text>{item.sessionType}</Text>  // Default fallback if other session types exist
              )}
            </View>
            <View className="flex-row justify-between m-2 mx-5 gap-5">
              <TouchableOpacity 
                onPress={() =>
                  router.navigate({
                    pathname: '/appointments/singleSession',
                    params: { 
                      sessionId: item.id,
                      startTime: item.startTime,
                      endTime: item.endTime,
                      location: item.location,
                      bookedSlots: item.bookedSlots,
                      sessionType: item.sessionType, 
                      date: item.date,
                      noOfSlots: item.noOfSlots,
                      index: index + 1,
                    },  
                  })
                }
              >
                <Text className="text-white font-bold bg-blue-400 p-2 px-4 rounded-lg">Start Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );




  return (
    <View className='m-5'>
      {loading ? ( // Show loading indicator if data is being fetched
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={todaySessions}
            renderItem={renderSession}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text className="text-center text-gray-500">No sessions available for Today</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
    </View>
  )
}

export default index