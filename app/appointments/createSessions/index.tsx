import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, VirtualizedList, StyleSheet, Alert } from 'react-native';
import { addDoc, collection, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';

const areas = [
  'Malabe', 'Gampaha', 'Kaduwela', 'Biyagama', 'Kelaniya', 'Baththaramulla', 'Rajagiriya',
];

const clinics = [
  'Kaduwela', 'Malabe', 'Nugegoda', 'Biyagama', 'Rajagiriya', 'Kelaniya',
];

// Manually setting the midwife document ID (replace with dynamic ID once login is implemented)
const midwifeDocumentID = 'DZ3G0ZOnt8KzFRD3MI02';

export default function CreateSession() {
  const { selectedDate } = useLocalSearchParams();
  const [selectedDateDayOfMonth, setSelectedDateDayOfMonth] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [sessionType, setSessionType] = useState('Home Visit');
  const [selectedLocation, setSelectedLocation] = useState('Malabe');
  const [startTime, setStartTime] = useState('7:00 AM');
  const [endTime, setEndTime] = useState('7:30 AM');
  const [noOfSlots, setNoOfSlots] = useState(0);
  const [sessionsForSelectedDate, setSessionsForSelectedDate] = useState<any[]>([]);

  useEffect(() => {
    if (typeof selectedDate === 'string') {
      updateSelectedDateDayOfMonth(selectedDate);
      updateSelectedMonth(selectedDate);
    } else if (Array.isArray(selectedDate) && selectedDate.length > 0) {
      updateSelectedDateDayOfMonth(selectedDate[0]);
      updateSelectedMonth(selectedDate[0]);
    }
  }, [selectedDate]);

  const updateSelectedDateDayOfMonth = (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const dayOfMonth = parsedDate.getDate().toString();
        setSelectedDateDayOfMonth(dayOfMonth);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
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
      console.error('Error getting month:', error);
    }
  };

  // Generate time slots between 7:00 AM and 5:00 PM in 30-minute intervals
  const generateTimeSlots = () => {
    const times = [];
    const start = 7 * 60; // 7:00 AM in minutes
    const end = 17 * 60; // 5:00 PM in minutes

    for (let i = start; i <= end; i += 30) {
      const hours = Math.floor(i / 60);
      const minutes = i % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      times.push(`${formattedHours}:${formattedMinutes} ${period}`);
    }

    return times;
  };

  const timeSlots = generateTimeSlots();


  // Helper function to convert time to minutes
  const timeToMinutes = (time: string) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
    let totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

    if (period.toUpperCase() === 'PM' && hours !== '12') {
      totalMinutes += 12 * 60; // Convert PM hours to 24-hour format
    } else if (period.toUpperCase() === 'AM' && hours === '12') {
      totalMinutes -= 12 * 60; // Handle 12 AM case
    }

    return totalMinutes;
  };

  // Calculate the number of slots (30 minutes each) between startTime and endTime
  const calculateNoOfSlots = () => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const slotDuration = 30;

    const differenceInMinutes = endMinutes - startMinutes;
    const slots = Math.max(Math.floor(differenceInMinutes / slotDuration), 0);
    setNoOfSlots(slots);
  };

  useEffect(() => {
    calculateNoOfSlots();
  }, [startTime, endTime]);



  // Fetch sessions for the selected date from Firestore
  const fetchSessionsForSelectedDate = async () => {
    try {
      const midwifeDocRef = doc(db, 'Midwives', midwifeDocumentID);
      const sessionsCollectionRef = collection(midwifeDocRef, 'MidwifeSessions');
      const q = query(sessionsCollectionRef, where('date', '==', selectedDate));
      const querySnapshot = await getDocs(q);

      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSessionsForSelectedDate(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSessionsForSelectedDate();
    }
  }, [selectedDate]);



  // Check if the selected time range conflicts with existing sessions
  const checkForConflicts = (newStartTime: string, newEndTime: string) => {
    const newStartMinutes = timeToMinutes(newStartTime);
    const newEndMinutes = timeToMinutes(newEndTime);

    for (const session of sessionsForSelectedDate) {
      const sessionStartMinutes = timeToMinutes(session.startTime);
      const sessionEndMinutes = timeToMinutes(session.endTime);

      // Check if new session overlaps with any existing session
      if (
        (newStartMinutes < sessionEndMinutes && newStartMinutes >= sessionStartMinutes) ||
        (newEndMinutes > sessionStartMinutes && newEndMinutes <= sessionEndMinutes) ||
        (newStartMinutes <= sessionStartMinutes && newEndMinutes >= sessionEndMinutes)
      ) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  };





  const getItem = (_data: unknown, index: number) => ({
    id: timeSlots[index],
    title: timeSlots[index],
  });

  const getItemCount = (_data: unknown) => timeSlots.length;

  const TimeSelector = ({ selectedTime, setTime }: { selectedTime: string; setTime: (time: string) => void }) => (
    <SafeAreaView style={styles.timeSelectorContainer}>
      <VirtualizedList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={null}
        initialNumToRender={4}
        getItem={getItem}
        getItemCount={getItemCount}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.timeSlot, selectedTime === item.title ? styles.selectedTimeSlot : null]}
            onPress={() => setTime(item.title)}
          >
            <Text style={selectedTime === item.title ? styles.selectedText : styles.timeText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );

   // Handle location selection for areas or clinics based on session type
  const LocationSelector = ({ locations }: { locations: string[] }) => {
    const getItem = (_data: unknown, index: number) => ({
      id: locations[index],
      title:locations[index],
    });

    const getItemCount = (_data: unknown) => locations.length;

    return (
      <SafeAreaView style={styles.locationSelectorContainer}>
        <VirtualizedList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={null}
          initialNumToRender={4}
          getItem={getItem}
          getItemCount={getItemCount}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.locationSlot, selectedLocation === item.title ? styles.selectedLocationSlot : null]}
              onPress={() => setSelectedLocation(item.title)}
            >
              <Text style={selectedLocation === item.title ? styles.selectedText : styles.locationText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  };

  // Function to save the session data to Firestore under the midwife's sub-collection
  const createSession = async () => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    // Validate that the start time is before the end time
    if (startMinutes >= endMinutes) {
      Alert.alert('Error', 'Start time must be earlier than end time.');
      return; // Exit early if the validation fails
    }
    const conflict = checkForConflicts(startTime, endTime);
      if (conflict) {
        Alert.alert('Error', 'Selected time conflicts with another session.');
      }else{
        try {
          const midwifeDocRef = doc(db, 'Midwives', midwifeDocumentID);
          const sessionsCollectionRef = collection(midwifeDocRef, 'MidwifeSessions');
    
          await addDoc(sessionsCollectionRef, {
            date:selectedDate,
            startTime,
            endTime,
            sessionType,
            location:selectedLocation,
            noOfSlots,
            bookedSlots:[],
          });
          Alert.alert('Success', 'Session created successfully!');
          router.navigate({
            pathname: '/appointments/sheduleSessions',
        });
        } catch (error) {
          console.error('Error creating session:', error);
          Alert.alert('Error', 'Failed to create session.');
        }
      }
  };

  return (
    <View className="flex-1 p-4">
      {/* Date Section */}
      <View className="flex-row items-center gap-2 mb-4">
        <Text className="text-2xl font-bold text-gray-700">{selectedDateDayOfMonth}</Text>
        <Text className="text-lg font-medium text-gray-600">{selectedMonth}</Text>
      </View>

      {/* Start Time */}
      <Text className="text-lg my-2">Start Time</Text>
      <TimeSelector selectedTime={startTime} setTime={setStartTime} />

      {/* End Time */}
      <Text className="text-lg my-2">End Time</Text>
      <TimeSelector selectedTime={endTime} setTime={setEndTime} />

      {/* Session Type Toggle */}
      <View className="bg-blue-400 my-2 mx-8 mt-10 flex mb-5 justify-center rounded-lg">
        <Text className='ml-3 mt-3 text-lg font-semibold text-white'>Type</Text>
        <View className="flex-row justify-center mb-5 mt-1 bg-blue-300 w-3/6 mx-auto rounded-full">
          <TouchableOpacity
            onPress={() => setSessionType('Home Visit')}
            className={`px-6 py-2 rounded-full ${
              sessionType === 'Home Visit' ? 'bg-white' : 'bg-blue-300'
            }`}
          >
            <Text className={`${sessionType === 'Home Visit' ? 'text-blue-500' : 'text-white'} font-poppins`}>
              Home Visit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSessionType('Clinic')}
            className={`mx-4 px-6 py-2 rounded-full ${
              sessionType === 'Clinic' ? 'bg-white' : 'bg-blue-300'
            }`}
          >
            <Text className={`${sessionType === 'Clinic' ? 'text-blue-500' : 'text-white'} font-poppins`}>
              Clinic
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Selection (Areas or Clinics) */}
      <Text className="text-lg my-2">{sessionType === 'Home Visit' ? 'Select Area' : 'Select Clinic'}</Text>
      {sessionType === 'Home Visit' ? <LocationSelector locations={areas} /> : <LocationSelector locations={clinics} />}

      {/* Create Session Button */}
      <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mt-3 items-center mb-5" onPress={createSession}>
        <Text className="text-white text-lg">Create Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  timeSelectorContainer: {
    paddingVertical: 10,
  },
  timeSlot: {
    backgroundColor: '#ffffff',
    height: 60,
    width: 100,
    justifyContent: 'center',
    marginHorizontal: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedTimeSlot: {
    backgroundColor: '#2196F3',
  },
  timeText: {
    fontSize: 18,
    color: 'black',
  },
  selectedText: {
    fontSize: 18,
    color: 'white',
  },
  locationSelectorContainer: {
    flex: 1,
  },
  locationSlot: {
    backgroundColor: '#ffffff',
    height: 60,
    width: 120,
    justifyContent: 'center',
    marginHorizontal: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedLocationSlot: {
    backgroundColor: '#2196F3',
  },
  locationText: {
    fontSize: 16,
    color: 'black',
  },
});
