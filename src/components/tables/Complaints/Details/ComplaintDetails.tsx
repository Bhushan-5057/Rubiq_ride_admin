import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Complaint, getComplaintById } from "../../../../store/api/complaint-api";
import { getApiErrorMessage } from "../../../../lib/apiError";
import { useToast } from "../../../ui/toast/ToastContext";
import {
  ComplaintDetailTables,
  getComplaintDisplayId,
  getDateValue,
  statusToneLabel,
} from "../ComplaintShared";
import { StatusPill } from "../../shared/DetailUI";
import { formatDate } from "../../../../lib/utils";

export default function ComplaintDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const initialComplaint = location.state as Complaint | undefined;
  const [complaint, setComplaint] = useState<Complaint | null>(
    initialComplaint || null,
  );
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchComplaint = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getComplaintById(id);
        if (isMounted) setComplaint(result);
      } catch (err) {
        if (!isMounted) return;
        const message = getApiErrorMessage(err, "Fetch Complaint Details");
        setError(message);
        showToast(message, "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComplaint();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading && !complaint) return <p>Loading complaint details...</p>;

  if (error && !complaint) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm font-medium text-red-500">{error}</p>
        <button
          onClick={() => navigate("/complaints")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Back to Complaints
        </button>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm font-medium text-red-500">
          Complaint details not found.
        </p>
        <button
          onClick={() => navigate("/complaints")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Back to Complaints
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 sm:p-4 lg:p-6">
      <button
        onClick={() => navigate("/complaints")}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft size={17} /> Back to Complaints
      </button>

      <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-all text-xl font-semibold text-gray-900 sm:text-2xl">
                Complaint Details
              </h1>
              <StatusPill
                value={complaint.status}
                label={statusToneLabel(complaint.status)}
              />
            </div>
            <p className="mt-1 break-all text-sm text-gray-500">
              Complaint ID: {getComplaintDisplayId(complaint, id || "-")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Created: {formatDate(getDateValue(complaint.createdAt))}
            </p>
          </div>
          {loading && (
            <p className="text-xs font-medium text-gray-500">
              Refreshing details...
            </p>
          )}
        </div>
      </section>

      <ComplaintDetailTables complaint={complaint} />
    </div>
  );
}
