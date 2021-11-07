This is a fullstack solution for web3.

Write your contracts, backend & frontend with solidity, hardhat & blitz.js.

By default, allow users to connect their wallet & mint a randomized NFT. Then have authenticated routes where the wallet connected must own the NFT to view the page.

**If you want to create a SaaS instead, checkout [1UpBlitz](https://1upblitz.com). A Blitz.js SaaS boilerplate that will save you over 60 hours of work.**

Created by [Dillon Raphael](https://twitter.com/dillonraphael)

## Features

**MetaMask & WalletConnect** - Providers easily accessible from blitz.js integration folder.

**Blitz.js Private Session** - Store a private session in the database when a user connects their wallet. Easily access which nft's are owned by that user in mutations and getServerSideProps

**Default contract** - Allow users to mint an NFT that generates a randomized image. Similar to Loot and Developer Dao

**Context layout provider** - A layout context provider that handles checking for a private session and injects the users wallet. Also gain quick access to your contract function.

**Authenticated routes** - Have routes that checks if the user owns a certain amount of nfts before accessing the page

## Get Started

Create an `.env.local` file with the following variables:

```ts
DATABASE_URL=postgresql://
NEXT_PUBLIC_RPC_URL_MAINNET=
NEXT_PUBLIC_RPC_URL_RINKEBY=
NEXT_PUBLIC_RPC_URL_GOERLI=
WALLET_PRIVATE_KEY=
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

You can get RPC urls from [http://moralis.io/](http://moralis.io/). It's required to deploy to a testnet or mainnet. You must also enter one of your wallet's private key that will be used to deploy your contract.

To start a local blockchain, run the following hardhat command:

`yarn hardhat node`

To deploy your contract, run:

`yarn hardhat run scripts/deploy.ts --network localhost`

For rinkeby (ensure your wallet private key is an address on the rinkeby testnet):

`yarn hardhat run scripts/deploy.ts --network rinkeby`

After you deploy, you'll receive the address of the contract that you can use in the env file.

Then in a separate terminal window, run:

`yarn dev`

## Credits

[Dillon Raphael](https://twitter.com/dillonraphael) – Code, Documentation

[Foda](https://twitter.com/0xFoda) - Idea, UX
