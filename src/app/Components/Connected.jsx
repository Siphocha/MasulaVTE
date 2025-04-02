import React, { useState } from "react";
import PropTypes from "prop-types";

//YESSSS first we list out what is required to even count as "connected"
const Connected = (props) => {
    const {
        account,
        remainingTime,
        showButton,
        voteFunction,
        candidates = []
    } = props;
    //Treat them as props for versatility purposes


    const [number, setNumber] = useState("");
    const [voteStatus, setVoteStatus] = useState(null); // 'success', 'error', null
    const [voteMessage, setVoteMessage] = useState("");

    //When the user changes the number they vote for
    const handleNumberChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            setNumber(value);
        }
    };

    //handle what they voted for
    const handleVote = async () => {
        if (!number) {
            setVoteStatus("error");
            setVoteMessage("Please enter a valid candidate number.");
            return;
        }

        setVoteStatus("loading");
        setVoteMessage("Voting in progress...");

        try {
            await voteFunction(number);
            setVoteStatus("success");
            setVoteMessage("Vote submitted successfully!");
        } catch (error) {
            console.error("Vote failed:", error);
            setVoteStatus("error");
            setVoteMessage("Vote failed. Please try again.");
        }
    };

    //Main structure of outline once fully connected. This is essenially the page structure in and of itself.
    return (
        <div className="connected-container">
            <h1 className="connected-header">You're Connected to Metamask</h1>
            <p className="connected-account">Account: {account || "Not available"}</p>
            <p className="connected-account">Time Remaining: {remainingTime || "Loading..."}</p>

            {showButton ? (
                <p className="connected-account">You've already voted!</p>
            ) : (
                <div className="vote-section">
                    <input
                        type="number"
                        min="0"
                        placeholder="Enter Candidate Number"
                        value={number}
                        onChange={handleNumberChange}
                        className={`input-field ${voteStatus === 'error' ? 'error-input' : ''}`}
                    />
                    <br />
                    <button
                        className="login-button"
                        onClick={handleVote}
                        disabled={voteStatus === "loading"}
                    >
                        {voteStatus === "loading" ? "Voting..." : "Vote"}
                    </button>
                    {voteStatus && (
                        <p className={`vote-message ${voteStatus}`}>
                            {voteMessage}
                        </p>
                    )}
                </div>
            )}

            {candidates.length > 0 ? (
                <table className="candidates-table">
                    <thead>
                    <tr>
                        <th>Index</th>
                        <th>Candidate</th>
                        <th>Votes</th>
                    </tr>
                    </thead>
                    <tbody>
                    {candidates.map((candidate) => (
                        <tr key={candidate.index}>
                            <td>{candidate.index}</td>
                            <td>{candidate.name || "Unknown"}</td>
                            <td>{candidate.voteCount || 0}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-candidates">No candidates available</p>
            )}
        </div>
    );
};

//Using the stated props whilst they are connected. Had to re-declare in their prop state.
Connected.propTypes = {
    account: PropTypes.string,
    remainingTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showButton: PropTypes.bool,
    voteFunction: PropTypes.func.isRequired,
    candidates: PropTypes.arrayOf(
        PropTypes.shape({
            index: PropTypes.number.isRequired,
            name: PropTypes.string,
            voteCount: PropTypes.number,
        })
    ),
};

Connected.defaultProps = {
    candidates: [],
};

export default Connected;