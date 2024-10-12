import Header from '@/components/vaccination/home/Header';
import VaccHome from '@/components/vaccination/home/VaccHome';
import { View, Text, StyleSheet } from 'react-native';



export default function Tab() {
  return (
    <View style={styles.container}>

      {/* content */}
      <VaccHome/>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});