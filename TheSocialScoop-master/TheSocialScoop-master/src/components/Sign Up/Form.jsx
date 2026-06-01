import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import NonUniqueInputs from "./NonUniqueInputs";
import OtherInputs from "./OtherInputs";
import UniqueInputs from "./UniqueInputs";

const FormSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 50%;
  height: 100%;

  @media (max-width: 1300px) {
    width: 65%;
  }

  @media (max-width: 1000px) {
    width: 100%;
  }

  h1 {
    margin: 10px 0;
    color: ${(props) => props.theme.accent};
    font-size: 50px;
    @media (max-width: 1000px) {
      font-size: 40px;
    }
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 0 40px;
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
      h2 {
        color: ${(props) => props.theme.main};
        @media (max-width: 1000px) {
          font-size: 15px;
          margin: 5px 0;
        }
      }
    }
    input {
      font-size: 15px;
      font-weight: 400;
      width: 100%;
      background: ${(props) => `rgba(${props.theme.bodyRgba}, 0.1)`};
      border: none;
      border-radius: 30px;
      color: ${(props) => props.theme.main};
      outline: none;
      border: 1.5px solid ${(props) => props.theme.text};
      padding: 15px 30px;
      margin: 10px 0;
      box-sizing: border-box;
      transition: width 0.15s ease;
      &:hover {
        width: 101%;
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
        margin: 5px 0;
      }
    }

    .split {
      width: 82%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      input {
        width: 95%;
        &:hover {
          width: 96%;
        }
        &:focus {
          border: 1.5px solid ${(props) => props.theme.accent};
          width: 96%;
        }

        @media (max-width: 1000px) {
          width: 100%;
          &:hover {
            width: 101%;
          }
          &:focus {
            border: 1.5px solid ${(props) => props.theme.accent};
            width: 101%;
          }
        }
      }

      @media (max-width: 1000px) {
        flex-direction: column;
        width: 100%;
      }
    }

    .submit-btn,
    .prev-btn,
    .next-btn {
      width: 35%;
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
      transition: all 0.2s ease;

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

    .first-prev-btn {
      visibility: hidden;
      @media (max-width: 1000px) {
        display: none;
      }
    }
  }

  .login-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    @media (max-width: 1300px) {
      width: 90%;
    }
    @media (max-width: 1000px) {
      font-size: 12px;
      padding: 12px 30px;
      margin: 0;
    }

    .divider {
      margin: 0 0 10px 0;
      width: 100%;
      height: 0.75px;
      border-radius: 1px;
      background-color: ${(props) => props.theme.main};
    }
    .login {
      color: ${(props) => props.theme.main};
      width: 90%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;

      @media (max-width: 1000px) {
        margin: 5px 0 0;
      }

      p {
        margin: 0;
        text-align: center;
        @media (max-width: 650px) {
          margin: 0 0 15px;
        }
      }

      @media (max-width: 650px) {
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
      }

      .login-btn {
        padding: 15px 30px;
        font-size: 15px;
        border-radius: 30px;
        background-color: ${(props) => `rgba(${props.theme.bodyRgba}, 0.1)`};
        border: 2px solid ${(props) => props.theme.accent};
        color: ${(props) => props.theme.accent};
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background-color: ${(props) => props.theme.accent};
          color: ${(props) => props.theme.body};
        }

        @media (max-width: 1300px) {
          font-size: 12px;
          padding: 10px 30px;
        }
      }
    }
  }
`;

const Form = ({ handleChange, handleSubmit, userData, setFile }) => {
  const [signupProgression, setSignupProgression] = useState(1);
  return (
    <FormSectionWrapper>
      {/* onSubmit={(e) => handleSubmit(e)} */}
      <div className="form">
        {signupProgression === 1 && (
          <UniqueInputs
            handleChange={handleChange}
            setSignupProgression={setSignupProgression}
            userData={userData}
          />
        )}
        {signupProgression === 2 && (
          <NonUniqueInputs
            handleChange={handleChange}
            setSignupProgression={setSignupProgression}
            userData={userData}
          />
        )}
        {signupProgression === 3 && (
          <OtherInputs
            handleChange={handleChange}
            setSignupProgression={setSignupProgression}
            userData={userData}
            setFile={setFile}
            handleSubmit={handleSubmit}
          />
        )}
      </div>

      <div className="login-wrapper">
        <div className="divider" />
        <p className="login">
          <p>Already have an Account? Login Now!</p>
          <Link to="/login">
            <button className="login-btn">Login</button>
          </Link>
        </p>
      </div>
    </FormSectionWrapper>
  );
};

export default Form;
