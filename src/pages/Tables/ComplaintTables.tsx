import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComplaintTableOne from "../../components/tables/Complaints/ComplaintTableOne";

export default function ComplaintTable() {
  return (
    <>
      <PageMeta
        title="Complaints Management |"
        description="Complaints Management"
      />
      <PageBreadcrumb pageTitle="Complaints Management" />
      <div className="space-y-4">
        <ComplaintTableOne />
      </div>
    </>
  );
}
