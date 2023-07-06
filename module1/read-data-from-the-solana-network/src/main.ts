
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const DEV_URL = 'https://special-warmhearted-brook.solana-devnet.discover.quiknode.pro/012a061ee8fb8bfdd7d335d2c48ae4e464ff436d/';

async function getBalanceUsingWeb3(address: PublicKey): Promise<number> {
  const connection = new Connection(DEV_URL);
  return connection.getBalance(address);
}

const publicKey = new PublicKey('ATrkCHG6PnkhVNaVz9tekg4je5cvZcLuZuF5UAxxEvyK')

getBalanceUsingWeb3(publicKey).then(balance => {
  console.log(balance / LAMPORTS_PER_SOL + " SOL")
})

getBalanceUsingJSONRPC(publicKey.toString()).then(balance => {
  console.log(balance / LAMPORTS_PER_SOL + " SOL")
})

async function getBalanceUsingJSONRPC(address: string): Promise<number> {
  const url = DEV_URL;
  console.log(url);
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "id": 1,
      "method": "getBalance",
      "params": [
        address
      ]
    })
  }).then(response => response.json())
    .then(json => {
      if (json.error) {
        throw json.error
      }

      return json['result']['value'] as number;
    })
    .catch(error => {
      throw error
    })
}
