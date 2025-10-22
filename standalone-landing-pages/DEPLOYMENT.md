# Deployment Guide - Skymapper Landing Pages

Quick reference for deploying the standalone landing pages for A/B testing.

## 🎯 Quick Start Checklist

- [ ] Copy assets (logo.png, tutorial.mp4) to public folders
- [ ] Set up `.env.local` with production Skymapper URL
- [ ] Test both variants locally
- [ ] Deploy variant A to hosting platform
- [ ] Deploy variant B to hosting platform
- [ ] Set up traffic distribution (50/50 split)
- [ ] Configure analytics tracking
- [ ] Monitor conversion rates

## 📋 Pre-Deployment

### 1. Copy Assets from Main Project

```bash
# From standalone-landing-pages directory
cp ../vfr/public/logo.png variant-a/public/
cp ../vfr/public/logo.png variant-b/public/
cp ../vfr/public/videos/tutorial.mp4 variant-a/public/videos/
cp ../vfr/public/videos/tutorial.mp4 variant-b/public/videos/
```

### 2. Configure Environment Variables

Create `.env.local` in each variant:

**variant-a/.env.local:**
```env
NEXT_PUBLIC_SKYMAPPER_URL=https://skymapper.yourdomain.com
NEXT_PUBLIC_VARIANT=A
```

**variant-b/.env.local:**
```env
NEXT_PUBLIC_SKYMAPPER_URL=https://skymapper.yourdomain.com
NEXT_PUBLIC_VARIANT=B
```

### 3. Test Locally

```bash
# Terminal 1
cd variant-a
npm install
npm run dev

# Terminal 2
cd variant-b
npm install
npm run dev
```

- Test variant A at: http://localhost:3001
- Test variant B at: http://localhost:3002

## 🚀 Deployment Options

### Option 1: Vercel (Easiest)

#### Deploy Variant A:
```bash
cd variant-a
vercel --prod
```

When prompted:
- Set project name: `skymapper-landing-a`
- Set environment variables:
  - `NEXT_PUBLIC_SKYMAPPER_URL`
  - `NEXT_PUBLIC_VARIANT=A`

#### Deploy Variant B:
```bash
cd variant-b
vercel --prod
```

When prompted:
- Set project name: `skymapper-landing-b`
- Set environment variables:
  - `NEXT_PUBLIC_SKYMAPPER_URL`
  - `NEXT_PUBLIC_VARIANT=B`

**Result:**
- Variant A: `https://skymapper-landing-a.vercel.app`
- Variant B: `https://skymapper-landing-b.vercel.app`

---

### Option 2: Netlify

#### Deploy Variant A:
```bash
cd variant-a
npm run build
netlify deploy --prod
```

Set environment variables in Netlify dashboard:
- `NEXT_PUBLIC_SKYMAPPER_URL`
- `NEXT_PUBLIC_VARIANT=A`

#### Deploy Variant B:
```bash
cd variant-b
npm run build
netlify deploy --prod
```

Set environment variables in Netlify dashboard:
- `NEXT_PUBLIC_SKYMAPPER_URL`
- `NEXT_PUBLIC_VARIANT=B`

---

### Option 3: Docker + AWS/GCP/Azure

#### Create Dockerfile (add to each variant):

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SKYMAPPER_URL
ARG NEXT_PUBLIC_VARIANT
ENV NEXT_PUBLIC_SKYMAPPER_URL=$NEXT_PUBLIC_SKYMAPPER_URL
ENV NEXT_PUBLIC_VARIANT=$NEXT_PUBLIC_VARIANT
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

#### Build and Push:

**Variant A:**
```bash
cd variant-a
docker build -t skymapper-landing-a \
  --build-arg NEXT_PUBLIC_SKYMAPPER_URL=https://skymapper.com \
  --build-arg NEXT_PUBLIC_VARIANT=A .
docker tag skymapper-landing-a your-registry/skymapper-landing-a:latest
docker push your-registry/skymapper-landing-a:latest
```

**Variant B:**
```bash
cd variant-b
docker build -t skymapper-landing-b \
  --build-arg NEXT_PUBLIC_SKYMAPPER_URL=https://skymapper.com \
  --build-arg NEXT_PUBLIC_VARIANT=B .
docker tag skymapper-landing-b your-registry/skymapper-landing-b:latest
docker push your-registry/skymapper-landing-b:latest
```

