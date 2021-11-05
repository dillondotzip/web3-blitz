import { InjectedConnector } from "@web3-react/injected-connector"
import { WalletConnectConnector } from "@web3-react/walletconnect-connector"

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42, 1337] })
export const wcConnector = new WalletConnectConnector({
  rpc: {
    1: process.env.NEXT_PUBLIC_RPC_URL_MAINNET as string,
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 12000,
})
