import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookmarkManager from "./pages/BookmarkManager";
import Settings from "./pages/Settings";
import { LayoutProvider } from "./contexts/LayoutContext";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <LayoutProvider>
        <Router>
          <Routes>
            <Route path="/" element={<BookmarkManager />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Router>
      </LayoutProvider>
    </ErrorBoundary>
  );
}
