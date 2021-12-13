import { createContext, useContext, useState, useEffect } from "react"
import { useMutation, useSession } from "blitz"
import { useWeb3React } from "@web3-react/core"
import MakeNFT from "app/artifacts/contracts/MakeNFT.sol/MakeNFT.json"
import { Contract } from "ethers"
import createUser from "app/users/mutations/createUser"
import { injected, wcConnector } from "integrations/connectors"
import toast from "react-hot-toast"
import { WalletConnectConnector } from "@web3-react/walletconnect-connector"

const defaultContext: {
  connectedContract: undefined | Contract
  authenticated: boolean
} = {
  connectedContract: undefined,
  authenticated: false,
}

const ContractContext = createContext(defaultContext)
const useContract = () => useContext(ContractContext)

const ContractProvider = ({ children }) => {
  const [connectedContract, setContract] = useState(defaultContext.connectedContract)
  const [authenticated, setAuthenticated] = useState(defaultContext.authenticated)

  const web3React = useWeb3React()
  const session = useSession({ suspense: false })

  const [createUserMutation] = useMutation(createUser)

  // Watch for when wallet is connected and create private session in database
  useEffect(() => {
    if (web3React.active) {
      const provider = web3React.library
      const signer = provider.getSigner()
      const connectedContract = new Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        MakeNFT.abi,
        signer
      )
      setContract(connectedContract)

      const signIn = async () => {
        let balance = await connectedContract.balanceOf(web3React.account)
        let i = 0
        let supply = await connectedContract.totalSupply()
        let ownedNFTs: {}[] = []

        for (i = 0; i < parseInt(supply); i++) {
          let owner = await connectedContract.tokenOfOwnerByIndex(web3React.account, i)

          await connectedContract?.tokenURI(parseInt(owner)).then((u) => {
            const requestBodyObject = decodeURIComponent(u).split(",")[1]
            const json = JSON.parse(window.atob(requestBodyObject as string))
            ownedNFTs.push({ name: json.name, description: json.description, image: json.image })
          })
        }

        const user = await createUserMutation({
          address: web3React.account,
          connector:
            web3React.connector === injected
              ? "injected"
              : web3React.connector === wcConnector
              ? "walletconnect"
              : "",
          balance: balance,
        })
        const signature = await signer.signMessage(user.nonce.toString())
        const response = await fetch(
          `/api/verify?address=${web3React.account}&signature=${signature}`
        )
        const data = await response.json()
        setAuthenticated(data.authenticated)
      }

      try {
        if (!session.userId) {
          signIn()
        }
      } catch (err) {
        toast.error("Sorry, we had an unexpected error. Please try again. - " + err.toString())
        console.log(err)
      }
    }

    // If user rejects wallet connect, catch error and set the provider to undefined
    if (web3React.connector instanceof WalletConnectConnector && web3React.error) {
      web3React.connector.walletConnectProvider = undefined
    }
  }, [web3React, createUserMutation, session])

  // Activate metamask wallet if found in user's persisted private session
  useEffect(() => {
    if (!web3React.active && session && session.connector === "injected") {
      injected.isAuthorized().then((authorized) => {
        if (authorized) {
          web3React.activate(injected)
          setAuthenticated(true)
        }
      })
    } else if (!web3React.active && session && session.connector === "walletconnect") {
      injected.isAuthorized().then((authorized) => {
        if (authorized) {
          web3React.activate(wcConnector)
          setAuthenticated(true)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <ContractContext.Provider
      value={{
        connectedContract,
        authenticated,
      }}
    >
      {children}
    </ContractContext.Provider>
  )
}

export { ContractProvider, useContract }
