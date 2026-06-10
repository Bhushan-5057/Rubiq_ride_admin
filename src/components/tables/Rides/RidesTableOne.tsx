import { useEffect } from "react";
import { Eye, MapPin } from "lucide-react";
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
import {
  PaginationControls,
  SearchControl,
  StatusFilterControl,
  useGetAllTableQuery,
} from "../shared/GetAllTableControls";

export default function RidesTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { showToast } = useToast();

  const { data: rides, loading, error, pagination } = useSelector(
    (state: RootState) => state.ride,
  );

  const { query, search, setSearch, setQuery, setSort, setStatusFilter, sortMark } =
    useGetAllTableQuery();

  useEffect(() => {
    dispatch(fetchAllRidesThunk(query));
  }, [dispatch, query]);

  const handleDelete = async (rideId: string) => {
    try {
      await dispatch(deleteRideThunk(rideId)).unwrap();

      showToast("Ride deleted successfully", "success");
      dispatch(fetchAllRidesThunk(query));
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  const safeRides = Array.isArray(rides) ? rides : [];
  const currentPage = pagination.page || query.page || 1;
  const limit = pagination.limit || query.limit || 5;

  if (loading) return <p>Loading rides...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="compact-table overflow-hidden rounded-lg poppins-semibold-italic border border-gray-200 bg-white  ">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 border-b border-gray-100 ">
        <h2 className="text-sm font-semibold text-gray-800 ">
          Rides Table
        </h2>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <StatusFilterControl
            value={query.status}
            onChange={setStatusFilter}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Accepted", value: "accepted" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
          <SearchControl
            placeholder="Search by ID, passenger, driver..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="w-full">
          <Table>
            <TableHeader className="border-b border-gray-100 ">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  Ride ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  Passenger
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  Driver
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  Route
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  <button onClick={() => setSort("distance")}>
                    Distance (km){sortMark("distance")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  <button onClick={() => setSort("fareEstimate")}>
                    Fare (₹){sortMark("fareEstimate")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  <button onClick={() => setSort("status")}>
                    Status{sortMark("status")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  <button onClick={() => setSort("createdAt")}>
                    Date{sortMark("createdAt")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 ">
              {safeRides.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-6 text-gray-500 ">
                    No rides found.
                  </TableCell>
                </TableRow>
              ) : (
                safeRides.map((ride, index) => (
                  <TableRow key={ride.rideId || `${ride.createdAt}-${index}`}>
                    {/* Ride ID */}
                    <TableCell className="px-5 py-4 text-sm font-semibold text-gray-700 ">
                      {`RI${String((currentPage - 1) * limit + index + 1).padStart(3, "0")}`}
                    </TableCell>

                    {/* Passenger */}
                    <TableCell className="px-5 py-4 text-gray-500  whitespace-nowrap">
                      {ride.passenger?.name || "-"}
                    </TableCell>

                    {/* Driver */}
                    <TableCell className="px-5 py-4 text-gray-500  whitespace-nowrap">
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
                    <TableCell className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap">
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
                    <TableCell className="px-5 py-4 text-gray-500 ">
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
                    <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap ">
                      {formatDate(ride.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 ">
                      <div className="flex items-center gap-2">
                        {/* 👁 View Button */}
                        <button
                          onClick={() =>
                            navigate(`/rides/${ride.rideId}`, {
                              state: ride,
                            })
                          }
                          title="View"
                          className="p-1.5 rounded-full hover:bg-gray-100  "
                        >
                          <Eye
                            size={16}
                            style={{ color: "black" }}
                            className=""
                          />
                        </button>

                        {/* 🗑 Delete Button */}
                        <button
                          onClick={() =>
                            ride.rideId && handleDelete(ride.rideId)
                          }
                          title="Delete"
                          className="p-1.5 rounded-full hover:bg-gray-100 "
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

      <PaginationControls
        pagination={pagination}
        query={query}
        setQuery={setQuery}
      />
    </div>
  );
}
