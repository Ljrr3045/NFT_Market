const {ethers} = require("hardhat");

async function main() {

  const ETH = await ethers.getContractFactory("Eth_Usd");
  const eth = await ETH.deploy();
  const DAI = await ethers.getContractFactory("Dai_Usd");
  const dai = await DAI.deploy();
  const LINK = await ethers.getContractFactory("Link_Usd");
  const link = await LINK.deploy();

  await link.constLink();
  await eth.constEth();
  await dai.constDai();

  let Eth = await eth.priceInTokenEth();
  let Dai = await dai.priceInTokenDai();
  let Link = await link.priceInTokenLink();

  console.log("Price ETH is:", Eth.toNumber());
  console.log("Price DAI is:", Dai.toNumber());
  console.log("Price LINK is:", Link.toNumber());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
