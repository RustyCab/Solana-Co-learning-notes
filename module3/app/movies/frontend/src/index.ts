import * as web3 from "@solana/web3.js";
import { Movies } from "./movies";

async function main() {

  // load config .env
  const dotenv = require('dotenv');
  const fs = require('fs');
  dotenv.config();

  // create an empty transaction
  const transaction = new web3.Transaction();

  const test_movie = Movies.mocks[0];

  // contruct create note instruction
  const buffer = test_movie.serialize_create();

  // load the payer's Keypair from a local file
  const keypair = JSON.parse(fs.readFileSync(process.env.PRIVATE_KEY, 'utf-8'));
  const keypairUint8Array = new Uint8Array(Object.values(keypair));
  const wallet = web3.Keypair.fromSecretKey(keypairUint8Array);


  const [pda] = web3.PublicKey.findProgramAddressSync(
    [wallet.publicKey.toBuffer(), new TextEncoder().encode(test_movie.title)],
    new web3.PublicKey(process.env.PROGRAM_ID || "")
  )

  // add a hello world program instruction to the transaction
  transaction.add(
    new web3.TransactionInstruction({
      keys: [
        {
          // Your account will pay the fees, so it's writing to the network
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          // The PDA will store the movie review
          pubkey: pda,
          isSigner: false,
          isWritable: true
        },
        {
          // The system program will be used for creating the PDA
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false
        }
      ],
      // Here's the most important part!
      data: buffer,
      programId: new web3.PublicKey(process.env.PROGRAM_ID || ""),
    }),
  );

  // load conection to the Solana cluster
  const connection = new web3.Connection(process.env.SOLANA_PROVIDER_URL || "");

  // send the transaction to the Solana cluster
  console.log("Sending transaction...");

  const txHash = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet],
  );

  console.log(`Transaction submitted: https://explorer.solana.com/tx/${txHash}?cluster=devnet`)
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
