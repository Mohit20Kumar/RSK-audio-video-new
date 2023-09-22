import React, { useEffect, useState } from "react";
import "./Styles.css";
import { ethers } from "ethers";
import MyProducts from "./MyProducts"; // Import the MyProducts component

const Cart = (props) => {
  const [gasFee, setGasFee] = useState(0);
  const [payStatus, setPayStatus] = useState("");
  const [purchasedProductIDs, setPurchasedProductIDs] = useState([]); // State to store purchased product IDs

  useEffect(() => {
    const handler = async () => {
      try {
        const amount = {
          value: ethers.utils.parseUnits(props.TotalPayment.toString(), 18),
        };
        const gasLimit = await props.contract.estimateGas.BuyProducts(
          Object.keys(props.items),
          amount
        );
        const gasPrice = await props.contract.provider.getGasPrice();
        const transactionFee = gasLimit * gasPrice;
        setGasFee(transactionFee.toString());
      } catch (e) {
        console.log(e);
      }
    };

    console.log(props.items);
    props.contract && handler();
  }, [props.contract, props.items]);

  const handlePayment = async (e, price) => {
    e.preventDefault();
    try {
      const amount = { value: ethers.BigNumber.from("1000") };
      console.log(amount);
      const productIDs = Object.keys(props.items);
      const transaction = await props.contract.BuyProducts(productIDs, amount);

      // Store the purchased product IDs
      setPurchasedProductIDs(productIDs);

      setPayStatus("Please wait ...");
      await transaction.wait();
      props.setItem({});
      props.setTotalPayment(0);
      setPayStatus("");
      alert("Payment Successful");
      props.setTrigger(false);
    } catch (e) {
      setPayStatus("");
      console.log(e);
      alert("Payment failed, try again..");
    }
  };

  return props.trigger ? (
    <div className='outer'>
      <h3>MY CART</h3>
      <div className='inner'>
        {props.items &&
          Object.entries(props.items).map(
            ([ProductID, [nftname, videoUrl, price]], index) => (
              <div className='Productitem' key={index}>
                <div className='productbody'>
                  <center>
                    <video
                      src={videoUrl}
                      width='400px'
                      height='300px'
                      alt='Product'
                    />
                    <p className='nft-name'>{nftname}</p>
                    <p>
                      <b>Price: {price} Wei</b>
                    </p>
                  </center>
                </div>
              </div>
            )
          )}
      </div>
      <br />
      <center>
        <p style={{ fontSize: "1.5rem" }}>
          <b>
            {props.TotalPayment === "0"
              ? `Total Cost : ${props.TotalPayment} Wei+${gasFee} Wei (Est gas fee)`
              : `Your Cart Is Empty! Buy Some NFT's`}
          </b>
        </p>
      </center>
      <center>
        <button
          onClick={(e) => {
            handlePayment(e, props.TotalPayment);
          }}
          class='btn btn-dark'>
          PAY
        </button>
      </center>
      <br />
      <center>
        <button onClick={() => props.setTrigger(false)} class='btn btn-danger'>
          Live NFT
        </button>
      </center>
    </div>
  ) : (
    // Pass purchasedProductIDs to MyProducts component
    <MyProducts
      trigger={props.trigger}
      account={props.account}
      contract={props.contract}
      purchasedProductIDs={purchasedProductIDs}
    />
  );
};

export default Cart;
