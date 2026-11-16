import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RidesTableOne from "../../components/tables/Rides/RidesTableOne";



export default function RideTable() {
  return (
    <>
      <PageMeta
        title="Rides Management |"
        description="Rides Management"
      />
      <PageBreadcrumb pageTitle="Rides Management" />
      <div className="space-y-4">
        <RidesTableOne/>
      </div>
    </>
  );
}
