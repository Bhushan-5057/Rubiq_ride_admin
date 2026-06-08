import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RidesTableOne from "../../components/tables/Rides/RidesTableOne";



export default function RideTable() {
  return (
    <>
      <PageMeta
        title=" Ride's Tables Dashboard |"
        description="Ride's Table"
      />
      <PageBreadcrumb pageTitle="Ride's" />
      <div className="space-y-4">
        <RidesTableOne/>
      </div>
    </>
  );
}
