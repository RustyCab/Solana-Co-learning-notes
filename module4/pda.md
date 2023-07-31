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

在底层，相关的令牌地址是使用钱包地址、令牌程序ID和令牌铸币地址作为种子来找到的PDA。这提供了一种确定性的方式，可以找到与特定令牌铸币相关的任何钱包地址的令牌账户。

```rust
fn get_associated_token_address_and_bump_seed_internal(
    wallet_address: &Pubkey,
    token_mint_address: &Pubkey,
    program_id: &Pubkey,
    token_program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            &wallet_address.to_bytes(),
            &token_program_id.to_bytes(),
            &token_mint_address.to_bytes(),
        ],
        program_id,
    )
}
```

您使用的种子和PDA账户之间的映射将高度依赖于您的具体程序。虽然这不是关于系统设计或架构的课程，但值得指出一些准则：

- 使用在PDA衍生时已知的种子
- 请谨慎考虑将哪些数据分组到一个账户中
- 对每个账户中使用的数据结构要慎重考虑
- 简单通常更好

## 演示

让我们一起练习之前课程中我们已经做过的电影评论程序。如果你没有完成前一课程，也不用担心 - 你应该可以跟上进度。

作为一个提醒，电影评论程序允许用户创建电影评论。这些评论使用初始化器的公钥和所评论电影的标题存储在一个帐户中，该帐户是通过一个派生的PDA创建的。

之前，我们成功实现了以安全方式更新电影评论的功能。在这个演示中，我们将添加用户对电影评论进行评论的功能。我们将利用构建此功能的机会，通过使用PDA账户来组织评论存储的方式。

### 1. 获取起始代码

