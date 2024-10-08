import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  VirtualizedList,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/FireBaseConfig';
import Toast from 'react-native-toast-message';

const CreateVaccinationSchedule = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState(''); // New state for area filter
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [vaccinationList, setVaccinationList] = useState([]); // Store fetched vaccines
  const [participants, setParticipants] = useState([]); // Store fetched participants
  const [loading, setLoading] = useState(false);

  

  // const participants = [
  //   { name: 'Onara Yenumi', age: 4, location: 'Raddolugama', lastVaccine: 'OPV 1 (03-04)' },
  //   { name: 'Shenash', age: 5, location: 'Kaduwela', lastVaccine: 'OPV 1 (03-04)' },
  //   { name: 'Kasuni Amaya', age: 4, location: 'Malabe', lastVaccine: 'OPV 1 (03-04)' },
  //   { name: 'Yenumi', age: 4, location: 'Raddolugama', lastVaccine: 'OPV 1 (03-04)' },
  //   { name: 'Kumara', age: 5, location: 'Malabe', lastVaccine: 'OPV 1 (03-04)' },
  //   { name: 'Amaya', age: 4, location: 'Kaduwela', lastVaccine: 'OPV 1 (03-04)' },
  // ];

  useEffect(() => {
    fetchVaccinationData();
  }, []);


  const fetchVaccinationData = async () => {
    try {
      setLoading(true);

      // Fetch the vaccination schedule
      const scheduleSnapshot = await getDocs(collection(db, "VaccinationSchedules"));
      const scheduleData = scheduleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch child vaccination record (example childId)
      const mainCollection = collection(db, 'Users');
  
      // Fetch all documents from the main collection
      const mainDocsSnapshot = await getDocs(mainCollection);

      const allData = [];

      for (const mainDoc of mainDocsSnapshot.docs) {
        const mainDocData = mainDoc.data();  // Data of the main document
        const subCollectionRef = collection(db, 'Users', mainDoc.id, 'Childrens'); // Reference to the subcollection
    
      // Fetch all documents from the subcollection
      const subDocsSnapshot = await getDocs(subCollectionRef);

      // Gather subcollection data
      const subCollectionData = subDocsSnapshot.docs.map(subDoc => ({
        id: subDoc.id,  // Get the document ID
        ...subDoc.data(),  // Get the document data
      }));

    // Add both main document and subcollection data
      allData.push({
        mainDocId: mainDoc.id,
        mainDocData: mainDocData,
        subCollectionData: subCollectionData,
      });
  }



      const childData = allData.map(doc => doc.subCollectionData);

      console.log('childData', childData);

    // Use map instead of find to iterate and create merged data
    const mergedData = childData.flat().map((rec) => ({
      id: rec.id,
      name: rec.name,
      age: rec.age,
      location: rec.location,
      dob: rec.dob,
      // Add more fields if necessary
    }));

    console.log('mergedData', mergedData);

      setVaccinationList(scheduleData); // Update vaccinationList with fetched data
      setParticipants(mergedData); // Update participants with merged data
      
    } catch (error) {
      console.error("Error fetrrching vaccination data:", error);
    } finally {
      setLoading(false);
    }
  };

  // VirtualizedList specific functions
  const getItem = (data: any[], index: number) => data[index];

  const getItemCount = (data: any[]) => data.length;

  const handleDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleStartTimeChange = (event: any, selectedTime: any) => {
    setShowStartTimePicker(false);
    if (selectedTime) setStartTime(selectedTime);
  };

  const handleEndTimeChange = (event: any, selectedTime: any) => {
    setShowEndTimePicker(false);
    if (selectedTime) setEndTime(selectedTime);
  };

  // **Filter participants based on search text, age range, and area**
//   const filteredParticipants = () => {
  
//   const filterd = participants.filter((participant) => {
//     // Check search text match
//     const matchesSearchText = participant.name
//       .toLowerCase()
//       .includes(searchText.toLowerCase());

//     // Check age range match
//     const participantAge = participant.age;
//     const minAgeValue = minAge ? parseInt(minAge) : null;
//     const maxAgeValue = maxAge ? parseInt(maxAge) : null;

//     const matchesAgeRange =
//       (minAgeValue === null || participantAge >= minAgeValue) &&
//       (maxAgeValue === null || participantAge <= maxAgeValue);

//     // Check area match
//     const matchesArea = selectedArea === '' || participant.location === selectedArea;

//     // Return true if all conditions are met
//     const participants  = matchesSearchText && matchesAgeRange && matchesArea;

//     return matchesSearchText && matchesAgeRange && matchesArea;
//   });

//   const selectedNames = filterd.map(participant => participant.name);
//       setSelectedParticipants(selectedNames);


// }



