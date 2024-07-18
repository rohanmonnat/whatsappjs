import "dotenv/config";
import { describe, beforeAll, it, expect } from "vitest";
import { parseAPIVersion, WhatsappClient } from "../lib/index";

describe("parseAPIVersion", () => {
    it("should handle number input", () => {
        expect(parseAPIVersion(17)).to.equal("v17.0");
    });

    it('should handle string input in the format "v{number}.0"', () => {
        expect(parseAPIVersion("v17.0")).to.equal("v17.0");
    });

    it("should handle string input with just a number", () => {
        expect(parseAPIVersion("12")).to.equal("v12.0");
    });

    it('should handle string input in the format "v{number}.0" with different number', () => {
        expect(parseAPIVersion("v12.0")).to.equal("v12.0");
    });

    it("should throw an error for invalid format", () => {
        expect(() => parseAPIVersion("v15.2")).to.throw("Invalid API version format: v15.2.");
    });

    it("should throw an error for unsupported type", () => {
        expect(() => parseAPIVersion({} as string)).to.throw("Unsupported API version type: object.");
    });
});

describe("WhatsappClient", () => {
    let whatsappClient: WhatsappClient;
    const recipient = process.env.RECIPIENT;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    beforeAll(() => {
        whatsappClient = new WhatsappClient({
            accessToken: accessToken as string,
            version: "v17.0",
            phoneNumberId: phoneNumberId as string,
            requestRetries: 3,
        });
    });

    it("should send a text message", async () => {
        const response = await whatsappClient.sendText({
            to: recipient as string,
            text: "Hi! From the *WhatsApp Client*.",
        });
        const json = (await response.json()) as any;
        const wamid = json.messages?.[0]?.id;
        expect(response.status).toBe(200);
        expect(wamid).toBeDefined();
        expect(wamid).toContain("wamid");
    });

    it("should send a location message", async () => {
        const response = await whatsappClient.sendLocation({
            to: recipient as string,
            address: "South Pole",
            longitude: "0",
            latitude: "90",
            name: "South Pole",
        });
        const json = (await response.json()) as any;
        const wamid = json.messages?.[0]?.id;
        expect(response.status).toBe(200);
        expect(wamid).toBeDefined();
        expect(wamid).toContain("wamid");
    });

    it("should send a template message", async () => {
        const response = await whatsappClient.sendTemplate({
            to: recipient as string,
            template: {
                name: "hello_world",
                language: {
                    code: "en_US",
                },
            },
        });
        const json = (await response.json()) as any;
        const wamid = json.messages?.[0]?.id;
        expect(response.status).toBe(200);
        expect(wamid).toBeDefined();
        expect(wamid).toContain("wamid");
    });
});
