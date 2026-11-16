import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import { formatDate } from "../../../../../lib/utils";
import { AppDispatch, RootState } from "../../../../../store/redux/store";
import {
  DocumentStatus,
  DriverDocument,
  fetchAllDocumentsThunk,
  updateDocumentStatusThunk,
} from "../../../../../store/redux/document-slice";
import Badge from "../../../../ui/badge/Badge";
import { Modal } from "../../../../ui/modal";
import { useToast } from "../../../../ui/toast/ToastContext";
import { getApiErrorMessage } from "../../../../../lib/apiError";
import {
  PaginationControls,
  SearchControl,
  StatusFilterControl,
  useGetAllTableQuery,
} from "../../../shared/GetAllTableControls";
import { StatusPill } from "../../../shared/DetailUI";

const documentLabel = (type?: string) =>
  type ? `${type.charAt(0).toUpperCase()}${type.slice(1)} Document` : "Document";

const statusColor = (status?: string) =>
  status === "approved" ? "success" : status === "rejected" ? "error" : "warning";

const isPdf = (url: string) => url.toLowerCase().endsWith(".pdf");

export default function DocumentsTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const {
    data: documents,
    loading,
    error,
  } = useSelector((state: RootState) => state.documents);
  const { query, search, setSearch, setQuery, setStatusFilter } =
    useGetAllTableQuery({ limit: 5 });
  const [selectedDoc, setSelectedDoc] = useState<DriverDocument | null>(null);
  const [remarks, setRemarks] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(false);

  useEffect(() => {
    dispatch(fetchAllDocumentsThunk());
  }, [dispatch]);

  const openDocumentModal = (doc: DriverDocument) => {
    setSelectedDoc(doc);
    setRemarks("");
  };

  const closeDocumentModal = () => {
    setSelectedDoc(null);
    setRemarks("");
    setPreviewImage(null);
    setPreviewZoom(false);
  };

  const handlePreview = async (url: string) => {
    if (isPdf(url)) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Unauthorized or file not found");

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = url.split("/").pop() || "document.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        showToast(getApiErrorMessage(error, "Download Document"), "error");
      }
      return;
    }

    setPreviewImage(url);
    setPreviewZoom(false);
  };

  const handleUpdate = async (status: DocumentStatus) => {
    if (!selectedDoc) return;

    if (status === "rejected" && !remarks.trim()) {
      showToast("Please add remarks before rejecting the document.", "error");
      return;
    }

    try {
      await dispatch(
        updateDocumentStatusThunk({
          driverId: selectedDoc.driverId,
          documentType: selectedDoc.documentType,
          status,
          remarks: status === "rejected" ? remarks : "",
        }),
      ).unwrap();

      setSelectedDoc({ ...selectedDoc, status });
      showToast(`Document ${status} successfully.`, "success");
    } catch {
      // Handled globally
    }
  };

  const renderFileCard = (label: string, url: string | null) => (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {url ? (isPdf(url) ? "PDF document" : "Uploaded image") : "Not uploaded"}
          </p>
        </div>
        {url ? (
          isPdf(url) ? (
            <FileText size={22} className="text-red-500" />
          ) : (
            <Eye size={22} className="text-brand-500" />
          )
        ) : null}
      </div>

      {url ? (
        <>
          {!isPdf(url) && (
            <button
              type="button"
              onClick={() => handlePreview(url)}
              className="mb-3 flex h-56 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition hover:border-brand-200 hover:bg-brand-50/40 sm:h-72"
            >
              <img
                src={url}
                alt={`${selectedDoc?.documentType || "Document"} ${label}`}
                className="max-h-full max-w-full object-contain"
              />
            </button>
          )}
          <button
            type="button"
            onClick={() => handlePreview(url)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
          >
            {isPdf(url) ? <Download size={16} /> : <Eye size={16} />}
            {isPdf(url) ? "Download PDF" : "Preview"}
          </button>
        </>
      ) : (
        <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 sm:h-72">
          No file available
        </div>
      )}
    </div>
  );

  const filteredDocs = useMemo(
    () =>
      documents.filter((doc: any, index: number) => {
        const documentId = `DOC${String(index + 1).padStart(3, "0")}`;
        const driverName = (doc.driverName || doc.driver?.name || "").toLowerCase();
        const type = (doc.documentType || "").toLowerCase();
        const status = (doc.status || "").toLowerCase();
        const keyword = (query.search || "").toLowerCase();

        const matchesSearch =
          !keyword ||
          documentId.toLowerCase().includes(keyword) ||
          driverName.includes(keyword) ||
          type.includes(keyword);
        const matchesStatus = !query.status || status === query.status;

        return matchesSearch && matchesStatus;
      }),
    [documents, query.search, query.status],
  );

  const currentPage = query.page || 1;
  const limit = query.limit || 5;
  const totalPages = Math.max(Math.ceil(filteredDocs.length / limit), 1);
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {error && (
        <div className="m-4 rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Documents
        </h2>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <StatusFilterControl
            value={query.status}
            onChange={setStatusFilter}
            options={[
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
          />
          <SearchControl
            placeholder="Search documents"
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100  ">
              <TableRow>
                <TableCell isHeader className="px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600 ">
                  Doc ID
                </TableCell>
                <TableCell isHeader className="px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600 ">
                  Driver
                </TableCell>
                <TableCell isHeader className="px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600 ">
                  Type
                </TableCell>
                <TableCell isHeader className="px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600 ">
                  Status
                </TableCell>
                <TableCell isHeader className="px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600 ">
                  Actions
                </TableCell>
                <TableCell isHeader className="px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600  whitespace-nowrap">
                  Created At
                </TableCell>
                <TableCell isHeader className="px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-gray-600  whitespace-nowrap">
                  Updated At
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    Loading documents...
                  </TableCell>
                </TableRow>
              ) : paginatedDocs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    No documents found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocs.map((doc: any, index: number) => {
                  const docNumber = (currentPage - 1) * limit + index + 1;
                  const docId = `DOC${String(docNumber).padStart(3, "0")}`;

                  return (
                    <TableRow key={`${doc.driverId}-${doc.documentType}`}>
                      <TableCell className="px-4 py-4 text-[12px] font-medium text-gray-900 ">
                        {docId}
                      </TableCell>

                      <TableCell className="px-4 py-4 text-[12px] font-medium text-gray-900 capitalize">
                        {doc.driverName || "Unknown"}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-[12px] font-medium text-gray-900 capitalize">
                        {doc.documentType.toUpperCase()}
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <Badge
                          color={statusColor(doc.status)}
                          variant="light"
                          size="sm"
                          className="capitalize"
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openDocumentModal(doc)}
                          className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-100"
                        >
                          <Eye size={14} />
                          Review
                        </button>
                      </TableCell>

                      <TableCell className="px-2 py-2 text-[12px] ">
                        {formatDate(doc.createdAt)}
                      </TableCell>

                      <TableCell className="px-2 py-2 text-[12px]">
                        {formatDate(doc.updatedAt)}
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
        pagination={{
          total: filteredDocs.length,
          page: currentPage,
          limit,
          totalPages,
        }}
        query={query}
        setQuery={setQuery}
      />

      {selectedDoc && (
        <Modal
          title="Review Document"
          onClose={closeDocumentModal}
          className="max-h-[92vh] !max-w-[1040px] overflow-y-auto p-4 sm:p-6"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Driver
                  </p>
                  <h3 className="mt-1 break-words text-lg font-semibold text-gray-900">
                    {selectedDoc.driverName || "Unknown Driver"}
                  </h3>
                  <p className="mt-1 break-all text-xs text-gray-500">
                    Driver ID: {selectedDoc.driverId}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Badge variant="light" color="info" className="capitalize">
                    {documentLabel(selectedDoc.documentType)}
                  </Badge>
                  <StatusPill value={selectedDoc.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Document Files
                    </h4>
                    <p className="text-xs text-gray-500">
                      Review only the selected document for this driver.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {renderFileCard("Front", selectedDoc.frontImage)}
                  {renderFileCard("Back", selectedDoc.backImage)}
                </div>
              </div>

              <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Document Status
                  </p>
                  <div className="mt-2">
                    <Badge
                      color={statusColor(selectedDoc.status)}
                      variant="light"
                      className="capitalize"
                    >
                      {selectedDoc.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 lg:grid-cols-1">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="font-semibold text-gray-700">Created</p>
                    <p className="mt-1">{formatDate(selectedDoc.createdAt)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="font-semibold text-gray-700">Updated</p>
                    <p className="mt-1">{formatDate(selectedDoc.updatedAt)}</p>
                  </div>
                </div>

                <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add rejection reason or internal note"
                  className="mt-2 min-h-32 w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
                />

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate("approved")}
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Approve Document
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate("rejected")}
                    className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Reject Document
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </Modal>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => {
            setPreviewImage(null);
            setPreviewZoom(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white p-3 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setPreviewImage(null);
                setPreviewZoom(false);
              }}
              className="mb-3 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Close preview
            </button>
            <div className="flex max-h-[78vh] justify-center overflow-auto rounded-lg bg-gray-50">
              <img
                src={previewImage}
                alt="Document preview"
                onClick={() => setPreviewZoom(!previewZoom)}
                className="max-h-[78vh] cursor-zoom-in object-contain transition-transform"
                style={{ transform: previewZoom ? "scale(1.5)" : "scale(1)" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
