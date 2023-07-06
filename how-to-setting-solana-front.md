## 如何配置一个Solana的前端模版

让我们从一些基本的脚手架开始。欢迎您以最合适的方式设置您的项目，但我们将使用一个简单的 Typescript 项目，并依赖于 `@solana/web3.js` 包。如果你想使用我们的脚手架，可以在命令行中使用以下命令：

```bash
mkdir -p solana-ping-client/src && \
	cd solana-ping-client && \
	touch src/index.ts && \
	git init && touch .gitignore && \
	npm init -y && \
	npm install --save-dev typescript && \
npm install --save-dev ts-node && \
	npx tsc --init && \
	npm install @solana/web3.js && \
	npm install dotenv && \
	touch .env
```

这会：
- 1.为项目创建一个新目录，并包含子目录 `src`
- 2.将命令行提示符移动到项目目录中
- 3.在 `src` 内创建一个 `index.ts` 文件
- 4.使用 `.gitignore` 文件初始化 `git` 存储库
- 5.创建一个新的 `npm` 包
- 6.添加开发人员对 `typescript` 的依赖
- 7.添加对 `ts-node` 的开发人员依赖
- 8.创建 `.tsconfig` 文件
- 9.安装 `@solana/web3.js` 依赖项
- 10.安装 `.dotenv` 依赖项
- 11.创建一个 `.env` 文件

如果您想完全匹配我们的代码，请将 `tsconfig.json` 的内容替换为以下内容：

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist"
  },
  "include": [ "./src/**/*" ]
}
```

将以下内容添加到 `.gitignore`：

```
node_modules/
dist/
.env
```

最后，将以下内容添加到 `package.json` 中的脚本对象中：

```
"start": "ts-node src/index.ts"
```

或者直接运行下面的这个命令：

```bash
npx create-solana-client solana-intro-client
```
