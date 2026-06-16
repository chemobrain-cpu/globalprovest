import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Withdraw.module.css';
import BuyModal from '../Modal/BuyModal';
import Sidebar from '../components/MobileSideBar';
import 'react-activity/dist/library.css';
import DesktopSideBar from '../components/DesktopSideBar';
import SendModal from '../Modal/SendModal';
import { BitcoinPaymentModal } from '../Modal/PaymentModal';
import AuthModal from '../Modal/AuthModal';
import BackHeader from '../components/BackHeader';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useDispatch, useSelector } from 'react-redux';
import { createPay } from "../store/action/appStorage";
import { QRCodeCanvas } from 'qrcode.react';

const DepositDetail = () => {
    const [loading, setLoading] = useState(false);
    const [openBuyModal, setOpenBuyModal] = useState(false);
    const [openSendModal, setOpenSendModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [isAuthError, setIsAuthError] = useState(false);
    const [authInfo, setAuthInfo] = useState("");
    const [cryptoData, setCryptoData] = useState([]);
    const [paymentAmount, setPaymentAmount] = useState();
    const [isData, setIsData] = useState(null);
    const [showQR, setShowQR] = useState(true);

    const navigate = useNavigate();
    const { admin } = useSelector(state => state.userAuth);
    const dispatch = useDispatch();
    const location = useLocation();

    const { status, depositId, amount, type, paid } = location.state;

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });

        const fetchCryptoData = async () => {
            try {
                const res = await fetch(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
                );
                const data = await res.json();
                setCryptoData(data);
            } catch (error) {
                console.error('Error fetching crypto data:', error);
            }
        };

        fetchCryptoData();
    }, []);

    useEffect(() => {
        setIsData({ status, depositId, amount, type, paid });
    }, []);

    const updateAuthError = () => {
        setIsAuthError(prev => !prev);
        setAuthInfo('');
    };

    const payHandler = async (data) => {
        if (loading) return;
        data.paid = data.paid === 'unPaid' ? 'Paid' : 'unPaid';

        try {
            setLoading(true);
            const res = await dispatch(createPay(data));

            if (!res.bool) {
                setIsAuthError(true);
                setAuthInfo(res.message);
                setLoading(false);
                return;
            }

            setIsData(prev => ({
                ...prev,
                paid: res.message.paid
            }));

            setAuthInfo('The system will be updated once payment is confirmed!');
            setIsAuthError(true);
            setLoading(false);
        } catch (error) {
            setIsAuthError(true);
            setAuthInfo(error.message || 'Something went wrong');
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert('Address copied to clipboard!');
    };

    // Dynamic wallet selector
    const getWalletAddress = () => {
        if (!admin) return '';

        switch (type) {
            case 'Bitcoin':
                return admin.bitcoinwalletaddress;
            case 'Ethereum':
                return admin.ethereumwalletaddress;
            case 'Usdt':
                return admin.usdt_walletaddress;
            case 'Usdt Erc20':
                return admin.usdt_erc20walletaddress;
            case 'Usdt Trc20':
                return admin.usdt_trc20walletaddress;
            default:
                return '';
        }
    };

    const walletAddress = getWalletAddress();

    return (
        <>
            {isAuthError && (
                <AuthModal
                    modalVisible={isAuthError}
                    updateVisibility={updateAuthError}
                    message={authInfo}
                />
            )}

            <div className={styles.dashboard}>
                <div className={styles.leftSection}>
                    <DesktopSideBar isInvest={true} />
                </div>

                <div className={styles.mainSection}>

                    <div className={styles.seedWarning}>
                        Once payment is made, click the Pay button below.
                    </div>

                    {isData && (
                        <div className={styles.card}>

                            {/* WALLET ADDRESS SECTION */}
                            {walletAddress && (
                                <div className={styles.formGroup}>
                                    <label>Pay to the {type} wallet address below</label>

                                    <div className={styles.inputCopyWrapper}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={walletAddress}
                                            readOnly
                                        />
                                        <button style={{backgroundColor:'orangered',padding:'12px',borderRadius:'5px',color:'white'}} onClick={() => handleCopy(walletAddress)}>
                                            copy
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.button}
                                        style={{ marginTop: '10px' }}
                                        onClick={() => setShowQR(prev => !prev)}
                                    >
                                        {showQR ? 'Hide QR Code' : 'Show QR Code'}
                                    </button>

                                    {showQR && (
                                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                            <QRCodeCanvas value={walletAddress} size={200} />
                                            <p style={{ marginTop: '10px', fontSize: '13px',color:'rgb(220,220,220)' }}>
                                                Scan to pay with your wallet app
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label>Amount ($)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={isData.amount || ''}
                                    readOnly
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Deposit ID</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={isData.depositId || ''}
                                    readOnly
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={isData.status || ''}
                                    readOnly
                                />
                            </div>

                            <button
                                className={styles.button}
                                onClick={() => payHandler(isData)}
                                style={{
                                    backgroundColor: isData.paid === 'Paid' ? 'green' : ''
                                }}
                            >
                                {isData.paid === 'Paid' ? 'Paid' : 'Pay Now'}
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DepositDetail;