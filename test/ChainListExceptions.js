//Contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

contract('ChainList', function(accounts) {

		var chainListInstance;
		var seller = accounts[1];
		var buyer = accounts[2];
		var objectId = 1;
		var objectName = "object 1";
		var objectDescription = "Description for object 1";
		var objectPrice = 10;
		
		//Test Case: try to buy object that is not yet for sale
		it("should throw an exception if you try to buy an object when there is no object for sale", function() {
			return ChainList.deployed().then(function(instance) {
				chainListInstance = instance;
				return chainListInstance.buyObject(objectId, {
					from: buyer,
					value: web3.toWei(objectPrice, "ether")
				});
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, "error message must contain invalid revert");
			}).then(function() {
				return chainListInstance.getNumberOfObjects();
			}).then(function(data) {
				//make sure sure the contract state was not altered
				assert.equal(data.toNumber(), 0, "number of objects must be zero");
			});
		});

		// Test case: buying an object that does not exist
		it("should throw an exception if you try to buy an object that does not exist", function() {
			return ChainList.deployed().then(function(instance) {
				chainListInstance = instance;
				return chainListInstance.sellObject(objectName, objectDescription, web3.toWei(objectPrice, "ether"), {
					from: seller
				});
			}).then(function(receipt) {
				return chainListInstance.buyObject(2, {
					from: buyer,
					value: web3.toWei(objectPrice, "ether")
				});
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, "error message must contain invalid revert");
			}).then(function() {
				return chainListInstance.objects(objectId);
			}).then(function(data) {
				assert.equal(data[0].toNumber(), objectId, "object id must be " + objectId);
				assert.equal(data[1], seller, "seller must be " + seller);
				assert.equal(data[2], 0x0, "buyer must be empty");
				assert.equal(data[3], objectName, "object name must be " + objectName);
				assert.equal(data[4], objectDescription, "object description must be " + objectDescription);
				assert.equal(data[5].toNumber(), web3.toWei(objectPrice, "ether"), "object price must be " + web3.toWei(objectPrice, "ether"));
			});
		}); 

		// Test case: buying an object you are selling
		it("should throw an exception if you try to buy your own object", function() {
			return ChainList.deployed().then(function(instance) {
				chainListInstance = instance;

				return chainListInstance.buyObject(objectId, {
					from: seller,
					value: web3.toWei(objectPrice, "ether")
				});
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, "error message must contain invalid revert");
			}).then(function() {
				return chainListInstance.objects(objectId);
			}).then(function(data) {
				//make sure sure the contract state was not altered
				assert.equal(data[0].toNumber(), objectId, "object id must be " + objectId);
				assert.equal(data[1], seller, "seller must be " + seller);
				assert.equal(data[2], 0x0, "buyer must be empty");
				assert.equal(data[3], objectName, "object name must be " + objectName);
				assert.equal(data[4], objectDescription, "object description must be " + objectDescription);
				assert.equal(data[5].toNumber(), web3.toWei(objectPrice, "ether"), "object price must be " + web3.toWei(objectPrice, "ether"));
			});
		});

		// Test case: incorrect value
		it("should throw an exception if you try to buy an object for a value different from its price", function() {
			return ChainList.deployed().then(function(instance) {
				chainListInstance = instance;
				return chainListInstance.buyObject(objectId, {
					from: buyer,
					value: web3.toWei(objectPrice + 1, "ether")
				});
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, "error message must contain invalid revert");
			}).then(function() {
				return chainListInstance.objects(objectId);
			}).then(function(data) {
				//make sure sure the contract state was not altered
				assert.equal(data[0].toNumber(), objectId, "object id must be " + objectId);
				assert.equal(data[1], seller, "seller must be " + seller);
				assert.equal(data[2], 0x0, "buyer must be empty");
				assert.equal(data[3], objectName, "object name must be " + objectName);
				assert.equal(data[4], objectDescription, "object description must be " + objectDescription);
				assert.equal(data[5].toNumber(), web3.toWei(objectPrice, "ether"), "object price must be " + web3.toWei(objectPrice, "ether"));
			});
		});

		// Test case: object has already been sold
		it("should throw an exception if you try to buy an object that has already been sold", function() {
			return ChainList.deployed().then(function(instance) {
				chainListInstance = instance;
				return chainListInstance.buyObject(objectId, {
					from: buyer,
					value: web3.toWei(objectPrice, "ether")
				});
			}).then(function() {
				return chainListInstance.buyObject(objectId, {
					from: web3.eth.accounts[0],
					value: web3.toWei(objectPrice, "ether")
				});
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, "error message must contain invalid revert");
			}).then(function() {
				return chainListInstance.objects(objectId);
			}).then(function(data) {
				//make sure sure the contract state was not altered
				assert.equal(data[0].toNumber(), objectId, "object id must be " + objectId);
				assert.equal(data[1], seller, "seller must be " + seller);
				assert.equal(data[2], buyer, "buyer must be " + buyer);
				assert.equal(data[3], objectName, "object name must be " + objectName);
				assert.equal(data[4], objectDescription, "object description must be " + objectDescription);
				assert.equal(data[5].toNumber(), web3.toWei(objectPrice, "ether"), "object price must be " + web3.toWei(objectPrice, "ether"));
			});
		});

});