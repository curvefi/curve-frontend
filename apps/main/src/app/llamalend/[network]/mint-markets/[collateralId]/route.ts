const MovedPermanently = 301

export async function GET(request: Request) {
  const { origin, search } = new URL(request.url)
  return Response.redirect(`${origin}/create${search}`, MovedPermanently)
}
