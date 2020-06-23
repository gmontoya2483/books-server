# Books-server

## Recostruir módulos de Node
```
npm install
```

## Generar carpeta de distribución
```
tsc -w
```

## Levantar servidor
```
nodemon dist/
```

ó

```
node dist/
```

## Variables de Entorno

Se debe crear un archivo llamado ``.env`` que debe estar en la raiz del proyecto. El contenido de este archivo debe ser el siguiente:   

```textmate
NODE_ENV=
book_api_port=
book_api_db_connection_url=
book_api_jwtPrivateKey=
book_api_sendGridApiKey=
book_api_sendGridFromEmail=
``` 


#### Logger (winston)
* ``book_api_log_file`` - Ruta del archivo de logs de express (Default: 'logs/books_backend.log')
* ``book_api_log_file_exceptions`` - Ruta del archivo de logs de excepciones (Default: 'logs/books_backend_exceptions.log')
* ``book_api_log_general_level`` - Nivel de general de Errores. Salida por consola (Default: 'debug')
* ``book_api_log_file_level`` - Nivel de Errores que se van a guardar en archivo. (Default: 'warn')
* ``book_api_log_file_exceptions_level`` - - Nivel de Error de excepciones que se van a guardar en archivo de log de excepciones. (Default: 'error')

> **Niveles de error Soportados**
> * ``error: 0``
> * ``warn: 1``
> * ``info: 2``
> * ``http: 3,``
> * ``verbose: 4``
> * ``debug: 5``
> * ``silly: 6``
