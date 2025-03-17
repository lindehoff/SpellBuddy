export class APIError extends Error {
  public statusCode: number;
  public type: string;

  constructor(message: string, statusCode: number = 500, type = 'InternalServerError') {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.type = type;
  }
}

export class ValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, 'ValidationError');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string) {
    super(message, 401, 'AuthenticationError');
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string) {
    super(message, 404, 'NotFoundError');
    this.name = 'NotFoundError';
  }
} 