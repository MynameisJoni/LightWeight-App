import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import ExerciseCard from '../components/ExerciseCard';
import { deleteEjercicio, getEjercicios, postEjercicios, putEjercicios } from '../api/ejerciciosApi';
import { getTipos } from '../api/tiposApi';

export default function ExercisesTab(){
    
    const [ ejercicios, setEjercicios ] = useState<any[]>([]);
    const [ tipos, setTipos ] = useState<any[]>([]);
    const [ imagenesEjercicios, setImagenesEjercicios ] = useState<{[key: string]: string}>({});
    const [ loading, setLoading ] = useState(true);
    const [ facing, setFacing ] = useState<CameraType>('back');
    const [ permission, requestPermission ] = useCameraPermissions();
    const [ showCamera, setShowCamera ] = useState(false); // abrir la vista de la cámara
    const [ ejercicioActual, setEjercicioActual ] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null); // cámara sin uso por defecto (obvio, no?)

    // crear
    const [ formulario, setFormulario] = useState(false);
    const [ nombreNuevo, setNombreNuevo ] = useState('');
    const [ tipoSeleccionado, setTipoSeleccionado ] = useState('');
    const [ creando, setCreando ] = useState(false);

    // editar
    const [ editandoId, setEditandoId ] = useState<string | null>(null);
    const [ nombreEditado, setNombreEditado ] = useState('');
    const [ tipoEditado, setTipoEditado] = useState('');

    // Cargar ejercicios al montar el componente
    useEffect(() => {
        cargarEjercicios();
    }, []);

    // obtener los ejercicios d ela API
    const cargarEjercicios = async () => {
        try{
            setLoading(true);

            const [ejerciciosData, tiposData] = await Promise.all([ // con promise realizamos todas las consultas a la vez, en vez de una por una (más rápido)
                getEjercicios(),
                getTipos()
            ]);
            setEjercicios(ejerciciosData);
            setTipos(tiposData);
        } catch (error) {
            console.error("Error al cargar ejercicios: ", error);
            Alert.alert("Error", "Error al cargar ejercicios");
        } finally {
            setLoading(false);
        }
    };

    // Crear ejercicios
    const handleCrearEjercicio = async () => {
        if(!nombreNuevo.trim()) {
            Alert.alert("Validación", "El nombre del ejercicio es obligatorio");
            return;
        }
        if(!tipoSeleccionado){
            Alert.alert("Validación", "Debes seleccionar un grupo muscular");
            return;
        }

        try{
            setCreando(true);
            await postEjercicios(nombreNuevo.trim(), tipoSeleccionado);

            // resetear formulario
            setNombreNuevo('');
            setTipoSeleccionado('');
            setFormulario(false);

            // refrescar datos
            await cargarEjercicios();
            Alert.alert("Éxito", "Ejercicio creado con éxito");
        } catch (error) {
            console.error("Error al crear ejercicio: ", error);
            Alert.alert("Error", "Error al crear ejercicio");
        } finally {
            setCreando(false);
        }
    }

    // editar ejercicio
    // Seleccionar los datos para editar
    const handleIniciarEdicion = (id: string, nombre: string, tipo: string) => {
        setEditandoId(id);
        setNombreEditado(nombre);
        setTipoEditado(tipo);
    }

    // modificar los campos
    const handleEditarEjercicio = async (id: string, nuevoNombre: string, nuevoTipo: string) => {
        if(!nuevoNombre.trim()){
            Alert.alert("Validación", "El nombre del ejercicio es obligatorio");
            return;
        }
        if(!nuevoTipo){
            Alert.alert("Validación", "Es obligatorio seleccionar grupo muscular");
            return;
        }

        try{
            await putEjercicios(id, nuevoNombre.trim(), nuevoTipo);
            setEjercicios(ejercicios.map(ejercicio =>
                ejercicio.id === id ? {...ejercicio, ejercicio: nuevoNombre, tipo: nuevoTipo} : ejercicio
            ));
            //finalizada la edicion
            setEditandoId(null);
            setNombreEditado('');
            setTipoEditado('');
            Alert.alert("Éxito", "Ejercicio editado con éxito");
        } catch (error) {
            console.error("Error al editar ejercicio: ", error);
            Alert.alert("Error", "Error al editar ejercicio");
        }
    };

    // cncelar edicion
    const cancelarEdicion = () => {
        setEditandoId(null);
        setNombreEditado('');
        setTipoEditado('');
    };

    // eliminar ejercicio
    const handleEliminarEjercicio = (id: string, nombre: string) => {
        Alert.alert(
            "Eliminar Ejercicio",
            `¿Deseas eliminar "${nombre}"?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try{
                            await deleteEjercicio(id);
                            setEjercicios(ejercicios.filter(ejercicio => ejercicio.id !== id));
                            Alert.alert("Éxito", "Ejercicio eliminado con éxito");
                        } catch (error) {
                            console.error("Error al eliminar ejercicio: ", error);
                            Alert.alert("Error", "Error al eliminar ejercicio");
                        }
                    }
                }
            ]
        );
    };

    // seleccionar imagen de la galeria
    const pickImageAsync = async (ejercicioId: string) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8, // importante definir calidad para ahorrar espacio
        });

        if(!result.canceled){
            setImagenesEjercicios({
                ...imagenesEjercicios, [ejercicioId]: result.assets[0].uri
            });
        } else {
            Alert.alert("Información", "No se ha seleccionado ninguna imagen");
        }
    };

    // tomar foto con la cámara
    const takePictureAsync = async (ejercicioId: string) => {
        if(!permission){ 
            return; // si no hay permisos de cámara...
        }

        if(!permission.granted){
            const result = await requestPermission();
            if(!result.granted){
                Alert.alert("Permisos", "Necesita permisos de cámara");
                return; // ... no permite abrirla
            }
        }

        // si lo anterior 'falla' (es decir, que tenemos permisos) -> abre la camara para el ejercicio actual
        setEjercicioActual(ejercicioId);
        setShowCamera(true);
    };

    // capturar foto
    const capturePhoto = async () => {
        if(cameraRef.current && ejercicioActual !== null){ // si la cámara está abierta y estamos dentro de una categoría
            try{
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    skipProcessing: false,
                });

                if(photo && photo.uri){
                    // guarda la foto capturada
                    setImagenesEjercicios({
                        ...imagenesEjercicios, [ejercicioActual]: photo.uri
                    });
                    setShowCamera(false); // cerrar cámara...
                    setEjercicioActual(null); // ...y 'salir' del ejercicio
                } else {
                    Alert.alert("Error", "Error al capturar la foto");
                }
            } catch (error) {
                console.error("error al capturar la foto: ", error);
                Alert.alert("Error", "Error al tomar la foto");
            }
        }
    };

    // vista para cuando la cámara esté activa
    if(showCamera){
        return(
            <View style={styles.cameraContainer}>
                <View style={styles.cameraWrapper}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing={facing}
                    />
                </View>
                <View style={styles.cameraControls}>
                    <Button 
                        title="Cancelar"
                        onPress={() => {
                            setShowCamera(false);
                            setEjercicioActual(null);
                        }}
                    />
                    <Button
                        title="Tomar Foto"
                        onPress={capturePhoto}
                    />
                </View>
            </View>
        );
    }

    // mostrar indicador de carga
    if(loading){
        return(
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff0000" />
                <Text style={styles.loadingText}>Cargando ejercicios...</Text>
            </View>
        );
    }

    // renderizar ejercicios
    const renderEjercicio = ({item}: {item:any}) => {
        // modo edición
        if(editandoId === item.id){
            return(
                <View style={styles.cardEdicion}>
                    <Text style={styles.tituloEdicion}>Editando: {item.ejercicio}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Nombre del ejercicio'
                        placeholderTextColor='#999'
                        value={nombreEditado}
                        onChangeText={setNombreEditado}
                    />

                    <Text style={styles.label}>Grupo Muscular</Text>
                    <View style={styles.tiposContainer}>
                        {tipos.map((tipo) => (
                            <TouchableOpacity
                                key={tipo.id}
                                style={[styles.tipoBoton, tipoEditado === tipo.id && styles.tipoBotonSeleccionado]}
                                onPress={() => setTipoEditado(tipo.id)}
                            >
                                <Text style={[styles.tipoBotonTexto, tipoEditado === tipo.id && styles.tipoBotonTextoSeleccionado]}>{tipo.grupo}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.botonesEdicionContainer}>
                        <TouchableOpacity
                            style={styles.botonCancelar}
                            onPress={cancelarEdicion}
                        >
                            <Text style={styles.botonTextoBlanco}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.botonGuardar}
                            onPress={() => handleEditarEjercicio(item.id, nombreEditado, tipoEditado)}
                        >
                            <Text style={styles.botonTextoBlanco}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // Obtener el nombre del tipo/grupo muscular
        const tipoObj = tipos.find(t => t.id === item.tipo);
        const ejercicioConGrupo = {
            ...item,
            tipo: tipoObj?.grupo
        };

        return(
            <ExerciseCard
                ejercicio={ejercicioConGrupo} // ejercicio espera tanto el nombre del ejercicio como el grupo muscular
                selectedImage={imagenesEjercicios[item.id]}
                onPickImage={() => pickImageAsync(item.id)}
                onTakePhoto={() => takePictureAsync(item.id)}
                onEditar={() => handleIniciarEdicion(item.id, item.ejercicio, item.tipo)}
                onEliminar={() => handleEliminarEjercicio(item.id, item.ejercicio)}
            />
        );
    };

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Mis Ejercicios</Text>

            {/* mostrar/cerrar formulario */}
            <TouchableOpacity style={styles.botonNuevo} onPress={() => setFormulario(!formulario)}>
                <Text style={styles.botonNuevoTexto}>{formulario ? 'Cancelar' : 'Añadir'}</Text>
            </TouchableOpacity>

            {/* Formulario */}
            {formulario && (
                <View style={styles.formulario}>
                    <Text style={styles.formularioTitulo}>Crear ejercicio</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Nombre del ejercicio'
                        placeholderTextColor='#999'
                        value={nombreNuevo}
                        onChangeText={setNombreNuevo}
                    />

                    <Text style={styles.label}>Grupo muscular</Text>
                    <View style={styles.tiposContainer}>
                        {tipos.map((tipo) => (
                            <TouchableOpacity
                                key={tipo.id}
                                style={[styles.tipoBoton, tipoSeleccionado === tipo.id && styles.tipoBotonSeleccionado]}
                                onPress={() => setTipoSeleccionado(tipo.id)}
                            >
                                <Text style={[styles.tipoBotonTexto, tipoSeleccionado === tipo.id && styles.tipoBotonTextoSeleccionado]}>{tipo.grupo}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Botón crear */}
                    <TouchableOpacity
                        style={styles.botonCrear}
                        onPress={handleCrearEjercicio}
                        disabled={creando}
                    >
                        {creando ? (
                            <ActivityIndicator color='#fff' />
                        ) : (
                            <Text style={styles.botonCrearTexto}>Crear Ejercicio</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Lista de ejercicios */}
            {ejercicios.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay ejercicios disponibles</Text>
                    <Text style={styles.emptySubtext}>Crea tu primer ejercicio ;)</Text>
                </View>
            ) : (
                <FlatList
                    data={ejercicios}
                    renderItem={renderEjercicio}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
    },
    listContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ff0000',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#fff',
    },
    // Estilos para la cámara
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraWrapper: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderTopWidth: 2,
        borderTopColor: '#ff0000'
    },
    botonNuevo: {
        backgroundColor: '#ff0000',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonNuevoTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    formulario: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ff0000',
    },
    formularioTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1a1a1a',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    tiposContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    tipoBoton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#ff0000',
        backgroundColor: '#fff',
    },
    tipoBotonSeleccionado: {
        backgroundColor: '#ff0000',
    },
    tipoBotonTexto: {
        color: '#ff0000',
        fontWeight: '600',
    },
    tipoBotonTextoSeleccionado: {
        color: '#fff',
    },
    botonCrear: {
        backgroundColor: '#ff0000',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonCrearTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardEdicion: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ff0000',
    },
    tituloEdicion: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    botonesEdicionContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    botonCancelar: {
        flex: 1,
        backgroundColor: '#666',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonGuardar: {
        flex: 1,
        backgroundColor: '#ff0000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonTextoBlanco: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});