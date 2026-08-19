import './globals.css';

export const metadata = {
  title: 'FeedSmith – Shape Your Feed',
  description: 'Make the algorithm visible and steer your social media recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}