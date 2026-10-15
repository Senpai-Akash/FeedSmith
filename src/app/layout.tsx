import "./globals.css";
import { ProductFeedbackTrigger } from "@/components/feedback/ProductFeedbackTrigger";

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
      <body>
        {children}
        <ProductFeedbackTrigger />
      </body>
    </html>
  );
}