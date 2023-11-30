import "./App.css";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const UserProfiles = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [ghidraOutput, setGhidraOutput] = useState("");

  const fetchUserProfiles = () => {
    axios.get("http://localhost:8080/api/v1/user-profile").then((res) => {
      setUserProfiles(res.data);
      console.log(res.data[0]);
    });
  };

  const executeGhidraScript = async (userProfileId, scriptName) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/user-profile/${userProfileId}/execute/ghidra`,
        { params: { scriptName: scriptName } }
      );
      console.log("ghidra output", response.data);
      setGhidraOutput(response.data);
    } catch (error) {
      console.error("Error executing Ghidra script:", error);
    }
  };

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  return (
    <div>
      <h1>Test User</h1>
      <p>{userProfiles[0]?.userProfileId}</p>
      <Dropzone {...userProfiles[0]} />
      {userProfiles[0]?.userProfileId ? (
        <div>
          <a
            href={`http://localhost:8080/api/v1/user-profile/${userProfiles[0]?.userProfileId}/binary/download`}
          >
            Download File
          </a>
          <button
            onClick={() =>
              executeGhidraScript(
                userProfiles[0]?.userProfileId,
                "DetectVulnerabilites"
              )
            }
          >
            Run Ghidra Script
          </button>
        </div>
      ) : null}
      {ghidraOutput && (
        <div>
          <strong>Output:</strong> {ghidraOutput}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <UserProfiles />
    </div>
  );
}

function Dropzone({ userProfileId }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post(
          `http://localhost:8080/api/v1/user-profile/${userProfileId}/binary/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then(() => {
          console.log("file uploaded successfully");
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [userProfileId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop binary file here ...</p>
      ) : (
        <p>Drag 'n' drop binary file, or click to select binary files</p>
      )}
    </div>
  );
}

export default App;
