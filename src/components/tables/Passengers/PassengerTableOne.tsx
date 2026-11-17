import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  RiskBadge,
  StatusUpdateModal,
  getUserId,
} from "../shared/UserRiskStatus";
import { fetchAllPassengersThunk, updatePassengerStatusThunk } from "../../../store/redux/passenger-slice";
import { Passenger, PassengerAccountStatus } from "../../../store/api/passenger-api";
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
import { useToast } from "../../ui/toast/ToastContext";

const statusBadgeClasses = (status?: string) => {
  switch (status) {
    case "active":
      return "border-success-200 bg-success-50 text-success-700";
    case "blocked":
      return "border-error-200 bg-error-50 text-error-700";
    case "inactive":
      return "border-warning-200 bg-warning-50 text-warning-700";
    default:
      return "border-brand-200 bg-brand-50 text-brand-700";
  }
};

export default function PassengerTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: passengers, loading, error, pagination } = useSelector(
    (state: RootState) => state.passenger,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const { query, search, setSearch, setQuery, setSort, setStatusFilter, sortMark } =
    useGetAllTableQuery();

  useEffect(() => {
    dispatch(fetchAllPassengersThunk(query));
  }, [dispatch, query]);

  const handleEdit = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setModalMode("edit");
    setIsOpen(true);
  };

  const handleStatusSubmit = async (payload: { status: PassengerAccountStatus; blockedReason?: string; adminComment?: string; forceBlock?: boolean }) => {
    if (!selectedPassenger) throw new Error("Unable to update passenger without a valid id.");
    const id = getUserId(selectedPassenger);
    if (!id) throw new Error("Unable to update passenger without a valid id.");

    await dispatch(
      updatePassengerStatusThunk({
        id,
        status: payload.status,
        blockedReason: payload.blockedReason,
        adminComment: payload.adminComment,
        forceBlock: payload.forceBlock,
      }),
    ).unwrap();
    showToast("Passenger status updated successfully.", "success");
    setIsOpen(false);
    dispatch(fetchAllPassengersThunk(query));
  };

  const truncateText = (text: string | undefined, maxLength = 20) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const safePassengers = Array.isArray(passengers) ? (passengers as Passenger[]) : [];
  const currentPage = pagination.page || query.page || 1;
  const limit = pagination.limit || query.limit || 10;
  const columnCount = 9;

  return (
    <div className="compact-table overflow-hidden rounded-lg border border-gray-200 bg-white">
      {error && !isOpen && (
        <div className="m-4 rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Passengers
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
            <TableHeader className="border-b border-gray-100 bg-gray-50">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600"
                >
                  Passenger ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600"
                >
                  <button onClick={() => setSort("name")}>
                    Name{sortMark("name")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600"
                >
                  <button onClick={() => setSort("email")}>
                    Email{sortMark("email")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600"
                >
                  <button onClick={() => setSort("contactNumber")}>
                    Contact{sortMark("contactNumber")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600"
                >
                  <button onClick={() => setSort("status")}>
                    Status{sortMark("status")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600"
                >
                  Risk
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 whitespace-nowrap"
                >
                  <button onClick={() => setSort("createdAt")}>
                    Created At{sortMark("createdAt")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 whitespace-nowrap"
                >
                  <button onClick={() => setSort("updatedAt")}>
                    Updated At{sortMark("updatedAt")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    Loading passengers...
                  </TableCell>
                </TableRow>
              ) : safePassengers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    No passengers found.
                  </TableCell>
                </TableRow>
              ) : (
                safePassengers.map((passenger: Passenger, index: number) => {
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
                      <TableCell className="px-5 py-4">
                        <RiskBadge risk={passenger.riskAssessment} />
                      </TableCell>
                      {/* Created At */}
                      <TableCell className="px-2 py-2 text-sm text-gray-500 ">
                        {formatDate(
                          passenger.createdAt ? String(passenger.createdAt) : undefined,
                        )}
                      </TableCell>

                      {/* Updated At */}
                      <TableCell className="px-2 py-2 text-sm text-gray-500 ">
                        {formatDate(
                          passenger.updatedAt ? String(passenger.updatedAt) : undefined,
                        )}
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
      {isOpen && selectedPassenger && (
        <Modal title="Update Passenger Status" onClose={() => setIsOpen(false)}>
          <div className="relative max-h-[80vh] w-full overflow-y-auto">
            {modalMode === "edit" && (
              <StatusUpdateModal
                user={selectedPassenger}
                userType="passenger"
                onClose={() => setIsOpen(false)}
                onSubmit={handleStatusSubmit}
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
