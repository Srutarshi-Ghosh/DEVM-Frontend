import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Modal,
  Row,
  Table,
  Input,
  Typography,
  Stepper,
  useNotification,
  Icon,
} from "web3uikit";
import { useRecoilValue } from "recoil";
import { voterData } from "../Recoil/voterData";
import axios from "axios";
import { useRecoilState } from "recoil";
import { candidateData } from "../Recoil/candidateData";

import { totalVotes } from "../Contract/votingContract";

import { ethers } from "ethers";

import { votingContract } from "./../Contract/votingContract";

import { JSEncrypt } from "jsencrypt";

import { Web3Storage } from "web3.storage";
import { Link } from "react-router-dom";

export default function VotingPage() {
  const [totalVotesCount, updateTVC] = useState(1);
  const [step, updateStep] = useState(1);
  const [voteCID, updateCID] = useState("");

  const [password, updatePassword] = useState("");

  const STORAGE_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGEzQmIyOGJjNEY2RjI5YjcwM2JGMDc1YzhEZDYxYkE5OThiQjkxZjUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTMzNDE0OTQ0MzMsIm5hbWUiOiJTaXRlIn0.yoKmGGWDrAnn-LwX2sANxD_zCA1VxEhVkugEGQDwqqI";

  useEffect(() => {
    (async () => {
      updateTVC(await totalVotes());
    })();
  }, []);

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);


  const [data, setData] = useState([]);

  const dispatch = useNotification();
  const [userData, setUserData] = useRecoilState(voterData);

  let getCandidates = () => {
    axios
      .get(`https://dvote.dying.tech/candidates`)
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    getCandidates();
  }, []);


  const handleNewNotification = (type, title, message) => {
    dispatch({
      type,
      message,
      title,
      position: "topR",
    });
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState("");

  async function uploadVoteIPFS() {
    if (password && selected.code) {
      let resp = await axios.post("https://dvote.dying.tech/token", {
        payload: userData.id + "|" + password,
      });

      console.log(resp.data.body);
      let PUBLIC_KEY = await votingContract.systemPublicKey();

      //Here use the public_key from the contract when its fixed.
      let encrypt = new JSEncrypt();
      encrypt.setPublicKey(PUBLIC_KEY);

      let encText = encrypt.encrypt(`${selected.code}|${resp.data.body}`);

      console.log(encText);

      const file = new File([encText], "hello.txt", {
        type: "text/plain",
      });

      const storage = new Web3Storage({ token: STORAGE_TOKEN });
      const cid = await storage.put([file], { wrapWithDirectory: false });
      console.log(cid);

      updateCID(cid);
      setUploadLoading(false);

      // alert(password, selected.code);
    }
  }

  async function signVote() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const address = await provider.send("eth_requestAccounts", []);

    let networks = await provider.getNetwork();
    const signer = provider.getSigner();

    const votingContractSign = votingContract.connect(signer);

    try {
      let tx = await votingContractSign.castVote(voteCID);
      console.log(tx);
      window.open(`https://goerli.etherscan.io/tx/${tx.hash}`, "_blank");
      //DONT LET THEM VOTE ANYMORE;
      handleClose();
    } catch (e) {
      console.log(e);
      handleNewNotification("warning", "Error", e.message);
    }
  }

  let handleClose = () => {
    setSelected("");
    setModalVisible(false);
  };

  return (
    <div className="page voting">
      <Modal
        onCancel={() => {
          handleClose();
        }}
        onCloseButtonPressed={() => {
          handleClose();
        }}
        onOk={function noRefCheck() {}}
        width={"50%"}
        hasFooter={false}
        title={"Cast DEVM Vote"}
        isCentered
        isVisible={modalVisible}
      >
        <Stepper
          step={1}
          hasNavButtons={false}
          completeTitle="Completed Vote"
          completeMessage="Your vote has been cast you may now logout!"
          stepData={[
            {
              content: (
                <>
                  <div
                    style={{
                      fontWeight: 600,
                      marginRight: "1em",
                      textAlign: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    Confirm to Vote{" "}
                    <u
                      style={{
                        color: "#000",
                      }}
                    >
                      {selected.name}
                    </u>
                    ?
                    <div className="center">
                      <Button
                        id="next"
                        size="small"
                        text="Confirm"
                        theme="primary"
                        type="button"
                      />
                    </div>
                  </div>
                </>
              ),
              title: "Confirm Selection",
            },
            {
              content: (
                <>
                  <Typography variant="body16">
                    You will be able to verify your vote post-election with the
                    secret key.
                  </Typography>
                  <div style={{ marginBottom: "15px" }} />

                  <center>
                    <Input
                      value={password}
                      onChange={(e) => updatePassword(e.target.value)}
                    />
                  </center>
                  <div className="center">
                    <Button
                      disabled={password.length == 0}
                      id="next"
                      size="small"
                      text="Confirm"
                      theme="primary"
                      type="button"
                    />
                  </div>
                </>
              ),
              title: "Select Secret Key",
            },
            {
              content: (
                <>
                  <Typography variant="body16">
                    Your encrypted Vote is being uploaded to IPFS.
                  </Typography>
                  <div style={{ marginBottom: "15px" }} />
                  <p
                    style={{
                      lineBreak: "anywhere",
                    }}
                  >
                    {voteCID ? `https://${voteCID}.ipfs.dweb.link/` : ""}
                  </p>
                  <div className="center">
                    <Button
                      onClick={() => {
                        setUploadLoading(true);
                        uploadVoteIPFS();
                      }}
                      disabled={voteCID.length > 0}
                      size="small"
                      text="Upload"
                      theme="primary"
                      type="button"
                      isLoading={uploadLoading}
                      loadingText={"Uploading..."}
                    />

                    <Button
                      disabled={voteCID.length == 0}
                      id="next"
                      size="small"
                      text="Next"
                      theme="primary"
                      type="button"
                    />
                  </div>
                </>
              ),
              title: "Upload Encrypted Vote",
            },
            {
              content: (
                <>
                  <Typography variant="body16">
                    Sign the vote with your wallet to cast your vote.
                  </Typography>
                  <div style={{ marginBottom: "15px" }} />
                  <div className="center">
                    <Button
                      onClick={() => {
                        signVote();
                      }}
                      size="small"
                      text="Confirm"
                      theme="primary"
                      type="button"
                    />
                  </div>
                </>
              ),
              title: "Sign Vote",
            },
          ]}
        />
        <br />
      </Modal>

      <div className="header_section">
        <Link
          to="/"
          onClick={() => {
            setUserData({});
          }}
          className="flex logout"
        >
          <Icon fill="#000000" size={24} svg="logOut" />
          Logout
        </Link>
        <div className="sm_header">Name of Vote</div>
        <div>
          <Row justifyItems="flex-end">
            <Avatar isRounded theme="image" image={userData?.picture} />
            <div>
              <span>{userData?.fullName}</span>
              <div>{userData?.id}</div>
            </div>

            <div>
              <div>Voters</div>
              <div className="verifier">{totalVotesCount}</div>
            </div>
          </Row>
        </div>
      </div>
      <div className="content">
        <div className="header text_center my-2">Candidates</div>

        {data.length > 0 ? 
        <Table
          isLoading={loading}
          columnsConfig="100px 1fr 2fr 300px"
          header={["", "Party Name", "Leader Name", "Action"]}
          data={data.map((e) => [
            <Avatar isRounded theme="image" image={e?.img} />,
            e?.party,
            e?.name,
            <div
              style={{
                width: "100%",
                maxWidth: "10rem",
              }}
            >
              <Button
                radius={8}
                size="large"
                isFullWidth
                id="get_started_btn"
                text="Vote"
                loadingText="Voting"
                theme="primary"
                onClick={() => {
                  setModalVisible(true);
                  setSelected({ name: e?.name, code: e?.code });
                }}
              />
            </div>,
          ])}
          pageSize={5}
          noPagination
          alignCellItems="center"
        /> : "" }
      </div>
    </div>
  );
}
