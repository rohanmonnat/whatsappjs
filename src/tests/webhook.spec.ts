import express from 'express';
import { getText, intializeWebhook, Webhook } from '../webhook';
import http from 'http';

describe('Webhook', () => {
  const port = 4002;
  const webhookUrl = `http://localhost:${port}/webhook`;
  let app;
  let webhook: Webhook;
  let server: http.Server;

  beforeAll(() => {
    app = express();
    webhook = intializeWebhook({
      verifyToken: 'token',
    });

    app.use(express.json());

    app.use('/webhook', webhook.Handler());

    server = app.listen(port);
  });

  afterAll(() => {
    server.close(() => {
      server.closeAllConnections();
    });
  });

  it('should receive the text', (done) => {
    webhook.on('text', async (payload) => {
      const text = getText(payload) as any;
      expect(text.body).toBe('hello world');
      done();
    });

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: 'PHONE_NUMBER',
                    phone_number_id: 'PHONE_NUMBER_ID',
                  },
                  contacts: [
                    {
                      profile: {
                        name: 'NAME',
                      },
                      wa_id: 'PHONE_NUMBER',
                    },
                  ],
                  messages: [
                    {
                      from: 'PHONE_NUMBER',
                      id: 'wamid.ID',
                      timestamp: 'TIMESTAMP',
                      text: {
                        body: 'hello world',
                      },
                      type: 'text',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      }),
    });
  });
});
