import { View, Text, ScrollView, FlatList } from 'react-native'
import React from 'react'
import CreateVaccinationSchedule from '@/components/vaccination/VacciSchedule/CreateVaccinationSchedule'
import Toast from 'react-native-toast-message';

const AddVaccination = () => {
  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
    <View>

      {/* create vaccination */}
      <CreateVaccinationSchedule/>
      <Toast />
    </View>
    </ScrollView>
  )
}

export default AddVaccination