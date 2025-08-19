// Should run on edge runtime
export const edge = true

export default async function handler(request: Request) {
  const params = new URLSearchParams(new URL(request.url).searchParams)
  console.log(`searchParams: ${params}`)
  return new Response('Edge Function: OK', {
    status: 200,
  })
}
