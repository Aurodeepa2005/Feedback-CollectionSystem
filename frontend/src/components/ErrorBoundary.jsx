import React from "react";

/**
 * ErrorBoundary
 * -------------
 * Catches any unhandled React render errors and displays a styled
 * recovery page instead of leaving the user on a blank/black screen.
 *
 * Usage: wrap your root <App /> or any subtree:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console so devs can still see the stack
    console.error("[ErrorBoundary] Caught a render error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate back to the previous page safely
    window.history.back();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error } = this.state;

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-base, #0a0a0a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            ⚠️
          </div>

          {/* Heading */}
          <div>
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "#f8fafc",
                letterSpacing: "-0.03em",
                marginBottom: "0.5rem",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.65,
              }}
            >
              An unexpected error occurred while rendering this page.
              Your data is safe — this is a display issue only.
            </p>
          </div>

          {/* Error details (collapsible for devs) */}
          {error && (
            <details
              style={{
                width: "100%",
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 10,
                padding: "0.875rem 1rem",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <summary
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#f87171",
                  letterSpacing: "0.02em",
                  userSelect: "none",
                }}
              >
                Error details (for developers)
              </summary>
              <pre
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.4)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                {error.toString()}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={this.handleReset}
              style={{
                height: 40,
                padding: "0 1.25rem",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.75)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              ← Go Back
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                height: 40,
                padding: "0 1.25rem",
                borderRadius: 8,
                border: "none",
                background: "#3B82F6",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#2563EB"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#3B82F6"; }}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
