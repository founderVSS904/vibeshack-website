import type { Metadata } from 'next'
import './employee.css'
export const metadata: Metadata = { title: 'Employee booking', robots: { index: false, follow: false }, alternates: { canonical: '/employee/' } }
export default function EmployeeLayout({ children }: { children: React.ReactNode }) { return <div className="employee-app">{children}</div> }
