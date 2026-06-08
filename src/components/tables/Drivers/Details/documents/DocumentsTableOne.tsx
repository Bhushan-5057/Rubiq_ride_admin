import { useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import { formatDate } from "../../../../../lib/utils";
import { AppDispatch, RootState } from "../../../../../store/redux/store";
import {
  fetchAllDocumentsThunk,
} from "../../../../../store/redux/document-slice";
import Badge from "../../../../ui/badge/Badge";

export default function DocumentsTableOne() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    data: documents,
    loading,
    error,
  } = useSelector((state: RootState) => state.documents);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAllDocumentsThunk());
  }, [dispatch]);

  const filteredDocs = documents.filter((doc: any, index: number) => {
    const documentId = `DOC${String(index + 1).padStart(3, "0")}`;
    const driverName = doc.driver?.name?.toLowerCase() || "";
    const type = doc.documentType.toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      documentId.includes(query) ||
      driverName.includes(query) ||
      type.includes(query)
    );
  });

  if (loading) return <p>Loading documents...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="overflow-hidden poppins-semibold-italic overflow-x-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/[0.05] dark:text-white">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
    Document Management
  </h2>

  <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
    <input
      type="text"
      placeholder="Search by Doc ID, Driver or Type..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm text-gray-700 
                 placeholder-gray-400 focus:border-gray-500 focus:outline-none
                 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
    <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />
  </div>
</div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] dark:text-white">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium">
                  Doc ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium">
                  Driver
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium">
                  Type
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium">
                  Actions
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium whitespace-nowrap">
                  Created At
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium whitespace-nowrap">
                  Updated At
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-6 text-gray-500">
                    No documents found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc: any, index: number) => {
                  const docId = `DOC${String(index + 1).padStart(3, "0")}`;

                  return (
                    <TableRow key={doc._id}>
                      <TableCell className="px-5 py-4 text-sm font-semibold">
                        {docId}
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        {doc.driverName || "Unknown"}
                      </TableCell>

                      <TableCell className="px-5 py-4 capitalize">
                        {doc.documentType}
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <Badge
                          color={
                            doc.status === "approved"
                              ? "success"
                              : doc.status === "rejected"
                              ? "error"
                              : "warning"
                          }
                          variant="light"
                          size="sm"
                          className="capitalize"
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-5 py-4 cursor-pointer">
                        <Badge
                          onClick={() =>
                          navigate(`/documents/${doc.driverId}`)
                          }
                        >
                          <ArrowRight size={15} />
                        </Badge>
                      </TableCell>

                      <TableCell className="px-2 py-2 text-sm">
                        {formatDate(doc.createdAt)}
                      </TableCell>

                      <TableCell className="px-2 py-2 text-sm">
                        {formatDate(doc.updatedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
