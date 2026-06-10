import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPassengersThunk } from "../../../store/redux/passenger-slice";
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
import {
  PaginationControls,
  SearchControl,
  StatusFilterControl,
  useGetAllTableQuery,
} from "../shared/GetAllTableControls";

const statusBadgeClasses = (status?: string) => {
  switch (status) {
    case "active":
      return "border-green-200 bg-green-50 text-green-700";
    case "blocked":
      return "border-red-200 bg-red-50 text-red-700";
    case "inactive":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
};

const formatBooleanLabel = (value?: boolean) =>
  typeof value === "boolean" ? (value ? "Yes" : "No") : "N/A";

export default function PassengerTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: passengers, loading, error, pagination } = useSelector(
    (state: RootState) => state.passenger,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "delete" | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null);
  const { query, search, setSearch, setQuery, setSort, setStatusFilter, sortMark } =
    useGetAllTableQuery();

  useEffect(() => {
    dispatch(fetchAllPassengersThunk(query));
  }, [dispatch, query]);

  const handleEdit = (passenger: any) => {
    setSelectedPassenger(passenger);
    setModalMode("edit");
    setIsOpen(true);
  };

  const truncateText = (text: string | undefined, maxLength = 20) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const safePassengers = Array.isArray(passengers) ? passengers : [];
  const currentPage = pagination.page || query.page || 1;
  const limit = pagination.limit || query.limit || 5;

  if (loading) return <p>Loading passengers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="compact-table overflow-hidden rounded-lg poppins-semibold-italic border border-gray-200 bg-white  ">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 border-b border-gray-100 ">
        <h2 className="text-sm font-semibold text-gray-800 ">
          Passengers Table
        </h2>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <StatusFilterControl
            value={query.status}
            onChange={setStatusFilter}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Blocked", value: "blocked" },
              { label: "Pending", value: "pending" },
            ]}
          />
          <SearchControl
            placeholder="Search by ID or name"
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="w-full">
          <Table>
            <TableHeader className="border-b border-gray-100 ">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black "
                >
                  Passenger ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black "
                >
                  <button onClick={() => setSort("name")}>
                    Name{sortMark("name")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black "
                >
                  <button onClick={() => setSort("email")}>
                    Email{sortMark("email")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black "
                >
                  <button onClick={() => setSort("contactNumber")}>
                    Contact{sortMark("contactNumber")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black "
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
                    Created At{sortMark("createdAt")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black  whitespace-nowrap"
                >
                  <button onClick={() => setSort("updatedAt")}>
                    Updated At{sortMark("updatedAt")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black "
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 ">
              {safePassengers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-6 text-gray-500 ">
                    No passengers found.
                  </TableCell>
                </TableRow>
              ) : (
                safePassengers.map((passenger: any, index: number) => {
                  const passengerNumber =
                    (currentPage - 1) * limit + index + 1;
                  const passengerId = `P${String(passengerNumber).padStart(3, "0")}`;

                  return (
                    <TableRow key={passenger._id}>
                      <TableCell className="px-5 py-4 text-sm font-semibold text-gray-700 ">
                        {passengerId}
                      </TableCell>
                      {/* Name */}
                      <TableCell className="px-5 py-4 text-start  max-w-[150px] truncate">
                        <span title={passenger.name}>
                          {truncateText(passenger.name)}
                        </span>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="px-5 py-4 text-gray-500  max-w-[200px] truncate">
                        <span title={passenger.email || "-"}>
                          {truncateText(passenger.email)}
                        </span>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="px-5 py-4 text-gray-500  max-w-[150px] truncate">
                        <span title={passenger.contactNumber || "-"}>
                          {truncateText(passenger.contactNumber)}
                        </span>
                      </TableCell>
                      {/* Status */}
                      <TableCell className="px-5 py-4">
                        <span
                          className={`inline-flex min-w-20 justify-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClasses(
                            passenger.status,
                          )}`}
                        >
                          {passenger.status || "N/A"}
                        </span>
                      </TableCell>
                      {/* Created At */}
                      <TableCell className="px-2 py-2 text-sm text-gray-500 ">
                        {formatDate(passenger.createdAt)}
                      </TableCell>

                      {/* Updated At */}
                      <TableCell className="px-2 py-2 text-sm text-gray-500 ">
                        {formatDate(passenger.updatedAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 ">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/passengers/${passenger.id}`)}
                            title="View"
                            className="p-1.5 rounded-full hover:bg-gray-100 "
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(passenger)}
                            title="Edit"
                            className="p-1.5 rounded-full hover:bg-gray-100 "
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

      <PaginationControls
        pagination={pagination}
        query={query}
        setQuery={setQuery}
      />

      {/* Modal */}
      {isOpen && (
        <Modal title="Passenger" onClose={() => setIsOpen(false)}>
          <div className="relative w-full max-h-[80vh] overflow-y-auto overflow-x-auto rounded-xl bg-white p-6 ">
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
