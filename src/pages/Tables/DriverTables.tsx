import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DriverTableOne from "../../components/tables/Drivers/DriverTableOne";



export default function DriverTable() {
  return (
    <>
      <PageMeta
        title="Drivers Management |"
        description="Drivers Management"
      />
      <PageBreadcrumb pageTitle="Drivers Management"  />
      <div className="space-y-4">
        <DriverTableOne />
      </div>
    </>
  );
}
