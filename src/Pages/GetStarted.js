import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "web3uikit";

import logo from "../Assets/logo.jpg";

import { ethers } from "ethers";
import { web3Data } from "../Recoil/web3Data";
import { useRecoilState } from "recoil";

export default function GetStarted() {
  const [web3, updateWeb3] = useRecoilState(web3Data);

  async function connectWallet() {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      // MetaMask requires requesting permission to connect users accounts
      const address = await provider.send("eth_requestAccounts", []);

      let networks = await provider.getNetwork();

      if (networks.chainId !== 5) {
        return alert("Error: Please use only the test net!");
      }

      if (address[0]) {
        // The MetaMask plugin also allows signing transactions to
        // send ether and pay to change state within the blockchain.
        // For this, you need the account signer...
        const signer = provider.getSigner();

        updateWeb3({ wallet: address[0] });
        navigate("/login");
        console.log(signer);
      } else {
        alert("Could not link any wallet.");
      }
    } catch (e) {
      console.log(e);
    }
  }
  const navigate = useNavigate();

  return (
    <div className="get_started page">
      <img src={logo} alt="logo" className="logo" />
      <div className="get_started_text header">Get Started</div>
      <div to="/login" className="btn_container">
        <Button
          radius={8}
          size="large"
          isFullWidth
          onClick={() => {
            connectWallet();
            navigate("/login");
          }}
          id="get_started_btn"
          text="Click Here To Get Started"
          theme="primary"
        />
      </div>
    </div>
  );
}
