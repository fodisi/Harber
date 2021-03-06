const { BN, shouldFail, ether, expectEvent, balance, time } = require('openzeppelin-test-helpers');

const Token = artifacts.require('./ERC721Full.sol');
const Harber = artifacts.require('./Harber.sol');
var CashMockup = artifacts.require("./CashMockup.sol");

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

// These test assume that 100 dai (in wei-dai or whatever) is sent with the getTestDai function and numberoftokens = 20, and that usingAugur = false
// These tests do NOT reset the blockchain after each test. In retrospect this was a mistake, as it wasted a huge amount of time. harber_test2 fixes this. 

contract('HarberTests1', (accounts) => {

  let token;
  let harber;
  // let cash;
  user0 = accounts[0];
  user1 = accounts[1];
  user2 = accounts[2];
  user3 = accounts[3];
  user4 = accounts[4];
  user5 = accounts[5];
  user6 = accounts[6];
  user7 = accounts[7];
  userx = accounts[9];
  var newOwnerPurchaseCount1 = 0;
  
  beforeEach(async () => {
    token = await Token.deployed();
    harber = await Harber.deployed();
    cash = await CashMockup.deployed();
  });

  // check that the contract initially owns the token
  it('getOwner', async () => {
    var i;
    for (i = 0; i < 20; i++) {
      var owner = await token.ownerOf.call(i);
      assert.equal(owner, harber.address);
    }
  });

  // check that the contract initially owns the token
  it('getName', async () => {
    var name = await token.name.call();
    assert.equal(name, 'Harber.io');
  });

  // check fundamentals first
  it('user 1 rent Token first time and check: various', async () => {
    user = user0;
    await cash.faucet(100,{ from: user });
    await cash.approve(harber.address, 100,{ from: user });
    await harber.newRental(100,4,10,{ from: user });
    newOwnerPurchaseCount1++;
    var price = await harber.price.call(4);
    assert.equal(price, 100);
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 10);
    var owner = await token.ownerOf.call(4);
    assert.equal(owner, user);
    var trackedPrice = await harber.getOwnerTrackerPrice.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedPrice, 100);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedAddress, user);
  });

  // do the same thing- does it still work? 
  it('user 1 rent Token second time and check: various', async () => {
    user = user0;
    await harber.newRental(200,4,10,{ from: user });
    var price = await harber.price.call(4);
    assert.equal(price, 200);
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 20); //<------------
    var owner = await token.ownerOf.call(4);
    assert.equal(owner, user);
    var trackedPrice = await harber.getOwnerTrackerPrice.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedPrice, 200);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedAddress, user);
  });

  // make sure it throws a revert when it is supposed to
  it('user 2 rent Token fail states', async () => {
    user = user1;
    await shouldFail.reverting.withMessage(harber.newRental(200,4,0,{ from: user}), "Price must be higher than current price");
    await shouldFail.reverting.withMessage(harber.newRental(300,4,0,{ from: user}), "Must deposit something");
  });

  // same as before, but with a different token, does it still work?
  it('user 2 rent Token first time and check: various', async () => { 
    user = user1;
    await cash.faucet(100,{ from: user });
    await cash.approve(harber.address, 100,{ from: user });
    await harber.newRental(300,4,10,{ from: user  });
    newOwnerPurchaseCount1++;
    //  check user0 deposit is still there
    var deposit = await harber.deposits.call(4,user0);
    assert.equal(deposit, 20);
    //
    var price = await harber.price.call(4);
    assert.equal(price, 300);
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 10);
    var owner = await token.ownerOf.call(4);
    assert.equal(owner, user );
    var trackedPrice = await harber.getOwnerTrackerPrice.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedPrice, 300);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedAddress, user);
  });

  // repeat
  it('user 2 rent Token second time and check: various', async () => {
    user = user1;
    await harber.newRental(400,4,10,{ from: user });
    var price = await harber.price.call(4);
    assert.equal(price, 400);
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 20);
    var owner = await token.ownerOf.call(4);
    assert.equal(owner, user);
    var trackedPrice = await harber.getOwnerTrackerPrice.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedPrice, 400);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedAddress, user);
  });

  //continuing the trend of lots of token rental between different users and different tokens
  it('switch back to user 1 rent Token third time and check: various', async () => {
    user = user0;
    await harber.newRental(1000,4,20,{ from: user });
    newOwnerPurchaseCount1++;
    var price = await harber.price.call(4);
    assert.equal(price, 1000);
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 40);
    var owner = await token.ownerOf.call(4);
    assert.equal(owner, user);
    var trackedPrice = await harber.getOwnerTrackerPrice.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedPrice, 1000);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedAddress, user);
  });

  // check changePrice is working properly- should fail
  it('changePrice function fail testing', async () => {
    user = user1;
    await shouldFail.reverting.withMessage(harber.changePrice(2000,4,{ from: user}), "Not owner");
    user = user0;
    await shouldFail.reverting.withMessage(harber.changePrice(1000,4,{ from: user}), "New price must be higher than current price");
  });

  // check changePrice is working properly- should work
  it('user 1 using changePrice function', async () => {
    user = user0;
    await harber.changePrice(2000,4,{ from: user });
    var price = await harber.price.call(4);
    assert.equal(price, 2000);
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 40);
    var owner = await token.ownerOf.call(4);
    assert.equal(owner, user);
    var trackedPrice = await harber.getOwnerTrackerPrice.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedPrice, 2000);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(4,newOwnerPurchaseCount1);
    assert.equal(trackedAddress, user);
  });

  // is rentOwed function correct? Perhaps the most important function!!
  it('calculateRentOwed function', async () => {
    user = user2;
    await cash.faucet(100,{ from: user });
    await cash.approve(harber.address, 100,{ from: user });
    await harber.newRental(3650,4,30,{ from: user  });
    newOwnerPurchaseCount1++;
    var fundsOwedActual = await harber.rentOwed.call(4);
    assert.equal(fundsOwedActual, 0);
    await time.increase(time.duration.minutes(1440)); //mins in a day
    var fundsOwedActual = await harber.rentOwed.call(4);
    assert.equal(fundsOwedActual, 10);
  });

  // check these front end functions. 
  it('userDepositAbleToWithdraw and  liveDepositAbleToWithdraw function', async () => {
    user = user2;
    //due to 1 day passing from above, the userDepositAbleToWithdraw and depositAbleToWithdraw should be lower by 10 but the deposit amount should not
    var userDepositAbleToWithdraw = await harber.userDepositAbleToWithdraw.call(4, { from: user });
    var depositAbleToWithdraw = await harber.liveDepositAbleToWithdraw.call(4, { from: user })
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 30);
    assert.equal(userDepositAbleToWithdraw,20);
    assert.equal(depositAbleToWithdraw,20);
    //increment time another half day and check that deposit is the same but the other two are not
    await time.increase(time.duration.minutes(720)); //mins in half a day
    var userDepositAbleToWithdraw = await harber.userDepositAbleToWithdraw.call(4, { from: user });
    var depositAbleToWithdraw = await harber.liveDepositAbleToWithdraw.call(4, { from: user })
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 30);
    assert.equal(userDepositAbleToWithdraw,15);
    assert.equal(depositAbleToWithdraw,15);
    //switch user, rent, increment time. user2 deposit and userDepositAbleToWithdraw should not change but depositAbleToWithdraw should 
    await cash.faucet(100,{ from: user3 });
    await cash.approve(harber.address, 100,{ from: user3 });
    await harber.newRental(7300,4,100,{ from: user3  });
    newOwnerPurchaseCount1++;
    var price = await harber.price.call(4);
    assert.equal(price, 7300);
    var owner = await token.ownerOf.call(4);
    assert.equal(owner, user3);
    await time.increase(time.duration.minutes(1440)); 
    // 
    var userDepositAbleToWithdraw = await harber.userDepositAbleToWithdraw.call(4, { from: user });
    var deposit = await harber.deposits.call(4,user);
    var depositAbleToWithdraw = await harber.liveDepositAbleToWithdraw.call(4, { from: user })
    assert.equal(deposit, 15);
    assert.equal(userDepositAbleToWithdraw,15);
    assert.equal(depositAbleToWithdraw,80);
    //wait another half a day and check that nothing has changed for user 3 since he isnt the owner
    await time.increase(time.duration.minutes(720));
    var userDepositAbleToWithdraw = await harber.userDepositAbleToWithdraw.call(4, { from: user });
    var deposit = await harber.deposits.call(4,user);
    assert.equal(deposit, 15);
    assert.equal(userDepositAbleToWithdraw,15);
  });

  // check this front end function
  it('rentalExpiryTime function', async () => {
    user = user4;
    await cash.faucet(100,{ from: user });
    await cash.approve(harber.address, 100,{ from: user });
    await harber.newRental(31536000,4,100,{ from: user  }); //price = number of seconds in a year so that deposit = number of seconds we expect it to last for. 
    await harber._collectRent(4);
    newOwnerPurchaseCount1++;
    var depositAbleToWithdraw = await harber.liveDepositAbleToWithdraw.call(4);
    var difference = (100-depositAbleToWithdraw)
    assert.isBelow(difference,2);
    currentTime = await time.latest();
    var expectedRentalExpiryTime = currentTime.add(time.duration.seconds(100));
    var actualRentalExpiryTime = await harber.rentalExpiryTime.call(4);
    var difference = (actualRentalExpiryTime.toString()-expectedRentalExpiryTime.toString())
    assert.isBelow(difference,2);
  });

  // at this point we are resetting things and will use second token

  // test a normal instance of collectRent
  it('_collectRent function no revertPreviousOwner/foreclose', async () => {
    user = user5;
    // get total collected from all the above tets and just check that it is added to properly
    var totalCollectedSoFar = await harber.totalCollected.call(); 
    await cash.faucet(100,{ from: user });
    await cash.approve(harber.address, 100,{ from: user });
    await harber.newRental(365,1,20,{ from: user  });
    // var timeAcquired = await harber.timeAcquired.call(1); 
    // var currentTime = await time.latest();
    // assert.equal(timeAcquired.toString(),currentTime.toString());
    //wait a week and rent again to trigger function call 
    await time.increase(time.duration.weeks(1));
    await harber.newRental(730,1,20,{ from: user  });
    // var timeAcquired = await harber.timeAcquired.call(1); 
    // var currentTime = await time.latest();
    // assert.equal(timeAcquired.toString(),currentTime.toString());
    //test deposits
    var deposit = await harber.deposits.call(1,user); 
    assert.equal(deposit, 33); //price 365, 1 week delay = charge of 7, 40-7 = 33
    //test collectedAndSentToAugur
    var collectedAndSentToAugur = await harber.collectedPerMarket.call(1); 
    assert.equal(collectedAndSentToAugur,7);
    //test totalCollected. The total so far from previous tests is 45.  So we expect 52
    var totalCollected = await harber.totalCollected.call();
    assert.equal(totalCollected,totalCollectedSoFar.toNumber()+collectedAndSentToAugur.toNumber());
    //test timeLastCollected
    var timeLastCollected = await harber.timeLastCollected.call(1);
    currentTime = await time.latest();
    assert.equal(currentTime.toString(),timeLastCollected.toString());
    //wait a week and check all the above again, they should be unchanged
    await time.increase(time.duration.weeks(1));
    time10MinsAgo=currentTime;
    var deposit = await harber.deposits.call(1,user); 
    assert.equal(deposit, 33);
    var collectedAndSentToAugur = await harber.collectedPerMarket.call(1); 
    assert.equal(collectedAndSentToAugur,7);
    var totalCollected = await harber.totalCollected.call();
    assert.equal(totalCollected,totalCollectedSoFar.toNumber()+collectedAndSentToAugur.toNumber());
    var timeLastCollected = await harber.timeLastCollected.call(1);
    assert.equal(time10MinsAgo.toString(),timeLastCollected.toString());
    //trigger the function again by doing another purchase and check all variables have updated correctly
    await harber.newRental(1095,1,20,{ from: user });
    var deposit = await harber.deposits.call(1,user); 
    assert.equal(deposit, 39); // 33 + 20 - 14
    var collectedAndSentToAugur = await harber.collectedPerMarket.call(1); 
    assert.equal(collectedAndSentToAugur,21); // 7 + 14
    var totalCollected = await harber.totalCollected.call();
    assert.equal(totalCollected,totalCollectedSoFar.toNumber()+collectedAndSentToAugur.toNumber());
    currentTime = await time.latest();
    var timeLastCollected = await harber.timeLastCollected.call(1);
    assert.equal(currentTime.toString(),timeLastCollected.toString());
  });

  // test collectRent again, but this time it should foreclose, does it?
  it('_collectRent function with foreclose but no revertPreviousOwner', async () => {
    user = user5;
    //from the above, we currently have a price of 1095 = charge of 3 per day. We have a deposit of 39 left, 39/3= 13 days. Let's wait ten days and check it hasn't been foreclosed, then another 5 and check that it has
    //we cannot check the state variable to see if it's foreclosed, as it is immediately rebought. Instead, we can try and put a price lower than the previous one- it will accept this if there was a foreclosure that reduced the price to zero. 
    await time.increase(time.duration.weeks(1));
    await shouldFail.reverting.withMessage(harber.newRental(1,1,21,{ from: user}), "Price must be higher than current price");
    await time.increase(time.duration.weeks(1));
    await harber.newRental(1,1,5,{ from: user  }); 
  });

  // test collectRent again, this time it should return to previous owner, does it?
  it('_collectRent function with revertPreviousOwner via calling _collect directly', async () => {
    await harber.newRental(365,1,5,{ from: user5  }); //10 deposit = 10 days
    await cash.faucet(100,{ from: user6 });
    await cash.approve(harber.address, 100,{ from: user6 });
    await harber.newRental(730,1,20,{ from: user6  }); //20 deposit = 10 days
    await cash.faucet(100,{ from: user7 });
    await cash.approve(harber.address, 100,{ from: user7 });
    await harber.newRental(1095,1,30,{ from: user7  }); //30 deposit = 10 days
    //check deposits
    var deposit = await harber.deposits.call(1,user5); 
    assert.equal(deposit, 10);
    var deposit = await harber.deposits.call(1,user6); 
    assert.equal(deposit, 20);
    var deposit = await harber.deposits.call(1,user7); 
    assert.equal(deposit, 30);
    //check ownerTracker variable
    //user 6:
    var trackedPrice = await harber.getOwnerTrackerPrice.call(1,1);
    assert.equal(trackedPrice, 365);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(1,1);
    assert.equal(trackedAddress, user5);
    //user 7:
    var trackedPrice = await harber.getOwnerTrackerPrice.call(1,2);
    assert.equal(trackedPrice, 730);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(1,2);
    assert.equal(trackedAddress, user6);
    //user 8:
    var trackedPrice = await harber.getOwnerTrackerPrice.call(1,3);
    assert.equal(trackedPrice, 1095);
    var trackedAddress = await harber.getOwnerTrackerAddress.call(1,3);
    assert.equal(trackedAddress, user7);
    //wait a week then call collectfunds, should not revert
    await time.increase(time.duration.weeks(1));
    await harber._collectRent(1,{ from: user0 }); //user irrelevant
    var deposit = await harber.deposits.call(1,user7); 
    assert.equal(deposit, 9); 
    var owner = await token.ownerOf.call(1);
    assert.equal(owner, user7);
    var price = await harber.price.call(1);
    assert.equal(price, 1095);
    //wait another week, should now revert
    await time.increase(time.duration.weeks(1));
    await harber._collectRent(1,{ from: user0 }); //user irrelevant
    var owner = await token.ownerOf.call(1);
    assert.equal(owner, user6);
    var price = await harber.price.call(1);
    assert.equal(price, 730);
    //wait another 2 weeks, should revert again
    await time.increase(time.duration.weeks(2));
    await harber._collectRent(1,{ from: user0 }); //user irrelevant
    var owner = await token.ownerOf.call(1);
    assert.equal(owner, user5);
    var price = await harber.price.call(1);
    assert.equal(price, 365);
    //wait another 2 weeks, check that its foreclosed 
    await time.increase(time.duration.weeks(2));
    await harber._collectRent(1,{ from: user0 }); //user irrelevant
    var owner = await token.ownerOf.call(1);
    assert.equal(owner, harber.address);
    var price = await harber.price.call(1);
    assert.equal(price, 0);
    //doing some buys so that some users for this token will have a deposit balance, which can be tested later when doing return deposit
    await harber.newRental(365,1,11,{ from: user5  }); 
    await harber.newRental(730,1,12,{ from: user6  }); 
    await harber.newRental(1095,1,13,{ from: user7  }); 

  });

