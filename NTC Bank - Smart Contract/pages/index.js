import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import NTCBankABI from "../artifacts/contracts/Assessment.sol/NTCBank.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [ntcBank, setNTCBank] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [otherAddress, setOtherAddress] = useState("");
  const [otherBalance, setOtherBalance] = useState("");
  const [showOtherBalance, setShowOtherBalance] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const ntcBankABI = NTCBankABI.abi;

  useEffect(() => {
    if (window.ethereum) {
      setIsMetaMaskInstalled(true);
      setEthWallet(new ethers.providers.Web3Provider(window.ethereum));

      window.ethereum.on("accountsChanged", (accounts) => {
        handleAccount(accounts);
      });
    }
  }, []);

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!window.ethereum) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      if (ethWallet) {
        const signer = ethWallet.getSigner();
        const ntcBankInstance = new ethers.Contract(contractAddress, ntcBankABI, signer);
        setNTCBank(ntcBankInstance);
        getBalance(ntcBankInstance);
      }
    } catch (error) {
      console.log("Account connection failed", error);
    }
  };

  const getBalance = async () => {
    if (ntcBank) {
      const balance = await ntcBank.balances(account);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const deposit = async () => {
    if (ntcBank && depositAmount) {
      try {
        const tx = await ntcBank.deposit({ value: ethers.utils.parseEther(depositAmount) });
        await tx.wait();
        setDepositAmount("");
        getBalance(); 
      } catch (error) {
        console.error("Error depositing funds:", error);
      }
    }
  };
  
  const withdraw = async () => {
    if (ntcBank && withdrawAmount) {
      try {
        const tx = await ntcBank.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        setWithdrawAmount("");
        getBalance(); 
      } catch (error) {
        console.error("Error withdrawing funds:", error);
      }
    }
  };

  const getOtherAddressBalance = async () => {
    if (ntcBank && otherAddress) {
      try {
        const balance = await ntcBank.balances(otherAddress);
        setOtherBalance(ethers.utils.formatEther(balance));
        setShowOtherBalance(true);
        setTimeout(() => {
          setShowOtherBalance(false);
          setOtherBalance("");
        }, 5000);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setOtherAddress("");
      }
    }
  };

  const transfer = async () => {
    if (!ntcBank) {
      alert("NTC Bank is not connected");
      return;
    }
  
    try {
      const amount = ethers.utils.parseEther(transferAmount);
      const tx = await ntcBank.transfer(transferAddress, amount);
      await tx.wait();  
      getBalance();
      setTransferAmount("");
      setTransferAddress("");
    } catch (error) {
      console.log("Transfer failed", error);
    }
  };
  
  useEffect(() => {
    const connect = async () => {
      if (!account) {
        alert("Please connect your wallet to interact with NTC Bank");
        return;
      }
  
      if (ethWallet) {
        const signer = ethWallet.getSigner();
        const ntcBankInstance = new ethers.Contract(contractAddress, ntcBankABI, signer);
        setNTCBank(ntcBankInstance);
        getBalance(ntcBankInstance);
      }
    };
  
    connect();
  }, [account, ethWallet]); 
  

  const initUser = () => {
    if (!isMetaMaskInstalled) {
      return (
        <div>
          <h1>Metamask not Installed!</h1>
          <button onClick={() => window.open("https://metamask.io/download.html")} className="button" style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Install Metamask</button>
        </div>
      );
    }

    if (!account) {
      return (
        <div>
          <h1>Connect your Metamask Wallet</h1>
          <button onClick={connectAccount} className="button" style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Connect Wallet</button>
        </div>
      );
    }

    return (
      <div>
        <h1>Welcome to NTC Bank!</h1>
        <p style={{ textAlign: 'center' }}>Account: {account}</p>
        <p style={{ textAlign: 'center' }}>Total Balance: {balance} ETH</p>
        <div className="inputWrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Enter deposit amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="input"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <button onClick={deposit} className="button" style={{ padding: '10px 20px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Deposit</button>
          </div>
        <div className="inputWrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Enter withdraw amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="input"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <button onClick={withdraw} className="button" style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Withdraw</button>
        </div>
        <div className="inputWrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter address to check balance"
            value={otherAddress}
            onChange={(e) => setOtherAddress(e.target.value)}
            className="input"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <button onClick={getOtherAddressBalance} className="button" style={{ padding: '10px 20px', backgroundColor: '#555555', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Check Balance</button>
        </div>
        {showOtherBalance && (
          <p style={{ textAlign: 'center' }}>Total Balance: {otherBalance} ETH</p>
        )}
        <div className="inputWrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Enter transfer amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="input"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <input
            type="text"
            placeholder="Enter recipient address"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
            className="input"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <button onClick={transfer} className="button" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Transfer</button>
        </div>
        <button onClick={disconnectAccount} className="button" style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>Disconnect Wallet</button>
      </div>
    );
  };

  const disconnectAccount = () => {
    setAccount(undefined);
    setNTCBank(undefined);
    setBalance(undefined);
    setDepositAmount("");
    setWithdrawAmount("");
    setOtherAddress("");
    setOtherBalance("");
    setShowOtherBalance(false);
    setTransferAmount("");
    setTransferAddress("");
  };

  return (
    <main className="container" style={{ backgroundColor: '#bfe5ff', padding: '20px', textAlign: 'center' }}>
      <header>
        {initUser()}
      </header>
    </main>
  );
}
