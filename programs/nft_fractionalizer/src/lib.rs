use anchor_lang::prelude::*;

declare_id!("9reR31hCymxLfxjkTVskpgkhDurL2bhtF7BKcPjnX1rX");

#[program]
pub mod nft_fractionalizer {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
