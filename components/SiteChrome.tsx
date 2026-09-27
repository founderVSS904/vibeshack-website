'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
export default function SiteChrome({ position }: { position: 'header' | 'footer' }) {
  const pathname = usePathname()
  if (pathname === '/employee' || pathname === '/employee/') return null
  if (position === 'footer' && (pathname === '/employee' || pathname.startsWith('/employee/'))) return null
  return position === 'header' ? <Header /> : <Footer />
}
