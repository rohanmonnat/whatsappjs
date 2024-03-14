import type {
  IMessage,
  ILocation as ILocationPayload,
  IMarkRead,
  IText as ITextPayload,
  IReaction as IReactionPayload,
  ISticker as IStickerPayload,
  IReplyToMessage,
  IImage,
  IAudio,
  IVideo,
  IDocument,
  IContacts,
  ITemplate,
} from './types/payload.types';
import type {
  IWhatsappClient,
  SendText,
  SendReaction,
  SendSticker,
  SendLocation,
  ReplyToMessage,
  SendImage,
  SendAudio,
  SendVideo,
  SendDocument,
  SendContacts,
  SendTemplate,
} from './types/client.types';

export class WhatsappClient {
  private readonly authToken: string;
  private readonly phoneNumberId: string;
  private readonly version: string;
  private readonly baseUrl: string;
  private readonly url: string;
  private readonly headers: { 'Content-Type': string; Authorization: string };

  constructor(config: IWhatsappClient) {
    this.authToken = config.authToken;
    this.phoneNumberId = config.phoneNumberId;
    this.version = config.version || 'v17.0';
    this.baseUrl = `https://graph.facebook.com/${this.version}/${this.phoneNumberId}`;
    this.url = `${this.baseUrl}/messages`;
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authToken}`,
    };
  }

  private sendPayload = async <T extends IMessage | IMarkRead>(payload: T): Promise<Response> => {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    return response;
  };

  public sendText: SendText = async ({ text, recipientId, recipientType = 'individual', previewUrl = true }) => {
    const payload: ITextPayload = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'text',
      text: { preview_url: previewUrl, body: text },
    };

    const response = await this.sendPayload<ITextPayload>(payload);

    return response;
  };

  public sendReaction: SendReaction = async ({ emoji, messageId, recipientId, recipientType = 'individual' }) => {
    const paylaod: IReactionPayload = {
      messaging_product: 'ISticker',
      recipient_type: recipientType,
      to: recipientId,
      type: 'reaction',
      reaction: {
        message_id: messageId,
        emoji: emoji,
      },
    };

    const response = await this.sendPayload<IReactionPayload>(paylaod);
    return response;
  };

  public sendLocation: SendLocation = async ({
    latitude,
    longitude,
    name,
    address,
    recipientId,
    recipientType = 'individual',
  }) => {
    const payload: ILocationPayload = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'location',
      location: {
        latitude,
        longitude,
        name,
        address,
      },
    };

    const response = await this.sendPayload<ILocationPayload>(payload);

    return response;
  };

  public sendSticker: SendSticker = async ({ sticker, recipientId, recipientType = 'individual', link = true }) => {
    const payload: IStickerPayload = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'sticker',
      sticker: link
        ? {
            link: sticker,
          }
        : {
            id: sticker,
          },
    };

    const response = await this.sendPayload<IStickerPayload>(payload);
    return response;
  };

  public markAsRead = ({ messageId }: { messageId: string }): Promise<Response> => {
    const payload: IMarkRead = {
      messaging_product: 'IText',
      status: 'read',
      message_id: messageId,
    };

    const response = this.sendPayload<IMarkRead>(payload);
    return response;
  };

  public replyToMessage: ReplyToMessage = async ({
    text,
    messageId,
    recipientId,
    recipientType = 'individual',
    previewUrl = false,
  }) => {
    const payload: IReplyToMessage = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'text',
      context: { message_id: messageId },
      text: { preview_url: previewUrl, body: text },
    };

    const response = await this.sendPayload<IReplyToMessage>(payload);
    return response;
  };

  public sendImage: SendImage = async ({ image, caption, recipientId, recipientType = 'individual', link = true }) => {
    const payload: IImage = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'image',
      image: link ? { caption, link: image } : { caption, id: image },
    };

    const response = await this.sendPayload<IImage>(payload);
    return response;
  };

  public sendAudio: SendAudio = async ({ audio, recipientId, recipientType = 'individual', link = true }) => {
    const payload: IAudio = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'audio',
      audio: link ? { link: audio } : { id: audio },
    };

    const response = await this.sendPayload<IAudio>(payload);
    return response;
  };

  public sendVideo: SendVideo = async ({ video, recipientId, recipientType = 'individual', link = true }) => {
    const payload: IVideo = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'video',
      video: link ? { link: video } : { id: video },
    };

    const response = await this.sendPayload<IVideo>(payload);
    return response;
  };

  public sendDocument: SendDocument = async ({
    document,
    caption,
    filename,
    recipientId,
    recipientType = 'individual',
    link = true,
  }) => {
    const payload: IDocument = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'document',
      document: link
        ? {
            link: document,
            caption,
            filename,
          }
        : { id: document, caption, filename },
    };

    const response = await this.sendPayload<IDocument>(payload);
    return response;
  };

  public sendContacts: SendContacts = async ({ contacts, recipientId, recipientType = 'individual' }) => {
    const payload: IContacts = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'contacts',
      contacts,
    };
    const response = await this.sendPayload<IContacts>(payload);
    return response;
  };

  public sendTemplate: SendTemplate = async ({ template, recipientId, recipientType = 'individual' }) => {
    const payload: ITemplate = {
      messaging_product: 'whatsapp',
      recipient_type: recipientType,
      to: recipientId,
      type: 'template',
      template,
    };

    const response = await this.sendPayload<ITemplate>(payload);
    return response;
  };
}

export const initializeClient = (options: IWhatsappClient) => {
  const client = new WhatsappClient(options);
  return client;
};
