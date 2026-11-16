import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AdminTableOne from "../../../components/tables/Admins/AdminTableOne";

export default function AdminTable() {
  return (
    <>
      <PageMeta title="Admins Management |" description="Admins Management" />
      <PageBreadcrumb pageTitle="Admins Management" />
      <div className="space-y-6">
        <AdminTableOne />
      </div>
    </>
  );
}
