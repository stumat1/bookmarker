import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "../components/ErrorBoundary";

// Component that throws an error for testing
function ThrowError({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>Content rendered successfully</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Content rendered successfully")).toBeInTheDocument();
  });

  it("renders error UI when child component throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("The application encountered an unexpected error.")
    ).toBeInTheDocument();
  });

  it("displays the error message", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });

  it("shows Reload Page button", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Reload Page")).toBeInTheDocument();
  });

  it("shows Reset App Data button", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Reset App Data")).toBeInTheDocument();
  });

  it("calls window.location.reload when Reload Page is clicked", () => {
    // Mock window.location.reload
    const reloadMock = vi.fn();
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, reload: reloadMock };

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Reload Page"));
    expect(reloadMock).toHaveBeenCalled();

    // Restore original location
    window.location = originalLocation;
  });

  it("shows confirmation dialog when Reset App Data is clicked", () => {
    const confirmMock = vi.fn().mockReturnValue(false);
    window.confirm = confirmMock;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Reset App Data"));
    expect(confirmMock).toHaveBeenCalledWith(
      "Do you want to clear all data and reset the app? This cannot be undone."
    );
  });

  it("clears localStorage when user confirms reset", () => {
    const confirmMock = vi.fn().mockReturnValue(true);
    window.confirm = confirmMock;

    const clearMock = vi.fn();
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: { ...originalLocalStorage, clear: clearMock },
      writable: true,
    });

    const reloadMock = vi.fn();
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, reload: reloadMock };

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Reset App Data"));
    expect(clearMock).toHaveBeenCalled();
    expect(reloadMock).toHaveBeenCalled();

    // Restore
    window.location = originalLocation;
  });

  it("does not clear localStorage when user cancels reset", () => {
    const confirmMock = vi.fn().mockReturnValue(false);
    window.confirm = confirmMock;

    const clearMock = vi.fn();
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: { ...originalLocalStorage, clear: clearMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Reset App Data"));
    expect(clearMock).not.toHaveBeenCalled();
  });

  it("displays helpful advice about exporting data", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/try exporting your data before resetting/)
    ).toBeInTheDocument();
  });
});
