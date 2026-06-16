import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Withdraw.module.css';
import Sidebar from '../components/MobileSideBar';
import 'react-activity/dist/library.css';
import DesktopSideBar from '../components/DesktopSideBar';
import { BitcoinPaymentModal } from '../Modal/PaymentModal';
import AuthModal from '../Modal/AuthModal';
import BackHeader from '../components/DashboardHeader';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-activity/dist/Spinner';
import { createDeposit, fetchDeposit } from '../store/action/appStorage';
import KycWarningCard from '../components/Kyc';
import MultiCoinChart from './Chart';

const FundAccount = () => {
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);
  const [authInfo, setAuthInfo] = useState('');
  const [cryptoData, setCryptoData] = useState([]);
  const [isDeposits, setIsDeposits] = useState([]);
  const [adminPaymentAddr, setAdminPaymentAddr] = useState({ name: '', address: '' });
  const [paymentAmount, setPaymentAmount] = useState();
  const [isPaymentMode, setIsPaymentMode] = useState('');
  const [fund, setFund] = useState({ plan: 'Starter', amount: '2000' });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, admin } = useSelector(state => state.userAuth);

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

  const fetchDepositHandler = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await dispatch(fetchDeposit({ user }));
      if (!res.bool) {
        setAuthInfo(res.message);
        setIsAuthError(true);
        setLoading(false);
        return;
      }
      setIsDeposits(res.message);
      setLoading(false);
    } catch (err) {
      setAuthInfo(err.message);
      setIsAuthError(true);
      setLoading(false);
    }
  };

  const viewHandler = (data) => {
    navigate('/deposit-detail', {
      state: {
        status: data.status,
        depositId: data.depositId,
        amount: data.amount,
        type: data.type,
        paid: data.paid,
      }
    });
  }

  useEffect(() => {
    fetchDepositHandler();
  }, []);

  const updateAuthError = () => {
    setIsAuthError(prev => !prev);
    setAuthInfo('');
  };

  const notificationHandler = () => {
    navigate('/notifications');
  };

  const openMobileMenu = () => {
    setSidebarOpen(prev => !prev);
  };

  const changeModeHandler = (data) => {
    setIsPaymentMode(data);
  };

  const createDepositHandler = async () => {
    if (loading) return;

    if (!user?.accountStatus) {
      setAuthInfo('Account not yet verified');
      setIsAuthError(true);
      return;
    }

    if (!isPaymentMode) {
      setAuthInfo('Please select the mode of deposit');
      setIsAuthError(true);
      return;
    }

    const { amount, plan } = fund;
    const mode = isPaymentMode;

    if (!amount || !plan || !mode) {
      setAuthInfo('Please fill all required fields correctly');
      setIsAuthError(true);
      return;
    }

    if (!user?.email) {
      setAuthInfo('User information is missing');
      setIsAuthError(true);
      return;
    }

    const data = {
      amount,
      plan,
      mode,
      user
    };

    try {
      setLoading(true);
      const res = await dispatch(createDeposit(data));

      if (!res.bool) {
        setIsAuthError(true);
        setAuthInfo(res.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      setIsDeposits(res.message);
      setAuthInfo('Deposit initiated. Scroll down the history table, click the pay now, and follow the instruction to complete payment');
      setIsAuthError(true);

      setFund({ plan: '', amount: '' });
      setIsPaymentMode('');
    } catch (error) {
      setLoading(false);
      setIsAuthError(true);
      setAuthInfo(error.message || 'Something went wrong');
    }
  };

  const togglePaymentModalHandler = () => {
    setOpenPaymentModal(prev => !prev);
  };

  const openPaymentModalHandler = (amount, type) => {
    if (type === 'Bitcoin') {
      setAdminPaymentAddr({
        name: 'Bitcoin',
        address: admin.bitcoinwalletaddress,
      });
    } else if (type === 'Etheruem') {
      setAdminPaymentAddr({
        name: 'Etheruem',
        address: admin.etheriumwalletaddress,
      });
    } else if (type === 'Xrp') {
      setAdminPaymentAddr({
        name: 'Xrp',
        address: admin.xrpwalletaddress,
      });
    } else if (type === 'Solana') {
      setAdminPaymentAddr({
        name: 'Solana',
        address: admin.solanawalletaddress,
      });
    } else if (type === 'Usdt(solana)') {
      setAdminPaymentAddr({
        name: 'Usdt(solana)',
        address: admin.usdtsolanawalletaddress,
      });
    } else if (type === 'Bnb') {
      setAdminPaymentAddr({
        name: 'Bnb',
        address: admin.bnbwalletaddress,
      });
    } else if (type === 'Dodge') {
      setAdminPaymentAddr({
        name: 'Dodge',
        address: admin.dodgewalletaddress,
      });
    }

    setPaymentAmount(amount);
    setOpenPaymentModal(true);
  };

  const navigateMobileHandler = (url) => {
    return navigate(`/${url}`);
  };

  return (
    <>
      {openPaymentModal && (
        <BitcoinPaymentModal
          btcAddress={adminPaymentAddr}
          modalVisible={true}
          updateVisibility={togglePaymentModalHandler}
          amount={paymentAmount}
        />
      )}
      {isAuthError && (
        <AuthModal
          modalVisible={isAuthError}
          updateVisibility={updateAuthError}
          message={authInfo}
        />
      )}

      <div className={styles.dashboard}>
        <div className={styles.leftSection}>
          <DesktopSideBar isInvest={true} navigateMobileHandler={navigateMobileHandler} />
        </div>

        {sidebarOpen && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isInvest={true}
            navigateMobileHandler={navigateMobileHandler}
          />
        )}

        <div className={styles.mainSection}>
          <BackHeader
            openMobileMenu={openMobileMenu}
            notificationHandler={notificationHandler}
            sidebarOpen={sidebarOpen}
            title="Deposit Fund"
          />

          <div className={styles.tickerTape} style={{ margin: '0 10px' }}>
            <div className={styles.tickerInner}>
              {cryptoData.map((coin, index) => (
                <div key={index} className={styles.tickerItem}>
                  <img src={coin?.image} alt={coin?.name ?? "coin"} className={styles.coinIcon} />
                  <span className={styles.coinName}>{coin?.symbol?.toUpperCase() ?? "---"}</span>
                  <span
                    className={
                      coin?.price_change_percentage_24h >= 0
                        ? styles.priceUp
                        : styles.priceDown
                    }
                  >
                    $
                    {(coin?.current_price ?? 0).toFixed(2)} (
                    {(coin?.price_change_percentage_24h ?? 0).toFixed(2)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>




          {!loading ? (
            <div className={styles.container}>
              <div className={styles.card}>
                <div className={styles.formGroup}>
                  <select
                    className={styles.select}
                    value={isPaymentMode}
                    onChange={(e) => changeModeHandler(e.target.value)}
                  >
                    <option value="">Method of Payment</option>
                    <option value="Bitcoin">Bitcoin</option>
                    <option value="Etheruem">Etheruem</option>
                    <option value="Xrp">XRP</option>
                    <option value="Solana">Solana</option>
                    <option value="Usdt(solana)">USDT(Solana)</option>
                    <option value="Bnb">Bnb</option>
                    <option value="Dodge">Dodge</option>
                    <option value="Gcash">Gcash</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="number"
                    placeholder="Enter amount in dollars"
                    className={styles.input}
                    value={fund.amount}
                    onChange={(e) => setFund(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <button className={styles.button} onClick={createDepositHandler}>
                  Create Deposit
                </button>
              </div>




              {isDeposits.length === 0 ? (
                <div className={styles.historyCard}>
                  <h3 className={styles.sectionTitle}>History</h3>
                  <p className={styles.emptyText}>No withdrawal found.</p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.tradeTable}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>DATE</th>
                        <th>AMOUNT</th>
                        <th>TRANSACTION TYPE</th>
                        <th>STATUS</th>
                        {isDeposits.some(deposit => deposit.status === 'pending') && <th>ACTION</th>}
                        <th >DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isDeposits.map((deposit, index) => (
                        <tr key={deposit._id || index}>
                          <td>#{deposit?.depositId?.slice(0, 8) || 'N/A'}</td>
                          <td>{deposit?.date ? new Date(deposit.date).toLocaleDateString() : "N/A"}</td>
                          <td>{deposit?.amount ?? 0}</td>
                          <td style={{ fontWeight: 'bold' }}>{deposit?.type ?? "N/A"}</td>
                          <td
                            style={{
                              color: deposit?.status === 'pending' ? '#EF4444' : '#10B981',
                              fontWeight: 'bold'
                            }}
                          >
                            {deposit?.status=='active'?'successful':"pending"}
                          </td>
                          {deposit?.status === 'pending' && (
                            <td>
                              <button
                                onClick={() => openPaymentModalHandler(deposit?.amount, deposit?.type)}
                                className={styles.payNowBtn}
                              >
                                Pay Now
                              </button>
                            </td>
                          )}



                          <td
                            style={{
                              color: deposit.status === 'pending' ? '#EF4444' : '#10B981',
                              fontWeight: 'bold',
                            }}
                          >

                            <button onClick={() => viewHandler(deposit)} className={styles.payNowBtn}>Detail</button>

                          </td>


                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              width: '100%',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: '20px'
            }}>
              <Spinner size={24} color="#4F46E5" speed={0.5} animating={true} />
            </div>
          )}

          <div className={styles.card} style={{ background: 'transparent', display: 'flex', justifyContent: 'center' }}>
            <MultiCoinChart />
          </div>



        </div>








      </div>
    </>
  );
};

export default FundAccount;

