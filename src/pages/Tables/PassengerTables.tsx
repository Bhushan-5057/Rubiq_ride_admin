import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PassengerTableOne from "../../components/tables/Passengers/PassengerTableOne";



export default function PassengerTable() {
  return (
    <>
      <PageMeta
        title="Passengers Management |"
        description="Passengers Management"
      />
      <PageBreadcrumb pageTitle="Passengers Management" />
      <div className="space-y-4">
        <PassengerTableOne/>
      </div>
    </>
  );
}
