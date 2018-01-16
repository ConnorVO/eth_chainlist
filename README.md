TRUFFLE:
    AFTER CHANGING CONTRACT, MUST RUN TRUFFLE MIGRATE --RESET

Test Network:
    1) sh startganache-cli.sh
    2) truffle migrate
    3) npm run dev

PRIVATE NETWORK
    1) in private folder, run sh startnode.sh
    2) geth attach (if you are gonna use it)
    3) truffle migrate
    4) npm run dev

Setup:

1) truffle unbox pet-shop

2) fix truffle.js

3) create contract in contracts folder

    ChainList.sol

4) create migration scripts in 2_deploy_contracts.js

5) truffle migrate

6) Interact with contract

    truffle console

    ChainList.address

    web3.fromWei(eth.getBalance(eth.accounts[0]), "ether")     <- account zero pays for launching contract

    ChainList.deployed().then(function(instance){app=instance})     <- instance of contract

    app.getObject.call()

    app.sellObject("iPhone 7", "Selling to buy iPhone 8", web3.toWei(3, "ether"), {from: web3.eth.accounts[1]})

    app.getObject.call()

========================================================================
========================================================================

Test Project:

Can Test with:

    - ganache_cli
    - private network
    - test network
    

Test that state variables are initiated

    - create and complete file
        - ChainListHappyPath.js

    - run test file

        truffle test

- Can dictate which specific file to test by running 

    truffle test test/ChainListHappyPath.js

========================================================================
========================================================================

Front End: 

1) npm install (while in chainlist directory)

2) run current application

    npm run dev

3) change package.json to whatever you want

4) index.html

5) app.js 

    - replace init function

6) create stylesheet

    app.css

========================================================================
========================================================================

Connect Front End with Back End:

1) disable metamask extension so it doens't get in way

2) instantiate web3

    - remove all functions in app.js
        - leave the $(function()) at end

    1) complete code

        - remember that web3 uses callbacks and truffle uses promises

    2) redeploy contract

        truffle migrate --reset

========================================================================
========================================================================

Sell article from front end:

1) remove previous constructor that created fake article

2) app.js

========================================================================
========================================================================

Sell article from MetaMask:

1) start-up node (differently than normal)
    - starting ganache-cli with 3 pre-specified accounts with private key (account="") and value
    - do this everytime so that we can use same accounts (already imported in MetaMask) as we use our app
    - run sh startganache-cli.sh or below 

    ganache-cli --account="0x351494a5ae8f9b70a2a2fd482146ab4578f61d4d796685c597ec6683635a940e, 100000000000000000000" --account="0x4cd491f96e6623edb52719a8d4d1110a87d8d83e3fa86f8e14007cb3831c0a2b, 100000000000000000000" --account="0xef40e0d6ada046010b6965d73603cabae1a119ca804f5d9e9a9ce866b0bea7d, 100000000000000000000"

2) truffle migrate

3) npm run dev

4) re-enable MetaMask

5) connect MetaMask to localhost 8545

6) import accounts created with ganache-cli
    - now the account shown on ChainList is whichever account you have open in MetaMask 


========================================================================
========================================================================

Notify Users when new object is for sale (without reloading page)


1) add event to ChainList for notifying when new article is for sale

    event sellObjectEvent(address indexed _seller, string _name, uint256 _price);

    - indexed modifier allows you to filter event occurences by values of seller argument

2) trigger event in sellObject function

    sellObjectEvent(seller, name, price);

3) truffle migrate --reset       <- must --reset after changing contract code


Watch event from Truffle console and test it

1) get instance of deployed contract

    ChainList.deployed().then(function(instance){app=instance;})

2) create event watcher

    var sellEvent = app.sellObjectEvent({}, {fromBlock: 0, toBlock: 'latest'}).watch(function(error, event) {console.log(event);})

        - the {} in sellObjectEvent is filter (could filter by seller because it is indexed)


3) sell object

    app.sellObject("Object 1", "Description of object 1", web3.toWei(11, "ether"), {from: web3.eth.accounts[1]})

4) stop watching

    sellEvent.stopWatching()

5) update test file

6) truffle test

========================================================================
========================================================================

Automatically update frontend with new object when event is triggered


1) update app.js to listen to event
    - don't forget to add App.listenToEvents() to initContract
    - (MAYBE NOT) remove App.listenToEvents() from sellObject function because it is called from listenToEvents function


========================================================================
========================================================================

Deploy to private network
    - Benefits
        - as close as possible to real network
        - stores stuff "permanantely"


1) remember to shut down test network

2) go to private network directory

    ChainList/private

3) sh startnode.sh

4) new tab go to project directory (ChainList/training/chainlist)

5) truffle test
    - much slower becuase using real node
    - test case 2 and 3 don't pass because need password (accounts not unlocked by default)

6) geth attach

7) unlock account that is selling

    personal.unlockAccount(eth.accounts[1], "password", 3600)

8) truffle test
    
9) deploy contract to private node
    - each time you deploy address, truffle keeps track of address at which contract was deployed in build/contracts/ChainList.json at bottom of file it says "address": ""

    1) truffle migrate --reset

    2) test front end
        npm run dev

10) 


========================================================================
========================================================================

