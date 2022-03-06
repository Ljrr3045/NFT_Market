const {ethers} = require("hardhat");

async function main() {
    let nftMarket= ""; //Contract address
    let NftMarketV2 = await ethers.getContractFactory("NFT_MarketV2");

    let nftMarketV2 = await upgrades.upgradeProxy(nftMarket, NftMarketV2);

    console.log("Proxy address is: ", nftMarketV2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});