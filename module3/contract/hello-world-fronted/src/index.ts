import { initializeKeypair } from "./initializeKeypair"
import web3 = require("@solana/web3.js")
import Dotenv from "dotenv"
Dotenv.config()

let programId = new web3.PublicKey(
  "EHiYp5VkjpU6Pf36C8BgSxQLkTqVuUPKtkPpyzEqbiga"
)

let connection = new web3.Connection(process.env.DEVNET_URL ?? "", "confirmed")

async function main() {
  let payer = await initializeKeypair(connection)
  // await connection.requestAirdrop(payer.publicKey, web3.LAMPORTS_PER_SOL * 1)

  const transactionSignature = await sayHello(payer)

  console.log(
    `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  )
}

main()
  .then(() => {
    console.log("Finished successfully")
  })
  .catch((error) => {
    console.error(error)
  })

export async function sayHello(
  payer: web3.Keypair
): Promise<web3.TransactionSignature> {
  const transaction = new web3.Transaction()

  const instruction = new web3.TransactionInstruction({
    keys: [],
    programId,
  })

  transaction.add(instruction)

  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  )

  return transactionSignature
}
