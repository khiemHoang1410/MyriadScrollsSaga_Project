// server/src/config/logger.ts
import pino from 'pino';
import pinoHttp from 'pino-http';

const loggerOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info', // Mặc định là info, có thể set qua biến môi trường
};

if (process.env.NODE_ENV === 'development') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,       // <<< Màu mè cho dễ nhìn
      translateTime: 'SYS:standard', // <<< Định dạng thời gian dễ đọc
      ignore: 'pid,hostname', // <<< Bỏ qua các trường không cần thiết khi dev
      // Thêm các tùy chọn khác của pino-pretty nếu muốn
      // messageFormat: '{levelLabel} - {pid} - foo {msg}', // Tùy chỉnh format message
      // errorLikeObjectKeys: ['err', 'error'], // Để format stack trace của lỗi đẹp hơn
      // singleLine: true, // Log mỗi dòng trên một hàng (có thể làm mất một số định dạng đẹp)
    },
  };
}
const logger = pino(loggerOptions);

// Middleware để log HTTP requests
export const httpLogger = pinoHttp({
  logger,
  // Tùy chỉnh format log nếu muốn
  // customLogLevel: function (req, res, err) { ... }
  // customSuccessMessage: function (req, res) { ... }
  // customErrorMessage: function (req, res, err) { ... }
});

export default logger;