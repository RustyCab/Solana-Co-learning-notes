# Hello World

## 长话短说

- Solana 上的程序是一种特殊类型的帐户，用于存储和执行指令逻辑
- Solana 程序有一个处理指令的入口点
- 程序使用指令中包含的`program_id`、`accounts`和`instruction_data`来处理指令

---

## 概述

Solana运行任意可执行代码的能力是其如此强大的部分原因。Solana程序与其他区块链环境中的“智能合约”类似，实际上是Solana生态系统的支柱。
随着开发人员和创建者构思和部署新程序，程序的集合每天都在增长。

本课程将向您介绍如何使用 Rust 编程语言编写和部署 Solana 程序。为了避免因设置本地开发环境而分散注意力，我们将使用名为 Solana Playground 的基于浏览器的 IDE。

---

### Rust 基础知识


在我们潜入大楼之前，我们会说“你好，世界！”程序，让我们首先回顾一些 Rust基础知识。如果您想深入了解 Rust，请查看 [Rust 语言书籍](https://doc.rust-lang.org/book/ch00-00-introduction.html)。

---

#### 模块系统

Rust 使用统称为“模块系统”的方式来组织代码。

这包括：
- `modules` - 模块将代码分成逻辑单元，为路径的组织、范围和隐私提供隔离的命名空间.
- `crates` - 板条箱可以是库，也可以是可执行程序。板条箱的源代码通常分为多个模块。
- `packages` - 包包含一组 `crate` 以及用于指定包之间的元数据和依赖关系的清单文件

在本课中，我们将重点关注`crates`和`modules`的使用。

---

#### 路径和范围

Rust中的crates包含定义可以与多个项目共享的功能的模块。
如果我们想访问模块中的某个项目，那么我们需要知道它的“路径”（就像我们在文件系统中导航时一样）。

将crates结构视为一棵树，其中crates是基础，模块是分支，每个分支都可以具有作为附加分支的子模块或项目。

特定模块或项目的路径是从 crate 到该模块的每个步骤的名称，其中每个步骤均由 `::` 分隔。作为示例，让我们看一下以下结构：

1. 基础包是 `solana_program`
2. `solana_program` 包含一个名为 `account_info` 的模块
3. `account_info` 模块包含一个名为 `AccountInfo` 的项目

`AccountInfo` 的路径为 `solana_program::account_info::AccountInfo`。

如果没有任何其他关键字，我们需要引用整个路径才能在代码中使用 `AccountInfo`。

但是，使用 `use` 关键字，我们可以将某个项目纳入范围，以便可以在整个文件中重复使用它，而无需每次都指定完整路径。在 Rust 文件的顶部经常会看到一系列 `use` 命令。

```rust
use solana_program::account_info::AccountInfo
```

---


#### 在 Rust 中声明函数

我们在 Rust 中定义函数时使用 fn 关键字，后跟函数名和一组括号。

```rust
fn process_instruction()
```

然后，我们可以通过包含变量名称并在括号内指定其相应的数据类型来向函数添加参数。

Rust 被称为“静态类型”语言，Rust 中的每个值都具有某种“数据类型”。这意味着 Rust 必须在编译时知道所有变量的类型。在可能存在多种类型的情况下，我们必须向变量添加类型注释。

在下面的示例中，我们创建一个名为 `process_instruction` 的函数，该函数需要以下参数：

- `program_id` - 必须为 `&Pubkey` 类型
- `accounts` - 需要输入 `&[AccountInfo]`
- `instructions_data` - 必须为 `&[u8]` 类型

请注意 `process_instruction` 函数中列出的每个参数的类型前面的 `&`。在 Rust 中，`&` 代表对另一个变量的“引用”。这允许您引用某些值而不获取它的所有权。 “引用”保证指向特定类型的有效值。在 Rust 中创建引用的动作称为“借用”。

---

在此示例中，当调用 `process_instruction` 函数时，用户必须传入所需参数的值。然后，`process_instruction` 函数引用用户传入的值，并保证每个值都是 `process_instruction` 函数中指定的正确数据类型。

另外，请注意 `&[AccountInfo]` 和 `&[u8]` 周围的方括号 `[]`。这意味着`accounts`和`instruction_data`参数分别需要`AccountInfo`和`u8`类型的“切片”。 “切片”类似于数组（相同类型的对象的集合），只是长度在编译时未知。换句话说，`accounts` 和`instruction_data` 参数需要未知长度的输入。

```rust
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
)
```


然后，我们可以通过在函数后面使用箭头 `->` 声明返回类型来让函数返回值。

在下面的示例中，`process_instruction` 函数现在将返回 `ProgramResult` 类型的值。我们将在下一节中讨论这个问题。

```rust
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult
```

---

#### Result enum

`Result` 是一个标准库类型，表示两个离散结果：成功 (Ok) 或失败(Err)。我们将在以后的课程中更多地讨论枚举，但是您将在本课程后面看到使用 Ok，因此涵盖基础知识非常重要。

当您使用 Ok 或 Err 时，必须包含一个值，该值的类型由代码的上下文确定。例如，需要 `Result` 类型的返回值的函数表示该函数可以返回带有嵌入字符串值的 Ok 或带有嵌入整数的 Err。在此示例中，整数是可用于适当处理错误的错误代码。


要返回带有字符串值的成功案例，您可以执行以下操作：

```rust
Ok(String::from("Success!"));
```

要返回整数错误，您可以执行以下操作：

```rust
Err(404);
```

---

### Solana Programs

回想一下，Solana 网络上存储的所有数据都包含在所谓的帐户中。每个帐户都有自己唯一的地址，用于识别和访问帐户数据。 Solana 程序只是一种特定类型的 Solana 帐户，用于存储和执行指令。

---

#### Solana Program Crate

要使用 Rust 编写 Solana 程序，我们使用 `solana_program` 库 crate。 `solana_program` 箱充当 Solana 程序的标准库。该标准库包含我们将用于开发 Solana 程序的模块和宏。如果您想深入了解 `solana_program` 箱，请查看[此处](https://docs.rs/solana-program/latest/solana_program/index.html)。

对于基本程序，我们需要将 `solana_program` 箱中的以下项目纳入范围：

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};
```

- `AccountInfo` - account_info 模块中的一个结构体，允许我们访问帐户信息
- `entrypoint` - 声明程序入口点的宏
- `ProgramResult` - 入口点模块中返回 Result 或 ProgramError 的类型
- `Pubkey` - pubkey 模块中的一个结构，允许我们将地址作为公钥访问
- `msg` - 一个允许我们将消息打印到程序日志的宏

---

#### Solana 程序入口点

Solana 程序需要单个入口点来处理程序指令。入口点是使用声明的 `entrypoint!`宏。

Solana 程序的入口点需要带有以下参数的 `process_instruction` 函数：

- `program_id` - 存储程序的帐户的地址
- `accounts` - 处理指令所需的账户列表
- `instructions_data` - 序列化的、特定于指令的数据

```rust
entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult;
```

回想一下，Solana 程序帐户仅存储处理指令的逻辑。这意味着程序帐户是“只读”和“无状态”的。程序处理指令所需的“状态”（数据集）存储在数据帐户中（与程序帐户分开）。

为了处理指令，指令所需的数据帐户必须通过帐户参数显式传递到程序中。任何其他输入都必须通过 instructions_data 参数传入。

程序执行后，程序必须返回 `ProgramResult` 类型的值。该类型是 `Result`，其中成功案例的嵌入值为 `()`，失败案例的嵌入值为 `ProgramError`。 `()` 实际上是一个空值，`ProgramError` 是 `solana_program` 箱中定义的错误类型。

...现在您已经了解了使用 Rust 创建 Solana 程序的基础所需的所有内容。让我们练习一下到目前为止所学的内容吧！

---

## 演示

我们将构建一个“Hello, World!”使用 Solana Playground 的程序。 Solana Playground 是一个允许您从浏览器编写和部署 Solana 程序的工具。

---

### 1. 设置

单击[此处](https://beta.solpg.io/)打开 Solana 游乐场。接下来，继续删除默认lib.rs 文件中的所有内容并创建一个 Playground 钱包。

![](./img/hello-world-create-wallet.gif)

---


### 2. Solana Program Crate

首先，让我们将 `solana_program crate` 中所需的所有内容纳入范围。

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};

```
接下来，让我们使用入口点设置程序的 `entrypoint!`宏并创建 `process_instruction` 函数。消息！然后宏允许我们打印“Hello, world!”当程序被调用时记录到程序日志中。

---

### 3. Entry Point

```rust
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult{
    msg!("Hello, world!");

    Ok(())
}
```

总而言之，“你好，世界！”程序将如下所示：

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult{
    msg!("Hello, world!");

    Ok(())
}
```

---

### 4. 构建和部署

现在让我们使用 Solana Playground 构建和部署我们的程序。

![](./img/hello-world-build-and-deploy.gif)

---

### 5. 调用程序

最后，让我们从客户端调用我们的程序。在[这里](https://github.com/Unboxed-Software/solana-hello-world-client)下载代码。

本课程的重点是构建我们的 Solana 程序，因此我们继续提供客户端代码来调用我们的“Hello, world!”程序。提供的代码包括一个 sayHello 辅助函数，用于构建和提交我们的交易。然后，我们在主函数中调用 `sayHello` 并打印 Solana Explorer URL 以在浏览器中查看交易详细信息。

打开`index.ts` 文件，您应该看到一个名为`programId` 的变量。继续使用您刚刚使用 Solana Playground 部署的“Hello, world!”程序的程序 ID 来更新它。


```ts
let programId = new web3.PublicKey("<YOUR_PROGRAM_ID>");
```


您可以参考下图在 Solana Playground 上找到程序 ID。

![](./img/hello-world-program-id.png)

接下来，使用 `npm i` 安装 Node 模块。

现在，继续运行 `npm start`。该命令将：

1. 生成一个新的密钥对并创建一个 `.env` 文件（如果尚不存在）
2. 空投开发网 SOL
3. 调用“你好，世界！”程序
4. 输出交易 URL 以在 Solana Explorer 上查看

将控制台中打印的交易 URL 复制到浏览器中。向下滚动查看“你好，世界！”在程序指令日志下。

![](./img/hello-world-program-log.png)

恭喜，您刚刚成功构建并部署了 Solana 程序！

---

## 挑战


现在轮到你独立构建一些东西了。因为我们从非常简单的程序开始，所以您的程序看起来几乎与我们刚刚创建的程序相同。尝试达到可以从头开始编写而不引用先前代码的程度是很有用的，因此尽量不要在此处复制和粘贴。

1. 编写一个使用 msg! 的新程序！宏将您自己的消息打印到程序日志中。
2. 像我们在演示中所做的那样构建和部署您的程序。
3. 调用新部署的程序并使用 Solana Explorer 检查您的消息是否打印在程序日志中。

与往常一样，如果您愿意，请发挥创意来应对这些挑战，并超越基本说明，享受乐趣！
