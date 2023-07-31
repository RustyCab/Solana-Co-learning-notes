# PDAs

## 简而言之

- **程序派生地址（PDA）**是由**程序ID**和可选的种子列表派生而来的
- PDA是由它们衍生的程序所拥有和控制的
- PDA派生提供了一种确定性的方法，可以根据用于派生的种子来查找数据
- 种子可以用来映射到存储在独立PDA账户中的数据
- 一个程序可以代表从其ID派生的PDA签署指令

## 概述


### 什么是程序派生地址？

程序派生地址（PDAs）是设计为由程序而不是秘密密钥签名的账户地址。正如名称所示，PDAs是使用程序ID派生的。可选地，这些派生账户也可以使用ID和一组“种子”来找到。稍后会详细介绍，但这些种子将在我们使用PDAs进行数据存储和检索时发挥重要作用。

PDA主要有两个主要功能：

1. 提供一种确定性的方法来查找程序拥有的账户的地址
2. 授权该PDA衍生的程序代表其签署，就像用户可以使用私钥签署一样

在本课程中，我们将重点讨论使用PDA来查找和存储数据。我们将在未来的课程中更详细地讨论使用PDA进行签名，届时我们将涵盖跨程序调用（CPIs）。

### 寻找PDA

PDA并非技术上创造而来，而是根据程序ID和一个或多个输入种子来发现或派生出来的。

Solana的密钥对可以在所谓的Ed25519椭圆曲线（Ed25519）上找到。Ed25519是Solana用来生成相应的公钥和私钥的确定性签名方案。我们将这些公私钥对称为密钥对。

另外，PDAs是位于Ed25519曲线之外的地址。这实际上意味着它们是没有相应私钥的公钥。PDAs的这个特性对于程序能够代表其签名是至关重要的，但我们将在未来的课程中进行讲解。

要在Solana程序中找到一个PDA，我们将使用`find_program_address`函数。该函数接受一个可选的“种子”列表和一个程序ID作为输入，然后返回PDA和一个增加的种子。

```rust
let (pda, bump_seed) = Pubkey::find_program_address(&[user.key.as_ref(), user_input.as_bytes().as_ref(), "SEED".as_bytes()], program_id);
```

### 种子

“种子”是在find_program_address函数中用于派生PDA的可选输入。例如，种子可以是任意组合的公钥、用户提供的输入或硬编码的值。也可以仅使用程序ID而不使用额外的种子来派生PDA。然而，使用种子来找到我们的PDA允许我们创建程序可以拥有的任意数量的账户。

当你作为开发者决定传递给`find_program_address`函数的种子时，函数本身会提供一个额外的种子，称为“bump seed”。用于派生PDA的加密函数大约有50%的概率生成位于Ed25519曲线上的密钥。为了确保结果不在Ed25519曲线上，因此没有私钥，`find_program_address`函数会添加一个称为“bump seed”的数字种子。

该函数从使用值255作为碰撞种子开始，然后检查输出是否为有效的PDA。如果结果不是有效的PDA，则函数将碰撞种子减1并再次尝试（255、254、253等）。一旦找到有效的PDA，函数将返回PDA和用于生成PDA的碰撞值。

### 在find_program_address的内部实现中


让我们来看一下find_program_address的源代码。

```rust
pub fn find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> (Pubkey, u8) {
    Self::try_find_program_address(seeds, program_id)
        .unwrap_or_else(|| panic!("Unable to find a viable program address bump seed"))
}
```

在内部，`find_program_address`函数将输入的种子和程序ID传递给`try_find_program_address`函数。

`try_find_program_address`函数引入了`bump_seed`。`bump_seed`是一个取值范围在0到255之间的u8变量。从255开始迭代一个递减的范围，将`bump_seed`附加到可选的输入种子中，然后将它们传递给`create_program_address`函数。如果`create_program_address`的输出不是一个有效的PDA，则将`bump_seed`减1，并继续循环，直到找到一个有效的PDA为止。


```rust
pub fn try_find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> Option<(Pubkey, u8)> {

    let mut bump_seed = [std::u8::MAX];
    for _ in 0..std::u8::MAX {
        {
            let mut seeds_with_bump = seeds.to_vec();
            seeds_with_bump.push(&bump_seed);
            match Self::create_program_address(&seeds_with_bump, program_id) {
                Ok(address) => return Some((address, bump_seed[0])),
                Err(PubkeyError::InvalidSeeds) => (),
                _ => break,
            }
        }
        bump_seed[0] -= 1;
    }
    None

}
```

`create_program_address`函数对种子和program_id执行一系列哈希操作。这些操作计算出一个密钥，然后验证计算出的密钥是否位于Ed25519椭圆曲线上。如果找到有效的PDA（即位于曲线外的地址），则返回该PDA。否则，返回错误。

```rust
pub fn create_program_address(
    seeds: &[&[u8]],
    program_id: &Pubkey,
) -> Result<Pubkey, PubkeyError> {

    let mut hasher = crate::hash::Hasher::default();
    for seed in seeds.iter() {
        hasher.hash(seed);
    }
    hasher.hashv(&[program_id.as_ref(), PDA_MARKER]);
    let hash = hasher.result();

    if bytes_are_curve_point(hash) {
        return Err(PubkeyError::InvalidSeeds);
    }

    Ok(Pubkey::new(hash.as_ref()))

}
```

