import DefineError from './index';

export class UnauthorizedError extends DefineError {
  constructor(message: string) {
    super(message);
    this.name = 'Unauthorized';
    this.statusCode = 401;
  }
}