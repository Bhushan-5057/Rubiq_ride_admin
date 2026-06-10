import { UserCircle } from "lucide-react";
import { Feedback, FeedbackRide, FeedbackUser } from "../../../store/api/feedback-api";
import { StarRating, StatusPill } from "../shared/DetailUI";

export const roleLabel = (role?: string) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : "N/A";

export const getRideId = (ride?: FeedbackRide | string) => {
  if (!ride) return "N/A";
  if (typeof ride === "string") return ride;
  return ride.rideId || ride._id || "N/A";
};

export const truncateText = (text?: string, maxLength = 40) => {
  if (!text) return "-";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const formatFeedbackDateTime = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function UserSummary({
  user,
  fallback = "N/A",
}: {
  user?: FeedbackUser;
  fallback?: string;
}) {
  return (
    <div className="flex min-w-[150px] items-center gap-2">
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt={user.name || fallback}
          className="h-9 w-9 rounded-full border object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <UserCircle size={20} />
        </div>
      )}
      <span className="max-w-[140px] truncate text-sm font-medium text-gray-800 ">
        {user?.name || fallback}
      </span>
    </div>
  );
}

export function FeedbackDetailContent({ feedback }: { feedback: Feedback }) {
  const ride = feedback.ride;
  const rideObject = typeof ride === "object" && ride ? ride : undefined;

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailBox label="Feedback ID" value={feedback._id} />
        <DetailBox
          label="Created At"
          value={formatFeedbackDateTime(feedback.createdAt)}
        />
      </div>

      <div className="rounded-lg bg-gray-50 p-3 ">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Rating
        </p>
        <StarRating value={feedback.rating || 0} />
      </div>

      <div className="rounded-lg bg-gray-50 p-3 ">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Full Comment
        </p>
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-800 ">
          {feedback.comment || "No comment provided."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-3 ">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Given By
            </p>
            <StatusPill value={feedback.givenBy} label={roleLabel(feedback.givenBy)} />
          </div>
          <UserSummary user={feedback.givenByUser} />
        </div>
        <div className="rounded-lg border border-gray-200 p-3 ">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Given To
            </p>
            <StatusPill value={feedback.givenTo} label={roleLabel(feedback.givenTo)} />
          </div>
          <UserSummary user={feedback.givenToUser} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-3 ">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
          Ride Details
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <DetailBox label="Ride ID" value={getRideId(ride)} />
          <DetailBox label="Status" value={rideObject?.status || "N/A"} />
          <DetailBox label="Fare" value={rideObject?.fareEstimate ? `Rs. ${rideObject.fareEstimate}` : "N/A"} />
          <DetailBox
            label="Ride Date"
            value={formatFeedbackDateTime(rideObject?.createdAt)}
          />
        </div>
        {(rideObject?.pickup?.address || rideObject?.drop?.address) && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <DetailBox label="Pickup" value={rideObject?.pickup?.address || "N/A"} />
            <DetailBox label="Drop" value={rideObject?.drop?.address || "N/A"} />
          </div>
        )}
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0 rounded-md bg-gray-50 px-3 py-2.5 ">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 ">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-gray-900 ">
        {value || "N/A"}
      </p>
    </div>
  );
}
