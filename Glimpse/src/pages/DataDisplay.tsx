import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import { DeleteAllLeadsButton } from "../components/DeleteLeads";

interface DataType {
  lead_id: string;
  lead_name: string;
  contact_info: string;
  source: string;
  interest_level: string;
  status: string;
  assigned_salesperson: string;
}

const columns: GridColDef[] = [
  { field: "lead_id", headerName: "Lead ID" },
  { field: "lead_name", headerName: "Lead Name" },
  { field: "contact_info", headerName: "Contact Info" },
  { field: "source", headerName: "Source" },
  { field: "interest_level", headerName: "Interest Level" },
  { field: "status", headerName: "Status" },
  {
    field: "assigned_salesperson",
    headerName: "Assigned Salesperson",
  },
];

export const DataDisplay = () => {
  const [data, setData] = useState<DataType[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("https://glimpse2.onrender.com/data", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setData(response.data);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      }
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const getRowId = (row: DataType) => {
    return row.lead_id;
  };

  return (
    <div>
      {errorMsg && <h2>{errorMsg}</h2>}
      <h2>File Upload</h2>
      <FileUpload fetchData={fetchData} />
      <h2>Delete Data</h2>
      <DeleteAllLeadsButton fetchData={fetchData} />
      <h2>Data Table</h2>
      <DataGrid
        sx={{ p: 2 }}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        autosizeOnMount
        getRowId={getRowId}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        rows={data}
        columns={columns}
      />
    </div>
  );
};
