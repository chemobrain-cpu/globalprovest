import React from "react";
import styles from "./DepositCardPlan.module.css";
import { BadgeCheck, Pause, Clock } from "lucide-react";

const DepositPlanCard = ({plan}) => {


  const statusColorClass = {
    active: styles.active,
    paused: styles.paused,
    completed: styles.completed,
    expired: styles.expired,
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Deposit Plan</h3>
        <span className={`${styles.status} ${statusColorClass[plan.status]}`}>
          {plan.status}
        </span>
      </div>

      <div className={styles.info}>
        <div className={styles.row}>
          <span>Total Deposits Required:</span>
          <span>{plan.totalDepositsRequired}</span>
        </div>
        <div className={styles.row}>
          <span>Deposits Made:</span>
          <span>{plan.depositsMade}</span>
        </div>
        <div className={styles.row}>
          <span>Deposit Amount:</span>
          <span>${plan.depositAmount.toLocaleString()}</span>
        </div>
        <div className={styles.row}>
          <span>Days Left:</span>
          <span>{plan.daysLeft} days</span>
        </div>
        <div className={styles.row}>
          <span>Start Date:</span>
          <span>{new Date(plan.startDate).toLocaleDateString()}</span>
        </div>
      </div>

      {plan.paused && (
        <div className={styles.alertYellow}>
          <Pause className={styles.icon} />
          This plan is currently paused
        </div>
      )}

      {plan.status === "completed" && (
        <div className={styles.alertBlue}>
          <BadgeCheck className={styles.icon} />
          Congratulations! Plan completed.
        </div>
      )}

      {plan.status === "expired" && (
        <div className={styles.alertRed}>
          <Clock className={styles.icon} />
          This plan has expired.
        </div>
      )}
    </div>
  );
};

export default DepositPlanCard;
