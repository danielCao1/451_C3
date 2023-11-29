import "./App.css";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const UserProfiles = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const fetchUserProfiles = () => {
    axios.get("http://localhost:8080/api/v1/user-profile").then((res) => {
      setUserProfiles(res.data);
    });
  };

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  return userProfiles.map((userProfile, index) => {
    return (
      <div key={index}>
        <br />
        <br />

        <h1>{userProfile.username}</h1>
        <p>{userProfile.userProfileId}</p>
        <Dropzone {...userProfile} />
        {userProfile.userProfileId ? (
          <a
            href={`http://localhost:8080/api/v1/user-profile/${userProfile.userProfileId}/binary/download`}
          >
            Download File
          </a>
        ) : null}
        <br />
      </div>
    );
  });
};

function App() {
  return (
    <div className="App">
      <UserProfiles />
      <p>C3 App</p>
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
