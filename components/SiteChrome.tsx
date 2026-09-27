'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
export default function SiteChrome({ position }: { position: 'header' | 'footer' }) {
  const pathname = usePathname()
  const isEmployee = pathname === '/employee' || pathname.startsWith('/employee/')
  const isWorkspace = ['/employee/book', '/employee/preview'].includes(pathname.replace(/\/$/, ''))
  if (position === 'footer') return isEmployee ? null : <Footer />
  return <>
    <a href={isWorkspace ? '#employee-content' : '#main-content'} className="sr-only z-[100] rounded-lg bg-brand-red font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:px-6 focus:py-3">Skip to content</a>
    {!isEmployee && <Header />}
  </>
}
