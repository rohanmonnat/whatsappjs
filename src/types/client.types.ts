export interface IWhatsappClient {
  authToken: string;
  phoneNumberId: string;
  version: 'v15.0' | 'v16.0' | 'v17.0';
}

export interface IRecipient {
  recipientId: string;
  recipientType?: string;
}

export interface IText {
  text: string;
  previewUrl?: boolean;
}

export interface IReaction {
  emoji: string;
  messageId: string;
}

export interface ILocation {
  latitude: string;
  longitude: string;
  name: string;
  address: string;
}

export interface ISticker {
  sticker: string;
  link: boolean;
}

export interface IImage {
  image: string;
  link: boolean;
  caption?: string;
}

export interface IAudio {
  audio: string;
  link: boolean;
}

export interface IVideo {
  video: string;
  link: string;
}

export interface IDocument {
  document: string;
  filename: string;
  link: boolean;
  caption?: string;
}

export interface IContacts {
  contacts: {
    addresses: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      country_code: string;
      type: string;
    }[];
  }[];
}

export interface ITemplate {
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: Record<any, any>;
  };
}

export interface IReplyToMessage extends IText {
  messageId: string;
}

export type SendPayload<T> = (options: T) => Promise<Response>;

export type SendText = SendPayload<IRecipient & IText>;

export type SendReaction = (options: IRecipient & IReaction) => Promise<Response>;

export type SendLocation = (options: IRecipient & ILocation) => Promise<Response>;

export type SendSticker = (options: IRecipient & ISticker) => Promise<Response>;

export type ReplyToMessage = (options: IRecipient & IReplyToMessage) => Promise<Response>;

export type SendImage = (options: IRecipient & IImage) => Promise<Response>;

export type SendAudio = (options: IRecipient & IAudio) => Promise<Response>;

export type SendVideo = (options: IRecipient & IVideo) => Promise<Response>;

export type SendDocument = (options: IRecipient & IDocument) => Promise<Response>;

export type SendContacts = (options: IRecipient & IContacts) => Promise<Response>;

export type SendTemplate = (options: IRecipient & ITemplate) => Promise<Response>;
