import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff0000',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopWidth: 2,
          borderTopColor: '#ff0000',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        headerStyle: {
          backgroundColor: '#1a1a1a',
          borderBottomWidth: 2,
          borderBottomColor: '#ff0000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        }
      }}
    >
      {/* Cada una de las pestañas que nos llevarán a las páginas indicadas */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
        }}
      />
      
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Ejercicios',
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Rutinas'
        }}
      />
    </Tabs>
  );
}