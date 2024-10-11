import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ListRenderItem, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router, useFocusEffect } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { db } from '../../../config/FireBaseConfig'; // Ensure the correct Firebase config path
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

// Function to generate the next 14 days including today
const getNextFourteenDays = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);

    const day = nextDay.toLocaleDateString('en-US', { weekday: 'short' });
    const date = nextDay.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    dates.push({ day, date });
  }

  return dates;
};

export default function ScheduleSessions() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(false);  // Loading state
  const [selectedDateDayOfMonth, setSelectedDateDayOfMonth] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // State for month
  const midwifeDocumentID = 'DZ3G0ZOnt8KzFRD3MI02'; // Midwife ID, adjust as needed

  // Generate the next 14 days on component mount
  const dates = getNextFourteenDays();

  // Set the default selected date to today (first item in the dates array)
  useEffect(() => {
    setSelectedDate(dates[0].date);
  }, []);

  // Fetch sessions from Firestore for the selected date and midwife
  const fetchSessions = async (date: string) => {
    setLoading(true); // Start loading
  
    try {
      // Reference the midwife's sessions collection
      const sessionsRef = collection(db, `Midwives/${midwifeDocumentID}/MidwifeSessions`);
  
      // Query sessions based on the selected date
      const q = query(sessionsRef, where('date', '==', date));
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
  
      setFilteredSessions(fetchedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false); // Stop loading once data is fetched
    }
  };
  

  // Fetch sessions when the selected date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSessions(selectedDate);
    }
  }, [selectedDate]);

  // Fetch sessions when the page comes into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedDate) {
        fetchSessions(selectedDate);
      }
    }, [selectedDate])
  );





  // Update the day of the month and month when selectedDate changes
  useEffect(() => {
    updateSelectedDateDayOfMonth(selectedDate);
    updateSelectedMonth(selectedDate);
  }, [selectedDate]);

  const updateSelectedDateDayOfMonth = (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const dayOfMonth = parsedDate.getDate().toString();
        setSelectedDateDayOfMonth(dayOfMonth);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  };

  const updateSelectedMonth = (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const monthName = parsedDate.toLocaleString('default', { month: 'long' });
        setSelectedMonth(monthName);
      }
    } catch (error) {
      console.error("Error getting month:", error);
    }
  };

  const timeToMinutes = (time: string): number => {
    const [timePart, modifier] = time.split(' '); // Split time and AM/PM
    const [hours, minutes] = timePart.split(':').map(Number); // Split hours and minutes
  
    let totalMinutes = (hours % 12) * 60 + minutes; // Convert hours and minutes to total minutes
    if (modifier === 'PM') {
      totalMinutes += 12 * 60; // Add 12 hours if PM
    }
  
    return totalMinutes;
  };


  // Function to handle session deletion with confirmation
  const deleteSession = (sessionId: string) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, `Midwives/${midwifeDocumentID}/MidwifeSessions`, sessionId));
              // After deletion, refetch the sessions to update the list
              Alert.alert('Success', 'Session deleted successfully');
              fetchSessions(selectedDate); // Make sure `selectedDate` is available in scope
            } catch (error) {
              console.error("Error deleting session:", error);
              Alert.alert('Error', 'Failed to delete the session');
            }
          },
          style: 'destructive', // Use the destructive style for delete buttons
        },
      ],
      { cancelable: true } // User can dismiss the alert by clicking outside it
    );
  };


  // Function to handle session editing (navigate to the edit screen)
  const editSession = (session: Session) => {
    router.navigate({
      pathname: '/appointments/editSessions',
      params: {
        sessionId: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        bookedSlots: session.bookedSlots,
        sessionType: session.sessionType,
        date: session.date,
        noOfSlots: session.noOfSlots,
      },
    });
  };
  

  // Define the render function for sessions
  const renderSession: ListRenderItem<Session> = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-4 border border-gray-300">
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
            <TouchableOpacity onPress={() => editSession(item)}>
              <Text className="text-white font-bold bg-blue-400 p-2 px-4 rounded-lg">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteSession(item.id)}>
              <Text className="text-white font-bold bg-red-500 p-2 rounded-lg">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  
  

  // Render each date button
  const renderDate = ({ item }: { item: { day: string; date: string } }) => {
    let dayOfMonth = item.date;

    try {
      const parsedDate = new Date(item.date);
      if (!isNaN(parsedDate.getTime())) {
        dayOfMonth = parsedDate.getDate().toString();
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }

    return (
      <TouchableOpacity
        className={`px-4 py-2 rounded-lg mx-2 h-16 items-center justify-center ${
          selectedDate === item.date ? 'bg-blue-300' : 'bg-white'
        }`}
        onPress={() => setSelectedDate(item.date)}
      >
        <Text className={`text-sm ${selectedDate === item.date ? 'text-black' : 'text-gray-500'}`}>
          {item.day}
        </Text>
        <Text className="text-lg font-bold">{dayOfMonth}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
      {/* Horizontal Date Picker */}
      <View className="mb-5">
        <View className="flex-row justify-between mb-3">
          <Text className="text-lg font-semibold">Date</Text>
          <View className="flex-row items-center">
            <Text className="text-lg">{selectedMonth}</Text>
            <AntDesign name="right" size={24} color="black" />
          </View>
        </View>
        <FlatList
          data={dates}
          horizontal
          renderItem={renderDate}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ justifyContent: 'space-between' }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* List of Sessions */}
      <View className="mt-5">
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-2xl font-bold text-gray-700">{selectedDateDayOfMonth}</Text>
          <Text className="text-lg font-medium text-gray-600">{selectedMonth}</Text>
        </View>

        {loading ? ( // Show loading indicator if data is being fetched
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={filteredSessions}
            renderItem={renderSession}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text className="text-center text-gray-500">No sessions available for this date</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add Session Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 bg-blue-400 w-12 h-12 rounded-full justify-center items-center shadow-lg"
        onPress={() =>
          router.navigate({
            pathname: '/appointments/createSessions',
            params: { selectedDate: selectedDate },  
          })
        }
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}
