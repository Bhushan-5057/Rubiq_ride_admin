import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPassengersThunk,
  updatePassengerStatusThunk,
} from "../../../store/redux/passenger-slice";
import { AppDispatch, RootState } from "../../../store/redux/store";
import { Modal } from "../../ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { formatDate } from "../../../lib/utils";

export default function PassengerTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    data: passengers,
    loading,
    error,
  } = useSelector((state: RootState) => state.passenger);

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "delete" | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllPassengersThunk());
  }, [dispatch]);

  const handleEdit = (passenger: any) => {
    setSelectedPassenger(passenger);
    setModalMode("edit");
    setIsOpen(true);
  };

  const truncateText = (text: string | undefined, maxLength = 20) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const filteredPassengers = passengers.filter(
    (passenger: any, index: number) => {
      const passengerId = `P${String(index + 1).padStart(3, "0")}`;
      const search = searchTerm.toLowerCase();

      return (
        passengerId.toLowerCase().includes(search) ||
        (passenger.name && passenger.name.toLowerCase().includes(search)) ||
        (passenger.email && passenger.email.toLowerCase().includes(search)) ||
        (passenger.contactNumber &&
          passenger.contactNumber.toLowerCase().includes(search))
      );
    },
  );

  const handlePassengerStatusChange = async (
    passengerId: string,
    newStatus: "active" | "suspended",
  ) => {
    try {
      await dispatch(
        updatePassengerStatusThunk({
          id: passengerId,
          status: newStatus,
        }),
      ).unwrap();
    } catch {
      // Handled globally
    }
  };

  if (loading) return <p>Loading passengers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="compact-table overflow-hidden rounded-lg poppins-semibold-italic border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 border-b border-gray-100 dark:border-white/[0.05]">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
          Passenger List
        </h2>

        <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
          <input
            type="text"
            placeholder="Search by ID or name"
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

      {/* Table Section */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="w-full">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white"
                >
                  Passenger ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white"
                >
                  Profile
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white"
                >
                  Contact
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white whitespace-nowrap"
                >
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white whitespace-nowrap"
                >
                  Updated At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredPassengers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No passengers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPassengers.map((passenger: any, index: number) => {
                  const passengerId = `P${String(index + 1).padStart(3, "0")}`;

                  return (
                    <TableRow key={passenger._id}>
                      <TableCell className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-white">
                        {passengerId}
                      </TableCell>

                      {/* Profile */}
                      <TableCell className="px-5 py-4 text-start">
                        {passenger.profileImage ? (
                          <img
                            src={passenger.profileImage}
                            alt={passenger.name || "Passenger"}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <span className="text-xs">N/A</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Name */}
                      <TableCell className="px-5 py-4 text-start dark:text-white max-w-[150px] truncate">
                        <span title={passenger.name}>
                          {truncateText(passenger.name)}
                        </span>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-white max-w-[200px] truncate">
                        <span title={passenger.email || "-"}>
                          {truncateText(passenger.email)}
                        </span>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-white max-w-[150px] truncate">
                        <span title={passenger.contactNumber || "-"}>
                          {truncateText(passenger.contactNumber)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-5 py-4">
                        <select
                          value={passenger.status}
                          onChange={(e) =>
                            handlePassengerStatusChange(
                              passenger.id,
                              e.target.value as "active" | "suspended",
                            )
                          }
                          className={`rounded-md border px-2 py-1 text-sm font-medium transition-colors
                            ${passenger.status === "active"
                                ? "border-green-500 text-green-700 bg-green-100 dark:text-green-400 dark:border-green-400 dark:bg-green-900/20"
                                : "border-red-500 text-red-700 bg-red-100 dark:text-red-400 dark:border-red-400 dark:bg-red-900/20"
                            }
                            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200
                            dark:bg-gray-800
                          `}
                        >
                          <option
                            value="active"
                            className="text-green-600 bg-green-50 dark:bg-gray-800 dark:text-green-400"
                          >
                            Active
                          </option>
                          <option
                            value="suspended"
                            className="text-red-600 bg-red-50 dark:bg-gray-800 dark:text-red-400"
                          >
                            Suspended
                          </option>
                        </select>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="px-2 py-2 text-sm text-gray-500 dark:text-white">
                        {formatDate(passenger.createdAt)}
                      </TableCell>

                      {/* Updated At */}
                      <TableCell className="px-2 py-2 text-sm text-gray-500 dark:text-white">
                        {formatDate(passenger.updatedAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/passengers/${passenger.id}`)}
                            title="View"
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(passenger)}
                            title="Edit"
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <Modal title="Passenger" onClose={() => setIsOpen(false)}>
          <div className="relative w-full max-h-[80vh] overflow-y-auto overflow-x-auto rounded-xl bg-white p-6 dark:bg-gray-900">
            {modalMode === "edit" && selectedPassenger && (
              <div>Edit form goes here</div>
            )}
            {modalMode === "delete" && selectedPassenger && (
              <div className="flex flex-col gap-4">
                <p>
                  Are you sure you want to delete{" "}
                  {selectedPassenger.name || selectedPassenger.contactNumber}?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
