pragma solidity ^ 0.4.11;

import "./Owned.sol";

contract ChainList is Owned {
    
    struct Object {
        uint id; //this will be objectsCounter
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    //public automatically creates getter
        //doesn't return struct, returns each value of struct by itself
    mapping(uint => Object) public objects; 
    uint objectsCounter; //used to keep track of size of mapping and whick keys should have value

    //EVENTS
    event sellObjectEvent(uint indexed _id, address indexed _seller, string _name, uint256 _price);
    //indexed buyer and seller so it is possible for them to only watch events that pertain to them
    event buyObjectEvent(uint indexed _id, address indexed _seller, address indexed _buyer, string _name, uint256 _price);

    function sellObject(string _name, string _description, uint256 _price) public {
        
        objectsCounter++;

        objects[objectsCounter] = Object (    // <- same as struct
            objectsCounter,
            msg.sender,
            0x0,
            _name,
            _description,
            _price
        );

        sellObjectEvent(objectsCounter, msg.sender, _name, _price);
    }

    function getNumberOfObjects() public constant returns (uint) {
        return objectsCounter;
    }

    //returns all object IDs 
        //can't return struct 
    function getObjectsForSale() public constant returns (uint[]) {
        
        //return empty array if no objects
        if (objectsCounter == 0) {
            return new uint[](0);
        }

        //prepare output arrays
            //local arrays must have fixed size
        uint[] memory objectIds = new uint[](objectsCounter);

        uint numberOfObjectsForSale = 0;

        //iterate over objects
        for (uint i = 1; i <= objectsCounter; i++) {
            //keep only the ID for the articles not sold
            if (objects[i].buyer == 0x0) {
                objectIds[numberOfObjectsForSale] = objects[i].id;
                numberOfObjectsForSale++;
            }
        }

        //copy the objectIds array into the smaller forSale array
        uint[] memory forSale = new uint[](numberOfObjectsForSale);

        for (uint j = 0; j < numberOfObjectsForSale; j++) {
            forSale[j] = objectIds[j];
        }

        return(forSale);
    }

    //payable means it can receive ether from person who calls it
        //don't need to check for seller because only way to add an article is to sell it
    function buyObject(uint _id) payable public {   
        //check whether there is at least one object
        require(objectsCounter > 0);

        //check whether the article exists
        require(_id > 0 && _id <= objectsCounter);

        //retrieve the article
            //storage ensure it is saved in the state
        Object storage object = objects[_id];

        //check that object hasn't already sold
        require(object.buyer == 0x0);

        //seller can't buy own object
        require(object.seller != msg.sender);

        //check that value sent equals the object price
        require(object.price == msg.value);

        //get buyer info
        object.buyer = msg.sender;

        //transfer money to seller
        object.seller.transfer(msg.value);

        buyObjectEvent(_id, object.seller, object.buyer, object.name, object.price);
    }

    function kill() onlyOwner {
        selfdestruct(owner);
    }
}