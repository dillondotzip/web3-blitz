import { resolver } from "blitz"

export default resolver.pipe(async ({ address, connector, nftsOwned, balance }, ctx) => {
  return await ctx.session.$setPrivateData({
    walletAddress: address,
    connector: connector,
    nftsOwned: nftsOwned,
    balance: balance,
  })
})
