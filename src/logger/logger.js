const winston = require('winston');
const path = require('path');

// Definindo formato dos logs
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Criando logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Log no console
        new winston.transports.Console(),

        // Log em arquivo
        new winston.transports.File({ filename: path.join(__dirname, 'logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, 'logs/combined.log') })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: path.join(__dirname, 'logs/exceptions.log') })
    ]
});

module.exports = logger;