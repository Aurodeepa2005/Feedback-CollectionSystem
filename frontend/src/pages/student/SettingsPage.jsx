import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Badge } from "../../components/ui/PageHeader";
import { FormField, Toggle, FormSection } from "../../components/ui/FormField";
import Modal from "../../components/ui/Modal";
import Icon, { ICONS } from "../../components/ui/Icon";

/* ─── Animation preset ───────────────────────────────────────────────────────── */
const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const SETTINGS_TABS = ["General", "Notifications", "Privacy", "Appearance"];

/* ─── Inline success alert ───────────────────────────────────────────────────── */
function SuccessAlert({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        display: "flex", alignItems: "center", gap: "0.625rem",
        padding: "0.75rem 1rem",
        background: "rgba(34,197,94,0.08)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: "var(--radius-sm)",
        color: "#4ade80", fontSize: "0.82rem", fontWeight: 600,
      }}
    >
      <Icon d={ICONS["check-circle"]} size={15} strokeWidth={2} />
      {message}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   GENERAL TAB
────────────────────────────────────────────────────────────────────────────── */
function GeneralTab() {
  const [prefs, setPrefs] = useState({
    language: "English",
    timezone: "Asia/Kolkata",
    dateFormat: "MMM DD, YYYY",
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <FormSection title="Language & Region" description="Set your preferred language, timezone, and date format">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <FormField id="settings-lang" label="Language" as="select" value={prefs.language} onChange={(e) => setPrefs((s) => ({ ...s, language: e.target.value }))} index={0}>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Hindi</option>
            <option>Mandarin Chinese</option>
          </FormField>

          <FormField id="settings-tz" label="Timezone" as="select" value={prefs.timezone} onChange={(e) => setPrefs((s) => ({ ...s, timezone: e.target.value }))} index={1}>
            <option value="Asia/Kolkata">India Standard Time (IST, UTC+5:30)</option>
            <option value="America/New_York">Eastern Time (ET, UTC-5)</option>
            <option value="America/Los_Angeles">Pacific Time (PT, UTC-8)</option>
            <option value="Europe/London">Greenwich Mean Time (GMT, UTC+0)</option>
            <option value="Europe/Paris">Central European Time (CET, UTC+1)</option>
            <option value="Asia/Tokyo">Japan Standard Time (JST, UTC+9)</option>
            <option value="Australia/Sydney">Australian Eastern Time (AEST, UTC+10)</option>
          </FormField>

          <FormField id="settings-datefmt" label="Date Format" as="select" value={prefs.dateFormat} onChange={(e) => setPrefs((s) => ({ ...s, dateFormat: e.target.value }))} index={2}>
            <option value="MMM DD, YYYY">Jul 11, 2026</option>
            <option value="DD/MM/YYYY">11/07/2026</option>
            <option value="MM/DD/YYYY">07/11/2026</option>
            <option value="YYYY-MM-DD">2026-07-11</option>
          </FormField>

          <AnimatePresence>{success && <SuccessAlert message="Preferences saved successfully!" />}</AnimatePresence>

          <motion.button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.97 }}
            style={{
              height: 42, alignSelf: "flex-start", padding: "0 1.5rem",
              display: "flex", alignItems: "center", gap: 8,
              fontSize: "0.85rem", opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
            ) : (
              <><Icon d={ICONS.check} size={15} strokeWidth={2.5} />Save Preferences</>
            )}
          </motion.button>
        </div>
      </FormSection>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   NOTIFICATIONS TAB
────────────────────────────────────────────────────────────────────────────── */
function NotificationsTab() {
  const [notifs, setNotifs] = useState({
    emailNewForms:       true,
    emailDeadlines:      true,
    inAppResponses:      false,
    weeklySummary:       true,
    systemAnnouncements: true,
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const toggle = (key) => setNotifs((s) => ({ ...s, [key]: !s[key] }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <FormSection title="Email Notifications" description="Choose which email notifications you'd like to receive">
        <div>
          <Toggle
            id="notif-email-new-forms"
            label="New feedback forms available"
            description="Get notified when new feedback forms are published for your enrolled courses."
            checked={notifs.emailNewForms}
            onChange={() => toggle("emailNewForms")}
          />
          <Toggle
            id="notif-email-deadlines"
            label="Form deadline reminders (3 days before)"
            description="Receive a reminder email 3 days before a feedback form's deadline."
            checked={notifs.emailDeadlines}
            onChange={() => toggle("emailDeadlines")}
          />
          <Toggle
            id="notif-weekly"
            label="Weekly summary digest"
            description="A weekly email summarizing your pending forms and feedback activity."
            checked={notifs.weeklySummary}
            onChange={() => toggle("weeklySummary")}
          />
        </div>
      </FormSection>

      <FormSection title="In-App Notifications" description="Control real-time notifications within the platform">
        <div>
          <Toggle
            id="notif-inapp-responses"
            label="Notifications for feedback responses"
            description="Receive in-app alerts when feedback responses are processed."
            checked={notifs.inAppResponses}
            onChange={() => toggle("inAppResponses")}
          />
          <Toggle
            id="notif-system"
            label="System announcements"
            description="Important platform updates, maintenance windows, and announcements from administrators."
            checked={notifs.systemAnnouncements}
            onChange={() => toggle("systemAnnouncements")}
          />
        </div>
      </FormSection>

      <AnimatePresence>{success && <SuccessAlert message="Notification preferences saved!" />}</AnimatePresence>

      <motion.button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.97 }}
        style={{
          height: 42, alignSelf: "flex-start", padding: "0 1.5rem",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: "0.85rem", opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? (
          <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
        ) : (
          <><Icon d={ICONS.check} size={15} strokeWidth={2.5} />Save Notification Settings</>
        )}
      </motion.button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   PRIVACY TAB
────────────────────────────────────────────────────────────────────────────── */
function PrivacyTab() {
  const [privacy, setPrivacy] = useState({
    profileVisible: false,
    analyticsAllowed: true,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);

  const toggle = (key) => setPrivacy((s) => ({ ...s, [key]: !s[key] }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setDeleting(false);
    setDeleteModalOpen(false);
    // In real app: would redirect to logout
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <FormSection title="Privacy Controls" description="Manage how your data is visible and used on the platform">
        <div>
          <Toggle
            id="privacy-profile"
            label="Make my profile visible to faculty"
            description="Allow faculty members to see your name and profile when they view feedback responses."
            checked={privacy.profileVisible}
            onChange={() => toggle("profileVisible")}
          />
          <Toggle
            id="privacy-analytics"
            label="Allow analytics on my feedback patterns"
            description="Help improve the platform by allowing anonymized analysis of your feedback behaviour and patterns."
            checked={privacy.analyticsAllowed}
            onChange={() => toggle("analyticsAllowed")}
          />
        </div>
      </FormSection>

      <AnimatePresence>{success && <SuccessAlert message="Privacy settings saved!" />}</AnimatePresence>

      <motion.button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.97 }}
        style={{
          height: 42, alignSelf: "flex-start", padding: "0 1.5rem",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: "0.85rem", opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? (
          <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
        ) : (
          <><Icon d={ICONS.shield} size={15} strokeWidth={2} />Save Privacy Settings</>
        )}
      </motion.button>

      {/* Danger Zone */}
      <div style={{
        background: "rgba(239,68,68,0.04)",
        border: "1px solid rgba(239,68,68,0.15)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "1rem 1.375rem",
          borderBottom: "1px solid rgba(239,68,68,0.1)",
          background: "rgba(239,68,68,0.04)",
        }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f87171", letterSpacing: "-0.015em" }}>
            Danger Zone
          </h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
            Irreversible and destructive actions
          </p>
        </div>
        <div style={{ padding: "1.375rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.2rem" }}>Delete Account</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <motion.button
            className="btn-danger"
            onClick={() => setDeleteModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}
          >
            <Icon d={ICONS.trash} size={14} strokeWidth={2} />
            Delete Account
          </motion.button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Account"
        message={
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.75rem 1rem",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-sm)",
            }}>
              <Icon d={ICONS.warning} size={16} strokeWidth={2} style={{ color: "#f87171", flexShrink: 0 }} />
              <p style={{ fontSize: "0.82rem", color: "#f87171", fontWeight: 600 }}>
                This action is permanent and cannot be reversed.
              </p>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
              Deleting your account will remove all your profile information, submitted feedback history, and account settings. You will be immediately logged out.
            </p>
          </div>
        }
        confirmLabel="Yes, Delete My Account"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   APPEARANCE TAB
────────────────────────────────────────────────────────────────────────────── */
const ACCENT_COLORS = [
  { id: "blue",   label: "Blue",   color: "#3B82F6" },
  { id: "purple", label: "Purple", color: "#8B5CF6" },
  { id: "cyan",   label: "Cyan",   color: "#06B6D4" },
  { id: "green",  label: "Green",  color: "#10B981" },
  { id: "pink",   label: "Pink",   color: "#EC4899" },
  { id: "orange", label: "Orange", color: "#F97316" },
];

function AppearanceTab() {
  const [theme,       setTheme]       = useState("dark");
  const [fontSize,    setFontSize]    = useState("medium");
  const [accentColor, setAccentColor] = useState("blue");
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Theme */}
      <FormSection title="Theme" description="Choose your preferred visual theme">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          {/* Dark theme */}
          <motion.button
            onClick={() => setTheme("dark")}
            whileHover={{ y: -2 }}
            style={{
              background: theme === "dark" ? "rgba(59,130,246,0.08)" : "var(--bg-overlay)",
              border: theme === "dark" ? "1.5px solid rgba(59,130,246,0.4)" : "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
              transition: "all 0.15s",
              position: "relative",
            }}
          >
            {theme === "dark" && (
              <div style={{
                position: "absolute", top: 10, right: 10,
                width: 18, height: 18, borderRadius: "50%",
                background: "var(--brand)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon d={ICONS.check} size={10} strokeWidth={3} style={{ color: "#fff" }} />
              </div>
            )}
            {/* Dark theme preview */}
            <div style={{
              width: "100%", height: 64, borderRadius: 8,
              background: "#0A0A0A",
              border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "0.625rem",
              display: "flex", flexDirection: "column", gap: 4, padding: 8,
            }}>
              <div style={{ height: 8, width: "60%", borderRadius: 4, background: "rgba(255,255,255,0.12)" }} />
              <div style={{ height: 6, width: "80%", borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
              <div style={{ height: 6, width: "40%", borderRadius: 4, background: "#3B82F680" }} />
            </div>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: theme === "dark" ? "var(--brand)" : "var(--text-primary)", marginBottom: "0.1rem" }}>Dark</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>Current theme · Recommended</p>
          </motion.button>

          {/* Light theme */}
          <div style={{
            background: "var(--bg-overlay)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            cursor: "not-allowed",
            opacity: 0.5,
            position: "relative",
          }}>
            {/* Light theme preview */}
            <div style={{
              width: "100%", height: 64, borderRadius: 8,
              background: "#F8FAFC",
              border: "1px solid rgba(0,0,0,0.08)",
              marginBottom: "0.625rem",
              display: "flex", flexDirection: "column", gap: 4, padding: 8,
            }}>
              <div style={{ height: 8, width: "60%", borderRadius: 4, background: "rgba(0,0,0,0.12)" }} />
              <div style={{ height: 6, width: "80%", borderRadius: 4, background: "rgba(0,0,0,0.06)" }} />
              <div style={{ height: 6, width: "40%", borderRadius: 4, background: "#3B82F680" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.1rem" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>Light</p>
              <Badge variant="pending">Coming Soon</Badge>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>Currently unavailable</p>
          </div>
        </div>
      </FormSection>

      {/* Font Size */}
      <FormSection title="Font Size" description="Adjust the text size across the platform">
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {["small", "medium", "large"].map((size) => (
            <label
              key={size}
              htmlFor={`font-${size}`}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                gap: "0.5rem", cursor: "pointer",
                padding: "0.875rem",
                background: fontSize === size ? "rgba(59,130,246,0.08)" : "var(--bg-overlay)",
                border: fontSize === size ? "1.5px solid rgba(59,130,246,0.35)" : "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                transition: "all 0.15s",
              }}
            >
              <input
                id={`font-${size}`}
                type="radio"
                name="fontSize"
                value={size}
                checked={fontSize === size}
                onChange={() => setFontSize(size)}
                style={{ display: "none" }}
              />
              <span style={{
                fontSize: size === "small" ? "0.78rem" : size === "medium" ? "1rem" : "1.25rem",
                fontWeight: 700,
                color: fontSize === size ? "var(--brand)" : "var(--text-secondary)",
              }}>
                Aa
              </span>
              <span style={{
                fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize",
                color: fontSize === size ? "var(--brand)" : "var(--text-faint)",
              }}>
                {size}
              </span>
            </label>
          ))}
        </div>
      </FormSection>

      {/* Accent Color */}
      <FormSection title="Accent Color" description="Personalize the interface with your preferred color">
        <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
          {ACCENT_COLORS.map((ac) => (
            <motion.button
              key={ac.id}
              onClick={() => setAccentColor(ac.id)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              title={ac.label}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: ac.color,
                border: accentColor === ac.id
                  ? `3px solid #fff`
                  : "3px solid transparent",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: accentColor === ac.id
                  ? `0 0 0 2px ${ac.color}, 0 4px 16px ${ac.color}50`
                  : `0 2px 8px ${ac.color}30`,
                transition: "all 0.18s",
              }}
            >
              {accentColor === ac.id && (
                <Icon d={ICONS.check} size={16} strokeWidth={3} style={{ color: "#fff" }} />
              )}
            </motion.button>
          ))}
        </div>
        <p style={{ fontSize: "0.73rem", color: "var(--text-faint)", marginTop: "0.75rem" }}>
          Selected: <span style={{ color: ACCENT_COLORS.find((c) => c.id === accentColor)?.color, fontWeight: 600 }}>
            {ACCENT_COLORS.find((c) => c.id === accentColor)?.label}
          </span>
        </p>
      </FormSection>

      <AnimatePresence>{success && <SuccessAlert message="Appearance settings saved!" />}</AnimatePresence>

      <motion.button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.97 }}
        style={{
          height: 42, alignSelf: "flex-start", padding: "0 1.5rem",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: "0.85rem", opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? (
          <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Applying…</>
        ) : (
          <><Icon d={ICONS.check} size={15} strokeWidth={2.5} />Apply Appearance</>
        )}
      </motion.button>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("General");

  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "faculty" ? "Faculty" : "Student";

  const TAB_ICONS = {
    General:       ICONS.settings,
    Notifications: ICONS.bell,
    Privacy:       ICONS.shield,
    Appearance:    ICONS.grid,
  };

  return (
    <motion.div className="page-wrapper" {...pageAnim}>
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and platform configuration"
        breadcrumb={[roleLabel, "Settings"]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "1.5rem", marginTop: "1.75rem", alignItems: "start" }}>

        {/* ── Sidebar Tab Nav ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.125rem",
            position: "sticky",
            top: "calc(var(--navbar-h) + 1rem)",
          }}
        >
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ x: isActive ? 0 : 2 }}
                style={{
                  width: "100%",
                  height: 42,
                  padding: "0 0.875rem",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                  color: isActive ? "var(--brand)" : "var(--text-muted)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  transition: "all 0.15s",
                  textAlign: "left",
                  borderLeft: isActive ? "2px solid var(--brand)" : "2px solid transparent",
                }}
              >
                <Icon d={TAB_ICONS[tab]} size={16} strokeWidth={isActive ? 2 : 1.75} />
                {tab}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Tab Content ───────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeTab === "General"       && <GeneralTab />}
            {activeTab === "Notifications" && <NotificationsTab />}
            {activeTab === "Privacy"       && <PrivacyTab />}
            {activeTab === "Appearance"    && <AppearanceTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
