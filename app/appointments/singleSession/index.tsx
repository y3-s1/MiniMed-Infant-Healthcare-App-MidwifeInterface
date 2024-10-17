import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import openMap from 'react-native-open-maps'; // Import openMap function

const Index = () => {
  const { sessionId, startTime, endTime, location, bookedSlots, sessionType, date, noOfSlots, index } = useLocalSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [sessionStarted, setSessionStarted] = useState(false); // Track if session has started
  const midwifeDocumentID = 'DZ3G0ZOnt8KzFRD3MI02'; // Midwife ID, adjust as needed

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const appointmentsRef = collection(db, 'MidwifeAppointments');

      // Helper to convert time to total minutes for easier comparison
      const timeToMinutes = (time: string): number => {
        const [timePart, modifier] = time.split(' ');
        const [hours, minutes] = timePart.split(':').map(Number);
        let totalMinutes = (hours % 12) * 60 + minutes;
        if (modifier === 'PM') totalMinutes += 12 * 60;
        return totalMinutes;
      };

      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      // Query to fetch the relevant appointments
      const q = query(
        appointmentsRef,
        where('midwifeId', '==', midwifeDocumentID),
        where('sessionType', '==', sessionType),
        where('location', '==', location)
      );

      const querySnapshot = await getDocs(q);

      // Filter appointments based on timeSlot being within the start and end time
      const filteredAppointments = querySnapshot.docs.filter((doc) => {
        const data = doc.data();
        const appointmentTimeMinutes = timeToMinutes(data.timeSlot);
        return appointmentTimeMinutes >= startMinutes && appointmentTimeMinutes <= endMinutes;
      });

      // Map the filtered appointments to extract data
      const fetchedAppointments = filteredAppointments.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error fetching appointments: ', error);
    }
  };

  const startSession = () => {
    Alert.alert('Success', 'Session Started successfully!');
    setSessionStarted(true); // Set session to started
  };

  const endSession = () => {
    Alert.alert('Success', 'Session Completed successfully!');
    setSessionStarted(false); // Set session to ended
    router.navigate({
      pathname: '/appointments/todaySessions',
    });
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const appointmentRef = doc(db, 'MidwifeAppointments', appointmentId);
      await updateDoc(appointmentRef, { status: newStatus });

      // Update the local state to reflect the change
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status: newStatus } : appointment
        )
      );
    } catch (error) {
      console.error('Error updating appointment status: ', error);
    }
  };

  const completeAppointment = (appointmentId) => {
    Alert.alert('Success', 'Appointment Completed successfully!');
    updateAppointmentStatus(appointmentId, 'Completed');
  };

  const cancelAppointment = (appointmentId) => {
    Alert.alert('Success', 'Appointment Cancelled successfully!');
    updateAppointmentStatus(appointmentId, 'Cancelled');
  };

  // Function to navigate to the appointment's location
  const navigateToLocation = (locationCode) => {
    openMap({ query: locationCode });
  };

  return (
    <ScrollView className="bg-gray-100 p-5">
      {/* Container for the session details */}
      <View className="bg-gray-100 p-5 rounded-lg shadow-md mb-5">
        <Text className="text-2xl font-semibold text-gray-800 mb-4">Session {index}</Text>

        {/* Start Time */}
        <View className="flex-row">
          <Text className="text-lg text-gray-900 font-semibold">{startTime}</Text>
          <Text className="text-lg text-gray-900">  to  </Text>
          <Text className="text-lg text-gray-900 font-semibold">{endTime}</Text>
        </View>

        {/* Location */}
        <View className="flex-row justify-between mb-3 my-5">
          <Text className="text-lg text-gray-900">{location}</Text>
        </View>

        {/* Booked Slots */}
        <View className="flex-row justify-between mb-3">
          <Text className="text-lg mb-2">Booked Slots: {bookedSlots.length} / {noOfSlots}</Text>
        </View>

        {/* Session Type */}
        <View className="flex-row mb-3">
          <Text className="text-lg font-medium text-gray-600">Session Type:</Text>
          <Text className="text-lg text-gray-900 capitalize">{sessionType}</Text>
        </View>

        {/* Session Control Buttons */}
        <View className="flex-row justify-center gap-10 mb-3 pt-3">
          <TouchableOpacity onPress={startSession} disabled={sessionStarted}>
            <Text className={`text-white text-lg font-bold p-2 px-4 rounded-lg ${sessionStarted ? 'bg-gray-300' : 'bg-blue-400'}`}>Start Session</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endSession} disabled={!sessionStarted}>
            <Text className={`text-white text-lg font-bold p-2 px-6 rounded-lg ${!sessionStarted ? 'bg-gray-300' : 'bg-blue-400'}`}>End Session</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Appointments List */}
      <View className="p-4 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-4">Appointments</Text>
        {appointments.length === 0 ? (
          <Text className="text-center text-gray-500">No appointments available for this session</Text>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} className="flex-row bg-white p-4 rounded-lg mb-4 border border-gray-300">
              <View>
                <Text className="text-lg font-semibold text-gray-800">Child ID: {appointment.child}</Text>
                <Text className="text-lg text-gray-600">Time Slot: {appointment.timeSlot}</Text>
                <Text className="text-lg text-gray-600">Status: {appointment.status}</Text>
                <View>
                {/* Navigate Button */}
                <TouchableOpacity className='mt-2' onPress={() => navigateToLocation(appointment.locationCode)}>
                  <Text className="text-sm text-center text-white font-bold p-1 px-4 rounded-lg bg-green-400">Navigate</Text>
                </TouchableOpacity>
              </View>
              </View>
              <View className="flex-row gap-2 mb-3 pt-3 justify-center mx-auto my-auto">
                <TouchableOpacity onPress={() => completeAppointment(appointment.id)} disabled={!sessionStarted}>
                  <Text className={`text-xs text-white font-bold p-1 px-2 rounded-lg ${!sessionStarted ? 'bg-gray-300' : 'bg-blue-400'}`}>Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => cancelAppointment(appointment.id)} disabled={!sessionStarted}>
                  <Text className={`text-xs text-white font-bold p-1 px-4 rounded-lg ${!sessionStarted ? 'bg-gray-300' : 'bg-red-400'}`}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default Index;
