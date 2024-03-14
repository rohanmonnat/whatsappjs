import { EventEmitter } from 'node:events';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { INotification, Webhook as Wh } from './types';
import { isFunction } from './utils';
import { WebhookError } from './error';

interface Handler {
  (payload: INotification): Promise<void>;
}

export class Webhook extends EventEmitter {
  private readonly verifyToken: string;
  private readonly autoRequestHandling: boolean;
  private readonly handler: Router;
  private reactionHandler: Handler | undefined;
  private stickerHandler: Handler | undefined;
  private imageHandler: Handler | undefined;
  private locationHandler: Handler | undefined;
  private textHandler: Handler | undefined;
  private handlers: Record<string, Handler | undefined> = {};

  constructor({ verifyToken, autoRequestHandling = true }: Wh.IWebhookOptions) {
    super({ captureRejections: true });
    this.verifyToken = verifyToken;
    this.autoRequestHandling = autoRequestHandling;
    this.handler = Router();
    this.handler.route('/').get(this.getHandler).post(this.postHandler);

    this.on('error', (error) => {
      console.error(error);
    });

    // this.on('hook-text', this.asyncErrorWrapper(this.textHandler ?? this.defaultMessageHandler));
    // this.on('hook-reaction', this.asyncErrorWrapper(this.reactionHandler ?? this.defaultMessageHandler));
    // this.on('hook-location', this.asyncErrorWrapper(this.locationHandler ?? this.defaultMessageHandler));
    // this.on('hook-sticker', this.asyncErrorWrapper(this.stickerHandler ?? this.defaultMessageHandler));
    // this.on('hook-image', this.asyncErrorWrapper(this.imageHandler ?? this.defaultMessageHandler));
    // this.setupDefaultHandlers();
  }

  private setupDefaultHandlers = () => {
    const handlers = ['text', 'reaction', 'sticker', 'image', 'location'];
    handlers.forEach((eventName) => {
      const hook = `hook-${eventName}`;
      this.on(hook, this.asyncErrorWrapper(this.handlers[hook] ?? this.defaultHandler));
    });
  };

  private defaultHandler: Handler = async (payload) => {
    return;
  };

  private asyncErrorWrapper = (fn: Handler) => {
    return async (req: Request, res: Response, payload: INotification) => {
      try {
        await fn(payload);
        if (!res.headersSent) {
          res.sendStatus(200);
        }
      } catch (e) {
        this.emit('error', e);
        if (!res.headersSent) {
          res.sendStatus(200);
        }
      }
    };
  };

  private orchestrateEvent = (event: string, payload: INotification | Error, req: Request, res: Response) => {
    if (this.autoRequestHandling) {
      this.emit(event, payload);
      return;
    }

    this.emit(event, payload, req, res);
  };

  private getHandler = async (req: Request, res: Response) => {
    const { 'hub.mode': mode, 'hub.verify_token': verifyToken, 'hub.challenge': challenge } = req.query;

    if (!(mode && verifyToken && challenge)) {
      res.sendStatus(403);
      return;
    }

    if (mode === 'subscribe' && verifyToken === this.verifyToken) {
      res.send(challenge);
    } else {
      res.sendStatus(403);
    }
  };

  private postHandler = async (req: Request, res: Response) => {
    try {
      const payload = req?.body as INotification;
      if (!payload) {
        this.orchestrateEvent(
          'error',
          new WebhookError(`Invalid payload for webhook event\n${JSON.stringify(payload)}`, payload),
          req,
          res
        );
        if (this.autoRequestHandling) {
          res.sendStatus(500);
          return;
        }
      }

      this.orchestrateEvent('payload', payload, req, res);
      const changes = getChanges(payload);
      if (changes) {
        const value = getValue(payload);

        if (value.messages) {
          const message = value.messages[0] as any;

          this.emit('message', payload);
          if (message.type === 'text' || message.text) {
            this.orchestrateEvent('text', payload, req, res);
          } else if (message.type === 'sticker' || message.sticker) {
            this.orchestrateEvent('sticker', payload, req, res);
          }

          if (this.autoRequestHandling && !res.headersSent) {
            res.sendStatus(200);
          }

          return;
        }
      }

      if (this.autoRequestHandling && !res.headersSent) {
        res.sendStatus(400);
      }
    } catch (e) {
      this.emit('error', e);
      if (this.autoRequestHandling && !res.headersSent) {
        res.sendStatus(500);
      }
    }
  };

  private validateCallbackFunction = (fn: any) => {
    if (!isFunction(fn)) {
      throw new Error(`invalid type ${typeof fn}, for callback function`);
    }
  };

  public Handler = () => this.handler;
}

export const intializeWebhook = (options: Wh.IWebhookOptions) => {
  const webhook = new Webhook(options);
  return webhook;
};

export const getChanges = (payload: INotification) => {
  return payload?.entry?.[0].changes;
};

export const getValue = (payload: INotification) => {
  return getChanges(payload)?.[0]?.value;
};

export const getMetadata = (payload: INotification) => {
  return getValue(payload)?.metadata;
};

export const getContacts = (payload: INotification) => {
  return (getValue(payload) as any)?.contacts?.[0];
};

export const getMessages = (payload: INotification) => {
  return getValue(payload)?.messages?.[0];
};

export const getText = (payload: INotification): string => {
  return (getMessages(payload) as any)?.text;
};

export const getReaction = (payload: INotification) => {
  return (getMessages(payload) as any)?.reaction;
};

export const getLocation = (payload: INotification) => {};
