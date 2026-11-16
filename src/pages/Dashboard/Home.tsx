import { Children, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  CircleAlert,
  Route,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import PageMeta from "../../components/common/PageMeta";
import { AppDispatch, RootState } from "../../store/redux/store";
import { fetchAllPassengersThunk } from "../../store/redux/passenger-slice";
import { fetchAllDriversThunk } from "../../store/redux/driver-slice";
import { fetchAllRidesThunk } from "../../store/redux/rideSlice";
import { Complaint, getAllComplaints } from "../../store/api/complaint-api";
import { getApiErrorMessage } from "../../lib/apiError";
import {
  getDateValue,
  getRaisedByRole,
  labelize,
} from "../../components/tables/Complaints/ComplaintShared";
import { useToast } from "../../components/ui/toast/ToastContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { formatDate } from "../../lib/utils";
import CountUp from "react-countup";

const latestQuery = {
  page: 1,
  limit: 1000,
  sortBy: "createdAt",
  sortOrder: "desc" as const,
};

function StatCard({
  label,
  value,
  icon,
  delay = 0,
  href,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  delay?: number;
  href?: string;
}) {
  return (
      <Link to={href}>
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-theme-xs  ">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="text-xl font-semibold text-gray-900">
            <CountUp
              start={0}
              end={value}
              duration={2}
              delay={delay}
              separator=","
              preserveValue
            />
          </p>
        </div>
      </div>
    </div>
    </Link>
  );
}

function DashboardTable({
  title,
  to,
  headers,
  children,
  emptyText,
}: {
  title: string;
  to: string;
  headers: string[];
  children: ReactNode;
  emptyText: string;
}) {
  const hasRows = Children.count(children) > 0;

  return (
    <section className="compact-table rounded-lg border border-gray-200 bg-white  ">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 ">
        <h2 className="text-sm font-semibold text-gray-800 ">
          {title}
        </h2>
        <Link
          to={to}
          className="rounded-md bg-brand-500 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-brand-600"
        >
          View all
        </Link>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="border-b border-gray-100 bg-gray-50">
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  isHeader
                  className="px-3 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wide text-gray-600 whitespace-nowrap"
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {hasRows ? children : (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

type LooseRecord = Record<string, unknown>;

const asRecord = (value: unknown): LooseRecord =>
  value && typeof value === "object" ? (value as LooseRecord) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const getNestedString = (value: unknown, key: string) => {
  const record = asRecord(value);
  return asString(record[key]);
};

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const passengerState = useSelector((state: RootState) => state.passenger);
  const driverState = useSelector((state: RootState) => state.driver);
  const rideState = useSelector((state: RootState) => state.ride);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [totalComplaints, setTotalComplaints] = useState(0);

  useEffect(() => {
    dispatch(fetchAllPassengersThunk(latestQuery));
    dispatch(fetchAllDriversThunk(latestQuery));
    dispatch(fetchAllRidesThunk(latestQuery));
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const fetchComplaints = async () => {
      try {
        const result = await getAllComplaints(latestQuery);
        if (!isMounted) return;
        setRecentComplaints(result.complaints);
        setTotalComplaints(result.pagination.total);
      } catch (error) {
        if (!isMounted) return;
        showToast(getApiErrorMessage(error, "Fetch Complaints"), "error");
      }
    };

    fetchComplaints();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const recentPassengers = passengerState.data ?? [];
  const recentDrivers = driverState.data ?? [];
  const recentRides = rideState.data ?? [];
  const dashboardTotals = {
    passengers: passengerState.pagination.total,
    drivers: driverState.pagination.total,
    rides: rideState.pagination.total,
    complaints: totalComplaints,
  };

  return (
    <>
      <PageMeta title="Dashboard" description="Rubiq Ride admin overview" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Passengers"
            value={dashboardTotals.passengers}
            delay={0}
            icon={<Users size={18} />}
            href="/passengers"
          />

          <StatCard
            label="Total Drivers"
            value={dashboardTotals.drivers}
            delay={0.3}
            icon={<Car size={18} />}
            href="/driver"
          />

          <StatCard
            label="Total Rides"
            value={dashboardTotals.rides}
            delay={0.6}
            icon={<Route size={18} />}
            href="/rides"
          />

          <StatCard
            label="Total Complaints"
            value={dashboardTotals.complaints}
            delay={0.9}
            icon={<CircleAlert size={18} />}
            href="/complaints"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardTable
            title="Newly Added Passengers"
            to="/passengers"
            headers={["ID", "Name", "Contact", "Created"]}
            emptyText="No passengers found."
          >
            {recentPassengers.slice(0, 5).map((passenger, index) => (
              <TableRow key={String(passenger.id || passenger._id || index)}>
                <TableCell className="font-semibold text-gray-700 ">
                  {`P${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-32.5 truncate text-gray-600 ">
                  {asString(passenger.name) || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {asString(passenger.contactNumber) || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {formatDate(asString(passenger.createdAt))}
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>

          <DashboardTable
            title="Newly Added Drivers"
            to="/driver"
            headers={["ID", "Name", "Contact", "Created"]}
            emptyText="No drivers found."
          >
            {recentDrivers.slice(0, 5).map((driver, index) => (
              <TableRow key={String(driver.id || driver._id || index)}>
                <TableCell className="font-semibold text-gray-700 ">
                  {`DR${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-32.5 truncate text-gray-600 ">
                  {asString(driver.name) || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {asString(driver.contactNumber) || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {formatDate(asString(driver.createdAt))}
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>

          <DashboardTable
            title="Newly Added Rides"
            to="/rides"
            headers={["Ride", "Passenger", "Driver", "Date"]}
            emptyText="No rides found."
          >
            {recentRides.slice(0, 5).map((ride, index) => (
              <TableRow key={String(ride.rideId || `${asString(ride.createdAt)}-${index}`)}>
                <TableCell className="font-semibold text-gray-700  whitespace-nowrap">
                  {`RI${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-32.5 truncate text-gray-500 ">
                  {getNestedString(ride.passenger, "name") || "-"}
                </TableCell>
                <TableCell className="max-w-32.5 truncate text-gray-500 ">
                  {getNestedString(ride.driver, "name") || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {formatDate(asString(ride.createdAt))}
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>

          <DashboardTable
            title="Newly Added Complaints"
            to="/complaints"
            headers={["ID", "Raised By", "Category", "Created"]}
            emptyText="No complaints found."
          >
            {recentComplaints.slice(0, 5).map((complaint, index) => (
              <TableRow key={complaint._id || complaint.complaintId || index}>
                <TableCell className="font-semibold text-gray-700 whitespace-nowrap">
                  {`CP${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-32.5 truncate text-gray-600">
                  {labelize(getRaisedByRole(complaint))}
                </TableCell>
                <TableCell className="max-w-30 truncate text-gray-500">
                  {labelize(complaint.category)}
                </TableCell>
                <TableCell className="text-gray-500 whitespace-nowrap">
                  {formatDate(getDateValue(complaint.createdAt))}
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>
      </div>
    </>
  );
}
