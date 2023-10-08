import React, { useEffect, useState } from "react";
import "./Styles.css";
import Cart from "./Cart";
import Mint from "./Mint";
import MyProducts from "./MyProducts";
import Web3 from "web3";
import { ethers } from "ethers";
import ReactPlayer from "react-player";
import Plyr from "plyr-react";

const Home = (props) => {
  const [unlockStatus, setUnlockStatus] = useState({});
  const [items, setItems] = useState({});
  const [total, setTotal] = useState(0);
  const [pop, setPop] = useState(false);
  const [pop2, setPop2] = useState(false);
  const [pop3, setPop3] = useState(false);
  const [product, setProduct] = useState({});
  const [ProductPrices, setProductPrices] = useState({});
  const getFileType = async (url) => {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = await response.headers.get("content-type");
    return contentType;
  };
  useEffect(() => {
    const getProductValues = async () => {
      try {
        const data = await props.contract.GetAllProducts();
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          const ProductID = data[i][0].toString();
          const isUnlocked = await isNFTUnlocked(ProductID);

          setUnlockStatus((prevUnlockStatus) => ({
            ...prevUnlockStatus,
            [ProductID]: isUnlocked,
          }));
          const videoUrl = data[i][1];
          const seller = data[i][3];
          const price = data[i][4].toString();
          const status = data[i][5];
          const nftname = data[i][6].toString();
          const contentType = await getFileType(videoUrl);
          setProduct((prevProduct) => ({
            ...prevProduct,
            [ProductID]: [
              nftname,
              videoUrl,
              price,
              status,
              seller,
              contentType,
            ],
          }));
          // console.log(product);
        }
      } catch (e) {
        console.log(e);
      }
    };
    props.contract && getProductValues();
    console.log(total);
    console.log();
    console.log(props.contract);
  }, [props.contract, total]);
  const handleBuyClick = (nftname, price, videoUrl, ProductID, contentType) => {
    setItems((prevCart) => ({
      ...prevCart,
      [ProductID]: [nftname, videoUrl, price, contentType],
    }));
    setTotal(total + parseInt(price));
  };
  const handleUnlockClick = async (ProductID) => {
    try {
      // Check if the user has already unlocked this NFT
      // if (product[ProductID][3] === true) {
      //   alert("You have already unlocked this NFT");
      //   return;
      // }

      // Set a fixed price of 0.00001 Ether to unlock the NFT
      const unlockPrice = "0.00001";

      // Make a call to your smart contract to pay and unlock the NFT
      const tx = await props.contract.PayToUnlock(ProductID, {
        value: Web3.utils.toWei(unlockPrice, "ether"), // Convert Ether to Wei
      });
      await tx.wait();
      // console.log("tx", tx);
      // Update the state to mark the NFT as unlocked
      setProduct((prevProduct) => ({
        ...prevProduct,
        [ProductID]: [
          prevProduct[ProductID][0], // NFT name
          prevProduct[ProductID][1], // Video URL
          prevProduct[ProductID][2], // Price
          true, // Mark as unlocked
          prevProduct[ProductID][4], // Seller
          prevProduct[ProductID][5], // ContentType
        ],
      }));

      alert("NFT unlocked!, please reload");
    } catch (error) {
      console.error("Error unlocking NFT:", error);
      alert("Error unlocking NFT. Please try again.");
    }
  };

  async function isNFTUnlocked(ProductID) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const unlockStatus = await props.contract.isNFTUnlocked(
        ProductID,
        signer.getAddress()
      );
      console.log("unlock status :", unlockStatus);
      return unlockStatus;
    } catch (error) {
      console.error("Error checking unlock status:", error);
      return false; // Handle error
    }
  }

  function isUnlocked(ProductID) {
    isNFTUnlocked(ProductID);
  }

  return (
    <div>
      <div className='header'>
        <a href='/' className='logo'>
          AUDIO/VIDEO NFT MARKETPLACE
        </a>

        <div className='header-right'>
          <a
            onClick={() => {
              setPop3(true);
              setPop(false);
              setPop2(false);
            }}>
            MY NFTS
          </a>
          <a
            onClick={() => {
              setPop2(true);
              setPop(false);
              setPop3(false);
            }}>
            MINT NFT
          </a>
          <a
            onClick={() => {
              setPop(true);
              setPop2(false);
              setPop3(false);
            }}>
            CART
          </a>
        </div>
      </div>
      <Mint
        trigger={pop2}
        setTrigger={setPop2}
        contract={props.contract}
        account={props.account}></Mint>
      <MyProducts
        trigger={pop3}
        setTrigger={setPop3}
        contract={props.contract}
        account={props.account}></MyProducts>
      <Cart
        trigger={pop}
        setTrigger={setPop}
        cartItems={items}
        Products={product}
        items={items}
        setProducts={setProduct}
        setItem={setItems}
        TotalPayment={total}
        setTotalPayment={setTotal}
        contract={props.contract}
        account={props.account}></Cart>
      {pop === false && pop2 == false && pop3 == false ? (
        <div className='outer'>
          <center>
            <h5 className='connected'>CONNECTED TO: {props.account}</h5>
          </center>
          <br />
          <h3>LISTED FOR SALE</h3>
          <div className='inner'>
            {Object.entries(product).map(
              (
                [
                  ProductID,
                  [nftname, videoUrl, price, status, seller, contentType],
                ],
                index
              ) =>
                status == false ? (
                  ""
                ) : (
                  <>
                    <div className='Productitem' key={index}>
                      {/* {console.log("Type : ", contentType)} */}
                      <div className='productbody'>
                        {console.log("vid:", videoUrl)}
                        {unlockStatus[ProductID] ? (
                          // NFT is unlocked, render video/audio player
                          contentType.charAt(0) === "v" ? (
                            <video
                              // className='video-box'
                              src={videoUrl}
                              width='400px'
                              height='300px'
                              alt='Product'
                              controls
                            />
                          ) : (
                            <>
                              <img
                                src='https://img.freepik.com/premium-vector/sound-wave-with-imitation-sound-audio-identification-technology_106065-64.jpg'
                                width='400px'
                                height='300px'
                                alt='Audio File'
                              />
                              <audio
                                controls
                                className='audio-box'
                                src={videoUrl}
                                alt='Product'
                              />
                            </>
                          )
                        ) : (
                          // NFT is locked, display locked content or a message
                          <img
                            src='https://www.pngall.com/wp-content/uploads/10/Lock-Transparent-Images.png'
                            width='400px'
                            height='300px'
                            alt='Locked NFT'
                          />
                        )}

                        {/* {contentType.charAt(0) == "v" ? (
                          <video
                            onClick={() => console.log(ProductID)}
                            className='video-box'
                            src={videoUrl}
                            width='400px'
                            height='300px'
                            alt='Product'
                          />
                        ) : (
                          <>
                            <img
                              onClick={() => console.log(ProductID)}
                              src='https://img.freepik.com/premium-vector/sound-wave-with-imitation-sound-audio-identification-technology_106065-64.jpg'
                              width='400px'
                              height='300px'
                              alt='Audio File'
                            />
                          </>
                        )} */}

                        <p className='nft-name'>{nftname}</p>
                        {/* <p className='nft-name'>{contentType}</p> */}

                        <span>
                          <b>Seller : {seller.substring(0, 8)}...</b>
                        </span>
                        <p>
                          <b>Price: {price} Wei</b>
                        </p>

                        {unlockStatus[ProductID] ? (
                          <button
                            onClick={() => {
                              handleBuyClick(
                                nftname,
                                price,
                                videoUrl,
                                ProductID,
                                contentType
                              );
                              alert("Added to Cart");
                            }}
                            class='btn btn-dark'>
                            BUY
                          </button>
                        ) : (
                          ""
                        )}
                        {unlockStatus[ProductID] ? (
                          "UNLOCKED!!"
                        ) : (
                          <button
                            onClick={() => {
                              handleUnlockClick(ProductID); // Call the function to unlock
                            }}
                            className='btn btn-warning'>
                            UNLOCK
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
export default Home;
