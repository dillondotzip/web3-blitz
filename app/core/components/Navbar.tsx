import { useMutation, Routes, useRouter, Link } from "blitz"
import { useContract } from "app/core/providers/ContractProvider"
import { useWeb3React } from "@web3-react/core"
import { injected, wcConnector } from "integrations/connectors"
import destroySession from "app/users/mutations/destroySession"

const Navbar = () => {
  const web3React = useWeb3React()
  const [destroySessionMutation] = useMutation(destroySession)
  const router = useRouter()
  const contract = useContract()

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

      {web3React.active && contract.authenticated ? (
        <>
          <div>
            <div>Network</div>
            <div>{web3React.chainId}</div>
          </div>
          <hr />
          <div>
            <div>Address</div>
            <div>{web3React.account}</div>
          </div>
          <hr />
          <Link href={Routes.Private()} passHref>
            <a>Owned NFTs</a>
          </Link>

          <button
            onClick={async () => {
              web3React.deactivate()
              web3React.connector === wcConnector && wcConnector.close()
              await destroySessionMutation()
              await router.push(Routes.Home())
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
