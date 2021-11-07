import { getSession } from "blitz"
import path from "path"
import Layout from "app/core/layouts/Layout"

export const getServerSideProps = async ({ req, res }) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking
  const session = await getSession(req, res)
  const privateData = await session.$getPrivateData()

  if (privateData.nftsOwned.length >= 1) {
    return { props: { session: privateData } }
  } else {
    return {
      redirect: {
        destination: "/noaccess",
        permanent: false,
      },
      props: {},
    }
  }
}

const Private = ({ session }) => {
  return (
    <div>
      <h3>Owned Nfts</h3>
      {session
        ? session.nftsOwned.map((nft, i) => {
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
Private.getLayout = (page) => <Layout>{page}</Layout>
export default Private
