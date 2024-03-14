export interface IMessage {
  messaging_product: string;
  to: string;
  recipient_type?: string;
}

export interface IText extends IMessage {
  type: 'text';
  text: { preview_url: boolean; body: string };
}

export interface IReaction extends IMessage {
  type: 'reaction';
  reaction: { message_id: string; emoji: string };
}

export interface ILocation extends IMessage {
  type: 'location';
  location: {
    longitude: string;
    latitude: string;
    name: string;
    address: string;
  };
}

export interface ISticker extends IMessage {
  type: 'sticker';
  sticker: { link: string } | { id: string };
}

export interface IImage extends IMessage {
  type: 'image';
  image:
    | {
        id: string;
        caption?: string;
      }
    | { link: string; caption?: string };
}

export interface IAudio extends IMessage {
  type: 'audio';
  audio: { link: string } | { id: string };
}

export interface IVideo extends IMessage {
  type: 'video';
  video: { link: string } | { id: string };
}

export interface IDocument extends IMessage {
  type: 'document';
  document: { link: string; caption?: string; filename: string } | { id: string; caption?: string; filename: string };
}

export interface ITemplate extends IMessage {
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: Record<any, any>;
  };
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  country_code: string;
  type: string;
}

export interface IContact {
  addresses: IAddress[];
}

export interface IContacts extends IMessage {
  type: 'contacts';
  contacts: IContact[];
}

export interface IMarkRead {
  messaging_product: string;
  status: 'read';
  message_id: string;
}

export interface IReplyToMessage extends IText {
  context: { message_id: string };
}