---

## 🔀 Traffic Distribution Setup

### Option A: Cloudflare Workers (Recommended)

1. Create a new Cloudflare Worker
2. Add this code:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Get or set variant cookie
  const cookie = request.headers.get('cookie') || ''
  let variant = getCookie(cookie, 'landing_variant')

  // If no cookie, assign variant randomly (50/50)
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B'
  }

  // Route to appropriate variant
  const targetUrl = variant === 'A'
    ? 'https://skymapper-landing-a.vercel.app'
    : 'https://skymapper-landing-b.vercel.app'

  // Fetch from target
  const response = await fetch(targetUrl)

  // Clone response to modify headers
  const newResponse = new Response(response.body, response)

  // Set variant cookie (expires in 30 days)
  newResponse.headers.append(
    'Set-Cookie',
    `landing_variant=${variant}; Max-Age=2592000; Path=/; Secure; SameSite=Lax`
  )

  return newResponse
}

function getCookie(cookieString, name) {
  const match = cookieString.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}
```

3. Set your worker route to: `landing.yourdomain.com/*`

---

### Option B: Nginx Load Balancer

```nginx
upstream landing_a {
    server landing-a.yourdomain.com:3000;
}

upstream landing_b {
    server landing-b.yourdomain.com:3000;
}

# Split traffic 50/50 based on IP + User Agent
split_clients "${remote_addr}${http_user_agent}" $variant {
    50%     landing_a;
    *       landing_b;
}

server {
    listen 80;
    listen 443 ssl http2;
    server_name landing.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://$variant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Add variant header for tracking
        add_header X-Landing-Variant $variant always;
    }
}
```

---

### Option C: AWS CloudFront + Lambda@Edge

1. Deploy both variants to S3 or EC2
2. Create Lambda@Edge function:

```javascript
exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    // Check for existing variant cookie
    let variant = null;
    if (headers.cookie) {
        const cookies = headers.cookie[0].value.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'landing_variant') {
                variant = value;
                break;
            }
        }
    }

    // Assign variant if not set (50/50 split)
    if (!variant) {
        variant = Math.random() < 0.5 ? 'A' : 'B';
    }

    // Set origin based on variant
    if (variant === 'A') {
        request.origin.custom.domainName = 'landing-a.yourdomain.com';
    } else {
        request.origin.custom.domainName = 'landing-b.yourdomain.com';
    }

    request.headers['x-landing-variant'] = [{ value: variant }];

    return request;
};
```

---

## 📊 Analytics Setup

### Google Analytics 4

1. Add to `_app.tsx` in both variants:

```tsx
import Script from 'next/script';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}
```

2. Add to `.env.local`:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Track Key Metrics

The landing pages automatically track:
- **CTA Clicks:** Fires `conversion` event with variant ID
- **Video Plays:** Track manually if needed
- **Time on Page:** Automatic with GA4

---

## ✅ Post-Deployment Checklist

- [ ] Both variants are accessible via their URLs
- [ ] Redirect to main Skymapper app works correctly
- [ ] Video loads and plays properly
- [ ] Logo displays correctly
- [ ] Mobile responsive design works
- [ ] Analytics tracking is working
- [ ] Traffic split is approximately 50/50
- [ ] SSL certificates are valid
- [ ] Page load time is under 3 seconds

---

## 🔍 Monitoring

### Key Metrics to Track

1. **Conversion Rate:** `(CTA Clicks / Page Views) * 100`
2. **Bounce Rate:** Users leaving without clicking CTA
3. **Video Completion Rate:** Users watching full video
4. **Time to Conversion:** Time from page load to CTA click
5. **Mobile vs Desktop:** Performance by device type

### Recommended Tools

- Google Analytics 4
- Vercel Analytics
- Hotjar (heatmaps)
- Cloudflare Analytics

---

## 🐛 Troubleshooting

### Assets not loading
- Verify files are in `public/` folder before build
- Check build logs for missing file warnings

### Environment variables not working
- Rebuild after changing .env files
- Verify variables start with `NEXT_PUBLIC_`

### Redirect not working
- Check `NEXT_PUBLIC_SKYMAPPER_URL` format (include https://)
- Verify main Skymapper app is accessible

---

**Need help?** Contact the development team or open an issue.
