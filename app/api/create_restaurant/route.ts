import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Create restaurant API called with:", body)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Here you would make the actual webhook call to your external API
    // const response = await fetch('https://your-actual-webhook-url.com/create_restaurant', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body)
    // })
    // const data = await response.json()
    // return NextResponse.json(data)

    return NextResponse.json({
      success: true,
      message: "Restaurant created successfully",
      restaurant_id: body.id,
    })
  } catch (error) {
    console.error("Error in create_restaurant API:", error)
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 })
  }
}
