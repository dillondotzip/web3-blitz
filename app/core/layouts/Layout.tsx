import { ReactNode } from "react"
import { Head } from "blitz"

import Navbar from "app/core/components/Navbar"

import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers"

type LayoutProps = {
  title?: string
  children: ReactNode
}

const getLibrary = (provider) => {
  const library = new Web3Provider(provider)
  return library
}

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "wallet-connect"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Navbar />
        {children}
      </Web3ReactProvider>
    </>
  )
}

export default Layout
