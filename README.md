# POS Web Application

A modern, beautiful Point of Sale (POS) web application built with React, TypeScript, and Vite.

## Features

- 🛒 **Shopping Cart** - Add items, manage quantities, calculate totals
- 📁 **Category Management** - Create and manage product categories
- 📦 **Item Management** - Add, edit, and delete products
- 💳 **Payment Processing** - Support for Cash, Card, and UPI payments
- 💾 **Local Storage** - All data stored locally in browser
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Add Categories**: Go to Categories page and add product categories
2. **Add Items**: Go to Items page and add products with prices and stock
3. **Sell Items**: Go to Dashboard, search for items, and add them to cart
4. **Process Payment**: Go to Cart, review order, and proceed to payment
5. **Complete Sale**: Select payment method and complete the transaction

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Supabase** - PostgreSQL database (production)
- **Vercel** - Hosting and serverless functions
- **CSS3** - Styling with gradients and animations

## Data Storage

The app now uses **Supabase** (PostgreSQL database) for production deployment on Vercel. For local development without database setup, it falls back to LocalStorage.

**Production (Vercel + Supabase):**
- All data is stored in Supabase PostgreSQL database
- Data persists across all devices and browsers
- Supports multiple users and concurrent access

**Development (LocalStorage fallback):**
- Data stored in browser's LocalStorage
- Data persists across browser sessions but is specific to each browser/device
- Works without database setup for quick development

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Browser Support

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

MIT

