import axios from "axios";
import { FC, useState } from "react";

interface FetchDataProps {
  fetchData: () => Promise<void>;
}

export const FileUpload: FC<FetchDataProps> = ({ fetchData }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e?.target?.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("csvFile", file);

    try {
      const response = await axios.post(
        "https://glimpse2.onrender.com/upload",
        formData,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("File uploaded successfully");
        fetchData();
      } else {
        console.error("Error uploading file");
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <input
        type="file"
        accept=".csv"
        id="file-upload"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <label
        htmlFor="file-upload"
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0056b3";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#007bff";
        }}
      >
        Choose File
      </label>
      {file && <p>{file.name}</p>}
      {file && (
        <button
          onClick={handleUpload}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#218838";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#28a745";
          }}
        >
          Upload
        </button>
      )}
    </div>
  );
};

export default FileUpload;
