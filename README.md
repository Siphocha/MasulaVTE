# MASULA-VTE

This is an Ethereum based blockchain voting sytem.

## Main Features
- View candidate list with vote counts
- Cast votes securely on the blockchain
- Real-time vote status tracking
- Responsive design

## Prerequisites

Once installed state this in the terminal:

```bash
npm install
````
That'll instlal all the modules needed for the project. BE AWARE:
If you install 2+ months after original date, no guarantee librbary updates wont interfere with each other.

then go to the .env and replace private key with your own wallets private key, the API with your own Alchemy API, and contract address with your ran contract address.
```
PRIVATE_CONTRACT_ADDRESS=0xYourContractAddress
ALCHEMY_API_KEY=your-alchemy-key
CONTRACT_ADDRESS=you-get-this-aft-deploying-contract
```
Then do. This will output your contract address and give you a new ABI.

```
npx hardhat run --network sepolia scripts/deploy.js
```

Put your new contract address in the .env AND in the src/app/Constant/constant.js
in that file replace the contract address with your own. THEN also replace the "abi" with your own abi. 

Where can you find your own abi? In artifacts/contracts/Procedure.sol/Procedure.json
Once done configuration with the EVM is basically done..basically.

SIGNUP FOR METAMASK AND HAVE THE BROWSER EXTENSION ALREADY READY!

Smart Contract Deployment
1. Compile Contract

```
npx hardhat compile
```

2. Deploy to Sepolia Testnet
````
npx hardhat run scripts/deploy.js --network sepolia
````

THEN YOU ARE ALL SET TO GIVE MASULA-VTE A TRY!