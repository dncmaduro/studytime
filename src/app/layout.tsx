import type { Metadata } from "next";

import { Providers } from "@/app/providers";
import { env } from "@/lib/env";
import { getServerLocale } from "@/lib/i18n-server";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: env.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: "Responsive study time tracker built with Next.js and Neon.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale}>
      <body>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-0 size-72 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="absolute right-10 top-1/3 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-10 size-64 rounded-full bg-pink-500/10 blur-3xl" />
        </div>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
