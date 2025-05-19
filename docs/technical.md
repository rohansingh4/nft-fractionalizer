# Decentralized NFT Fractionalization & Auction Marketplace

## 1. Introduction

**Purpose:**
This document describes the architecture and developer-facing technical details for a Solana-based platform that enables:

1. Minting NFTs via the Metaplex Token Metadata program
2. Fractionalizing NFTs into SPL-token "shares"
3. Conducting time-limited on-chain auctions of those fractional shares

**Scope:**

* On-chain program (Anchor-based Rust)
* Frontend integration (React + TypeScript)
* CI/CD and testing strategy

**Audience:**
Solana developers, architects, and auditors interested in DeFi/NFT composability patterns.

---

## 2. System Architecture

```text
+-------------+        +----------------------+        +--------------+
|  Frontend   | <----> |  RPC Endpoint (Devnet)| <----> | On-Chain     |
| (React +    |        |  (Solana Cluster)    |        | Program      |
|  Anchor CLI)|        +----------------------+        +--------------+
      |                                                        |
      v                                                        v
+------------------------------------+                +----------------------+
| IPFS/Arweave (store metadata JSON) |                | Metaplex Metadata    |
+------------------------------------+                | Program CPI         |
                                                        +----------------------+
```

### Components

* **Frontend**: React app using `@solana/wallet-adapter` and Anchor-generated client
* **On-Chain Program**: Anchor-based Rust program deployed on Devnet
* **External Programs**:

  * **Metaplex Token Metadata** (CPI for NFT minting)
  * **SPL Token Program** (mint/burn fractional tokens)
* **Storage**:

  * NFT metadata JSON on IPFS or Arweave
  * On-chain state in PDAs

---

## 3. On-Chain Program

### 3.1 Anchor Configuration

* **Program ID**: `YourProgramPubkeyHere`
* **IDL**: Auto-generated via `anchor build`

### 3.2 Program Derived Addresses (PDAs)

| PDA Name          | Seed Inputs                              | Account Purpose                              |
| ----------------- | ---------------------------------------- | -------------------------------------------- |
| `vault_nft`       | `[b"vault_nft", nft_mint_pubkey]`        | Holds the original NFT after fractionalize   |
| `vault_fractions` | `[b"vault_frac", nft_mint_pubkey]`       | Holds SPL shares mint authority              |
| `auction_state`   | `[b"auction", auction_id]`               | Stores auction parameters & status           |
| `bid_escrow`      | `[b"escrow", auction_id, bidder_pubkey]` | Temporarily holds bidder’s fractional tokens |

### 3.3 Data Structures

```rust
#[account]
pub struct AuctionState {
    pub auction_id: u64,
    pub nft_mint: Pubkey,
    pub fraction_mint: Pubkey,
    pub start_timestamp: i64,
    pub end_timestamp: i64,
    pub highest_bid: u64,
    pub highest_bidder: Pubkey,
    pub state: AuctionStatus, // enum: Initialized, Live, Ended
}
```

### 3.4 Instruction Set

| Instruction     | Accounts                                                                 | Arguments                                                | Description                                    |
| --------------- | ------------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------- |
| `mint_nft`      | Signer, NFT Mint, Metadata Account, Token Account, Authority, SystemProg | `metadata_uri: String`, `name: String`, `symbol: String` | CPI to Metaplex to mint a new NFT              |
| `fractionalize` | Signer, NFT Vault PDA, Fraction Mint PDA, Owner Token Account, Sysvar    | `total_shares: u64`                                      | Locks NFT in vault and mints fractional tokens |
| `start_auction` | Signer, Auction PDA, Fraction Mint PDA, Clock                            | `auction_id: u64`, `start_time: i64`, `end_time: i64`    | Initializes auction parameters                 |
| `place_bid`     | Signer, Auction PDA, Bid Escrow PDA, Bidder Token Account, Clock         | `auction_id: u64`, `bid_amount: u64`                     | Transfers shares into escrow and updates bid   |
| `end_auction`   | Signer, Auction PDA, Vault PDAs, Highest Bidder Account, Sysvar\:Clock   | `auction_id: u64`                                        | Settles auction: transfers funds & shares      |

### 3.5 Error Codes

```rust
#[error_code]
enum ErrorCode {
    #[msg("Auction not yet started")] AuctionNotStarted,
    #[msg("Auction already ended")] AuctionEnded,
    #[msg("Bid too low")] BidTooLow,
    #[msg("Not auction owner")] Unauthorized,
    // ...
}
```

### 3.6 Events

```rust
#[event]
pub struct BidPlaced {
    pub auction_id: u64,
    pub bidder: Pubkey,
    pub amount: u64,
}
```

---

## 4. Security Considerations

* **Ownership Checks**: Ensure only vault authority can fractionalize
* **Reentrancy Guards**: All state modifications must be atomic within an instruction
* **Timestamp Validation**: Use `Clock::get()` sysvar for enforcing auction windows
* **Rent Exemption**: Calculate and pre-fund accounts to avoid rent violations
* **CPI Safety**: Validate CPI return codes from Metaplex and SPL Token programs

---

## 5. Frontend Integration

### 5.1 Tech Stack

* React + TypeScript
* `@solana/wallet-adapter` for wallet connectivity (Phantom, Solflare)
* Anchor client (`@project-serum/anchor`)

### 5.2 UI Flow

1. **Mint NFT**: Upload metadata → call `mint_nft`
2. **Fractionalize**: Input total shares → call `fractionalize`
3. **Start Auction**: Set start/end → call `start_auction`
4. **Bid**: Approve token transfer → call `place_bid`
5. **Close Auction**: Call `end_auction` manually at end time

### 5.3 Real-Time Updates

* Subscribe to Anchor program events (`program.addEventListener`) for `BidPlaced`
* Poll `AuctionState` PDA for state changes as fallback

---

## 6. Deployment & Testing

### 6.1 Devnet Deployment

```bash
anchor deploy --provider.cluster Devnet
```

### 6.2 Automated Tests

* Write unit tests for each instruction in `tests/` using Anchor’s Mocha suite
* CI: GitHub Actions workflow runs `anchor test --skip-deploy` and `anchor deploy`

---

## 7. Glossary

* **PDA**: Program Derived Address, deterministically generated account
* **CPI**: Cross-Program Invocation
* **Sysvar\:Clock**: On-chain clock data for timestamp enforcement
* **Rent Exemption**: Minimum lamports to prevent account closure
