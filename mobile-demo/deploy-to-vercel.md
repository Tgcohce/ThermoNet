# 🚀 Deploy ThermoNet to Vercel

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Prepare for Deployment
```bash
# Build static files
npm run build

# Login to Vercel (first time only)
vercel login
```

## Step 3: Deploy
```bash
# Deploy to production
vercel --prod

# Or deploy to preview first
vercel
```

## Step 4: Your App Will Be Live!
Vercel will give you a URL like: `https://thermonet-mobile-abc123.vercel.app`

## Step 5: Update Mobile App
After deployment, update your mobile app to use the production URL instead of localhost.

## Alternative: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Auto-deploy on every push

## Environment Variables
If needed, set in Vercel dashboard:
- `NODE_ENV=production`
- Any API keys or secrets

## Custom Domain (Optional)
1. Go to Vercel dashboard
2. Add your custom domain
3. Update DNS records

## Testing Deployment
1. Visit your Vercel URL
2. Test on phone: `https://your-app.vercel.app`
3. Add to home screen
4. Test data collection