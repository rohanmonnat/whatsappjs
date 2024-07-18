import fetch, { Response } from "node-fetch";
import { AbortController } from "node-abort-controller";
import { checkFile, getFileBlob, getFileName, getMimeType, retry } from "./utils";
import {
    ClientAudioPayload,
    ClientContactsPayload,
    ClientDocumentPayload,
    ClientImagePayload,
    ClientLocationPayload,
    ClientMarkReadPayload,
    ClientReactionPayload,
    ClientReplyToMessagePayload,
    ClientStickerPayload,
    ClientTemplatePayload,
    ClientVideoPayload,
    MessageObject,
    PromiseRetryCondition,
    SendAudioPayloadParams,
    SendContactsPayloadParams,
    SendDocumentPayloadParams,
    SendImagePayloadParams,
    SendLocationPayloadParams,
    SendPayload,
    SendReactionPayloadParams,
    SendReplyToMessagePayloadParams,
    SendStickerPayloadParams,
    SendTemplatePayloadParams,
    SendTextPayloadParams,
    SendVideoPayloadParams,
    WhatsappClientConfig,
} from "./types";
import { parseAPIVersion } from "./utils";

export class WhatsappClient {
    private readonly accessToken: string;
    private readonly phoneNumberId: string;
    private readonly version: string;
    private readonly requestTimeout: number;
    private readonly requestRetries: number;
    private readonly requestRetryCondition: PromiseRetryCondition;
    private readonly requestRetryDelay: number;
    private readonly baseUrl: string;
    private readonly urls: Record<string, string>;
    private readonly headers: { "Content-Type": string; Authorization: string };

