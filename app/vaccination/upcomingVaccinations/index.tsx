import { View, Text } from 'react-native'
import React from 'react'
import UpcomingVacci from '@/components/vaccination/VacciSchedule/UpcomingVacci'

const UpcomingVaccinations = () => {
  return (
    <View className='flex-1'>
      {/* upcoming vaccinations */}
      <UpcomingVacci/>
    </View>
  )
}

export default UpcomingVaccinations