import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { getAllFeedback, Feedback, FeedbackQuery } from "../../../store/api/feedback-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Modal } from "../../ui/modal";
import { getApiErrorMessage } from "../../../lib/apiError";
import { formatDate } from "../../../lib/utils";
import { useToast } from "../../ui/toast/ToastContext";
import {
  PaginationControls,
  SearchControl,
} from "../shared/GetAllTableControls";
import { StarRating } from "../shared/DetailUI";
import {
  FeedbackDetailContent,
  roleLabel,
} from "./FeedbackShared";
import { defaultPagination } from "../../../store/api/getAllAdapter";

const filterSelectClass =
  "h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 focus:border-gray-500 focus:outline-none sm:w-36";

const getFeedbackErrorMessage = (error: unknown) => {
  const message = getApiErrorMessage(error, "Fetch Feedback");
  if (message.includes("Schema hasn't been registered for model")) {
    return "Feedback API is currently misconfigured on the backend. Please register the passenger/driver models used by feedback population.";
  }
  return message;
};

export default function FeedbackTableOne() {
  const { showToast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [query, setQuery] = useState<FeedbackQuery>({ page: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAllFeedback(query);
        if (!isMounted) return;
        setFeedbacks(result.feedbacks);
        setPagination(result.pagination);
      } catch (err) {
        if (!isMounted) return;
        const message = getFeedbackErrorMessage(err);
        setError(message);
        showToast(message, "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeedback();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const filteredFeedbacks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return feedbacks;

    return feedbacks.filter((feedback) => {
      const haystack = [
        feedback.givenBy,
        feedback.givenTo,
        feedback.givenByUser?.name,
        feedback.givenToUser?.name,
        feedback.comment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [feedbacks, search]);

  const setFilter = (key: "rating", value: string) => {
    setQuery((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }));
  };

  const currentPage = pagination.page || query.page || 1;
  const limit = pagination.limit || query.limit || 20;
  const columnCount = 6;

  return (
    <div className="compact-table overflow-hidden rounded-lg border border-gray-200 bg-white">
      {error && feedbacks.length === 0 && (
        <div className="m-4 rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Feedback
          </h2>
          {loading && (
            <p className="mt-1 text-xs text-gray-500">Refreshing feedback...</p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <select
            value={query.rating || ""}
            onChange={(event) => setFilter("rating", event.target.value)}
            className={filterSelectClass}
          >
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
          <SearchControl
            placeholder="Search feedback..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="w-full">
          <Table>
            <TableHeader className="border-b border-gray-100 ">
              <TableRow>
                {[
                  "Feedback ID",
                  "Rating",
                  "Given By",
                  "Given To",
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
              {loading && feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    Loading feedback...
                  </TableCell>
                </TableRow>
              ) : filteredFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    No feedback found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedbacks.map((feedback, index) => {
                  const feedbackNumber = (currentPage - 1) * limit + index + 1;
                  const feedbackId = `FB${String(feedbackNumber).padStart(3, "0")}`;

                  return (
                    <TableRow key={feedback._id}>
                      <TableCell className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {feedbackId}
                      </TableCell>
                      <TableCell className="px-5 py-4 whitespace-nowrap">
                        <StarRating value={feedback.rating || 0} />
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {feedback.givenByUser?.name || "N/A"}
                          </span>
                          <span className="text-xs capitalize text-gray-500">
                            {roleLabel(feedback.givenBy)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {feedback.givenToUser?.name || "N/A"}
                          </span>
                          <span className="text-xs capitalize text-gray-500">
                            {roleLabel(feedback.givenTo)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(feedback.createdAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 ">
                        <button
                          onClick={() => setSelectedFeedback(feedback)}
                          title="View"
                          className="rounded-full p-1.5 hover:bg-gray-100 "
                        >
                          <Eye size={16} />
                        </button>
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
        query={query as any}
        setQuery={setQuery as any}
      />

      {selectedFeedback && (
        <Modal
          title="Feedback Details"
          onClose={() => setSelectedFeedback(null)}
          className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto"
        >
          <FeedbackDetailContent feedback={selectedFeedback} />
        </Modal>
      )}
    </div>
  );
}
