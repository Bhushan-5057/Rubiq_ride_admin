import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/redux/store";
import { fetchDriverByIdThunk } from "../../../../store/redux/driver-slice";
import { FileText, MapPin, ArrowLeft } from "lucide-react";
import Badge from "../../../ui/badge/Badge";
import { useNavigate } from "react-router-dom";


const DriverDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    selectedDriver: driver,
    loading,
    error,
  } = useSelector((state: RootState) => state.driver);

  useEffect(() => {
    if (id) {
      dispatch(fetchDriverByIdThunk(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-lg font-medium">Loading driver details...</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-lg font-medium text-gray-500">Driver not found.</p>
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
              className={`fill-none stroke-[4] ${driver.status === "suspended"
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
          <img
            src={driver.profileImage}
            alt={driver.name}
            className="
      w-[88%]
      h-[88%]
      rounded-full
      object-cover
      border-2 border-white
      dark:border-gray-900
      shadow-md
    "
          />
        </div>

        {/* Text Info */}
        <div className="text-center sm:text-left flex-1 mt-4! sm:mt-0">
          <h2 className="text-xl sm:text-2xl font-bold dark:text-white">{driver.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 mb-2 sm:text-base">{driver.email}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-1">
            <MapPin size={14} className="text-red-500" />
            <Badge color="primary">{driver.city}</Badge>
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8 text-gray-700 dark:text-gray-200">
        <p><strong>Contact:</strong> {driver.contactNumber}</p>
        <p><strong>Vehicle Type:</strong> {driver.vehicleType}</p>
        <p><strong>Vehicle Number:</strong> {driver.vehicleNumber}</p>
        <p><strong>License Number:</strong> {driver.licenseNumber}</p>
        <p>
          <strong>Status:</strong>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${driver.status === "active"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
              }`}
          >
            {driver.status}
          </span>
        </p>
        <p>
          <strong>Approval Status:</strong>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${driver.approvalStatus === "approved"
              ? "bg-green-100 text-green-700 border-green-300"
              : driver.approvalStatus === "pending"
                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                : driver.approvalStatus === "rejected"
                  ? "bg-red-100 text-red-700 border-red-300"
                  : "bg-gray-100 text-gray-600 border-gray-300"
              }`}
          >
            {driver.approvalStatus || "Not Available"}
          </span>
        </p>
        <p>
          <strong>Documents Verified:</strong>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${driver.documentsVerified
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
              }`}
          >
            {driver.documentsVerified ? "Approved" : "Rejected"}
          </span>
        </p>
        <p className="col-span-full"><strong>Remarks:</strong> {driver.verificationRemarks || "None"}</p>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Aadhaar", status: driver.documents?.aadhaarStatus, urlFront: driver.documents?.aadhaarFront, urlBack: driver.documents?.aadhaarBack },
          { label: "PAN", status: driver.documents?.panStatus, urlFront: driver.documents?.panFront },
          { label: "License", status: driver.documents?.licenseStatus, urlFront: driver.documents?.licenseFront, urlBack: driver.documents?.licenseBack },
          { label: "RC", status: driver.documents?.rcStatus, urlFront: driver.documents?.rcFront, urlBack: driver.documents?.rcBack },
        ].map(({ label, status, urlFront, urlBack }) => (
          <div
            key={label}
            className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2"
          >
            <span className="font-medium text-sm sm:text-base dark:text-gray-200">{label}</span>
            <div
              className={`flex gap-2 flex-wrap justify-center ${!urlBack && urlFront ? "justify-center" : "justify-start sm:justify-center"
                }`}
            >
              {[urlFront, urlBack].map((url, idx) => {
                if (!url) return null;
                const isPDF = url.toLowerCase().endsWith(".pdf");
                return (
                  <div
                    key={idx}
                    className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border cursor-pointer hover:scale-105 transition-transform"
                  >
                    {isPDF ? (
                      <FileText size={32} className="text-red-600 dark:text-red-400" />
                    ) : (
                      <img
                        src={url}
                        alt={`${label} ${idx === 0 ? "Front" : "Back"}`}
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Badge
              className={`px-2 py-0.5 text-xs sm:text-sm font-semibold rounded-full border ${status === "approved"
                ? "bg-green-100 text-green-700 border-green-300"
                : status === "pending"
                  ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                  : status === "rejected"
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-gray-100 text-gray-600 border-gray-300"
                }`}
            >
              {status || "Not Uploaded"}
            </Badge>
          </div>
        ))}
      </div>
    </div>

  );
};

export default DriverDetails;
