import { CONFIG } from "../enviroment";

const URL = `${CONFIG.endpoint}/databases/${CONFIG.databaseId}/collections/${CONFIG.collections.rutinas}/documents`;

// Definición de métodos GET, POST, PUT y DELETE

// GET
export async function getRutinas(){
    const response = await fetch(URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
    });

    if(!response.ok){
        throw new Error("Error al obtener rutinas");
    }

    const data = await response.json();

    // Mapeo del data.documents que nos devuelve appwrite
    return (data.documents || []).map((doc: any) => ({
        id: doc.$id,
        nombre: doc.nombre,
        tipo: doc.tipo,
        ejercicio: doc.ejercicio,
    }));
}

// POST
export async function postRutinas(nombre: string, tipo: string, ejercicio: string){
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
        body: JSON.stringify({
            documentId: 'unique()', // IDs únicos
            data: {
                nombre: nombre,
                tipo: tipo,
                ejercicio: ejercicio
            },
        }),
    });

    if(!response.ok){
        throw new Error("Error al crear rutinas");
    }

    const data = await response.json();
    return{
        id: data.$id,
        nombre: data.nombre,
        tipo: data.tipo,
        ejercicio: data.ejercicio
    };
}

// PUT
export async function putRutina(id: string, nombre: string, tipo: string, ejercicio: string){
    const response = await fetch(`${URL}/${id}`, {
        method: 'PATCH', // cosas de appwrite que no usa PUT
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
        body: JSON.stringify({
            data: {
                nombre: nombre,
                tipo: tipo,
                ejercicio: ejercicio,
            },
        }),
    });

    if(!response.ok){
        throw new Error("Error al modificar rutinas");
    }

    return await response.json();
}

// DELETE
export async function deleteRutina(id: string){
    const response = await fetch(`${URL}/${id}`,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
    });

    if(!response.ok){
        throw new Error("Error al eliminar rutina");
    }
    return;
}