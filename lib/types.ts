import { Response } from "node-fetch";

export interface PromiseRetryCondition {
    (error: Error, remainingRetries: number): boolean;
}

export interface PromiseRetryDelayFn {
    (error: Error, remainingRetries: number): number;
}

export interface SendPayload<T> {
    (
        requestPayloadParams: T,
        requestTimeout?: number,
        requestRetries?: number,
        requestRetryCondition?: PromiseRetryCondition,
        requestRetryDelay?: number
    ): Promise<Response>;
}

export interface WhatsappClientConfig {
    accessToken: string;
    phoneNumberId: string;
    version: "v15.0" | "v16.0" | "v17.0";
    requestTimeout?: number;
    requestRetries?: number;
    requestRetryCondition?: PromiseRetryCondition;
    requestRetryDelay?: number;
}

export interface RecipientPayloadParams {
    to: string;
    recipient_type?: string;
}

export interface SendTextPayloadParams extends RecipientPayloadParams {
    text: string;
    preview_url?: boolean;
}

export interface SendTextPayloadParams extends RecipientPayloadParams {
    text: string;
    preview_url?: boolean;
}

export interface SendReactionPayloadParams extends RecipientPayloadParams {
    emoji: string;
    message_id: string;
}

export interface SendLocationPayloadParams extends RecipientPayloadParams {
    latitude: string;
    longitude: string;
    name: string;
    address: string;
}

export interface SendStickerPayloadParams extends RecipientPayloadParams {
    sticker: string;
    link: boolean;
}

export interface SendImagePayloadParams extends RecipientPayloadParams {
    image: string;
    link: boolean;
    caption?: string;
}

export interface SendAudioPayloadParams extends RecipientPayloadParams {
    audio: string;
    link: boolean;
}

export interface SendVideoPayloadParams extends RecipientPayloadParams {
    video: string;
    link: boolean;
}

export interface SendDocumentPayloadParams extends RecipientPayloadParams {
    document: string;
    filename: string;
    link: boolean;
    caption?: string;
}

export interface SendContactsPayloadParams extends RecipientPayloadParams {
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

export interface SendTemplatePayloadParams extends RecipientPayloadParams {
    template: {
        name: string;
        language: {
            code: string;
        };
        components?: Record<any, any>;
    };
}

export interface SendReplyToMessagePayloadParams extends SendTextPayloadParams {
    message_id: string;
}

/**
 * Todo: improve type definitions for Whatsapp client.
 */
export type MessageObject<T extends keyof MessageObjectsTypes> = BaseMessageObject & {
    [K in T]: MessageObjectsTypes[K];
} & { type: T };

export interface MessageObjectsTypes {
    text: MessageTextObject;
    audio: MessageAudioObjectV1 | MessageAudioObjectV2;
}

export interface BaseMessageObject {
    messaging_product: "whatsapp";
    to: string;

