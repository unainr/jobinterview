import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InferRequestType, InferResponseType } from "hono"
import { client } from "@/lib/hono"

// ─────────────────────────────────────────────
// GET BALANCE + PLAN
// ─────────────────────────────────────────────

export const useCreditsBalance = () =>
  useQuery({
    queryKey: ["credits", "balance"],
    queryFn: async () => {
      const res = await client.api.credits.balance.$get()
      if (!res.ok) throw new Error("Failed to fetch balance")
      const json = await res.json()
      return json.data // { balance, plan }
    },
    refetchOnWindowFocus: true,
  })

// ─────────────────────────────────────────────
// SPEND CREDITS — flat 10 per session
// ─────────────────────────────────────────────

type SpendCreditsReq = InferRequestType<typeof client.api.credits.spend.$post>["json"]
type SpendCreditsRes = InferResponseType<typeof client.api.credits.spend.$post, 200>

// variables is optional — call spendCredits() or spendCredits({ relatedSessionId })
export const useSpendCredits = () => {
  const qc = useQueryClient()

  return useMutation<SpendCreditsRes, Error, SpendCreditsReq | void>({
    mutationFn: async (data) => {
      const res = await client.api.credits.spend.$post({
        json: (data as SpendCreditsReq) ?? {},
      })

      if (res.status === 402) {
        throw new Error("INSUFFICIENT_CREDITS")
      }
      if (!res.ok) throw new Error("Failed to spend credits")

      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credits", "balance"] })
      qc.invalidateQueries({ queryKey: ["credits", "transactions"] })
    },
  })
}

// ─────────────────────────────────────────────
// TRANSACTION HISTORY
// ─────────────────────────────────────────────

export const useCreditTransactions = () =>
  useQuery({
    queryKey: ["credits", "transactions"],
    queryFn: async () => {
      const res = await client.api.credits.transactions.$get()
      if (!res.ok) throw new Error("Failed to fetch transactions")
      const json = await res.json()
      return json.data
    },
  })