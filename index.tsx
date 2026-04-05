import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

interface RootErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class RootErrorBoundary extends React.Component<
  React.PropsWithChildren,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "Unknown rendering error",
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Root render crash:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#e2e8f0",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            fontFamily: "Segoe UI, Arial, sans-serif",
          }}
        >
          <div
            style={{
              width: "min(720px, 100%)",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              background: "#0f172a",
            }}
          >
            <h1
              style={{ marginTop: 0, marginBottom: "10px", fontSize: "20px" }}
            >
              App crashed while rendering Home/Feed
            </h1>
            <p style={{ marginTop: 0, marginBottom: "8px", color: "#94a3b8" }}>
              A runtime error occurred. Please share the message below.
            </p>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#fda4af",
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              {this.state.message}
            </pre>
            <button
              onClick={this.handleReload}
              style={{
                marginTop: "14px",
                border: 0,
                borderRadius: "8px",
                background: "#2563eb",
                color: "#fff",
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
);
