'use client';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Finished from './Components/Finished';
import Connected from './Components/Connected';

//very careful here on useState declarations. Accidentally making and setting canVote as true made me unable to vote...ironic
export default function Home() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVote, setCanVote] = useState(false);

  // Initialize provider once
  const initProvider = useCallback(async () => {
    if (window.ethereum) {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
        return newProvider;
      } catch (error) {
        console.error("Provider initialization failed:", error);
      }
    }
    return null;
  }, []);

  // Get contract so we can actually start this
  const getContract = useCallback(async (provider) => {
    if (!provider) return null;
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractAbi, signer);
  }, []);

  // Connect to meta mask to allow the user to eventually login
  const connectToMetamask = useCallback(async () => {
    try {
      const provider = await initProvider();
      if (!provider) throw new Error("No Ethereum provider found");

      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setIsConnected(true);
      console.log("Metamask Connected:", address);

      // Refreshing
      await Promise.all([
        getCandidates(provider),
        earlyBird(provider),
        getCurrentStatus(provider),
        checkVoteStatus(provider)
      ]);
    } catch (error) {
      console.error("Connection error:", error);
    }
  }, [initProvider]);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      checkVoteStatus();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }, [account]);

  //INcase stuff's still not working. throw these out.
  const vote = useCallback(async (candidateNumber) => {  // Accept parameter directly
    try {
      const contract = await getContract(provider);
      if (!contract) throw new Error("Contract not initialized");

      // Convert to number and validate
      const num = Number(candidateNumber);
      if (isNaN(num) || num < 0) {
        throw new Error("Invalid candidate number");
      }

      const tx = await contract.vote(num);  // Pass the number directly
      await tx.wait();

      // Refresh data
      await checkVoteStatus(provider);
      await getCandidates(provider);
    } catch (error) {
      console.error("Voting failed:", {
        error,
        input: candidateNumber,
        account
      });
      alert(`Voting failed: ${error.reason || error.message}`);
    }
  }, [provider, getContract]);

  // Get the actual candidates
  const getCandidates = useCallback(async (provider) => {
    try {
      const contract = await getContract(provider);
      if (!contract) return;

      const candidatesList = await contract.gettingAllVotes();
      console.log("Raw contract response:", candidatesList); // Debug log

      setCandidates(candidatesList.map((candidate, index) => {

        // Handling possible format types
        const voteData = candidate.voterCount ?? candidate.voteCount ?? candidate[1];

        return {
          index,
          name: candidate.name ?? candidate[0] ?? "Unknown",
          voteCount: typeof voteData === 'number'
              ? voteData
              : voteData?.toNumber?.() || 0
        };
      }));

    } catch (error) {
      console.error("Failed to fetch candidates:", {
        error,
        rawError: JSON.stringify(error),
        contractAddress,
        abi: contractAbi
      });
      setCandidates([]);
    }
  }, [getContract]);

  const checkVoteStatus = useCallback(async (provider) => {
    try {
      const contract = await getContract(provider);
      if (!contract || !account) return;

      const voteStatus = await contract.voters(account);
      console.log("Raw vote status from contract:", voteStatus);

      // Invert logic if needed - some contracts return true if you CAN vote
      setCanVote(!voteStatus); // Or just voteStatus depending on contract logic
    } catch (error) {
      console.error("Vote status check failed:", error);
      setCanVote(false); // Fail-safe to prevent voting if check fails
    }
  }, [getContract, account]);

  const getCurrentStatus = useCallback(async (provider) => {
    try {
      const contract = await getContract(provider);
      if (!contract) return;

      const status = await contract.getVoteStatuses();
      setVotingStatus(status);
    } catch (error) {
      console.error("Failed to get voting status:", error);
    }
  }, [getContract]);

  const earlyBird = useCallback(async (provider) => {
    try {
      const contract = await getContract(provider);
      if (!contract) return;

      const time = await contract.earlyBird();
      setRemainingTime(parseInt(time, 16));
    } catch (error) {
      console.error("Failed to get remaining time:", error);
    }
  }, [getContract]);

  // Effects
  useEffect(() => {
    const init = async () => {
      const provider = await initProvider();
      if (provider) {
        await Promise.all([
          getCandidates(provider),
          earlyBird(provider),
          getCurrentStatus(provider)
        ]);
      }
    };

    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [initProvider, getCandidates, earlyBird, getCurrentStatus, handleAccountsChanged]);

  // Handlers
  const handleNumberChange = (value) => {
    // Only allow numbers or empty string
    if (value === "" || /^\d*$/.test(value)) {
      setNumber(value);
    }
  };

  return (
      <div className="App">
        {votingStatus ? (
            isConnected ? (
                <Connected
                    account={account}
                    candidates={candidates}
                    remainingTime={remainingTime}
                    number={number}
                    handleNumberChange={handleNumberChange}
                    voteFunction={vote}
                    showButton={canVote}
                />
            ) : (
                <Login connectWallet={connectToMetamask} />
            )
        ) : (
            <Finished />
        )}
      </div>
  );

  const debugVoterStatus = async () => {
    const contract = await getContract(provider);
    const status = await contract.voters(account);
    console.log("Current vote status for account:", {
      account,
      hasVoted: status,
      currentTime: Math.floor(Date.now() / 1000),
      votingStatus: await contract.getVoteStatuses()
    });
  };
}