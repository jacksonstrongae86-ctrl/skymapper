# Skymapper Standalone Landing Pages - A/B Testing

This folder contains two standalone Next.js landing page variants for A/B testing. Each variant can be deployed independently and redirects users to the main Skymapper application.

## 📁 Structure

```
standalone-landing-pages/
├── variant-a/          # Landing page variant A
│   ├── public/         # Static assets (logo, videos)
│   ├── src/
│   │   ├── components/ # MobileLandingPage component
│   │   ├── pages/      # Next.js pages
│   │   └── styles/     # Global styles
│   └── package.json
│
├── variant-b/          # Landing page variant B
│   ├── public/         # Static assets (logo, videos)
│   ├── src/
│   │   ├── components/ # MobileLandingPage component (modified)
│   │   ├── pages/      # Next.js pages
│   │   └── styles/     # Global styles
│   └── package.json
│
└── README.md          # This file
```

## 🎨 Variant Differences

### Variant A
- **Headline:** "Plan your VFR routes in seconds"
- **Subheading:** "Learn how to do it in this short video"
- **CTA Button:** "Start Planning Your Flight" (White background with blue text)
- **Dev Port:** 3001

### Variant B
- **Headline:** "Your flight plan, simplified"
- **Subheading:** "Watch this quick tutorial and start planning"
- **CTA Button:** "Get Started Now" (Green/Emerald gradient)
- **Dev Port:** 3002

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

#### For Variant A:
```bash
cd variant-a
npm install
```

#### For Variant B:
```bash
cd variant-b
npm install
```

### Configuration

1. **Copy the environment file:**
   ```bash
   # For variant-a
   cd variant-a
   cp .env.example .env.local

   # For variant-b
   cd variant-b
   cp .env.example .env.local
   ```

2. **Edit `.env.local` and set your Skymapper URL:**
   ```env
   NEXT_PUBLIC_SKYMAPPER_URL=https://your-skymapper-domain.com
   NEXT_PUBLIC_VARIANT=A  # or B for variant-b
   ```

### Add Required Assets

Before running, you need to add these files to the `public/` folder of each variant:

1. **Logo:** `public/logo.png` - Your Skymapper logo (recommended: 200x200px)
2. **Video:** `public/videos/tutorial.mp4` - Your tutorial video

You can copy these from the main Skymapper project:

```bash
# From the standalone-landing-pages directory
cp ../vfr/public/logo.png variant-a/public/
cp ../vfr/public/logo.png variant-b/public/
cp ../vfr/public/videos/tutorial.mp4 variant-a/public/videos/
cp ../vfr/public/videos/tutorial.mp4 variant-b/public/videos/
```

## 🧪 Development

### Run Variant A:
```bash
cd variant-a
npm run dev
```
Access at: http://localhost:3001

### Run Variant B:
```bash
cd variant-b
npm run dev
```
Access at: http://localhost:3002

### Run Both Variants Simultaneously:
```bash
# Terminal 1
cd variant-a && npm run dev

# Terminal 2
cd variant-b && npm run dev
```

## 📦 Production Build

### Build for Production:
```bash
cd variant-a  # or variant-b
npm run build
npm start
```

### Static Export (Optional):
If you want to export as static HTML:
```bash
npm run export
```
This creates an `out/` folder with static files.

## 🌐 Deployment

You can deploy each variant to different platforms:

### Vercel (Recommended)
```bash
cd variant-a  # or variant-b
vercel
```

### Netlify
```bash
cd variant-a  # or variant-b
npm run build
# Deploy the .next folder
```

### Docker
Create a `Dockerfile` in each variant:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t skymapper-landing-a .
docker run -p 3000:3000 -e NEXT_PUBLIC_SKYMAPPER_URL=https:/skymapper.es skymapper-landing-a
```

## 📊 A/B Testing Setup

### 1. Deploy Both Variants
Deploy each variant to a separate URL:
- Variant A: `landing-a.yourdomain.com`
- Variant B: `landing-b.yourdomain.com`

### 2. Set Up Traffic Distribution

#### Using Cloudflare Workers:
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Random 50/50 split
  const variant = Math.random() < 0.5 ? 'A' : 'B'
  const url = variant === 'A'
    ? 'https://landing-a.yourdomain.com'
    : 'https://landing-b.yourdomain.com'

  return fetch(url)
}
```

#### Using Nginx:
```nginx
upstream landing_a {
    server landing-a.yourdomain.com;
}

upstream landing_b {
    server landing-b.yourdomain.com;
}

split_clients "${remote_addr}${http_user_agent}" $variant {
    50%     landing_a;
    *       landing_b;
}

server {
    listen 80;
    server_name landing.yourdomain.com;

    location / {
        proxy_pass http://$variant;
    }
}
```

### 3. Track Conversions

The landing pages include basic analytics tracking. When a user clicks the CTA button, it fires:

```javascript
gtag('event', 'conversion', {
  variant: 'A', // or 'B'
  timestamp: new Date().toISOString(),
});
```

Set up Google Analytics or your preferred analytics tool to track these events.

### 4. Monitor Results

Track these metrics:
- **Conversion Rate:** Clicks on CTA button
- **Time on Page:** How long users stay
- **Video Plays:** How many users watch the video
- **Bounce Rate:** Users who leave without clicking CTA

## 🔧 Customization

### Modify Colors:
Edit `src/components/MobileLandingPage.tsx` and update Tailwind classes.

### Change Copy:
Edit the headline and subheading in `MobileLandingPage.tsx`:
```tsx
<h1>Your Custom Headline</h1>
<p>Your custom subheading</p>
```

### Update CTA Button:
Modify the button text and styling in `MobileLandingPage.tsx`:
```tsx
<button onClick={handleStartPlanning}>
  Your Custom CTA Text
</button>
```

## 📱 Mobile Optimization

Both variants are optimized for mobile:
- Responsive design with Tailwind CSS
- Touch-friendly buttons
- Optimized animations (fewer elements on mobile)
- Video controls adapted for mobile
- Fast loading with Next.js optimization

## 🐛 Troubleshooting

### Video not loading:
- Ensure `tutorial.mp4` is in `public/videos/`
- Check video codec compatibility (H.264 recommended)

### Logo not showing:
- Ensure `logo.png` is in `public/`
- Check image format (PNG or JPG)

### Redirect not working:
- Verify `NEXT_PUBLIC_SKYMAPPER_URL` in `.env.local`
- Check browser console for errors

### Port already in use:
```bash
# Change port in package.json scripts
"dev": "next dev -p 3003"  # Use different port
```

## 📝 License

Part of the Skymapper project. All rights reserved.

## 🤝 Contributing

This is a standalone export for A/B testing. Modifications should be made and then copied to deployment locations.

---

**Questions?** Contact the Skymapper development team.
