# 遇到的一些Solana的问题

## 在linux上配置安装solana环境遇到（Can't start solana-test-validator on MacOS 13.0.1）

> 解决方案: https://solana.stackexchange.com/questions/4499/cant-start-solana-test-validator-on-macos-13-0-1/4761#4761

## 在mac上配置安装solana环境遇到除了上面的问题,解决方法

mac需要安装`gnu-tar`，
```bash
brew reinstall gnu-tar
```

但是运行`solana-test-validator`的时候还是会报错

```bash
Shred Version: 25234
Gossip Address: 127.0.0.1:1024
TPU Address: 127.0.0.1:1027
JSON RPC URL: http://127.0.0.1:8899
WebSocket PubSub URL: ws://127.0.0.1:8900
  RPC connection failure: error sending request for url (http://127.0.0.1:8899/): connection closed before message completed               Identity: A7gWj6cYqF65sZmL48FafAsdCpniFszNfgxypuFEdEZy
Genesis Hash: 48jRFi3n8DJCyUGabdcnaoTh4a3siRpbex7sxbXBdx3i
  RPC connection failure: error sending request for url (http://127.0.0.1:8899/): connection closed before message completed               Identity: A7gWj6cYqF65sZmL48FafAsdCpniFszNfgxypuFEdEZy
Genesis Hash: 48jRFi3n8DJCyUGabdcnaoTh4a3siRpbex7sxbXBdx3i
  RPC connection failure: error sending request for url (http://127.0.0.1:8899/): connection closed before message completed               Identity: A7gWj6cYqF65sZmL48FafAsdCpniFszNfgxypuFEdEZy
Genesis Hash: 48jRFi3n8DJCyUGabdcnaoTh4a3siRpbex7sxbXBdx3i
Version: 1.16.1
Shred Version: 25234
Gossip Address: 127.0.0.1:1024
TPU Address: 127.0.0.1:1027
JSON RPC URL: http://127.0.0.1:8899
WebSocket PubSub URL: ws://127.0.0.1:8900
```

不能稳定的启动。

当前的电脑环境是mac的m1处理器
```bash
rustup show
Default host: aarch64-apple-darwin
rustup home:  /Users/davirain/.rustup

installed toolchains
--------------------

stable-aarch64-apple-darwin
nightly-2022-12-07-aarch64-apple-darwin
nightly-2022-12-15-aarch64-apple-darwin
nightly-2023-01-01-aarch64-apple-darwin
nightly-2023-01-10-aarch64-apple-darwin
nightly-2023-01-24-aarch64-apple-darwin
nightly-2023-02-25-aarch64-apple-darwin
nightly-2023-04-30-aarch64-apple-darwin
nightly-aarch64-apple-darwin (default)
1.61-aarch64-apple-darwin
bpf
sbf
solana
1.60.0-aarch64-apple-darwin
1.62.1-aarch64-apple-darwin
1.63.0-aarch64-apple-darwin
1.64.0-aarch64-apple-darwin
1.65.0-aarch64-apple-darwin
1.66.0-aarch64-apple-darwin
1.68.0-aarch64-apple-darwin
1.70.0-aarch64-apple-darwin

installed targets for active toolchain
--------------------------------------

aarch64-apple-darwin
aarch64-pc-windows-msvc
aarch64-unknown-linux-gnu
wasm32-unknown-unknown

active toolchain
----------------

nightly-aarch64-apple-darwin (default)
rustc 1.72.0-nightly (b2b34bd83 2023-06-06)
```
