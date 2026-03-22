import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CyclicalIQ',
  description: 'Pre-inflection investment research — find what\'s most beaten down before anyone else notices',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Mobile gate — desktop only v1 */}
        <div
          id="mobile-gate"
          className="hidden fixed inset-0 z-50 items-center justify-center bg-slate-50 p-8 text-center"
        >
          <div>
            <p className="text-xl font-semibold text-slate-900 mb-2">CyclicalIQ</p>
            <p className="text-slate-500 text-sm max-w-xs">
              CyclicalIQ works best on a larger screen.<br />
              Resize or use a desktop browser.
            </p>
          </div>
        </div>
        <div id="app-content">{children}</div>
      </body>
    </html>
  )
}
