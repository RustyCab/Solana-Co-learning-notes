use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey,
};

// program id: EHiYp5VkjpU6Pf36C8BgSxQLkTqVuUPKtkPpyzEqbiga
entrypoint!(process_instruction);

pub enum NoteInstruction {
    CreateNote {
        title: String,
        body: String,
        id: u64,
    },
    UpdateNote {
        title: String,
        body: String,
        id: u64,
    },
    DeleteNote {
        id: u64,
    },
}

#[derive(BorshDeserialize)]
pub struct NoteInstructionPayload {
    pub id: u64,
    pub title: String,
    pub body: String,
}

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello, world!");

    Ok(())
}
