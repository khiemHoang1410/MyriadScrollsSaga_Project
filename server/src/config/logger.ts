// server/src/config/logger.ts
import pino from 'pino';
import pinoHttp from 'pino-http';

const loggerOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
};

if (process.env.NODE_ENV === 'development') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname,req.headers,res.headers', // Bỏ bớt headers cho gọn khi dev
      messageFormat: '{levelLabel} {req.method} {req.url} {res.statusCode} - {responseTime}ms {msg}', // Format custom
    },
  };
}

const logger = pino(loggerOptions);

export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => {
      if (process.env.NODE_ENV === 'development') {
        return {
          method: req.method,
          url: req.url,
          remoteAddress: req.socket.remoteAddress, // Lấy IP từ socket
        };
      }
      return { method: req.method, url: req.url };
    },
    res: (res) => ({ statusCode: res.statusCode }),
    err: pino.stdSerializers.err,
  },
  customSuccessMessage: function (req, res:any) {
    if (res.statusCode === 404) {
      return `${req.method} ${req.url} --> ${res.statusCode} Not Found`;
    }
    return `${req.method} ${req.url} --> ${res.statusCode} (${res.responseTime}ms)`;
  },
  customErrorMessage: function (req, res, err) {
    return `${req.method} ${req.url} <-- ERROR ${res.statusCode} (${res.responseTime}ms) - ${err.message}`;
  },
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 300 && res.statusCode < 400) return 'silent';
    return 'info';
  },
});

export default logger;