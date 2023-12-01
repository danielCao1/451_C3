import "./home.css";
import React, { useState, useCallback, useEffect } from "react";
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

const Home = () => {
  const [user, setUser] = useState([]);
  const [functionReferences, setFunctionReferences] = useState();
  const [functionsVulnerability, setFunctionVulnerability] = useState();
  const [functionsData, setFunctionsData] = useState();
  const [seconds, setSeconds] = useState(0);
  const [isVulnerabilityTimerActive, setIsVulnerabilityTimerActive] =
    useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isVulnerabilityModalVisible, setIsVulnerabilityModalVisible] =
    useState(false);

  const [isFunctionModalVisible, setIsFunctionModalVisible] = useState(false);
  const [currentFunction, setCurrentFunction] = useState("main");

  const fetchUserProfiles = () => {
    axios.get("http://localhost:8080/api/v1/user-profile").then((res) => {
      setUser(res.data[0]);
    });
  };

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  const truncateFilename = (filename) => {
    const index = filename.indexOf("-");
    if (index !== -1) {
      return filename.substring(0, index);
    }
    return filename;
  };

  const executeGhidraScript = async (userProfileId, scriptName) => {
    setSeconds(0);
    if (scriptName === "DetectVulnerabilites") {
      setIsVulnerabilityTimerActive(true);
    } else {
      setIsTimerActive(true);
    }
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/user-profile/${userProfileId}/execute/ghidra`,
        { params: { scriptName: scriptName } }
      );

      if (scriptName === "FunctionReferences") {
        const rawData = response.data[0];
        const filteredOutput = {};

        for (const [functionName, calls] of Object.entries(rawData)) {
          if (!excludeFunctionNames.has(functionName)) {
            filteredOutput[functionName] = Array.isArray(calls)
              ? calls.filter((call) => !excludeFunctionNames.has(call))
              : [];
          }
        }

        setFunctionReferences(filteredOutput);
        console.log("filterOutput", filteredOutput);
        console.log("rawData", rawData);
      } else if (scriptName === "DetectVulnerabilites") {
        setFunctionVulnerability(response.data);
        console.log("response.data for vul", response.data);
      } else if (scriptName === "DecompileHeadless") {
        setFunctionsData(response.data);
        console.log("response.data for decompile", response.data);
      } else {
        console.log("invalid script name");
      }
    } catch (error) {
      console.error("Error executing Ghidra script:", error);
    } finally {
      clearInterval(interval);
      setIsTimerActive(false);
      setIsVulnerabilityTimerActive(false);
    }
  };

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
            fetchUserProfiles(); // Refresh the user profile with the new file
            executeGhidraScript(userProfileId, "FunctionReferences");
            executeGhidraScript(userProfileId, "DecompileHeadless");
            setFileUploaded(true);
            console.log("file uploaded successfully");
          })
          .catch((error) => {
            console.error(error);
          });
      },
      [userProfileId]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
    });

    return (
      <div
        {...getRootProps()}
        style={{
          border: isDragActive ? "2px dashed #F1B82d" : "2px solid #F1B82D",
          borderRadius: "20px",
          backgroundColor: isDragActive ? "rgba(51, 51, 51, 0.5)" : "#333333",
          color: "#F1B82D",
          padding: "1px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          fontSize: "20px",
          marginBottom: "25px",
        }}
      >
        <input {...getInputProps()} />
        <p>Upload source file</p>
      </div>
    );
  };

  return (
    <div className="home-container">
      {/* Base Home */}
      {(!user?.binaryFileLink || isTimerActive) && (
        <div className="base-home-container">
          {/* Upload File */}
          <div className="upload-container">
            <h1>Begin</h1>
            <Dropzone {...user} />
            {isTimerActive && (
              <div className="">
                <div className="loader"></div>
                <p>Processing: {seconds} seconds</p>
              </div>
            )}
          </div>

          {/* Center Image */}
          <div className="image-container">
            <div className="image-circle">
              <img src="images/girl_hacking.png" alt="hacking" />
            </div>
          </div>

          {/* Text About Us */}
          <div className="about-container">
            <h1>Lets Hack</h1>
            <p>
              The purpose of this is to provide various tools to assist
              programmers when reversing source code.{" "}
            </p>
          </div>
        </div>
      )}

      {/* Home when user uploads a file */}
      {fileUploaded & !isTimerActive && (
        <div className="home-uploaded-container">
          {/* Title */}
          <h2>Welcome {user.username}</h2>

          {/* File Name */}
          {user?.binaryFileLink && (
            <div>
              <p>
                Current Filename:
                <a
                  href={`http://localhost:8080/api/v1/user-profile/${user?.userProfileId}/binary/download`}
                  style={{ marginLeft: "10px" }}
                >
                  {truncateFilename(user?.binaryFileLink)}
                </a>
              </p>
              {/* <Dropzone {...user} /> */}
            </div>
          )}

          {/* Mapping of Functions */}
          {functionReferences && (
            <div style={{ textAlign: "left" }}>
              <strong>FunctionReferences Output:</strong>
              <div>
                {Object.entries(functionReferences).map(
                  ([functionName, calledFunctions], index) => (
                    <div key={index}>
                      {calledFunctions.length !== 0 && (
                        <strong
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setCurrentFunction(functionName);
                            setIsFunctionModalVisible(true);
                          }}
                        >
                          {functionName}
                        </strong>
                      )}
                      <ul>
                        {calledFunctions.map((calledFunction, idx) => (
                          <li
                            key={idx}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setCurrentFunction(calledFunction);
                              setIsFunctionModalVisible(true);
                            }}
                          >
                            {calledFunction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Toolbox */}
          <div className="toolbox">
            <div className="toolbox-header">Toolbox</div>
            <div
              className="toolbox-items"
              onClick={() => {
                executeGhidraScript(
                  user?.userProfileId,
                  "DetectVulnerabilites"
                );
                setIsVulnerabilityModalVisible(true);
              }}
            >
              Begin Vulnerability Scan
            </div>

            <div
              className="toolbox-items"
              onClick={() => {
                setIsFunctionModalVisible(true);
              }}
            >
              Test
            </div>
          </div>

          {/* Modal for Vulnerability Scan */}
          {isVulnerabilityModalVisible && (
            <div>
              <div
                className="overlay active"
                onClick={() => setIsVulnerabilityModalVisible(false)}
              ></div>
              <div className="modal active">
                <strong className="modal-header">
                  DetectVulnerabilites Output:
                </strong>
                {isVulnerabilityTimerActive && (
                  <div className="">
                    <div className="loader"></div>
                    <p>Processing: {seconds} seconds</p>
                  </div>
                )}
                <ul>
                  {functionsVulnerability?.map((item, index) => (
                    <li key={index}>
                      Caller: {item.caller}, Vulnerable Function:{" "}
                      {item.vulnerable_function}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setIsVulnerabilityModalVisible(false)}>
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Box Modal For Function on Click */}

          {isFunctionModalVisible && (
            <div>
              <div
                className="overlay active"
                onClick={() => setIsFunctionModalVisible(false)}
              ></div>
              <div
                className="modal active"
                style={{ overflowY: "auto", maxHeight: "80vh" }}
              >
                <strong className="modal-header">Decompile Function:</strong>
                {/* Function Code Block Here */}
                {currentFunction && functionsData && (
                  <div style={{ textAlign: "left" }}>
                    <ul>
                      {functionsData
                        .filter(
                          (item) => Object.keys(item)[0] === currentFunction
                        )
                        .map((item, index) => {
                          const functionName = Object.keys(item)[0];
                          const functionCode = item[functionName];
                          console.log(functionCode);
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
                <button onClick={() => setIsFunctionModalVisible(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
