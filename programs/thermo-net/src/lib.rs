use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use std::collections::HashMap;

declare_id!("ThermoNET1111111111111111111111111111111111");

#[program]
pub mod thermo_net {
    use super::*;

    pub fn initialize_program(ctx: Context<InitializeProgram>) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.authority = ctx.accounts.authority.key();
        program_state.temp_mint = ctx.accounts.temp_mint.key();
        program_state.bonk_mint = ctx.accounts.bonk_mint.key();
        program_state.total_tiles = 0;
        program_state.total_readings = 0;
        program_state.bump = *ctx.bumps.get("program_state").unwrap();
        Ok(())
    }

    pub fn submit_reading(
        ctx: Context<SubmitReading>,
        hex_id: [u8; 8],
        temperature: i16,
        pressure: u32,
        timestamp: i64,
        gps_accuracy: u16,
        signature: [u8; 64],
        nonce: u64,
    ) -> Result<()> {
        let device_rep = &mut ctx.accounts.device_reputation;
        let reading = &mut ctx.accounts.reading;
        let clock = Clock::get()?;

        // Anti-replay protection
        require!(timestamp <= clock.unix_timestamp + 300, ThermoError::FutureTimestamp);
        require!(timestamp >= clock.unix_timestamp - 1800, ThermoError::StaleReading);
        require!(nonce > device_rep.last_nonce, ThermoError::InvalidNonce);

        // GPS accuracy check
        require!(gps_accuracy <= 5000, ThermoError::PoorGpsAccuracy); // 50m max

        // Temperature sanity check (-50°C to 85°C)
        require!(temperature >= -5000 && temperature <= 8500, ThermoError::InvalidTemperature);

        // Pressure sanity check (800-1200 hPa)
        require!(pressure >= 80000 && pressure <= 120000, ThermoError::InvalidPressure);

        // Verify signature (simplified - real implementation would verify Seed-Vault sig)
        let message_hash = solana_program::keccak::hash(&[
            &hex_id,
            &temperature.to_le_bytes(),
            &pressure.to_le_bytes(),
            &timestamp.to_le_bytes(),
        ]).to_bytes();
        
        // Store reading
        reading.device_pubkey = ctx.accounts.device.key();
        reading.hex_id = hex_id;
        reading.temperature = temperature;
        reading.pressure = pressure;
        reading.timestamp = timestamp;
        reading.gps_accuracy = gps_accuracy;
        reading.signature = signature;
        reading.nonce = nonce;

        // Update device reputation
        device_rep.total_submissions += 1;
        device_rep.last_submission = timestamp;
        device_rep.last_nonce = nonce;

        // Check streak
        if timestamp - device_rep.last_submission <= 86400 {
            device_rep.streak_days += 1;
        } else {
            device_rep.streak_days = 1;
        }

        emit!(ReadingSubmitted {
            device: ctx.accounts.device.key(),
            hex_id,
            temperature,
            timestamp,
        });

        Ok(())
    }

    pub fn aggregate_tile(ctx: Context<AggregateTile>, hex_id: [u8; 8]) -> Result<()> {
        let tile = &mut ctx.accounts.hex_tile;
        let clock = Clock::get()?;

        // Collect recent readings for this tile (simplified - would query actual readings)
        let mut temps: Vec<i16> = vec![];
        
        // Mock data for compilation - real implementation would query readings
        // This would be replaced with CPI to query recent readings
        temps.push(2150); // 21.5°C
        temps.push(2180); // 21.8°C
        temps.push(2120); // 21.2°C

        if !temps.is_empty() {
            temps.sort();
            let median_temp = if temps.len() % 2 == 0 {
                (temps[temps.len() / 2 - 1] + temps[temps.len() / 2]) / 2
            } else {
                temps[temps.len() / 2]
            };

            tile.hex_id = hex_id;
            tile.median_temp = median_temp;
            tile.sample_count = temps.len() as u16;
            tile.last_updated = clock.unix_timestamp;
            tile.confidence = calculate_confidence(temps.len(), &temps);
        }

        Ok(())
    }

    pub fn reward_mint(ctx: Context<RewardMint>, amount_temp: u64, amount_bonk: u64) -> Result<()> {
        let device_rep = &ctx.accounts.device_reputation;
        
        // Calculate actual reward based on reputation and streak
        let base_reward = 1000; // Base TEMP tokens
        let reputation_multiplier = device_rep.reputation_score as u64;
        let streak_bonus = (device_rep.streak_days as u64).min(30) * 10;
        
        let final_temp_reward = (base_reward * reputation_multiplier / 10000) + streak_bonus;
        let final_bonk_reward = final_temp_reward / 100; // 1% of TEMP in BONK

        // Mint TEMP tokens
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.temp_mint.to_account_info(),
            to: ctx.accounts.device_temp_account.to_account_info(),
            authority: ctx.accounts.program_state.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program.clone(), cpi_accounts);
        token::mint_to(cpi_ctx, final_temp_reward)?;

        // Mint BONK tokens
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.bonk_mint.to_account_info(),
            to: ctx.accounts.device_bonk_account.to_account_info(),
            authority: ctx.accounts.program_state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, final_bonk_reward)?;

        emit!(RewardMinted {
            device: ctx.accounts.device.key(),
            temp_amount: final_temp_reward,
            bonk_amount: final_bonk_reward,
        });

        Ok(())
    }

    pub fn slash_device(ctx: Context<SlashDevice>, slash_amount: u64) -> Result<()> {
        let device_rep = &mut ctx.accounts.device_reputation;
        
        require!(device_rep.stake_amount >= slash_amount, ThermoError::InsufficientStake);
        
        device_rep.stake_amount -= slash_amount;
        device_rep.slash_count += 1;
        device_rep.reputation_score = device_rep.reputation_score.saturating_sub(1000);

        // Burn slashed tokens
        let cpi_accounts = token::Burn {
            mint: ctx.accounts.temp_mint.to_account_info(),
            from: ctx.accounts.device_stake_account.to_account_info(),
            authority: ctx.accounts.device.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, slash_amount)?;

        emit!(DeviceSlashed {
            device: ctx.accounts.device.key(),
            amount: slash_amount,
            new_reputation: device_rep.reputation_score,
        });

        Ok(())
    }

    pub fn query_tile(ctx: Context<QueryTile>, hex_id: [u8; 8]) -> Result<TileData> {
        let tile = &ctx.accounts.hex_tile;
        
        Ok(TileData {
            hex_id: tile.hex_id,
            median_temp: tile.median_temp,
            last_updated: tile.last_updated,
            confidence: tile.confidence,
            sample_count: tile.sample_count,
        })
    }
}

