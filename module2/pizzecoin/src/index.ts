import { initializeKeypair } from "./initializeKeypair"
import * as web3 from "@solana/web3.js"
import * as token from "@solana/spl-token"


async function main() {
  const connection = new web3.Connection(process.env.DEVNET_URL ?? "")
  const user = await initializeKeypair(connection)

  console.log("PublicKey:", user.publicKey.toBase58())

  // const mint = await createNewMint(
  //   connection,
  //   user,           // We'll pay the fees
  //   user.publicKey, // We're the mint authority
  //   user.publicKey, // And the freeze authority >:)
  //   2               // Only two decimals!
  // )

  const mint = new web3.PublicKey("cxB6Xj1aBkXFMMdWBSRrMLcD6USDdNrMs16dN42x2Xo");

  const tokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    user.publicKey   // Associating our address with the token account
  )

  // Mint 100 tokens to our address
  await mintTokens(connection, user, mint, tokenAccount.address, user, 100)

}

async function createNewMint(
  connection: web3.Connection,
  payer: web3.Keypair,
  mintAuthority: web3.PublicKey,
  freezeAuthority: web3.PublicKey,
  decimals: number
): Promise<web3.PublicKey> {

  const tokenMintAccount = await token.createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );

  console.log(`The token mint account address is ${tokenMintAccount}`)
  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMintAccount}?cluster=devnet`
  );

  return tokenMintAccount;
}

async function createTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey
) {
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  )

  console.log(
    `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
  )

  return tokenAccount
}


async function mintTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  authority: web3.Keypair,
  amount: number
) {
  const mintInfo = await token.getMint(connection, mint)

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount * 10 ** mintInfo.decimals
  )

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  )
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
