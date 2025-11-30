import { CONFIG } from "../enviroment";

const URL = `${CONFIG.endpoint}/databases/${CONFIG.databaseId}/collections/${CONFIG.collections.ejercicios}/documents`;

// Definición de métodos GET, POST, PUT y DELETE

// GET
export async function getEjercicios(){
    const response = await fetch(URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
    });

    if(!response.ok){
        throw new Error('Error al obtener ejercicios');
    }

    const data = await response.json();

    // Mapeo del data.documents que nos devuelve appwrite
    return (data.documents || []).map((doc: any) => ({
        id: doc.$id,
        ejercicio: doc.ejercicio,
        tipo: doc.tipo,
    }));
}

// POST
export async function postEjercicios(ejercicio: string, tipo: string){
    const response = await fetch(URL,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
        body: JSON.stringify({
            documentId: 'unique()', // IDs únicos
            data: {
                ejercicio: ejercicio,
                tipo: tipo,
            },
        }),
    });

    if(!response.ok){
        throw new Error("Error al crear ejercicio")
    }

    const data = await response.json();
    return {
        id: data.$id,
        ejercicio: data.ejercicio,
        tipo: data.tipo,
    };
}

// PUT
export async function putEjercicios(id: string, ejercicio: string, tipo: string){
    const response = await fetch(`${URL}/${id}`, {
        method: 'PATCH', // cosas de appwrite que no usa PUT
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
        body: JSON.stringify({
            data: {
                ejercicio: ejercicio,
                tipo: tipo
            },
        }),
    });

    if(!response.ok){
        throw new Error("Error al modificar ejercicio");
    }
    return await response.json();
}

// DELETE
export async function deleteEjercicio(id: string){
    const response = await fetch(`${URL}/${id}`,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
    });

    if(!response.ok){
        throw new Error("Error al eliminar ejercicio");
    }
    return;
}

