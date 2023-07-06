import type { NextPage } from 'next'
import { useState } from 'react'
// import Head from 'next/head'
// import Image from 'next/image'
import styles from '../styles/Home.module.css'
import AddressForm from '../components/AddressForm'
import * as web3 from '@solana/web3.js'

const DEV_URL = "https://special-warmhearted-brook.solana-devnet.discover.quiknode.pro/012a061ee8fb8bfdd7d335d2c48ae4e464ff436d/";

const Home: NextPage = () => {
  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState('')
  const [executable, setExecutable] = useState(false)

  const addressSubmittedHandler = (address: string) => {
    try {
      const key = new web3.PublicKey(address);
      setAddress(key.toBase58())
      const connection = new web3.Connection(DEV_URL)

      connection.getBalance(key).then(balance => {
        setBalance(balance / web3.LAMPORTS_PER_SOL)
      })

      connection.getAccountInfo(key).then(accountInfo => {
        setExecutable(accountInfo?.executable || false)
      })
    } catch (err) {
      setAddress('')
      setBalance(0)
      alert(err)
    }
  }

  return (
    <div className={styles.App}>
      <header className={styles.AppHeader}>
        <p>
          Start Your Solana Journey
        </p>
        <AddressForm handler={addressSubmittedHandler} />
        <p>{`Address: ${address}`}</p>
        <p>{`Balance: ${balance} SOL`}</p>
        <p>{`Is it executable? ${executable}`} </p>
      </header>
    </div>
  )
}

export default Home
