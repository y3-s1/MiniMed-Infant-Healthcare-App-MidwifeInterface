import { View, Text } from 'react-native'
import React from 'react'
import AllScheduledVaccinationSessions from '@/components/vaccination/VacciSchedule/AllScheduledVaccinationSessions'

const AllVaccSessionsPage = () => {
  return (
    <View className='flex-1'>
      <AllScheduledVaccinationSessions/>
    </View>
  )
}

export default AllVaccSessionsPage