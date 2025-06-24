"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
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

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiService.getCustomerTransactions()
        // Get only the 5 most recent transactions for the compact view
        const recentData = (data as Transaction[]).slice(0, 5)
        setTransactions(recentData)
        setFilteredTransactions(recentData)
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(transaction => 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.typeOfTransaction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.fromIban.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.toIban.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTransactions(filtered)
    } else {
      setFilteredTransactions(transactions)
    }
  }, [searchTerm, transactions])

  const clearSearch = () => {
    setSearchTerm("")
  }

  if (isLoading) {
    return <div>Loading recent transactions...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Your latest financial activity</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide" : "Show"} Filters
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={clearSearch}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">
                        {transaction.description || "Transfer"}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.typeOfTransaction.charAt(0).toUpperCase() + transaction.typeOfTransaction.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>From: {transaction.fromIban}</div>
                      <div>To: {transaction.toIban}</div>
                      <div>{new Date(transaction.dateOfExecution).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {transaction.amount > 0 ? "+" : ""}€{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "No transactions match your search." : "No recent transactions found."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="sm" asChild>
            <a href="/transactions/history">View All Transactions</a>
          </Button>
        </div>
      )}
    </div>
  )
}
