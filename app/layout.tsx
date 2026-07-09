import type { Metadata } from "next";
import "./globals.css";
import FloatingChatbotButton from "./components/FloatingChatbotButton";

export const metadata: Metadata = {
  title: "공고마감 by LIKELION",
  description: "검증된 IT 인재를 채용비 50%로. 상위 대학·전 직장 출신 인재를 빠르게 만나보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap" rel="stylesheet" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <FloatingChatbotButton />
      </body>
    </html>
  );
}
