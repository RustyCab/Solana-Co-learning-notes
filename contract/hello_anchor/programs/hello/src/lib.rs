use anchor_lang::prelude::*;

declare_id!("DCvPZdMZ5HVAFp4AcJ6a13oCxdqGHJMvSCGAbzCaVqu7");

#[program]
pub mod hello {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello world!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
