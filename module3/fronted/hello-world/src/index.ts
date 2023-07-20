import * as web3 from "@solana/web3.js";


async function main() {

  // load config .env
  const dotenv = require('dotenv');
  const fs = require('fs');
  dotenv.config();

  // create an empty transaction
  const transaction = new web3.Transaction();

  // add a hello world program instruction to the transaction
  transaction.add(
    new web3.TransactionInstruction({
      keys: [],
      programId: new web3.PublicKey(process.env.PROGRAM_ID || ""),
    }),
  );

  // load conection to the Solana cluster
  const connection = new web3.Connection(process.env.SOLANA_PROVIDER_URL || "");

  // load the payer's Keypair from a local file
  const keypair = JSON.parse(fs.readFileSync(process.env.PRIVATE_KEY, 'utf-8'));
  const keypairUint8Array = new Uint8Array(Object.values(keypair));
  const wallet = web3.Keypair.fromSecretKey(keypairUint8Array);

  // send the transaction to the Solana cluster
  console.log("Sending transaction...");

  const txHash = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet],
  );

  console.log("Transaction sent with hash:", txHash);
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