首先，您可以在[起始分支](https://github.com/Unboxed-Software/solana-movie-program/tree/starter)上找到起始代码。

如果你一直在关注电影评论的演示，你会注意到这是我们迄今为止构建的程序。之前，我们使用Solana Playground来编写、构建和部署我们的代码。在本课程中，我们将在本地构建和部署程序。

打开文件夹，然后运行 `cargo build-sbf` 来构建程序。`cargo build-sbf` 命令将输出部署程序的指令。

```bash
cargo build-sbf
```

通过复制 `cargo build-sbf` 的输出并运行 `solana program deploy` 命令来部署程序。

```bash
solana program deploy <PATH>
```

您可以使用电影评论[前端](https://github.com/Unboxed-Software/solana-movie-frontend/tree/solution-update-reviews)来测试该程序，并使用您刚刚部署的程序ID进行更新。请确保使用solution-update-reviews分支。

### 2. 规划账户结构

添加评论意味着我们需要就如何存储与每个评论相关的数据做出一些决策。在这里，一个好的结构的标准是：

- 不过分复杂
- 数据很容易检索
- 每个评论都与其关联的评论有一些联系

为了做到这一点，我们将创建两种新的账户类型：

- 评论计数账户
- 评论账户

每个评论都会有一个评论计数器账户，每个评论都会有一个评论账户。评论计数器账户将通过使用评论地址作为种子来找到评论计数器PDA，并使用静态字符串“comment”作为种子。

评论账户将以同样的方式与评论关联。然而，它不会将“评论”字符串作为种子，而是使用实际的评论计数作为种子。这样，客户端可以通过以下方式轻松地检索给定评论的评论：

1. 阅读评论计数器账户上的数据，以确定评论数量。
2. 其中n是评论总数，循环n次。循环的每一次迭代将使用评论地址和当前数字作为种子来生成一个PDA。结果是n个PDA，每个PDA都是存储评论的账户地址。
3.获取每个n个PDA的账户，并读取每个账户中存储的数据。

这确保了我们的每一个账户都可以通过预先已知的数据进行确定性检索。


为了实施这些变化，我们需要做以下几点：

- 定义结构体来表示评论计数器和评论账户
- 更新现有的MovieAccountState以包含一个鉴别器（稍后详细介绍）
- 添加一个指令变体来表示添加评论指令
- 更新现有的add_movie_review指令处理函数，以包括创建评论计数器账户
- 创建一个新的add_comment指令处理函数

### 3. 定义MovieCommentCounter和MovieComment结构体

回想一下，state.rs文件定义了我们的程序用来填充新账户的数据字段的结构体。

我们需要定义两个新的结构体来实现评论功能。

1. 电影评论计数器 - 用于存储与评论相关的评论数量计数器

2. 电影评论 - 用于存储与每条评论相关的数据

首先，让我们定义我们程序将使用的结构体。请注意，我们正在为每个结构体添加一个鉴别器字段，包括现有的MovieAccountState。由于我们现在有多种账户类型，我们需要一种方法来仅从客户端获取所需的账户类型。这个鉴别器是一个字符串，可以用来在获取程序账户时过滤账户。

```rust
#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieAccountState {
    pub discriminator: String,
    pub is_initialized: bool,
    pub reviewer: Pubkey,
    pub rating: u8,
    pub title: String,
    pub description: String,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieCommentCounter {
    pub discriminator: String,
    pub is_initialized: bool,
    pub counter: u64
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieComment {
    pub discriminator: String,
    pub is_initialized: bool,
    pub review: Pubkey,
    pub commenter: Pubkey,
    pub comment: String,
    pub count: u64
}

impl Sealed for MovieAccountState {}

impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for MovieCommentCounter {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for MovieComment {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

```


由于我们在现有的结构体中添加了一个新的判别字段，账户大小计算需要进行更改。让我们利用这个机会稍微整理一下我们的代码。我们将为上述三个结构体中的每一个添加一个常量DISCRIMINATOR，以及一个常量SIZE或函数get_account_size，这样我们在初始化账户时可以快速获取所需的大小。

```rust
impl MovieAccountState {
    pub const DISCRIMINATOR: &'static str = "review";

    pub fn get_account_size(title: String, description: String) -> usize {
        return (4 + MovieAccountState::DISCRIMINATOR.len())
            + 1
            + 1
            + (4 + title.len())
            + (4 + description.len());
    }
}

impl MovieCommentCounter {
    pub const DISCRIMINATOR: &'static str = "counter";
    pub const SIZE: usize = (4 + MovieCommentCounter::DISCRIMINATOR.len()) + 1 + 8;
}

impl MovieComment {
    pub const DISCRIMINATOR: &'static str = "comment";

    pub fn get_account_size(comment: String) -> usize {
        return (4 + MovieComment::DISCRIMINATOR.len()) + 1 + 32 + 32 + (4 + comment.len()) + 8;
    }
}
```

现在无论在哪里我们需要使用鉴别器或账户大小，我们都可以使用这个实现，而不会冒险出现意外的拼写错误。

### 4. 创建AddComment指令

回想一下，instruction.rs文件定义了我们的程序将接受的指令以及如何对每个指令的数据进行反序列化。我们需要为添加评论添加一个新的指令变体。让我们首先在MovieInstruction枚举中添加一个新的变体AddComment。

```rust
pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String
    },
    UpdateMovieReview {
        title: String,
        rating: u8,
        description: String
    },
    AddComment {
        comment: String
    }
}
```

接下来，让我们创建一个CommentPayload结构体来表示与这个新指令相关的指令数据。我们将在账户中包含的大部分数据都是与传入程序的账户相关联的公钥，所以我们实际上只需要一个字段来表示评论文本。


```rust
#[derive(BorshDeserialize)]
struct CommentPayload {
    comment: String
}
```

现在让我们来更新一下如何解析指令数据。请注意，我们已经将指令数据的反序列化移动到了每个匹配的情况中，使用了每个指令的相关载荷结构体。

```rust
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        Ok(match variant {
            0 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description }
            },
            1 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::UpdateMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description
                }
            },
            2 => {
                let payload = CommentPayload::try_from_slice(rest).unwrap();
                Self::AddComment {
                    comment: payload.comment
                }
            }
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
```
最后，让我们在processor.rs中更新process_instruction函数，以使用我们创建的新指令变体。


在processor.rs中，将state.rs中的新结构体引入作用域。

```rust
use crate::state::{MovieAccountState, MovieCommentCounter, MovieComment};
```

然后在process_instruction中，让我们将反序列化的AddComment指令数据与我们即将实现的add_comment函数进行匹配。

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let instruction = MovieInstruction::unpack(instruction_data)?;
    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            add_movie_review(program_id, accounts, title, rating, description)
        },
        MovieInstruction::UpdateMovieReview { title, rating, description } => {
            update_movie_review(program_id, accounts, title, rating, description)
        },

        MovieInstruction::AddComment { comment } => {
            add_comment(program_id, accounts, comment)
        }
    }
}
```

### 5. 更新 add_movie_review 函数以创建评论计数器账户

在我们实现add_comment函数之前，我们需要更新add_movie_review函数以创建评论计数器账户。

请记住，此账户将跟踪与相关评论相关的评论总数。它的地址将是使用电影评论地址和单词“评论”作为种子生成的PDA。请注意，我们存储计数器的方式只是一种设计选择。我们也可以在原始电影评论账户中添加一个“计数器”字段。

在add_movie_review函数中，让我们添加一个pda_counter来表示我们将与电影评论账户一起初始化的新计数器账户。这意味着我们现在希望通过accounts参数将四个账户传递到add_movie_review函数中。

```rust
let account_info_iter = &mut accounts.iter();

