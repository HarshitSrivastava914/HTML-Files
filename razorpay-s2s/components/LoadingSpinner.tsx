// components/LoadingSpinner.tsx
export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <>
      <div className="overlay">
        <div className="spinner" />
      </div>
      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0; /* shorthand for top:0; right:0; bottom:0; left:0 */
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999; /* very high */
          pointer-events: all; /* block interactions */
        }
        .spinner {
          border: 6px solid #3498db;
          border-top: 6px solid transparent;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
