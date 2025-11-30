# LightWeight APP
Ahora el que no se pone fuerte es porque no quiere.
![lightweight](./assets/images/light-weight.jpg)

## Índice
- [Descripción de la app](#descripción-de-la-app)
- [API y base de datos](#api-y-base-de-datos)
- [Ficheros utilizados](#ficheros-utilizados)
   - [enviroments.ts](#enviromentsts)
   - [ejerciciosApi.tsx](#ejerciciosapitsx)
      - [GET](#get)
      - [POST](#post)
      - [PATCH](#patch)
      - [DELETE](#delete)
   - [rutinasApi.tsx](#rutinasapitsx)
   - [tiposApi.tsx](#tiposapitsx)
- [Repositorio](#repositorio)

## Descripción de la app
El objetivo de esta aplicación es poder almacenar tantos ejercicios como el usuario desee, clasificandolos según el grupo muscular, para posteriormente poder definir rutinas de entrenamiento en función de los ejercicios creados.

## API y base de datos
Para generar la API y la base de datos se utilizará Appwrite. Se creará un proyecto por defecto 'Appwrite Project' en el que crearemos la base de datos ejercicios:
![database](./assets/images/database.png)
Una vez creada, dentro se podrán definir las tablas que se deseen. En el caso de la app se han creado las siguientes:
- ejercicios: columnas -> ejercicio y tipo (refiriendose al grupo muscular)
- rutinas: columnas -> tipo (grupo muscular), ejercicio y nombre (nombre de la rutina que definirá el usuario)
- tipo: columna -> grupo (grupos musculares)

**Appwrite te genera automáticamente un ID tipo string para cada columna*

![ejemplo de columnas](./assets/images/columnas.png)

**Ejemplo de columnas*

![tabla ejercicios](./assets/images/tabla.png)

**Ejemplo de la tabla ejercicios*

El endpoint por defecto de Appwrite es: https://cloud.appwrite.io/v1

Appwrite también nos proporciona los IDs necesarios que se definirán en *enviroments.ts*

## Ficheros utilizados
Los ficheros empleados para la construcción de la app son los siguientes:
- **enviroments**: aquí se definirán las variables de entorno para poder conectarnos con la API
- **ejerciciosApi, rutinasApi, tiposApi**: en estos ficheros se desarrollarán los métodos necesarios para hacer las llamadas a la API y realizar un CRUD básico
- **index**: en este fichero simplemente se redirecciona al fichero home
- **home**: screen principal de la app
- **_layout**: la navegación de la app se llevará a cabo mediante pestañas en el la zona inferior de la app en lugar de emplear botones
- **ExerciseCard**: componente en el que irá cada ejercicio creado por el usuario
- **BotonImagenCategoria**: simplemente se definen los botones para interactuar con la galería y la cámara
- **exercies**: uno de los ficheros principales en los que se crearán las funciones con los que manejaremos el CRUD y se manejarán las vistas para ver, crear, editar o eliminar ejercicios
- **routines**: otro de los ficheros principales que servirán para el CRUD de las rutinas así como las vistas para ver, crear, editar y eliminar rutinas

Más adelante se desglosará cada uno de estos ficheros.

### enviroments.ts
Aquí se tratarán las variables de entorno para la conexión con la API. La estructura es la siguiente:
```javascript
export const CONFIG = {
    endpoint: "https://cloud.appwrite.io/v1",
    projectId: "el ID que te proporciona Appwrite",
    databaseId: "ID de la base de datos 'ejercicios'",
    collections:{
        ejercicios: "ejercicios", // tabla ejercicios
        rutinas: "rutinas", // tabla rutinas
        tipos: "tipo", // tabla tipos
    }
};
// Importante que los nombres de las tablas sean EXACTAMENTE iguales a los que están en Appwrite
```

### ejerciciosApi.tsx
En este fichero se definirá tanto la ruta de la API relacionada con la tabla *ejercicios* como las funciones con los métodos GET, POST, PATCH y DELETE.

**Parece que a Appwritte no le gusta PUT, por ello se utiliza PATCH*

En primer lugar han de importarse las variables de entorno CONFIG definidas anteriormente y definir la cosntante con la ruta de la API
```javascript
import { CONFIG } from "../enviroment";

const URL = `${CONFIG.endpoint}/databases/${CONFIG.databaseId}/collections/${CONFIG.collections.ejercicios}/documents`;
```

La explicación de la URL es la siguiente:
- Ruta del endpoint
- Le indicamos que vamos a la base de datos (database) y le definimos la id de la que nos interesa (CONFIG.databaseId)
- Le indicamos las tablas (collections) y el id de la tabla ejercicios en este caso (CONFIG.collections.ejercicios)
- Las filas (documents)

#### GET



#### POST



#### PATCH



#### DELETE



### rutinasApi.tsx

### tiposApi.tsx


## Repositorio