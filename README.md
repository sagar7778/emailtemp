# Temp Mail Clone

A modern, privacy-focused disposable email service built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

- **Instant Email Creation**: Generate random or custom disposable email addresses
- **Multiple Providers**: Support for 1secmail, Mail.tm, and optional paid providers
- **Real-time Inbox**: Auto-refresh with polling and optional SSE support
- **HTML Email Support**: Sanitized HTML rendering with fallback to text
- **Attachment Downloads**: Secure file streaming from email providers
- **QR Code Generation**: Easy sharing of email addresses
- **Keyboard Navigation**: Full keyboard support (R refresh, J/K navigate, Enter open)
- **Modern UI**: Glass morphism design with dark mode support
- **Mobile Responsive**: Perfect experience on all devices
- **Privacy First**: No registration, no tracking, complete anonymity

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd temp-mail-clone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Required: Site URL for SEO and canonical links
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: API key for paid temp mail provider
TEMPMAIL_API_KEY=your_api_key_here
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── providers/     # Provider listing
│   │   │   ├── session/       # Mailbox creation
│   │   │   ├── messages/      # Message listing & detail
│   │   │   ├── attachments/   # File downloads
│   │   │   ├── qr/           # QR code generation
│   │   │   └── sse/          # Server-Sent Events
│   │   ├── globals.css       # Global styles & design tokens
│   │   ├── layout.tsx        # Root layout with SEO
│   │   └── page.tsx          # Main application page
│   └── lib/
│       ├── api/              # API utilities
│       ├── providers/        # Email provider implementations
│       ├── sanitize.ts       # HTML sanitization
│       ├── format.ts         # Date formatting
│       └── storage.ts        # Local storage wrapper
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── EmailAddressCard.tsx  # Email address display
│   ├── InboxList.tsx         # Message list component
│   └── MessageViewer.tsx     # Message detail viewer
├── hooks/
│   └── useInboxPolling.tsx   # Message polling hook
└── scripts/
    └── smoke-test.cjs        # API testing script
```

## 🔧 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/providers` | List available providers and domains |
| `POST` | `/api/session` | Create new mailbox (random/custom) |
| `GET` | `/api/messages` | List messages for mailbox |
| `GET` | `/api/messages/[id]` | Get message detail |
| `GET` | `/api/attachments/[id]` | Download attachment |
| `GET` | `/api/qr` | Generate QR code |
| `GET` | `/api/sse` | Server-Sent Events stream |

### Example Usage

#### Create Random Mailbox
```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"type": "random", "provider": "oneSec"}'
```

#### List Messages
```bash
curl "http://localhost:3000/api/messages?mailbox=%7B%22id%22%3A%22test%401secmail.com%22%2C%22address%22%3A%22test%401secmail.com%22%2C%22provider%22%3A%22oneSec%22%7D"
```

#### Generate QR Code
```bash
curl "http://localhost:3000/api/qr?text=test@1secmail.com" -o qr.png
```

## 🎨 Design System

### Design Tokens

The application uses CSS custom properties for consistent theming:

```css
:root {
  --primary: 222 89% 55%;
  --primary-glow: 222 89% 65%;
  --gradient-primary: 222 89% 55%, 245 100% 67%;
  --shadow-elev: 0 2px 8px 0 hsl(222 89% 55% / 0.08);
  --shadow-glow: 0 0 16px 0 hsl(222 89% 65% / 0.25);
}
```

### Components

- **Button**: Multiple variants (default, outline, ghost, hero)
- **Input**: Form inputs with focus states
- **Select**: Dropdown selectors
- **Card**: Content containers
- **Tabs**: Tabbed interface
- **Toast**: Notification system
- **Tooltip**: Hover information
- **Skeleton**: Loading states

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Set the following in Vercel dashboard:
   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   TEMPMAIL_API_KEY=your_api_key_here (optional)
   ```
3. **Deploy**: Vercel will automatically build and deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use `next build && next export`
- **Railway**: Direct deployment with Node.js runtime
- **Docker**: Use the provided Dockerfile

## 🧪 Testing

### Smoke Tests

Run the included smoke test script:

```bash
npm run smoke
```

This will test all API endpoints and verify the application is working correctly.

### Manual Testing

1. **Create Mailbox**: Test random and custom email creation
2. **Message Polling**: Verify automatic inbox refresh
3. **Keyboard Navigation**: Test R, J/K, Enter shortcuts
4. **Responsive Design**: Test on mobile and desktop
5. **Dark Mode**: Toggle system theme

## 🔒 Security

- **HTML Sanitization**: All email content is sanitized using `sanitize-html`
- **Rate Limiting**: Basic throttling on API endpoints
- **No Secrets**: Sensitive data never exposed to client
- **CORS**: Proper CORS headers for API endpoints
- **Input Validation**: Zod schemas for all API inputs

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed
2. **API Errors**: Check provider availability and rate limits
3. **Styling Issues**: Verify Tailwind CSS is properly configured
4. **SSE Errors**: Check browser compatibility and network issues

### Provider Status

- **1secmail**: Free, no authentication required (may have rate limits)
- **Mail.tm**: Free, requires account creation
- **TempMail Paid**: Optional, requires API key

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [1secmail API](https://www.1secmail.com/api/)
- [Mail.tm API](https://api.mail.tm)

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.