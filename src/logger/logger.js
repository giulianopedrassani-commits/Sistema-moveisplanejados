const winston = require('winston')
const path = require('path')

const logDir = path.join(__dirname, '../../logs')

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`
})

const logger = winston.createLogger({

  level: 'info',

  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),

  transports: [

    new winston.transports.Console(),

    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })

  ],

  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ]

})

module.exports = logger