import React from "react";
import { motion } from "framer-motion";

const WipPage = ({ title, description, owner, emoji = "🚧" }) => (
  <motion.div
    className="wip-card"
    style={{ minHeight: "70vh" }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: "easeOut" }}
  >
    <motion.div
      className="wip-icon"
      animate={{ rotate: [0, -5, 5, -5, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
    >
      {emoji}
    </motion.div>

    <h1 className="wip-title">{title}</h1>
    <p className="wip-desc">{description}</p>

    {owner && (
      <div className="wip-chip">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        {owner}
      </div>
    )}
  </motion.div>
);

export default WipPage;
