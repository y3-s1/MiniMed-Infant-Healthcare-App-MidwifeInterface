import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../../../config/FireBaseConfig'; // Import the Firestore configuration
import { collection, addDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation


export default function EventCreation() {

  const navigation = useNavigation();


  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState({ latitude: 0, longitude: 0 });
  const [eventAddress, setEventAddress] = useState(''); // Add state for the human-readable address
  const [eventStartTime, setEventStartTime] = useState(new Date());
  const [eventEndTime, setEventEndTime] = useState(new Date());
  const [eventDate, setEventDate] = useState(new Date());
  const [eventImageName, setEventImageName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || eventDate;
    setEventDate(currentDate);
    setShowDatePicker(false);
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || eventStartTime;
    setEventStartTime(currentTime);
    setShowStartTimePicker(false);
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || eventEndTime;
    setEventEndTime(currentTime);
    setShowEndTimePicker(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUriParts = result.assets[0].uri.split('/');
      const imageName = imageUriParts[imageUriParts.length - 1];
      setEventImageName(imageName);
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setEventLocation(coordinate);
    const address = await getAddressFromCoords(coordinate.latitude, coordinate.longitude);
    setEventAddress(address);
    setShowMap(false);
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setEventLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    const address = await getAddressFromCoords(location.coords.latitude, location.coords.longitude);
    setEventAddress(address);
    setShowMap(false);
  };

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const { city, street, country } = result[0];
        return `${street}, ${city}, ${country}`;
      }
      return '';
    } catch (error) {
      console.error("Error getting address:", error);
      return '';
    }
  };
  navigation.setOptions({ title: 'Create Event' });

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "Events"), {
        EventTitle: eventTitle,
        EventDescription: eventDescription,
        EventLocation: eventAddress, // Store the human-readable address
        EventStartTime: eventStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        EventEndTime: eventEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        EventDate: eventDate.toISOString().split('T')[0],
        EventImage: eventImageName,
        EventOrganizer:'DZ3G0ZOnt8KzFRD3MI02',
        EventJoinedPeople: [],
      });
      Alert.alert('Success', 'Event created successfully!');
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert('Error', 'Failed to create event.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Event</Text>

      <Text style={styles.label}>Event Title</Text>
      <TextInput
        style={styles.input}
        value={eventTitle}
        onChangeText={setEventTitle}
        placeholder="Enter event title"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Event Description</Text>
      <TextInput
        style={styles.input}
        value={eventDescription}
        onChangeText={setEventDescription}
        placeholder="Enter event description"
        multiline
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Event Location</Text>
      <TouchableOpacity onPress={() => setShowMap(true)} style={styles.locationPicker}>
        <Text style={styles.locationPickerText}>
          {eventAddress || 'Pick a location'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={getCurrentLocation} style={styles.currentLocationButton}>
        <Text style={styles.currentLocationButtonText}>Use Current Location</Text>
      </TouchableOpacity>

      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: eventLocation.latitude || 37.78825,
              longitude: eventLocation.longitude || -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={eventLocation} />
          </MapView>
          <TouchableOpacity onPress={() => setShowMap(false)} style={styles.closeMapButton}>
            <Text style={styles.closeMapButtonText}>Close Map</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Event Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text style={styles.datePickerText}>{eventDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Event Start Time</Text>
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.datePicker}>
        <Text style={styles.datePickerText}>{eventStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={eventStartTime}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}

      <Text style={styles.label}>Event End Time</Text>
      <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.datePicker}>
        <Text style={styles.datePickerText}>{eventEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={eventEndTime}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}

      <Text style={styles.label}>Event Image</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>{eventImageName ? eventImageName : "Pick an image"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    height: 80,
  },
  locationPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  locationPickerText: {
    fontSize: 16,
    color: '#333',
  },
  currentLocationButton: {
    backgroundColor: '#43B0F1',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  currentLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 10,
    height: 300,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  closeMapButton: {
    backgroundColor: '#43B0F1',
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeMapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#43B0F1',
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#43B0F1',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
