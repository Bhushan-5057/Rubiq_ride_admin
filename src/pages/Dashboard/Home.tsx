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

const recentLimit = 5;

const getRecentItems = <T extends { createdAt?: string | number | Date }>(
  items: T[],
) =>
  [...items]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, recentLimit);

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
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-theme-xs dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
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
    <section className="compact-table rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 dark:border-white/[0.05]">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
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
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  isHeader
                  className="text-start font-medium text-gray-700 dark:text-white whitespace-nowrap"
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
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
  const passengers = useSelector((state: RootState) => state.passenger.data);
  const drivers = useSelector((state: RootState) => state.driver.data);
  const rides = useSelector((state: RootState) => state.ride.data);

  useEffect(() => {
    dispatch(fetchAllPassengersThunk());
    dispatch(fetchAllDriversThunk());
    dispatch(fetchAllRidesThunk());
  }, [dispatch]);

  const recentPassengers = getRecentItems(passengers);
  const recentDrivers = getRecentItems(drivers);
  const recentRides = getRecentItems(rides);

  return (
    <>
      <PageMeta title="" description="" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Passengers"
            value={passengers.length}
            icon={<Users size={18} />}
          />
          <StatCard
            label="Total Drivers"
            value={drivers.length}
            icon={<Car size={18} />}
          />
          <StatCard
            label="Total Rides"
            value={rides.length}
            icon={<Route size={18} />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DashboardTable
            title="Newly Added Passengers"
            to="/passengers"
            headers={["ID", "Name", "Contact", "Created"]}
            emptyText="No passengers found."
          >
            {recentPassengers.map((passenger: any, index) => (
              <TableRow key={passenger.id || passenger._id || index}>
                <TableCell className="font-semibold text-gray-700 dark:text-white">
                  {`P${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-[130px] truncate text-gray-600 dark:text-white">
                  {passenger.name || "-"}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-white whitespace-nowrap">
                  {passenger.contactNumber || "-"}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-white whitespace-nowrap">
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
            {recentDrivers.map((driver: any, index) => (
              <TableRow key={driver.id || driver._id || index}>
                <TableCell className="font-semibold text-gray-700 dark:text-white">
                  {`DR${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-[130px] truncate text-gray-600 dark:text-white">
                  {driver.name || "-"}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-white whitespace-nowrap">
                  {driver.contactNumber || "-"}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-white whitespace-nowrap">
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
            {recentRides.map((ride: any, index) => (
              <TableRow key={ride.rideId || `${ride.createdAt}-${index}`}>
                <TableCell className="font-semibold text-gray-700 dark:text-white whitespace-nowrap">
                  {`RI${String(index + 1).padStart(3, "0")}`}
                </TableCell>
                <TableCell className="max-w-[120px] truncate text-gray-500 dark:text-white">
                  {ride.passenger?.name || "-"}
                </TableCell>
                <TableCell className="max-w-[120px] truncate text-gray-500 dark:text-white">
                  {ride.driver?.name || "-"}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-white whitespace-nowrap">
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
