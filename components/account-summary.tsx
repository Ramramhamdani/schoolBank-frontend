"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/services/api"

interface Account {
  id: string
  iban: string
  typeOfAccount: string
  balance: number
}

export function AccountSummary() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await apiService.getCustomerAccounts()
        setAccounts(data as Account[])
      } catch (error: any) {
        setError(error.message || "Failed to load accounts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  if (isLoading) {
    return <div>Loading accounts...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader>
            <CardTitle>{account.typeOfAccount}</CardTitle>
            <CardDescription>{account.iban}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{account.balance.toFixed(2)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