Buy article

1) add to contract
    - if require fails (or assert, throw, revert), the spent gas up to that point isn't refunded

    - throw: legacy
    - assert: internal errors
    - require = preconditions
    - revert = other business errors. Used when condition is more complex that require

    .transfer() throws revert if fails

    - all contracts have their own ether balance

2) truffle migrate (must use --reset if not the first time since console started)

3) truffle console

4) get instance of contract

    ChainList.deployed().then(function(instance){app=instance})

5) check balance of accounts

    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]), "ether").toNumber()
    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether").toNumber()
    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2]), "ether").toNumber()

6) check object in contract

    app.getObject.call()

7) sell object

    app.sellObject("object1", "Description of object 1", web3.toWei(10, "ether"), {from: web3.eth.accounts[1]})

8) check that it is in contract

    app.getObject.call()

9) setup event for buying 
    - pass in filter so it only watches event where seller is account 1

    var buyEvent = app.buyObjectEvent({_seller: web3.eth.accounts[1]}, {fromBlock: 0, toBlock: 'latest'}).watch(function(error, event){console.log(event);})

10) Buy Object

    app.buyObject({from: web3.eth.accounts[2], value: web3.toWei(10, "ether")})

11) check contract state
    - should have buyer

    app.getObject.call()

12) check balance of accounts

    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether").toNumber()
    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2]), "ether").toNumber()

- if buyer doesn't send proper amount of ether, error is thrown and no ether is sent (except spent gas)

========================================================================
========================================================================

Test Buy article

1) update test suite

========================================================================
========================================================================

Test Buy article exceptions

1) ChainListExceptions.js

2) truffle test or truffle test test/ChainListExceptions.js

========================================================================
========================================================================

Buy article from frontend

1) Update html and app.js


========================================================================
========================================================================

Buy and sell multiple objects

1) add structure to contract and add id 

2) add mapping to contract

3) update functions
    - don't need getObjects() because public mapping automatically creates getter

4) startup console ish

5) get instance

    ChainList.deployed().then(function(instance){app=instance})

6) sell two articles from account

    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether").toNumber()
    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2]), "ether").toNumber()

    var sellEvent = app.sellObjectEvent({}, {fromBlock: 0, toBlock: 'latest'}).watch(function(error, event){console.log(event);})

    var buyEvent = app.buyObjectEvent({}, {fromBlock: 0, toBlock: 'latest'}).watch(function(error, event){console.log(event);})

    app.sellObject("Object 1", "Object 1 description", web3.toWei(10, "ether"), {from: web3.eth.accounts[1]})

    app.sellObject("Object 2", "Object 2 description", web3.toWei(20, "ether"), {from: web3.eth.accounts[1]})

7) test new getters

    app.getObjectsForSale()
    app.getNumberOfObjects()

    - getter that is created for the mapping automatically
        app.objects(ID);

        app.objects(1)

8) buy object

    app.buyObject(1, {from: web3.eth.accounts[2], value: web3.toWei(10, "ether")})

9) app.getObjectsForSale()
    - should only have one

10) check balances
    
    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether").toNumber()
    

11) app.objects(1)
    - should have buyer

========================================================================
========================================================================

Update Test Suites to handle multiple arguments

========================================================================
========================================================================

Buy and sell multiple articles on frontend

========================================================================
========================================================================

Deactivate smart contract

-why?
    - don't need it anymore
    - proof of concept
    - shut down company
    - some technical or functional limitations
    - can't update contracts once on the chain

- functions and state variables not available anymore for future interaction
- funds are sent to address passed as parameter
- only allow contract owner to call self destruct

1) assign contract owner in constructor

2) write kill function
    - only can be called by owner
    - funds sent to owner

    selfdestruct(owner)

3) truffle console

4) get deployed contract instance

    ChainList.deployed().then(function(instance) {app=instance})

5) kill contract

    app.kill({from: web3.eth.accounts[1]})    
        - won't work because not person who initiated contract

    app.kill({from: web3.eth.accounts[0]})
        - works
        - can still see events 
        - can't do any calls to contract
            - gas is still spent if you try though
            - if ether is sent to dead contract, it is lost

    - ens.domains.com
        - allows you to change address but point to same page

========================================================================
========================================================================

Function Modifier

    - can take arguments
    - _; just means run function code 

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function kill() onlyOwner {
        selfdestruct(owner)
    }

========================================================================
========================================================================

Inheritance

1) extend contract

    1) make parent contract

    2) import on child contract

        import "./Owned.sol"

    3) inherit

        contract Chainlist is Owned {}

2) remove stuff declared in parent class

https://solidity.readthedocs.io/en/latest/contracts.html#inheritance

========================================================================
========================================================================

Deploy to Rinkeby

1) Make sure stuff is on github

2) create directory ('docs') to move files into

3) create script to move files

    deployfrontend.sh

4) run script

    sh deployfrontend.sh

5) Go to Github settings
    - Git cheatsheat: ndpsoftware.com/git-cheatsheet.html

    1) change source to master branch /docs folder



========================================================================
========================================================================

ERRORS

new BigNumber() not a number

    - not including added parameter in html
    - app.js not handling new paramete properly







