"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/services/api"

interface Transaction {
  id: string
  fromIban: string
  toIban: string
  amount: number
  typeOfTransaction: string
  description?: string
  dateOfExecution: string
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiService.getCustomerTransactions()
        setTransactions(data as Transaction[])
      } catch (error: any) {
        setError(error.message || "Failed to load transactions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (isLoading) {
    return <div>Loading transactions...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardHeader>
            <CardTitle>{new Date(transaction.dateOfExecution).toLocaleString()}</CardTitle>
            <CardDescription>
              Type: {transaction.typeOfTransaction.charAt(0).toUpperCase() + transaction.typeOfTransaction.slice(1).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">From</p>
                <p>{transaction.fromIban}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p>{transaction.toIban}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-lg font-bold">€{transaction.amount.toFixed(2)}</p>
              </div>
              {transaction.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{transaction.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
