
// File: contracts/interfaces/IERC165.sol

pragma solidity ^0.5.0;

/**
 * @title IERC165
 * @dev https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md
 */
interface IERC165 {
    /**
     * @notice Query if a contract implements an interface
     * @param interfaceId The interface identifier, as specified in ERC-165
     * @dev Interface identification is specified in ERC-165. This function
     * uses less than 30,000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// File: contracts/interfaces/IERC721.sol

pragma solidity ^0.5.0;


/**
 * @title ERC721 Non-Fungible Token Standard basic interface
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function setup() public;

    function balanceOf(address owner) public view returns (uint256 balance);
    function ownerOf(uint256 tokenId) public view returns (address owner);

    function approve(address to, uint256 tokenId) public;
    function getApproved(uint256 tokenId) public view returns (address operator);

    function setApprovalForAll(address operator, bool _approved) public;
    function isApprovedForAll(address owner, address operator) public view returns (bool);

    function transferFrom(address from, address to, uint256 tokenId) public;
    function safeTransferFrom(address from, address to, uint256 tokenId) public;

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public;
}

// File: contracts/interfaces/IERC721Enumerable.sol

pragma solidity ^0.5.0;


/**
 * @title ERC-721 Non-Fungible Token Standard, optional enumeration extension
 * @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract IERC721Enumerable is IERC721 {
    function totalSupply() public view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256 tokenId);

    function tokenByIndex(uint256 index) public view returns (uint256);
}

// File: contracts/interfaces/IERC721Metadata.sol

pragma solidity ^0.5.0;


/**
 * @title ERC-721 Non-Fungible Token Standard, optional metadata extension
 * @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract IERC721Metadata is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

// File: contracts/interfaces/IERC721Full.sol

pragma solidity ^0.5.0;




/**
 * @title ERC-721 Non-Fungible Token Standard, full implementation interface
 * @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract IERC721Full is IERC721, IERC721Enumerable, IERC721Metadata {
    // solhint-disable-previous-line no-empty-blocks
}

// File: contracts/utils/SafeMath.sol

pragma solidity ^0.5.0;

/**
 * @title SafeMath
 * @dev Unsigned math operations with safety checks that revert on error
 */
library SafeMath {
    /**
     * @dev Multiplies two unsigned integers, reverts on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
     * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Adds two unsigned integers, reverts on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
     * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

// File: contracts/Harber.sol

pragma solidity ^0.5.0;




contract Harber {
    
    using SafeMath for uint256;
    

    uint256 constant numberOfOutcomes = 2; //TEST with two teams
    uint256[numberOfOutcomes] public price; //in wei
    // uint[numberOfOutcomes] balance;
    IERC721Full public team; // ERC721 NFT.
    
    uint256 public totalCollected; // total into my whiskey fund
    uint256[numberOfOutcomes] public currentCollected; // amount currently collected for owner  
    uint256[numberOfOutcomes] public timeLastCollected; // 
    uint256[numberOfOutcomes] public deposit;
    address payable public andrewsAddress;
    uint256 public augurFund;
    
    mapping (uint256 => mapping (address => bool) ) public owners;
    mapping (uint256 => mapping (address => uint256) ) public timeHeld;

    uint256[numberOfOutcomes] public timeAcquired;
    
    // 5% patronage
    uint256 patronageNumerator = 50000000000;
    uint256 patronageDenominator = 1000000000000;

    enum ownedState { Foreclosed, Owned }
    ownedState[numberOfOutcomes] public state;

    constructor(address payable _andrewsAddress, address _addressOfToken) public {
        team = IERC721Full(_addressOfToken);
        team.setup();
        andrewsAddress = _andrewsAddress;
        state[0] = ownedState.Foreclosed;
        state[1] = ownedState.Foreclosed;
    } 

    event LogBuy(address indexed owner, uint256 indexed price);
    event LogPriceChange(uint256 indexed newPrice);
    event LogForeclosure(address indexed prevOwner);
    event LogCollection(uint256 indexed collected);
    
    modifier onlyOwner(uint256 _tokenId) {
        require(msg.sender == team.ownerOf(_tokenId), "Not owner");
        _;
    }

    modifier collectAugurFunds(uint256 _tokenId) {
       _collectAugurFunds(_tokenId); 
       _;
    }

    /* public view functions */
    function getPrice(uint256 _tokenId) public view returns (uint256)
    {
        return price[_tokenId];
    }
    function augurFundsOwed(uint256 _tokenId) public view returns (uint256 augurFundsDue) {
        return price[_tokenId].mul(now.sub(timeLastCollected[_tokenId])).mul(patronageNumerator)
            .div(patronageDenominator).div(365 days);
    }

    function augurFundsOwedWithTimestamp(uint256 _tokenId) public view returns (uint256 augurFundsDue, uint256 timestamp) {
        return (augurFundsOwed(_tokenId), now);
    }

    function foreclosed(uint256 _tokenId) public view returns (bool) {
        // returns whether it is in foreclosed state or not
        // depending on whether deposit covers patronage due
        // useful helper function when price should be zero, but contract doesn't reflect it yet.
        uint256 _collection = augurFundsOwed(_tokenId);
        if(_collection >= deposit[_tokenId]) {
            return true;
        } else {
            return false;
        }
    }

    // same function as above, basically
    function depositAbleToWithdraw(uint256 _tokenId) public view returns (uint256) {
        uint256 _collection = augurFundsOwed(_tokenId);
        if(_collection >= deposit[_tokenId]) {
            return 0;
        } else {
            return deposit[_tokenId].sub(_collection);
        }
    }

    /*
    now + deposit/patronage per second 
    now + depositAbleToWithdraw/(price*nume/denom/365).
    */
    function foreclosureTime(uint256 _tokenId) public view returns (uint256) {
        // patronage per second
        uint256 pps = price[_tokenId].mul(patronageNumerator).div(patronageDenominator).div(365 days);
        return now + depositAbleToWithdraw(_tokenId).div(pps); // zero division if price is zero.
    }

    /* actions */
    function _collectAugurFunds(uint256 _tokenId) public {
        // determine patronage to pay
        if (state[_tokenId] == ownedState.Owned) {
            uint256 _collection = augurFundsOwed(_tokenId);
            
            // should foreclose and stake stewardship
            if (_collection >= deposit[_tokenId]) {
                // up to when was it actually paid for?
                timeLastCollected[_tokenId] = timeLastCollected[_tokenId].add(((now.sub(timeLastCollected[_tokenId])).mul(deposit[_tokenId]).div(_collection)));
                _collection = deposit[_tokenId]; // take what's left.

                _foreclose(_tokenId);
            } else  {
                // just a normal collection
                timeLastCollected[_tokenId] = now;
                currentCollected[_tokenId] = currentCollected[_tokenId].add(_collection);
            }
            
            deposit[_tokenId] = deposit[_tokenId].sub(_collection);
            totalCollected = totalCollected.add(_collection);
            augurFund = augurFund.add(_collection);
            emit LogCollection(_collection);
        }
    }
    
    // note: anyone can deposit
    function depositWei(uint256 _tokenId) public payable collectAugurFunds(_tokenId) {
        require(state[_tokenId] != ownedState.Foreclosed, "Foreclosed");
        deposit[_tokenId] = deposit[_tokenId].add(msg.value);
    }
    
    //this function will need heavy modificaiton. the user will not actually need to pay whatever the price is
    function buy(uint256 _newPrice, uint256 _tokenId) public payable collectAugurFunds(_tokenId) {
        require(_newPrice > 0, "Price is zero");
        require(msg.value > price[_tokenId], "Not enough"); // >, coz need to have at least something for deposit
        address _currentOwner = team.ownerOf(_tokenId);

        if (state[_tokenId] == ownedState.Owned) {
            uint256 _totalToPayBack = price[_tokenId];
            if(deposit[_tokenId] > 0) {
                _totalToPayBack = _totalToPayBack.add(deposit[_tokenId]);
            }  
    
            // pay previous owner their price + deposit back.
            address payable _payableCurrentOwner = address(uint160(_currentOwner));
            _payableCurrentOwner.transfer(_totalToPayBack);
        } else if(state[_tokenId] == ownedState.Foreclosed) {
            state[_tokenId] = ownedState.Owned;
            timeLastCollected[_tokenId] = now;
        }
        
        deposit[_tokenId] = msg.value.sub(price[_tokenId]);
        transferTokenTo(_currentOwner, msg.sender, _newPrice, _tokenId);
        emit LogBuy(msg.sender, _newPrice);
    }

    function changePrice(uint256 _newPrice, uint256 _tokenId) public onlyOwner(_tokenId) collectAugurFunds(_tokenId) {
        require(state[_tokenId] != ownedState.Foreclosed, "Foreclosed");
        require(_newPrice != 0, "Incorrect Price");
        
        price[_tokenId] = _newPrice;
        emit LogPriceChange(price[_tokenId]);
    }
    
    function withdrawDeposit(uint256 _wei, uint256 _tokenId) public onlyOwner(_tokenId) collectAugurFunds(_tokenId) returns (uint256) {
        _withdrawDeposit(_wei, _tokenId);
    }

    function withdrawAugurFunds() public {
        require(msg.sender == andrewsAddress, "Not andrew");
        andrewsAddress.transfer(augurFund);
        augurFund = 0;
    }

    function exit(uint256 _tokenId) public onlyOwner(_tokenId) collectAugurFunds(_tokenId) {
        _withdrawDeposit(deposit[_tokenId],  _tokenId);
    }

    /* internal */

    function _withdrawDeposit(uint256 _wei, uint256 _tokenId) internal {
        // note: can withdraw whole deposit, which puts it in immediate to be foreclosed state.
        require(deposit[_tokenId] >= _wei, 'Withdrawing too much');

        deposit[_tokenId] = deposit[_tokenId].sub(_wei);
        msg.sender.transfer(_wei); // msg.sender == patron

        if(deposit[_tokenId] == 0) {
            _foreclose(_tokenId);
        }
    }

    function _foreclose(uint256 _tokenId) internal {
        // become steward of artwork (aka foreclose)
        address _currentOwner = team.ownerOf(_tokenId);
        //final field is price, ie price goes to zero
        transferTokenTo(_currentOwner, address(this), 0, _tokenId);
        state[_tokenId] = ownedState.Foreclosed;
        currentCollected[_tokenId] = 0;

        emit LogForeclosure(_currentOwner);
    }

    function transferTokenTo(address _currentOwner, address _newOwner, uint256 _newPrice, uint256 _tokenId) internal {
        // note: it would also tabulate time held in stewardship by smart contract
        timeHeld[_tokenId][_currentOwner] = timeHeld[_tokenId][_currentOwner].add((timeLastCollected[_tokenId].sub(timeAcquired[_tokenId])));
        
        team.transferFrom(_currentOwner, _newOwner, _tokenId);

        price[_tokenId] = _newPrice;
        timeAcquired[_tokenId] = now;
        owners[_tokenId][_newOwner] = true;
    }
}