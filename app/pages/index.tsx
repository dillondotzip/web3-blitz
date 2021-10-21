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
import { Web3Provider } from "@ethersproject/providers"
import createSession from "app/users/mutations/createSession"
import getSession from "app/users/queries/getSession"
import destroySession from "app/users/mutations/destroySession"

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

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] })

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

  useEffect(() => {
    if (web3React.active) {
      createSessionMutation({ address: web3React.account, connector: connector })
    }
  }, [web3React, createSessionMutation, connector, session])

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
              <hr />
              <button
                className="row disconnect-button"
                onClick={async () => {
                  web3React.deactivate()
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
