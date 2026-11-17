import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import PricingTableOne from "../../../components/tables/pricing/PricingTableOne";

export default function PricingTable() {
    return (
        <>
            <PageMeta
                title="Pricing Management |"
                description="Pricing Management"
            />

            <PageBreadcrumb pageTitle="Pricing Management" />
            <div className="space-y-4">
                <PricingTableOne />
            </div>
        </>
    )
}