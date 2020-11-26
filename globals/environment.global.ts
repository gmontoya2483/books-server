import config from 'config';

export const SERVER_PORT: number = config.get('SERVER_PORT');
export const DB_CONNECTION_URL: string = config.get('DB_CONNECTION_URL');

// LOGGER
export const LOG_FILE: string = config.get('logger.LOG_FILE');
export const LOG_FILE_EXCEPTIONS: string = config.get('logger.LOG_FILE_EXCEPTIONS');
export const LOG_GENERAL_LEVEL: string = config.get('logger.LOG_GENERAL_LEVEL');
export const LOG_FILE_LEVEL: string = config.get('logger.LOG_FILE_LEVEL');
export const LOG_FILE_EXCEPTIONS_LEVEL: string = config.get('logger.LOG_FILE_EXCEPTIONS_LEVEL');


// Json WebToken
export const JWT_PRIVATE_KEY: string = config.get('jwt.JWT_PRIVATE_KEY');
export const JWT_AUTH_EXPIRES_IN: number = config.get('jwt.JWT_AUTH_EXPIRES_IN');  // 3600 Segundos - 4 hs
export const JWT_NOT_EXPIRES_IN: number = config.get('jwt.JWT_NOT_EXPIRES_IN');  // Segundos - 2 días

//Notification
export const NOT_BASE_URL: string = config.get('notification.NOT_BASE_URL');

//SendGrid
export const SEND_GRID_API_KEY: string = config.get('sendGrid.SEND_GRID_API_KEY');
export const SEND_GRID_FROM_EMAIL: string = config.get('sendGrid.SEND_GRID_FROM_EMAIL');

//Uploads
export const IMG_NOT_FOUND_PATH: string = config.get('uploads.IMG_NOT_FOUND_PATH');
export const IMG_USERS_PATH: string = config.get('uploads.IMG_USERS_PATH');

// Pagination
export const DEFAULT_PAGE_SIZE: number = config.get('pagination.DEFAULT_PAGE_SIZE');

// Password passwordComplexityOptions
export const PASSWORD_COMPLEXITY_OPTIONS = config.get('passwordComplexityOptions');



