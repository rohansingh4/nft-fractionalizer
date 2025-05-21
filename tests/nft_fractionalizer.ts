import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { NftFractionalizer } from "../target/types/nft_fractionalizer";


describe("nft_fractionalizer", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NftFractionalizer as Program<NftFractionalizer>;

  it("Is initialized!", async () => {
    // Call the initialize function.
    // Since your Initialize struct is empty, no accounts need to be passed to .accounts({})
    const tx = await program.methods
      .initialize()
      .rpc();
    
    console.log("Initialize transaction signature", tx);
    
    // You can add assertions here if needed, for example,
    // to check if some state was set correctly by initialize.
    // For now, just seeing the transaction succeed and the program log is enough.
  });
}); 