// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

//Contract for the voting procedure
contract Procedure {
    struct Candidate{
        string name;
        uint256 voterCount;
    }

    //Candidates being listed out
    Candidate[] public candidates;
    address owner;
    mapping(address => bool) public voters;

    //uint256 because amount of votes both at start and end are unknown.
    uint256 public startVote;
    uint256 public endVote;

    //When contract deployed then candidate details can be pushed onto it and registration can take place.
    constructor(string[] memory _candidateNames, uint256 _minutesLasted){
        for (uint256 i = 0; i < _candidateNames.length; i++){
            candidates.push(Candidate({
                name: _candidateNames[i],
                voterCount: 0
            }));
        }
        owner = msg.sender;
        startVote = block.timestamp;
        endVote = block.timestamp + (_minutesLasted * 500000);
    }

    //Modifier lets me reuse the msg.sender on owner multiple times.
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }

    function addingCandidate(string memory _name) public onlyOwner{
        candidates.push(Candidate({
                name: _name,
                voterCount: 0
        }));
    }

    //Function for if you've voted or not
    function vote(uint256 _voteDone) public{
        require(!voters[msg.sender], "You're doing voting. Shame.");
        require(_voteDone < candidates.length, "Not a valid candidate.");

        candidates[_voteDone].voterCount++;
        voters[msg.sender] = true;
    }

    //Aggregate all votes
    function gettingAllVotes() public view returns (Candidate[] memory){
        return candidates;
    }

    //statuses on the blockchian if they had their own block created
    function getVoteStatuses() public view returns(bool){
        return (block.timestamp >= startVote && block.timestamp < endVote);
    }

    //Voting hasn't initiated why are you tweeking? this stops early voting
    function earlyBird() public view returns(uint256) {
        require(block.timestamp >= startVote, "Voting hasn't started");

        if(block.timestamp >= endVote){
            return 0;
        }
        return endVote - block.timestamp;
    }
}