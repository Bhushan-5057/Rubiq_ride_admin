import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { AppDispatch } from "../../../store/redux/store";
import { updatePricingThunk } from "../../../store/redux/pricing-slice";
import { Pricing,EditPricingForm } from "../../../types/pricing";

import { getApiErrorMessage } from "../../../lib/apiError";
import { useToast } from "../../ui/toast/ToastContext";

interface EditPricingModalProps {
  pricing: Pricing;
  onClose: () => void;
}

export default function EditPricingModal({
  pricing,
  onClose,
}: EditPricingModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<EditPricingForm>({
    bike: {
      baseFarePerKm: "0",
    },
    auto: {
      baseFarePerKm: "0",
    },
    cab: {
      baseFarePerKm: "0",
    },
  });

  useEffect(() => {
    setForm({
      bike: {
        baseFarePerKm: pricing.bike.baseFarePerKm.toString(),
      },
      auto: {
        baseFarePerKm: pricing.auto.baseFarePerKm.toString(),
      },
      cab: {
        baseFarePerKm: pricing.cab.baseFarePerKm.toString(),
      },
    });
  }, [pricing]);

  const updateFare = (
    vehicle: "bike" | "auto" | "cab",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [vehicle]: {
        baseFarePerKm: value,
      },
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await dispatch(
        updatePricingThunk({
          bike: {
            baseFarePerKm: Number(form.bike.baseFarePerKm),
          },
          auto: {
            baseFarePerKm: Number(form.auto.baseFarePerKm),
          },
          cab: {
            baseFarePerKm: Number(form.cab.baseFarePerKm),
          },
        })
      ).unwrap();

      showToast("Pricing updated successfully.", "success");

      onClose();
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Update Pricing"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">
          Bike
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Base Fare
            </label>

            <input
              type="number"
              className={inputClass}
              value={form.bike?.baseFarePerKm ?? ""}
              onChange={(e) =>
                updateFare(
                  "bike", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Platform Fee
            </label>

            <input
              disabled
              className={`${inputClass} bg-gray-100`}
              value={pricing.bike.platformFeePerKm}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Driver Share
            </label>

            <input
              disabled
              className={`${inputClass} bg-gray-100`}
              value={pricing.bike.driverSharePerKm}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">
          Auto
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Base Fare
            </label>

            <input
              type="number"
              className={inputClass}
              value={form.auto?.baseFarePerKm ?? ""}
              onChange={(e) =>
                updateFare(
                  "auto",
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Platform Fee
            </label>

            <input
              disabled
              className={`${inputClass} bg-gray-100`}
              value={pricing.auto.platformFeePerKm}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Driver Share
            </label>

            <input
              disabled
              className={`${inputClass} bg-gray-100`}
              value={pricing.auto.driverSharePerKm}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">
          Cab
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Base Fare
            </label>

            <input
              type="number"
              className={inputClass}
              value={form.cab?.baseFarePerKm ?? ""}
              onChange={(e) =>
                updateFare(
                  "cab",
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Platform Fee
            </label>

            <input
              disabled
              className={`${inputClass} bg-gray-100`}
              value={pricing.cab.platformFeePerKm}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Driver Share
            </label>

            <input
              disabled
              className={`${inputClass} bg-gray-100`}
              value={pricing.cab.driverSharePerKm}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
