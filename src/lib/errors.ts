export class APIError extends Error {
  public status: number;
  public type: string;

  constructor(message: string, status = 500, type = 'InternalServerError') {
    super(message);
    this.name = 'APIError';
    this.status = status;
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