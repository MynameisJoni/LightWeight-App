import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import BotonImagenCategoria from './BotonImagenCategoria';

// imagen por defecto hasta que el usuario seleccione una 
const PlaceholderImage = require('@/assets/images/light-weight-copia.png');

type Props = {
    ejercicio: {
        id: string;
        ejercicio: string;
        tipo: string;
    };
    selectedImage?: string;
    // props que llamarán a las funciones correspondientes para su acción
    onPickImage: () => void;
    onTakePhoto: () => void;
    onEditar: () => void;
    onEliminar: () => void;
};

export default function ExerciseCard({ ejercicio, selectedImage, onPickImage, onTakePhoto, onEditar, onEliminar }: Props){
    // imagen a mostrar, si no hay seleccionada -> muestra la predeterminada
    const imageSource = selectedImage ? { uri: selectedImage } : PlaceholderImage;

    return (
        <View style={styles.card}>
            <Image source={imageSource} style={styles.image} />

            <View style={styles.botonesImagen}>
                <BotonImagenCategoria label="Galería" onPress={onPickImage} />
                <BotonImagenCategoria label="Cámara" onPress={onTakePhoto} />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.nombreEjercicio}>{ejercicio.ejercicio}</Text>
                <Text style={styles.tipoEjercicio}>Tipo: {ejercicio.tipo}</Text>
                <View style={styles.botonesAccion}>
                    <TouchableOpacity style={styles.botonEditar} onPress={onEditar}>
                        <Text style={styles.botonTexto}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botonEliminar} onPress={onEliminar}>
                        <Text style={styles.botonTexto}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'red',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 100,
        resizeMode: 'cover',
        backgroundColor: '#e0e0e0',
    },
    botonesImagen: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    infoContainer: {
        padding: 16,
        backgroundColor: '#fff'
    },
    nombreEjercicio: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    tipoEjercicio: {
        fontSize: 16,
        color: '#ff0000',
        fontStyle: 'italic',
        fontWeight: '600',
    },
    botonesAccion: {
        flexDirection: 'row',
        gap: 10,
    },
    botonEditar: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    botonEliminar: {
        flex: 1,
        backgroundColor: '#ff0000',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    botonTexto: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});