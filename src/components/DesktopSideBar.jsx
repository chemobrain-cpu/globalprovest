import React from 'react';
import {
  FaUser, FaTachometerAlt, FaSignOutAlt, FaCog, FaCoins, FaChartLine,FaExchangeAlt
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import styles from './DesktopSideBar.module.css';

const DesktopSideBar = () => {
  const links = [
    { to: '/invest', icon: <FaTachometerAlt />, label: 'Portfolio' },
    { to: '/profile', icon: <FaUser />, label: 'My Profile' },
   
    { to: '/fund-account', icon: <FaCoins />, label: 'Fund Account' },

    { to: '/upgrade', icon: <FaCoins />, label: 'Upgrade' },

    { to: '/trade-center', icon: <FaCoins />, label: 'Trade center' },

    { to: '/withdraw', icon: <FaCoins />, label: 'Withdrawals' },
  
    { to: '/settings', icon: <FaCog />, label: 'Settings' },
    { to: '/logout', icon: <FaSignOutAlt />, label: 'Log-Out' },
  ];

  return (
    <div className={styles.sidebar}  >
      <div className={styles.topSection} >
                <img
                    src="/provest.png"
                    alt="GlobalProvest"
                    className={styles.logo}
                />
          

      </div>

      <div className={styles.navWrapper} >
        {links.map(({ to, icon, label }) => (
          <NavLink
            to={to}
            key={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.icon}>{icon}</div>
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default DesktopSideBar;


