import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Expergift — One Day, Four Experiences',
  description:
    'Scroll through one day by the sea, from sunrise to moonlight, and gift its four experiences on a single card.',
};

export const viewport: Viewport = {
  themeColor: '#050507',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-bone antialiased">{children}</body>
    </html>
  );
}
