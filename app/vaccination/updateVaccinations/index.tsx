import { View, Text } from 'react-native'
import React from 'react'
import EditVaccinationSchedule from '@/components/vaccination/VacciSchedule/EditVaccinationSchedule'
import { useRoute } from '@react-navigation/native';

const SessionUpdstePsge = () => {

    const route = useRoute(); // Get the route and params from the navigation system
    const { sessionId } = route.params;
  return (
    <View className='flex-1'>
      <Text>SessionUpdstePsge</Text>
      <EditVaccinationSchedule sessionId={sessionId}/>
    </View>
  )
}

export default SessionUpdstePsge