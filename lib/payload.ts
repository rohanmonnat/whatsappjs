import { WebhookNotificationObject } from "./types";

class Payload {
    private readonly payload: WebhookNotificationObject;

    constructor(payload: WebhookNotificationObject) {
        this.payload = payload;
    }

    get raw() {
        return this.payload;
    }

    get entry() {
        return this.payload?.entry?.[0];
    }

    get changes() {
        return this.entry?.changes?.[0];
    }

    get value() {
        return this.changes?.value;
    }

    get contacts() {
        return this.value?.contacts;
    }

    get statuses() {
        return this.value?.statuses;
    }

    get errors() {
        return this.value?.errors;
    }

    get type() {
        if (this.message) return "message";
        else if (this.status) return "status";
        else if (this.error) return "errors";
        return null;
    }

    get status() {
        return this.statuses?.[0];
    }

    get status_type() {
        return this.status?.status;
    }

    get recipient_id() {
        return this.status?.recipient_id;
    }

    get contact() {
        return this.contacts?.[0];
    }

    get error() {
        return this.errors?.[0];
    }

    get messages() {
        return this.value?.messages;
    }

    get message() {
        return this.messages?.[0];
    }

    get from() {
        return this.message?.from;
    }

    get id() {
        switch (this.type) {
            case "message":
                return this.message?.id;

            case "status":
                return this.status?.id;

            default:
                return;
        }
    }

    get timestamp() {
        switch (this.type) {
            case "message":
                return this.message?.timestamp;

            case "status":
                return this.status?.timestamp;

            default:
                return;
        }
    }

    get message_type() {
        const type = this.message?.type;

        if (type) return type;
        if (this.audio) return "audio";
        if (this.button) return "button";
        if (this.contacts) return "contacts";
        if (this.document) return "document";
        if (this.image) return "image";
        if (this.interactive) return "interactive";
        if (this.location) return "location";
        if (this.order) return "order";
        if (this.reaction) return "reaction";
        if (this.sticker) return "sticker";
        if (this.system) return "system";
        if (this.text) return "text";
        if (this.video) return "video";
        // It should never happen for genuine payloads.
        return null;
    }

    get audio() {
        return this.message?.audio;
    }

    get button() {
        return this.message?.button;
    }

    get context() {
        return this.message?.context;
    }

    get document() {
        return this.message?.document;
    }

    get identity() {
        return this.message?.identity;
    }

    get image() {
        return this.message?.image;
    }

    get interactive() {
        return this.message?.interactive;
    }

    get interactive_type() {
        return this.interactive?.type;
    }

    get location() {
        return this.message?.location;
    }

    get messageContacts() {
        return this.message?.contacts;
    }

    get order() {
        return this.message?.order;
    }

    get referral() {
        return this.message?.referral;
    }

    get reaction() {
        return this.message?.reaction;
    }

    get sticker() {
        return this.message?.sticker;
    }

    get system() {
        return this.message?.system;
    }

    get text() {
        return this.message?.text;
    }

    get video() {
        return this.message?.video;
    }

    get message_errors() {
        return this.message?.errors;
    }

    get message_error() {
        return this.message_errors?.[0];
    }

    get statuses_errors() {
        return this.status?.errors;
    }
}

export default Payload;
