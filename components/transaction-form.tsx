"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/services/api"

interface Account {
  id: string
  iban: string
  typeOfAccount: string
  balance: number
}

interface TransactionFormProps {
  prefillToIban?: string
}

export function TransactionForm({ prefillToIban = "" }: TransactionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [toIban, setToIban] = useState(prefillToIban)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await apiService.getCustomerAccounts()
        setAccounts(data as Account[])
      } catch (error) {
        console.error("Failed to fetch accounts:", error)
      }
    }

    fetchAccounts()
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    const formData = new FormData(event.currentTarget)
    const transactionData = {
      fromIban: formData.get("fromIban") as string,
      toIban: formData.get("toIban") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
    }

    try {
      await apiService.createTransaction(transactionData)
      setStatus("success")
      setMessage("Transfer completed successfully!")

      setTimeout(() => {
        router.push("/transactions")
      }, 2000)
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Transfer failed. Please check your inputs and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        {status === "success" && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromIban">From Account</Label>
            <Select name="fromIban" disabled={isLoading} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.iban}>
                    {account.typeOfAccount.charAt(0).toUpperCase() + account.typeOfAccount.slice(1).toLowerCase()} Account
                    - {account.iban} (€{account.balance.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toIban">Recipient IBAN</Label>
            <Input
              id="toIban"
              name="toIban"
              placeholder="IBAN"
              disabled={isLoading}
              required
              value={toIban}
              onChange={e => setToIban(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add a note about this transfer"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Complete Transfer"}
          </Button>
        </div>
      </form>
    </div>
  )
}
