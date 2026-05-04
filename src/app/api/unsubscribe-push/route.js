export async function POST(req) {
  try {
    const { endpoint } = await req.json()
    console.log('[API] Removed push subscription:', endpoint)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
