import "./App.css";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const UserProfiles = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const fetchUserProfiles = () => {
    axios.get("http://localhost:8080/api/v1/user-profile").then((res) => {
      setUserProfiles(res.data);
      console.log(res.data[0]);
    });
  };

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  return (
    <div>
      <p>{userProfiles[0]?.userProfileId}</p>
      <Dropzone {...userProfiles[0]} />
      {userProfiles[0]?.userProfileId ? (
        <a
          href={`http://localhost:8080/api/v1/user-profile/${userProfiles[0]?.userProfileId}/binary/download`}
        >
          Download File
        </a>
      ) : null}
    </div>
  );
};

function App() {

  const [outputText, setOutputText] = useState('AWS link will appear here.');

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      // Do something with the selected file, such as upload it to a server
      console.log('Selected File:', selectedFile);

      const processedValue = `Processed: `;

      // Update the output text
      setOutputText(processedValue);
    }
  };

  return (
      <div className="App">
        <header>
          <h1>Source Code Reversing Tools</h1>
        </header>
  
        <nav>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Tools</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
  
        <main>
          <h2>Tool 1: Upload File to AWS S3 Bucket</h2>
          <p>This tool uploads your file to custom AWS service for security and cloud access.</p>
  
          <div className="upload-container">
          <label className="file-input-label">
            Upload File Soure Executable
            <input type="file" onChange={handleFileUpload} />
          </label>
          <p></p>
          <div id="app">
        <p id="outputText">{outputText}</p>
      </div>
        </div>

        <h2>Tool 2: Vulnerability Scan</h2>
        <p>The purpose of this tool is to provide information to users on where there could be potential vulnerabilities.</p>

        <button class="styled-button">Begin Vulnerability Scan</button>
        </main>
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
      <p></p>
      )}
    </div>
  );
}

export default App;
