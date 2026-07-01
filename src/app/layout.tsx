import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProfileProvider } from "@/context/ProfileContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "뽑아듀오 - 사용자 정보 입력",
  description: "경험/역량/가치관 정보를 입력하고 나에게 맞는 채용공고를 추천받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
