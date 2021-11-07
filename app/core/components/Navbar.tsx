import { useMutation } from "blitz"

import { useWeb3React } from "@web3-react/core"
import { injected, wcConnector } from "integrations/connectors"
import destroySession from "app/users/mutations/destroySession"

const Navbar = () => {
  const web3React = useWeb3React()
  const [destroySessionMutation] = useMutation(destroySession)

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