let initializer = next_account_info(account_info_iter)?;
let pda_account = next_account_info(account_info_iter)?;
let pda_counter = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;
```

接下来，我们需要检查total_len是否小于1000字节，但由于我们添加了鉴别器，total_len不再准确。让我们将total_len替换为调用MovieAccountState::get_account_size：

```rust
let account_len: usize = 1000;

if MovieAccountState::get_account_size(title.clone(), description.clone()) > account_len {
    msg!("Data length is larger than 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into());
}
```

请注意，这也需要在update_movie_review函数中进行更新，以使该指令正常工作。

一旦我们初始化了审查账户，我们还需要使用MovieAccountState结构中指定的新字段来更新account_data。

```rust
account_data.discriminator = MovieAccountState::DISCRIMINATOR.to_string();
account_data.reviewer = *initializer.key;
account_data.title = title;
account_data.rating = rating;
account_data.description = description;
account_data.is_initialized = true;
```

最后，让我们在add_movie_review函数中添加逻辑来初始化计数器账户。这意味着：

1. 计算柜台账户的租金豁免金额
2. 使用评论地址和字符串“comment”作为种子来推导计数PDA
3. 调用系统程序创建账户
4. 设置起始计数器值
5. 将账户数据序列化并从函数中返回

所有这些都应该添加到add_movie_review函数的末尾，然后再加上Ok(())。

```rust
msg!("create comment counter");
let rent = Rent::get()?;
let counter_rent_lamports = rent.minimum_balance(MovieCommentCounter::SIZE);

let (counter, counter_bump) =
    Pubkey::find_program_address(&[pda.as_ref(), "comment".as_ref()], program_id);
if counter != *pda_counter.key {
    msg!("Invalid seeds for PDA");
    return Err(ProgramError::InvalidArgument);
}

invoke_signed(
    &system_instruction::create_account(
        initializer.key,
        pda_counter.key,
        counter_rent_lamports,
        MovieCommentCounter::SIZE.try_into().unwrap(),
        program_id,
    ),
    &[
        initializer.clone(),
        pda_counter.clone(),
        system_program.clone(),
    ],
    &[&[pda.as_ref(), "comment".as_ref(), &[counter_bump]]],
)?;
msg!("comment counter created");

let mut counter_data =
    try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

msg!("checking if counter account is already initialized");
if counter_data.is_initialized() {
    msg!("Account already initialized");
    return Err(ProgramError::AccountAlreadyInitialized);
}

counter_data.discriminator = MovieCommentCounter::DISCRIMINATOR.to_string();
counter_data.counter = 0;
counter_data.is_initialized = true;
msg!("comment count: {}", counter_data.counter);
counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;
```

现在当创建新的评论时，会初始化两个账户：

1. 第一个是存储评论内容的审核账户。这与我们开始使用的程序版本没有变化。

2. 第二个账户存储评论计数器

### 6. 实施添加评论

最后，让我们实现我们的add_comment函数来创建新的评论账户。

当为评论创建新评论时，我们将在评论计数器PDA账户上递增计数，并使用评论地址和当前计数派生评论账户的PDA。

就像其他指令处理函数一样，我们将从传入程序的账户中进行迭代。然后，在执行任何其他操作之前，我们需要对计数器账户进行反序列化，以便我们可以访问当前的评论计数。

```rust
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String
) -> ProgramResult {
    msg!("Adding Comment...");
    msg!("Comment: {}", comment);

    let account_info_iter = &mut accounts.iter();

    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let mut counter_data = try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

    Ok(())
}
```


现在我们可以继续进行剩下的步骤，因为我们已经获得了柜台数据

1. 计算新评论账户的租金免税金额
2. 使用评论地址和当前评论计数作为种子来推导评论账户的PDA
3. 调用系统程序创建新的评论账户
4. 为新创建的账户设置适当的值
5. 将账户数据序列化并从函数中返回


```rust
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String
) -> ProgramResult {
    msg!("Adding Comment...");
    msg!("Comment: {}", comment);

    let account_info_iter = &mut accounts.iter();

    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let mut counter_data = try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

    let account_len = MovieComment::get_account_size(comment.clone());

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    let (pda, bump_seed) = Pubkey::find_program_address(&[pda_review.key.as_ref(), counter_data.counter.to_be_bytes().as_ref(),], program_id);
    if pda != *pda_comment.key {
        msg!("Invalid seeds for PDA");
        return Err(ReviewError::InvalidPDA.into())
    }

    invoke_signed(
        &system_instruction::create_account(
        commenter.key,
        pda_comment.key,
        rent_lamports,
        account_len.try_into().unwrap(),
        program_id,
        ),
        &[commenter.clone(), pda_comment.clone(), system_program.clone()],
        &[&[pda_review.key.as_ref(), counter_data.counter.to_be_bytes().as_ref(), &[bump_seed]]],
    )?;

    msg!("Created Comment Account");

    let mut comment_data = try_from_slice_unchecked::<MovieComment>(&pda_comment.data.borrow()).unwrap();

    msg!("checking if comment account is already initialized");
    if comment_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    comment_data.discriminator = MovieComment::DISCRIMINATOR.to_string();
    comment_data.review = *pda_review.key;
    comment_data.commenter = *commenter.key;
    comment_data.comment = comment;
    comment_data.is_initialized = true;
    comment_data.serialize(&mut &mut pda_comment.data.borrow_mut()[..])?;

    msg!("Comment Count: {}", counter_data.counter);
    counter_data.counter += 1;
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    Ok(())
}
```

### 7. 构建和部署

我们已经准备好构建和部署我们的程序了！


通过运行`cargo build-sbf` 来构建更新的程序。然后通过运行在控制台打印的`solana program deploy`命令来部署程序。

您可以通过提交带有正确指令数据的交易来测试您的程序。您可以创建自己的脚本，或者随意使用这个[前端](https://github.com/Unboxed-Software/solana-movie-frontend/tree/solution-add-comments)界面。请确保使用 `solution-add-comments` 分支，并将 `utils/constants.ts` 中的 MOVIE_REVIEW_PROGRAM_ID 替换为您的程序ID，否则前端将无法与您的程序配合工作。

请记住，我们对审查账户进行了重大更改（即添加了一个鉴别器）。如果您在部署此程序时使用了之前使用过的相同程序ID，由于数据不匹配，此前创建的任何审查都不会显示在此前端。


如果你需要更多时间来熟悉这些概念，可以在继续之前查看解决方案代码。请注意，解决方案代码位于链接仓库的solution-add-comments分支上。

## 挑战

现在轮到你独立构建一些东西了！继续使用我们在之前课程中使用过的学生介绍程序。学生介绍程序是一个Solana程序，可以让学生们介绍自己。该程序接受用户的姓名和简短留言作为指令数据，并创建一个账户来存储这些数据。在这个挑战中，你应该：

1. 添加一条指示，允许其他用户回复介绍
2. 在本地构建和部署程序

如果你之前没有跟随过之前的课程或者没有保存你之前的工作，请随意使用这个存储库的[起始代码](https://github.com/Unboxed-Software/solana-student-intro-program/tree/starter)。

如果可以的话，尽量独立完成这个任务！但如果遇到困难，可以参考[解决方案代码](https://github.com/Unboxed-Software/solana-student-intro-program/tree/solution-add-replies)。请注意，解决方案代码位于solution-add-replies分支上，你的代码可能会稍有不同。
