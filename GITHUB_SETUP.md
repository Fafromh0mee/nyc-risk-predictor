# 🚀 How to Push to GitHub

## Step 1: Create a new repository on GitHub
1. Go to https://github.com/new
2. Repository name: `nyc-risk-predictor` (or any name you want)
3. Description: "NYC Accident Risk Predictor - Interactive map visualization"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

## Step 2: Push your code

After creating the repository, run these commands:

```bash
cd "/Users/fafromh0me/Developer/Detect web"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/nyc-risk-predictor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel (Optional)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `frontend`
6. Click "Deploy"

Your app will be live at: `https://nyc-risk-predictor.vercel.app` (or similar)

---

## Quick Commands Summary

```bash
# Clone (for others)
git clone https://github.com/YOUR_USERNAME/nyc-risk-predictor.git
cd nyc-risk-predictor/frontend
pnpm install
pnpm dev

# Update after changes
git add .
git commit -m "Your commit message"
git push
```

## 📝 Project Status

✅ Git initialized
✅ All files committed
✅ Ready to push to GitHub
✅ Ready to deploy to Vercel

---

**Note:** Don't forget to replace `YOUR_USERNAME` with your actual GitHub username!
