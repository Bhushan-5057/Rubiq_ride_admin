import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DriverTableOne from "../../components/tables/Drivers/DriverTableOne";



export default function DriverTable() {
  return (
    <>
      <PageMeta
        title="Driver Tables Dashboard |"
        description="Driver Table"
      />
      <PageBreadcrumb pageTitle="Driver's"  />
      <div className="space-y-4">
        <DriverTableOne />
      </div>
    </>
  );
}
