use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey,
};

pub mod instruction;

use instruction::*;

// program id: EHiYp5VkjpU6Pf36C8BgSxQLkTqVuUPKtkPpyzEqbiga
entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello World Rust program entrypoint");
    // Call unpack to deserialize instruction_data
    let instruction = NoteInstruction::unpack(instruction_data)?;
    msg!("instruction: {:?}", instruction);

    // Match the returned data struct to what you expect
    match instruction {
        NoteInstruction::CreateNote { title, body, id } => {
            // Execute program code to create a note
            msg!(
                "Execute program code to create a note -> title: {}, body: {}, id: {}",
                title,
                body,
                id
            );
        }
        NoteInstruction::UpdateNote { title, body, id } => {
            // Execute program code to update a note
            msg!(
                "Execute program code to update a note -> title: {}, body: {}, id: {}",
                title,
                body,
                id
            );
        }
        NoteInstruction::DeleteNote { id } => {
            // Execute program code to delete a note
            msg!("Execute program code to delete a note -> id: {}", id);
        }
    }

    Ok(())
}
