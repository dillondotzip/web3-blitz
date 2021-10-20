import { GetServerSideProps, getSession, Ctx } from "blitz"

const getCurrentUserServer = async (_ = null, { session }: Ctx) => {
  const privateData = session.$getPrivateData()
  return privateData
}

export default getCurrentUserServer
