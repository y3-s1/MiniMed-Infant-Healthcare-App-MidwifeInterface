import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'appointments',
          tabBarIcon: ({ color }) => <FontAwesome5 name="tasks" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vaccination"
        options={{
          title: 'vaccination',
          tabBarIcon: ({ color }) => <MaterialIcons name="vaccines" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} />,
          headerShown:false
        }}
      />
    </Tabs>
  );
}
