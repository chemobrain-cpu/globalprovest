import React from 'react';
import { FaBitcoin } from 'react-icons/fa';
import styles from './Fallback.module.css';

const Splash = () => {
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.loaderWrapper}>
          <div className={styles.glowRing}></div>

          <div className={styles.iconWrapper}>
            <FaBitcoin className={styles.icon} />
          </div>

          <h1 className={styles.brand}>Globalprovest</h1>
          <p className={styles.tagline}>
            Secure Crypto Investments
          </p>
        </div>
      </div>
    </div>
  );
};

export default Splash;

