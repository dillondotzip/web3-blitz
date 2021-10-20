import { resolver } from "blitz"

export default resolver.pipe(async (_, ctx) => {
  return await ctx.session.$revoke()
})
