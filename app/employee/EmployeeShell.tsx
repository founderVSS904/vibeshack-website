'use client'

import { usePathname } from 'next/navigation'
import styles from './EmployeeSignIn.module.css'

export default function EmployeeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSignIn = ['/employee', '/employee/', '/employee/password', '/employee/password/'].includes(pathname)
  return <div className={isSignIn ? styles.shell : 'employee-app'}>{children}</div>
}
