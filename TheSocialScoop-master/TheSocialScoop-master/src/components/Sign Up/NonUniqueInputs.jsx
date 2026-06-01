import React, { useState } from "react";
import styled from "styled-components";
const Messages = styled.span`
  color: ${(props) => props.theme.accent};
`;

const NonUniqueInput = ({ handleChange, setSignupProgression, userData }) => {
  const [error, setError] = useState({ state: false, msg: "" });
  const validator = () => {
    if (!userData.name) {
      error.state = true;
      error.msg = "Please enter your Name...";
      setError((p) => ({ ...p, state: true }));
    } else {
      if (!userData.password || !userData.password2) {
        error.state = true;
        error.msg = "Please enter your Password...";
        setError((p) => ({ ...p, state: true }));
      } else {
        if (userData.password !== userData.password2) {
          error.state = true;
          error.msg = "Passwords do not match...";
          setError((p) => ({ ...p, state: true }));
        } else {
          error.state = false;
          error.msg = "";
        }
      }
    }
    if (!error.state) setSignupProgression(3);
  };

  return (
    <>
      {!error.state ? (
        <Messages className="error">Please enter your details</Messages>
      ) : (
        <Messages className="error" style={{ color: "violet" }}>
          {error.msg}
        </Messages>
      )}
      <label htmlFor="name">
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Name..."
          required
          onChange={(e) => handleChange(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter") validator();
          }}
        />
      </label>

      <div className="split">
        <label htmlFor="password1">
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password..."
            required
            onChange={(e) => handleChange(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter") validator();
            }}
          />
        </label>
        <label htmlFor="password2">
          <input
            type="password"
            name="password2"
            id="password2"
            placeholder="Confirm Password..."
            required
            onChange={(e) => handleChange(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter") validator();
            }}
          />
        </label>
      </div>
      <div className="split">
        <button className="prev-btn" onClick={() => setSignupProgression(1)}>
          Back
        </button>
        <button className="prev-btn" onClick={validator}>
          Next
        </button>
      </div>
    </>
  );
};

export default NonUniqueInput;
