"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiService } from "@/services/api"

// Preset ATM amounts
const PRESET_AMOUNTS = [20, 50, 100, 200, 500, 1000]

export function ATMInterface() {
  // Step state: 1 = select account, 2 = select action, 3 = select amount
  const [step, setStep] = useState(1)
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null)
  const [action, setAction] = useState<"withdraw" | "deposit" | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  // Fetch all accounts on mount
  useEffect(() => {
    setIsLoading(true)
    apiService.getCustomerAccounts()
      .then((data) => setAccounts(data as any[]))
      .catch(() => setMessage("Failed to load accounts"))
      .finally(() => setIsLoading(false))
  }, [])

  // Reset state when going back
  function resetToStep1() {
    setStep(1)
    setSelectedAccount(null)
    setAction(null)
    setAmount(null)
    setCustomAmount("")
    setMessage("")
    setStatus("idle")
  }

  // Handle deposit/withdraw
  async function handleTransaction(amt: number) {
    if (!selectedAccount || !action) return
    setIsLoading(true)
    setStatus("idle")
    setMessage("")
    try {
      // Ensure amount is always a double with two decimals (e.g., 50.00, 50.25)
      const doubleAmount = Math.round(Number(amt) * 100) / 100
      if (action === "withdraw") {
        // Get the current balance from the accounts state
        const currentAccount = accounts.find(acc => acc.id === selectedAccount.id)
        const currentBalance = currentAccount ? currentAccount.balance : selectedAccount.balance
        
        if (currentBalance <= 0) {
          setIsLoading(false)
          setStatus("error")
          setMessage("Insufficient funds: Your balance is zero.")
          return
        }
        
        if (doubleAmount > currentBalance) {
          setIsLoading(false)
          setStatus("error")
          setMessage(`Insufficient funds: You only have €${currentBalance.toFixed(2)} available.`)
          return
        }
        await apiService.atmWithdraw(selectedAccount.iban, doubleAmount)
        setMessage(`Withdrew €${doubleAmount.toFixed(2)} from ${selectedAccount.iban}`)
        setStatus("success")
        setAccounts((prev) => prev.map(acc => acc.id === selectedAccount.id ? { ...acc, balance: acc.balance - doubleAmount } : acc))
      } else {
        await apiService.atmDeposit(selectedAccount.iban, doubleAmount)
        setMessage(`Deposited €${doubleAmount.toFixed(2)} to ${selectedAccount.iban}`)
        setStatus("success")
        setAccounts((prev) => prev.map(acc => acc.id === selectedAccount.id ? { ...acc, balance: acc.balance + doubleAmount } : acc))
      }
      setAmount(doubleAmount)
    } catch (e) {
      setMessage("Transaction failed. Please try again.")
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  // ATM legacy style container
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1a12] to-[#1a2a2f]">
      <div className="relative w-[520px] h-[700px] bg-[#16281b] rounded-[32px] shadow-2xl border-[12px] border-[#2e3d2f] flex flex-col items-center justify-center overflow-hidden retro-atm" style={{boxShadow: '0 0 60px #0a1a12'}}>
        {/* ATM screen border */}
        <div className="absolute inset-0 border-[6px] border-[#3fa36c] rounded-[24px] pointer-events-none" style={{zIndex:2}} />
        {/* ATM screen content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10 text-[#7fffa7] font-mono">
          {/* Step 1: Select account */}
          {step === 1 && (
            <>
              <div className="mb-4 text-center">
                <div className="text-2xl font-bold mb-2">Welcome to Legacy ATM</div>
                <div className="text-base text-blue-200">Select an account to continue</div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {isLoading ? (
                  <div className="text-center text-blue-200">Loading accounts...</div>
                ) : accounts.length === 0 ? (
                  <div className="text-center text-red-300">No accounts found</div>
                ) : accounts.map(acc => (
                  <Button key={acc.id} className="w-full justify-between bg-blue-800 hover:bg-blue-700 border border-blue-400 text-lg font-mono" onClick={() => { setSelectedAccount(acc); setStep(2) }}>
                    <span>{acc.iban}</span>
                    <span>€{acc.balance?.toFixed(2)}</span>
                  </Button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Select action */}
          {step === 2 && selectedAccount && (
            <>
              <div className="mb-4 text-center">
                <div className="text-xl font-bold mb-2">Account: {selectedAccount.iban}</div>
                <div className="text-base text-blue-200">Balance: €{selectedAccount.balance?.toFixed(2)}</div>
              </div>
              <div className="flex flex-col gap-4 w-full">
                <Button className="w-full bg-green-700 hover:bg-green-600 text-lg" onClick={() => { setAction("deposit"); setStep(3) }}>Deposit</Button>
                <Button className="w-full bg-yellow-700 hover:bg-yellow-600 text-lg" onClick={() => { setAction("withdraw"); setStep(3) }}>Withdraw</Button>
                <Button variant="outline" className="w-full mt-2" onClick={resetToStep1}>Back</Button>
              </div>
            </>
          )}

          {/* Step 3: Select amount */}
          {step === 3 && selectedAccount && action && (
            <>
              <div className="mb-4 text-center">
                <div className="text-xl font-bold mb-2">{action === "withdraw" ? "Withdraw" : "Deposit"} from {selectedAccount.iban}</div>
                <div className="text-base text-blue-200">Balance: €{accounts.find(a => a.id === selectedAccount.id)?.balance?.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mb-4">
                {PRESET_AMOUNTS.map((amt) => (
                  <Button key={amt} className="bg-blue-700 hover:bg-blue-600 text-lg" onClick={() => handleTransaction(amt)} disabled={isLoading}>{amt} €</Button>
                ))}
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Custom €"
                  className="col-span-2 text-white text-lg px-3 py-2 bg-[#1e2d23] border-[#3fa36c] focus:ring-[#3fa36c]"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  disabled={isLoading}
                />
                <Button className="col-span-2 bg-blue-900 hover:bg-blue-800 mt-1" onClick={() => { const val = parseFloat(customAmount); if (val > 0) handleTransaction(val) }} disabled={isLoading || !customAmount}>Enter Custom Amount</Button>
              </div>
              {status !== "idle" && (
                <div className={`text-center mb-2 ${status === "success" ? "text-green-300" : "text-red-300"}`}>{message}</div>
              )}
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="w-full" onClick={() => setStep(2)}>Back</Button>
                <Button variant="outline" className="w-full" onClick={resetToStep1}>End</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
