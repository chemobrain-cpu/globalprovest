import React, { useState } from "react";
import styles from "./AuthModal.module.css";
import { QRCodeCanvas } from "qrcode.react";

export const BitcoinPaymentModal = ({
  modalVisible,
  updateVisibility,
  btcAddress,
  amount
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);

  if (!modalVisible) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(btcAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modalView}>
        <span
          className="material-icons"
          style={{ width: "100%", textAlign: "start", cursor: "pointer" }}
          onClick={updateVisibility}
        >
          close
        </span>

        <p className={styles.modalState}>
          Please send <strong>{amount}</strong> worth of{" "}
          <strong>{btcAddress.name}</strong> to the address below:
        </p>

        <div
          style={{
            padding: "10px",
            borderRadius: "5px",
            wordBreak: "break-all",
            marginBottom: "10px",
            fontSize: "14px",
            fontFamily: "monospace",
            color: "green",
            background: "#f4f4f4"
          }}
        >
          {btcAddress.address}
        </div>

        <div className={styles.modalButtonContainer}>
          <button
            className={styles.acceptBtn}
            style={{ marginBottom: "10px" }}
            onClick={copyToClipboard}
          >
            {copied ? "Copied!" : "Copy Address"}
          </button>

          <button
            className={styles.acceptBtn}
            style={{ marginBottom: "10px" }}
            onClick={() => setShowQR(prev => !prev)}
          >
            {showQR ? "Hide QR Code" : "Show QR Code"}
          </button>
        </div>

        {showQR && (
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <QRCodeCanvas
              value={btcAddress.address}
              size={200}
            />
            <p style={{ marginTop: "10px", fontSize: "13px" }}>
              Scan with your wallet app
            </p>
          </div>
        )}
      </div>
    </div>
  );
};