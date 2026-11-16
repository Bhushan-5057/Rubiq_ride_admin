import { useEffect, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Driver, DriverAccountStatus } from "../../../store/api/driver-api";
import {
  RiskBadge,
  StatusUpdateModal,
  getUserId,
} from "../shared/UserRiskStatus";
import { fetchAllDriversThunk, updateDriverStatusThunk } from "../../../store/redux/driver-slice";
import { Modal } from "../../ui/modal";
import { AppDispatch, RootState } from "../../../store/redux/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useNavigate } from "react-router";
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

const formatBooleanLabel = (value?: boolean) =>
  typeof value === "boolean" ? (value ? "Yes" : "No") : "N/A";

export default function DriverTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const { data: drivers, loading, error, pagination } = useSelector(
    (state: RootState) => state.driver,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { query, search, setSearch, setQuery, setSort, setStatusFilter, sortMark } =
    useGetAllTableQuery();

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllDriversThunk(query));
  }, [dispatch, query]);

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setModalMode("edit");
    setIsOpen(true);
  };

  const handleStatusSubmit = async (payload: { status: DriverAccountStatus; blockedReason?: string; adminComment?: string; forceBlock?: boolean }) => {
    if (!selectedDriver) throw new Error("Unable to update driver without a valid id.");
    const id = getUserId(selectedDriver);
    if (!id) throw new Error("Unable to update driver without a valid id.");

    await dispatch(
      updateDriverStatusThunk({
        id,
        status: payload.status,
        blockedReason: payload.blockedReason,
        adminComment: payload.adminComment,
        forceBlock: payload.forceBlock,
      }),
    ).unwrap();
    showToast("Driver status updated successfully.", "success");
    setIsOpen(false);
    dispatch(fetchAllDriversThunk(query));
  };

  const truncateText = (text: string | undefined, maxLength = 20) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const safeDrivers = Array.isArray(drivers) ? (drivers as Driver[]) : [];
  const currentPage = pagination.page || query.page || 1;
  const limit = pagination.limit || query.limit || 10;
  const columnCount = 11;

  return (
    <div className="compact-table overflow-hidden rounded-lg border border-gray-200 bg-white">
      {error && !isOpen && (
        <div className="m-4 rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-3 whitespace-nowrap text-base font-semibold text-gray-900">
            Drivers
          </h2>

          <StatusFilterControl
            value={query.status}
            onChange={setStatusFilter}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Blocked", value: "blocked" },
            ]}
          />

          <StatusFilterControl
            value={query.approvalStatus}
            onChange={(approvalStatus) =>
              setQuery((current) => ({
                ...current,
                approvalStatus,
                page: 1,
              }))
            }
            options={[
              { label: "Incomplete", value: "incompleted" },
              { label: "Pending Approval", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
          />

          <StatusFilterControl
            value={query.driverStatus}
            onChange={(driverStatus) =>
              setQuery((current) => ({
                ...current,
                driverStatus,
                page: 1,
              }))
            }
            options={[
              { label: "Available", value: "available" },
              { label: "Unavailable", value: "unavailable" },
              { label: "On Trip", value: "on_trip" },
            ]}
          />

          <div className="min-w-[250px] flex-1">
            <SearchControl
              placeholder="Search by ID or Name"
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="w-full">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-gray-50">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
                >
                  <button onClick={() => setSort("name")}>
                    Name{sortMark("name")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
                >
                  <button onClick={() => setSort("email")}>
                    Email{sortMark("email")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
                >
                  <button onClick={() => setSort("contactNumber")}>
                    Contact{sortMark("contactNumber")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
                >
                  <button onClick={() => setSort("status")}>
                    Status{sortMark("status")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
                >
                  Risk
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
                >
                  Availability
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
                >
                  Online
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600  whitespace-nowrap"
                >
                  <button onClick={() => setSort("createdAt")}>
                    Created At{sortMark("createdAt")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-600  whitespace-nowrap"
                >
                  <button onClick={() => setSort("updatedAt")}>
                    Updated At{sortMark("updatedAt")}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 "
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
                    Loading drivers...
                  </TableCell>
                </TableRow>
              ) : safeDrivers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    No drivers found.
                  </TableCell>
                </TableRow>
              ) : (
                safeDrivers.map((driver: Driver, index: number) => {
                  const driverNumber = (currentPage - 1) * limit + index + 1;
                  const driverId = `DR${String(driverNumber).padStart(3, "0")}`;
                  const name = driver.name || driver.contactNumber || "-";

                  return (
                    <TableRow key={driver._id}>
                      <TableCell className="px-5 py-4 text-[12px] font-semibold text-gray-700">
                        {driverId}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start  max-w-[150px] truncate text-[12px]">
                        <span title={name}>{truncateText(name)}</span>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500 max-w-[200px] truncate text-[12px]">
                        <span title={driver.email || "-"}>
                          {truncateText(driver.email)}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500  max-w-[150px] truncate text-[12px]">
                        <span title={driver.contactNumber || "-"}>
                          {truncateText(driver.contactNumber)}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span
                          className={`inline-flex min-w-20 justify-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClasses(
                            driver.status,
                          )}`}
                        >
                          {driver.status || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <RiskBadge risk={driver.riskAssessment} />
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-[12px] capitalize">
                        {driver.driverStatus || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-[12px]">
                        {formatBooleanLabel(driver.isOnline)}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-sm text-gray-500 ">
                        {formatDate(driver.createdAt)}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-sm text-gray-500 ">
                        {formatDate(driver.updatedAt)}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 ">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/drivers/${driver.id}`)}
                            title="View"
                            className="p-1.5 rounded-full hover:bg-gray-100 "
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(driver)}
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
      {isOpen && selectedDriver && (
        <Modal title="Update Driver Status" onClose={() => setIsOpen(false)}>
          <div className="relative max-h-[80vh] w-full overflow-y-auto">
            {modalMode === "edit" && selectedDriver && (
              <StatusUpdateModal
                user={selectedDriver}
                userType="driver"
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

