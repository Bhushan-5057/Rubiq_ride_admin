import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Bike, Mail, MapPin, Phone, Route, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDate } from "../../../../lib/utils";
import {
  Section,
  StatCard,
  StarRating,
  StatusPill,
} from "../../shared/DetailUI";
import { Feedback, getAllFeedback } from "../../../../store/api/feedback-api";
import { getApiErrorMessage } from "../../../../lib/apiError";
import { useToast } from "../../../ui/toast/ToastContext";
import {
  formatFeedbackDateTime,
  roleLabel,
  UserSummary,
} from "../../Feedback/FeedbackShared";

function DetailLine({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-2.5 last:border-b-0  sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 ">
        {label}
      </span>
      <span className="min-w-0 text-sm font-medium text-gray-900  sm:text-right">
        {children || "N/A"}
      </span>
    </div>
  );
}

const getRideFeedbackErrorMessage = (error: unknown) => {
  const message = getApiErrorMessage(error, "Fetch Ride Feedback");
  if (message.includes("Schema hasn't been registered for model")) {
    return "Feedback API is currently misconfigured on the backend.";
  }
  return message;
};

export default function RideDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const ride: any = location.state;
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    const rideId = ride?.rideId || ride?._id;
    if (!rideId) return;

    let isMounted = true;

    const fetchRideFeedback = async () => {
      setFeedbackLoading(true);
      setFeedbackError(null);
      try {
        const result = await getAllFeedback({
          rideId,
          page: 1,
          limit: 20,
        });
        if (isMounted) setFeedbacks(result.feedbacks);
      } catch (error) {
        if (!isMounted) return;
        const message = getRideFeedbackErrorMessage(error);
        setFeedbackError(message);
        showToast(message, "error");
      } finally {
        if (isMounted) setFeedbackLoading(false);
      }
    };

    fetchRideFeedback();

    return () => {
      isMounted = false;
    };
  }, [ride]);

  if (!ride) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm font-medium text-red-500">
          Ride details not found.
        </p>
        <button
          onClick={() => navigate("/rides")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900  "
        >
          <ArrowLeft size={16} /> Back to Ride List
        </button>
      </div>
    );
  }

  const pickupLat = ride.pickup?.coordinates?.[1];
  const pickupLng = ride.pickup?.coordinates?.[0];
  const dropLat = ride.drop?.coordinates?.[1];
  const dropLng = ride.drop?.coordinates?.[0];

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 sm:p-4 lg:p-6">
      <button
        onClick={() => navigate("/rides")}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900  "
      >
        <ArrowLeft size={17} /> Back to Ride List
      </button>

      <section className="rounded-lg border border-gray-200 bg-white p-4   sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-all text-xl font-semibold text-gray-900  sm:text-2xl">
                Ride Details
              </h1>
              <StatusPill value={ride.status} />
            </div>
            <p className="mt-1 break-all text-sm text-gray-500">
              Ride ID: {ride.rideId || ride._id || "N/A"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Distance" value={`${ride.distance ?? 0} km`} />
        <StatCard label="Fare Estimate" value={`Rs. ${ride.fareEstimate ?? 0}`} />
        <StatCard label="Created" value={formatDate(ride.createdAt)} />
        <StatCard label="Updated" value={formatDate(ride.updatedAt)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Passenger">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 ">
            <User size={18} className="text-blue-500" />
            Passenger Details
          </div>
          <div className="rounded-lg bg-gray-50 px-3 ">
            <DetailLine label="Name">{ride.passenger?.name || "N/A"}</DetailLine>
            <DetailLine label="Contact">
              <span className="inline-flex items-center gap-1">
                <Phone size={14} /> {ride.passenger?.contactNumber || "N/A"}
              </span>
            </DetailLine>
            <DetailLine label="Email">
              <span className="inline-flex items-center gap-1 break-all">
                <Mail size={14} /> {ride.passenger?.email || "N/A"}
              </span>
            </DetailLine>
          </div>
        </Section>

        <Section title="Driver">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 ">
            <Bike size={18} className="text-green-500" />
            Driver Details
          </div>
          <div className="rounded-lg bg-gray-50 px-3 ">
            <DetailLine label="Name">{ride.driver?.name || "Not assigned"}</DetailLine>
            <DetailLine label="Vehicle Number">
              {ride.driver?.vehicleNumber || "N/A"}
            </DetailLine>
            <DetailLine label="Vehicle Type">
              {ride.driver?.vehicleType || "N/A"}
            </DetailLine>
            <DetailLine label="Contact">
              <span className="inline-flex items-center gap-1">
                <Phone size={14} /> {ride.driver?.contactNumber || "N/A"}
              </span>
            </DetailLine>
          </div>
        </Section>
      </div>

      <Section title="Feedback">
        {feedbackLoading ? (
          <p className="text-sm text-gray-500">Loading feedback...</p>
        ) : feedbackError ? (
          <p className="text-sm text-red-500">{feedbackError}</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-sm text-gray-500">No feedback found for this ride</p>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="rounded-lg border border-gray-200 p-3 "
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <StarRating value={feedback.rating || 0} />
                    <p className="mt-2 break-words text-sm leading-6 text-gray-700 ">
                      {feedback.comment || "No comment provided."}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatFeedbackDateTime(feedback.createdAt)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-gray-50 p-3 ">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Given By
                      </p>
                      <StatusPill
                        value={feedback.givenBy}
                        label={roleLabel(feedback.givenBy)}
                      />
                    </div>
                    <UserSummary user={feedback.givenByUser} />
                  </div>

                  <div className="rounded-md bg-gray-50 p-3 ">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Given To
                      </p>
                      <StatusPill
                        value={feedback.givenTo}
                        label={roleLabel(feedback.givenTo)}
                      />
                    </div>
                    <UserSummary user={feedback.givenToUser} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Route">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-3 ">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 ">
              <MapPin size={18} className="text-green-500" />
              Pickup
            </div>
            <p className="text-sm leading-6 text-gray-700 ">
              {ride.pickup?.address || "N/A"}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-3 ">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 ">
              <MapPin size={18} className="text-red-500" />
              Drop
            </div>
            <p className="text-sm leading-6 text-gray-700 ">
              {ride.drop?.address || "N/A"}
            </p>
          </div>
        </div>

        {pickupLat && pickupLng && dropLat && dropLng && (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 ">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900  ">
              <Route size={17} /> Ride Route Map
            </div>
            <iframe
              title="ride-route-map"
              width="100%"
              height="420"
              className="h-[320px] w-full sm:h-[420px]"
              loading="lazy"
              src={`https://maps.google.com/maps?saddr=${pickupLat},${pickupLng}&daddr=${dropLat},${dropLng}&output=embed`}
            />
          </div>
        )}
      </Section>
    </div>
  );
}
