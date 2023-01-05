import { React, useState, createContext } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../util/constants';
import { useEffect } from 'react';

export const TransactionContext = createContext();

const { ethereum } = window;

const getEtheruemContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const TransactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return TransactionContract;
}

export const TransactionProvider = ({children}) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyworkd: '', message: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, settransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([])

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value }));
    }

    const getAllTransactions = async () => {
        try {
            if(!ethereum) return alert("Please Install Metamask");
            const transactionContract = getEtheruemContract();
            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTranscations = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)

            }))
            setTransactions(structuredTranscations);
            console.log(structuredTranscations);
            console.log(availableTransactions);
        } catch (error) {
            console.log(error)
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert("Please Install Metamask");
            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if(accounts.length) {
                setCurrentAccount(accounts[0]);

                getAllTransactions();
            } else {
                console.log("no accounts found")
            }
        } catch (error) {
            console.log(error)
            throw new Error("No ethereum object.")
        }


        if(!ethereum) return alert("Please Install Metamask");
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if(accounts.length) {
            setCurrentAccount(accounts[0]);

            getAllTransactions();
        } else {
            console.log("no accounts found")
        }
        
        console.log(accounts);
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEtheruemContract();
            const transactionCount = await transactionContract.getTransactionCount();
            
            window.localStorage.setItem("transactionCount", transactionCount)
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    const connectWallet =  async () => {
        try {
            if(!ethereum) return alert("Please Install Metamask");
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please Install Metamask");

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEtheruemContract();
            const parsedAmount = ethers.utils.parseEther(amount)
            await ethereum.request({ 
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 2100 GWEI
                    value: parsedAmount._hex,
                }]
            })
            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            settransactionCount(transactionCount.toNumber())
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, [])
    

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading }}>
            {children}
        </TransactionContext.Provider>

    )
}