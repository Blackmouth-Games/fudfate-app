
# Social Media Links Configuration

This document explains how to configure the social media links used in the FUDFate application.

## Available Social Media Platforms

The application currently supports the following social media platforms:
- X (formerly Twitter) - displayed with the X icon
- Telegram (displayed as a message circle icon)
- GitHub (displayed with the GitHub icon)

## Configuration Methods

There are two ways to configure the social media links:

### 1. Environment Variables

You can set the following environment variables:

```
VITE_SOCIAL_X_URL=https://twitter.com/yourusername
VITE_SOCIAL_TELEGRAM_URL=https://t.me/yourchannel
VITE_SOCIAL_GITHUB_URL=https://github.com/yourusername
```

Note: With Vite, all environment variables must be prefixed with `VITE_` to be accessible in the client-side code.

### 2. Direct Editing

If you don't want to use environment variables, you can edit the links directly in the `socialConfig.ts` file:

```typescript
export const socialLinks = {
  x: import.meta.env.VITE_SOCIAL_X_URL || 'https://twitter.com/yourusername',
  telegram: import.meta.env.VITE_SOCIAL_TELEGRAM_URL || 'https://t.me/yourchannel',
  github: import.meta.env.VITE_SOCIAL_GITHUB_URL || 'https://github.com/yourusername'
};
```

## Adding New Social Media Platforms

To add a new social media platform:

1. Import the icon from lucide-react in `Footer.tsx`
2. Add a new property to the `socialLinks` object in `socialConfig.ts`
3. Add a new link element in the social links section of the Footer component
