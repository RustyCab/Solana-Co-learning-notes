## Problem 1: SyntaxError: Unexpected token ':'

```bash
npm start

> read-data-from-the-solana-network@1.0.0 start
> node main.js

file:///Users/davirain/learn-solana/module1/read-data-from-the-solana-network/main.js:5
async function getBalanceUsingWeb3(address: PublicKey): Promise<number> {
                                          ^

SyntaxError: Unexpected token ':'
    at ESMLoader.moduleStrategy (node:internal/modules/esm/translators:117:18)
    at ESMLoader.moduleProvider (node:internal/modules/esm/loader:361:14)
    at async link (node:internal/modules/esm/module_job:70:21)

Node.js v18.3.0
```

你正在遇到的问题是因为Node.js无法识别TypeScript的类型注解。你的函数`getBalanceUsingWeb3`使用了TypeScript的类型注解`address: PublicKey`，但是Node.js并不能直接理解这个类型注解，因此抛出了`SyntaxError: Unexpected token ':'`这个错误。

如果你想在Node.js中运行TypeScript代码，你需要先将TypeScript代码转换为JavaScript代码。这通常通过使用TypeScript的编译器tsc来完成。如果你还没有安装TypeScript，你可以通过npm来安装：

```bash
npm install -g typescript
```

安装TypeScript之后，你可以使用`tsc`命令来编译你的TypeScript代码：

```bash
tsc main.ts
```

这将会生成一个同名的JavaScript文件（例如，`main.js`），你可以在Node.js中直接运行这个文件。

如果你的项目包含多个TypeScript文件，你可能需要一个`tsconfig.json`配置文件来指定编译选项。你可以通过运行`tsc --init`命令来生成一个默认的`tsconfig.json`文件，然后根据你的需要进行修改。

希望这可以帮助你解决问题，如果你还有其他问题，请随时向我提问。

## Problem 2: import { Connection, PublicKey } from '@solana/web3.js';

```bash
npm start

> read-data-from-the-solana-network@1.0.0 start
> node main.js

/Users/davirain/learn-solana/module1/read-data-from-the-solana-network/main.js:2
import { Connection, PublicKey } from '@solana/web3.js';
^^^^^^

SyntaxError: Cannot use import statement outside a module
    at Object.compileFunction (node:vm:352:18)
    at wrapSafe (node:internal/modules/cjs/loader:1033:15)
    at Module._compile (node:internal/modules/cjs/loader:1069:27)
    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Module._load (node:internal/modules/cjs/loader:827:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
    at node:internal/main/run_main_module:17:47

Node.js v18.3.0
```

从错误信息来看，你遇到的问题是：`SyntaxError: Cannot use import statement outside a module`。这个问题的根源是Node.js默认情况下不支持ES6的`import`语法，除非你明确地在代码中使用ES6模块。

下面是一些可能的解决方案：

1. **修改你的代码为CommonJS风格**：你可以将`import`语句改写为`require`语法，例如：

   将 `import { Connection, PublicKey } from '@solana/web3.js';` 改为 `const { Connection, PublicKey } = require('@solana/web3.js');`

2. **使用ES6模块**：你可以将你的JavaScript文件的扩展名从`.js`改为`.mjs`，然后Node.js就会将其视为ES6模块。或者，在你的`package.json`文件中添加`"type": "module"`，这样Node.js会将所有`.js`文件视为ES6模块。

3. **使用Babel或者TypeScript等工具**：这些工具可以帮助你将ES6的代码转化为Node.js能够理解的CommonJS模块。

请注意，以上解决方案可能需要根据你的具体代码和项目环境做出调整。如果你需要进一步的帮助，请随时向我提问。
