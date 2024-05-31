import { useState, useEffect } from "react";
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
  const [showAddress, setShowAddress] = useState(true);


  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const ntcBankABI = NTCBankABI.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      // once wallet is set we can get a reference to our deployed contract
      getNTCBankContract();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getNTCBankContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const ntcBankContract = new ethers.Contract(contractAddress, ntcBankABI, signer);

    setNTCBank(ntcBankContract);
  };

  const getBalance = async () => {
    if (ntcBank) {
      const balance = await ntcBank.balances(account);
      setBalance(ethers.utils.formatEther(balance));
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

  const toggleAddress = () => {
    setShowAddress(!showAddress);
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


  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount} className="button" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div style={{ marginBottom: '10px' }}>
       <p>Your Account: {showAddress ? account : '********'} 
         <button onClick={toggleAddress} className="button" style={{ padding: '5px 10px', backgroundColor: '#cccccc',
          color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer',
            fontSize: '12px', marginLeft: '10px' }}>{showAddress ? 'Hide Address' : 'Show Address'}</button>
          </p>
        <p>Your Balance: {balance} ETH</p>
        <div className="inputWrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Enter deposit amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="input"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <button onClick={deposit} className="button" style={{ padding: '10px 20px', backgroundColor: '#008CBA',
           color: 'white', border: 'none',
            borderRadius: '5px', cursor: 'pointer' }}>Deposit</button>
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
        {showOtherBalance && <p style={{ textAlign: 'center' }}>Total Balance: {otherBalance} ETH</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container" style={{ backgroundColor: '#bfe5ff', padding: '20px', textAlign: 'center' }}>
      <header>
        <h1>Welcome to NTC Bank!</h1>
      </header>
      {initUser()}
    </main>
  );
}
