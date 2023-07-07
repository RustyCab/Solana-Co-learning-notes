# learn-solana


## 前置环境准备

- [x] 1. [安装 Rust](https://www.rust-lang.org/tools/install)
- [x] 2. [安装 Solana](https://docs.solana.com/cli/install-solana-cli-tools)
- [x] 3. [安装 Node.js](https://nodejs.org/en/download/)
- [x] 4. [安装 Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [x] 5. [配置第三方RPC服务: QuickNode](https://www.quicknode.com/)
    - 这里我们选择使用 QuickNode 作为我们的 RPC 服务，因为它提供了免费的 RPC 服务，而且它的服务节点分布在全球各地，可以为我们提供更好的网络体验。
    - 注意我们使用的是DevNet网络，而不是MainNet网络，因为我们在开发过程中需要使用测试币，而不是真正的币。
- [x] 6. [安装 Solana 浏览器插件](https://phantom.app/)
    - Solana 浏览器插件是一个浏览器插件，它可以让我们在浏览器中连接到 Solana 网络，并且可以让我们在浏览器中查看我们的钱包地址和余额等信息。
    - 安装完成后，我们需要在浏览器中登录我们的钱包，这里我们选择使用 Sollet 钱包，因为它是一个网页钱包，我们可以直接在浏览器中使用它，而不需要下载安装任何软件。
- [x] 7. [文件编辑器]
    - [Vscode](https://code.visualstudio.com/)
    - [Zed](https://zed.dev/download)

- [x] 8. [Solan 前端模版配置](./how-to-setting-solana-front.md)

## Module1: 客户端与 Solana 网络的交互

### 从网络读取数据
### 将数据写入网络
### 与钱包互动
### 序列化自定义指令数据
### 反序列化自定义帐户数据
### 页面、顺序和过滤器自定义帐户数据

## Module 2: 客户端与常见 Solana 程序的交互

### 使用Token Program 创建Token
### 通过Token Swap Program 交换Token
### 使用 Metaplex 创建 Solana NFT

## 模块3: 基本 Solana 程序开发

### Hello, World
### 创建基本程序，第 1 部分 - 处理指令数据
### 创建基本程序，第 2 部分 - 状态管理
### 创建基本程序，第 3 部分 - 基本安全性和验证

## 模块4: 中级 Solana 程序开发

### 本地程序开发
### 程序派生地址
### 跨程序调用

## 模块5: Anchor 项目开发

### Anchor 开发简介
### 客户端 Anchor 开发简介
### Anchor PDA 和账户
### Anchor CPI 和错误

## 模块6: 超越基础

### Solana 程序中的环境变量
### Solana 支付
### 版本化事务和查找表
### Rust 程序宏

## 模块7: Solana 程序安全

### 如何使用程序安全模块
### 签名人授权
### owner 检查
### 账户数据匹配
### 重新初始化攻击
### 重复的可变帐户
### Type 角色扮演
### Arbitrary CPIs
### Bump seed canonicalization
### 关闭账户和revival攻击
### PDA共享




## Reference

- [buildspace](https://buildspace.so/)
- [Intro Solana](https://www.soldev.app/course)
- [Solana CookBook](https://solanacookbook.com/)
- [Solana Docs](https://docs.solana.com/)
- [QuickNode Solana Rpc Docs](https://www.quicknode.com/docs/solana)
- [QuickNode Solana Developer Docs](https://www.quicknode.com/guides/solana-development/getting-started/solana-fundamentals-reference-guide)
- [alchemy Solana docs](https://docs.alchemy.com/reference/solana-api-quickstart)
- [Alchemy Doc](https://docs.alchemy.com/)
- [Figment Learn](https://learn.figment.io/protocols/solana)
- [Solana CookBook](https://solanacookbook.com/)
- [Solana Terminology](https://docs.solana.com/terminology)

## 不错的Solana文章
- [Squads blog](https://squads.so/blog)
- [Solana Dev](https://www.soldev.app/)
- [First impressions of Rust programming on Solana](https://brson.github.io/2021/06/08/rust-on-solana)
- [Programming on Solana - An Introduction
](https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/)

## 希望后面要做的事情

- [Solana 手机App开发](https://solanamobile.com/zh/developers)
    - [Solana Mobile Stack SDK](https://github.com/solana-mobile/solana-mobile-stack-sdk#solana-mobile-stack-sdk)
    - [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter)
- [backpack app开发](https://docs.xnfts.dev/getting-started/introduction)
