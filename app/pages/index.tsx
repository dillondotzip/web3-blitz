import { useEffect, useState, useCallback } from "react"
import {
  useMutation,
  invokeWithMiddleware,
  useQuery,
  QueryClient,
  getQueryKey,
  dehydrate,
} from "blitz"
import { useWeb3React } from "@web3-react/core"

import createSession from "app/users/mutations/createSession"
import getSession from "app/users/queries/getSession"

import toast from "react-hot-toast"
import MakeNFT from "app/artifacts/contracts/MakeNFT.sol/MakeNFT.json"
import { Contract } from "ethers"
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

const Web3 = () => {
  const web3React = useWeb3React()
  const [session] = useQuery(getSession, null)

  const [createSessionMutation] = useMutation(createSession)

  const [minted, setMinted] = useState("")
  const [minting, setMinting] = useState(false)

  // const CONTRACT_ADDRESS = "0xCdA1881Cefa19392805ABd765025CF6f75DB59Bb"
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

  const mint = async () => {
    try {
      const provider = web3React.library
      const signer = provider.getSigner()
      const connectedContract = new Contract(CONTRACT_ADDRESS, MakeNFT.abi, signer)

      let nftTxn = await connectedContract.generateNFT()
      setMinting(true)
      await nftTxn.wait()
      connectedContract.on("NewNFTMinted", (from, tokenId) => {
        console.log("from", from)
        setMinted(`https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}/${tokenId}`)
        setMinting(false)
        showNFTS(connectedContract)
      })
    } catch (err) {
      toast.error(err.message)
      console.log(err.message)
    }
  }

  const showNFTS = useCallback(
    async (contract) => {
      try {
        let balance = await contract.balanceOf(web3React.account)
        let i = 0
        let supply = await contract.totalSupply()
        let ownedNFTs: number[] = []

        for (i = 0; i < parseInt(supply); i++) {
          let owner = await contract.tokenOfOwnerByIndex(web3React.account, i)
          ownedNFTs.push(parseInt(owner))
        }

        return createSessionMutation({
          address: web3React.account,
          balance: parseInt(balance),
          nftsOwned: ownedNFTs,
        })
      } catch (err) {
        toast.error("Sorry, we had an unexpected error. Please try again. - " + err.toString())
        console.log(err)
      }
    },
    [web3React.account, createSessionMutation]
  )

  useEffect(() => {
    if (web3React.active) {
      const provider = web3React.library
      const signer = provider.getSigner()
      const connectedContract = new Contract(CONTRACT_ADDRESS, MakeNFT.abi, signer)

      // showNFTS(connectedContract)
      // if(
      //   session &&
      //   session.nftsOwned &&
      //   session.nftsOwned.length
      //   ) {
      //   const provider = web3React.library
      //   const signer = provider.getSigner()
      //   const connectedContract = new Contract(CONTRACT_ADDRESS, MakeNFT.abi, signer)

      //   session.nftsOwned.map((nft) => {
      //     connectedContract.tokenURI(nft).then((u) => {
      //       const requestBodyObject = decodeURIComponent(u).split(',')[1]
      //       const json = JSON.parse(window.atob(requestBodyObject as string))
      //       console.log(json.name)
      //       console.log(json.description)
      //       console.log(json.image)
      //     })
      //   })
      // }
    }
  }, [web3React, createSessionMutation, session, showNFTS])

  return (
    <div>
      {web3React.active ? (
        <>
          <div className="connected-container">
            <div className="connected-card">
              <div>
                {!minting && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      mint()
                    }}
                  >
                    Mint
                  </button>
                )}
                {minting ? <p>Minting</p> : null}
                {!minting && minted.length ? (
                  <div>
                    <p>
                      <span>Transaction: </span>
                      {minted}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

const Home = () => {
  return <Web3 />
}

Home.getLayout = (page) => <Layout>{page}</Layout>
export default Home
