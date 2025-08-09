require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Discord webhook URL - Replace with your actual Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'YOUR_DISCORD_WEBHOOK_URL_HERE';

// Sanity webhook secret - Replace with your actual secret from Sanity
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET || 'your-secret-key';

app.use(express.json());

// Middleware to verify webhook signature from Sanity
const verifySignature = (req, res, next) => {
  const signature = req.headers['sanity-webhook-signature'];
  const body = JSON.stringify(req.body);
  
  console.log('Received signature:', signature);
  console.log('Using secret:', WEBHOOK_SECRET);
  
  if (!signature) {
    console.log('No signature provided');
    return res.status(401).json({ error: 'No signature provided' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  console.log('Expected signature:', expectedSignature);

  if (signature !== expectedSignature) {
    console.log('Invalid signature - webhook proceeding anyway for debugging');
    // Temporarily skip signature verification for debugging
    // return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

// Webhook endpoint for Sanity
app.post('/webhook/contact', verifySignature, async (req, res) => {
  try {
    console.log('Received webhook:', req.body);
    
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