require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Discord webhook URL - Replace with your actual Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'YOUR_DISCORD_WEBHOOK_URL_HERE';

// Sanity webhook secret - Replace with your actual secret from Sanity
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET || 'your-secret-key';

// Capture raw body for signature verification before JSON parsing
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Middleware to verify webhook signature from Sanity
// Sanity signature format: "t=<timestamp>,v1=<hmac-sha256>"
const verifySignature = (req, res, next) => {
  const signatureHeader = req.headers['sanity-webhook-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body) || '';

  console.log('Received signature header:', signatureHeader);

  if (!signatureHeader) {
    console.log('No signature provided - proceeding anyway for debugging');
    return next();
  }

  // Parse Sanity's "t=<ts>,v1=<hash>" signature format
  const parts = Object.fromEntries(signatureHeader.split(',').map(p => p.split('=')));
  const timestamp = parts.t;
  const receivedHash = parts.v1;

  if (!timestamp || !receivedHash) {
    console.log('Unexpected signature format, proceeding anyway:', signatureHeader);
    return next();
  }

  const payload = `${timestamp}.${rawBody}`;
  const expectedHash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (receivedHash !== expectedHash) {
    console.log('Signature mismatch - proceeding anyway for debugging');
    // Uncomment to enforce: return res.status(401).json({ error: 'Invalid signature' });
  } else {
    console.log('Signature verified successfully');
  }

  next();
};

// Webhook endpoint for Sanity
app.post('/webhook/contact', verifySignature, async (req, res) => {
  try {
    console.log('Received webhook body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    const { _type, name, email, message, _createdAt } = req.body;
    
    // Only process contact documents
    if (_type !== 'contact') {
      return res.status(200).json({ message: 'Not a contact document, ignoring' });
    }

    // Format the Discord message
    const discordMessage = {
      embeds: [{
        title: '🆕 New Contact Form Submission',
        color: 0x00ff00, // Green color
        fields: [
          {
            name: '👤 Name',
            value: name || 'Not provided',
            inline: true
          },
          {
            name: '📧 Email',
            value: email || 'Not provided',
            inline: true
          },
          {
            name: '💬 Message',
            value: message || 'No message',
            inline: false
          }
        ],
        timestamp: _createdAt || new Date().toISOString(),
        footer: {
          text: 'Portfolio Contact Form'
        }
      }]
    };

    // Send notification to Discord
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage)
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    console.log('Successfully sent Discord notification');
    res.status(200).json({ message: 'Notification sent successfully' });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook/contact`);
});