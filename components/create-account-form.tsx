"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiService } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface CreateAccountFormProps {
  onAccountCreated: () => void
}

export function CreateAccountForm({ onAccountCreated }: CreateAccountFormProps) {
  const [accountType, setAccountType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) {
      toast({
        title: "Error",
        description: "Please log in again to create an account",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const response = await apiService.createAccount({
        requestedAccountType: accountType,
        customerEmail: userEmail
      })

      toast({
        title: "Success",
        description: "Account created successfully",
      })

      // Reset form and refresh accounts
      setAccountType("")
      onAccountCreated()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Account</CardTitle>
        <CardDescription>Select the type of account you want to create</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="accountType" className="text-sm font-medium">
              Account Type
            </label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CURRENT">Current Account</SelectItem>
                <SelectItem value="SAVINGS">Savings Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={!accountType || isLoading}>
            {isLoading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 