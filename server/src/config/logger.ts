// server/src/config/logger.ts
import pino from 'pino';
import pinoHttp from 'pino-http';

const loggerName = 'MyriadScrollsSaga'; // Đặt tên cho logger của mình

const loggerOptions: pino.LoggerOptions = {
  name: loggerName, // Sử dụng tên đã đặt
  level: process.env.LOG_LEVEL || 'debug',
};

if (process.env.NODE_ENV === 'development') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard', // Định dạng thời gian cho dễ đọc, ví dụ: 15:30:45
      ignore: 'pid,hostname',    // Bỏ qua pid và hostname cho gọn, vì pino-pretty thường đã có cách hiển thị riêng
                                  // Nếu bro vẫn muốn thấy 'name' (MyriadScrollsSaga) trong phần (name/pid on hostname) của pino-pretty
                                  // thì có thể bỏ 'name' ra khỏi ignore, hoặc thêm 'name' vào đây nếu pino-pretty không tự lấy.
                                  // Mặc định, pino-pretty sẽ cố gắng hiển thị name nếu có.
      // KHÔNG dùng messageFormat ở đây cho pino-pretty nữa.
      // Hãy để pino-pretty tự xử lý log thường (non-HTTP).
      // Nó thường có định dạng đẹp sẵn kiểu: [TIME] LEVEL (tên_logger): Message
      // Ví dụ: [21:08:00] INFO (MyriadScrollsSaga): Server started...
      messageKey: 'msg', // Đảm bảo pino-pretty biết key chứa message chính là 'msg' (thường là mặc định)
    },
  };
}

const logger = pino(loggerOptions);

export const httpLogger = pinoHttp({
  logger, // Sử dụng logger pino đã được cấu hình ở trên
  // Có thể đặt tên riêng cho HTTP logger nếu muốn phân biệt rõ hơn trong một số trường hợp
  // name: `${loggerName}-HTTP`,

  serializers: {
    req: (req) => {
      // Log những thông tin cần thiết của request
      return {
        id: req.id, // id của request (pino-http tự tạo)
        method: req.method,
        url: req.url,
        // headers: req.headers, // Bỏ comment nếu muốn log cả headers, nhưng sẽ khá dài
        remoteAddress: req.remoteAddress, // IP người dùng
      };
    },
    res: (res) => ({
      statusCode: res.statusCode,
      // headers: res.getHeaders(), // Bỏ comment nếu muốn log response headers
    }),
    err: pino.stdSerializers.err, // Serializer chuẩn cho lỗi
  },

  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn'; // Lỗi client
    if (res.statusCode >= 500 || err) return 'error'; // Lỗi server
    if (res.statusCode >= 300 && res.statusCode < 400) return 'silent'; // Redirects thì không cần log ồn ào
    return 'info'; // Log bình thường cho request thành công
  },

  // customSuccessMessage và customErrorMessage sẽ định dạng cho log HTTP
  // Chúng sử dụng responseTime một cách chính xác
  customSuccessMessage: function (req, res: any) { // dùng `any` để truy cập `responseTime` mà không bị TypeScript phàn nàn
    const { method, url } = req;
    const { statusCode } = res;
    const responseTime = res.responseTime; // pino-http tự thêm cái này
    if (statusCode === 404) {
      return `=> ${method} ${url} -->  ${statusCode} Not Found (${responseTime} ms)`;
    }
    return `=> ${method} ${url} -->  ${statusCode} (${responseTime} ms)`;
  },
  customErrorMessage: function (req, res: any, err: Error) {
    const { method, url } = req;
    const { statusCode } = res;
    const responseTime = res.responseTime;
    return `=> ${method} ${url} -->  ${statusCode} (${responseTime} ms) - Error: ${err.message}`;
  },
  // Để làm cho log HTTP có ID request thống nhất với log thường (nếu cần)
  // genReqId: function (req, res) {
  //   const existingID = req.id ?? req.headers["x-request-id"];
  //   if (existingID) return existingID;
  //   const id = crypto.randomUUID(); // Cần import crypto
  //   res.setHeader('X-Request-Id', id);
  //   return id;
  // }
});

export default logger;