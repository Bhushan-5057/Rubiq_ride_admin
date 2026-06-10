import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FeedbackTableOne from "../../components/tables/Feedback/FeedbackTableOne";

export default function FeedbackTable() {
  return (
    <>
      <PageMeta
        title="Feedback Management |"
        description="Feedback Management"
      />
      <PageBreadcrumb pageTitle="Feedback Management" />
      <div className="space-y-4">
        <FeedbackTableOne />
      </div>
    </>
  );
}
