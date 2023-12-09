pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/poseidon.circom";

template LowestBid(count) {
    signal input hashedBids[count];
    signal input bids[count][2];

    signal output lowestBid[2];
    signal output bidsWithValidityStatus[count];

    component hashes[count];
    var lowestValue = bids[0][0];
    var lowestHashedBid = hashedBids[0];

    for (var i = 0; i < count; i++) {
      hashes[i] = Poseidon(2);
      hashes[i].inputs[0] <== bids[i][0];
      hashes[i].inputs[1] <== bids[i][1];

      if (hashes[i].out == hashedBids[i]) {
        if (bids[i][0] < lowestValue) {
          lowestValue = bids[i][0];
          lowestHashedBid = hashedBids[i];
        }
      }

      bidsWithValidityStatus[i] <-- hashes[i].out == hashedBids[i];
    }

  lowestBid[0] <-- lowestValue;
  lowestBid[1] <-- lowestHashedBid;
}

component main { public [ hashedBids ] } = LowestBid(4);