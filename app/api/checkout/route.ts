import { Checkout } from "@polar-sh/nextjs"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// ─────────────────────────────────────────────
// CHECKOUT
// GET /api/checkout?products=<polarProductId>
//
// Guards with Clerk auth, injects customerExternalId (Clerk userId)
// into the URL so Polar links the checkout to this user.
// On success, Polar redirects to /billing?success=true&checkoutId=xxx
// which the billing page uses to confirm and grant credits.
// ─────────────────────────────────────────────

export const GET = async (req: NextRequest) => {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  // Inject the Clerk userId as customerExternalId so Polar
  // stores it on the checkout — we verify it in /api/checkout/confirm
  const url = new URL(req.url)
  url.searchParams.set("customerExternalId", userId)

  return Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    server: "sandbox",
    theme: "dark",
  })(new NextRequest(url, req))
}