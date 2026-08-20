import "./globals.css";

export const metadata = {
  title: "FeedSmith – Shape Your Feed",
  description:
    "Make the algorithm visible and steer your social media recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}