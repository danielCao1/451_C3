import "./App.css";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const excludeFunctionNames = new Set([
  "memcpy",
  "it",
  " __static_initialization_and_destruction_0",
  "localtime",
  "operator!=",
  "c_str",
  "operator++",
  "length",
  "end",
  "time",
  "operator*",
  "begin",
  "addressof<long_const>",
  "compare",
  "operator!=",
  "operator.cast.to.bool",
  "operator>>",
  "operator==",
  "~basic_string",
  "basic_string",
  "basic_ifstream",
  "exit",
  "~basic_ifstream",
  "getline<char,std::char_traits<char>,std::allocator<char>>",
  "~basic_istringstream",
  "basic_istringstream",
  "operator<<",
  "size",
  "strtol",
  "substr",
  "~allocator",
  "operator|",
  "~basic_fstream",
  "put",
  "allocator",
  "operator+=",
  "operator-=",
  "operator=",
  "operator+",
  "operator-",
  "operator<",
  "operator>",
  "close",
  "fpos",
  "system",
  "basic_string<std::allocator<char>>",
  "seekp",
  "basic_fstream",
  "open",
  "append",
  "rand",
  "srand",
  "time",
  "eq",
  "__cxa_atexit",
  "Init",
  "_M_local_data",
  "_M_construct<char_const*>",
  "_Alloc_hider",
  "deregister_tm_clones",
  "__is_null_pointer<char_const>",
  "_S_copy_chars",
  "__throw_logic_error",
  "_M_set_length",
  "_M_data",
  "_M_create",
  "distance<char_const*>",
  "__distance<char_const*>",
  "__iterator_category<char_const*>",
  "__addressof<long_const>",
  "addressof<long_const>",
  "__do_global_dtors_aux:",
  "__static_initialization_and_destruction_0",
]);

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
    setGhidraOutput(null);
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/user-profile/${userProfileId}/execute/ghidra`,
        { params: { scriptName: scriptName } }
      );
      console.log("ghidra output", response.data);

      if (scriptName === "FunctionReferences") {
        const rawData = response.data[0]; // Assuming all data is in the first index
        const filteredOutput = {};

        for (const [functionName, calls] of Object.entries(rawData)) {
          if (!excludeFunctionNames.has(functionName)) {
            filteredOutput[functionName] = Array.isArray(calls)
              ? calls.filter((call) => !excludeFunctionNames.has(call))
              : [];
          }
        }

        setGhidraOutput(filteredOutput);
      } else {
        setGhidraOutput(response.data);
      }
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

  console.log("ghidraOutput", ghidraOutput);

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

          <button
            style={{
              maxWidth: "200px",
              margin: "10px",
            }}
            class="styled-button"
            onClick={() => {
              setGhidraScript("DecompileHeadless");
              executeGhidraScript(
                userProfiles[0]?.userProfileId,
                "DecompileHeadless"
              );
            }}
          >
            Begin All Function Output
          </button>

          <button
            style={{
              maxWidth: "200px",
              margin: "10px",
            }}
            class="styled-button"
            onClick={() => {
              setGhidraScript("FunctionReferences");
              executeGhidraScript(
                userProfiles[0]?.userProfileId,
                "FunctionReferences"
              );
            }}
          >
            Get Function References/Flow
          </button>
        </div>
      ) : null}

      {}
      {isTimerActive && <p>Timer: {seconds} seconds</p>}

      {ghidraOutput && ghidraScript === "DetectVulnerabilites" && (
        <div>
          <strong>DetectVulnerabilites Output:</strong>
          <ul>
            {ghidraOutput?.map((item, index) => (
              <div key={index}>
                Caller: {item.caller}, Vulnerable Function:{" "}
                {item.vulnerable_function}
              </div>
            ))}
          </ul>
        </div>
      )}

      {ghidraOutput && ghidraScript === "DecompileHeadless" && (
        <div style={{ textAlign: "left" }}>
          <strong>DecompileHeadless Output:</strong>
          <ul>
            {ghidraOutput?.map((item, index) => {
              const functionName = Object.keys(item)[0];
              const functionCode = item[functionName];
              return (
                <li key={index}>
                  <strong>{functionName}</strong>
                  <pre>{functionCode}</pre>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {ghidraOutput && ghidraScript === "FunctionReferences" && (
        <div style={{ textAlign: "left" }}>
          <strong>FunctionReferences Output:</strong>
          <div>
            {Object.entries(ghidraOutput).map(
              ([functionName, calledFunctions], index) => (
                <div key={index}>
                  {calledFunctions.length != 0 && (
                    <strong>{functionName}:</strong>
                  )}
                  <ul>
                    {calledFunctions.map((calledFunction, idx) => (
                      <li key={idx}>{calledFunction}</li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
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
