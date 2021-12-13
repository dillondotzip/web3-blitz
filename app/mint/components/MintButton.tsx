import { useState } from "react"
import { useContract } from "app/core/providers/ContractProvider"
import toast from "react-hot-toast"
import { useWeb3React } from "@web3-react/core"

const MintButton = () => {
  const web3React = useWeb3React()
  const [minted, setMinted] = useState("")
  const [minting, setMinting] = useState(false)
  const contract = useContract()

  const mint = async () => {
    try {
      let nftTxn = await contract.connectedContract?.generateNFT()
      setMinting(true)
      await nftTxn.wait()
      contract.connectedContract?.on("NewNFTMinted", (from, tokenId) => {
        console.log("from", from)
        setMinted(
          `https://testnets.opensea.io/assets/goerli/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${tokenId}`
        )
        setMinting(false)
        // showNFTS(c.connectedContract)
      })
    } catch (err) {
      toast.error(err.message)
      console.log(err.message)
    }
  }

  return web3React.active && contract.authenticated ? (
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
  ) : null
}

export default MintButton
