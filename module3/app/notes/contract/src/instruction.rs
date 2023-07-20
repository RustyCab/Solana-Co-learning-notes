use borsh::BorshDeserialize;
use solana_program::msg;
use solana_program::program_error::ProgramError;

#[derive(Debug)]
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

#[derive(BorshDeserialize, Debug)]
pub struct NoteInstructionPayload {
    pub id: u64,
    pub title: String,
    pub body: String,
}

impl NoteInstruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Take the first byte as the variant to
        // determine which instruction to execute
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        msg!("variant: {}", variant);

        // Use the temporary payload struct to deserialize
        let payload =
            NoteInstructionPayload::try_from_slice(rest).map_err(|_| ProgramError::Custom(99))?;
        msg!("payload: {:?}", payload);

        // Match the variant to determine which data struct is expected by
        // the function and return the TestStruct or an error
        Ok(match variant {
            0 => Self::CreateNote {
                title: payload.title,
                body: payload.body,
                id: payload.id,
            },
            1 => Self::UpdateNote {
                title: payload.title,
                body: payload.body,
                id: payload.id,
            },
            2 => Self::DeleteNote { id: payload.id },
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
