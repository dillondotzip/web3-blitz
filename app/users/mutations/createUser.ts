import { resolver } from "blitz"
import db from "db"
import { Role } from "types"

export default resolver.pipe(async ({ address, connector, balance }, ctx) => {
  const foundUser = await db.user.findFirst({
    where: {
      address,
    },
  })

  if (!foundUser) {
    const user = await db.user.create({
      data: {
        address,
        nonce: Math.floor(Math.random() * 10000000),
        balance: parseInt(balance),
      },
    })

    await ctx.session.$create({
      userId: user.id,
      role: user.role as Role,
      connector: connector,
    })

    return user
  } else {
    const user = await db.user.update({
      where: {
        address: address,
      },
      data: {
        nonce: Math.floor(Math.random() * 10000000),
      },
    })

    await ctx.session.$create({
      userId: user.id,
      role: user.role as Role,
      connector: connector,
    })

    return user
  }
})
