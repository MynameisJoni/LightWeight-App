import { View, Text, StyleSheet, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeTab(){
    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Yeahh Buddy!</Text>
            <Text style={styles.subtitle}>LightWeight App Baby!</Text>
            <Text style={styles.info}>Ve a la pestaña de Rutinas para crear entrenamientos y ponerte todo TITÁN!!!</Text>
            <Image source={require('../../assets/images/light-weight.jpg')} style={styles.imagen} resizeMode='contain' />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 20,
    },
    imagen: {
        width: 250,
        height: 250,
        marginBottom: 30,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ff0000',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 24,
    },
    info: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
    },
});