    biz_opaque_callback_data?: string;
    recipient_type?: string;
}

export interface MessageAudioObjectV1 {
    id: string;
    caption?: string;
}

export interface MessageAudioObjectV2 {
    link: string;
    caption?: string;
}

export interface MessageTextObject {
    body: string;
    preview_url?: boolean;
}

export interface MessageReactionObject {
    message_id: string;
    emoji: string;
}

/**
 * Client request payload definitions and types.
 */

export interface ClientBasePayload {
    to: string;
    recipient_type?: string;
    messaging_product: "whatsapp";
}

export interface ClientTextPayload extends ClientBasePayload {
    type: "text";
    text: { preview_url: boolean; body: string };
}

export interface ClientReactionPayload extends ClientBasePayload {
    type: "reaction";
    reaction: { message_id: string; emoji: string };
}

export interface ClientLocationPayload extends ClientBasePayload {
    type: "location";
    location: {
        longitude: string;
        latitude: string;
        name: string;
        address: string;
    };
}

export interface ClientStickerPayload extends ClientBasePayload {
    type: "sticker";
    sticker: { link: string } | { id: string };
}

export interface ClientImagePayload extends ClientBasePayload {
    type: "image";
    image: { id: string; caption?: string } | { link: string; caption?: string };
}

export interface ClientAudioPayload extends ClientBasePayload {
    type: "audio";
    audio: { link: string } | { id: string };
}

export interface ClientVideoPayload extends ClientBasePayload {
    type: "video";
    video: { link: string } | { id: string };
}

export interface ClientDocumentPayload extends ClientBasePayload {
    type: "document";
    document: { link: string; caption?: string; filename: string } | { id: string; caption?: string; filename: string };
}

export interface ClientTemplatePayload extends ClientBasePayload {
    type: "template";
    template: {
        name: string;
        language: {
            code: string;
        };
        components?: Record<any, any>;
    };
}

export interface ClientAddressPayload {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    country_code: string;
    type: string;
}

export interface ClientContactPayload {
    addresses: ClientAddressPayload[];
}

export interface ClientContactsPayload extends ClientBasePayload {
    type: "contacts";
    contacts: ClientContactPayload[];
}

export interface ClientMarkReadPayload {
    messaging_product: string;
    status: "read";
    message_id: string;
}

export interface ClientReplyToMessagePayload extends ClientTextPayload {
    context: { message_id: string };
}

/**
 * Webhook notification payload objects types and definitions.
 */

export interface WhatsappWebhookConfig {
    /**
     * The verify token for webhook.
     */
    verifyToken: string;
    /**
     * @param {string} facebookSecret - The app secret, used for verifying payload signatures.
     */
    appSecret?: string;
    captureRejections?: boolean;
}

export interface WebhookNotificationObject {
    object: "whatsapp_business_account";
    entry: Array<{
        /**
         * The WhatsApp Business Account ID for the business that is subscribed to the webhook.
         */
        id: string;

        /**
         *  An array of change objects.
         */
        changes: Array<{
            /**
             * A value object.
             */
            value: {
                /**
                 * Product used to send the message. Value is always `whatsapp`.
                 */
                messaging_product: "whatsapp";

                /**
                 * A metadata object describing the business subscribed to the webhook.
                 */
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };

                /**
                 * Array of contact objects with information for the customer who sent a message to the business.
                 */
                contacts?: Array<WebhookContactObject>;

                /**
                 * An array of error objects describing the error.
                 */
                errors?: Array<WebhookErrorObject>;

                /**
                 * Information about a message received by the business that is subscribed to the webhook.
                 */
                messages?: Array<WebhookMessageObject>;

                /**
                 * Status object for a message that was sent by the business that is subscribed to the webhook.
                 */
                statuses?: Array<WebhookStatusObject>;
            };

            /**
             * Notification type.
             */
            field: "messages";
        }>;
    }>;
}

export interface WebhookMessageObject {
    /**
     * The customer's WhatsApp ID. A business can respond to a customer using this ID.
     */
    from: string;

    /**
     * The ID for the message that was received by the business.
     */
    id: string;

    /**
     * Unix timestamp indicating when the WhatsApp server received the message from the customer.
     */
    timestamp: string;

    /**
     * The type of message that has been received by the business that has subscribed to Webhooks.
     */
    type: string;

    identity?: WebhookIdentityObject;
    context?: WebhookContextObject;
    audio?: WebhookAudioObject;
    button?: WebhookButtonObject;
    contacts?: Array<WebhookMessageContactObject>;
    document?: WebhookDocumentObject;
    errors?: Array<WebhookErrorObject>;
    image?: WebhookImageObject;
    interactive?: WebhookInteractiveObject;
    location?: WebhookLocationObject;
    order?: WebhookOrderObject;
    reaction?: WebhookReactionObject;
    referral?: string;
    sticker?: WebhookStickerObject;
    system?: WebhookSystemObject;
    text?: WebhookTextObject;
    video?: WebhookVideoObject;
}

