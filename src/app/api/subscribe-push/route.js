export async function POST(req) {
  try {
    const subscription = await req.json()
    console.log('[API] New push subscription:', subscription.endpoint)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
