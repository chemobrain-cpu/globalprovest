import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Upgrade.module.css';
import Sidebar from '../components/MobileSideBar';
import 'react-activity/dist/library.css';
import DesktopSideBar from '../components/DesktopSideBar';
import LoadingSkeleton from '../components/Loader';
import AuthModal from '../Modal/AuthModal';
import AOS from 'aos';
import 'aos/dist/aos.css';
import BackHeader from '../components/DashboardHeader';
import { useDispatch, useSelector } from 'react-redux';
import KycWarningCard from '../components/Kyc';
import { fetchPackages, fetchInvestment } from '../store/action/appStorage';

const Upgrade = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);
  const [authInfo, setAuthInfo] = useState("");
  const [plans, setPlans] = useState([]);
  const [investment, setInvestment] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.userAuth);

  // Fetch user investment
  const fetchInvest = async () => {
    const res = await dispatch(fetchInvestment(user?._id));
    if (!res) {
      setAuthInfo(res?.message ?? "Failed to fetch investment");
      return setIsAuthError(true);
    }
    setInvestment(res.message);
    setAuthInfo(
      `Your current plan is ${res?.message?.investmentPlan ?? "N/A"}. Contact administrator if you intend to change your investment plan`
    );
    return setIsAuthError(true);
  };

  // Fetch all plans
  const fetchAllPlans = async () => {
    const res = await dispatch(fetchPackages());
    if (!res) {
      setIsAuthError(true);
      setAuthInfo(res?.message ?? "Failed to fetch plans");
      return;
    }
    setPlans(res.message ?? []);
  };

  useEffect(() => {
    fetchInvest();
    fetchAllPlans();
  }, []);

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

  const navigateMobileHandler = (url) => {
    navigate(`/${url}`);
  };

  const navigatePlanHandler = () => {
    navigate('/fund-account');
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

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
            title='Our Plans'
          />


          <section className={styles.pricingSection}>
            <div className={styles.cardWrapper}>
              {(plans ?? []).map((plan, index) => (
                <div
                  className={styles.card}
                  key={index}
                  data-aos="zoom-in"
                  data-aos-delay={index * 150}
                >
                  <h2 className={styles.planName}>{plan?.name ?? "Unnamed Plan"}</h2>
                  <p className={styles.planPrice}>
                    {user?.currency ?? '$'}{(plan?.price ?? 0).toFixed(2)}
                  </p>
                  <ul className={styles.featureList}>
                    {(plan?.features ?? []).map((feature, i) => (
                      <li key={i}>{feature ?? "N/A"}</li>
                    ))}
                  </ul>
                  <button
                    style={{
                      backgroundColor:
                        investment?.investmentPlan?.toLowerCase() === plan?.name?.toLowerCase()
                          ? 'orangered'
                          : ''
                    }}
                    className={styles.upgradeBtn}
                    onClick={navigatePlanHandler}
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Upgrade;
