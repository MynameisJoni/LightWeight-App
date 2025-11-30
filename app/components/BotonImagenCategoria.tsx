import { Pressable, Text, StyleSheet } from 'react-native';

type Props = {
    label: string;
    onPress: () => void;
};

export default function BotonImagenCategoria({ label, onPress }: Props){
    return(
        <Pressable
            style={({pressed}) => [
                styles.button, pressed && styles.buttonPressed
            ]}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>
                {label} {/* nombre que le indiquemos en el componente padre */}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#ff0000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff'
    },
    buttonPressed: {
        backgroundColor: '#cc0000',
        opacity: 0.8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});