import React from "react";
import styled from "styled-components";

const Label = styled.label`
  display: flex;
  flex-direction: row !important;
  .profilePicture {
    background-color: transparent;
  }
  .privacyPolicy {
    width: 20px !important;
    margin-right: 5px !important;
    accent-color: ${(props) => props.theme.accent};

    &:hover {
      border: none;
      width: 20px !important;
    }
    &:focus {
      border: none;
      width: 20px !important;
    }
  }
`;

const OtherInputs = ({
  handleChange,
  setSignupProgression,
  setFile,
  handleSubmit,
}) => {
  return (
    <>
      <Label
        htmlFor="profilePicture"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit(e);
        }}
      >
        <input
          className="profilePicture"
          type="file"
          name="profilePicture"
          id="profilePicture"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </Label>

      <Label
        htmlFor="privacyPolicy"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit(e);
        }}
      >
        <input
          className="privacyPolicy"
          type="checkbox"
          name="privacyPolicy"
          id="privacyPolicy"
          required
        />
        <p>I have read and accept the Privacy Policy.</p>
      </Label>

      <div className="split">
        <button className="prev-btn" onClick={() => setSignupProgression(1)}>
          Back
        </button>
        <button
          // type="submit"
          className="submit-btn"
          onClick={(e) => {
            handleSubmit(e);
          }}
        >
          Sign Up
        </button>
      </div>
    </>
  );
};

export default OtherInputs;
