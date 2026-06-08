import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AdminTableOne from "../../../components/tables/Admins/AdminTableOne";

export default function AdminTable() {
  return (
    <>
      <PageMeta title="Admin's Tables Dashboard |" description="Admin's Table" />
      <PageBreadcrumb pageTitle="Admin's" />
      <div className="space-y-6">
        <ComponentCard title="Admin Tables">
          <AdminTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
