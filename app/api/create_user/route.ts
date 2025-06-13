import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Create user API called with:", body)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Here you would make the actual webhook call to your external API
    // const response = await fetch('https://your-actual-webhook-url.com/create_user', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body)
    // })
    // const data = await response.json()
    // return NextResponse.json(data)

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user_id: Math.random().toString(36).substr(2, 9),
    })
  } catch (error) {
    console.error("Error in create_user API:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
