import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DocumentsTableOne from "../../../components/tables/Drivers/Details/documents/DocumentsTableOne";


export default function DocumentTable() {
  return (
    <>
      <PageMeta
        title=" Documents Tables Dashboard |"
        description="Documents Table"
      />
      <PageBreadcrumb pageTitle="Document's"  />
      <div className="space-y-6">
        <ComponentCard title="Doucment's Table ">
          <DocumentsTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
