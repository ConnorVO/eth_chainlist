//Contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

contract('ChainList', function(accounts) {

	var chainListInstance;
	var objectId;
	var seller = accounts[1];
	var buyer = accounts[2];
	var objectName1 = "object 1";
	var objectDescription1 = "Description for object 1";
	var objectPrice1 = 10;
	var objectName2 = "object 2";
	var objectDescription2 = "Description for object 2";
	var objectPrice2 = 20;
	var watcher;
	var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
	var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

	//Test Case: Check initial values
	it("should be initialized with empty values", function() {
		return ChainList.deployed().then(function(instance) { //deploy
			chainListInstance = instance;
			return chainListInstance.getNumberOfObjects(); //get instace
		}).then(function(data) { //return values from above function call
			assert.equal(data, 0x0, "number of objects must be 0"); 
			return chainListInstance.getObjectsForSale();      
		}).then(function(data) {
			assert.equal(data.length, 0, "objects for sale should be empty");
		});
	});

	// Test case: sell a first object
	it("should let us sell a first object", function() {
		return ChainList.deployed().then(function(instance) {
			chainListInstance = instance;
			return chainListInstance.sellObject(objectName1, objectDescription1, web3.toWei(objectPrice1, "ether"), {
				from: seller
			});
		}).then(function(receipt) {
			//check event
			assert.equal(receipt.logs.length, 1, "should have received one event");
			assert.equal(receipt.logs[0].event, "sellObjectEvent", "event name should be sellObjectEvent");
			assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
			assert.equal(receipt.logs[0].args._seller, seller, "seller must be " + seller);
			assert.equal(receipt.logs[0].args._name, objectName1, "object name must be " + objectName1);
			assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(objectPrice1, "ether"), "object price must be " + web3.toWei(objectPrice1, "ether"));

			return chainListInstance.getNumberOfObjects();
		}).then(function(data) {
			assert.equal(data, 1, "number of objects must be one");

			return chainListInstance.getObjectsForSale();
		}).then(function(data) {
			assert.equal(data.length, 1, "there must now be 1 object for sale");
			objectId = data[0].toNumber();
			assert.equal(objectId, 1, "object id must be 1");

			return chainListInstance.objects(objectId);
		}).then(function(data) {
			assert.equal(data[0].toNumber(), 1, "object id must be 1");
			assert.equal(data[1], seller, "seller must be " + seller);
			assert.equal(data[2], 0x0, "buyer must be empty");
			assert.equal(data[3], objectName1, "object name must be " + objectName1);
			assert.equal(data[4], objectDescription1, "object description must be " + objectDescription1);
			assert.equal(data[5].toNumber(), web3.toWei(objectPrice1, "ether"), "object price must be " + web3.toWei(objectPrice1, "ether"));
		});
	});

	// Test case: sell a second object
	it("should let us sell a second object", function() {
		return ChainList.deployed().then(function(instance) {
			chainListInstance = instance;
			return chainListInstance.sellObject(objectName2, objectDescription2, web3.toWei(objectPrice2, "ether"), {
				from: seller
			});
		}).then(function(receipt) {
			//check event
			assert.equal(receipt.logs.length, 1, "should have received one event");
			assert.equal(receipt.logs[0].event, "sellObjectEvent", "event name should be sellObjectEvent");
			assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
			assert.equal(receipt.logs[0].args._seller, seller, "seller must be " + seller);
			assert.equal(receipt.logs[0].args._name, objectName2, "object name must be " + objectName2);
			assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(objectPrice2, "ether"), "object price must be " + web3.toWei(objectPrice2, "ether"));

			return chainListInstance.getNumberOfObjects();
		}).then(function(data) {
			assert.equal(data, 2, "number of objects must be two");

			return chainListInstance.getObjectsForSale();
		}).then(function(data) {
			assert.equal(data.length, 2, "there must now be 2 object for sale");
			objectId = data[1].toNumber();
			assert.equal(objectId, 2, "object id must be 2");

			return chainListInstance.objects(objectId);
		}).then(function(data) {
			assert.equal(data[0].toNumber(), 2, "object id must be 2");
			assert.equal(data[1], seller, "seller must be " + seller);
			assert.equal(data[2], 0x0, "buyer must be empty");
			assert.equal(data[3], objectName2, "object name must be " + objectName2);
			assert.equal(data[4], objectDescription2, "object description must be " + objectDescription2);
			assert.equal(data[5].toNumber(), web3.toWei(objectPrice2, "ether"), "object price must be " + web3.toWei(objectPrice2, "ether"));
		});
	});

	// Test case: buy the first object
	it("should let us buy the first object", function() {
		return ChainList.deployed().then(function(instance) {
			chainListInstance = instance;
			objectId = 1;

			// record balances of seller and buyer before the buy
			sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
			buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

			return chainListInstance.buyObject(objectId, {
				from: buyer,
				value: web3.toWei(objectPrice1, "ether")
			});
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, "one event should have been triggered");
			assert.equal(receipt.logs[0].event, "buyObjectEvent", "event should be buyObjectEvent");
			assert.equal(receipt.logs[0].args._id.toNumber(), objectId, "objectId must be " + objectId);
			assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
			assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
			assert.equal(receipt.logs[0].args._name, objectName1, "event object name must be " + objectName1);
			assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(objectPrice1, "ether"), "event object price must be " + web3.toWei(objectPrice1, "ether"));

			// record balances of buyer and seller after the buy
			sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
			buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

			//check the effect of buy on balances of buyer and seller, accounting for gas
			assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + objectPrice1, "seller should have earned " + objectPrice1 + " ETH");
			assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - objectPrice1, "buyer should have spent " + objectPrice1 + " ETH");

			return chainListInstance.objects(objectId);
		}).then(function(data) {
			assert.equal(data[0].toNumber(), 1, "object id must be 1");
			assert.equal(data[1], seller, "seller must be " + seller);
			assert.equal(data[2], buyer, "buyer must be " + buyer);
			assert.equal(data[3], objectName1, "object name must be " + objectName1);
			assert.equal(data[4], objectDescription1, "object description must be " + objectDescription1);
			assert.equal(data[5].toNumber(), web3.toWei(objectPrice1, "ether"), "object price must be " + web3.toWei(objectPrice1, "ether"));

			return chainListInstance.getObjectsForSale();
		}).then(function(data) {
			assert(data.length, 1, "there should now be only one object left for sale");
		});
	});
});