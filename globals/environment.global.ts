
export const SERVER_PORT: number = Number(process.env.PORT) || 3000;
export const DB_CONNECTION_URL: string = process.env.book_api_db_connection_url || 'mongodb://localhost/books_db'

// LOGGER
export const LOG_FILE: string = process.env.book_api_log_file || 'logs/books_backend.log'
export const LOG_FILE_EXCEPTIONS: string = process.env.book_api_log_file_exceptions || 'logs/books_backend_exceptions.log'
export const LOG_GENERAL_LEVEL: string = process.env.book_api_log_general_level || 'debug'
export const LOG_FILE_LEVEL: string = process.env.book_api_log_file_level || 'warn'
export const LOG_FILE_EXCEPTIONS_LEVEL: string = process.env.book_api_log_file_exceptions_level || 'error'



// Json WebToken
export const JWT_PRIVATE_KEY: string = process.env.book_api_jwtPrivateKey || 'jwtPrivateKey'
export const JWT_AUTH_EXPIRES_IN: number = Number(process.env.book_api_jwtAuthExpiresIn) || 3600;  // 3600 Segundos - 4 hs
// TODO: export const JWT_VAL_EXPIRES_IN: number = Number(process.env.book_api_jwtValExpiresIn) || 172800;  // Segundos - 2 días

