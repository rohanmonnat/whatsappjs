import { INotification } from './types';

export class WebhookError extends Error {
  readonly payload?: INotification | undefined;
  constructor(message: string, payload?: INotification) {
    super(message);
    this.payload = payload;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, WebhookError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
