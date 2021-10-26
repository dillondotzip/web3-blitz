import { getSession } from "blitz"
import path from "path"

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

const Private = () => {
  return (
    <div>
      <p>You have access</p>
    </div>
  )
}

export default Private
