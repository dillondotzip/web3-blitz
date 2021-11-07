import { invokeWithMiddleware, QueryClient, getQueryKey, dehydrate, useQuery } from "blitz"

import MintButton from "app/mint/components/MintButton"
import getSession from "app/users/queries/getSession"

import Layout from "app/core/layouts/Layout"

export const getServerSideProps = async ({ req, res }) => {
  const queryClient = new QueryClient()
  const queryKey = getQueryKey(getSession, null)
  await queryClient.prefetchQuery(queryKey, () =>
    invokeWithMiddleware(getSession, {}, { req, res })
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

const Nfts = () => {
  const [session] = useQuery(getSession, null)

  return (
    <div>
      {session
        ? session.nftsOwned &&
          session.nftsOwned.map((nft, i) => {
            return (
              <div key={i}>
                <h1>{nft.name}</h1>
                <h3>{nft.description}</h3>
                <img src={nft.image} alt={nft.description} />
              </div>
            )
          })
        : null}
    </div>
  )
}

Nfts.getLayout = (page) => <Layout>{page}</Layout>
export default Nfts