export interface WebhookContextObject {
    forwarded: boolean;
    frequently_forwarded: boolean;
    from: string;
    id: string;
    referred_product: {
        catalog_id: string;
        product_retailer_id: string;
    };
}

export interface WebhookLocationObject {
    latitude: string;
    longitude: string;
    name: string;
    address: string;
}

export interface WebhookAudioObject {
    id: string;
    mime_type: string;
}

export interface WebhookButtonObject {
    payload: string;
    text: string;
}

export interface WebhookMessageContactObject {
    /**
     * Full contact address(es) formatted as an addresses object.
     */
    addresses?: Array<WebhookContactsAddressObject>;
    /**
     * YYYY-MM-DD formatted string.
     */
    birthday?: string;
    /**
     * Contact email address(es) formatted as an emails object.
     */
    emails?: Array<WebhookContactsEmailObject>;
    /**
     * Full contact name formatted as a name object.
     */
    name: WebhookContactsNameObject;
    /**
     * Contact organization information formatted as an org object.
     */
    org?: WebhookContactsOrgObject;
    /**
     * Contact phone number(s) formatted as a phone object.
     */
    phones?: Array<WebhookContactsPhoneObject>;
    /**
     * Contact URL(s) formatted as a urls object.
     */
    urls?: Array<WebhookContactsUrlObject>;
}

export interface WebhookContactsAddressObject {
    /**
     * Street number and name.
     */
    street?: string;
    /**
     * City name.
     */
    city?: string;
    /**
     * State abbreviation.
     */
    state?: string;
    /**
     * ZIP code.
     */
    zip?: string;
    /**
     * Full country name.
     */
    country?: string;
    /**
     * Two-letter country abbreviation.
     */
    country_code?: string;
    /**
     * Standard values are HOME and WORK.
     */
    type?: string;
}

export interface WebhookContactsEmailObject {
    /**
     * Email address.
     */
    email?: string;
    /**
     * Standard values are `HOME` and `WORK`.
     */
    type?: string;
}

export interface WebhookContactsNameObject {
    /**
     * Full name, as it normally appears.
     */
    formatted_name: string;
    /**
     * First name.
     */
    first_name?: string;
    /**
     * Last name.
     */
    last_name?: string;
    /**
     * Middle name.
     */
    middle_name?: string;
    /**
     * Name suffix.
     */
    suffix?: string;
    /**
     * Name prefix.
     */
    prefix?: string;
}

export interface WebhookContactsOrgObject {
    /**
     * Name of the contact's company.
     */
    name?: string;
    /**
     * Name of the contact's department.
     */
    department?: string;
    /**
     * Contact's business title.
     */
    title: string;
}

export interface WebhookContactsPhoneObject {
    /**
     * Automatically populated with the `wa_id` value as a formatted phone number.
     */
    phone?: string;
    /**
     * Standard Values are `CELL`, `MAIN`, `IPHONE`, `HOME`, and `WORK`.
     */
    type?: string;
    /**
     * WhatsApp ID.
     */
    wa_id?: string;
}

export interface WebhookContactsUrlObject {
    /**
     * URL.
     */
    url?: string;
    /**
     * Standard values are `HOME` and `WORK`.
     */
    type?: string;
}

export interface WebhookDocumentObject {
    caption: string;
    filename: string;
    sha256: string;
    mime_type: string;
    id: string;
}

export interface WebhookImageObject {
    caption: string;
    sha256: string;
    id: string;
    mime_type: string;
}

export interface WebhookInteractiveObject {
    button_reply?: {
        id: string;
        title: string;
    };
    list_reply?: {
        id: string;
        title: string;
        description: string;
    };
    type: "list_reply" | "button_reply";
}

export interface WebhookOrderObject {
    catalog_id: string;
    text: string;
    product_items: Array<{
        product_retailer_id: string;
        quantity: string;
        item_price: string;
        currency: string;
    }>;
}

