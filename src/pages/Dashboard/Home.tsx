import { Children, useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Car, Route, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import PageMeta from "../../components/common/PageMeta";
import { AppDispatch, RootState } from "../../store/redux/store";
import { fetchAllPassengersThunk } from "../../store/redux/passenger-slice";
import { fetchAllDriversThunk } from "../../store/redux/driver-slice";
import { fetchAllRidesThunk } from "../../store/redux/rideSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { formatDate } from "../../lib/utils";

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
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-theme-xs  ">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="text-xl font-semibold text-gray-900 ">
            {value}
          </p>
        </div>
      </div>
    </div>
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
          <TableHeader className="border-b border-gray-100 ">
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  isHeader
                  className="text-start font-medium text-gray-700  whitespace-nowrap"
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 ">
            {hasRows ? children : (
              <TableRow>
                <TableCell className="py-6 text-center text-gray-500">
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

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const passengerState = useSelector((state: RootState) => state.passenger);
  const driverState = useSelector((state: RootState) => state.driver);
  const rideState = useSelector((state: RootState) => state.ride);

  useEffect(() => {
    dispatch(fetchAllPassengersThunk(latestQuery));
    dispatch(fetchAllDriversThunk(latestQuery));
    dispatch(fetchAllRidesThunk(latestQuery));
  }, [dispatch]);

  const recentPassengers = Array.isArray(passengerState.data)
    ? passengerState.data
    : [];
  const recentDrivers = Array.isArray(driverState.data) ? driverState.data : [];
  const recentRides = Array.isArray(rideState.data) ? rideState.data : [];
  const activePassengerCount = recentPassengers.filter(
    (passenger: any) => passenger.status === "active",
  ).length;
  const onlineActiveDriverCount = recentDrivers.filter(
    (driver: any) => driver.isOnline === true && driver.status === "active",
  ).length;

  return (
    <>
      <PageMeta title="" description="" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Passengers"
            value={passengerState.pagination.total}
            icon={<Users size={18} />}
          />
          <StatCard
            label="Active Passengers"
            value={activePassengerCount}
            icon={<Users size={18} />}
          />
          <StatCard
            label="Total Drivers"
            value={driverState.pagination.total}
            icon={<Car size={18} />}
          />
          <StatCard
            label="Online Drivers"
            value={onlineActiveDriverCount}
            icon={<Car size={18} />}
          />
          <StatCard
            label="Total Rides"
            value={rideState.pagination.total}
            icon={<Route size={18} />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardTable
            title="Newly Added Passengers"
            to="/passengers"
            headers={["ID", "Name", "Contact", "Created"]}
            emptyText="No passengers found."
          >
            {recentPassengers.slice(0, 5).map((passenger: any, index) => (
              <TableRow key={passenger.id || passenger._id || index}>
                <TableCell className="font-semibold text-gray-700 ">
                  {`P${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-[130px] truncate text-gray-600 ">
                  {passenger.name || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {passenger.contactNumber || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {formatDate(passenger.createdAt)}
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
            {recentDrivers.slice(0, 5).map((driver: any, index) => (
              <TableRow key={driver.id || driver._id || index}>
                <TableCell className="font-semibold text-gray-700 ">
                  {`DR${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-[130px] truncate text-gray-600 ">
                  {driver.name || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {driver.contactNumber || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {formatDate(driver.createdAt)}
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
            {recentRides.slice(0, 5).map((ride: any, index) => (
              <TableRow key={ride.rideId || `${ride.createdAt}-${index}`}>
                <TableCell className="font-semibold text-gray-700  whitespace-nowrap">
                  {`RI${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-[120px] truncate text-gray-500 ">
                  {ride.passenger?.name || "-"}
                </TableCell>
                <TableCell className="max-w-[120px] truncate text-gray-500 ">
                  {ride.driver?.name || "-"}
                </TableCell>
                <TableCell className="text-gray-500  whitespace-nowrap">
                  {formatDate(ride.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>
      </div>
    </>
  );
}
