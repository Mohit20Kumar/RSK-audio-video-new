import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import "./Styles.css";

const Mint = (props) => {
  const [fileLink, setFileLink] = useState();
  const [file, setFile] = useState(false);
  const [uploadStatus, setUploadStatus] = useState();
  const [MintStatus, setMintStatus] = useState();
  const [fileType, setFileType] = useState(""); // Added to track file type (image or video)

  useEffect(() => {
    const handler = async (e) => {
      try {
        setUploadStatus("Please wait...");
        const formData = new FormData();
        formData.append("file", file);
        const redFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: "4ef235c6eb6c0d0cfe3f",
            pinata_secret_api_key:
              "591266b7935a50634f2825dd0eaf8ccc83b0ca6037dc674a504adaed3883e315",
            "Content-Type": "multipart/form-data",
          },
        });
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const supportedVideoFormats = ["mp4"]; // Add more video formats if needed

        // Determine file type
        if (supportedVideoFormats.includes(fileExtension)) {
          setFileType("video");
        } else {
          setFileType("unknown");
        }

        const ImgHash = `https://ipfs.io/ipfs/${redFile.data.IpfsHash}`;
        setFileLink(ImgHash);
        setUploadStatus();
      } catch (e) {
        alert("Unable to upload. Please try again.");
        console.log(e);
      }
    };

    file && handler();
  }, [file]);

  const onchangeHandler = async (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(e.target.files[0]);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const price = document.querySelector("#price").value;
    const nftname = document.querySelector("#nftname").value;
    try {
      const amount = { value: ethers.utils.parseEther("0.00001") };
      const transaction = await props.contract.MintProduct(
        fileLink,
        price,
        nftname,
        amount
      );
      setMintStatus("Please wait...");
      await transaction.wait();
      setMintStatus("");
      alert("Uploaded successfully");
      window.location.reload();
    } catch (e) {
      setMintStatus("");
      console.log(e);
      alert("Failed to upload. Please try again.");
    }
  };

  return props.trigger ? (
    <div className='upload-body'>
      <br />
      <br />
      <center>
        <div className='upload-form'>
          <center>
            <b>
              <h3>UPLOAD NFT</h3>
            </b>
            <br />
            {fileType === "video" ? (
              <video width='200' height='200'>
                <source src={fileLink} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p>File</p>
            )}
            <form className='form-group' onSubmit={submitHandler}>
              <input
                type='text'
                value={props.account}
                className='form-control'
              />
              <br />
              <input
                type='text'
                placeholder='NFT Name'
                className='form-control'
                id='nftname'
              />
              <br />
              <input
                type='text'
                placeholder='Price (Wei)'
                className='form-control'
                id='price'
              />
              <br />
              <input
                type='file'
                onChange={onchangeHandler}
                id='fl'
                accept='.mp4'
                className='form-control'
              />
              <br />
              <p>{uploadStatus}</p>
              <input type='submit' value={"List"} class='btn btn-primary' />
            </form>
            <span>{MintStatus}</span>
            <br />
            <center>
              <button
                onClick={() => props.setTrigger(false)}
                class='btn btn-danger'>
                Live NFT
              </button>
            </center>
          </center>
        </div>
      </center>
    </div>
  ) : (
    ""
  );
};

export default Mint;