const filteredParticipants = useMemo(() => {
  const filtered = participants.filter((participant) => {
    const matchesSearchText = participant.name.toLowerCase().includes(searchText.toLowerCase());
    const participantAge = participant.age;
    const minAgeValue = minAge ? parseInt(minAge) : null;
    const maxAgeValue = maxAge ? parseInt(maxAge) : null;
    const matchesAgeRange =
      (minAgeValue === null || participantAge >= minAgeValue) &&
      (maxAgeValue === null || participantAge <= maxAgeValue);
    const matchesArea = selectedArea === '' || participant.location === selectedArea;
    return matchesSearchText && matchesAgeRange && matchesArea;
  });

  const selectedIds = filtered.map(participant => participant.id);
  setSelectedParticipants(selectedIds); // This will now only happen when the filter changes

  return filtered;
}, [searchText, minAge, maxAge, selectedArea, participants]);

  

  // Handle participant selection toggle
  const toggleParticipantSelection = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      // Remove the ID if it's already selected
      setSelectedParticipants(
        selectedParticipants.filter((id) => id !== participantId)
      );
    } else {
      // Add the ID if it's not yet selected
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
  };


  const submitVaccinationSession = async () => {
    try {
      // Create a new document in the "VaccinationSessions" collection
      await addDoc(collection(db, 'VaccinationSessions'), {
        selectedParticipants, // Array of selected participant IDs
        selectedArea, // Area filter (if applied)
        selectedVaccine, // Selected vaccine ID
        selectedCenter, // Vaccination center
        date, // Selected date
        startTime, // Start time of the vaccination session
        endTime, // End time of the vaccination session
        createdAt: new Date(), // Timestamp for when the session is created
      });
  
      // Show success toast
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Vaccination session successfully added!',
      position: 'bottom',
    });
  } catch (error) {
    console.error('Error adding vaccination session:', error);

    // Show error toast
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to add vaccination session. Please try again.',
      position: 'bottom',
    });
  }
  };
  

  const submit =() => {
    submitVaccinationSession();
  }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Date Selection */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{date.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Start Time Selection */}
      <Text style={styles.label}>Start Time</Text>
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
        <Text style={styles.timeText}>{startTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      {/* End Time Selection */}
      <Text style={styles.label}>End Time</Text>
      <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
        <Text style={styles.timeText}>{endTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}

      {/* Vaccine Selection */}
      <Text style={styles.label}>Type of Vaccine</Text>
      <Picker
        selectedValue={selectedVaccine}
        onValueChange={(itemValue) => setSelectedVaccine(itemValue)}
        style={styles.picker}
      >
        {vaccinationList.map((vaccine) => (
          <Picker.Item key={vaccine.id} label={vaccine.vaccineName} value={vaccine.id} />
        ))}
      </Picker>

      {/* Center Selection */}
      <Text style={styles.label}>Centre</Text>
      <View style={styles.centerRow}>
        <TouchableOpacity
          onPress={() => setSelectedCenter('Kaduwela')}
          style={
            selectedCenter === 'Kaduwela' ? styles.selectedButton : styles.centerButton
          }
        >
          <Text
            style={
              selectedCenter === 'Kaduwela' ? styles.selectedCenterText : styles.centerText
            }
          >
            Kaduwela
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedCenter('Malabe')}
          style={
            selectedCenter === 'Malabe' ? styles.selectedButton : styles.centerButton
          }
        >
          <Text
            style={
              selectedCenter === 'Malabe' ? styles.selectedCenterText : styles.centerText
            }
          >
            Malabe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedCenter('Biyagama')}
          style={
            selectedCenter === 'Biyagama' ? styles.selectedButton : styles.centerButton
          }
        >
          <Text
            style={
              selectedCenter === 'Biyagama' ? styles.selectedCenterText : styles.centerText
            }
          >
            Biyagama
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter Participants */}
      <Text style={styles.label}>Select Participants</Text>

      {/* Search Participant */}
      <TextInput
        placeholder="Search Participant"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      {/* Filter by Age */}
      <Text style={styles.filterLabel}>Filter by Age</Text>
      <View style={styles.ageInputRow}>
        <TextInput
          placeholder="Min Age (months)"
          value={minAge}
          onChangeText={setMinAge}
          keyboardType="numeric"
          style={styles.ageInput}
        />
        <TextInput
          placeholder="Max Age (months)"
          value={maxAge}
          onChangeText={setMaxAge}
          keyboardType="numeric"
          style={styles.ageInput}
        />
      </View>

      {/* Filter by Area */}
      <Text style={styles.filterLabel}>Filter by Area</Text>
      <Picker
        selectedValue={selectedArea}
        onValueChange={(itemValue) => setSelectedArea(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="All Areas" value="" />
        <Picker.Item label="Raddolugama" value="Raddolugama" />
        <Picker.Item label="Kaduwela" value="Kaduwela" />
        <Picker.Item label="Malabe" value="Malabe" />
        {/* Add more areas as needed */}
      </Picker>

      {/* Display Filtered Participants */}
      <VirtualizedList
        data={filteredParticipants}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity onPress={() => toggleParticipantSelection(item.id)}>
            <View
              style={[
                styles.participantCard,
                selectedParticipants.includes(item.id) && styles.selectedParticipantCard,
              ]}
            >
              <Text>{item.name}</Text>
              <Text>{item.age} months</Text>
              <Text>Last Vaccination - {item.lastVaccine}</Text>
              <Text>Area - {item.location}</Text>
            </View>
          </TouchableOpacity>
        )}
        getItem={(data, index) => getItem(data, index)}
        getItemCount={(data) => getItemCount(data)}
        initialNumToRender={4}
        horizontal
        ListEmptyComponent={() => <Text>No participants found.</Text>}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatList}
      />

      {/* Create Vaccination Button */}
      <TouchableOpacity onPress={submit} style={styles.createButton}>
        <Text style={styles.createButtonText}>Create Vaccination</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  dateText: {
    fontSize: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  filterLabel: {
    fontSize: 16,
    marginVertical: 10,
    color: '#a3a3a3',
  },
  timeText: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 20,
  },
  picker: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  centerText: {
    // Default center text
  },
  selectedCenterText: {
    color: '#ffffff',
  },
  centerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  selectedButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  ageInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '48%',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  flatList: {
    marginVertical: 20,
  },
  participantCard: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    margin: 5,
  },
  selectedParticipantCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#e6f0ff',
  },
  createButton: {
    padding: 15,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CreateVaccinationSchedule;
