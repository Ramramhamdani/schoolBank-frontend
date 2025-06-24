// API service layer for REST calls to Spring Boot backend

import {date} from "zod";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://schoolbank-backend.onrender.com:8080"
import Cookies from "js-cookie"

class ApiService {
  private getAuthHeaders() {
    const token = Cookies.get("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = this.getAuthHeaders()
    const config = {
      headers,
      credentials: 'include' as RequestCredentials,
      ...options,
    }

    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || `API Error: ${response.status}`)
      }

      // Only parse JSON if there is content
      if (response.status === 204) {
        return null as T
      }
      return response.json()
    } catch (error) {
      throw error
    }
  }

  private getUserIdFromToken(): string | null {
    try {
      const token = Cookies.get("token")
      if (!token) {
        return null
      }

      // Decode the JWT token to get the user ID
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.sub
    } catch (error) {
      console.error('Error decoding JWT token:', error)
      return null
    }
  }

  // Authentication
  async login(credentials: { email: string; password: string }) {
    console.log(JSON.stringify(credentials))
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  // User Management
  async register(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`)
  }

  // Account Management
  async getAllAccounts() {
    return this.request("/accounts")
  }

  async getCustomerAccounts() {
    // Get the user ID from the JWT token
    const userId = this.getUserIdFromToken()
    if (!userId) {
      throw new Error("Not authenticated or invalid token")
    }

    return this.request(`/accounts/user/${userId}`)
  }

  async createAccount(accountData: { requestedAccountType: string; customerEmail: string }) {
    return this.request("/accounts", {
      method: "POST",
      body: JSON.stringify(accountData),
    })
  }

  async getAccountsByUserId(userId: string) {
    return this.request(`/accounts/user/${userId}`)
  }

  async getAccountById(id: string) {
    return this.request(`/accounts/${id}`)
  }

  async deactivateAccount(accountId: string) {
    return this.request(`/accounts/${accountId}`, {
      method: "PUT",
    });
  }

  // Transaction Management
  async createTransaction(transactionData: {
    fromIban: string
    toIban: string
    amount: number
    description?: string
  }) {
    // Get the user ID from the JWT token
    const userId = this.getUserIdFromToken()
    if (!userId) {
      throw new Error("Not authenticated or invalid token")
    }

    return this.request("/transactions", {
      method: "POST",
      body: JSON.stringify({
        ...transactionData,
        performingUserId: userId,
        typeOfTransaction: "TRANSFER"
      }),
    })
  }

  async getAccountTransactions(accountId: string) {
    return this.request(`/accounts/${accountId}/transactions`)
  }

  async getCustomerTransactions() {
    // Get the user's accounts first
    const accounts = await this.getCustomerAccounts() as any[]

    // Get transactions for each account
    const allTransactions: any[] = []
    for (const account of accounts) {
      try {
        const transactions = await this.getAccountTransactions(account.id) as any[]
        allTransactions.push(...transactions)
      } catch (error) {
        console.error(`Failed to fetch transactions for account ${account.id}:`, error)
      }
    }
    // Filter duplicate transaction
    const uniqueTransactions = Array.from(
        new Map(allTransactions.map(tx => [tx.id, tx])).values()
    )
    // Sort transactions by dateOfExecution (most recent first)
    return uniqueTransactions.sort((a, b) => new Date(b.dateOfExecution).getTime() - new Date(a.dateOfExecution).getTime());
  }

  // Employee/Admin methods (these would need backend endpoints)
  async getAllTransactions() {
    // For now, return empty array to prevent errors
    console.warn("getAllTransactions() called but no backend endpoint exists")
    return []
  }

  async getAllCustomers() {
    // For now, return empty array to prevent errors
    console.warn("getAllCustomers() called but no backend endpoint exists")
    return []
  }

  async getPendingApprovals() {
    // For now, return empty array to prevent errors
    console.warn("getPendingApprovals() called but no backend endpoint exists")
    return []
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.request(`/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async atmWithdraw(iban: string, amount: number) {
    const doubleAmount = Number(parseFloat(amount.toString()).toFixed(2));
    return this.request("/atm/withdraw", {
      method: "POST",
      body: JSON.stringify({ iban: iban, amount: doubleAmount}),
    })
  }
  async atmDeposit(iban: string, amount: number) {
    const doubleAmount = Number(parseFloat(amount.toString()).toFixed(2));
    return this.request("/atm/deposit", {
      method: "POST",
      body: JSON.stringify({ iban: iban, amount: doubleAmount}),
    })
  }
}

export const apiService = new ApiService()
