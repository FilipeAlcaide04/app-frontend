import { AuthNavbar } from "@/components/auth-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AuthNavbar />
      {children}
    </>
  )
}
