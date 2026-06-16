import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Hourglass,
  Navigation,
} from 'lucide-react';
import styles from './Kyc.module.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const KycWarningCard = () => {
  const { user } = useSelector((state) => state.userAuth);
  const status = user?.kycVerified;
  let navigate = useNavigate()


  


  let title = '';
  let message = '';
  let Icon = null;
  let cardStyle = styles.kycCard;

  if (status === 'true') {
    return <></>;
  } else if (status === 'pending') {
    title = 'Verification Pending';
    message =
      'Your KYC documents have been submitted and are under review. You’ll be notified once verified.';
    Icon = Hourglass;
    cardStyle = `${styles.kycCard} ${styles.pending}`;
  } else {
    title = 'Identity Verification Incomplete';
    message =
      'To access all features, please complete the KYC process by submitting the required documents.';
    Icon = AlertTriangle;
    cardStyle = `${styles.kycCard} ${styles.notVerified}`;
  }

  const handleKycClick = () => {
    // You can navigate or open a modal here
    navigate('/registeration')
  };

  return (
    <div className={cardStyle}>
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} />
      </div>
      <div className={styles.textWrapper}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        {status === 'false' && (
          <button onClick={handleKycClick} className={styles.kycButton}>
            Complete KYC Now
          </button>
        )}
      </div>
    </div>
  );
};

export default KycWarningCard;

