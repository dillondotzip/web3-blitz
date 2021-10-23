import { resolver } from "blitz"

export default resolver.pipe(async ({ address, connector, nftsOwned }, ctx) => {
  return await ctx.session.$setPrivateData({
    walletAddress: address,
    connector: connector,
    nftsOwned: nftsOwned,
  })
})
