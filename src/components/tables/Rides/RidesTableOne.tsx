import { useEffect, useState } from "react";
import { Eye, Search, MapPin } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchAllRidesThunk,
  deleteRideThunk,
} from "../../../store/redux/rideSlice";

import { AppDispatch, RootState } from "../../../store/redux/store";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import { formatDate } from "../../../lib/utils";
import { useToast } from "../../ui/toast/ToastContext";
import Badge from "../../ui/badge/Badge";
import { TrashBinIcon } from "../../../icons";
import { getApiErrorMessage } from "../../../lib/apiError";

export default function RidesTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { showToast } = useToast();

  const {
    data: rides,
    loading,
    error,
  } = useSelector((state: RootState) => state.ride);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllRidesThunk());
  }, [dispatch]);

  const handleDelete = async (rideId: string) => {
    try {
      await dispatch(deleteRideThunk(rideId)).unwrap();

      showToast("Ride deleted successfully", "success");
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  const safeRides = Array.isArray(rides) ? rides : [];

  const filteredRides = safeRides.filter((ride) => {
    const search = searchTerm.toLowerCase();

    const rideId = ride?.rideId?.toLowerCase?.() ?? "";
    const passengerName = ride?.passenger?.name?.toLowerCase?.() ?? "";
    const driverName = ride?.driver?.name?.toLowerCase?.() ?? "";
    const pickupAddress = ride?.pickup?.address?.toLowerCase?.() ?? "";
    const dropAddress = ride?.drop?.address?.toLowerCase?.() ?? "";

    return (
      rideId.includes(search) ||
      passengerName.includes(search) ||
      driverName.includes(search) ||
      pickupAddress.includes(search) ||
      dropAddress.includes(search)
    );
  });

  if (loading) return <p>Loading rides...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="compact-table overflow-hidden rounded-lg poppins-semibold-italic border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* 🔍 Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 border-b border-gray-100 dark:border-white/[0.05]">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
          Ride List
        </h2>

        <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
          <input
            type="text"
            placeholder="Search by ID, passenger, driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-9 py-1.5 text-xs text-gray-700
            placeholder-gray-400 focus:border-gray-500 focus:outline-none
            dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* 🧾 Table Section */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="w-full">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {[
                  "Ride ID",
                  "Passenger",
                  "Driver",
                  "Route",
                  "Distance (km)",
                  "Fare (₹)",
                  "Status",
                  "Date",
                  "Actions",
                ].map((head) => (
                  <TableCell
                    key={head}
                    isHeader
                    className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white whitespace-nowrap"
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredRides.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No rides found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRides.map((ride, index) => (
                  <TableRow key={ride.rideId || `${ride.createdAt}-${index}`}>
                    {/* Ride ID */}
                    <TableCell className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-white">
                      {`RI${String(index + 1).padStart(3, "0")}`}
                    </TableCell>

                    {/* Passenger */}
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-white whitespace-nowrap">
                      {ride.passenger?.name || "-"}
                    </TableCell>

                    {/* Driver */}
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-white whitespace-nowrap">
                      <Badge
                        size="sm"
                        variant="light"
                        color={ride.driver ? "primary" : "light"}
                      >
                        <span className="whitespace-nowrap">
                          {ride.driver?.name || "-"}
                        </span>
                      </Badge>
                    </TableCell>

                    {/* Route */}
                    <TableCell className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-green-500">
                          {(ride.pickup?.address || "").length > 10
                            ? `${(ride.pickup?.address || "").substring(0, 20)}...`
                            : ride.pickup?.address || "-"}
                        </span>

                        <span className="flex items-center gap-1 text-red-500">
                          <MapPin size={15} />

                          {(ride.drop?.address || "").length > 10
                            ? `${(ride.drop?.address || "").substring(0, 20)}...`
                            : ride.drop?.address || "-"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Distance */}
                    <TableCell className="px-5 py-4 text-center text-sm whitespace-nowrap">
                      <Badge
                        size="sm"
                        variant="light"
                        color={
                          ride.distance === 0
                            ? "light"
                            : ride.distance <= 3
                              ? "success"
                              : ride.distance <= 8
                                ? "info"
                                : ride.distance <= 15
                                  ? "warning"
                                  : "error"
                        }
                      >
                        {ride.distance ?? "-"} km
                      </Badge>
                    </TableCell>

                    {/* Fare */}
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-white">
                      ₹ {ride.fareEstimate}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-5 py-4 text-center">
                      <Badge
                        size="sm"
                        variant="light"
                        color={
                          ride.status === "completed"
                            ? "success"
                            : ride.status === "accepted"
                              ? "primary"
                              : "light"
                        }
                      >
                        {ride.status}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap dark:text-white">
                      {formatDate(ride.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                      <div className="flex items-center gap-2">
                        {/* 👁 View Button */}
                        <button
                          onClick={() =>
                            navigate(`/rides/${ride.rideId}`, {
                              state: ride,
                            })
                          }
                          title="View"
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                        >
                          <Eye
                            size={16}
                            style={{ color: "black" }}
                            className="dark:fill-white"
                          />
                        </button>

                        {/* 🗑 Delete Button */}
                        <button
                          onClick={() =>
                            ride.rideId && handleDelete(ride.rideId)
                          }
                          title="Delete"
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <TrashBinIcon
                            style={{
                              fontSize: "15",
                              color: "red",
                            }}
                          />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