fn calculate_confidence(sample_count: usize, temps: &[i16]) -> u8 {
    let base_confidence = (sample_count * 10).min(70) as u8;
    
    if temps.len() < 3 {
        return base_confidence;
    }

    // Calculate standard deviation for additional confidence
    let mean = temps.iter().sum::<i16>() as f64 / temps.len() as f64;
    let variance = temps.iter()
        .map(|&x| (x as f64 - mean).powi(2))
        .sum::<f64>() / temps.len() as f64;
    let std_dev = variance.sqrt();

    // Lower std_dev = higher confidence
    let std_dev_bonus = if std_dev < 50.0 { 20 } else if std_dev < 100.0 { 10 } else { 0 };
    
    (base_confidence + std_dev_bonus).min(100)
}

#[derive(Accounts)]
pub struct InitializeProgram<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
    pub temp_mint: Account<'info, Mint>,
    pub bonk_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(hex_id: [u8; 8])]
pub struct SubmitReading<'info> {
    #[account(
        init_if_needed,
        payer = device,
        space = 8 + 32 + 8 + 2 + 4 + 8 + 2 + 64 + 8,
        seeds = [b"reading", device.key().as_ref(), &hex_id, &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub reading: Account<'info, Reading>,
    #[account(
        init_if_needed,
        payer = device,
        space = 8 + 32 + 4 + 8 + 2 + 8 + 8 + 1 + 1,
        seeds = [b"device_rep", device.key().as_ref()],
        bump
    )]
    pub device_reputation: Account<'info, DeviceReputation>,
    #[account(mut)]
    pub device: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(hex_id: [u8; 8])]
