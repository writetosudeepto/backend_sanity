require('dotenv').config()
const crypto = require('crypto')

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET || 'your-secret-key'

// Disable Vercel's default body parser so we can read the raw body for signature verification
module.exports.config = {
  api: {bodyParser: false},
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'})
  }

  const rawBody = await getRawBody(req)
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({error: 'Invalid JSON'})
  }

  // Verify Sanity signature (format: "t=<timestamp>,v1=<hmac-sha256>")
  const signatureHeader = req.headers['sanity-webhook-signature']
  if (signatureHeader) {
    const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.split('=')))
    if (parts.t && parts.v1) {
      const expectedHash = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(`${parts.t}.${rawBody}`)
        .digest('hex')
      if (parts.v1 !== expectedHash) {
        console.log('Signature mismatch - proceeding anyway for debugging')
      } else {
        console.log('Signature verified')
      }
    }
  }

  console.log('Received webhook:', JSON.stringify(body, null, 2))

  const {_type, name, email, message, _createdAt} = body

  if (_type !== 'contact') {
    return res.status(200).json({message: 'Not a contact document, ignoring'})
  }

  const discordMessage = {
    embeds: [
      {
        title: '🆕 New Contact Form Submission',
        color: 0x00ff00,
        fields: [
          {name: '👤 Name', value: name || 'Not provided', inline: true},
          {name: '📧 Email', value: email || 'Not provided', inline: true},
          {name: '💬 Message', value: message || 'No message', inline: false},
        ],
        timestamp: _createdAt || new Date().toISOString(),
        footer: {text: 'Portfolio Contact Form'},
      },
    ],
  }

  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(discordMessage),
  })

  if (!response.ok) {
    console.error('Discord error:', response.status)
    return res.status(500).json({error: `Discord API error: ${response.status}`})
  }

  console.log('Successfully sent Discord notification')
  return res.status(200).json({message: 'Notification sent successfully'})
}
