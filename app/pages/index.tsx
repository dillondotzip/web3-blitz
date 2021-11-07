import { getSession } from "blitz"

import MintButton from "app/mint/components/MintButton"

import Layout from "app/core/layouts/Layout"

export const getServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res)
  const privateData = await session.$getPrivateData()
  return {
    props: { session: privateData },
  }
}

const Home = ({ session }) => {
  return (
    <Layout session={session}>
      <MintButton />
    </Layout>
  )
}

export default Home
