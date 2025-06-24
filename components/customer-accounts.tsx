import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface Account {
  id: string
  iban: string
  typeOfAccount: string
  balance: number
  absoluteLimit: number
  dailyLimit: number
}

interface CustomerAccountsProps {
  accounts: Account[]
  onDeleteAccount: (accountId: string) => void
}

export function CustomerAccounts({ accounts, onDeleteAccount }: CustomerAccountsProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {account.typeOfAccount === 'CURRENT'
                      ? 'Current Account'
                      : account.typeOfAccount === 'SAVINGS'
                      ? 'Savings Account'
                      : 'Unknown Account'}
                  </p>
                  <p className="text-sm text-muted-foreground">IBAN: {account.iban}</p>
                </div>
                <p className="text-xl font-bold">
                  €{account.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex w-full items-center justify-between gap-2">
                <AlertDialog>
                  <div className="flex items-center gap-1">
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={account.balance !== 0}
                        title={account.balance !== 0 ? "Account must be empty to delete" : "Delete this account"}
                        onClick={() => setPendingDeleteId(account.id)}
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    {account.balance !== 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          You can only delete accounts with a zero balance. Please transfer or withdraw all funds before deleting.
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this account? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            await apiService.deactivateAccount(account.id);
                            onDeleteAccount(account.id);
                          } catch (error) {
                            alert("Failed to delete account.");
                          } finally {
                            setPendingDeleteId(null);
                          }
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/transactions?toIban=${encodeURIComponent(account.iban)}`}>
                    <span className="mr-2">Transfer</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}
