# Solana NFT Fractionalization & Auction Marketplace

A full-stack Solana platform to mint NFTs, fractionalize them into SPL-token shares, and run time-limited on‑chain auctions for those shares.

---

## 🚀 Features

* **NFT Minting**: Create NFTs via Metaplex Token Metadata CPIs
* **Fractionalization**: Lock an NFT in a PDA vault and mint fungible “shard” tokens representing shares
* **On‑Chain Auction**: Set up and settle Dutch/English-style auctions entirely on Solana
* **Real‑Time UX**: React frontend subscribing to Anchor events for live bid updates
* **Secure by Design**: Ownership checks, CPI safety, rent‑exemption calculation, and sysvar-based time enforcement

---

## 🛠 Tech Stack

* **Blockchain**: Solana Devnet via Anchor (Rust)
* **Programs**: Metaplex Token Metadata, SPL Token
* **Frontend**: React + TypeScript + `@solana/wallet-adapter`
* **Testing**: Anchor’s Mocha suite, GitHub Actions CI

---

## 📦 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v16+)
* [Rust](https://www.rust-lang.org/) + Solana toolchain
* Anchor CLI (`cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked`)
* A Solana wallet (e.g., Phantom) configured for Devnet

### Installation

1. Clone the repo:

   ```bash
   git clone git@github.com:<your-org>/<repo-name>.git
   cd <repo-name>
   ```
2. Install frontend dependencies:

   ```bash
   cd app
   npm install
   ```
3. Build on‑chain program:

   ```bash
   anchor build
   ```

### Deployment

1. Deploy to Devnet:

   ```bash
   anchor deploy --provider.cluster Devnet
   ```
2. Copy the program ID into your `app/src/config.ts`.
3. Start the frontend:

   ```bash
   cd app
   npm run start
   ```

### Testing

Run Anchor tests locally:

```bash
anchor test --skip-deploy
```

Or via CI (GitHub Actions configured in `.github/workflows/ci.yml`).

---

## 🔧 Usage

1. **Mint NFT**

   * In the UI, upload your metadata JSON (name, symbol, URI)
   * Click **Mint NFT** to call `mint_nft` instruction
2. **Fractionalize**

   * Enter the total number of shares
   * Click **Fractionalize** to lock the NFT and mint shards
3. **Start Auction**

   * Define start/end timestamps
   * Click **Start Auction** to initialize auction PDA
4. **Place a Bid**

   * Approve token transfer of shards
   * Enter bid amount and **Place Bid**
   * Frontend listens to `BidPlaced` events for updates
5. **End Auction**

   * After end time, call **End Auction** to settle funds and shards

---

## 📐 Architecture

See [docs/technical.md](docs/technical.md) for detailed diagrams of PDAs, CPIs, and account flows.

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch
3. Submit a pull request against `main`

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
