import axiosInstance from "./axiosInstance";

export const updateDriverDocumentStatus = async ({
  driverId,
  documentType,
  status,
  remarks,
}: {
  driverId: string;
  documentType: string;
  status: string; 
  remarks?: string;
}) => {
  const response = await axiosInstance.put(
    `/admin/manage/drivers/documents/verify/${driverId}`,
    {
      [`${documentType}Status`]: status,
      remarks,
    }
  );

  return response.data;
};
