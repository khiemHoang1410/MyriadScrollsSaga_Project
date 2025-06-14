import './ErrorMessage.css';

interface ErrorMessageProps {
  message?: string;
}

export const ErrorMessage = ({ message = 'An unexpected error occurred.' }: ErrorMessageProps) => {
  return (
    <div className="error-container">
      <p className="error-text">⚠️ {message}</p>
    </div>
  );
};