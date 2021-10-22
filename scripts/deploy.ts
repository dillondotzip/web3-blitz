import { ethers } from "hardhat"

async function main() {
  const nftContractFactory = await ethers.getContractFactory("MakeNFT")
  const nftContract = await nftContractFactory.deploy()

  await nftContract.deployed()
  console.log("Contract deployed to:", nftContract.address)

  let txn = await nftContract.generateNFT()

  await txn.wait()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
