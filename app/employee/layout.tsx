import type { Metadata } from 'next'
import EmployeeShell from './EmployeeShell'
import './employee.css'
export const metadata: Metadata = { title: 'Employee booking', robots: { index: false, follow: false }, alternates: { canonical: '/employee/' } }
export default function EmployeeLayout({ children }: { children: React.ReactNode }) { return <EmployeeShell>{children}</EmployeeShell> }
