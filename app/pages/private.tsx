import { getSession } from "blitz"
import Layout from "app/core/layouts/Layout"

export const getServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res)
  const privateData = await session.$getPrivateData()

  if (privateData.nftsOwned && privateData.nftsOwned.length >= 1) {
    return { props: { session: privateData } }
  } else {
    return {
      redirect: {
        destination: "/noaccess",
        permanent: false,
      },
    }
  }
}

const Private = ({ session }) => {
  return (
    <Layout session={session}>
      <h1>Owned Nfts</h1>
      {session.nftsOwned.map((nft, i) => {
        return (
          <div key={i}>
            <h3>{nft.name}</h3>
            <p>{nft.description}</p>
            <img src={nft.image} alt={nft.description} />
          </div>
        )
      })}
    </Layout>
  )
}

export default Private
