use anchor_lang::prelude::*;

declare_id!("CqBpYgLKGfcyCz6vdsBTaGS5qvn3efogDQEu8piZxvHi");

#[program]
pub mod hello_world_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
