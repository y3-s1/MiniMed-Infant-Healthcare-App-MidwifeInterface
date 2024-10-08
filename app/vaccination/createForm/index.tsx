import { View, Text, ScrollView, FlatList } from 'react-native'
import React from 'react'
import CreateVaccinationSchedule from '@/components/vaccination/VacciSchedule/CreateVaccinationSchedule'

const AddVaccination = () => {
  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
    <View>
      <Text>AddVaccination</Text>

      {/* create vaccination */}
      <CreateVaccinationSchedule/>
    </View>
    </ScrollView>
  )
}

export default AddVaccination