import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DocumentsTableOne from "../../../components/tables/Drivers/Details/documents/DocumentsTableOne";


export default function DocumentTable() {
  return (
    <>
      <PageMeta
        title="Documents Management |"
        description="Documents Management"
      />
      <PageBreadcrumb pageTitle="Documents Management"  />
      <div className="space-y-6">
        <DocumentsTableOne />
      </div>
    </>
  );
}
