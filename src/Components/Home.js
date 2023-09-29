import React, { useEffect, useState } from "react";
import "./Styles.css";
import Cart from "./Cart";
import Mint from "./Mint";
import MyProducts from "./MyProducts";
const Home = (props) => {
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
                        {contentType.charAt(0) == "v" ? (
                          <video
                            className='video-box'
                            src={videoUrl}
                            width='400px'
                            height='300px'
                            alt='Product'
                          />
                        ) : (
                          <>
                            <img
                              src='https://img.freepik.com/premium-vector/sound-wave-with-imitation-sound-audio-identification-technology_106065-64.jpg'
                              width='400px'
                              height='300px'
                              alt='Audio File'
                            />
                          </>
                        )}

                        <p className='nft-name'>{nftname}</p>
                        {/* <p className='nft-name'>{contentType}</p> */}

                        <span>
                          <b>Seller : {seller.substring(0, 8)}...</b>
                        </span>
                        <p>
                          <b>Price: {price} Wei</b>
                        </p>
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
