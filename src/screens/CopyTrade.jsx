import React, { useState, useEffect } from "react";
import styles from './Withdraw.module.css';
import DesktopSideBar from '../components/DesktopSideBar';
import AuthModal from "../Modal/AuthModal";
import LoadingSkeleton from "../components/Loader";
import { fetchCopyTraders } from "../store/action/appStorage";
import { useDispatch, useSelector } from 'react-redux';

const CopyTrade = () => {

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.userAuth);

  const [traders, setTraders] = useState([]);
  const [filteredTraders, setFilteredTraders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isAuthError, setIsAuthError] = useState(false);
  const [authInfo, setAuthInfo] = useState("");

  /* 🔢 FORMAT FUNCTION */
  const formatFollowers = (num) => {
    if (!num) return "0";

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + "M";
    }

    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + "K";
    }

    return num;
  };

  /* 🔥 FETCH */
  const fetchAllTraders = async () => {
    setLoading(true);

    const res = await dispatch(fetchCopyTraders());

    if (!res?.bool) {
      setAuthInfo(res?.message ?? "Failed to fetch traders");
      setIsAuthError(true);
      setLoading(false);
      return;
    }

    setTraders(res.message ?? []);
    setFilteredTraders(res.message ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllTraders();
  }, []);

  /* 🔍 SEARCH */
  useEffect(() => {
    const filtered = traders.filter((item) =>
      item.traderName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTraders(filtered);
  }, [search, traders]);

  /* ✅ COPY HANDLER */
  const handleCopy = (trader) => {

    if (!user) {
      setAuthInfo("User not found. Please login again.");
      setIsAuthError(true);
      return;
    }

    const userBalance = Number(user.availableBalance || 0);
    const traderAmount = Number(trader.startupAmount || 0);

    if (userBalance < traderAmount) {
      setAuthInfo("You do not have sufficient amount for this plan.");
      setIsAuthError(true);
      return;
    }

    setAuthInfo(`You are now copying ${trader.traderName}`);
    setIsAuthError(true);
  };

  const updateAuthError = () => {
    setIsAuthError(false);
    setAuthInfo('');
  };

  return (
    <>
      {/* ✅ DYNAMIC MODAL */}
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
          <div style={uiStyles.container}>

            <div style={uiStyles.searchWrapper}>
              <input
                placeholder="Search trader..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={uiStyles.searchInput}
              />
            </div>

          
            <div style={uiStyles.grid}>
              {(filteredTraders ?? []).map((item, index) => (
                <div key={index} style={uiStyles.card}>

                  <div style={uiStyles.header}>
                    <img src={item?.traderPhotoUrl} style={uiStyles.avatar} />

                    <div>
                      <div style={uiStyles.nameRow}>
                        <h3 style={uiStyles.name}>{item?.traderName}</h3>
                        <span style={uiStyles.badge}>✔</span>
                      </div>
                      <p style={uiStyles.role}>Trader</p>
                    </div>
                  </div>

                  <button
                    style={uiStyles.copyBtn}
                    onClick={() => handleCopy(item)}
                  >
                    COPY
                  </button>

                  <div style={uiStyles.stats}>
                    <div>
                      <h3 style={uiStyles.statValue}>{item?.winningRate}</h3>
                      <p style={uiStyles.statLabel}>Win Rate</p>
                    </div>

                    <div>
                      {/* ✅ UPDATED LINE */}
                      <h3 style={uiStyles.statValue}>
                        {formatFollowers(item?.followers)} 
                      </h3>
                      <p style={uiStyles.statLabel}>Followers</p>
                    </div>

                    <div>
                      <h3 style={uiStyles.statValue}>
                        {Math.floor((item?.totalProfit ?? 0) / 1000)}%
                      </h3>
                      <p style={uiStyles.statLabel}>Profit Share</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CopyTrade;


/* 🎨 STYLES */
const uiStyles = {
  container: {
    backgroundColor: "#0b1220",
    minHeight: "100vh",
    padding: "20px"
  },
  searchWrapper: {
    marginBottom: "20px"
  },
  searchInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #1f2937",
    backgroundColor: "#020617",
    color: "#fff",
    outline: "none",
    fontSize: "16px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#0f172a",
    borderRadius: "16px",
    padding: "20px",
    color: "#fff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px"
  },
  avatar: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    objectFit: "cover"
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  name: {
    fontSize: "16px",
    margin: 0
  },
  badge: {
    background: "#3b82f6",
    borderRadius: "50%",
    fontSize: "10px",
    padding: "4px 6px"
  },
  role: {
    fontSize: "13px",
    color: "#9ca3af"
  },
  copyBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "20px"
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    textAlign: "center"
  },
  statValue: {
    margin: 0,
    fontSize: "18px"
  },
  statLabel: {
    fontSize: "12px",
    color: "#9ca3af"
  }
};