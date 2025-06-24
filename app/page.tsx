import { CustomerDashboard } from "@/components/customer-dashboard"
import { EmployeeDashboard } from "@/components/employee-dashboard"
import { WelcomePage } from "@/components/welcome-page"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  return <CustomerDashboard />
}
