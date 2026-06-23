import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../../store/redux/store";
import {
  fetchPricingThunk,
} from "../../../store/redux/pricing-slice";

import { Pricing } from "../../../types/pricing";

import { Modal } from "../../ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import { formatDate } from "../../../lib/utils";
import EditPricingModal from "../../ui/modal/EditPricingModal";

export default function PricingTableOne() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: pricing,
    loading,
    error,
  } = useSelector((state: RootState) => state.pricing);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] =
    useState<Pricing | null>(null);

  useEffect(() => {
    dispatch(fetchPricingThunk());
  }, [dispatch]);

  const handleEdit = (pricing: Pricing) => {
    setSelectedPricing(pricing);
    setIsOpen(true);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        Loading pricing...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-red-500">
        {error}
      </div>
    );
  }

  const rows = pricing
    ? [
        {
          vehicle: "Bike",
          baseFare: pricing.bike.baseFarePerKm,
          platformFee: pricing.bike.platformFeePerKm,
          driverShare: pricing.bike.driverSharePerKm,
        },
        {
          vehicle: "Auto",
          baseFare: pricing.auto.baseFarePerKm,
          platformFee: pricing.auto.platformFeePerKm,
          driverShare: pricing.auto.driverSharePerKm,
        },
        {
          vehicle: "Cab",
          baseFare: pricing.cab.baseFarePerKm,
          platformFee: pricing.cab.platformFeePerKm,
          driverShare: pricing.cab.driverSharePerKm,
        },
      ]
    : [];

  return (
    <>
      <div className="compact-table overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">
            Pricing Management
          </h2>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  Vehicle
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  Base Fare
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  Platform Fee
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  Driver Share
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-600 whitespace-nowrap"
                >
                  Updated At
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell className="py-6 text-center text-gray-500">
                    No pricing found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.vehicle}>
                    <TableCell className="px-5 py-4 font-medium">
                      {row.vehicle}
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      ₹{row.baseFare}
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      ₹{row.platformFee}
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      ₹{row.driverShare}
                    </TableCell>

                    <TableCell className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pricing?.updatedAt
                        ? formatDate(pricing.updatedAt)
                        : "-"}
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <button
                        onClick={() => handleEdit(pricing)}
                        className="rounded-full p-2 hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isOpen && selectedPricing && (
        <Modal
          title="Edit Pricing"
          onClose={() => setIsOpen(false)}
        >
          <div className="max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6">
            <EditPricingModal
              pricing={selectedPricing}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </Modal>
      )}
    </>
  );
}

