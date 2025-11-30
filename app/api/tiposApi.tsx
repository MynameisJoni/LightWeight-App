import { CONFIG } from "../enviroment";

const URL = `${CONFIG.endpoint}/databases/${CONFIG.databaseId}/collections/${CONFIG.collections.tipos}/documents`;

// endpoint necesario para el mapeo de los grupos musculares

// GET -> Puesto que la idea es no modificar esta tabla, solo se necesita obtener los grupos musculares
export async function getTipos(){
    const response = await fetch(URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': CONFIG.projectId,
        },
    });

    if(!response.ok){
        throw new Error("Error al obtener tipos");
    }

    const data = await response.json();

    // Mapeo del data.documents que nos devuelve appwrite
    return (data.documents || []).map((doc: any) => ({
        id: doc.$id,
        grupo: doc.grupo,
    }));
}