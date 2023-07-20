# Hello World Program

This template is a starting point for writing scripts to interact with the Solana blockchain. Simply add your code to `index.ts` and run `npm start`.

You can create a local repository with this starter code using the `npx create-solana-client [PROJECT_NAME] --initialize-keypair` command in the terminal.


## Compiler hello world program

```bash
cargo build-sbf
```

## deploy hello_world.so to localhost

```bash
solana program deploy target/sbf-solana-solana/release/hello_world.so
```

output program id: program id

set this program to frontend/.env `PROGRAM_ID`

## call hello world program

```bash
npm run start
```
