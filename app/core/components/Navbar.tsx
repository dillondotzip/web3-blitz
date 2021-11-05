import { useEffect } from "react"
import { useMutation, useQuery } from "blitz"

import { useWeb3React } from "@web3-react/core"
import { injected, wcConnector } from "integrations/connectors"
import getSession from "app/users/queries/getSession"
import createSession from "app/users/mutations/createSession"
import destroySession from "app/users/mutations/destroySession"

const Navbar = () => {
  const web3React = useWeb3React()
  const [session] = useQuery(getSession, null)
  const [createSessionMutation] = useMutation(createSession)
  const [destroySessionMutation] = useMutation(destroySession)

  useEffect(() => {
    if (web3React.active) {
      createSessionMutation({
        address: web3React.account,
        connector:
          web3React.connector === injected
            ? "injected"
            : web3React.connector === wcConnector
            ? "walletconnect"
            : "",
      })
    }
  }, [web3React, createSessionMutation])

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
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <h3>Web3-Blitz</h3>

      {!web3React.active ? (
        <div className="connect-wallet-container">
          <div className="connect-wallet-card">
            <div className="wallet-header">Connect your wallet</div>
            <button
              className="button metamask"
              onClick={async () => {
                await web3React.activate(injected)
              }}
            >
              Metamask
            </button>
            <button
              onClick={async () => {
                await web3React.activate(wcConnector)
              }}
            >
              WalletConnect
            </button>
          </div>
        </div>
      ) : null}

      {web3React.active ? (
        <>
          <div>
            <div>Network</div>
            <div>{web3React.chainId}</div>
          </div>
          <hr className="divider" />
          <div>
            <div>Address</div>
            <div>{web3React.account}</div>
          </div>

          <button
            onClick={async () => {
              web3React.deactivate()
              web3React.connector === wcConnector && wcConnector.close()
              await destroySessionMutation()
            }}
          >
            Disconnect
          </button>
        </>
      ) : null}
    </div>
  )
}

export default Navbar
