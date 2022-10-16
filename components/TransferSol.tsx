import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js'
import react, { FC, useState, useEffect } from 'react'
import { SystemProgram, Transaction } from '@solana/web3.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/TransferSol.module.css'
import CircleLoader from "react-spinners/CircleLoader";


export const TransferSol: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState<number>()
    const [amount, setAmount] = useState<number>(0)
    const [recipient, setRecipient] = useState("")
    const [showLoader, setShowLoader] = useState(false)

    useEffect(() => {
        if (publicKey && connection) {
            connection.getBalance(publicKey).then(balance => {
                setBalance(balance / web3.LAMPORTS_PER_SOL)
            })
        } else {
            setBalance(undefined)
            setAmount(0)
            setRecipient("")
            setShowLoader(false)
        }
    }, [connection, publicKey])


    const handleSubmit = async (e: react.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!connection || !publicKey || !amount) { return }

        const lamports = amount * web3.LAMPORTS_PER_SOL;
        if (lamports > 0) {
            setShowLoader(true)
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new web3.PublicKey(recipient),
                    lamports,
                })
            );
            try {
                const {
                    context: { slot: minContextSlot },
                    value: { blockhash, lastValidBlockHeight }
                } = await connection.getLatestBlockhashAndContext();

                const signature = await sendTransaction(transaction, connection, { minContextSlot });

                await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }).then(() => {
                    setShowLoader(false)
                    connection.getBalance(publicKey).then(balance => {
                        setBalance(balance / web3.LAMPORTS_PER_SOL)
                    })
                });
            } catch (error) {
                setShowLoader(false)
                console.log(error)
                toast(error.message)
            }
        }
    }

    const handleAmountInputChange = (e: react.ChangeEvent<HTMLInputElement>) => {
        setAmount(parseFloat(e.target.value))
    }

    const handleRecipientInputChange = (e: react.ChangeEvent<HTMLInputElement>) => {
        setRecipient(e.target.value)
    }

    return (
        <div className={styles.FormContainer}>
            <form className={styles.Form} onSubmit={handleSubmit}>
                <p className={styles.Label}>Your SOL balance: {balance}</p>
                <label className={styles.Label} htmlFor="amountToSend">Amount (in SOL) to send:</label>
                <input className={styles.Input} type="number" name="amountToSend" value={amount} placeholder="Enter the amount you wish to send e.g 0.5" onChange={handleAmountInputChange} />
                <label className={styles.Label} htmlFor="recipientPubKey">Send SOL to:</label>
                <input className={styles.Input} type="text" name="recipientPubKey" value={recipient} placeholder="Enter the recipient address/public key" onChange={handleRecipientInputChange} />
                {
                    showLoader ?
                        <CircleLoader
                            color="#14F195"
                            size={30}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                        :
                        <button className={styles.SubmitButton} type="submit">Send</button>
                }
                <ToastContainer />
            </form>
        </div>
    )
}
