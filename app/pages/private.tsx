import Layout from "app/core/layouts/Layout"
import { GetServerSidePropsContext } from "blitz"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const user = await getCurrentUserServer({ ...context })

  if (user && user.balance && user.balance >= 1) {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/noaccess",
        permanent: false,
      },
    }
  }
}

const Private = ({ user }) => {
  return (
    <Layout>
      <h1>Owned Nfts</h1>
      {user.nftsOwned.map((nft, i) => {
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
