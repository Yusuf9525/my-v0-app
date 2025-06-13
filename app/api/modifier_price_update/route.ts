import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Call your actual webhook
    try {
      const response = await fetch("https://n8n.foodbot.ai/webhook/update_modifier_price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`)
      }

      const webhookData = await response.json()

      // Return the webhook response directly
      return NextResponse.json(webhookData)
    } catch (webhookError) {
      return NextResponse.json({ error: "Failed to update prices" }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
