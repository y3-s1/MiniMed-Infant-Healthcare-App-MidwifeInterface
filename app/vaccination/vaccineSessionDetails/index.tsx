import { View, Text } from 'react-native'
import React from 'react'
import ScheduledVaccDetails from '@/components/vaccination/VacciSchedule/ScheduledVaccDetails'
import { useRoute } from '@react-navigation/native';


const vaccineSessionDetails = () => {

    const route = useRoute(); // Get the route and params from the navigation system
  const { sessionId } = route.params;

  return (
    <View className='flex-1'>
      {/* session details */}
      <ScheduledVaccDetails sessionId={sessionId}/>
    </View>
  )
}

export default vaccineSessionDetails