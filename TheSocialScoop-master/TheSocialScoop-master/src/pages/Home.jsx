import React from "react";
import NavBar from "../components/NavBar";
import Feed from "../components/Feed";

const Home = ({ themeCurrent }) => {
  return (
    <>
      <NavBar themeCurrent={themeCurrent} />
      <Feed themeCurrent={themeCurrent} />
    </>
  );
};

export default Home;
