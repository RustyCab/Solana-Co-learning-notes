import { initializeKeypair } from "./initializeKeypair"
import * as web3 from "@solana/web3.js"

async function main() {
  const connection = new web3.Connection("https://special-warmhearted-brook.solana-devnet.discover.quiknode.pro/012a061ee8fb8bfdd7d335d2c48ae4e464ff436d/")
  const user = await initializeKeypair(connection)
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
