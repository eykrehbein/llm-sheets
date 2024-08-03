import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Provider as JotaiProvider } from 'jotai'
import 'cal-sans'
import './globals.css'
import '@glideapps/glide-data-grid/dist/index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'LLM Sheets',
    description: 'LLM powered spreadsheets',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <JotaiProvider>
            <html lang="en">
                <body className={inter.className}>
                    {children}

                    <div id="portal"></div>
                </body>
            </html>
        </JotaiProvider>
    )
}
