import { ethers } from "ethers"
import db from "db"

const handler = async (req, res) => {
  let authenticated = false
  const { address, signature } = req.query

  const user = await db.user.findFirst({
    where: {
      address: address,
    },
  })

  if (user) {
    const decodedAddress = ethers.utils.verifyMessage(user.nonce.toString(), signature)
    if (address.toLowerCase() === decodedAddress.toLowerCase()) authenticated = true
    res.status(200).json({ authenticated })
  }
}

export default handler