    constructor(config: WhatsappClientConfig) {
        this.accessToken = config.accessToken;
        this.phoneNumberId = config.phoneNumberId;
        this.version = parseAPIVersion(config.version || "v17.0");
        this.requestTimeout = config.requestTimeout || 3 * 1000;
        this.requestRetries = config.requestRetries || 0;
        this.requestRetryCondition = config.requestRetryCondition || WhatsappClient.timeoutRetryCondition;
        this.requestRetryDelay = config.requestRetryDelay || 0;
        this.baseUrl = `https://graph.facebook.com`;
        this.urls = {
            messages: `${this.baseUrl}/${this.version}/${this.phoneNumberId}/messages`,
            mediaUpload: `${this.baseUrl}/${this.version}/${this.phoneNumberId}/media`,
            media: `${this.baseUrl}/${this.version}`,
        };
        this.headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
        };
    }

    private static timeoutRetryCondition: PromiseRetryCondition = (error: Error) => {
        if (error.name === "ErrorTimeout" || error.name === "AbortError") {
            return true;
        }

        return false;
    };

    private sendPayload: SendPayload<any> = async (
        requestPayload,
        requestTimeout,
        requestRetries,
        requestRetryCondition,
        requestRetryDelay: number = 0
    ) => {
        const request = async () => {
            const controller = new AbortController();
            const { signal } = controller;
            const timeout = setTimeout(() => {
                controller.abort();
            }, requestTimeout);

            const response = await fetch(this.urls.messages, {
                method: "POST",
                headers: this.headers,
                body: typeof requestPayload === "string" ? requestPayload : JSON.stringify(requestPayload),
                signal,
            });
            clearTimeout(timeout);

            return response;
        };

        const response = await retry<Response>(request, requestRetries, requestRetryCondition, requestRetryDelay);

        return response;
    };

    public sendText: SendPayload<SendTextPayloadParams> = async (
        { recipient_type = "individual", preview_url = false, to, text },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: MessageObject<"text"> = {
            messaging_product: "whatsapp",
            type: "text",

            recipient_type,
            to,
            text: {
                preview_url,
                body: text,
            },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );

        return response;
    };

    public sendReaction: SendPayload<SendReactionPayloadParams> = async (
        { recipient_type = "individual", to, emoji, message_id },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientReactionPayload = {
            messaging_product: "whatsapp",
            type: "reaction",

            recipient_type,
            to,
            reaction: {
                message_id,
                emoji,
            },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );

        return response;
    };

    public sendLocation: SendPayload<SendLocationPayloadParams> = async (
        { recipient_type = "individual", to, latitude, longitude, name, address },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientLocationPayload = {
            messaging_product: "whatsapp",
            type: "location",

            recipient_type,
            to,
            location: {
                latitude,
                longitude,
                name,
                address,
            },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );

        return response;
    };

    public sendSticker: SendPayload<SendStickerPayloadParams> = async (
        { recipient_type = "individual", link = true, to, sticker },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientStickerPayload = {
            messaging_product: "whatsapp",
            type: "sticker",

            recipient_type,
            to,
            sticker: link
                ? {
                      link: sticker,
                  }
                : {
                      id: sticker,
                  },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );
        return response;
    };

    public markAsRead: SendPayload<{ message_id: string }> = async (
        { message_id },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientMarkReadPayload = {
            messaging_product: "whatsapp",
            status: "read",

            message_id,
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );

        return response;
    };

    public replyToMessage: SendPayload<SendReplyToMessagePayloadParams> = async (
        { recipient_type = "individual", preview_url = false, to, text, message_id },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientReplyToMessagePayload = {
            messaging_product: "whatsapp",
            type: "text",

            recipient_type: recipient_type,
            to,
            context: { message_id },
            text: { preview_url, body: text },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );
        return response;
    };

    public sendImage: SendPayload<SendImagePayloadParams> = async (
        { image, caption, to, recipient_type = "individual", link = true },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientImagePayload = {
            messaging_product: "whatsapp",
            type: "image",

            recipient_type,
            to,
            image: link ? { caption, link: image } : { caption, id: image },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );
        return response;
    };

    public sendAudio: SendPayload<SendAudioPayloadParams> = async (
        { audio, to, recipient_type = "individual", link = true },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientAudioPayload = {
            messaging_product: "whatsapp",
            type: "audio",

            recipient_type,
            to,
            audio: link ? { link: audio } : { id: audio },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );
        return response;
    };

    public sendVideo: SendPayload<SendVideoPayloadParams> = async (
        { video, to, recipient_type = "individual", link = true },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientVideoPayload = {
            messaging_product: "whatsapp",
            type: "video",

            recipient_type,
            to,
            video: link ? { link: video } : { id: video },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );
        return response;
    };

    public sendDocument: SendPayload<SendDocumentPayloadParams> = async (
        { recipient_type = "individual", link = true, to, document, caption, filename },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientDocumentPayload = {
            messaging_product: "whatsapp",
            type: "document",

            recipient_type: recipient_type,
            to,
            document: link ? { link: document, caption, filename } : { id: document, caption, filename },
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );
        return response;
    };

    public sendContacts: SendPayload<SendContactsPayloadParams> = async (
        { recipient_type = "individual", to, contacts },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientContactsPayload = {
            messaging_product: "whatsapp",
            type: "contacts",

            recipient_type: recipient_type,
            to,
            contacts,
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );

        return response;
    };

    public sendTemplate: SendPayload<SendTemplatePayloadParams> = async (
        { recipient_type = "individual", to, template },
        requestTimeout = this.requestTimeout,
        requestRetries = this.requestRetries,
        requestRetryCondition = this.requestRetryCondition,
        requestRetryDelay = this.requestRetryDelay
    ) => {
        const payload: ClientTemplatePayload = {
            messaging_product: "whatsapp",
            type: "template",

            recipient_type,
            to,
            template,
        };

        const response = await this.sendPayload(
            payload,
            requestTimeout,
            requestRetries,
            requestRetryCondition,
            requestRetryDelay
        );

        return response;
    };

    /**
     * Uploads the media.
     * @param media {string} - Path to the file stored in your local directory.
     */
    public uploadMedia = async (media: string) => {
        if (!checkFile(media)) {
            throw new Error(
                `Invalid file path: "${media}". The file does not exist at the specified path. Please check the file path and try again.`
            );
        }

        const headers = {
            Authorization: this.headers.Authorization,
        };

        const blob = await getFileBlob(media);
        const filename = getFileName(media);
        const type = getMimeType(media);

        const formData = new FormData();
        formData.append("file", blob, filename);
        formData.append("type", type);
        formData.append("messaging_product", "whatsapp");

        const response = await fetch(this.urls.mediaUpload, {
            method: "POST",
            headers,
            body: formData,
        });

        return response;
    };

    public downloadMedia = async (mediaUrl: string) => {
        const headers = {
            Authorization: this.headers.Authorization,
        };

        return fetch(mediaUrl, { headers });
    };

    public deleteMedia = async (mediaId: string) => {
        const headers = {
            Authorization: this.headers.Authorization,
        };

        const response = await fetch(`${this.urls.media}/${mediaId}`, {
            method: "DELETE",
            headers,
        });

        return response;
    };

    public getMediaUrl = async (mediaId: string) => {
        const headers = {
            Authorization: this.headers.Authorization,
        };

        const response = await fetch(`${this.urls.media}/${mediaId}`, {
            headers,
        });

        return response;
    };
}
