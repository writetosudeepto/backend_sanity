# Contact Form Webhook Notifications

This setup automatically sends Discord notifications when new contact form entries are submitted to your Sanity CMS.

## Setup Steps

### 1. Set up Discord Webhook
1. Go to your Discord server
2. Right-click on the channel where you want notifications
3. Select "Edit Channel" > "Integrations" > "Webhooks"
4. Click "Create Webhook"
5. Copy the webhook URL

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Replace `YOUR_WEBHOOK_ID` and `YOUR_WEBHOOK_TOKEN` with your Discord webhook URL
3. Set a secure secret key for `SANITY_WEBHOOK_SECRET`

### 3. Install Dependencies
```bash
cd webhook-server
npm install --package-lock-only --prefix ./
npm install express
```

### 4. Start the Webhook Server
```bash
node webhook-server.js
```

### 5. Configure Sanity Webhook
1. Go to https://sanity.io/manage
2. Select your project (`e82ejcg3`)
3. Go to "API" > "Webhooks"
4. Click "Create webhook"
5. Set:
   - Name: "Contact Form Discord Notifications"
   - URL: `http://your-server-url:3001/webhook/contact`
   - Trigger: "Create"
   - Filter: `_type == "contact"`
   - Secret: Use the same secret from your `.env` file

### 6. For Production Deployment
- Deploy the webhook server to a cloud service (Vercel, Heroku, etc.)
- Update the webhook URL in Sanity to your production URL
- Ensure environment variables are set in your hosting service

## Testing
1. Start the webhook server: `node webhook-server.js`
2. Create a new contact entry in Sanity Studio
3. Check your Discord channel for the notification

## Security
- The webhook verifies Sanity signatures to ensure requests are authentic
- Keep your webhook secret secure and don't commit it to version control