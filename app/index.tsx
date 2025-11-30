import { Redirect } from 'expo-router';

export default function Index(){
  return <Redirect href="/(tabs)/home" />; // manda al directorio (tabs) -> home. Esta sería la página inicial de la app
}