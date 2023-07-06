
import * as Web3 from '@solana/web3.js'
import * as Dotenv from 'dotenv';
Dotenv.config()


function initializeKeypair(): Web3.Keypair {
  const secret = JSON.parse(process.env.SENDER ?? "") as number[]
  const secretKey = Uint8Array.from(secret)
  const senderKeypair = Web3.Keypair.fromSecretKey(secretKey);
  return senderKeypair
}


async function main() {
  const payer = initializeKeypair();
  console.log('PAYER address', payer.publicKey.toBase58())
  const connection = new Web3.Connection(process.env.DEVNET_URL ?? "");
  let recipient = new Web3.PublicKey(process.env.RECIPIENT ?? "");
  await sendSol(connection, 0.1 * Web3.LAMPORTS_PER_SOL, recipient, payer)
}


main().then(() => {
  console.log("Finished successfully")
}).catch((error) => {
  console.error(error)
})

async function sendSol(connection: Web3.Connection, amount: number, to: Web3.PublicKey, sender: Web3.Keypair) {
  console.log("from", sender.publicKey.toBase58());
  console.log('SENDING', amount / Web3.LAMPORTS_PER_SOL, 'SOL to', to.toBase58());
  const transaction = new Web3.Transaction()

  const sendSolInstruction = Web3.SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: to,
    lamports: Web3.LAMPORTS_PER_SOL * 0.01
  })

  transaction.add(sendSolInstruction)

  Web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [sender]
  ).then(signature => console.log(`You can view your transaction on the Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`))
}


async function callProgram(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  programId: Web3.PublicKey,
  programDataAccount: Web3.PublicKey
) {
  const instruction = new Web3.TransactionInstruction({
    // We only have one key here
    keys: [
      {
        pubkey: programDataAccount,
        isSigner: false,
        isWritable: true
      },
    ],

    // The program we're interacting with
    programId

    // We don't have any data here!
  })

  await Web3.sendAndConfirmTransaction(
    connection,
    new Web3.Transaction().add(instruction),
    [payer]
  ).then(sig => console.log('SIGNATURE', sig))
}
