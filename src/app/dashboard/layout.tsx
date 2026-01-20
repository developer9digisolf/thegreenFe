import GreenSpaLayout from '../../components/green-spa/GreenSpaLayout'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <GreenSpaLayout>{children}</GreenSpaLayout>
}