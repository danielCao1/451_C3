import "./App.css";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const UserProfiles = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [ghidraOutput, setGhidraOutput] = useState();
  const [ghidraScript, setGhidraScript] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const fetchUserProfiles = () => {
    axios.get("http://localhost:8080/api/v1/user-profile").then((res) => {
      setUserProfiles(res.data);
      console.log(res.data[0]);
    });
  };
  useEffect(() => {
    fetchUserProfiles();
  }, []);

  const Dropzone = ({ userProfileId }) => {
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
            fetchUserProfiles();
            console.log("file uploaded successfully");
          })
          .catch((error) => {
            console.log(error);
          });
      },
      [userProfileId]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
    });

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
  };

  const executeGhidraScript = async (userProfileId, scriptName) => {
    setSeconds(0);
    setIsTimerActive(true);
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/user-profile/${userProfileId}/execute/ghidra`,
        { params: { scriptName: scriptName } }
      );
      console.log("ghidra output", response.data);
      setGhidraOutput(response.data);
    } catch (error) {
      console.error("Error executing Ghidra script:", error);
    } finally {
      clearInterval(interval);
      setIsTimerActive(false);
    }
  };

  const truncateFilename = (filename) => {
    const index = filename.indexOf("-");
    if (index !== -1) {
      return filename.substring(0, index);
    }
    return filename;
  };

  return (
    <div>
      <Dropzone {...userProfiles[0]} />
      {userProfiles[0]?.userProfileId ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {userProfiles[0]?.binaryFileLink ? (
            <div>
              <p>
                Current Filename:
                <a
                  href={`http://localhost:8080/api/v1/user-profile/${userProfiles[0]?.userProfileId}/binary/download`}
                  style={{ marginLeft: "10px" }}
                >
                  {truncateFilename(userProfiles[0]?.binaryFileLink)}
                </a>
              </p>
            </div>
          ) : (
            <div>
              <p>Upload A file</p>
            </div>
          )}

          <button
            style={{
              maxWidth: "200px",
              margin: "10px",
            }}
            class="styled-button"
            onClick={() => {
              setGhidraScript("DetectVulnerabilites");
              executeGhidraScript(
                userProfiles[0]?.userProfileId,
                "DetectVulnerabilites"
              );
            }}
          >
            Begin Vulnerability Scan
          </button>
        </div>
      ) : null}

      {}
      {isTimerActive && <p>Timer: {seconds} seconds</p>}

      {ghidraOutput && ghidraScript === "DetectVulnerabilites" && (
        <div>
          <strong>DetectVulnerabilites Output:</strong>
          <ul>
            {ghidraOutput.map((item, index) => (
              <div key={index}>
                Caller: {item.caller}, Vulnerable Function:{" "}
                {item.vulnerable_function}
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <header>
        <h1>Source Code Reversing Tools</h1>
      </header>

      <nav>
        <ul>
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">Tools</a>
          </li>
          <li>
            <a href="#">About</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
        </ul>
      </nav>

      <main>
        <h2>Tool 2: Vulnerability Scan</h2>
        <UserProfiles />
      </main>
    </div>
  );
}

export default App;