export interface WebhookReactionObject {
    message_id: string;
    emoji: string;
}

export interface WebhookStickerObject {
    mime_type: string;
    sha256: string;
    id: string;
    animated: string;
}

export interface WebhookSystemObject {
    body: string;
    identity: string;
    wa_id: string;
    type: "customer_changed_number" | "customer_identity_changed";
    customer: string;
}

export interface WebhookTextObject {
    body: string;
}

export interface WebhookUnknownObject extends WebhookErrorObject {}

export interface WebhookUnsupportedObject extends WebhookErrorObject {}

export interface WebhookVideoObject {
    caption: string;
    filename: string;
    sha256: string;
    id: string;
    mime_type: string;
}

export interface WebhookIdentityObject {}

export interface WebhookContactObject {
    wa_id: string;
    profile: {
        name: string;
    };
}

export interface WebhookStatusObject {
    /**
     * Arbitrary string included in sent message.
     */
    biz_opaque_callback_data?: string;

    /**
     * Information about the conversation.
     */
    conversation: {
        /**
         * Represents the ID of the conversation the given status notification belongs to.
         */
        id: string;

        /**
         * Describes conversation category
         */
        origin: {
            /**
             * Indicates conversation category. This can also be referred to as a conversation entry point
             */
            type: "authentication" | "marketing" | "utility" | "service" | "referral_conversion";
        };

        /**
         * Date when the conversation expires. This field is only present for messages with a `status` set to `sent`.
         */
        expiration_timestamp: string;
    };

    /**
     * An array of error objects describing the error. Error objects have the following properties, which map to their equivalent properties in API error response payloads.
     */
    errors: Array<WebhookErrorObject>;

    /**
     * The ID for the message that the business that is subscribed to the webhooks sent to a customer
     */
    id: string;

    /**
     * An object containing pricing information.
     */
    pricing: {
        /**
         * Indicates the conversation category:
         */
        category: "authentication" | "marketing" | "utility" | "service" | "referral_conversion";

        /**
         * Type of pricing model used by the business. Current supported value is CBP.
         */
        pricing_model: "CBP";

        /**
         * @deprecated Indicates if the given message or conversation is billable.
         */
        billable: boolean;
    };

    /**
     * The customer's WhatsApp ID. A business can respond to a customer using this ID. This ID may not match the customer's phone number, which is returned by the API as input when sending a message to the customer.
     */
    recipient_id: string;

    /**
     * The status of the message.
     */
    status: "delivered" | "read" | "sent" | "failed";

    /**
     * Date for the status message
     */
    timestamp: string;
}

export interface WebhookErrorObject {
    /**
     * Error code.
     */
    code: number;
    /**
     * Error code title.
     */
    title: string;
    /**
     * Error code message. This value is the same as the title value.
     */
    message: string;
    /**
     * An error data object.
     */
    error_data: {
        /**
         * Describes the error.
         */
        details: string;
    };
}

export interface WebhookEvents {
    audio: WebhookAudioObject;
    button: WebhookButtonObject;
    contacts: Array<WebhookMessageContactObject>;
    delivered: WebhookStatusObject;
    document: WebhookDocumentObject;
    error: WebhookErrorObject;
    errors: Array<WebhookErrorObject>;
    failed: Array<WebhookErrorObject>;
    image: WebhookImageObject;
    interactive: WebhookInteractiveObject;
    location: WebhookLocationObject;
    order: WebhookOrderObject;
    reaction: WebhookReactionObject;
    read: WebhookStatusObject;
    sent: WebhookStatusObject;
    sticker: WebhookStickerObject;
    system: WebhookSystemObject;
    text: WebhookTextObject;
    unknown: WebhookUnknownObject;
    unsupported: WebhookUnsupportedObject;
    video: WebhookVideoObject;
}

export interface WebhookEventListener<T, U> {
    (object: T, payload: U): void | Promise<void>;
}
