# GitHub Pages Setup Guide

This guide will help you enable GitHub Pages for the TiltCheck repository so the landing page is visible when you visit the GitHub Pages URL.

## Prerequisites

- Admin access to the GitHub repository
- This PR merged to the main branch

## Setup Steps

### 1. Navigate to Repository Settings

1. Go to your repository: `https://github.com/jmenichole/TiltCheck`
2. Click on **Settings** tab at the top
3. Scroll down in the left sidebar and click on **Pages** under "Code and automation"

### 2. Configure GitHub Pages Source

On the Pages settings page:

1. Under **"Build and deployment"** section
2. For **Source**, select **"GitHub Actions"** from the dropdown menu
   - **Important**: Do NOT select "Deploy from a branch"
   - Select "GitHub Actions" instead
3. No need to select a branch when using GitHub Actions
4. Click **Save** if there's a save button (the setting auto-saves in most cases)

### 3. Verify Workflow Permissions

1. In the left sidebar of Settings, click on **Actions** → **General**
2. Scroll down to **"Workflow permissions"**
3. Ensure **"Read and write permissions"** is selected
4. Check the box for **"Allow GitHub Actions to create and approve pull requests"** (optional but recommended)
5. Click **Save** if needed

### 4. Trigger the First Deployment

After merging this PR, the deployment will automatically trigger. You can also:

1. Go to the **Actions** tab in your repository
2. Click on the **"Deploy to GitHub Pages"** workflow in the left sidebar
3. Click **"Run workflow"** button on the right
4. Select the **main** branch
5. Click **"Run workflow"**

### 5. Wait for Deployment

1. The workflow will take 2-3 minutes to complete
2. Watch the progress in the **Actions** tab
3. Once complete, you'll see a green checkmark ✓

### 6. Access Your Site

Your TiltCheck landing page will be available at:

**https://jmenichole.github.io/TiltCheck/**

## Troubleshooting

### Page Shows 404 Error

- **Solution**: Make sure you selected "GitHub Actions" as the source, not "Deploy from a branch"
- Verify the workflow completed successfully in the Actions tab
- Wait a few minutes after deployment (DNS propagation)

### Workflow Failed

- Check the workflow logs in the Actions tab
- Ensure workflow permissions are set correctly (see Step 3)
- Verify that the main branch has the `.github/workflows/deploy.yml` file

### Blank Page or Errors

- Open browser console (F12) to check for JavaScript errors
- Verify the build completed successfully in the workflow logs
- Check that the `homepage` field in `package.json` matches: `"homepage": "https://jmenichole.github.io/TiltCheck/"`

### Need to Redeploy

Just push any commit to the main branch, or manually trigger the workflow:

1. Go to **Actions** tab
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"**
4. Select **main** branch
5. Click **"Run workflow"**

## What the Workflow Does

The automated deployment workflow (`deploy.yml`):

1. ✅ Checks out the code from the main branch
2. ✅ Sets up Node.js environment
3. ✅ Installs dependencies with `npm ci`
4. ✅ Builds the React application with `npm run build`
5. ✅ Uploads the build artifacts to GitHub Pages
6. ✅ Deploys the site to the GitHub Pages environment

## Manual Local Build (Optional)

To test the build locally before deployment:

```bash
# Install dependencies
npm install

# Create production build
npm run build

# Test the build locally (requires serve package)
npx serve -s build -l 3000
```

Then visit `http://localhost:3000` to preview the production build.

## Support

If you encounter issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
2. Review workflow logs in the Actions tab
3. Verify all settings match this guide

## Additional Notes

- The site automatically redeploys when you push to the main branch
- The homepage in `package.json` is already configured correctly
- The build process includes production optimizations
- All static assets are properly handled by the workflow
