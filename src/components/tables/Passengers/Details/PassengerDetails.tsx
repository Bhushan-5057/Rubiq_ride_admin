import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { AppDispatch, RootState } from "../../../../store/redux/store";
import { fetchPassengerByIdThunk } from "../../../../store/redux/passenger-slice";
import { formatDate } from "../../../../lib/utils";
import {
  formatBoolean,
  InfoGrid,
  InfoItem,
  Section,
  StarRating,
  StatCard,
  StatusPill,
} from "../../shared/DetailUI";

const formatPassengerDate = (value?: string | number | Date) =>
  value ? formatDate(String(value)) : "N/A";

const passengerAddress = (passenger: any) =>
  passenger.address ||
  passenger.location?.address ||
  passenger.city ||
  passenger.location?.type ||
  "Location not set";

export default function PassengerDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedPassenger: passenger, loading, error } = useSelector(
    (state: RootState) => state.passenger,
  );

  useEffect(() => {
    if (id) dispatch(fetchPassengerByIdThunk(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-medium text-gray-600 ">
          Loading passenger details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-sm font-medium text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900  "
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  if (!passenger) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-medium text-gray-500">
          Passenger not found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 sm:p-4 lg:p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900  "
      >
        <ArrowLeft size={17} /> Back to Passengers
      </button>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white  ">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            {passenger.profileImage ? (
              <img
                src={passenger.profileImage}
                alt={passenger.name || "Passenger"}
                className="h-24 w-24 rounded-full border object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 ">
                <User size={34} className="text-gray-400" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-xl font-semibold text-gray-900  sm:text-2xl">
                  {passenger.name || passenger.contactNumber}
                </h1>
                <StatusPill value={passenger.status} />
              </div>
              <p className="mt-1 break-all text-sm text-gray-500">
                {passenger.email || "No email"} | {passenger.contactNumber}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 ">
                <StarRating
                  value={passenger.rating?.average}
                  count={passenger.rating?.count}
                />
                <span className="flex items-center gap-1">
                  <MapPin size={15} className="text-red-500" />
                  {passengerAddress(passenger)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed Rides" value={passenger.rideStats?.completed ?? 0} />
        <StatCard label="Cancelled Rides" value={passenger.rideStats?.cancelled ?? 0} />
        <StatCard
          label="Rating"
          value={(passenger.rating?.average ?? 0).toFixed(1)}
          helper={`${passenger.rating?.count ?? 0} review(s)`}
        />
        <StatCard label="Status" value={<StatusPill value={passenger.status} />} />
      </div>

      <Section title="Passenger Profile">
        <InfoGrid>
          <InfoItem label="Contact Number" value={passenger.contactNumber} />
          <InfoItem label="Email" value={passenger.email} />
          <InfoItem label="Gender" value={passenger.gender} />
          <InfoItem label="Date of Birth" value={formatPassengerDate(passenger.dateOfBirth)} />
          <InfoItem label="Status">
            <StatusPill value={passenger.status} />
          </InfoItem>
          <InfoItem label="OTP Verified" value={formatBoolean(passenger.otpVerified)} />
          <InfoItem label="Profile Completed" value={formatBoolean(passenger.profileCompleted)} />
          <InfoItem label="Created At" value={formatPassengerDate(passenger.createdAt)} />
          <InfoItem label="Updated At" value={formatPassengerDate(passenger.updatedAt)} />
          <InfoItem label="Last Logout" value={formatPassengerDate(passenger.lastLogoutAt)} />
          <InfoItem label="Location" value={passengerAddress(passenger)} />
        </InfoGrid>
      </Section>
    </div>
  );
}
