const {ethers} = require("hardhat");

async function main() {
    let NFT_Market= await ethers.getContractFactory("NFT_Market");

    let nftMarket = await upgrades.deployProxy(NFT_Market, {initializer: "cont"});

    console.log("Proxy address is: ",nftMarket.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
