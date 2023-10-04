// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTMarketPlaceAurora is ERC721URIStorage {
    address payable owner;

    using Counters for Counters.Counter;
    Counters.Counter private ProductID;
    // Counters.Counter private NoOfItemSold;

    uint256 ProductPrice = 0.01 ether;

    constructor() ERC721("NFTMarketPlace", "NFTM") {
        owner = payable(msg.sender);
    }

    struct ProductProperties {
        uint256 ProductId;
        string ProductURI;
        address payable owner;
        address payable seller;
        uint256 price;
        bool status;
        string ProductName;
    }
    mapping(uint256 => ProductProperties) private PRODUCTS;

    mapping(address => mapping(uint256 => bool)) public hasPaidToUnlock;

    function MintProduct(
        string memory ProductURI,
        uint256 price,
        string memory name
    ) public payable {
        require(price > 0, "Price Can't be negative");
        ProductID.increment();
        uint256 currentProductid = ProductID.current();

        _safeMint(msg.sender, currentProductid);

        _setTokenURI(currentProductid, ProductURI);

        PRODUCTS[currentProductid] = ProductProperties(
            currentProductid,
            ProductURI,
            payable(address(this)),
            payable(msg.sender),
            price,
            true,
            name
        );

        _transfer(msg.sender, address(this), currentProductid);
    }

    function PayToUnlock(uint256 Productid) public payable {
        // Ensure that the NFT exists
        require(_exists(Productid), "NFT does not exist");

        // Ensure that the NFT is currently owned by the contract
        require(
            ownerOf(Productid) == address(this),
            "NFT is not owned by the contract"
        );

        // Check if the user has already paid to unlock this NFT
        require(
            !hasPaidToUnlock[msg.sender][Productid],
            "You have already paid to unlock this NFT"
        );

        // Ensure that the payment amount matches the NFT's price
        require(
            msg.value >= PRODUCTS[Productid].price ||
                msg.value <= PRODUCTS[Productid].price,
            "Incorrect payment amount"
        );

        // Mark the NFT as unlocked for the user
        hasPaidToUnlock[msg.sender][Productid] = true;

        // Transfer the payment to the contract owner
        payable(owner).transfer(msg.value);
    }

    function SaleProduct(uint Productid) public payable {
        // Check if the user has paid to unlock the NFT
        require(
            hasPaidToUnlock[msg.sender][Productid],
            "You must pay to unlock this NFT"
        );

        uint price = PRODUCTS[Productid].price;
        address seller = PRODUCTS[Productid].seller;
        PRODUCTS[Productid].status = false;
        PRODUCTS[Productid].seller = payable(msg.sender);
        PRODUCTS[Productid].owner = payable(msg.sender);
        _transfer(address(this), msg.sender, Productid);
        approve(address(this), Productid);
        payable(seller).transfer(price);
    }

    function Resale(uint productid, uint256 price) public payable {
        PRODUCTS[productid].status = true;
        PRODUCTS[productid].owner = payable(address(this));
        PRODUCTS[productid].seller = payable(msg.sender);
        PRODUCTS[productid].price = price;
        _transfer(msg.sender, address(this), productid);
    }

    function BuyProducts(uint256[] memory productIds) public payable {
        for (uint i = 0; i < productIds.length; i++) {
            SaleProduct(productIds[i]);
        }
        payable(owner).transfer(msg.value);
    }

    function GetAllProducts() public view returns (ProductProperties[] memory) {
        uint TotalProducts = ProductID.current();
        ProductProperties[] memory AllProductsArray = new ProductProperties[](
            TotalProducts
        );

        uint CIndex = 0;

        for (uint i = 0; i < TotalProducts; i++) {
            uint CId = i + 1;
            ProductProperties storage Item = PRODUCTS[CId];
            AllProductsArray[CIndex] = Item;
            CIndex = CIndex + 1;
        }
        return AllProductsArray;
    }

    function getMyProducts() public view returns (ProductProperties[] memory) {
        uint TotalProducts = ProductID.current();
        uint UserProductCount;
        uint CurrentIndex = 0;
        for (uint i = 0; i < TotalProducts; i++) {
            if (
                PRODUCTS[i + 1].owner == msg.sender ||
                PRODUCTS[i + 1].seller == msg.sender
            ) {
                UserProductCount = UserProductCount + 1;
            }
        }
        ProductProperties[] memory UserProducts = new ProductProperties[](
            UserProductCount
        );
        for (uint i = 0; i < UserProductCount; i++) {
            if (
                PRODUCTS[i + 1].owner == msg.sender ||
                PRODUCTS[i + 1].seller == msg.sender
            ) {
                uint CId = i + 1;
                ProductProperties storage CItem = PRODUCTS[CId];
                UserProducts[CurrentIndex] = CItem;
                CurrentIndex = CurrentIndex + 1;
            }
        }
        return UserProducts;
    }
}
