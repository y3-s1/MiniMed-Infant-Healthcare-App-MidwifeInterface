import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ListRenderItem, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { db } from '@/config/FireBaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

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

export default function UpcomingAppointments() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDateDayOfMonth, setSelectedDateDayOfMonth] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const midwifeDocumentID = 'DZ3G0ZOnt8KzFRD3MI02'; // Midwife ID

  // Generate the next 14 days on component mount
  const dates = getNextFourteenDays();

  // Set the default selected date to today
  useEffect(() => {
    setSelectedDate(dates[0].date);
  }, []);

  // Fetch appointments from Firestore based on selected date and midwife
  const fetchAppointments = async (date: string) => {
    setLoading(true); // Start loading
    try {
      const appointmentsRef = collection(db, 'MidwifeAppointments');
      const q = query(
        appointmentsRef,
        where('midwifeId', '==', midwifeDocumentID),
        where('date', '==', date),
        where('status', '==', 'Scheduled') // Fetch only "Scheduled" appointments
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

      setAppointments(sortedAppointments); // Set sorted appointments
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch appointments when the selected date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate]);

  // Fetch appointments when the page comes into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedDate) {
        fetchAppointments(selectedDate);
      }
    }, [selectedDate])
  );

  // Update day of the month and month when selectedDate changes
  useEffect(() => {
    updateSelectedDateDayOfMonth(selectedDate);
    updateSelectedMonth(selectedDate);
  }, [selectedDate]);

  const updateSelectedDateDayOfMonth = (date: string) => {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      setSelectedDateDayOfMonth(parsedDate.getDate().toString());
    }
  };

  const updateSelectedMonth = (date: string) => {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      const monthName = parsedDate.toLocaleString('default', { month: 'long' });
      setSelectedMonth(monthName);
    }
  };

  // Cancel appointment by updating Firestore status to "Cancelled"
  const cancelAppointment = async (appointmentId: string) => {
    try {
      const appointmentDoc = doc(db, 'MidwifeAppointments', appointmentId);
      await updateDoc(appointmentDoc, { status: 'Cancelled' });

      // Fetch appointments again after cancellation
      Alert.alert('Success', 'Appointment cancelled successfully!');
      fetchAppointments(selectedDate);
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
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
        <View className="flex justify-between">
          <View className="m-2 mx-5 items-center">
            {/* Conditionally render the icon based on sessionType */}
            {item.sessionType === 'Home Visit' ? (
              <FontAwesome5 name="briefcase-medical" size={24} color="black" />
            ) : item.sessionType === 'Clinic' ? (
              <FontAwesome5 name="clinic-medical" size={24} color="black" />
            ) : (
              <Text>{item.sessionType}</Text>  // Default fallback if other session types exist
            )}
          </View>
          <View className="m-2 mx-5 items-center">
            <TouchableOpacity onPress={() => cancelAppointment(item.id)}>
              <Text className="text-white font-bold bg-blue-400 p-2 rounded-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Render each date button
  const renderDate = ({ item }: { item: { day: string; date: string } }) => {
    const dayOfMonth = new Date(item.date).getDate().toString();
    return (
      <TouchableOpacity
        className={`px-4 py-2 rounded-lg mx-2 h-16 items-center justify-center ${
          selectedDate === item.date ? 'bg-blue-300' : 'bg-white'
        }`}
        onPress={() => setSelectedDate(item.date)}
      >
        <Text className={`text-sm ${selectedDate === item.date ? 'text-black' : 'text-gray-500'}`}>{item.day}</Text>
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
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* List of Appointments */}
      <View className="mt-5">
        <View className="flex-row items-center gap-2 mb-4">
          <FontAwesome5 name="calendar" size={20} color="black" />
          <Text className="text-xl font-bold">Upcoming Appointments</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={appointments}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text>No appointments found for this date.</Text>}
          />
        )}
      </View>
    </View>
  );
}
