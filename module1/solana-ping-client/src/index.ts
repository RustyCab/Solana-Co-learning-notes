import web3 = require('@solana/web3.js')
import Dotenv from 'dotenv'
Dotenv.config()

const PROGRAM_ADDRESS = 'ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa'
const PROGRAM_DATA_ADDRESS = 'Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod'

function initializeKeypair(): web3.Keypair {
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
  const secretKey = Uint8Array.from(secret)
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
  return keypairFromSecretKey
}


async function main() {
  const payer = initializeKeypair();
  console.log("Payer address: ", payer.publicKey.toBase58())
  console.log("Connecting to devnet...", process.env.DEVNET_URL ?? "")
  const connection = new web3.Connection(process.env.DEVNET_URL ?? "");
  await pingProgram(connection, payer)
}

main().then(() => {
  console.log("Finished successfully")
}).catch((error) => {
  console.error(error)
})


async function pingProgram(connection: web3.Connection, payer: web3.Keypair) {
  const transaction = new web3.Transaction()

  const programId = new web3.PublicKey(PROGRAM_ADDRESS)
  const programDataPubkey = new web3.PublicKey(PROGRAM_DATA_ADDRESS)

  const instruction = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: programDataPubkey,
        isSigner: false,
        isWritable: true
      },
    ],
    programId
  })

  transaction.add(instruction)

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  )

  console.log(`You can view your transaction on the Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)
}
