import EventCreation from '@/components/events/CreateEvent/EventCreation';
import AdminEventList from '@/components/events/EventList/AdminEventList';
import { View, Text, StyleSheet } from 'react-native';



export default function Tab() {
  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <Header/> */}

      {/* content */}
      {/* <EventCreation/> */}
      <AdminEventList/>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});