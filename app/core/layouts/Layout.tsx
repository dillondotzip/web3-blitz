import { ReactNode } from "react"
import { Head } from "blitz"

import Navbar from "app/core/components/Navbar"
import { ContractProvider } from "../providers/ContractProvider"

import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers"

type LayoutProps = {
  title?: string
  session: Record<any, any>
  children: ReactNode
}

const getLibrary = (provider) => {
  const library = new Web3Provider(provider)
  return library
}

const Layout = ({ title, children, session }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "wallet-connect"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Web3ReactProvider getLibrary={getLibrary}>
        <ContractProvider session={session}>
          <Navbar />
          {children}
        </ContractProvider>
      </Web3ReactProvider>
    </>
  )
}

export default Layout
