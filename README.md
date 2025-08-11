# Temp Mail Clone

A modern, privacy-focused disposable email service built with Next.js 14, TypeScript, and Tailwind CSS. Create temporary email addresses instantly to protect your privacy and avoid spam.

## Features

- 🚀 **Instant Setup** - No registration required
- 🔄 **Auto-refresh** - Real-time inbox updates with polling and SSE
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support
- 🔒 **Privacy First** - No data stored permanently
- 📱 **Mobile Friendly** - Works perfectly on all devices
- ♿ **Accessible** - Full keyboard navigation and screen reader support
- 🔧 **Multiple Providers** - Support for 1secmail, mail.tm, and optional paid providers

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui-style components
- **Backend**: Next.js API Routes, Node.js runtime
- **Libraries**: Axios, Zod, sanitize-html, qrcode, nanoid
- **Providers**: 1secmail.com, mail.tm, optional paid provider

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd temp-mail-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env.local
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   TEMPMAIL_API_KEY=your_paid_provider_key_here  # Optional
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Reference

### Endpoints

#### `GET /api/providers`
Returns available email providers and their domains.

**Response:**
```json
{
  "providers": [
    {
      "id": "oneSec",
      "label": "1secmail",
      "domains": ["1secmail.com", "1secmail.org"]
    }
  ],
  "domainsByProvider": {
    "oneSec": ["1secmail.com", "1secmail.org"]
  }
}
```

#### `POST /api/session`
Creates a new mailbox (random or custom).

**Request:**
```json
{
  "type": "random|custom",
  "provider": "oneSec",
  "domain": "1secmail.com",
  "local": "customname"  // Only for custom type
}
```

**Response:**
```json
{
  "id": "mailbox_id",
  "address": "user@domain.com",
  "provider": "oneSec",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### `GET /api/messages?mailbox={serialized_mailbox}`
Lists messages for a mailbox.

**Response:**
```json
[
  {
    "id": "message_id",
    "from": "sender@example.com",
    "subject": "Email Subject",
    "intro": "Preview text...",
    "date": "2024-01-01T00:00:00Z",
    "unread": true
  }
]
```

#### `GET /api/messages/[id]?mailbox={serialized_mailbox}`
Gets detailed message content with sanitized HTML.

**Response:**
```json
{
  "id": "message_id",
  "from": "sender@example.com",
  "subject": "Email Subject",
  "intro": "Preview text...",
  "date": "2024-01-01T00:00:00Z",
  "unread": true,
  "html": "<p>Sanitized HTML content</p>",
  "text": "Plain text content",
  "attachments": [
    {
      "filename": "document.pdf",
      "url": "/api/attachments/123",
      "size": 1024
    }
  ]
}
```

#### `GET /api/attachments/[id]?mailbox={serialized_mailbox}`
Downloads attachment file.

#### `GET /api/qr?text=email@domain.com`
Generates QR code for email address.

#### `GET /api/sse`
Server-Sent Events endpoint for real-time updates.

## Usage Examples

### cURL Examples

```bash
# Get available providers
curl http://localhost:3000/api/providers

# Create random mailbox
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"type":"random","provider":"oneSec","domain":"1secmail.com"}'

# Create custom mailbox
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"type":"custom","provider":"oneSec","domain":"1secmail.com","local":"myemail"}'

# List messages
curl "http://localhost:3000/api/messages?mailbox=$(echo '{"id":"mailbox_id","address":"user@domain.com","provider":"oneSec","createdAt":"2024-01-01T00:00:00Z"}' | jq -c -r . | jq -sRr @uri)"

# Get message detail
curl "http://localhost:3000/api/messages/message_id?mailbox=$(echo '{"id":"mailbox_id","address":"user@domain.com","provider":"oneSec","createdAt":"2024-01-01T00:00:00Z"}' | jq -c -r . | jq -sRr @uri)"

# Generate QR code
curl "http://localhost:3000/api/qr?text=user@domain.com" --output qr.png
```

## Project Structure

```
temp-mail-clone/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── providers/
│   │   │   ├── session/
│   │   │   ├── messages/
│   │   │   ├── attachments/
│   │   │   ├── qr/
│   │   │   └── sse/
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Home page
│   └── lib/
│       ├── api/
│       │   └── utils.ts            # API utilities
│       ├── providers/              # Email providers
│       │   ├── types.ts
│       │   ├── index.ts
│       │   ├── oneSecMail.ts
│       │   ├── mailTm.ts
│       │   └── tempMailPaid.ts
│       ├── sanitize.ts             # HTML sanitization
│       ├── format.ts               # Date formatting
│       └── storage.ts              # Local storage utilities
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── EmailAddressCard.tsx        # Email display component
│   ├── InboxList.tsx               # Message list
│   ├── MessageViewer.tsx           # Message detail view
│   ├── Header.tsx
│   └── Footer.tsx
├── hooks/
│   └── useInboxPolling.tsx         # Polling hook
├── scripts/
│   └── smoke-test.cjs              # API smoke tests
├── tailwind.config.ts              # Tailwind configuration
├── next.config.ts                  # Next.js configuration
└── package.json
```

## Features Checklist

### ✅ Core Functionality
- [x] Create random email addresses
- [x] Create custom email addresses
- [x] Real-time message polling
- [x] Message detail viewing
- [x] HTML email sanitization
- [x] Attachment downloads
- [x] QR code generation
- [x] Copy to clipboard
- [x] Local storage persistence

### ✅ UI/UX
- [x] Responsive design
- [x] Dark mode support
- [x] Keyboard navigation (R refresh, J/K navigate, Enter open)
- [x] Loading states and skeletons
- [x] Toast notifications
- [x] Accessibility features (ARIA labels, focus management)
- [x] Mobile-friendly interface

### ✅ Technical
- [x] TypeScript throughout
- [x] Zod validation
- [x] Error handling
- [x] Rate limiting
- [x] SEO optimization
- [x] Progressive enhancement (SSE fallback to polling)
- [x] Security (HTML sanitization, no secrets in client)

### ✅ Providers
- [x] 1secmail.com integration
- [x] mail.tm integration
- [x] Optional paid provider stub
- [x] Provider switching
- [x] Domain selection

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Site URL for SEO | No | `http://localhost:3000` |
| `TEMPMAIL_API_KEY` | API key for paid provider | No | - |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run smoke        # Run API smoke tests
```

### Testing

```bash
# Run smoke tests
npm run smoke

# Manual testing
curl http://localhost:3000/api/providers
```

## Troubleshooting

### Common Issues

1. **Build fails with Tailwind errors**
   - Ensure all Tailwind dependencies are installed
   - Check `tailwind.config.ts` configuration

2. **API routes return 500 errors**
   - Check provider API endpoints are accessible
   - Verify environment variables are set correctly

3. **TypeScript errors**
   - Run `npm install` to ensure all types are installed
   - Check `tsconfig.json` paths configuration

### Provider Status

- **1secmail.com**: Free, no authentication required
- **mail.tm**: Free, requires account creation
- **Paid Provider**: Requires API key in `TEMPMAIL_API_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Security

- All HTML content is sanitized before display
- No sensitive data is stored permanently
- API keys are only used server-side
- Rate limiting is implemented on all endpoints

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
#   e m a i l t e m p  
 