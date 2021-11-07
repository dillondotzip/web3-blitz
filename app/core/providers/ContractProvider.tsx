import { createContext, useContext, useState, useEffect, useMemo } from "react"
import { useMutation, useQuery } from "blitz"
import { useWeb3React } from "@web3-react/core"
import MakeNFT from "app/artifacts/contracts/MakeNFT.sol/MakeNFT.json"
import { Contract } from "ethers"
import getSession from "app/users/queries/getSession"
import createSession from "app/users/mutations/createSession"
import { injected, wcConnector } from "integrations/connectors"
import toast from "react-hot-toast"

const defaultContext: {
  connectedContract: undefined | Contract
} = {
  connectedContract: undefined,
}

const ContractContext = createContext(defaultContext)
const useContract = () => useContext(ContractContext)

const ContractProvider = ({ children, session }) => {
  const [connectedContract, setContract] = useState(defaultContext.connectedContract)
  const web3React = useWeb3React()
  // const [session] = useQuery(getSession, null)
  const [createSessionMutation] = useMutation(createSession)

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

      const createUserSession = async () => {
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

        return createSessionMutation({
          address: web3React.account,
          connector:
            web3React.connector === injected
              ? "injected"
              : web3React.connector === wcConnector
              ? "walletconnect"
              : "",
          balance: parseInt(balance),
          nftsOwned: ownedNFTs,
        })
      }

      try {
        createUserSession()
      } catch (err) {
        toast.error("Sorry, we had an unexpected error. Please try again. - " + err.toString())
        console.log(err)
      }
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
    <ContractContext.Provider
      value={{
        connectedContract,
      }}
    >
      {children}
    </ContractContext.Provider>
  )
}

export { ContractProvider, useContract }
