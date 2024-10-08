import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, VirtualizedList, StyleSheet } from 'react-native';

const areas = [
  'Malabe',
  'Kampala',
  'Kibale',
  'Jinja',
  'Gulu',
  'Kasese',
  'Mbarara',
  'Mubende',
  'Mityana',
  'Nakapi',
  'Nakasongola',
  'Nebbi',
  'Ntungamo',
  'Rakai',
  'Sembabule',

];

const clinics = [
  'Kaduwela',
  'Malabe',
  'Nugegoda',
  'Kampala',
  'Kibale',
  'Jinja',
];

export default function CreateSession() {
  const { selectedDate } = useLocalSearchParams();
  const [selectedDateDayOfMonth, setSelectedDateDayOfMonth] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [sessionType, setSessionType] = useState('Home Visit');
  const [selectedLocation, setSelectedLocation] = useState('Malabe');
  const [startTime, setStartTime] = useState('7:00 AM');
  const [endTime, setEndTime] = useState('7:30 AM');

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
      title: locations[index],
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


  console.log("selectedDate : ",selectedDate );
  console.log("startTime : ",startTime );
  console.log(" endTime: ", endTime);
  console.log(" sessionType: ", sessionType);
  console.log(" selectedLocation: ", selectedLocation);

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
      <View className="bg-blue-400 my-2 mx-8 flex justify-center rounded-lg">
        <Text className='ml-3 mt-3 text-lg font-semibold text-white'>Type</Text>
        <View className="flex-row justify-center mb-5 mt-1 bg-blue-300 w-3/6 mx-auto rounded-full">
          {/* Navigation buttons */}
          <TouchableOpacity
            onPress={() => setSessionType('Home Visit')}
            className={`px-6 py-2 rounded-full ${
              sessionType === 'Home Visit' ? 'bg-white' : 'bg-blue-300'
            }`}
          >
            <Text
              className={`${
                sessionType === 'Home Visit' ? 'text-blue-500' : 'text-white'
              } font-poppins`}
            >
              Home Visit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSessionType('Clinic')}
            className={`mx-4 px-6 py-2 rounded-full ${
              sessionType === 'Clinic' ? 'bg-white' : 'bg-blue-300'
            }`}
          >
            <Text
              className={`${
                sessionType === 'Clinic' ? 'text-blue-500' : 'text-white'
              } font-poppins`}
            >
              Clinic
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Location Selection (Areas or Clinics) */}
      <Text className="text-lg my-2">{sessionType === 'Home Visit' ? 'Select Area' : 'Select Clinic'}</Text>
      {sessionType === 'Home Visit' ? (
        <LocationSelector locations={areas} />
      ) : (
        <LocationSelector locations={clinics} />
      )}

      {/* Create Session Button */}
      <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mt-3 items-center mb-5" onPress={() => console.log('Session created')}>
        <Text className="text-white text-lg">Create Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  timeSelectorContainer: {
    flex: 1,
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
