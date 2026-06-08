import { MapPin, User, Bike, Phone, Mail, ArrowLeft } from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import Badge from "../../../ui/badge/Badge";

export default function RideDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const ride = location.state;

  if (!ride) {
    return (
      <div className="p-4 sm:p-6 text-center text-red-500">
        Ride details not found
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/rides")}
          className="group flex items-center gap-2 text-sm sm:text-base font-medium text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-blue-400 transition-all duration-200"
        >
          <ArrowLeft
            size={18}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />

          <span>Back to Ride List</span>
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:bg-[#111827] dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white break-words">
              Ride Details
            </h2>

            <p className="text-sm text-gray-500 mt-1 break-all">
              Ride ID: {ride.rideId}
            </p>
          </div>

          <div className="w-fit">
            <Badge
              size="sm"
              variant="light"
              color={
                ride.status === "completed"
                  ? "success"
                  : ride.status === "accepted"
                    ? "primary"
                    : "warning"
              }
            >
              {ride.status}
            </Badge>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Passenger */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-blue-500 shrink-0" size={20} />

              <h3 className="font-semibold text-base sm:text-lg dark:text-white">
                Passenger Details
              </h3>
            </div>

            <div className="space-y-3">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                <span className="font-medium">Name:</span>{" "}
                {ride.passenger?.name}
              </p>

              <p className="flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 break-all">
                <Phone size={16} className="shrink-0" />
                {ride.passenger?.contactNumber}
              </p>

              <p className="flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 break-all">
                <Mail size={16} className="shrink-0" />
                {ride.passenger?.email}
              </p>
            </div>
          </div>

          {/* Driver */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bike className="text-green-500 shrink-0" size={20} />

              <h3 className="font-semibold text-base sm:text-lg dark:text-white">
                Driver Details
              </h3>
            </div>

            <div className="space-y-3">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                <span className="font-medium">Name:</span> {ride.driver?.name}
              </p>

              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-all">
                <span className="font-medium">Vehicle:</span>{" "}
                {ride.driver?.vehicleNumber}
              </p>

              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                <span className="font-medium">Type:</span>{" "}
                {ride.driver?.vehicleType}
              </p>

              <p className="flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 break-all">
                <Phone size={16} className="shrink-0" />
                {ride.driver?.contactNumber}
              </p>
            </div>
          </div>

          {/* Pickup */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-green-500 shrink-0" size={20} />

              <h3 className="font-semibold text-base sm:text-lg dark:text-white">
                Pickup Location
              </h3>
            </div>

            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words">
              {ride.pickup?.address}
            </p>

            <div className="mt-3 text-sm text-gray-500 break-all">
              <p>Lat: {ride.pickup?.coordinates?.[1]}</p>

              <p>Lng: {ride.pickup?.coordinates?.[0]}</p>
            </div>
          </div>

          {/* Drop */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-red-500 shrink-0" size={20} />

              <h3 className="font-semibold text-base sm:text-lg dark:text-white">
                Drop Location
              </h3>
            </div>

            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words">
              {ride.drop?.address}
            </p>

            <div className="mt-3 text-sm text-gray-500 break-all">
              <p>Lat: {ride.drop?.coordinates?.[1]}</p>

              <p>Lng: {ride.drop?.coordinates?.[0]}</p>
            </div>
          </div>
        </div>

        {/* One Full Width Ride Route Map */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-4 dark:text-white">
              Ride Route Map
            </h3>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-sm font-medium text-green-500">
                  Pickup Coordinates
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                  Lat: {ride.pickup?.coordinates?.[1]}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                  Lng: {ride.pickup?.coordinates?.[0]}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-red-500">
                  Drop Coordinates
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                  Lat: {ride.drop?.coordinates?.[1]}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                  Lng: {ride.drop?.coordinates?.[0]}
                </p>
              </div>
            </div>

            {/* Full Width Route Map */}
            <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <iframe
                title="ride-route-map"
                width="100%"
                height="500"
                className="w-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px]"
                loading="lazy"
                src={`https://maps.google.com/maps?saddr=${ride.pickup?.coordinates?.[1]},${ride.pickup?.coordinates?.[0]}&daddr=${ride.drop?.coordinates?.[1]},${ride.drop?.coordinates?.[0]}&output=embed`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-4 min-w-0">
              <p className="text-sm text-gray-500">Distance</p>

              <h4 className="text-lg font-semibold dark:text-white break-words">
                {ride.distance} km
              </h4>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-4 min-w-0">
              <p className="text-sm text-gray-500">Fare</p>

              <h4 className="text-lg font-semibold dark:text-white break-words">
                ₹ {ride.fareEstimate}
              </h4>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-4 min-w-0">
              <p className="text-sm text-gray-500">Created</p>

              <h4 className="text-sm font-semibold dark:text-white break-words">
                {new Date(ride.createdAt).toLocaleString()}
              </h4>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-4 min-w-0">
              <p className="text-sm text-gray-500">Updated</p>

              <h4 className="text-sm font-semibold dark:text-white break-words">
                {new Date(ride.updatedAt).toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
