import { ArrowLeft, Eye, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { AppDispatch, RootState } from "../../../../../../store/redux/store";
import { useEffect, useState } from "react";
import {
  DocumentStatus,
  fetchAllDocumentsThunk,
  updateDocumentStatusThunk,
} from "../../../../../../store/redux/document-slice";
import Badge from "../../../../../ui/badge/Badge";
import { useToast } from "../../../../../ui/toast/ToastContext";
import { getApiErrorMessage } from "../../../../../../lib/apiError";
import { useNavigate } from "react-router-dom";
import { StatusPill } from "../../../../shared/DetailUI";

export default function DocumentApprovePage() {
  const { showToast } = useToast();

  const { driverId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data: documents } = useSelector(
    (state: RootState) => state.documents
  );

  const [remarksByDoc, setRemarksByDoc] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(false);

  useEffect(() => {
    dispatch(fetchAllDocumentsThunk());
  }, [dispatch]);

  const driverDocs = documents.filter((doc) => doc.driverId === driverId);

  const handleUpdate = async (documentType: string, status: DocumentStatus) => {
    try {
      const remark = remarksByDoc[documentType] || "";

      if (status === "rejected" && !remark.trim()) {
        showToast("Please add remarks before rejecting the document.", "error");
        return;
      }

      await dispatch(
        updateDocumentStatusThunk({
          driverId: driverId!,
          documentType,
          status,
          remarks: status === "rejected" ? remark : "",
        })
      ).unwrap();
    } catch (error) {
      // Handled globally
    }
  };

const handlePreview = async (url: string) => {
  if (url.toLowerCase().endsWith(".pdf")) {
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
  } else {
    // Preview image
    setPreviewImage(url);
    setPreviewZoom(false);
  }
};
  const renderDocCard = (doc: any) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm   ">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold capitalize text-gray-900 ">
            {doc.documentType} Document
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Review uploaded document images and update approval status.
          </p>
        </div>
        <StatusPill value={doc.status} />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {doc.frontImage && (
          <Badge
            onClick={() => handlePreview(doc.frontImage)}
            className="flex cursor-pointer items-center gap-2 px-3 py-2"
          >
            <Eye size={16} /> Front
          </Badge>
        )}

        {doc.backImage && (
          <Badge
            onClick={() => handlePreview(doc.backImage)}
            className="flex cursor-pointer items-center gap-2 px-3 py-2"
          >
            <Eye size={16} /> Back
          </Badge>
        )}
      </div>

      <textarea
        placeholder="Add remarks (optional)"
        className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-500 focus:outline-none   "
        value={remarksByDoc[doc.documentType] || ""}
        onChange={(e) =>
          setRemarksByDoc({
            ...remarksByDoc,
            [doc.documentType]: e.target.value,
          })
        }
      ></textarea>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge
          className="cursor-pointer px-3 py-1.5"
          color="success"
          onClick={() => handleUpdate(doc.documentType, "approved")}
        >
          Approve
        </Badge>

        <Badge
          className="cursor-pointer px-3 py-1.5"
          color="error"
          onClick={() => handleUpdate(doc.documentType, "rejected")}
        >
          Reject
        </Badge>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4 p-3 sm:p-4 lg:p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900  "
        >
          <ArrowLeft size={17} /> Back
        </button>

        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3  ">
          <h2 className="text-base font-semibold text-gray-900 ">
            Driver Documents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Approve or reject documents submitted by this driver.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {driverDocs.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500  ">
              No documents found for this driver.
            </div>
          ) : (
            driverDocs.map((doc) => renderDocCard(doc))
          )}
        </div>
      </div>

    {previewImage && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100000] p-3 sm:p-6"
    onClick={() => {
      setPreviewImage(null);
      setPreviewZoom(false);
    }}
  >
    <div
      className="relative bg-white  p-3 sm:p-4 rounded-xl shadow-xl 
                 w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 p-1 bg-gray-200  rounded-full hover:bg-gray-300  transition"
        onClick={() => {
          setPreviewImage(null);
          setPreviewZoom(false);
        }}
      >
        <X size={18} className="text-black " />
      </button>

      {/* Image */}
      <div className="w-full overflow-hidden rounded-lg flex justify-center">
        <img
          src={previewImage}
          alt="Document"
          className={`transition-transform duration-300 cursor-zoom-in 
                      max-h-[70vh] w-auto object-contain`}
          style={{
            transform: previewZoom ? "scale(1.6)" : "scale(1)",
          }}
          onClick={() => setPreviewZoom(!previewZoom)}
        />
      </div>
    </div>
  </div>
)}

    </>
  );
}
