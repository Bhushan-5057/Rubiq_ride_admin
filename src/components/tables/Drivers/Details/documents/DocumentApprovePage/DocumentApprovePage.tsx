import { Eye, X } from "lucide-react";
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

export default function DocumentApprovePage() {
  const { showToast } = useToast();

  const { driverId } = useParams();
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
    <div className="border rounded-xl p-4 shadow-sm poppins-semibold-italic bg-white dark:bg-black/20 dark:text-white">
      <h3 className="font-semibold text-lg capitalize">
        {doc.documentType} Document
      </h3>

      <div className="flex gap-3 mb-3">
        {doc.frontImage && (
          <Badge
            onClick={() => handlePreview(doc.frontImage)}
            className="flex items-center gap-2 px-3 py-2"
          >
            <Eye size={16} /> Front
          </Badge>
        )}

        {doc.backImage && (
          <Badge
            onClick={() => handlePreview(doc.backImage)}
            className="flex items-center gap-2 px-3 py-2"
          >
            <Eye size={16} /> Back
          </Badge>
        )}
      </div>

      <p className="text-sm font-medium">
        Status:{" "}
        <Badge
          color={
            doc.status === "approved"
              ? "success"
              : doc.status === "rejected"
              ? "error"
              : "warning"
          }
          variant="light"
          size="sm"
        >
          {doc.status}
        </Badge>
      </p>

      <textarea
        placeholder="Add remarks (optional)"
        className="w-full mt-3 border rounded-lg p-2 text-sm"
        value={remarksByDoc[doc.documentType] || ""}
        onChange={(e) =>
          setRemarksByDoc({
            ...remarksByDoc,
            [doc.documentType]: e.target.value,
          })
        }
      ></textarea>

      <div className="flex gap-3 mt-4">
        <Badge
          className="cursor-pointer"
          color="success"
          onClick={() => handleUpdate(doc.documentType, "approved")}
        >
          Approve
        </Badge>

        <Badge
          className="cursor-pointer"
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
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Driver Documents</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {driverDocs.map((doc) => renderDocCard(doc))}
        </div>
      </div>

    {previewImage && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6"
    onClick={() => {
      setPreviewImage(null);
      setPreviewZoom(false);
    }}
  >
    <div
      className="relative bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl shadow-xl 
                 w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        onClick={() => {
          setPreviewImage(null);
          setPreviewZoom(false);
        }}
      >
        <X size={18} className="text-black dark:text-white" />
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
