import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloWorldAnchor } from "../target/types/hello_world_anchor";
// import bs58 from "bs58";
import fs from "fs";

async function main() {
  require('dotenv').config();

  const connection = new anchor.web3.Connection(process.env.ANCHOR_PROVIDER_URL || "");

  // Read the private key file and create a Keypair
  const secretKey = JSON.parse(fs.readFileSync(process.env.SOLANA_PRIVATE_KEY as string, 'utf-8'));
  const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(secretKey));

  const wallet = new anchor.Wallet(keypair);

  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.HelloWorldAnchor as Program<HelloWorldAnchor>;

  // Add your test here.
  const tx = await program.methods.initialize().rpc();
  console.log("Your transaction signature", tx);

  const tx1 = await program.methods.sayHello().rpc();

  console.log("Your say hello transaction signature", tx1);
}


main().then(() => {
  console.log("Success");
  process.exit();
}
).catch((err) => {
  console.error(err);
  process.exit(-1);
});
