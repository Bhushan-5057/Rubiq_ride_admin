import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/redux/store";
import { fetchPassengerByIdThunk } from "../../../../store/redux/passenger-slice";
import { ArrowLeft, Phone, Mail, User } from "lucide-react";
import Badge from "../../../ui/badge/Badge";

const PassengerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    selectedPassenger: passenger,
    loading,
    error,
  } = useSelector((state: RootState) => state.passenger);

  useEffect(() => {
    if (id) {
      dispatch(fetchPassengerByIdThunk(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-lg font-medium">Loading passenger details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh] flex-col gap-4">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Go Back</span>
        </button>
      </div>
    );
  }

  if (!passenger) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-lg font-medium text-gray-500">Passenger not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 xl:max-w-full p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg transition-all">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to List</span>
      </button>

      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 relative">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          {/* THIN SVG RING */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 140 140"
          >
            <circle
              cx="70"
              cy="70"
              r="63"
              className={`fill-none stroke-[4] ${passenger.status === "suspended"
                  ? "stroke-red-400"
                  : "stroke-green-400"
                }`}
              strokeLinecap="round"
              style={{
                strokeDasharray: "395",
                strokeDashoffset: "395",
                animation: "draw-ring 1s forwards ease-out",
              }}
            />
          </svg>

          {/* PROFILE IMAGE */}
          {passenger.profileImage ? (
            <img
              src={passenger.profileImage}
              alt={passenger.name}
              className="w-[88%] h-[88%] rounded-full object-cover border-2 border-white dark:border-gray-900 shadow-md"
            />
          ) : (
            <div className="w-[88%] h-[88%] rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md">
              <User size={48} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Text Info */}
        <div className="text-center sm:text-left flex-1 mt-4 sm:mt-0">
          <h2 className="text-xl sm:text-2xl font-bold dark:text-white">{passenger.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 mb-2 sm:text-base">{passenger.email || "No email provided"}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Badge color={passenger.status === "active" ? "success" : "error"}>
              {passenger.status.charAt(0).toUpperCase() + passenger.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 sm:mb-8 text-gray-700 dark:text-gray-200">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Phone size={12} /> Contact Number
          </p>
          <p className="text-sm sm:text-base font-medium">{passenger.contactNumber || "N/A"}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Mail size={12} /> Email Address
          </p>
          <p className="text-sm sm:text-base font-medium">{passenger.email || "N/A"}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <User size={12} /> Account Status
          </p>
          <p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${passenger.status === "active"
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
                }`}
            >
              {passenger.status}
            </span>
          </p>
        </div>

        {/* Add more fields if available in the API response */}
        {passenger.city && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
               City
            </p>
            <p className="text-sm sm:text-base font-medium">{passenger.city}</p>
          </div>
        )}

        {passenger.createdAt && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
               Joined On
            </p>
            <p className="text-sm sm:text-base font-medium">
              {new Date(passenger.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerDetails;
