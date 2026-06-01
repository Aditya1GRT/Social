import {
  faCircleNodes,
  faImage,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../firebase";
import { postStart } from "../redux/postSlice";
import { createPosts } from "../redux/API Calls/postApiCalls";

const MakePostContainer = styled.form`
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 1;
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.85)`
      : `rgba(${props.theme.bodyRgba},.6)`};
  border-radius: 30px;
  padding: 20px 30px;
  margin-bottom: 10px;
  width: 100%;
  height: 175px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .spinner {
    margin: auto;
    animation: rotation 1.5s infinite linear;
    height: 30px;
    color: ${(props) => props.theme.accent};
  }

  span {
    background-color: ${(props) => props.theme.main};
    height: 1px;
    width: 95%;
    margin: 12px 0;
  }
  @media (max-width: 1000px) {
    padding: 20px 30px;
    height: 175px;
  }
`;
const TopContainer = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 1000px) {
    font-size: 12px;
  }

  img {
    height: 70px;
    width: 70px;
    border-radius: 50%;
    object-fit: cover;
    @media (max-width: 1000px) {
      height: 55px;
      width: 55px;
    }
  }
  input {
    width: 100%;
    height: 50px;
    padding: 20px;
    background-color: transparent;
    border: none;
    outline: none;
    color: ${(props) => props.theme.main};
    font-size: 15px;

    &::placeholder {
      color: ${(props) => props.theme.text};
    }
  }
`;
const BottomContainer = styled.div`
  width: 95%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 1000px) {
    font-size: 12px;
  }
  input {
    display: none;
  }
  label {
    margin-right: 10px;
  }
  p {
    max-width: 200px;
    margin: 0;
  }
  button {
    width: 100px;
    padding: 10px 30px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    outline: none;
    border-radius: 30px;
    background-color: ${(props) => props.theme.accent};
    color: ${(props) => props.theme.body};
    box-sizing: border-box;
    transition: all 0.2s ease;

    &:hover {
      color: ${(props) => props.theme.accent};
      background-color: ${(props) => props.theme.body};
    }
    @media (max-width: 1000px) {
      padding: 12px 30px;
    }
  }
`;

const MakePost = ({ themeCurrent, setPostMod }) => {
  const { profilePicture, name, _id } = useSelector(
    (state) => state.user.currentUser
  );
  const dispatch = useDispatch();
  const isFetching = useSelector((state) => state.posts.isFetching);
  const [postData, setPostData] = useState({ userId: _id });
  const [file, setFile] = useState({});
  const [mediaType, setMediaType] = useState("");
  const [progress, setProgress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(postStart());
    // ||||||||||||||||||||||||||||||||||||||||||||||||||

    try {
      if (file.name) {
        const fileName = new Date().getTime() + file.name;

        const storage = getStorage(app);
        const storageRef = ref(storage, fileName);

        const uploadTask = uploadBytesResumable(storageRef, file);

        await uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(`Upload is ${progress}% done`);
            // console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                console.log("default");
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            console.log(error.message);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                console.log("File available at", downloadURL);

                setPostData((p) => ({
                  ...p,
                  postMedia: downloadURL,
                  mediaType,
                }));
              }
            );
          }
        );
      } else {
        setPostData((p) => ({ ...p, postMedia: "null", mediaType }));
      }
      // ||||||||||||||||||||||||||||||||||||||||||||||||||||||||
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    // publicRequest.post("/posts/create-post", { ...postData });
    postData.postMedia && createPosts(dispatch, postData);
    setPostData({ userId: _id });
    setFile({});
    setPostMod(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postData.postMedia]);

  return (
    <MakePostContainer
      themeCurrent={themeCurrent}
      onSubmit={(e) => handleSubmit(e)}
    >
      {isFetching && (
        <>
          <FontAwesomeIcon className="spinner" icon={faCircleNodes} />
          <small>{progress}</small>
        </>
      )}

      {!isFetching && (
        <>
          <TopContainer>
            <img
              src={
                profilePicture
                  ? profilePicture
                  : "https://www.freeiconspng.com/thumbs/login-icon/user-login-icon-14.png"
              }
              alt=""
            />
            <input
              type="text"
              name="description"
              placeholder={`What's on your mind ${name.toUpperCase()}?`}
              required
              onChange={(e) =>
                setPostData((p) => ({ ...p, [e.target.name]: e.target.value }))
              }
            />
          </TopContainer>
          <span />
          <BottomContainer className="bottomContainer">
            <p>
              <input
                type="file"
                name="media"
                id="photo"
                accept="image/*"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setMediaType("image");
                }}
              />
              <label htmlFor="photo">
                <FontAwesomeIcon icon={faImage} /> Photo/GIF
              </label>

              <input
                type="file"
                name="media"
                id="video"
                accept="video/*"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setMediaType("video");
                }}
              />
              <label htmlFor="video">
                <FontAwesomeIcon icon={faVideo} /> Video
              </label>
            </p>
            {file.name && <p>"{file.name}"</p>}
            <button type="submit">Post</button>
          </BottomContainer>
        </>
      )}
    </MakePostContainer>
  );
};

export default MakePost;
