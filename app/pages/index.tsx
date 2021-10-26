import { useEffect, useState, useCallback } from "react"
import {
  useMutation,
  invokeWithMiddleware,
  useQuery,
  QueryClient,
  getQueryKey,
  dehydrate,
} from "blitz"
import { useWeb3React, Web3ReactProvider } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { WalletConnectConnector } from "@web3-react/walletconnect-connector"
import { Web3Provider } from "@ethersproject/providers"
import createSession from "app/users/mutations/createSession"
import getSession from "app/users/queries/getSession"
import destroySession from "app/users/mutations/destroySession"

import MakeNFT from "app/artifacts/contracts/MakeNFT.sol/MakeNFT.json"
import { Contract } from "ethers"

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

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42, 1337] })
const wcConnector = new WalletConnectConnector({
  rpc: {
    1: process.env.NEXT_PUBLIC_RPC_URL_MAINNET as string,
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 12000,
})

const getLibrary = (provider) => {
  const library = new Web3Provider(provider)
  return library
}

const Web3 = () => {
  const web3React = useWeb3React()
  const [session] = useQuery(getSession, null)
  const [connector, setConnector] = useState("")
  const [createSessionMutation] = useMutation(createSession)
  const [destroySessionMutation] = useMutation(destroySession)

  const [minted, setMinted] = useState("")
  const [minting, setMinting] = useState(false)

  // const CONTRACT_ADDRESS = "0xCdA1881Cefa19392805ABd765025CF6f75DB59Bb"
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const getTruncatedAddress = (address) => {
    if (address && address.startsWith("0x")) {
      return address.substr(0, 4) + "..." + address.substr(address.length - 4)
    }
    return address
  }

  const getNetwork = (chainId) => {
    switch (chainId) {
      case 1:
        return "Mainnet"
      case 3:
        return "Ropsten"
      case 4:
        return "Rinkeby"
      case 5:
        return "Goerli"
      case 42:
        return "Kovan"
      default:
        return `unknown network ${chainId}`
    }
  }

  const mint = async () => {
    const provider = web3React.library
    const signer = provider.getSigner()
    const connectedContract = new Contract(CONTRACT_ADDRESS, MakeNFT.abi, signer)

    let nftTxn = await connectedContract.generateNFT()
    setMinting(true)
    connectedContract.on("NewNFTMinted", (from, tokenId) => {
      console.log("from", from)
      setMinted(`https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}/${tokenId}`)
      setMinting(false)
    })
    await nftTxn.wait()
  }

  const showNFTS = useCallback(
    async (contract) => {
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
        connector: connector,
        balance: parseInt(balance),
        nftsOwned: ownedNFTs,
      })
    },
    [web3React.account, createSessionMutation, connector]
  )

  useEffect(() => {
    if (web3React.active) {
      const provider = web3React.library
      const signer = provider.getSigner()
      const connectedContract = new Contract(CONTRACT_ADDRESS, MakeNFT.abi, signer)

      createSessionMutation({
        address: web3React.account,
        connector: connector,
      })

      showNFTS(connectedContract)

      // View contract metadata
      // connectedContract.tokenURI(0).then((u) => {
      //   const requestBodyObject = decodeURIComponent(u).split(',')[1]
      //   const json = JSON.parse(window.atob(requestBodyObject as string))
      //   console.log(json.name)
      //   console.log(json.description)
      //   console.log(json.image)
      // })
    }
  }, [web3React, createSessionMutation, connector, session, showNFTS])

  // Activate metamask wallet if found in user's persisted private session
  useEffect(() => {
    if (
      !web3React.active &&
      session &&
      session.walletAddress !== "" &&
      session.connector === "injected"
    ) {
      injected.isAuthorized().then((authorized) => {
        if (authorized) {
          web3React.activate(injected)
          setConnector("injected")
        }
      })
    } else if (
      !web3React.active &&
      session &&
      session.walletAddress !== "" &&
      session.connector === "walletconnect"
    ) {
      injected.isAuthorized().then((authorized) => {
        if (authorized) {
          web3React.activate(wcConnector)
          setConnector("walletconnect")
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {!web3React.active ? (
        <div className="connect-wallet-container">
          <div className="connect-wallet-card">
            <div className="wallet-header">Connect your wallet</div>
            <button
              className="button metamask"
              onClick={async () => {
                await web3React.activate(injected)
                setConnector("injected")
              }}
            >
              Metamask
            </button>
            <button
              onClick={async () => {
                await web3React.activate(wcConnector)
                setConnector("walletconnect")
              }}
            >
              WalletConnect
            </button>
          </div>
        </div>
      ) : null}

      {web3React.active ? (
        <>
          <div className="connected-container">
            <div className="connected-card">
              <div className="row network-section">
                <div className="row-title">Network</div>
                <div className="row-subtitle">{getNetwork(web3React.chainId)}</div>
              </div>
              <hr className="divider" />
              <div className="row network-section">
                <div className="row-title">Address</div>
                <div className="row-subtitle">{getTruncatedAddress(web3React.account)}</div>
              </div>
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
              <hr />
              <button
                className="row disconnect-button"
                onClick={async () => {
                  web3React.deactivate()
                  web3React.connector === wcConnector && wcConnector.close()
                  await destroySessionMutation()
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

const Home = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3 />
    </Web3ReactProvider>
  )
}

export default Home
