import { GetServerSideProps, getSession } from "blitz"
import db from "db"

const getCurrentUserServer = async ({ req, res }: Parameters<GetServerSideProps>[0]) => {
  const session = await getSession(req, res)

  if (session.userId) {
    const user = await db.user.findFirst({
      where: { id: session.userId },
    })

    return user
  }

  return null
}

export default getCurrentUserServer
