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
    const [organizerName, setOrganizerName] = useState(''); // New state for organizer name
    const [organizerPhone, setOrganizerPhone] = useState(''); // New state for organizer phone
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
                    setEventLocation(eventData.EventLocation); // Store the location coordinates
                    setEventStartTime(new Date(`1970-01-01T${eventData.EventStartTime}`));
                    setEventEndTime(new Date(`1970-01-01T${eventData.EventEndTime}`));
                    setEventDate(new Date(eventData.EventDate));
                    setEventImageName(eventData.EventImage);


                     // Convert human-readable address to coordinates
                     const location = await getCoordsFromAddress(eventData.EventLocation);
                     setEventLocation(location); // Store the location coordinates
                     setEventAddress(eventData.EventLocation); // Store human-readable address
 

                    // Fetch organizer details using EventOrganizer ID
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
    }, [id, navigation]); // Ensure navigation is in the dependencies array




    // Convert address to latitude and longitude
    const getCoordsFromAddress = async (address: string) => {
        try {
            const geocode = await Location.geocodeAsync(address);
            if (geocode.length > 0) {
                const { latitude, longitude } = geocode[0];
                return { latitude, longitude };
            }
            return { latitude: 0, longitude: 0 };
        } catch (error) {
            console.error('Error converting address to coordinates:', error);
            return { latitude: 0, longitude: 0 };
        }
    };


    // Convert coordinates to human-readable address
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

        // Convert coordinates back to a human-readable address
        const address = await getAddressFromCoords(coordinate.latitude, coordinate.longitude);
        setEventAddress(address);
        setShowMap(false);
    };

    

    const handleSubmit = async () => {
        try {
            const eventRef = doc(db, 'Events', id);
            // Convert the updated eventAddress back to latitude and longitude before submitting
            const location = await getCoordsFromAddress(eventAddress);
            if (location.latitude === 0 && location.longitude === 0) {
                Alert.alert('Error', 'Invalid address');
                return;
            }
            await updateDoc(eventRef, {
                EventTitle: eventTitle,
                EventDescription: eventDescription,
                EventLocation: eventAddress,
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

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            setEventLocation({ latitude, longitude });
            const address = await getAddressFromCoords(latitude, longitude);
            setEventAddress(address);
        } catch (error) {
            console.error('Error getting current location:', error);
            Alert.alert('Error', 'Failed to get current location.');
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
            <TouchableOpacity onPress={() => setShowMap(true)} style={styles.locationPicker}>
                <Text style={styles.locationPickerText}>
                    {eventAddress || 'Pick a location'}
                </Text>
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
                <Text style={styles.datePickerText}>
                    {eventDate.toLocaleDateString() || 'Select date'}
                </Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={eventDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.timePicker}>
                <Text style={styles.timePickerText}>
                    {eventStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Select start time'}
                </Text>
            </TouchableOpacity>

            {showStartTimePicker && (
                <DateTimePicker
                    value={eventStartTime}
                    mode="time"
                    display="default"
                    onChange={handleStartTimeChange}
                />
            )}

            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.timePicker}>
                <Text style={styles.timePickerText}>
                    {eventEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Select end time'}
                </Text>
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
                <Text style={styles.imagePickerText}>
                    {eventImageName || 'Select Event Image'}
                </Text>
            </TouchableOpacity>

           

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Update Event</Text>
            </TouchableOpacity>

            <View style={styles.organizerContainer}>
                <Text style={styles.organizerTitle}>Organizer Details</Text>
                <View style={styles.organizerInfoContainer}>
                    <Text style={styles.organizerLabel}>Name:</Text>
                    <Text style={styles.organizerValue}>{organizerName || 'Loading...'}</Text>
                </View>
                <View style={styles.organizerInfoContainer}>
                    <Text style={styles.organizerLabel}>Phone:</Text>
                    <Text style={styles.organizerValue}>{organizerPhone || 'Loading...'}</Text>
                </View>
            </View>
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
        marginBottom: 20,
    },
    label: {
        marginVertical: 10,
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    locationPicker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    locationPickerText: {
        color: '#999',
    },
    currentLocationButton: {
        backgroundColor: '#43B0F1',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    currentLocationButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mapContainer: {
        height: 300,
        marginBottom: 20,
    },
    map: {
        flex: 1,
        borderRadius: 5,
    },
    closeMapButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    closeMapButtonText: {
        color: '#fff',
    },
    datePicker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    datePickerText: {
        color: '#999',
    },
    timePicker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    timePickerText: {
        color: '#999',
    },
    imagePicker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    imagePickerText: {
        color: '#999',
    },
    submitButton: {
        backgroundColor: '#43B0F1',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Organizer Section Styles
    organizerContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dedede',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    organizerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    organizerInfoContainer: {
        marginVertical: 4,
    },
    organizerLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    organizerValue: {
        fontSize: 14,
        color: '#555',
    },


});





