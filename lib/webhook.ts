import EventEmitter from "events";
import { createHmac } from "crypto";
import {
    WebhookAudioObject,
    WebhookButtonObject,
    WebhookDocumentObject,
    WebhookErrorObject,
    WebhookEventListener,
    WebhookEvents,
    WebhookImageObject,
    WebhookInteractiveObject,
    WebhookLocationObject,
    WebhookMessageContactObject,
    WebhookNotificationObject,
    WebhookOrderObject,
    WebhookReactionObject,
    WebhookStatusObject,
    WebhookStickerObject,
    WebhookSystemObject,
    WebhookTextObject,
    WebhookUnknownObject,
    WebhookUnsupportedObject,
    WebhookVideoObject,
    WhatsappWebhookConfig,
} from "./types";
import Payload from "./payload";

export class WhatsappWebhook extends EventEmitter {
    private readonly verifyToken: string;
    private readonly appSecret: string;

    constructor(config: WhatsappWebhookConfig) {
        super({ captureRejections: config.captureRejections || true });
        this.verifyToken = config.verifyToken;
        this.appSecret = config.appSecret || "";
    }

    public emit<K extends keyof WebhookEvents>(
        event: K,
        ...args: Parameters<WebhookEventListener<WebhookEvents[K], Payload>>
    ): boolean {
        return super.emit(event as string, ...args);
    }

    public on<K extends keyof WebhookEvents>(
        event: K,
        listener: WebhookEventListener<WebhookEvents[K], Payload>
    ): this {
        return super.on(event as string, listener);
    }

    public once<K extends keyof WebhookEvents>(
        event: K,
        listener: WebhookEventListener<WebhookEvents[K], Payload>
    ): this {
        return super.once(event as string, listener);
    }

    /**
     * Verifies the payload. Be careful when when using body parsers, it is recommended to use
     * raw ArrayBuffer to verify payload signature, using parsed payloads can result in incorrect signatures.
     * @param payloadString {string} - The stringified payload.
     * @param expectedSignature {string} - The `X-Hub-Signature-256` header from the request.
     * @returns {boolean} Returns `true` if signature is valid otherwise `false`.
     */
    public verifyPayloadSignature = (payloadString: string, expectedSignature: string): boolean => {
        const encoder = new TextEncoder();
        const data = encoder.encode(payloadString);
        const hmac = createHmac("SHA256", this.appSecret);
        hmac.update(data);
        const actualSignature = hmac.digest("hex");

        return actualSignature === expectedSignature;
    };

    public postHandler = (payloadBufferOrString: ArrayBuffer | string, xHubSignature: string) => {
        let payloadString: string;

        if (typeof payloadBufferOrString === "string") {
            payloadString = payloadBufferOrString;
        } else {
            const decoder = new TextDecoder("utf-8");
            payloadString = decoder.decode(payloadBufferOrString);
        }

        if (this.appSecret && xHubSignature && !this.verifyPayloadSignature(payloadString, xHubSignature)) {
            throw new Error("Invalid payload");
        }

        const parsedPayload: WebhookNotificationObject = JSON.parse(payloadString) as WebhookNotificationObject;

        const payload = new Payload(parsedPayload);

        if (payload.type === "message") {
            const messageType = payload.message_type;

            switch (messageType) {
                case "text":
                    const text = payload.text as WebhookTextObject;
                    this.emit(messageType, text, payload);
                    break;

                case "reaction":
                    const reaction = payload.reaction as WebhookReactionObject;
                    this.emit(messageType, reaction, payload);
                    break;

                case "sticker":
                    const sticker = payload.sticker as WebhookStickerObject;
                    this.emit(messageType, sticker, payload);
                    break;

                case "audio":
                    const audio = payload.audio as WebhookAudioObject;
                    this.emit(messageType, audio, payload);
                    break;

                case "document":
                    const document = payload.document as WebhookDocumentObject;
                    this.emit(messageType, document, payload);
                    break;

                case "image":
                    const image = payload.image as WebhookImageObject;
                    this.emit(messageType, image, payload);
                    break;

                case "video":
                    const video = payload.video as WebhookVideoObject;
                    this.emit(messageType, video, payload);
                    break;

                case "location":
                    const location = payload.location as WebhookLocationObject;
                    this.emit(messageType, location, payload);
                    break;

                case "contacts":
                    const contacts = payload.messageContacts as Array<WebhookMessageContactObject>;
                    this.emit(messageType, contacts, payload);
                    break;

                case "button":
                    const button = payload.button as WebhookButtonObject;
                    this.emit(messageType, button, payload);
                    break;

                case "interactive":
                    const interactive = payload.interactive as WebhookInteractiveObject;
                    this.emit(messageType, interactive, payload);
                    break;

                case "order":
                    const order = payload.order as WebhookOrderObject;
                    this.emit(messageType, order, payload);
                    break;

                case "system":
                    const system = payload.system as WebhookSystemObject;
                    this.emit(messageType, system, payload);
                    break;

                // case "ephemeral":
                //     const ephemeral = payload.ephemeral;
                //     this.emit(messageType, ephemeral, payload);
                //     break;

                case "unknown":
                    const unknown = payload.message_error as WebhookUnknownObject;
                    this.emit(messageType, unknown, payload);
                    break;

                /**
                 *   Currently, the Cloud API does not support webhook status updates for deleted messages.
                 */
                case "unsupported":
                    const unsupported = payload.message_error as WebhookUnsupportedObject;
                    this.emit(messageType, unsupported, payload);
                    break;
            }
        } else if (payload.type === "status") {
            const statusType = payload.status_type;
            const status = payload.status as WebhookStatusObject;

            switch (statusType) {
                case "sent":
                    this.emit(statusType, status, payload);
                    break;

                case "delivered":
                    this.emit(statusType, status, payload);
                    break;

                case "read":
                    this.emit(statusType, status, payload);
                    break;

                case "failed":
                    const errors = payload.statuses_errors as WebhookErrorObject[];
                    this.emit("errors", errors, payload);
                    break;
            }
        } else if (payload.type === "errors") {
            const errors = payload.errors as WebhookErrorObject[];
            this.emit(payload.type, errors, payload);
        } else {
            // Todo: handle edge cases
        }
    };
}
