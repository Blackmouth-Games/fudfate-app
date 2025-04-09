
# Social Media Links Configuration

This document explains how to configure the social media links used in the FUDFate application.

## Available Social Media Platforms

The application currently supports the following social media platforms:
- X (formerly Twitter)
- Telegram (displayed as a message circle icon)

## Configuration Methods

There are two ways to configure the social media links:

### 1. Environment Variables

You can set the following environment variables:

```
SOCIAL_X_URL=https://twitter.com/yourusername
SOCIAL_TELEGRAM_URL=https://t.me/yourchannel
```

### 2. Direct Editing

If you don't want to use environment variables, you can edit the links directly in the `Footer.tsx` file:

```jsx
const socialLinks = {
  x: process.env.SOCIAL_X_URL || 'https://twitter.com/yourusername',
  telegram: process.env.SOCIAL_TELEGRAM_URL || 'https://t.me/yourchannel'
};
```

## Adding New Social Media Platforms

To add a new social media platform:

1. Import the icon from lucide-react in `Footer.tsx`
2. Add a new property to the `socialLinks` object
3. Add a new link element in the social links section of the Footer component
