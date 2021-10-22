import { task } from "hardhat/config"
import { config as dotenvConfig } from "dotenv"
import { resolve } from "path"
dotenvConfig({ path: resolve(__dirname, "./.env.local") })

import "@nomiclabs/hardhat-waffle"
import { HardhatUserConfig } from "hardhat/config"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./app/artifacts",
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: `${process.env.NEXT_PUBLIC_RPC_URL_GOERLI}`,
      accounts: [`${process.env.WALLET_PRIVATE_KEY}`],
    },
    rinkeby: {
      url: `${process.env.NEXT_PUBLIC_RPC_URL_RINKEBY}`,
      accounts: [`${process.env.WALLET_PRIVATE_KEY}`],
    },
  },
}

export default config
