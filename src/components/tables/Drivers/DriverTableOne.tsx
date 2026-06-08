import { useEffect, useState } from "react";
import { Eye, Pencil, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllDriversThunk,
  updateDriverStatusThunk,
} from "../../../store/redux/driver-slice";
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

export default function DriverTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: drivers,
    loading,
  } = useSelector((state: RootState) => state.driver);

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "delete" | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllDriversThunk());
  }, [dispatch]);

  const handleEdit = (driver: any) => {
    setSelectedDriver(driver);
    setModalMode("edit");
    setIsOpen(true);
  };

  const handleStatusChange = async (
    driverId: string,
    newStatus: "active" | "suspended",
  ) => {
    try {
      await dispatch(
        updateDriverStatusThunk({ id: driverId, status: newStatus }),
      ).unwrap();
    } catch {}
  };

  const truncateText = (text: string | undefined, maxLength = 20) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const filteredDrivers = drivers.filter((driver: any, index: number) => {
    const driverId = `DR${String(index + 1).padStart(3, "0")}`;
    const name = driver.name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return driverId.toLowerCase().includes(query) || name.includes(query);
  });

  if (loading) return <p>Loading drivers...</p>;

  return (
    <div className="compact-table overflow-hidden rounded-lg border poppins-semibold-italic border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* 🔍 Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 border-b border-gray-100 dark:border-white/[0.05]">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
          Drivers's Management
        </h2>

        <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
          <input
            type="text"
            placeholder="Search by ID or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-400
                 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="w-full">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-sm font-medium text-black dark:text-white"
                >
                  ID
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
              {filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No drivers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map((driver: any, index: number) => {
                  const driverId = `DR${String(index + 1).padStart(3, "0")}`;
                  const name = driver.name || driver.contactNumber || "-";

                  return (
                    <TableRow key={driver._id}>
                      <TableCell className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-white">
                        {driverId}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        {driver.profileImage ? (
                          <img
                            src={driver.profileImage}
                            alt={driver.name || "Driver"}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <span className="text-xs">N/A</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start dark:text-white max-w-[150px] truncate">
                        <span title={name}>{truncateText(name)}</span>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500 dark:text-white max-w-[200px] truncate">
                        <span title={driver.email || "-"}>
                          {truncateText(driver.email)}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500 dark:text-white max-w-[150px] truncate">
                        <span title={driver.contactNumber || "-"}>
                          {truncateText(driver.contactNumber)}
                        </span>
                      </TableCell>
                      {/* 
                      <TableCell className="px-5 py-4">
                        <select
                          value={driver.status}
                          onChange={(e) =>
                            handleStatusChange(driver._id, e.target.value as "active" | "suspended")
                          }
                          className={`rounded-md border px-2 py-1 text-sm font-medium transition-colors
                            ${
                              driver.status === "active"
                                ? "border-green-500 text-green-700 bg-green-100 dark:text-green-400 dark:border-green-400 dark:bg-green-900/20"
                                : "border-red-500 text-red-700 bg-red-100 dark:text-red-400 dark:border-red-400 dark:bg-red-900/20"
                            }
                            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200
                          `}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </TableCell> */}
                      {/* <TableCell className="px-5 py-4">
                        <select
                          value={driver.status}
                          onChange={(e) =>
                            handleStatusChange(
                              driver._id,
                              e.target.value as "active" | "suspended"
                            )
                          }
                          className={`rounded-md border px-2 py-1 text-sm font-medium transition-colors
      ${
        driver.status === "active"
          ? "border-green-500 text-green-700 bg-green-100"
          : "border-red-500 text-red-700 bg-red-100"
      }
      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200
      dark:bg-gray-800 dark:text-white
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
                      </TableCell> */}
                      <TableCell className="px-5 py-4">
                        <select
                          value={driver.status}
                          onChange={(e) =>
                            handleStatusChange(
                              driver.id,
                              e.target.value as "active" | "suspended",
                            )
                          }
                          className={`rounded-md border px-2 py-1 text-sm font-medium transition-colors
                            ${
                              driver.status === "active"
                                ? "border-green-500 text-green-700 bg-green-100 dark:text-green-400 dark:border-green-400 dark:bg-green-900/20"
                                : "border-red-500 text-red-700 bg-red-100 dark:text-red-400 dark:border-red-400 dark:bg-red-900/20"
                            }
                            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200
                            dark:bg-gray-800
                          `}
                        >
                          <option
                            value="active"
                            disabled={driver.approvalStatus === "rejected"}
                            title={
                              driver.approvalStatus === "rejected"
                                ? "Cannot activate: documents rejected"
                                : ""
                            }
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

                      <TableCell className="px-2 py-2 text-sm text-gray-500 dark:text-white">
                        {formatDate(driver.createdAt)}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-sm text-gray-500 dark:text-white">
                        {formatDate(driver.updatedAt)}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/drivers/${driver.id}`)}
                            title="View"
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(driver)}
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
        <Modal title="Driver Details" onClose={() => setIsOpen(false)}>
          <div className="relative w-full max-h-[80vh] overflow-y-auto overflow-x-auto rounded-xl bg-white p-6 dark:bg-gray-900">
            {modalMode === "edit" && selectedDriver && (
              <div>Edit form goes here</div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
