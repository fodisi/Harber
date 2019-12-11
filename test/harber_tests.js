const { BN, shouldFail, ether, expectEvent, balance, time } = require('openzeppelin-test-helpers');

const Token = artifacts.require('./ERC721Full.sol');
const Harber = artifacts.require('./Harber.sol');

const delay = duration => new Promise(resolve => setTimeout(resolve, duration));
const augurCashAddress = '0xa836c1D6a35A443FD6F8d5d4A9cf5b1664bF76D6';

// (0) 0xCb4BF048F1Aaf4E0C05b0c77546fE820F299d4Fe (100 ETH)
// (1) 0xA2b8502b1bC80A345400054Ffc00F49C2A9362d8 (100 ETH)
// (2) 0x40332B4437382BeAE2402D28C4cc9Aaa8D9Be9C0 (100 ETH)
// (3) 0xfFcE23bd68644Df7683921a6466f8d988bEf80C6 (100 ETH)
// (4) 0xC396032F60d6C5365CCa89A69dd93cf1401BBA32 (100 ETH)
// (5) 0xec0C53d38BdF76489c4aC86c8a8F742e2EEc221a (100 ETH)
// (6) 0xD149E086dbfF274449810D4Ffe0B23ffCF294c2C (100 ETH)
// (7) 0x37A0D2DfeD52aB3f0a7f3420c665D82eB67FE321 (100 ETH)
// (8) 0x06b58dDf8CF8E115D01137A296fb57e522Cc441f (100 ETH)
// (9) 0x84CAbF995E9Af67B6d73232C2D5E9fBeBEF92224 (100 ETH)

contract('HarberTests', (accounts) => {

  let token;
  let harber;
  user0 = accounts[0];
  user1 = accounts[1];
  user2 = accounts[2];
  user3 = accounts[3];
  user4 = accounts[4];
  user5 = accounts[5];
  user6 = accounts[6];
  user7 = accounts[7];
  user8 = accounts[8];
  var newOwnerPurchaseCount1 = 0;
  
  beforeEach(async () => {
    token = await Token.deployed();
    harber = await Harber.deployed();
  });

  it('TEST', async () => {
    await harber.getTestDai({ from: user0 });
    await harber.buy(365,1,10,{ from: user0  }); 
    await time.increase(time.duration.weeks(1));
    // Run truffle test --debug so that  the below is debugged. Press c , enter to get to the end of the tx, then press v. You will see that deposits[1][user0] = 3
    await debug(harber._collectAugurFunds.call(1));
    //but here, when I am getting this deposit value directluy, I get a value of 10. WTF!? 10 is the original value that depoisted via line 42, but this should have been reduced to 3.
    //I also notice that the event at the end of _collectAugurFunds has NOT been emitted- the only two events emitted are Transfer and Log Buy, which are emitted my the buy function on line 42. Line 45 does not trigger the LogCollection function. 
    var deposit = await harber.deposits.call(1,user0); 
    assert.equal(deposit, 3);

  });
});