import { Calendar, DateObject } from 'react-native-calendars'; // Import DateObject type
import moment from 'moment'; // For date handling
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, ListRenderItem } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { db } from '@/config/FireBaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Utility function to convert timeSlot (12-hour format) to total minutes
const timeToMinutes = (time: string): number => {
  const [timePart, modifier] = time.split(' '); // Split time and AM/PM
  const [hours, minutes] = timePart.split(':').map(Number); // Split hours and minutes

  let totalMinutes = (hours % 12) * 60 + minutes; // Convert hours and minutes to total minutes
  if (modifier === 'PM') {
    totalMinutes += 12 * 60; // Add 12 hours if PM
  }

  return totalMinutes;
};

interface Appointment {
  id: string;
  child: string;
  date: string;
  timeSlot: string;
  location: string;
  sessionType: string;
  status: string;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<string>(''); // State for selected day
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]); // New state for past appointments
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]); // State for filtered appointments based on selected date
  const [loading, setLoading] = useState<boolean>(false);
  const midwifeDocumentID = 'DZ3G0ZOnt8KzFRD3MI02'; // Midwife ID

  // Today's date in YYYY-MM-DD format
  const today = moment().format('YYYY-MM-DD');

  // Set the default selected date to today
  useEffect(() => {
    setSelectedDate(today); // Set the selected date to today
    fetchPastAppointments(); // Fetch appointments on component mount
  }, []);

  const onDayPress = (day: DateObject) => {
    setSelectedDate(day.dateString); // Store the selected date in state
    filterAppointmentsByDate(day.dateString); // Filter appointments based on the selected date
  };

  // Fetch past appointments from Firestore
  const fetchPastAppointments = async () => {
    setLoading(true); // Start loading
    try {
      const appointmentsRef = collection(db, 'MidwifeAppointments');
      const q = query(
        appointmentsRef,
        where('midwifeId', '==', midwifeDocumentID),
        where('status', 'in', ['Completed', 'Cancelled']) // Fetch only "Completed" or "Cancelled" appointments
      );
      const querySnapshot = await getDocs(q);
      const fetchedAppointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // Sort appointments by timeSlot in ascending order
      const sortedAppointments = fetchedAppointments.sort((a, b) => {
        const timeA = timeToMinutes(a.timeSlot);
        const timeB = timeToMinutes(b.timeSlot);
        return timeA - timeB; // Ascending order
      });

      setPastAppointments(sortedAppointments); // Set sorted appointments
      filterAppointmentsByDate(today); // Immediately filter appointments for today's date
    } catch (error) {
      console.error('Error fetching past appointments:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Filter appointments by the selected date
  const filterAppointmentsByDate = (date: string) => {
    const filtered = pastAppointments.filter((appointment) => appointment.date === date);
    setFilteredAppointments(filtered); // Set the filtered appointments
  };

  // Render appointment item
  const renderAppointment: ListRenderItem<Appointment> = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-4 border border-gray-300">
      <View className="flex-row justify-between">
        <View>
          <Text className="text-lg mb-2">{item.timeSlot}</Text>
          <Text className="text-lg mb-2">{item.location} ({item.sessionType})</Text>
          <Text className="text-lg mb-2">Status: {item.status}</Text>
        </View>
        <View className="m-2 mx-5 items-center">
          {/* Conditionally render the icon based on sessionType */}
          {item.sessionType === 'Home Visit' ? (
            <FontAwesome5 name="briefcase-medical" size={24} color="black" />
          ) : item.sessionType === 'Clinic' ? (
            <FontAwesome5 name="clinic-medical" size={24} color="black" />
          ) : (
            <Text>{item.sessionType}</Text> // Default fallback if other session types exist
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-5">
      {/* Calendar at the top */}
      <Calendar
        onDayPress={onDayPress} // Handle day press
        markedDates={{
          [selectedDate]: {
            selected: true,
            marked: true,
            selectedColor: '#3B82F6', // Tailwind 'blue-500' hex color code
          },
        }}
        maxDate={today} // Disable all future dates
      />

      <View className="flex-1 p-4 bg-gray-100">
        {/* List of Past Appointments */}
        <View className="mt-5">
          <View className="flex-row items-center gap-2 mb-4">
            <FontAwesome5 name="history" size={20} color="black" />
            <Text className="text-xl font-bold">Appointments on {selectedDate}</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={filteredAppointments}
              renderItem={renderAppointment}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text>No appointments found on this date.</Text>}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default Index;