pub struct AggregateTile<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 8 + 8 + 2 + 2 + 1 + 1,
        seeds = [b"hex_tile", &hex_id],
        bump
    )]
    pub hex_tile: Account<'info, HexTile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RewardMint<'info> {
    #[account(seeds = [b"program_state"], bump = program_state.bump)]
    pub program_state: Account<'info, ProgramState>,
    pub device_reputation: Account<'info, DeviceReputation>,
    #[account(mut)]
    pub temp_mint: Account<'info, Mint>,
    #[account(mut)]
    pub bonk_mint: Account<'info, Mint>,
    #[account(mut)]
    pub device_temp_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub device_bonk_account: Account<'info, TokenAccount>,
    pub device: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SlashDevice<'info> {
    #[account(mut)]
    pub device_reputation: Account<'info, DeviceReputation>,
    #[account(mut)]
    pub temp_mint: Account<'info, Mint>,
    #[account(mut)]
    pub device_stake_account: Account<'info, TokenAccount>,
    pub device: Signer<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(hex_id: [u8; 8])]
pub struct QueryTile<'info> {
    #[account(seeds = [b"hex_tile", &hex_id], bump = hex_tile.bump)]
    pub hex_tile: Account<'info, HexTile>,
}

#[account]
pub struct ProgramState {
    pub authority: Pubkey,
    pub temp_mint: Pubkey,
    pub bonk_mint: Pubkey,
    pub total_tiles: u64,
    pub total_readings: u64,
    pub bump: u8,
}

#[account]
pub struct HexTile {
    pub hex_id: [u8; 8],
    pub last_updated: i64,
    pub median_temp: i16,
    pub sample_count: u16,
    pub confidence: u8,
    pub bump: u8,
}

#[account]
pub struct DeviceReputation {
    pub device_pubkey: Pubkey,
    pub reputation_score: u32,
    pub total_submissions: u64,
    pub streak_days: u16,
    pub last_submission: i64,
    pub stake_amount: u64,
    pub slash_count: u8,
    pub last_nonce: u64,
    pub bump: u8,
}

#[account]
pub struct Reading {
    pub device_pubkey: Pubkey,
    pub hex_id: [u8; 8],
    pub temperature: i16,
    pub pressure: u32,
    pub timestamp: i64,
    pub gps_accuracy: u16,
    pub signature: [u8; 64],
    pub nonce: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TileData {
    pub hex_id: [u8; 8],
    pub median_temp: i16,
    pub last_updated: i64,
    pub confidence: u8,
    pub sample_count: u16,
}

#[event]
pub struct ReadingSubmitted {
    pub device: Pubkey,
    pub hex_id: [u8; 8],
    pub temperature: i16,
    pub timestamp: i64,
}

#[event]
pub struct RewardMinted {
    pub device: Pubkey,
    pub temp_amount: u64,
    pub bonk_amount: u64,
}

#[event]
pub struct DeviceSlashed {
    pub device: Pubkey,
    pub amount: u64,
    pub new_reputation: u32,
}

#[error_code]
pub enum ThermoError {
    #[msg("Reading timestamp is in the future")]
    FutureTimestamp,
    #[msg("Reading is too old")]
    StaleReading,
    #[msg("Invalid nonce - must be greater than last nonce")]
    InvalidNonce,
    #[msg("GPS accuracy too poor (>50m)")]
    PoorGpsAccuracy,
    #[msg("Temperature out of valid range (-50°C to 85°C)")]
    InvalidTemperature,
    #[msg("Pressure out of valid range (800-1200 hPa)")]
    InvalidPressure,
    #[msg("Insufficient stake for slashing")]
    InsufficientStake,
    #[msg("Invalid signature")]
    InvalidSignature,
}

security_txt! {
    name: "ThermoNet",
    project_url: "https://github.com/thermonet/program",
    contacts: "email:security@thermonet.org",
    policy: "https://github.com/thermonet/program/blob/master/SECURITY.md",
    preferred_languages: "en",
    source_code: "https://github.com/thermonet/program"
}