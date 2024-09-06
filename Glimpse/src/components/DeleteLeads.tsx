import axios from "axios";
import { FC } from "react";

interface DeleteAllLeadsProps {
  fetchData: () => Promise<void>;
}

export const DeleteAllLeadsButton: FC<DeleteAllLeadsProps> = ({
  fetchData,
}) => {
  const deleteAllLeads = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete all leads? This action cannot be undone."
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`https://your-backend-url.com/data`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        console.log("Data deleted successfully");
        fetchData();
      } else {
        console.error("Error deleting data");
        alert("Error deleting data!");
        return;
      }

      alert("All leads deleted successfully");
    } catch (error) {
      alert(
        `Failed to delete all leads! ${
          error instanceof Error ? error.message : ""
        }`
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button onClick={deleteAllLeads}>Delete All Leads</button>
    </div>
  );
};
