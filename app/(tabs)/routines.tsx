import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, ScrollView, Alert} from 'react-native';
import { useState, useEffect } from 'react';
import { deleteRutina, getRutinas, postRutinas, putRutina } from '../api/rutinasApi';
import { getEjercicios } from '../api/ejerciciosApi';
import { getTipos } from '../api/tiposApi';

export default function RoutinesTab(){

    const [ rutinas, setRutinas] = useState<any[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ tipos, setTipos ] = useState<any[]>([]);
    const [ ejercicios, setEjercicios ] = useState<any[]>([]);

    //para crear
    const [ formulario, setFormulario ] = useState(false);
    const [ ejerciciosSeleccionados, setEjerciciosSeleccionados ] = useState<string[]>([]);
    const [ nombreRutina, setNombreRutina ] = useState('');
    const [ creando, setCreando] = useState(false);

    // para editar
    const [ editandoRutina, setEditandoRutina ] = useState<string | null>(null);
    const [ ejerciciosEditados, setEjerciciosEditados ] = useState<string[]>([]);
    const [ nombreEditado, setNombreEditado ] = useState('');
    
    // cargar rutinas
    useEffect(() => {
        cargarRutinas();
    }, []);

    // obtener las rutinas de la API
    const cargarRutinas = async () => {
        try{
            setLoading(true);

            // traemos las rutinas y sus ejercicios
            const [ rutinasData, ejerciciosData, tiposData ] = await Promise.all([
                getRutinas(),
                getEjercicios(),
                getTipos()
            ]);

            // hacer el mapeo para traernos el nombre en lugar del ID
            const rutinasNombre = rutinasData.map((rutina: any) => {
                const ejercicio = ejerciciosData.find((ej: any) => ej.id === rutina.ejercicio);
                // Obtener el tipo desde el ejercicio, no desde la rutina
                const tipoId = ejercicio?.tipo || rutina.tipo;
                const tipo = tiposData.find((tip: any) => tip.id === tipoId);

                return {
                    ...rutina,
                    ejercicioNombre: ejercicio?.ejercicio || "ejercicio no encontrado",
                    tipoGrupo: tipo?.grupo || "Grupo no encontrado"
                };
            });

            // Agrupar rutinas por nombre
            const rutinasAgrupadas = rutinasNombre.reduce((acc: any[], rutina: any) => {
                const existente = acc.find(r => r.nombre === rutina.nombre);
                if (existente) { // false en la primera vuelta
                    existente.ejercicios.push({
                        id: rutina.id,
                        ejercicioId: rutina.ejercicio,
                        ejercicioNombre: rutina.ejercicioNombre,
                        tipo: rutina.tipo,
                        tipoGrupo: rutina.tipoGrupo
                    });
                } else {
                    acc.push({ // añade el nombre de la rutina al array acc
                        nombre: rutina.nombre,
                        ejercicios: [{
                            id: rutina.id,
                            ejercicioId: rutina.ejercicio,
                            ejercicioNombre: rutina.ejercicioNombre,
                            tipo: rutina.tipo,
                            tipoGrupo: rutina.tipoGrupo
                        }]
                    });
                }
                return acc;
            }, []);

            setRutinas(rutinasAgrupadas);
            setEjercicios(ejerciciosData);
            setTipos(tiposData);

        } catch (error){
            console.error("error al cargar rutinas: ", error);
            Alert.alert("Error", "Error al cargar las rutinas");
        } finally {
            setLoading(false);
        }
    };

    // seleccionar/deseleccionar ejercicios
    const toggleEjercicio = (ejercicioId: string) => {
        if (ejerciciosSeleccionados.includes(ejercicioId)) {
            setEjerciciosSeleccionados(ejerciciosSeleccionados.filter(id => id !== ejercicioId));
        } else {
            setEjerciciosSeleccionados([...ejerciciosSeleccionados, ejercicioId]);
        }
    };

    // Crear rutina
    const handleCrearRutina = async () => {
        if (!nombreRutina.trim()) {
            Alert.alert("Validación", "Debes dar un nombre a la rutina");
            return;
        }

        if (ejerciciosSeleccionados.length === 0) {
            Alert.alert("Validación", "Debes seleccionar al menos un ejercicio");
            return;
        }

        try {
            setCreando(true);

            // recorre los ejercicios seleccionados y crea una fila en rutinas por cada uno
            for (const ejercicioId of ejerciciosSeleccionados) {
                const ejercicio = ejercicios.find(ej => ej.id === ejercicioId);
                if (ejercicio) {
                    await postRutinas(nombreRutina, ejercicio.tipo, ejercicioId);
                }
            }

            setEjerciciosSeleccionados([]);
            setNombreRutina('');
            setFormulario(false);

            await cargarRutinas();
            Alert.alert("Éxito", "Rutina creada con éxito");
        } catch (error) {
            console.error("Error al crear rutina: ", error);
            Alert.alert("Error", "Error al crear rutina");
        } finally {
            setCreando(false);
        }
    };

    // seleccionar/deseleccionar dentro de la edición
    const toggleEjercicioEdicion = (ejercicioId: string) => {
        if (ejerciciosEditados.includes(ejercicioId)) {
            setEjerciciosEditados(ejerciciosEditados.filter(id => id !== ejercicioId));
        } else {
            setEjerciciosEditados([...ejerciciosEditados, ejercicioId]);
        }
    };

    // edición de rutina
    const handleIniciarEdicion = (nombreRutina: string, ejerciciosRutina: any[]) => {
        setEditandoRutina(nombreRutina);
        setNombreEditado(nombreRutina);
        // wxtraer los IDs de los ejercicios actuales
        setEjerciciosEditados(ejerciciosRutina.map(ej => ej.ejercicioId));
    };

    // Guardar 
    const handleGuardarEdicion = async(nombreOriginal: string, ejerciciosOriginales: any[]) => {
        if (!nombreEditado.trim()) {
            Alert.alert("Validación", "Debes dar un nombre a la rutina");
            return;
        }

        if (ejerciciosEditados.length === 0) {
            Alert.alert("Validación", "Debes seleccionar al menos un ejercicio");
            return;
        }

        try{
            // eliminar todos los ejercicios de la rutina original
            for (const ejercicio of ejerciciosOriginales) {
                await deleteRutina(ejercicio.id);
            }

            // crear nuevas filas con el nombre actualizado y ejercicios seleccionados (aunque los ejercicios sean los mismos, ya que se borraron en el bloque anterior)
            for (const ejercicioId of ejerciciosEditados) {
                const ejercicio = ejercicios.find(ej => ej.id === ejercicioId);
                if (ejercicio) {
                    await postRutinas(nombreEditado, ejercicio.tipo, ejercicioId);
                }
            }

            // Limpiar estado de edición
            setEditandoRutina(null);
            setNombreEditado('');
            setEjerciciosEditados([]);

            await cargarRutinas();
            Alert.alert("Éxito", "Rutina actualizada con éxito!");
        } catch (error) {
            console.error("error al editar la rutina: ", error);
            Alert.alert("Error", "Error al editar la rutina");
        }
    };

    // cancelar la edición
    const cancelarEdicion = () => {
        setEditandoRutina(null);
        setNombreEditado('');
        setEjerciciosEditados([]);
    };

    // eliminar rutina completa (todos los ejercicios)
    const handleEliminarRutina = (nombreRutina: string, ejercicios: any[]) => {
        Alert.alert(
            "Eliminar Rutina",
            `¿Deseas eliminar toda la rutina "${nombreRutina}" con ${ejercicios.length} ejercicio(s)?`,
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
                            // Eliminar todos los ejercicios de esta rutina
                            for (const ejercicio of ejercicios) {
                                await deleteRutina(ejercicio.id);
                            }
                            await cargarRutinas();
                            Alert.alert("Éxito", "Rutina eliminada con éxito");
                        } catch (error) {
                            console.error("Error eliminando rutina: ", error);
                            Alert.alert("Error", "Error al eliminar rutina");
                        }
                    }
                }
            ]
        );
    }; 

    // indicador de carga en lo que se obtienen las rutinas
    if(loading){
        return(
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff0000" />
                    <Text style={styles.loadingText}>Cargando rutinas...</Text>
                </View>
            </View>
        );
    }

    // renderizar las rutinas
    const renderRutina = ({item}: {item: any}) => {
        // Si esta rutina está en modo edición
        if(editandoRutina === item.nombre){
            return(
                <View style={styles.rutinaCard}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        <Text style={styles.formularioTitulo}>Editando Rutina</Text>

                        <Text style={styles.label}>Nombre de la rutina: </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la rutina"
                            value={nombreEditado}
                            onChangeText={setNombreEditado}
                            placeholderTextColor="#999"
                        />

                        <Text style={styles.label}>Ejercicios ({ejerciciosEditados.length} seleccionados): </Text>
                        <View style={styles.ejerciciosContainer}>
                            {ejercicios.map((ejercicio) => (
                                <TouchableOpacity
                                    key={ejercicio.id}
                                    style={[styles.ejercicioBoton, ejerciciosEditados.includes(ejercicio.id) && styles.ejercicioBotonSeleccionado]}
                                    onPress={() => toggleEjercicioEdicion(ejercicio.id)}
                                >
                                    <Text style={[styles.ejercicioBotonTexto, ejerciciosEditados.includes(ejercicio.id) && styles.ejercicioBotonTextoSeleccionado]}>
                                        {ejercicio.ejercicio}
                                    </Text>
                                    <Text style={[styles.ejercicioBotonSubtexto, ejerciciosEditados.includes(ejercicio.id) && styles.ejercicioBotonSubtextoSeleccionado]}>
                                        {ejercicio.tipo}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.botonesEdicionContainer}>
                            <TouchableOpacity style={styles.botonCancelar} onPress={cancelarEdicion}>
                                <Text style={styles.botonTextoBlanco}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botonGuardar} onPress={() => handleGuardarEdicion(item.nombre, item.ejercicios)}>
                                <Text style={styles.botonTextoBlanco}>Guardar Cambios</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            );
        }

        // Vista normal de la rutina
        return(
            <View style={styles.rutinaCard}>
                <View style={styles.rutinaHeader}>
                    <Text style={styles.rutinaNombre}>{item.nombre}</Text>
                    <Text style={styles.rutinaContador}>{item.ejercicios.length} ejercicio(s)</Text>
                </View>

                <View style={styles.ejerciciosList}>
                    {item.ejercicios.map((ejercicio: any) => (
                        <View style={styles.ejercicioItem} key={ejercicio.id}>
                            <Text style={styles.ejercicioNombre}>{ejercicio.ejercicioNombre}</Text>
                            <Text style={styles.ejercicioTipo}>Grupo: {ejercicio.tipoGrupo}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.botonesRutinaContainer}>
                    <TouchableOpacity
                        style={styles.botonEditarRutina}
                        onPress={() => handleIniciarEdicion(item.nombre, item.ejercicios)}>
                        <Text style={styles.botonTextoBlanco}>Editar Rutina</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.botonEliminarRutina}
                        onPress={() => handleEliminarRutina(item.nombre, item.ejercicios)}>
                        <Text style={styles.botonTextoBlanco}>Eliminar Rutina</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return(
        <View style={styles.container}>
            <FlatList
                data={rutinas}
                renderItem={renderRutina}
                keyExtractor={(item) => item.nombre}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Mis rutinas</Text>

                        <TouchableOpacity style={styles.botonNuevo} onPress={() => setFormulario(!formulario)}>
                            <Text style={styles.botonNuevoTexto}>
                                {formulario ? 'Cancelar' : 'Añadir'}
                            </Text>
                        </TouchableOpacity>

                        {formulario && (
                            <View style={styles.formulario}>
                                <Text style={styles.formularioTitulo}>Crear Rutina</Text>

                                <Text style={styles.label}>Nombre de la rutina: </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Rutina de Pierna"
                                    value={nombreRutina}
                                    onChangeText={setNombreRutina}
                                    placeholderTextColor="#999"
                                />

                                <Text style={styles.label}>Seleccionar Ejercicios ({ejerciciosSeleccionados.length} seleccionados): </Text>
                                <View style={styles.ejerciciosContainer}>
                                    {ejercicios.length === 0 ? (
                                        <Text style={styles.sinEjercicios}>No hay ejercicios disponibles</Text>
                                    ) : (
                                        ejercicios.map((ejercicio) => (
                                            <TouchableOpacity
                                                key={ejercicio.id}
                                                style={[styles.ejercicioBoton, ejerciciosSeleccionados.includes(ejercicio.id) && styles.ejercicioBotonSeleccionado]}
                                                onPress={() => toggleEjercicio(ejercicio.id)}
                                            >
                                                <Text style={[styles.ejercicioBotonTexto, ejerciciosSeleccionados.includes(ejercicio.id) && styles.ejercicioBotonTextoSeleccionado]}>
                                                    {ejercicio.ejercicio}
                                                </Text>
                                                <Text style={[styles.ejercicioBotonSubtexto, ejerciciosSeleccionados.includes(ejercicio.id) && styles.ejercicioBotonSubtextoSeleccionado]}>
                                                    {ejercicio.tipo}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.botonCrear}
                                    onPress={handleCrearRutina}
                                    disabled={creando || ejercicios.length === 0}
                                >
                                    {creando ? (
                                        <ActivityIndicator color='#fff' />
                                    ) : (
                                        <Text style={styles.botonCrearTexto}>Crear Rutina</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !formulario ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No hay rutinas disponibles</Text>
                            <Text style={styles.emptySubtext}>Crea tu primera rutina!</Text>
                        </View>
                    ) : null
                }
            />
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
    rutinaCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#ff0000',
    },
    rutinaHeader: {
        marginBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#ff0000',
        paddingBottom: 12,
    },
    rutinaNombre: {
        fontSize: 24,
        color: '#1a1a1a',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    rutinaContador: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    ejerciciosList: {
        marginBottom: 12,
    },
    ejercicioItem: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    ejercicioInfo: {
        marginBottom: 8,
    },
    ejercicioNombre: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    ejercicioTipo: {
        fontSize: 14,
        color: '#ff0000',
        fontWeight: '600',
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
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ff0000',
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1a1a1a',
        marginBottom: 16,
    },
    ejerciciosContainer: {
        marginBottom: 16,
    },
    ejercicioBoton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ff0000',
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    ejercicioBotonSeleccionado: {
        backgroundColor: '#ff0000',
    },
    ejercicioBotonTexto: {
        color: '#1a1a1a',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    ejercicioBotonTextoSeleccionado: {
        color: '#fff',
    },
    ejercicioBotonSubtexto: {
        color: '#666',
        fontSize: 14,
    },
    ejercicioBotonSubtextoSeleccionado: {
        color: '#ffcccc',
    },
    sinEjercicios: {
        color: '#666',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
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
    },
    botonEliminar: {
        flex: 1,
        backgroundColor: '#ff0000',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonTexto: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    botonEditarPeq: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginRight: 8,
    },
    botonEliminarPeq: {
        flex: 1,
        backgroundColor: '#ff0000',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    botonesRutinaContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    botonEditarRutina: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonEliminarRutina: {
        flex: 1,
        backgroundColor: '#cc0000',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
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