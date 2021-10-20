import { resolver } from "blitz"

export default resolver.pipe(async ({ address, connector, action }, ctx) => {
  return await ctx.session.$setPrivateData({
    walletAddress: address,
    connector: connector,
  })
})
