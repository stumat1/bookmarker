import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BookmarkManager from "./pages/BookmarkManager";
import Settings from "./pages/Settings";
import About from "./pages/About";
import { LayoutProvider } from "./contexts/LayoutContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LayoutProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <header className="bg-gray-800 text-white p-4">
                <nav className="container mx-auto flex justify-between">
                  <div>
                    <Link to="/" className="mr-4">
                      Bookmarks
                    </Link>
                    <Link to="/settings">Settings</Link>
                  </div>
                </nav>
              </header>
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<BookmarkManager />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </main>
              <footer className="bg-gray-800 text-white p-4 mt-auto">
                <div className="container mx-auto text-center">
<Link to="/about" className="mr-4">
                    About
                  </Link>
                  <a
                    href="https://buymeacoffee.com/stumat1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-4"
                  >
                    Buy Me a Coffee
                  </a>
                </div>
              </footer>
            </div>
          </Router>
        </LayoutProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
