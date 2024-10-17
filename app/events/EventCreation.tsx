import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../../config/FireBaseConfig'; // Import Firestore configuration
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router'; // Use useLocalSearchParams for navigation
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

export default function UpdateEvent() {
    const navigation = useNavigation();
    const { id } = useLocalSearchParams() as { id: string };

    // States to handle the event data
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventLocation, setEventLocation] = useState({ latitude: 0, longitude: 0 });
    const [eventAddress, setEventAddress] = useState('');
    const [eventStartTime, setEventStartTime] = useState(new Date());
    const [eventEndTime, setEventEndTime] = useState(new Date());
    const [eventDate, setEventDate] = useState(new Date());
    const [eventImageName, setEventImageName] = useState('');
    const [organizerName, setOrganizerName] = useState(''); 
    const [organizerPhone, setOrganizerPhone] = useState(''); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Fetch event details and organizer information when component loads
    useEffect(() => {
        navigation.setOptions({ title: 'Update Event' });

        const fetchEventDetails = async () => {
            if (!id) return; // No ID, no need to fetch
            try {
                const eventDoc = await getDoc(doc(db, 'Events', id));
                if (eventDoc.exists()) {
                    const eventData = eventDoc.data();
                    setEventTitle(eventData.EventTitle);
                    setEventDescription(eventData.EventDescription);
                    setEventAddress(eventData.EventLocation);
                    setEventLocation(eventData.EventLocation); 
                    setEventStartTime(new Date(`1970-01-01T${eventData.EventStartTime}`));
                    setEventEndTime(new Date(`1970-01-01T${eventData.EventEndTime}`));
                    setEventDate(new Date(eventData.EventDate));
                    setEventImageName(eventData.EventImage);

                    const organizerDoc = await getDoc(doc(db, 'Midwives', eventData.EventOrganizer));
                    if (organizerDoc.exists()) {
                        const organizerData = organizerDoc.data();
                        setOrganizerName(organizerData.name);
                        setOrganizerPhone(organizerData.phone);
                    }
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            }
        };

        fetchEventDetails();
    }, [id, navigation]);

    // Convert human-readable address to latitude and longitude
    const convertAddressToCoordinates = async () => {
        try {
            const geocode = await Location.geocodeAsync(eventAddress);
            if (geocode.length > 0) {
                const { latitude, longitude } = geocode[0];
                setEventLocation({ latitude, longitude });
            } else {
                Alert.alert('Error', 'Address not found.');
            }
        } catch (error) {
            console.error('Error converting address:', error);
            Alert.alert('Error', 'Failed to convert address to coordinates.');
        }
    };

    const handleMapPress = async (event: any) => {
        const { coordinate } = event.nativeEvent;
        setEventLocation(coordinate);
        const address = await getAddressFromCoords(coordinate.latitude, coordinate.longitude);
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

    const handleSubmit = async () => {
        try {
            const eventRef = doc(db, 'Events', id);
            await updateDoc(eventRef, {
                EventTitle: eventTitle,
                EventDescription: eventDescription,
                EventLocation: eventLocation,
                EventStartTime: eventStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                EventEndTime: eventEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                EventDate: eventDate.toISOString().split('T')[0],
                EventImage: eventImageName,
            });
            Alert.alert('Success', 'Event updated successfully!');
        } catch (error) {
            console.error('Error updating event:', error);
            Alert.alert('Error', 'Failed to update event.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Update Event</Text>

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
            <TextInput
                style={styles.input}
                value={eventAddress}
                onChangeText={setEventAddress}
                placeholder="Enter event address"
                placeholderTextColor="#999"
                onBlur={convertAddressToCoordinates} // Convert address to coordinates when input loses focus
            />

            <TouchableOpacity onPress={() => setShowMap(true)} style={styles.locationPicker}>
                <Text style={styles.locationPickerText}>
                    {eventAddress || 'Pick a location'}
                </Text>
            </TouchableOpacity>

            {showMap && (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        region={{
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

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Update Event</Text>
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
