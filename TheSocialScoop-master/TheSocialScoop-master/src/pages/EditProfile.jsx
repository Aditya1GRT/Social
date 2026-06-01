import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import NavBar from "../components/NavBar";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../firebase";
import { publicRequest } from "../requestMethods";
import { faHighlighter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/userSlice";
import { motion } from "framer-motion";

const MainContainer = styled(motion.div)`
  background: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.bodyRgba},.85)`
      : `rgba(${props.theme.bodyRgba},.6)`};
  box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  height: 90%;
  width: 90%;
  padding: 30px 50px;
  margin: 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 30px;
  overflow-x: hidden;

  @media (max-width: 1300px) {
    padding: 30px;
  }
  @media (max-width: 1000px) {
    margin-left: 0;
    padding: 20px;
    margin: 0 40px;
    width: calc(100% - 120px);
    margin-bottom: 20px;
    overflow-y: scroll;
  }
  @media (max-width: 475px) {
    width: calc(100% - 60px);
    margin: 0px 15px;
  }
  h2 {
    width: 100%;
    color: ${(props) => `rgba(${props.theme.mainRgba}, .9)`};

    .icon {
      color: ${(props) => props.theme.accent};
      font-size: 35px;
      margin-right: 15px;
    }
  }
`;

const FormContainer = styled.div`
  width: 100%;
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 20px 0 40px;
    width: 100%;
    height: 100%;

    @media (max-width: 1000px) {
      width: 90%;
      margin: 10px 0;
    }

    label {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80%;
      margin: 10px 0;
    }

    .profilePicture {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 1px solid rebeccapurple;
      /* overflow: hidden; */
      cursor: pointer;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        z-index: 1;
      }

      &::after {
        background-color: ${(props) => `rgba(${props.theme.bodyRgba}, .5)`};
        position: absolute;
        content: "Edit";
        bottom: -10px;
        right: -10px;
        padding: 3px 10px;
        border-radius: 5px;
        /* margin: 0; */
        z-index: 10;
        font-weight: 700;
        color: ${(props) => props.theme.accent};
      }
    }

    input {
      font-size: 15px;
      font-weight: 400;
      width: 100%;
      border: none;
      border-radius: 30px;
      color: ${(props) => props.theme.main};
      background: ${(props) => `rgba(${props.theme.bodyRgba}, 0.1)`};
      outline: none;
      border: 1.5px solid ${(props) => props.theme.text};
      padding: 15px 30px;
      margin: 10px 0;
      box-sizing: border-box;
      transition: width 0.15s ease;
      &:hover {
        border: 1.5px solid ${(props) => props.theme.accent};
      }
      &:focus {
        border: 1.5px solid ${(props) => props.theme.accent};
        width: 101%;
      }
      &::placeholder {
        color: ${(props) => `rgba(${props.theme.mainRgba}, 0.6)`};
      }

      @media (max-width: 1000px) {
        font-size: 12px;
        padding: 12px 30px;
      }
    }
    textarea {
      font-size: 15px;
      font-weight: 400;
      width: 100%;
      height: 80px;
      border: none;
      border-radius: 15px;
      color: ${(props) => props.theme.main};
      background: ${(props) => `rgba(${props.theme.bodyRgba}, 0.1)`};
      outline: none;
      border: 1.5px solid ${(props) => props.theme.text};
      padding: 15px 30px;
      margin: 10px 0;
      box-sizing: border-box;
      transition: width 0.15s ease;
      resize: none;
      &:hover {
        border: 1.5px solid ${(props) => props.theme.accent};
      }
      &:focus {
        border: 1.5px solid ${(props) => props.theme.accent};
        width: 101%;
      }
      &::placeholder {
        color: ${(props) => `rgba(${props.theme.mainRgba}, 0.6)`};
      }

      @media (max-width: 1000px) {
        font-size: 12px;
        padding: 12px 30px;
      }
    }
  }

  .flex {
    width: 80%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    label {
      width: 48%;
      input {
        width: 100%;
      }
    }
  }

  .submit-btn {
    width: 80%;
    padding: 15px 30px;
    margin: 30px 0;
    font-size: 15px;
    font-weight: 600;
    border: none;
    outline: none;
    border-radius: 30px;
    background-color: ${(props) => props.theme.accent};
    color: ${(props) => props.theme.body};
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:hover {
      color: ${(props) => props.theme.accent};
      background-color: ${(props) => props.theme.body};
    }

    @media (max-width: 1000px) {
      font-size: 12px;
      padding: 12px 30px;
      margin: 10px 0;
    }
  }
