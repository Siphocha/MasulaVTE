import React from "react";
//This is structure just for the login page.
const Login = (props) => {
    return (
        <div className="login-container">
            <h1 className="welcome-message">Welcome to MASULA-VTE!</h1>
            <h2 className="welcome-message">Your Decentralised Voting System</h2>
            <button className="login-button" onClick = {props.connectWallet}>Login w/Metamask</button>
        </div>
    )
}

export default Login;