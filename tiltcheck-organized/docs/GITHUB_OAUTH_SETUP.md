# 🔐 GitHub OAuth Setup Guide for TrapHouse

## Step 1: Create GitHub OAuth App

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Click "OAuth Apps" → "New OAuth App"

2. **Fill in OAuth App Details**
   ```
   Application name: TrapHouse Mischief Manager
   Homepage URL: https://584a0654c7f9.ngrok-free.app
   Application description: Discord bot for gambling accountability and development tracking
   Authorization callback URL: https://584a0654c7f9.ngrok-free.app/github/oauth/callback
   ```

3. **Get OAuth Credentials**
   - After creating the app, you'll get:
     - **Client ID**: `Ov23liMyb9G5nh5AcP3F` (already in your .env)
     - **Client Secret**: Copy this and add to your .env file

## Step 2: Update Environment Variables

Add the GitHub Client Secret to your `.env` file:

```bash
GITHUB_CLIENT_SECRET=your_actual_github_oauth_client_secret_here
```

## Step 3: OAuth Flow URLs

Your OAuth integration provides these endpoints:

### 🔐 **Authorization URL**
```
https://584a0654c7f9.ngrok-free.app/github/oauth/authorize
```
- Redirects users to GitHub for authorization
- Handles scope and state parameters automatically

### 🔄 **Callback URL** 
```
https://584a0654c7f9.ngrok-free.app/github/oauth/callback
```
- Processes OAuth callback from GitHub
- Exchanges authorization code for access token
- Displays user info and token

## Step 4: OAuth Scopes Configured

Your integration requests these permissions:
- ✅ `repo` - Full repository access
- ✅ `workflow` - GitHub Actions workflows
- ✅ `write:repo_hook` - Create/modify webhooks
- ✅ `read:org` - Read organization info
- ✅ `notifications` - Access notifications

## Step 5: Test OAuth Flow

1. **Visit Authorization URL**: https://584a0654c7f9.ngrok-free.app/github/oauth/authorize
2. **GitHub will prompt** for permission to access your account
3. **Click "Authorize"** 
4. **You'll be redirected** back with your access token
5. **Save the token** to use in your integration

## Security Features

- ✅ **State Parameter**: Prevents CSRF attacks
- ✅ **Secure Redirects**: Only to registered callback URLs
- ✅ **Token Expiration**: Follows GitHub's token lifecycle
- ✅ **Scope Validation**: Only requests necessary permissions

## Integration with Discord Bot

Once OAuth is complete, the access token can be used for:
- 📝 Creating repository webhooks programmatically
- 🔍 Reading repository information
- 📊 Accessing GitHub API on behalf of users
- 🚀 Managing GitHub Actions workflows

## Current Status

- ✅ **OAuth App Configuration**: Ready to create
- ✅ **Endpoints Available**: Authorization and callback URLs active
- ✅ **Ngrok Tunnel**: https://584a0654c7f9.ngrok-free.app
- ⏳ **Needs**: GitHub Client Secret from OAuth app creation

## Next Steps

1. Create the GitHub OAuth App with the URLs above
2. Copy the Client Secret to your `.env` file
3. Restart the bot to load the new configuration
4. Test the OAuth flow by visiting the authorization URL
