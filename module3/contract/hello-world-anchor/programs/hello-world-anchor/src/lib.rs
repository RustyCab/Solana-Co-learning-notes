use anchor_lang::prelude::*;

declare_id!("CqBpYgLKGfcyCz6vdsBTaGS5qvn3efogDQEu8piZxvHi");

#[program]
pub mod hello_world_anchor {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello, world from Anchor!");
        Ok(())
    }

    pub fn say_hello(ctx: Context<SayHello>) -> Result<()> {
        msg!("Hello, {}!", ctx.accounts.greeter.key);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct SayHello<'info> {
    #[account(mut)]
    pub greeter: Signer<'info>,
}