//reset token2

  // these are four crucial variables that are relied on for other functions. are they what they should be?
  it('test collected, held variables and collectedAndSentToAugur and totalCollected', async () => {
    // first get totalCollected from all of the above and just check it increments properly from now on. And check collectedAndSentToAugur is zero
    var totalCollectedAtStart = await harber.totalCollected.call();
    var collectedAndSentToAugur = await harber.collectedPerMarket.call(2);
    assert.equal(collectedAndSentToAugur,0);
    await harber.newRental(365,2,14,{ from: user0  }); //14 so lasts exactly 2 weeks
    //delay a week, do  collection
    await time.increase(time.duration.weeks(1));
    await harber._collectRent(2);
    var currentTime = await time.latest();
    // check time collected
    var timeCollected = await harber.timeLastCollected.call(2);
    assert.equal(timeCollected.toString(),currentTime.toString());
    // check collectedAndSentToAugur
    var collectedAndSentToAugur = await harber.collectedPerMarket.call(2);
    assert.equal(collectedAndSentToAugur,7);
    // wait 2 weeks and do collection, check time held and total time held = 2 weeks
    await time.increase(time.duration.weeks(2));
    await harber._collectRent(2);
    var timeHeld = await harber.timeHeld.call(2, user0);
    var difference = Math.abs(timeHeld - 1209600); // 14 days 
    assert.isBelow(difference,2);
    var totalTimeHeld = await harber.totalTimeHeld.call(2);
    var difference = Math.abs(totalTimeHeld - 1209600); // 14 days
    assert.isBelow(difference,2);
    //check many timeHelds now. Flow: user1 deposits enough for 4 weeks. After 2  weeks, user2 buys it with enough deposit for 1 week. After 2 weeks, _collect is called and ownership reverts back to user1. After 1 week, user3 buys it with enough deposit for 2 weeks. After 1 week, user4 buys it with enough deposit for 3 days. After 1 week _collect is called, ownership  reverts back to user3. After 2 weeks _collect is called, ownership goes back to user2. Wait three days. Call collect, ownership goes back to user1. Wait 2 days, acll collect. Timehelds should be: user1 23 days, user2 7 days, user3 14 days, user4 3 days
    await harber.newRental(365,2,28,{ from: user1  }); //user 1 has 28 days total
    await time.increase(time.duration.weeks(2));
    await harber.newRental(730,2,14,{ from: user2  }); //1: 14 days , user 2 has 7 days total
    await time.increase(time.duration.weeks(2));
    await harber._collectRent(2); //1: 14 days, 2: 0 days
    await time.increase(time.duration.weeks(1)); 
    await cash.faucet(100,{ from: user3 });
    await cash.approve(harber.address, 100,{ from: user3 });
    await harber.newRental(1095,2,42,{ from: user3  }); //1: 21`days, 3: 14 days total
    await time.increase(time.duration.weeks(1)); //21 here
    await cash.faucet(100,{ from: user4 });
    await cash.approve(harber.address, 100,{ from: user4 });
    await harber.newRental(1460,2,12,{ from: user4  }); //1: 21 days, 3: 
    await time.increase(time.duration.weeks(1));
    await harber._collectRent(2); //revert to user 3
    await time.increase(time.duration.weeks(2));
    await harber._collectRent(2); //revert to user 1 [2 is already 0]c
    await time.increase(time.duration.days(3));
    await harber._collectRent(2); //stay on user 1
    await time.increase(time.duration.days(2));
    await harber._collectRent(2);
    var timeHeld = await harber.timeHeld.call(2, user1);
    var difference = Math.abs(timeHeld - 2246400); // 26 days 
    assert.isBelow(difference,3);
    var timeHeld = await harber.timeHeld.call(2, user2);
    var difference = Math.abs(timeHeld - 604800); // 7 days
    assert.isBelow(difference,2);
    var timeHeld = await harber.timeHeld.call(2, user3);
    var difference = Math.abs(timeHeld - 1209600); // 14 days 
    assert.isBelow(difference,2);
    var timeHeld = await harber.timeHeld.call(2, user4);
    var difference = Math.abs(timeHeld - 259200); // 3 days
    assert.isBelow(difference,2);
    //check total time held
    var totalTimeHeld = await harber.totalTimeHeld.call(2);
    var difference = Math.abs(totalTimeHeld - 5529600); // 14+26+7+14+3 days = 64
    assert.isBelow(difference,3);
    //call exit so that it is owned by me, and check totalTimeHeld has NOT incremented
    await harber.exit(2,{ from: user1 }); 
    var totalTimeHeld = await harber.totalTimeHeld.call(2);
    var difference = Math.abs(totalTimeHeld - 5529600); 
    assert.isBelow(difference,5);
    // check collectedAndSentToAugur
    var collectedAndSentToAugur = await harber.collectedPerMarket.call(2);
    assert.equal(collectedAndSentToAugur,108); // 14 from u0 + 26 from u1 + 14 from u2 + 42 from u3 + 12 from u4
    // TotalCollectedAndSentToAugur
    var totalCollected = await harber.totalCollected.call();
    var totalCollectedShouldBe = totalCollectedAtStart.toNumber() + 108;
    assert.equal(totalCollected,totalCollectedShouldBe);
  });

  //token 3
  // check withdrawDeposit works as it should
  it('test withdrawDeposit', async () => {
    user = user0;
    //rent then withdraw half
    await harber.newRental(365,3,14,{ from: user }); 
    var deposit = await harber.deposits.call(3,user); 
    assert.equal(deposit, 14); 
    await harber.withdrawDeposit(7,3,{ from: user  });
    var deposit = await harber.deposits.call(3,user); 
    assert.equal(deposit, 7); 
    // withdraw other half then check foreclose
    await harber.withdrawDeposit(7,3,{ from: user  });
    var deposit = await harber.deposits.call(3,user); 
    assert.equal(deposit, 0); 
    var price = await harber.price.call(3);
    assert.equal(price, 0);
    var owner = await token.ownerOf.call(3);
    assert.equal(owner, harber.address); //if it belongs to the contract it means it has foreclosed
    //try again but this time have two users rent it, and make sure it reverts to original  user after the first one sells
    await harber.newRental(365,3,10,{ from: user1 });
    await harber.newRental(720,3,10,{ from: user2 });
    await harber.withdrawDeposit(10,3,{ from: user2 });
    var owner = await token.ownerOf.call(3);
    assert.equal(owner, user1);
    var price = await harber.price.call(3);
    assert.equal(price, 365);
    await harber.withdrawDeposit(10,3,{ from: user1 });
    var owner = await token.ownerOf.call(3);
    assert.equal(owner, harber.address);
    var price = await harber.price.call(3);
    assert.equal(price, 0);
  });

  // check the exit function works as it should
  it('test exit', async () => {
    user = user0;
    //rent then withdraw half
    await harber.newRental(365,3,14,{ from: user }); 
    var deposit = await harber.deposits.call(3,user); 
    assert.equal(deposit, 14); 
    await harber.exit(3,{ from: user  });
    var deposit = await harber.deposits.call(3,user); 
    assert.equal(deposit, 0); 
    var price = await harber.price.call(3);
    assert.equal(price, 0);
    var owner = await token.ownerOf.call(3);
    assert.equal(owner, harber.address); //if it belongs to me it means it has foreclosed
    //try again but this time have two users rent it, and make sure it reverts to original  user after the first one sells
    await harber.newRental(365,3,10,{ from: user1 });
    await harber.newRental(720,3,10,{ from: user2 });
    await harber.exit(3,{ from: user2 });
    var owner = await token.ownerOf.call(3);
    assert.equal(owner, user1);
    var price = await harber.price.call(3);
    assert.equal(price, 365);
    await harber.exit(3,{ from: user1 });
    var owner = await token.ownerOf.call(3);
    assert.equal(owner, harber.address);
    var price = await harber.price.call(3);
    assert.equal(price, 0);
    //just to test return deposit
    await harber.newRental(1,3,3,{ from: user2 });
  });

  //back to token 2
  // test the final bit- paying out to users
  it('test finaliseAndPayout, returnDeposits', async () => {
    // first set all user balances to zero so we can check how much is sent easily
    await cash.resetBalance(user0);
    await cash.resetBalance(user1);
    await cash.resetBalance(user2);
    await cash.resetBalance(user3);
    await cash.resetBalance(user4);
    await cash.resetBalance(user5);
    await cash.resetBalance(user6);
    await cash.resetBalance(user7);
    //get our bearings
    var totalCollected = await harber.totalCollected.call();
    difference = (totalCollected - 273);
    assert.isBelow(difference,2);
    var contractBalance = await cash.balanceOf.call(harber.address);
    difference = (contractBalance - 557);
    assert.isBelow(difference,2);
    //leaving 284 in deposits as below:
    //below are the only combinations of users/tokens with a positive deposit
    var deposit = await harber.deposits.call(4,user0);
    assert.equal(deposit, 40); //40
    var deposit = await harber.deposits.call(4,user1);
    assert.equal(deposit, 20); //20
    var deposit = await harber.deposits.call(4,user2);
    assert.equal(deposit, 15); //15
    var deposit = await harber.deposits.call(4,user3);
    assert.equal(deposit, 70); //70
    var deposit = await harber.deposits.call(4,user4);
    var difference = (100 - deposit);
    assert.isBelow(difference,2);
    var deposit = await harber.deposits.call(1,user5);
    assert.equal(deposit, 11); //11
    var deposit = await harber.deposits.call(1,user6);
    assert.equal(deposit, 12); //12
    var deposit = await harber.deposits.call(1,user7);
    assert.equal(deposit, 13); //13
    var deposit = await harber.deposits.call(3,user2);
    assert.equal(deposit, 3); //3
    // sum of the above = 284
    //set the winner manually
    var loops = 16; //this is the lowest number at which it works
    await harber.step1checkMarketsResolved(2, true); 
    await harber.step2getLoopsRequired(); 
    await harber.step3returnDeposits(loops); 
    // after deposits are returned, balance of contract should equal totalCollected
    var totalCollected = await harber.totalCollected.call();
    var contractBalance = await cash.balanceOf.call(harber.address);
    assert.equal(toString(contractBalance), toString(totalCollected));
    //check deposits returned
    var depositReturned = await cash.balanceOf.call(user0);
    assert.equal(depositReturned, 40);
    var depositReturned = await cash.balanceOf.call(user1);
    assert.equal(depositReturned, 20);
    var depositReturned = await cash.balanceOf.call(user2);
    assert.equal(depositReturned, 18);
    var depositReturned = await cash.balanceOf.call(user3);
    assert.equal(depositReturned, 70);
    var depositReturned = await cash.balanceOf.call(user4);
    assert.equal(depositReturned, 0); //0 not 100 from above, due to the _collect within setWinner that had not been called on token4 for ages
    var depositReturned = await cash.balanceOf.call(user5);
    assert.equal(depositReturned, 11);
    var depositReturned = await cash.balanceOf.call(user6);
    assert.equal(depositReturned, 12);
    var depositReturned = await cash.balanceOf.call(user7);
    assert.equal(depositReturned, 0); //0 not 13 from above, due to the _collect within setWinner that had not been called on token3 for ages
    //clear all balances again for testing purposes
    await cash.resetBalance(user0);
    await cash.resetBalance(user1);
    await cash.resetBalance(user2);
    await cash.resetBalance(user3);
    await cash.resetBalance(user4);
    await cash.resetBalance(user5);
    await cash.resetBalance(user6);
    await cash.resetBalance(user7);
    //finish the payout
    await harber.step4sellCompleteSetsAndPayAndrew(); 
    await harber.step5complete(loops); 
    var totalCollected = await harber.totalCollected.call();
    // total time held for winning token is 64 days users:
    // 0 14 days
    // 1 26 days
    // 2 7 days
    // 3 14 days
    // 4 3 days
    var user0Winnings = await cash.balanceOf.call(user0);
    var difference = Math.abs(user0Winnings - ((totalCollected.toNumber()*14)/64));
    assert.isBelow(difference,2); 
    var user1Winnings = await cash.balanceOf.call(user1);
    var difference = Math.abs(user1Winnings - ((totalCollected.toNumber()*26)/64));
    assert.isBelow(difference,2);
    var user2Winnings = await cash.balanceOf.call(user2);
    var difference = Math.abs(user2Winnings - ((totalCollected.toNumber()*7)/64));
    assert.isBelow(difference,2); 
    var user3Winnings = await cash.balanceOf.call(user3);
    var difference = Math.abs(user3Winnings - ((totalCollected.toNumber()*14)/64));
    assert.isBelow(difference,2);
    var user4Winnings = await cash.balanceOf.call(user4);
    var difference = Math.abs(user4Winnings - ((totalCollected.toNumber()*3)/64));
    assert.isBelow(difference,2);
  });

});