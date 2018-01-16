App = {
	web3Provider: null,
	contracts: {},
	account: 0x0,
	loading: false,

	init: function() {
		return App.initWeb3();
	},

	initWeb3: function() {
	    // Initialize web3 and set the provider to the testRPC.
	    if (typeof web3 !== 'undefined') {
	    	console.log("MetaMask");
	      	App.web3Provider = web3.currentProvider;
	      	web3 = new Web3(web3.currentProvider);   //instatiate new object for version control
	    } else {
	      	// set the provider you want from Web3.providers
	      	App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
	      	web3 = new Web3(App.web3Provider);
	    }

	    App.displayAccountInfo();
	    return App.initContract();
  	},

  	displayAccountInfo: function() {
    	web3.eth.getCoinbase(function(err, account) {  //main account on node
      		if (err === null) {
	        	App.account = account;
	        	$("#account").text(account);
	        	web3.eth.getBalance(account, function(err, balance) {
          			if (err === null) {
            			$("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          			}
        		});
      		}
    	});
  	},

  	initContract: function() {
	    $.getJSON('ChainList.json', function(chainListArtifact) {
	      	// Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
	      	App.contracts.ChainList = TruffleContract(chainListArtifact);

	      	// Set the provider for our contract.
	      	App.contracts.ChainList.setProvider(App.web3Provider);

	      	// Listen for events
	      	App.listenToEvents();

	      	// Retrieve the object from the smart contract
	      	return App.reloadObjects();
	    });
  	},

  	reloadObjects: function() {
	    // avoid calling a bunch of times at same time
	    if (App.loading) {
	      	return;
	    }

	    App.loading = true;

	    // refresh account information because the balance may have changed
	    App.displayAccountInfo();

	    var chainListInstance;

	    App.contracts.ChainList.deployed().then(function(instance) {
	      	chainListInstance = instance;
	      	return chainListInstance.getObjectsForSale();
	    }).then(function(objectIds) {

	      	// Retrieve and clear the object placeholder
	      	var objectsRow = $('#objectsRow');
	      	objectsRow.empty();

	      	for (var i = 0; i < objectIds.length; i++) {
		        var objectId = objectIds[i];
		        chainListInstance.objects(objectId.toNumber()).then(function(object) {
		          	App.displayObject(
		            	object[0],
		            	object[1],
		            	object[3],
		            	object[4],
		            	object[5]
		          	);
		        });
	      	}
	      	App.loading = false;
	    }).catch(function(err) {
	      	console.log(err.message);
	      	App.loading = false;
	    });
	},

	displayObject: function(id, seller, name, description, price) {

	    // Retrieve the object placeholder
	    var objectsRow = $('#objectsRow');

	    var etherPrice = web3.fromWei(price, "ether");

	    // Retrieve and fill the object template
	    var objectTemplate = $('#objectTemplate');
	    objectTemplate.find('.panel-title').text(name);
	    objectTemplate.find('.object-description').text(description);
	    objectTemplate.find('.object-price').text(etherPrice + " ETH");
	    objectTemplate.find('.btn-buy').attr('data-id', id);
	    objectTemplate.find('.btn-buy').attr('data-value', etherPrice);

	    // seller?
	    if (seller == App.account) {
	      	objectTemplate.find('.object-seller').text("You");
	      	objectTemplate.find('.btn-buy').hide();
	    } else {
	      	objectTemplate.find('.object-seller').text(seller);
	        objectTemplate.find('.btn-buy').show();
	    }	

	    // add this new object
	    objectsRow.append(objectTemplate.html());
	},

	sellObject: function() {
		
	    // retrieve details of the object
	    var _object_name = $("#object_name").val();
	    var _description = $("#object_description").val();
	    var _price = web3.toWei(parseFloat($("#object_price").val() || 0), "ether");

	    if ((_object_name.trim() == '') || (_price <= 0)) {
	      	// nothing to sell
	      	return false;
	    }

	    App.contracts.ChainList.deployed().then(function(instance) {
	      	return instance.sellObject(_object_name, _description, _price, {
	        	from: App.account,
	        	gas: 500000
	      	});
	    }).then(function(result) {
	    	
	    }).catch(function(err) {
	      	console.error(err);
	    });
  	},

  	// Listen for events raised from the contract
  	listenToEvents: function() {

	    App.contracts.ChainList.deployed().then(function(instance) {

	      	instance.sellObjectEvent({}, {
	        	fromBlock: 0,
	        	toBlock: 'latest'
	      	}).watch(function(error, event) {
	      		
		        if (!error) {
		          	$("#events").append('<li class="list-group-item">' + event.args._name + ' is for sale' + '</li>');
		        } else {
		          	console.error(error);
		        }
		        //because MetaMask Doesn't handle events properly, I am forced to manually reload which causes objects to appear twice after adding a new one because it reloads here and in init
	        	//App.reloadObjects();  
	      	});

	      	instance.buyObjectEvent({}, {
	        	fromBlock: 0,
	        	toBlock: 'latest'
	      	}).watch(function(error, event) {
		        if (!error) {
		          	$("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
		        } else {
		          	console.error(error);
		        }
		        //because MetaMask Doesn't handle events properly, I am forced to manually reload which causes objects to appear twice after buying one because it reloads here and in init
	        	//App.reloadObjects();
	      	});
	    });
  	},

  	buyObject: function() {
	    event.preventDefault();

	    // retrieve the object price
	    var _objectId = $(event.target).data('id');
	    var _price = parseFloat($(event.target).data('value'));

	    App.contracts.ChainList.deployed().then(function(instance) {
		    return instance.buyObject(_objectId, {
		        from: App.account,
		        value: web3.toWei(_price, "ether"),
		        gas: 500000
		    });
	    }).then(function(result) {

	    }).catch(function(err) {
	      	console.error(err);
	    });
  	},

};

$(function() {
	$(window).load(function() {
		App.init();
	});
});