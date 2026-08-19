import './globals.css';
import dynamic from 'next/dynamic';
const MoltenMetal = dynamic(() => import('@/components/moltenmetal/MoltenMetal'), { ssr: false });

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
  <body className="relative h-full bg-gray-900 text-gray-900 antialiased font-sans">
    {/* Full‑screen molten metal background */}
    <MoltenMetal
      className="fixed inset-0 -z-10 pointer-events-none"
      color1="#12002B"
      color2="#2C005E"
      color3="#FFFFFF"
      speed={0.2}
      scale={5}
      detail={4}
      glow={1.8}
      coreSize={0.08}
      swirl={1.2}
      fold={-0.15}
      blackPoint={0.07}
      brightness={1.4}
      colorMode="molten"
      grain={true}
      grainIntensity={0.04}
      mouseInteraction={true}
      mouseStrength={0.2}
      opacity={0.9}
    />
    {children}
  </body>
    </html>
  );
}