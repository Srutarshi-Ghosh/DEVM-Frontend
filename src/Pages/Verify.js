import React, { useEffect, useState } from "react";
import { Button, Avatar, useNotification } from "web3uikit";
import { voterData } from "../Recoil/voterData";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { web3Data } from "../Recoil/web3Data";
import { useRecoilState } from "recoil";
import { checkVerified } from "./../Contract/votingContract";

import { ethers } from "ethers";

import { votingContract } from "./../Contract/votingContract";

export default function Verify() {
  const userData = useRecoilValue(voterData);
  const [web3, updateWeb3] = useRecoilState(web3Data);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useNotification();

  useEffect(() => {
    console.log("Setting up listener");
    //

    votingContract.on("voterVerified", (hash, address, verifiedBy) => {
      console.log("Voter event:");
      console.log(web3.wallet);
      console.log(address);
      console.log(address.toString());
      console.log(web3.wallet);

      // debugger;

      if (address.toLowerCase() == web3.wallet.toString()) {
        // alert("Got event");
        navigate("/vote");
      }
    });

    return () => {
      console.log("Unhooking");
      votingContract.removeAllListeners();
    };
  }, [web3.wallet]);

  const handleNewNotification = (type, title, message) => {
    dispatch({
      type,
      message,
      title,
      position: "topR",
    });
  };

  function format(s) {
    return s?.toString().replace(/\d{4}(?=.)/g, "$& ");
  }

  let verify = () => {
    axios
      .get(`https://dvote.dying.tech/user-request/${userData?.id}`)
      .then(async (response) => {
        let blockChainVerified = await checkVerified(web3.wallet);

        if (response.data.err) {
          await axios.post(`https://dvote.dying.tech/request/${userData?.id}`, {
            wallet: web3.wallet,
          });
          return handleNewNotification(
            "success",
            "Request Sent",
            `Please wait you are being verified. Kindly respond to all questions asked by election officials.`
          );
        }

        if (!response.data.pending) {
          console.log(blockChainVerified);

          if (!blockChainVerified[1]) {
            return handleNewNotification(
              "warning",
              "Please Wait",
              `You have been verified, waiting for the tx confirmations on the block chain.`
            );
          }

          if (blockChainVerified[1].voted) {
            setTimeout(() => {
              setLoading(false);
              handleNewNotification(
                "danger",
                "Voted",
                `You have already voted.`
              );
            }, 5000);
          } else {
            navigate("/vote");
          }
        } else {
          setTimeout(() => {
            // setLoading(false);

            //Setup proper listeners here

            handleNewNotification(
              "warning",
              "Wait",
              `Please wait you are being verified. Kindly respond to all questions asked by election officials.`
            );
          }, 5000);
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {});
  };

  return (
    <div className="page verify">
      <div className="header">Verification</div>
      <div className="query">{web3.wallet}</div>
      <br />
      <div className="candidate_details">
        <div className="flex center">
          <Avatar size={40} theme="image" image={userData?.picture} isRounded />
        </div>

        <div className="space"></div>

        <div className="row">
          <div className="query">Name:</div>
          <div className="value">{userData?.fullName}</div>
        </div>

        <div className="space"></div>

        <div className="row">
          <div className="query">Father Name:</div>
          <div className="value">{userData?.fatherName}</div>
        </div>

        <div className="space"></div>

        <div className="row">
          <div className="query">DOB:</div>
          <div className="value">{userData?.dob}</div>
        </div>

        <div className="space"></div>

        <div className="row">
          <div className="query">Address: </div>
          <div className="value">{userData?.fullAddress}</div>
        </div>

        <div className="space"></div>

        <div className="row">
          <div className="query">Aadhar Number:</div>
          <div className="value">{format(userData?.aadhar)}</div>
        </div>

        <div className="space"></div>

        <div className="row">
          <div className="query">Voter ID:</div>
          <div className="value">{format(userData?.id)}</div>
        </div>

        <div className="space"></div>

        <div className="row">
          <div className="query">Verified By:</div>
          <div className="value">Verifier</div>
        </div>
      </div>

      <div to="/vote" className="btn_container">
        <Button
          radius={8}
          size="large"
          isFullWidth
          id="get_started_btn"
          text="Verify"
          loadingText="Verifying"
          theme="primary"
          isLoading={loading}
          onClick={() => {
            setLoading(true);
            verify();
          }}
        />
      </div>
    </div>
  );
}
