import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
const font = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
});
export const metadata: Metadata = {
  title: { default: "كأنه بيت | أكل بيتي فلسطيني", template: "%s | كأنه بيت" },
  description: "أكل بيتي فلسطيني، معمول بمحبة ومن مكونات طازجة.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "كأنه بيت",
    description: "أكل بيتي فلسطيني، معمول بمحبة",
    locale: "ar_PS",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/brand/kano-beit-logo.png",
    apple: "/images/brand/kano-beit-logo.png",
  },
};
const themeScript = `(()=>{try{const s=localStorage.getItem('k2nobeit-theme');const t=s==='day'||s==='night'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'night':'day');document.documentElement.dataset.theme=t}catch{document.documentElement.dataset.theme='day'}})()`;
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={font.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
