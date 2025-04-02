//Javascript Function actually holding the complete object that is "Votes/Voting"
const hre = require("hardhat")

async function main(){
    //Literally calling the data from the original smart contract
    const Procedure = await hre.ethers.getContractFactory("Procedure")

    //starts deployment and returns contract object
    //The end numeric is the contract is open for "100 seconds" so you got 60 seconds to vote. UPDATE this has been changed in the smart contract.
    const Procedure_ = await Procedure.deploy(["Sipho", "Fred", "Sheriff", "Brian"], 100);

    //wait for deployment then get the address
    await Procedure_.waitForDeployment();

    console.log("Contract address: ", await Procedure_.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});