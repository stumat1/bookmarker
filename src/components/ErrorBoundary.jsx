import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    // Clear corrupted data
    if (
      window.confirm(
        "Do you want to clear all data and reset the app? This cannot be undone."
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-purple-950 text-white flex items-center justify-center p-8">
          <div className="max-w-2xl bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-red-700/50 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-red-400 mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-300">
                The application encountered an unexpected error.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900/80 rounded-lg p-4 mb-6 border border-slate-700">
                <p className="text-sm font-mono text-red-300 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Reset App Data
              </button>
            </div>

            <p className="text-sm text-slate-400 text-center mt-6">
              If this problem persists, try exporting your data before
              resetting.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
