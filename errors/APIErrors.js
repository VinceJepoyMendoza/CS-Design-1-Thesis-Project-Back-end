class APIError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }

  static badRequest(msg) {
    return new APIError(400, msg);
  }

  static notFound(msg) {
    return new APIError(404, msg);
  }

  static forbiddden(msg) {
    return new APIError(403, msg);
  }

  static unauthorized(msg) {
    return new APIError(401, msg);
  }

  static internal(msg) {
    return new APIError(500, msg);
  }
}

export default APIError;
