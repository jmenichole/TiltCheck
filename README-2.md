
# Stake Pump Audit Kit

## Summary

This is a public audit of the game "Pump" on Stake.us based on their own provably fair system. The investigation uses server seeds, client seeds, and nonces directly from Stake’s own fairness tools, and compares the resulting values to what is expected based on the published RNG formula.

## Key Findings

- The results of the game "Pump" do not match the expected output generated from the advertised provably fair formula:  
  `HMAC_SHA256(serverSeed, clientSeed:nonce) → extract float → max(1, 1 / (1 - r))`

- The `_popPoint` values observed in actual gameplay do not align with the results derived from the seed pair + nonce.

- This discrepancy was consistent across multiple sessions and server seeds.

## Purpose

This audit was conducted to verify whether the game "Pump" is actually provably fair as claimed. If a user cannot independently validate the result using seed pairs and nonce alone, it fails the definition of provably fair.

## Included

- Full explanation of audit method
- PDF summary of results
- Sample rounds (seed pairs, nonces, expected vs actual values)

## Conclusion

If the Stake team uses a different RNG algorithm for Pump than advertised, transparency requires they disclose that. Otherwise, this indicates a break in the provably fair system.
