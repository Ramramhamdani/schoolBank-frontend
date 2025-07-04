'use client'
import { TransactionForm } from "@/components/transaction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export const dynamic = 'force-dynamic'

function TransactionPageContent() {
    const searchParams = useSearchParams();
    const prefillToIban = searchParams.get('toIban') || "";

    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 text-3xl font-bold">Make a Transaction</h1>
            <Card>
                <CardHeader>
                    <CardTitle>New Transaction</CardTitle>
                    <CardDescription>Transfer money to another account or pay bills</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionForm prefillToIban={prefillToIban} />
                </CardContent>
            </Card>
        </div>
    )
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-6">Loading...</div>}>
            <TransactionPageContent />
        </Suspense>
    )
}