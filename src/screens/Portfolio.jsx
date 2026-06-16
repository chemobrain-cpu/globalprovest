import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Portfolio.module.css';
import Sidebar from '../components/MobileSideBar';
import 'react-activity/dist/library.css';
import DesktopSideBar from '../components/DesktopSideBar';
import DesktopHeader from '../components/DashboardHeader';
import LoadingSkeleton from '../components/Loader';
import AuthModal from '../Modal/AuthModal';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useDispatch, useSelector } from 'react-redux';


import {
  FaBitcoin,
  FaArrowDown,
  FaGift,
  FaChartLine,
  FaWallet,
  FaCalendarAlt,
  FaCheckCircle
} from 'react-icons/fa';

import MultiCoinChart from './Chart';
import KycWarningCard from '../components/Kyc';
import { fetchInvestment, fetchDepositHandler } from '../store/action/appStorage';
import DepositPlanCard from '../components/DepositCardPlan';

const Portfolio = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);
  const [btcEquivalent, setBtcEquivalent] = useState("0.0000");

  const navigate = useNavigate();
  const [isAuthError, setIsAuthError] = useState(false);
  const [authInfo, setAuthInfo] = useState("");
  const { user } = useSelector(state => state.userAuth);

  const [count, setCount] = useState(0);
  const dispatch = useDispatch();

  const [investment, setInvestment] = useState(null);
  const [handler, setHandler] = useState(null);

  const fetchAllData = async () => {
    try {
      const investRes = await dispatch(fetchInvestment(user._id));
      if (!investRes) {
        setAuthInfo("Failed to fetch investment data.");
        return setIsAuthError(true);
      }
      setInvestment(investRes.message);

      const handlerRes = await dispatch(fetchDepositHandler(user._id));
      if (!handlerRes) {
        setAuthInfo("Failed to fetch deposit handler.");
        return setIsAuthError(true);
      }
      console.log(handlerRes)
      setHandler(handlerRes);

    } catch (error) {
      console.error("Error fetching data:", error);
      setAuthInfo("An unexpected error occurred.");
      setIsAuthError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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

    const fetchBtcPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        setBtcPrice(data.bitcoin.usd);
      } catch (err) {
        console.error("Failed to fetch BTC price", err);
      }
    };

    fetchCryptoData();
    fetchBtcPrice();
  }, []);

  useEffect(() => {
    const storedCount = localStorage.getItem('liveTradersCount');
    if (storedCount) setCount(Number(storedCount));

    const interval = setInterval(() => {
      setCount(prev => {
        const next = prev + 5;
        localStorage.setItem('liveTradersCount', next);
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (btcPrice && user?.availableBalance) {
      const btcVal = (user.availableBalance / btcPrice).toFixed(6);
      setBtcEquivalent(btcVal);
    }
  }, [btcPrice, user?.availableBalance]);

  const navigateHandler = (url) => navigate(`/${url}`);

  const updateAuthError = () => {
    setIsAuthError(prev => !prev);
    setAuthInfo('');
  };

  const openMobileMenu = () => setSidebarOpen(prev => !prev);
  const notificationHandler = () => navigate('/notifications');
  const navigateMobileHandler = (url) => navigate(`/${url}`);

  if (loading) return <LoadingSkeleton />;

  return (
    <>
      {isAuthError && <AuthModal modalVisible={isAuthError} updateVisibility={updateAuthError} message={authInfo} />}

      <div className={styles.dashboard}>
        <div className={styles.leftSection}>
          <DesktopSideBar isInvest={true} navigateMobileHandler={navigateMobileHandler} />
        </div>

        {sidebarOpen && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isInvest={true} navigateMobileHandler={navigateMobileHandler} />
        )}

        <div className={styles.mainSection}>
          <DesktopHeader
            openMobileMenu={openMobileMenu}
            notificationHandler={notificationHandler}
            sidebarOpen={sidebarOpen}
            title='Dashboard'
          />

          <div className={styles.dashboardContent}>

  {/* TICKER */}
  <div
    className={styles.tickerTape}
    style={{ margin: '0 10px' }}
  >
    <div className={styles.tickerInner}>
      {cryptoData.map((coin, index) => (
        <div
          key={index}
          className={styles.tickerItem}
        >
          <img
            src={coin.image}
            alt={coin.name}
            className={styles.coinIcon}
          />

          <span className={styles.coinName}>
            {coin.symbol?.toUpperCase()}
          </span>

          <span
            className={
              coin.price_change_percentage_24h >= 0
                ? styles.priceUp
                : styles.priceDown
            }
          >
            $
            {typeof coin.current_price === "number"
              ? coin.current_price.toFixed(2)
              : "0.00"}

            (
            {typeof coin.price_change_percentage_24h ===
            "number"
              ? coin.price_change_percentage_24h.toFixed(
                  2
                )
              : "0.00"}
            %)
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* DEPOSIT PLANS */}
  {handler
    ? handler.message.handler.map(
        (data, i) => (
          <DepositPlanCard
            key={i}
            plan={data}
          />
        )
      )
    : null}

  {/* WELCOME */}
  <h3 className={styles.wlc}>
    Welcome Back {":)"} 
    <span>
      {user.firstName?.slice(0, 5)}!
    </span>
  </h3>

  {/* HERO WALLET CARD */}
  <div className={styles.heroCard}>
    <div className={styles.heroLeft}>
      <p className={styles.balanceLabel}>
        Available Balance
      </p>

      <h1 className={styles.balanceAmount}>
        $
        {user.availableBalance ??
          "0.00"}
      </h1>

      <p className={styles.balanceBTC}>
        ₿ {btcEquivalent} BTC
      </p>
    </div>

    <div className={styles.heroRight}>

      <button
        className={styles.depositBtn}
        onClick={() =>
          navigateHandler("fund-account")
        }
      >
        Deposit
      </button>

      <button
        className={styles.withdrawBtn}
        onClick={() =>
          navigateHandler("withdraw")
        }
      >
        Withdraw
      </button>
    </div>
  </div>

  {/* STATS CARDS */}
  <div className={styles.bottomCards}>

    {/* PROFIT */}
    <div
      className={styles.carditem}
      style={{
        background:
          'linear-gradient(135deg,#4e54c8,#6c63ff)',
        color: '#fff'
      }}
    >
      <div className={styles.btcRow}>
        <div
          className={
            styles.bitcoinIcon
          }
        >
          ₿
        </div>

        <p className={styles.cardTitle}>
          Total Profit
        </p>
      </div>

      <h2
        className={styles.cardAmount}
      >
        $
        {investment?.totalProfit ??
          "0.00"}
      </h2>

      <p
        className={
          styles.percentageUp
        }
      >
        +12.45%
      </p>
    </div>

    {/* DEPOSIT */}
    <div className={styles.carditem}>
      <div className={styles.btcRow}>
        <div
          className={
            styles.cardIcon
          }
          style={{
            background:
              '#f953c6'
          }}
        >
          <FaArrowDown
            size={18}
          />
        </div>

        <p className={styles.cardTitle}>
          Deposits
        </p>
      </div>

      <h2
        className={styles.cardAmount}
      >
        $
        {investment?.totalDeposit ??
          "0.00"}
      </h2>

      <p
        className={
          styles.percentageUp
        }
      >
        +8.34%
      </p>

      <p
        className={
          styles.liveTraders
        }
      >
        Live Traders
        <br />

        {count.toLocaleString()}
      </p>
    </div>

    {/* BONUS */}
    <div className={styles.carditem}>
      <div className={styles.btcRow}>
        <div
          className={
            styles.cardIcon
          }
          style={{
            background:
              '#1fa2ff'
          }}
        >
          <FaGift size={18} />
        </div>

        <p className={styles.cardTitle}>
          Bonus
        </p>
      </div>

      <h2
        className={styles.cardAmount}
      >
        $
        {investment?.referralBonus ??
          "0.00"}
      </h2>

      <p
        className={
          styles.percentageUp
        }
      >
        +7.11%
      </p>
    </div>

  </div>

  {/* INVESTMENT SECTION */}
  <div
    className={
      styles.investmentGrid
    }
  >

    {/* ACTIVE INVESTMENT */}
    <div
      className={
        styles.investmentCard
      }
      style={{
        background:
          'linear-gradient(135deg,#4e54c8,#6c63ff)'
      }}
    >
      <div
        className={
          styles.cardHeader
        }
      >
        <div
          className={
            styles.cardIcon
          }
        >
          <FaWallet
            size={18}
            color="#fff"
          />
        </div>

        <h3
          className={
            styles.title
          }
        >
          Active Investment
        </h3>
      </div>

      <div
        className={
          styles.section
        }
      >
        <p
          className={
            styles.label
          }
        >
          Investment Plan
        </p>

        <div
          className={
            styles.planBox
          }
        >
          <span
            className={
              styles.planName
            }
          >
            {investment?.isActive
              ? investment?.investmentPlan
              : 'No Active Plan'}
          </span>
        </div>
      </div>

      <div
        className={
          styles.infoRow
        }
      >
        <div
          className={
            styles.infoBox
          }
        >
          <p
            className={
              styles.label
            }
          >
            Amount
          </p>

          <p
            className={
              styles.value
            }
          >
            {investment?.isActive
              ? '$' +
                (investment?.amount ??
                  "0.00")
              : '---'}
          </p>
        </div>

        <div
          className={
            styles.infoBox
          }
        >
          <p
            className={
              styles.label
            }
          >
            Status
          </p>

          <p
            className={
              styles.value
            }
          >
            <FaCheckCircle
              style={{
                marginRight:
                  '8px'
              }}
            />

            {investment?.isActive
              ? 'Running'
              : 'Inactive'}
          </p>
        </div>
      </div>
    </div>

    {/* PERFORMANCE */}
    <div
      className={
        styles.investmentCard
      }
      style={{
        background:
          'linear-gradient(135deg,#00b894,#00d2a0)'
      }}
    >
      <div
        className={
          styles.cardHeader
        }
      >
        <div
          className={
            styles.cardIcon
          }
        >
          <FaChartLine
            size={18}
            color="#fff"
          />
        </div>

        <h3
          className={
            styles.title
          }
        >
          Performance
        </h3>
      </div>

      <div
        className={
          styles.infoRow
        }
      >
        <div
          className={
            styles.infoBox
          }
        >
          <p
            className={
              styles.label
            }
          >
            Profit Earned
          </p>

          <p
            className={
              styles.value
            }
          >
            $
            {investment?.isActive
              ? investment?.profit ??
                "0.00"
              : "0.00"}
          </p>
        </div>

        <div
          className={
            styles.infoBox
          }
        >
          <p
            className={
              styles.label
            }
          >
            Started
          </p>

          <p
            className={
              styles.value
            }
          >
            {investment?.isActive &&
            investment?.date
              ? new Date(
                  investment.date
                ).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }
                )
              : '---'}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <FaCalendarAlt />

        <span>
          Investment Growth
          Tracker
        </span>
      </div>
    </div>

  </div>

  {/* CHART */}
  <div
    className={
      styles.chartCard
    }
  >
    <MultiCoinChart />
  </div>

</div>
        </div>
      </div>
    </>
  );
};

export default Portfolio;



