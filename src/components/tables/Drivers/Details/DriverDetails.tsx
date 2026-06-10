import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, FileText, MapPin, User } from "lucide-react";
import { AppDispatch, RootState } from "../../../../store/redux/store";
import { fetchDriverByIdThunk } from "../../../../store/redux/driver-slice";
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

const money = (value?: number) =>
  typeof value === "number" ? `Rs. ${value.toFixed(2)}` : "Rs. 0.00";

const driverAddress = (driver: any) =>
  driver.address ||
  driver.location?.address ||
  driver.currentLocation?.address ||
  driver.city ||
  "Location not set";

const documentItems = (driver: any) => [
  {
    label: "Aadhaar",
    number: driver.documents?.aadhaarNumber,
    status: driver.documents?.aadhaarStatus,
    files: [
      { label: "Front", url: driver.documents?.aadhaarFront },
      { label: "Back", url: driver.documents?.aadhaarBack },
    ],
  },
  {
    label: "PAN",
    number: driver.documents?.panNumber,
    status: driver.documents?.panStatus,
    files: [{ label: "Front", url: driver.documents?.panFront }],
  },
  {
    label: "License",
    number: driver.documents?.licenseNumber || driver.licenseNumber,
    status: driver.documents?.licenseStatus,
    files: [
      { label: "Front", url: driver.documents?.licenseFront },
      { label: "Back", url: driver.documents?.licenseBack },
    ],
  },
  {
    label: "RC",
    number: driver.documents?.rcNumber,
    status: driver.documents?.rcStatus,
    files: [
      { label: "Front", url: driver.documents?.rcFront },
      { label: "Back", url: driver.documents?.rcBack },
    ],
  },
  {
    label: "Insurance",
    number: driver.documents?.insuranceNumber,
    status: driver.documents?.insuranceStatus,
    files: [{ label: "File", url: driver.documents?.insurance }],
  },
];

export default function DriverDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedDriver: driver, loading, error } = useSelector(
    (state: RootState) => state.driver,
  );

  useEffect(() => {
    if (id) dispatch(fetchDriverByIdThunk(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-medium text-gray-600 ">
          Loading driver details...
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

  if (!driver) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-medium text-gray-500">Driver not found.</p>
      </div>
    );
  }

  const isRideReady =
    driver.approvalStatus === "approved" &&
    driver.profileCompleted === true &&
    driver.documentsVerified === true &&
    driver.status === "active" &&
    driver.isOnline === true &&
    driver.driverStatus === "available";

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 sm:p-4 lg:p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900  "
      >
        <ArrowLeft size={17} /> Back to Drivers
      </button>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white  ">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            {driver.profileImage ? (
              <img
                src={driver.profileImage}
                alt={driver.name || "Driver"}
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
                  {driver.name || driver.contactNumber}
                </h1>
                <StatusPill value={driver.status} />
                <StatusPill value={driver.approvalStatus} />
              </div>
              <p className="mt-1 break-all text-sm text-gray-500">
                {driver.email || "No email"} | {driver.contactNumber}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 ">
                <span className="flex items-center gap-1">
                  <MapPin size={15} className="text-red-500" />
                  {driver.city || "Location not set"}
                </span>
                <StarRating
                  value={driver.rating?.average}
                  count={driver.rating?.count}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed Rides" value={driver.rideStats?.completed ?? 0} />
        <StatCard label="Cancelled" value={driver.rideStats?.cancelled ?? 0} />
        <StatCard label="Missed" value={driver.rideStats?.missed ?? 0} />
        <StatCard label="Total Earnings" value={money(driver.earnings?.totalEarnings)} />
      </div>

      <Section title="Account Details">
        <InfoGrid>
          <InfoItem label="Gender" value={driver.gender} />
          <InfoItem label="Date of Birth" value={formatDate(driver.dateOfBirth)} />
          <InfoItem label="Account Status">
            <StatusPill value={driver.status} />
          </InfoItem>
          <InfoItem label="Approval Status">
            <StatusPill value={driver.approvalStatus} />
          </InfoItem>
          <InfoItem label="Online">
            <StatusPill value={driver.isOnline} />
          </InfoItem>
          <InfoItem label="Availability">
            <StatusPill value={driver.driverStatus} />
          </InfoItem>
          <InfoItem label="Ride Ready">
            <StatusPill value={isRideReady} />
          </InfoItem>
          <InfoItem label="OTP Verified" value={formatBoolean(driver.otpVerified)} />
          <InfoItem label="Profile Completed" value={formatBoolean(driver.profileCompleted)} />
          <InfoItem label="Documents Verified" value={formatBoolean(driver.documentsVerified)} />
          <InfoItem label="Created At" value={formatDate(driver.createdAt)} />
          <InfoItem label="Updated At" value={formatDate(driver.updatedAt)} />
          <InfoItem label="Last Online" value={formatDate(driver.lastOnline)} />
          <InfoItem label="Last Offline" value={formatDate(driver.lastOffline)} />
          <InfoItem label="Location" value={driverAddress(driver)} />
          <InfoItem label="Verification Remarks" value={driver.verificationRemarks || driver.remarks || "None"} />
        </InfoGrid>
      </Section>

      <Section title="Vehicle & Earnings">
        <InfoGrid>
          <InfoItem label="Vehicle Type" value={driver.vehicleType} />
          <InfoItem label="Vehicle Number" value={driver.vehicleNumber} />
          <InfoItem label="License Number" value={driver.documents?.licenseNumber || driver.licenseNumber} />
          <InfoItem label="Driver Payout" value={money(driver.earnings?.totalDriverPayout)} />
          <InfoItem label="Platform Fee" value={money(driver.earnings?.totalPlatformFee)} />
          <InfoItem label="Total Earnings" value={money(driver.earnings?.totalEarnings)} />
        </InfoGrid>
      </Section>

      <Section title="Driver Documents">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documentItems(driver).map((document) => (
            <div
              key={document.label}
              className="rounded-lg border border-gray-200 p-3 "
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 ">
                    {document.label}
                  </h4>
                  <p className="mt-1 break-all text-xs text-gray-500">
                    {document.number || "Number not available"}
                  </p>
                </div>
                <StatusPill value={document.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {document.files.map((file) =>
                  file.url ? (
                    <a
                      key={file.label}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-md border border-gray-200 bg-gray-50  "
                    >
                      {file.url.toLowerCase().endsWith(".pdf") ? (
                        <div className="flex h-28 items-center justify-center">
                          <FileText className="text-red-500" />
                        </div>
                      ) : (
                        <img
                          src={file.url}
                          alt={`${document.label} ${file.label}`}
                          className="h-28 w-full object-cover transition group-hover:scale-105"
                        />
                      )}
                      <span className="block px-2 py-1 text-xs font-medium text-gray-600 ">
                        {file.label}
                      </span>
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
