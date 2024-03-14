export type Timestamp = number;
enum MessageType {
  text,
  reaction,
  sticker,
  location,
  image,
  audio,
  video,
  document,
  contacts,
  system,
}

export interface INotification {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: IMessage | ISystemMessage;
      field: 'messages';
    }>;
  }>;
}

interface IValueBase {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
}

interface IContactsBase {
  contacts: Array<{
    profile: {
      name: string;
    };
    wa_id: string;
  }>;
}

interface IMessageBase {
  messages: Array<IText | IReaction | ISticker | IImage | ILocation>;
}

interface IMessage extends IMessageBase, IContactsBase, IValueBase {}
interface ISystemMessage extends IValueBase {
  messages: Array<INumberChange>;
}

interface IBaseMessage {
  from: string;
  id: string;
  timestamp: Timestamp;
}

interface IText extends IBaseMessage {
  text: {
    body: string;
  };
  type: 'text';
}

interface IReaction extends IBaseMessage {
  reaction: {
    message_id: string;
    emoji: string;
  };
  type: MessageType.reaction;
}

interface ISticker extends IBaseMessage {
  sticker: {
    mime_type: string;
    sha256: string;
    id: string;
  };
  type: 'sticker';
}

interface IImage extends IBaseMessage {
  image: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  type: MessageType.image;
}

interface ILocation extends IBaseMessage {
  location: {
    latitude: string;
    longitude: string;
    name: string;
    address: string;
  };
  type: MessageType.location;
}

interface INumberChange extends IBaseMessage {
  system: {
    body: string;
    new_wa_id: string;
  };
  type: MessageType.system;
}

export namespace Webhook {
  export interface IWebhookOptions {
    verifyToken: string;
    autoRequestHandling?: boolean;
  }
}
