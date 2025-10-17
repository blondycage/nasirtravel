# Naasir Travel - Landing Page

A modern, animated landing page for Naasir Travel built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- 🎨 **Modern Design**: Sleek, professional design with blue and orange brand colors
- ✨ **Smooth Animations**: Framer Motion animations throughout
- 📱 **Responsive**: Fully responsive design for all devices
- 🖼️ **Image Carousel**: Animated hero section with image carousel
- 🎯 **Optimized**: Built with Next.js for optimal performance
- 🎭 **Interactive**: Engaging user experience with hover effects and transitions

## Tech Stack

- **Framework**: Next.js 15.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Images**: Next.js Image component with Unsplash

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
naasirtravel/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx        # Navigation header with mobile menu
│   ├── Hero.tsx          # Animated hero section with carousel
│   ├── Features.tsx      # Services and features section
│   ├── Testimonials.tsx  # Customer testimonials
│   └── Footer.tsx        # Contact info and links
├── public/
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Sections

1. **Header** - Sticky navigation with mobile menu
2. **Hero** - Full-screen animated carousel with text that changes per image
3. **Features** - Tour & holiday services with animated cards
4. **Testimonials** - Customer reviews with ratings
5. **Footer** - Contact information, hours, and useful links

## Customization

- **Colors**: Edit `tailwind.config.ts` to change brand colors
- **Images**: Replace Unsplash URLs in `components/Hero.tsx`
- **Content**: Update text in respective component files

## Contact Information

- **Address**: #803 – 6081 No. 3 RD, Richmond, BC V6Y 2B1
- **Phone**: +1 (888)-662-7467 / +1 (604) 330-0307
- **Email**: info@naasirtravel.com