总结一下，`find_program_address`函数将我们的输入种子和程序ID传递给`try_find_program_address`函数。`try_find_program_address`函数将一个`bump_seed`（从255开始）添加到我们的输入种子中，然后调用`create_program_address`函数，直到找到一个有效的PDA为止。一旦找到，PDA和`bump_seed`都会被返回。

请注意，对于相同的输入种子，不同的有效bump将生成不同的有效PDA。`find_program_address`返回的`bump_seed`将始终是找到的第一个有效PDA。因为该函数从255开始向下迭代到零，最终返回的bump_seed将始终是可能的最大有效8位值。这个`bump_seed`通常被称为“规范bump”。为避免混淆，建议只使用规范bump，并始终验证传入程序的每个PDA。

需要强调的一点是，`find_program_address`函数只返回一个程序派生地址和用于派生它的`bump seed`。`find_program_address`函数不会初始化一个新的账户，也不会返回与存储数据的账户必然关联的PDA。

### 使用PDA账户存储数据

由于程序本身是无状态的，程序状态是通过外部账户进行管理的。**鉴于您可以使用种子进行映射，并且程序可以代表其签名，使用PDA账户来存储与程序相关的数据是一种非常常见的设计选择。虽然程序可以调用系统程序来创建非PDA账户并使用其来存储数据，但PDA账户往往是首选。**

如果你需要回顾一下如何在PDA中存储数据，请参考《创建基本程序，第二部分-状态管理》课程。

### PDA账户中存储的数据映射

将数据存储在PDA账户中只是方程的一半。您还需要一种检索数据的方法。我们将讨论两种方法：

1. 创建一个PDA“map”账户，用于存储各种数据存储账户的地址
2. 通过策略性地使用种子来定位合适的PDA账户并检索所需数据

### 使用PDA将数据映射到“map”账户

一种组织数据存储的方法是将相关数据的簇存储在它们自己的PDA中，然后有一个单独的PDA账户来存储所有数据的映射。

例如，您可能有一个笔记应用程序，其后台程序使用随机种子生成PDA账户，并在每个账户中存储一条笔记。该程序还将具有一个单一的全局PDA“map”账户，该账户存储用户公钥与存储其笔记的PDA列表之间的映射关系。这个映射账户将使用静态种子派生，例如“GLOBAL_MAPPING”。


当需要检索用户的笔记时，您可以查看地图账户，查看与用户的公钥关联的地址列表，然后检索每个地址的账户。

虽然这种解决方案对于传统的网页开发人员来说可能更容易接受，但它确实带来了一些特定于web3开发的缺点。由于存储在映射账户中的映射大小会随着时间的推移而增长，您要么需要在首次创建账户时分配比实际需要更多的空间，要么每次创建新的注释时都需要重新分配空间。除此之外，您最终会达到账户大小限制的10兆字节。

您可以通过为每个用户创建一个单独的地图账户来在一定程度上缓解这个问题。例如，不是为整个程序创建一个单一的PDA地图账户，而是为每个用户构建一个PDA地图账户。每个地图账户可以使用用户的公钥派生。然后，每个便签的地址可以存储在相应用户的地图账户中。

这种方法减小了每个地图账户所需的大小，但最终仍然给整个过程增加了一个不必要的要求：在能够找到带有相关注释数据的账户之前，必须先阅读地图账户上的信息。

在某些情况下，使用这种方法可能对您的应用程序有意义，但我们不建议将其作为您的“首选”策略。


### 使用PDA推导将MAP转化为数据

如果你在选择用于生成PDA的种子时有策略，你可以将所需的映射嵌入到种子中。这是我们刚刚讨论的笔记应用示例的自然演变。如果你开始使用笔记创建者的公钥作为种子为每个用户创建一个映射账户，那么为什么不同时使用创建者的公钥和其他已知的信息来生成笔记本身的PDA呢？

现在，虽然没有明确提及，但我们在整个课程中一直在将种子映射到账户上。想想我们在之前的课程中构建的电影评论程序。该程序使用评论创建者的公钥和他们正在评论的电影的标题来找到应该用于存储评论的地址。这种方法使得程序能够为每个新评论创建一个唯一的地址，同时在需要时也能轻松找到评论。当你想要找到用户对《蜘蛛侠》的评论时，你知道它存储在可以使用用户的公钥和文本“蜘蛛侠”作为种子来派生地址的PDA账户中。

```rust
let (pda, bump_seed) = Pubkey::find_program_address(&[
        initializer.key.as_ref(),
        title.as_bytes().as_ref()
    ],
    program_id)
```

### 关联的令牌账户地址

这种类型的映射的另一个实际例子是**关联代币账户（ATA）地址**的确定方式。代币通常存放在一个ATA中，其地址是通过钱包地址和特定代币的铸币地址派生而来的。通过使用`get_associated_token_address`函数，可以找到ATA的地址，该函数接受钱包地址和代币铸币地址作为输入。

```rust
let associated_token_address = get_associated_token_address(&wallet_address, &token_mint_address);
```
