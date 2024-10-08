import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';

// Define the type for the session data
interface Session {
  id: string;
  time: string;
  location: string;
  bookedSlots: string;
  date: string; // Add a date field to the session
}

// Sample sessions data with date fields
const sessionsData: Session[] = [
  { id: '1', time: '10:00 AM to 01:00 PM', location: 'Kaduwela Clinic', bookedSlots: '3/10', date: '2024-10-08' },
  { id: '2', time: '03:00 PM to 03:30 PM', location: 'Malabe Clinic', bookedSlots: '2/5', date: '2024-10-09' },
  { id: '3', time: '12:00 PM to 01:00 PM', location: 'Nugegoda Clinic', bookedSlots: '1/5', date: '2024-10-10' },
  { id: '4', time: '09:00 AM to 11:00 AM', location: 'Kaduwela Clinic', bookedSlots: '5/10', date: '2024-10-08' },
  { id: '5', time: '02:00 PM to 04:00 PM', location: 'Malabe Clinic', bookedSlots: '3/8', date: '2024-10-11' },
  { id: '6', time: '10:00 AM to 01:00 PM', location: 'Kaduwela Clinic', bookedSlots: '3/10', date: '2024-10-08' },
  { id: '7', time: '03:00 PM to 03:30 PM', location: 'Malabe Clinic', bookedSlots: '2/5', date: '2024-10-09' },
  { id: '8', time: '12:00 PM to 01:00 PM', location: 'Nugegoda Clinic', bookedSlots: '1/5', date: '2024-10-10' },
  { id: '9', time: '09:00 AM to 11:00 AM', location: 'Kaduwela Clinic', bookedSlots: '5/10', date: '2024-10-08' },
  { id: '10', time: '02:00 PM to 04:00 PM', location: 'Malabe Clinic', bookedSlots: '3/8', date: '2024-10-11' },
  { id: '11', time: '10:00 AM to 01:00 PM', location: 'Kaduwela Clinic', bookedSlots: '3/10', date: '2024-10-08' },
  { id: '12', time: '03:00 PM to 03:30 PM', location: 'Malabe Clinic', bookedSlots: '2/5', date: '2024-10-09' },
  { id: '13', time: '12:00 PM to 01:00 PM', location: 'Nugegoda Clinic', bookedSlots: '1/5', date: '2024-10-10' },
  { id: '14', time: '09:00 AM to 11:00 AM', location: 'Kaduwela Clinic', bookedSlots: '5/10', date: '2024-10-08' },
  { id: '15', time: '02:00 PM to 04:00 PM', location: 'Malabe Clinic', bookedSlots: '3/8', date: '2024-10-11' },
];

// Function to generate the next 5 days including today
const getNextFiveDays = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 5; i++) {
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
  const [selectedDateDayOfMonth, setSelectedDateDayOfMonth] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // State for month

  // Generate the next 5 days on component mount
  const dates = getNextFiveDays();

  // Set the default selected date to today (first item in the dates array)
  useEffect(() => {
    setSelectedDate(dates[0].date);
  }, []);

  // Update filtered sessions when selectedDate changes
  useEffect(() => {
    const filtered = sessionsData.filter(session => session.date === selectedDate);
    setFilteredSessions(filtered);
  }, [selectedDate]);


  useEffect(() => {
    updateSelectedDateDayOfMonth(selectedDate);
    updateSelectedMonth(selectedDate);
  }, [selectedDate]);
  


  const updateSelectedDateDayOfMonth = (date: string) => {
    try {
      // Use the ISO string format (YYYY-MM-DD) to ensure correct parsing
      const parsedDate = new Date(date);
      
      if (!isNaN(parsedDate.getTime())) {
        const dayOfMonth = parsedDate.getDate().toString(); // Extract day as a string
        setSelectedDateDayOfMonth(dayOfMonth); // Update the state
      } else {
        // console.warn("Invalid date format:", date);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  };

  // Function to get the month name from the selected date
  const updateSelectedMonth = (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const monthName = parsedDate.toLocaleString('default', { month: 'long' }); // Get month name (e.g., "October")
        setSelectedMonth(monthName);
      } else {
        // Handle invalid date case if necessary
      }
    } catch (error) {
      console.error("Error getting month:", error);
    }
  };
  
  


  // Define the render function for sessions
  const renderSession: ListRenderItem<Session> = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-4 border border-gray-300">
      <Text className="text-lg mb-2">{item.time}</Text>
      <Text className="text-lg mb-2">{item.location}</Text>
      <Text className="text-lg mb-2">Booked Slots: {item.bookedSlots}</Text>
      <View className="flex-row justify-between">
        <TouchableOpacity>
          <Text className="text-blue-500 font-bold">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-red-400 font-bold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render each date button
  const renderDate = ({ item }: { item: { day: string; date: string } }) => {
    let dayOfMonth = item.date;
  
    try {
      // Try to parse the date and extract the day part if it's a valid date string
      const parsedDate = new Date(item.date);
      
      // Check if the parsed date is valid
      if (!isNaN(parsedDate.getTime())) {
        dayOfMonth = parsedDate.getDate().toString();
      } else {
        console.warn("Invalid date format:", item.date);
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
        <Text className={`text-sm ${
          selectedDate === item.date ? 'text-black' : 'text-gray-500'
        }`}>{item.day}</Text>
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
            <Text className="text-lg">October</Text>
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
      <View className='mt-5'>
      <View className="flex-row items-center gap-2 mb-4">
        <Text className="text-2xl font-bold text-gray-700">
          {selectedDateDayOfMonth}
        </Text>
        <Text className="text-lg font-medium text-gray-600">October</Text>
      </View>

      <FlatList
        data={filteredSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text className="text-center text-gray-500">No sessions available for this date</Text>}
        showsVerticalScrollIndicator={false}
      />
      </View>

      {/* Add Session Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 bg-blue-400 w-12 h-12 rounded-full justify-center items-center shadow-lg"
        onPress={() =>
          router.navigate({
            pathname: '/appointments/createSessions',
            params: { selectedDate: selectedDate},  
          })
        }
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}
