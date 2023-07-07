# Rust Program Quickstart

Rust 是编写 Solana 程序最常用的编程语言。本快速入门指南将演示如何快速设置、构建第一个基于 Rust 的 Solana 程序并将其部署到区块链。

> 注意：本指南使用 Solana CLI 并假设您已设置[本地开发环境](https://docs.solana.com/getstarted/local)。请在此处查看我们的本地开发快速入门指南以快速进行设置。

## 你将学到什么

- 如何在本地安装Rust语言
- 如何初始化新的 Solana Rust 程序
- 如何使用 Rust 编写基本的 Solana 程序
- 如何构建和部署 Rust 程序

## 安装 Rust 和 Cargo​

为了能够编译基于 Rust 的 Solana 程序，请使用 [Rustup](https://rustup.rs/) 安装 Rust 语言和 Cargo（Rust 包管理器）：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## 运行本地主机验证器​

Solana CLI 附带内置的[测试验证器](https://docs.solana.com/developing/test-validator)。此命令行工具将允许您在计算机上运行完整的区块链集群。

> 业提示：在新的/单独的终端窗口中运行 Solana 测试验证器，该窗口将保持打开状态。此命令行程序必须保持运行，以便本地主机验证器保持在线并准备好执行操作。


## 使用 Cargo 创建一个新的 Rust 库​

用 Rust 编写的 Solana 程序是编译为 [BPF](https://docs.solana.com/developing/on-chain-programs/faq#berkeley-packet-filter-bpf) 字节码并以 .so 格式保存的库。

通过 Cargo 命令行初始化一个名为 hello_world 的新 Rust 库：

```bash
cargo init hello_world --lib
cd hello_world
```

将 solana-program 箱添加到新的 Rust 库中：

```bash
cargo add solana-program
```

打开您的 Cargo.toml 文件并添加这些必需的 Rust 库配置设置，并根据需要更新您的项目名称：

```toml
[lib]
name = "hello_world"
crate-type = ["cdylib", "lib"]
```

## 创建您的第一个 Solana 程序​

基于 Rust 的 Solana 程序的代码将位于您的 src/lib.rs 文件中。在 src/lib.rs 中，您将能够导入 Rust 包并定义您的逻辑。在您喜欢的编辑器中打开您的 src/lib.rs 文件。

在 lib.rs 顶部，导入 solana-program 箱并将我们需要的项目放入本地命名空间中：

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};
```

每个 Solana 程序都必须定义一个 [entrypoint](https://docs.solana.com/developing/on-chain-programs/developing-rust#program-entrypoint) 来告诉 Solana 运行时从哪里开始执行链上代码。您的程序的入口点应该提供一个名为 process_instruction 的公共函数：

```rust
// declare and export the program's entrypoint
entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // log a message to the blockchain
    msg!("Hello, world!");

    // gracefully exit the program
    Ok(())
}
```

每个链上程序都应返回 Ok [result enum](https://doc.rust-lang.org/std/result/)，其值为 () 。这告诉 Solana 运行时您的程序已成功执行，没有错误。


上面的程序将简单地[记录一条消息](https://docs.solana.com/developing/on-chain-programs/debugging#logging)“Hello, world!”到区块链集群，然后使用 Ok(()) 优雅退出。

## 构建您的 Rust 程序​

在终端窗口内，您可以通过在项目的根目录（即包含 Cargo.toml 文件的目录）中运行来构建 Solana Rust 程序：

```bash
cargo build-bpf
```

> 注意：每次构建 Solana 程序后，上述命令将输出已编译程序的 .so 文件的构建路径以及将用于程序地址的默认密钥文件。 cargo build-bpf 从当前安装的 solana CLI 工具安装工具链。如果遇到任何版本不兼容的情况，您可能需要升级这些工具。

## 部署您的 Solana 程序​

使用 Solana CLI，您可以将程序部署到当前选择的集群：

```bash
solana program deploy ./target/deploy/hello_world.so
```

一旦您的 Solana 程序被部署（并且交易[完成](https://docs.solana.com/cluster/commitments)），上述命令将输出您程序的公共地址（也称为“程序 id”）。

### 恭喜！

您已使用 Rust 语言成功设置、构建和部署了 Solana 程序。

> PS：部署后请再次检查您的 Solana 钱包余额。看看部署您的简单程序需要多少 SOL 成本？
