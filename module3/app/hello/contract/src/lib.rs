use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey,
};

// program id: Gxp23fCw9qDC6ZuY1fo4YnsJzru8yXnzNMikAdh5rzKq
entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello, world!");
    msg!("Hello, Rust!");
    msg!("Hello, Solna!");
    msg!("Hello, Solana Co-Learn!");

    Ok(())
}
