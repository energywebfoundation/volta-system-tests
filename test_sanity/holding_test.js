// checks that system contracts are configured as expected
const Web3 = require('web3');
const fs = require('fs');
const assert = require('assert');
const utils = require('./utils')
const csv = require('csv-parser')

// parity --chain "Volta.json" --jsonrpc-port 8540 --ws-port 8450 --jsonrpc-apis "all"
var web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
var values = {};
const results = [];

const {ChainspecValues, MultiSigWalletJSON, HoldingJSON} = require(__dirname + "/utils.js");

// tests
describe('Holding', function() {

  let holding;
  let HoldingABI;

  async function initEverything(done) {
    // ensures that web3 is connected
    let listening = await web3.eth.net.isListening();
    web3.transactionConfirmationBlocks = 1;
    web3.eth.transactionConfirmationBlocks = 1;

    // retrieves the hardcoded values
    values = ChainspecValues;
    accounts = values.address_book["INITAL_VALIDATORS"];

    // gets the ABI of all contracts    
    HoldingABI = HoldingJSON;
    MultiSigABI = MultiSigWalletJSON;
    utils.addTestWallets(web3);
  }

  before(async function () {
    this.timeout(60000);
    await initEverything();
    // links the contracts
    netOpsMultiSig = new web3.eth.Contract(MultiSigABI.abi, values.address_book["VALIDATOR_NETOPS"]);
    holding = new web3.eth.Contract(HoldingABI.abi, values.address_book["VESTING"]);
  });

  describe('Holding', function() {
    this.timeout(120000);

    it("should have set all vestings correctly", async () => {

      var result = await new Promise((resolve, reject) => {
        fs.createReadStream('./test_sanity/data.csv')
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            resolve(results)
          });
      });

      for (i = 0; i < result.length; i++) {
        holders = await holding.methods.holders(result[i].address).call()
        assert.equal(result[i].amount,holders.availableAmount.toString())
      }

    })
  });
});