`;

const EditProfile = ({ user }) => {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [userData, setUserData] = useState({});
  const [file, setFile] = useState({});
  const [preview, setPreview] = useState(undefined);
  const nav = useNavigate();
  const dispatch = useDispatch();

  console.log(currentUser);
  console.log(userData);
  const handleChange = (e) => {
    if (e.target.value !== "")
      setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    else {
      switch (e.target.name) {
        case "name":
          delete userData.name;
          break;
        case "username":
          delete userData.username;
          break;
        case "email":
          delete userData.email;
          break;
        case "password":
          delete userData.password;
          break;
        case "description":
          delete userData.description;

          break;

        default:
          break;
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // dispatch(userStart());
    // ||||||||||||||||||||||||||||||||||||||||||||||||||

    try {
      const fileName = new Date().getTime() + file.name;

      const storage = getStorage(app);
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
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
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log("File available at", downloadURL);
            setUserData((p) => ({ ...p, profilePicture: downloadURL }));
            submit(e, downloadURL);
          });
        }
      );

      // ||||||||||||||||||||||||||||||||||||||||||||||||||||||||
    } catch (error) {
      console.log(error.message);
    }
  };
  const submit = async (e, downloadURL = null) => {
    e.preventDefault();
    downloadURL
      ? await publicRequest.put(`/users/${currentUser._id}`, {
          ...userData,
          profilePicture: downloadURL,
          _id: user._id,
        })
      : await publicRequest.put(`/users/${currentUser._id}`, {
          ...userData,
          _id: user._id,
        });
    downloadURL
      ? dispatch(
          loginSuccess({ ...user, ...userData, profilePicture: downloadURL })
        )
      : dispatch(loginSuccess({ ...user, ...userData }));

    nav(`/user/${user.username}`, { replace: true });
  };

  return (
    <>
      <NavBar />
      <MainContainer
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
      >
        <h2>
          <FontAwesomeIcon icon={faHighlighter} className="icon" />
          Update Your Profile
        </h2>

        <FormContainer>
          <form onSubmit={(e) => (preview ? onSubmit(e) : submit(e))}>
            <label htmlFor="profilePicture" className="profilePicture">
              <input
                type="file"
                name="profilePicture"
                id="profilePicture"
                style={{ display: "none" }}
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
              <img src={!preview ? user.profilePicture : preview} alt="" />
            </label>

            <div className="flex">
              <label htmlFor="name">
                <input
                  type="text"
                  name="name"
                  placeholder={user.name}
                  onChange={(e) => handleChange(e)}
                />
              </label>

              <label htmlFor="username">
                <input
                  type="text"
                  name="username"
                  placeholder={user.username}
                  onChange={(e) => handleChange(e)}
                />
              </label>

              <label htmlFor="email">
                <input
                  type="email"
                  name="email"
                  placeholder={user.email}
                  onChange={(e) => handleChange(e)}
                />
              </label>

              <label htmlFor="password">
                <input
                  type="password"
                  name="password"
                  placeholder="Password..."
                  onChange={(e) => handleChange(e)}
                />
              </label>
            </div>
            <label htmlFor="description">
              <textarea
                type="text"
                name="description"
                placeholder={
                  user.description ? user.description : "Enter your Bio..."
                }
                onChange={(e) => handleChange(e)}
              ></textarea>
            </label>
            <button type="submit" className="submit-btn">
              Update
            </button>
          </form>
        </FormContainer>
      </MainContainer>
    </>
  );
};

export default EditProfile;
