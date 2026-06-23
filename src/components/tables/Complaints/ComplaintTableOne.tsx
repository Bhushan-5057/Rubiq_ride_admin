import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";

import {
  Complaint,
  ComplaintQuery,
  ComplaintStatus,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
} from "../../../store/api/complaint-api";
import { getApiErrorMessage } from "../../../lib/apiError";
import { formatDate } from "../../../lib/utils";
import { defaultPagination } from "../../../store/api/getAllAdapter";
import { useToast } from "../../ui/toast/ToastContext";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  PaginationControls,
  SearchControl,
} from "../shared/GetAllTableControls";
import { StatusPill } from "../shared/DetailUI";
import {
  categoryOptions,
  getAgainstRole,
  getComplaintApiId,
  getComplaintDisplayId,
  getDateValue,
  getRaisedByRole,
  getNextStatusOptions,
  labelize,
  PartySummary,
  statusOptions,
  statusToneLabel,
  truncateText,
} from "./ComplaintShared";

const filterSelectClass =
  "h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 focus:border-gray-500 focus:outline-none sm:w-40";

export default function ComplaintTableOne() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [query, setQuery] = useState<ComplaintQuery>({ page: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [formError, setFormError] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllComplaints(query);
      setComplaints(result.complaints);
      setPagination(result.pagination);
    } catch (err) {
      const message = getApiErrorMessage(err, "Fetch Complaints");
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAllComplaints(query);
        if (!isMounted) return;
        setComplaints(result.complaints);
        setPagination(result.pagination);
      } catch (err) {
        if (!isMounted) return;
        const message = getApiErrorMessage(err, "Fetch Complaints");
        setError(message);
        showToast(message, "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const filteredComplaints = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return complaints;

    return complaints.filter((complaint) => {
      const haystack = [
        complaint.complaintId,
        complaint._id,
        getRaisedByRole(complaint),
        getAgainstRole(complaint),
        complaint.category,
        complaint.status,
        complaint.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [complaints, search]);

  const setFilter = (key: "status" | "category", value: string) => {
    setQuery((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }));
  };

  const openEditModal = async (complaint: Complaint) => {
    setIsEditOpen(true);
    setSelectedComplaint(complaint);
    setFormError("");
    setDetailLoading(true);

    try {
      const detail = await getComplaintById(getComplaintApiId(complaint));
      setSelectedComplaint(detail);
      const nextStatuses = getNextStatusOptions(detail.status);
      setSelectedStatus(nextStatuses[0] || "");
      setAdminResponse(detail.adminResponse || "");
    } catch (err) {
      const message = getApiErrorMessage(err, "Fetch Complaint Details");
      showToast(message, "error");
      const nextStatuses = getNextStatusOptions(complaint.status);
      setSelectedStatus(nextStatuses[0] || "");
      setAdminResponse(complaint.adminResponse || "");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setIsEditOpen(false);
    setSelectedComplaint(null);
    setSelectedStatus("");
    setAdminResponse("");
    setFormError("");
  };

  const handleSubmit = async () => {
    if (!selectedComplaint || !selectedStatus) return;

    const normalizedStatus = selectedStatus as Exclude<ComplaintStatus, "PENDING">;
    if (
      ["RESOLVED", "CLOSED"].includes(normalizedStatus) &&
      !adminResponse.trim()
    ) {
      setFormError("Admin response is required for resolved or closed complaints.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const updatedComplaint = await updateComplaintStatus(
        getComplaintApiId(selectedComplaint),
        {
          status: normalizedStatus,
          adminResponse: adminResponse.trim(),
        },
      );

      setComplaints((current) =>
        current.map((complaint) =>
          getComplaintApiId(complaint) === getComplaintApiId(selectedComplaint)
            ? { ...complaint, ...updatedComplaint }
            : complaint,
        ),
      );
      showToast("Complaint status updated successfully.", "success");
      closeModal();
      fetchComplaints();
    } catch (err) {
      const message = getApiErrorMessage(err, "Update Complaint Status");
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && complaints.length === 0) return <p>Loading complaints...</p>;
  if (error && complaints.length === 0) return <p className="text-red-500">{error}</p>;

  const currentPage = pagination.page || query.page || 1;
  const limit = pagination.limit || query.limit || 20;

  return (
    <div className="compact-table overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Complaints Table
          </h2>
          {loading && (
            <p className="mt-1 text-xs text-gray-500">Refreshing complaints...</p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <select
            value={query.status || ""}
            onChange={(event) => setFilter("status", event.target.value)}
            className={filterSelectClass}
          >
            <option value="">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {labelize(status)}
              </option>
            ))}
          </select>
          <select
            value={query.category || ""}
            onChange={(event) => setFilter("category", event.target.value)}
            className={filterSelectClass}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {labelize(category)}
              </option>
            ))}
          </select>
          <SearchControl
            placeholder="Search complaints..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="border-b border-gray-100">
            <TableRow>
              {[
                "Complaint ID",
                "Raised By",
                "Against",
                "Category",
                "Status",
                "Created At",
                "Actions",
              ].map((heading) => (
                <TableCell
                  key={heading}
                  isHeader
                  className="px-5 py-3 text-start text-[12px] font-semibold uppercase tracking-wide text-gray-600 whitespace-nowrap"
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {filteredComplaints.length === 0 ? (
              <TableRow>
                <TableCell className="py-6 text-center text-gray-500">
                  No complaints found.
                </TableCell>
              </TableRow>
            ) : (
              filteredComplaints.map((complaint, index) => {
                const complaintNumber = (currentPage - 1) * limit + index + 1;
                const fallbackId = `CMP${String(complaintNumber).padStart(3, "0")}`;
                const displayId = getComplaintDisplayId(complaint, fallbackId);
                const againstFallback = complaint.against ? "N/A" : "System";

                return (
                  <TableRow key={getComplaintApiId(complaint) || displayId}>
                    <TableCell className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {fallbackId}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <PartySummary
                        user={complaint.raisedBy}
                        role={getRaisedByRole(complaint)}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <PartySummary
                        user={complaint.against}
                        role={getAgainstRole(complaint)}
                        fallback={againstFallback}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {labelize(complaint.category)}
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <StatusPill
                        value={complaint.status}
                        label={statusToneLabel(complaint.status)}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(getDateValue(complaint.createdAt))}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/complaints/${getComplaintApiId(complaint)}`, {
                              state: complaint,
                            })
                          }
                          title="View"
                          className="rounded-full p-1.5 hover:bg-gray-100"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(complaint)}
                          title="Edit"
                          className="rounded-full p-1.5 hover:bg-gray-100"
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

      <PaginationControls
        pagination={pagination}
        query={query as any}
        setQuery={setQuery as any}
      />

      {selectedComplaint && isEditOpen && (
        <Modal
          title="Update Complaint Status"
          onClose={closeModal}
          className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {getComplaintDisplayId(selectedComplaint, selectedComplaint._id)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {labelize(selectedComplaint.category)} complaint by{" "}
                    {getRaisedByRole(selectedComplaint) || "user"}
                  </p>
                </div>
                <StatusPill
                  value={selectedComplaint.status}
                  label={statusToneLabel(selectedComplaint.status)}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                {truncateText(selectedComplaint.description, 160)}
              </p>
            </div>

            {detailLoading ? (
              <p className="text-sm text-gray-500">Loading complaint details...</p>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Next Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    disabled={getNextStatusOptions(selectedComplaint.status).length === 0}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-gray-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    {getNextStatusOptions(selectedComplaint.status).length === 0 ? (
                      <option value="">No further status available</option>
                    ) : (
                      getNextStatusOptions(selectedComplaint.status).map((status) => (
                        <option key={status} value={status}>
                          {labelize(status)}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Admin Response
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(event) => setAdminResponse(event.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
                    placeholder="Add response for this complaint"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Required when moving a complaint to resolved or closed.
                  </p>
                </div>

                {formError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      !selectedStatus ||
                      getNextStatusOptions(selectedComplaint.status).length === 0
                    }
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
