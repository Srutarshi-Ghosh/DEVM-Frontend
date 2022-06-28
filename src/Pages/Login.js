import React, { useEffect, useState } from "react";
import { Button, Input, useNotification } from "web3uikit";
import { useRecoilState, useRecoilValue } from "recoil";
import { voterData } from "../Recoil/voterData";
import { web3Data } from "../Recoil/web3Data";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [voterID, setVoterID] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useRecoilState(voterData);
  const web3 = useRecoilValue(web3Data);
  const navigate = useNavigate();

  const dispatch = useNotification();

  const handleNewNotification = (type, title, message) => {
    dispatch({
      type,
      message,
      title,
      position: "topR",
    });
  };

  let getUserData = () => {
    axios
      .get(`https://dvote.dying.tech/voter/${voterID}`)
      .then((response) => {
        setUserData(response.data);
        if (response.data.err) {
          handleNewNotification("error", "Error", `Voter not found.`);
        } else {
          navigate("/verify");
        }
      })
      .catch((e) => {
        console.log(e);
        handleNewNotification("error", "Error", `Voter not found.`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="page login">
      <div className="header">Enter your voter ID </div>
      <p>
        <b>Linked Wallet</b> ({web3.wallet})
      </p>
      <br />
      <div className="input_container">
        <Input
          type="text"
          prefixIcon={"user"}
          width
          value={voterID}
          onChange={(e) => {
            setVoterID(e.target.value);
          }}
          errorMessage={"Invalid Voter ID"}
          placeholder="Voter ID"
        />
      </div>
      <div className="large_btn_container">
        <Button
          radius={8}
          size="large"
          isFullWidth
          id="get_started_btn"
          text="Submit"
          isLoading={loading}
          loadingText="Verifying"
          theme="primary"
          onClick={async () => {
            setLoading(true);
            getUserData();
          }}
        />
      </div>
    </div>
  );
}
