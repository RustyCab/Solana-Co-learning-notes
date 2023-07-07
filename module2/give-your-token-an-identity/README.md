# 🧬 给你的代币一个身份

是时候让代币与它们的创造者（你）见面了。我们将从上一个构建部分中断的地方继续。如果需要，您可以从[此处](https://github.com/buildspace/solana-token-client/tree/solution-without-burn)获取起始代码（确保您位于 solution-without-burn 分支）。

首先添加新的依赖项：

```bash
npm install @metaplex-foundation/js fs
npm install @metaplex-foundation/mpl-token-metadata
```

我们将使用 Metaplex SDK 添加元数据和 fs 库，以便我们可以读取令牌徽标图像。创建一个名为 assets 的新文件夹并添加您的徽标。这将在测试网上进行，所以尽情享受吧！我要使用披萨表情符号，所以我将我的文件命名为 Pizza.png 哈哈

Metaplex 将为我们完成所有繁重的工作，因此将这些导入添加到 index.ts 的顶部：

```ts
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js"
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata"
import * as fs from "fs"
```

现在我们已经完成了所有设置，我们将开始元数据位。我们将首先完成链下部分，然后创建代币元数据帐户。

从较高的层面来看，需要发生以下事情：
1. 使用 toMetaplexFile() 将图像文件转换为metaplex文件
2. 使用 metaplex.storage().upload 上传图像
3. 使用 metaplex.uploadMetadata() 上传链下元数据
4. 使用 findMetadataPda() 派生元数据帐户 PDA
5. 构建 DataV2 类型的链上数据格式
6. 使用 createCreateMetadataAccountV2Instruction 构建创建元数据帐户的指令（不是拼写错误，哈哈）
7. 发送带有创建令牌元数据帐户指令的交易


这里发生了很多事情，但都是基本的事情。花点时间回顾一下，您就知道发生的一切！

我们将创建一个函数来完成这一切：

```ts
async function createTokenMetadata(
  connection: web3.Connection,
  metaplex: Metaplex,
  mint: web3.PublicKey,
  user: web3.Keypair,
  name: string,
  symbol: string,
  description: string
) {
  // file to buffer
  const buffer = fs.readFileSync("assets/pizza.png")

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "pizza.png")

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file)
  console.log("image uri:", imageUri)

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex
    .nfts()
    .uploadMetadata({
      name: name,
      description: description,
      image: imageUri,
    })

  console.log("metadata uri:", uri)

  // get metadata account address
  const metadataPDA = metaplex.nfts().pdas().metadata({mint})

  // onchain metadata format
  const tokenMetadata = {
    name: name,
    symbol: symbol,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2

  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  )

  // send transaction
  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  )

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  )
}
```

确保更新文件名！另外，不用担心 nfts() 调用 - Metaplex 最初是为 NFT 构建的，最近也扩展到了可替代代币。

你会注意到我们在这里留下了一堆空的东西 - 这是因为你在制作可替换令牌时不需要设置这些东西。不可替代的代币具有您需要定义的更具体的行为。


我可以一点一点地检查这个函数，但我只是重复自己，哈哈。比它如何运作更重要的是知道如何实现它。您需要阅读文档才能使用 API 来创建此类功能。

我说的是学习如何钓鱼，而不仅仅是钓这条鱼。

您的第一个资源应该始终是文档。但是当代码刚刚编写时，文档将不存在。所以你就这样做 - 查看正在编写的代码。如果您浏览 Metaplex 存储库，您会看到以下内容：

- [Function definition docs for createMetadataAccountV2 instruction](https://metaplex-foundation.github.io/metaplex-program-library/docs/token-metadata/index.html#createCreateMetadataAccountV2Instruction?utm_source=buildspace.so&utm_medium=buildspace_project)
- [Actual function definition for the createCreateMetadataAccountV2Instruction instruction](https://github.com/metaplex-foundation/metaplex-program-library/blob/caeab0f7/token-metadata/js/src/generated/instructions/CreateMetadataAccountV2.ts#L73?utm_source=buildspace.so&utm_medium=buildspace_project)
- [The test for createMetadataAccountV2 instruction](https://github.com/metaplex-foundation/js/blob/c171e1e31d9fe12852afb39e449123339848180e/packages/js/test/plugins/nftModule/createNft.test.ts#L465?utm_source=buildspace.so&utm_medium=buildspace_project)

这没有太多科学依据，您需要进入代码并找到您需要的内容。您必须了解代码所基于的原语（在本例中为 Solana 指令），并且需要进行几次尝试，但回报将是巨大的。

一般来说，我尝试做的是：
- 在不和谐中搜索/询问（metaplex、anchor 等）
- 在 stackexchange 上搜索/询问
- 查看项目/程序存储库，如果您想弄清楚如何为程序设置指令，请尝试引用测试
- 或者，如果没有测试可以参考复制/粘贴 GitHub 并希望在某处找到参考

希望这能让您了解先驱者是如何做到这一点的:)

回到我们定期安排的大楼！

还记得您之前保存的代币铸造地址吗？当我们在 main 中调用这个新函数时，我们将使用它。如果您丢失了代币铸造账户地址，您始终可以使用[浏览器](https://explorer.solana.com/?cluster=devnet)查找钱包地址并检查“代币”选项卡。

![](./img/upload_1.png)

以下是我们更新后的 main() 函数在调用 createTokenMetadata 函数时的样子：

```ts
async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
  const user = await initializeKeypair(connection)

  console.log("PublicKey:", user.publicKey.toBase58())

  // MAKE SURE YOU REPLACE THIS ADDRESS WITH YOURS!
  const MINT_ADDRESS = "87MGWR6EbAqegYXr3LoZmKKC9fSFXQx4EwJEAczcMpMF"

  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    )

  // Calling the token
  await createTokenMetadata(
    connection,
    metaplex,
    new web3.PublicKey(MINT_ADDRESS),
    user,
    "Pizza", // Token name - REPLACE THIS WITH YOURS
    "PZA",     // Token symbol - REPLACE THIS WITH YOURS
    "Whoever holds this token is invited to my pizza party" // Token description - REPLACE THIS WITH YOURS
  )
}
```

更新铸币地址和代币详细信息并粉碎 npm run start ，您将看到如下内容：

```bash
> solana-course-client@1.0.0 start
> ts-node src/index.ts

Current balance is 1.996472479
PublicKey: 5y3G3Rz5vgK9rKRxu3BaC3PvhsMKGyAmtcizgrxojYAA
image uri: https://arweave.net/7sDCnvGRJAqfgEuGOYWhIshfgTC-hNfG4NSjwsKunQs
metadata uri: https://arweave.net/-2vGrM69PNtb2YaHnOErh1_006D28JJa825CIcEGIok
Create Metadata Account: https://explorer.solana.com/tx/4w8XEGCJY82MnBnErW9F5r1i5UL5ffJCCujcgFeXS8TTdZ6tHBEMznWnPoQXVcsPY3WoPbL2Nb1ubXCUJWWt2GWi?cluster=devnet
Finished successfully
```

所有必要的事情都已经一次性完成了！请随意点击 Arweave 链接 - 它就像分散且永久的 AWS S3/Google 云存储，会向您展示上传的资产是什么样子。


如果您返回浏览器上的代币铸币帐户，您将看到精美的新图标和名称。这是我的：

![](./img/upload_2.png)

正如一位睿智的哲学家曾经说过的，

![](./img/spider-man-pizza-time.gif)

代币元数据程序最酷的部分之一是它的更新非常容易。您需要做的就是将交易从 createCreateMetadataAccountV2Instruction 更改为 createUpdateMetadataAccountV2Instruction ：

```ts
async function updateTokenMetadata(
  connection: web3.Connection,
  metaplex: Metaplex,
  mint: web3.PublicKey,
  user: web3.Keypair,
  name: string,
  symbol: string,
  description: string
) {

  ...

  // transaction to update metadata account
  const transaction = new web3.Transaction().add(
    createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: user.publicKey,
      },
      {
        updateMetadataAccountArgsV2: {
          data: tokenMetadata,
          updateAuthority: user.publicKey,
          primarySaleHappened: true,
          isMutable: true,
        },
      }
    )
  )

  // Everything else remains the same
  ...
}
```

您的令牌现已完成！确保你传播爱。也许可以向您的朋友或 Discord 服务器中的其他构建者发送一些代币。在#progress 中分享您的地址，以便人们可以向您空投他们的代币：D

## 🚢 船舶挑战

年轻的玻璃咀嚼者，是时候从头开始重新实施课程概念了。

尝试构建包含以下说明的单个事务：

- 创建一个新的代币铸币厂

- 为代币铸币厂创建元数据帐户

- 创建一个令牌帐户
    - 如果可以的话，尝试有条件地添加此指令
    - 提示：参考 getOrCreateAssociatedTokenAccount 的实现
    - hint: [https://github.com/solana-labs/solana-program-library/blob/48fbb5b7c49ea35848442bba470b89331dea2b2b/token/js/src/actions/getOrCreateAssociatedTokenAccount.ts#L35](https://github.com/solana-labs/solana-program-library/blob/48fbb5b7c49ea35848442bba470b89331dea2b2b/token/js/src/actions/getOrCreateAssociatedTokenAccount.ts#L35)
- mints tokens


这几乎正​​是您在生产中的做法——所有事情都同时进行。


> 笔记
> 这比正常情况更自由一些。强迫自己。实验。真正尝试理解拼图的每一块。

为了按照我们设想的方式做到这一点，您需要构建每条指令，然后将所有指令添加到单个事务中。一旦您自己解决了这个问题，您就可以在[此存储库](https://github.com/Unboxed-Software/solana-token-metadata)的挑战分支上查看一种可能的实现。

![](./img/upload_3.png)

额外提示：[https://solana-labs.github.io/solana-program-library/token/js/modules.html](https://solana-labs.github.io/solana-program-library/token/js/modules.html) - 查看源代码，不要使用辅助函数。
