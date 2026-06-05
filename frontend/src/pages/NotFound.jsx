import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-blue-100 mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-400 mb-8">
          The page you are looking for does not exist.
        </p>
        <button onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl
                     font-medium hover:bg-blue-700 transition">
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;