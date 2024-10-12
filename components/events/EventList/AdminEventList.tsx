import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router'; // If using Expo Router for navigation
import { db } from '../../../config/FireBaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

interface Event {
  id: string;
  EventTitle: string;
  EventDate: string;
  EventStartTime: string;
  EventEndTime: string;
}

export default function AdminEventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const router = useRouter(); // Initialize router for navigation

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Events'));
        const eventsList: Event[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Event));
        setEvents(eventsList);
        setFilteredEvents(eventsList); // Initialize with all events
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(events); // Show all events if search is cleared
    } else {
      const filtered = events.filter((event) =>
        event.EventTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'Events', id));
              setEvents(events.filter(event => event.id !== id));
              setFilteredEvents(filteredEvents.filter(event => event.id !== id));
              Alert.alert('Success', 'Event deleted successfully.');
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete the event.');
            }
          }
        }
      ]
    );
  };

  const handleUpdate = (id: string) => {
    // Navigate to the UpdateEvent page with the event's ID
    router.push(`/events/UpdateEvent?id=${id}`);
  };

  const renderEventRow = ({ item }: { item: Event }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">{item.EventTitle}</Text>
      <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">{item.EventDate}</Text>
      <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
        {item.EventStartTime} - {item.EventEndTime}
      </Text>
      <TouchableOpacity onPress={() => handleUpdate(item.id)} style={styles.iconButton}>
        <MaterialIcons name="edit" size={24} color="green" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event List</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <ScrollView horizontal={true}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Event Title</Text>
            <Text style={styles.tableHeaderText}>Event Date</Text>
            <Text style={styles.tableHeaderText}>Event Time</Text>
            <Text style={styles.tableHeaderText}>Update</Text>
            <Text style={styles.tableHeaderText}>Delete</Text>
          </View>
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            renderItem={renderEventRow}
          />
        </View>
      </ScrollView>
      <TouchableOpacity 
      style={styles.createEventButton} 
      onPress={() => router.push('/events/AddEvent')}
    >
      <Text style={styles.createEventButtonText}>Create Event</Text>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    marginBottom: 10,
    backgroundColor: '#e6e9ed',
    padding: 10,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    minWidth: 120, // Adjusted to have a consistent width for headers
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  tableCell: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    minWidth: 120, // Consistent width across cells to match headers
    maxWidth: 120, // Limit the cell width so it does not exceed the header size
    color: '#555',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80, // Consistent width for icons
  },


  createEventButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#60a5fa', // Change to your preferred color
    borderRadius: 8,
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
  },
  
  createEventButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
  
  
});
