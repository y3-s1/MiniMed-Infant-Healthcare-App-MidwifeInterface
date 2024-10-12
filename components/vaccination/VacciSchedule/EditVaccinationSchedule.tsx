import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { getDoc, updateDoc, getDocs, collection, doc } from 'firebase/firestore';
import { db } from '../../../config/FireBaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker'; // For handling date and time

const EditVaccinationSchedule = ({ sessionId }) => {
  const [sessionData, setSessionData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [usersWithChildren, setUsersWithChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Fetch vaccination session data
        const sessionRef = doc(db, 'Midwives', 'DZ3G0ZOnt8KzFRD3MI02', 'VaccinationSessions', sessionId);
        const sessionSnapshot = await getDoc(sessionRef);

        if (sessionSnapshot.exists()) {
          const session = sessionSnapshot.data();
          setSessionData(session);

          // Fetch participants' names from Users/Childrens subcollection
          const participantNames = await Promise.all(
            session.selectedParticipants.map(async (participantId) => {
              const participantCollection = collection(db, 'Users', participantId, 'Childrens');
              const participantSnapshot = await getDocs(participantCollection);
              const childrenData = participantSnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
              }));
              return childrenData[0]; // Assuming one child per participant
            })
          );
          setParticipants(participantNames);
        }

        // Fetch all users and their children
        const mainCollection = collection(db, 'Users');
        const mainDocsSnapshot = await getDocs(mainCollection);
        
        const allUsersData = await Promise.all(mainDocsSnapshot.docs.map(async (mainDoc) => {
          const mainDocData = mainDoc.data();
          const subCollectionRef = collection(db, 'Users', mainDoc.id, 'Childrens');
          const subDocsSnapshot = await getDocs(subCollectionRef);
          const subCollectionData = subDocsSnapshot.docs.map((subDoc) => ({
            id: subDoc.id,
            name: subDoc.data().name,
          }));

          return {
            userId: mainDoc.id,
            userInfo: mainDocData,
            children: subCollectionData,
          };
        }));
        setUsersWithChildren(allUsersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Handle updating the vaccination session
  const handleUpdate = async () => {
    try {
      const sessionRef = doc(db, 'Midwives', 'DZ3G0ZOnt8KzFRD3MI02', 'VaccinationSessions', sessionId);

      await updateDoc(sessionRef, {
        ...sessionData,
        updatedAt: new Date(),
      });
      alert('Vaccination session updated successfully');
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  // Handle removing a participant
  const handleRemoveParticipant = (participantId) => {
    const updatedParticipants = participants.filter((participant) => participant.id !== participantId);
    setParticipants(updatedParticipants);
    setSessionData({
      ...sessionData,
      selectedParticipants: updatedParticipants.map((p) => p.id),
    });
  };

  // Handle adding a participant
  const handleAddParticipant = (child) => {
    if (!participants.find(p => p.id === child.id)) {
      const updatedParticipants = [...participants, child];
      setParticipants(updatedParticipants);
      setSessionData({
        ...sessionData,
        selectedParticipants: updatedParticipants.map((p) => p.id),
      });
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      <View>
        <Text>Edit Vaccination Schedule</Text>

        {/* Edit Date */}
        <Text>Date:</Text>
        <DateTimePicker
          value={new Date(sessionData?.date?.toDate())}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || sessionData.date.toDate();
            setSessionData({ ...sessionData, date: currentDate });
          }}
        />

        {/* Edit Start Time */}
        <Text>Start Time:</Text>
        <DateTimePicker
          value={new Date(sessionData?.startTime?.toDate())}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            const currentTime = selectedTime || sessionData.startTime.toDate();
            setSessionData({ ...sessionData, startTime: currentTime });
          }}
        />

        {/* Edit End Time */}
        <Text>End Time:</Text>
        <DateTimePicker
          value={new Date(sessionData?.endTime?.toDate())}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            const currentTime = selectedTime || sessionData.endTime.toDate();
            setSessionData({ ...sessionData, endTime: currentTime });
          }}
        />

        {/* Edit Center */}
        <Text>Selected Center:</Text>
        <TextInput
          value={sessionData?.selectedCenter}
          onChangeText={(text) => setSessionData({ ...sessionData, selectedCenter: text })}
        />

        {/* Participants List */}
        <Text>Participants:</Text>
        <FlatList
          data={participants}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>{item.name}</Text>
              <TouchableOpacity onPress={() => handleRemoveParticipant(item.id)}>
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />

        {/* Add Participant */}
        <Text>Add Participant:</Text>
        <FlatList
          data={usersWithChildren.flatMap((user) => user.children)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleAddParticipant(item)}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />

        {/* Update Button */}
        <Button title="Update" onPress={handleUpdate} />
      </View>
    </ScrollView>
  );
};

export default EditVaccinationSchedule;
