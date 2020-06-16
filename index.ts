import ServerClass from "./classes/server.class";
import logger from "./startup/logger.startup";



const server = ServerClass.instance;


// Inicializar Rutas y Middlewares
require('./startup/routes.startup')(server);
require('./startup/db.startup')();



server.start( () => {
   logger.info(`Server running on port ${ server.port }`);
});
