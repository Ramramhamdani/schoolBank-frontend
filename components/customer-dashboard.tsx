"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from "lucide-react"
import { CustomerAccounts } from "@/components/customer-accounts"
import { CustomerTransactions } from "@/components/customer-transactions"
import { CreateAccountForm } from "@/components/create-account-form"
import { apiService } from "@/services/api"

interface Account {
  id: string
  iban: string
  typeOfAccount: string
  balance: number
  absoluteLimit: number
  dailyLimit: number
}


export function CustomerDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAccounts = async () => {
    try {
      const data = await apiService.getCustomerAccounts()

      const fetchAccounts = async () => {
        try {
          const data = await apiService.getCustomerAccounts()

          const mapped = (data as any[]).map(acc => ({
            ...acc,
            typeOfAccount: acc.type ? acc.type.toUpperCase() : "UNKNOWN"
          }))

          setAccounts(mapped as Account[])
        } catch (error) {
          console.error("Failed to fetch accounts:", error)
        } finally {
          setIsLoading(false)
        }
      }

      setAccounts(data as Account[])
    } catch (error) {
      console.error("Failed to fetch accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 mb-6">
        {/* Total Balance Card */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <div className="text-2xl font-bold mt-1">
                €{totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
        </Card>

        {/* Available Accounts Card */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Available Accounts</CardTitle>
              <div className="text-2xl font-bold mt-1">{accounts.length}</div>
            </div>
            <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList>
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="accounts" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <CustomerAccounts accounts={accounts} onDeleteAccount={(accountId: string) => {
                setAccounts(prev => prev.filter(acc => acc.id !== accountId));
              }} />
              <CreateAccountForm onAccountCreated={fetchAccounts} />
            </div>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <CustomerTransactions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
