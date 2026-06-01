import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React from "react";
import styled from "styled-components";
import NavBar from "../components/NavBar";

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
  /* display: flex;
  align-items: center;
  justify-content: space-between; */
  overflow-y: scroll;
  border-radius: 30px;
  color: ${(props) =>
    props.themeCurrent === "dark"
      ? `rgba(${props.theme.mainRgba},.65)`
      : `rgba(${props.theme.mainRgba},.85)`};

  p {
    line-height: 25px;
  }

  @media (max-width: 1300px) {
    padding: 30px;
  }
  @media (max-width: 1000px) {
    margin-left: 0;
    overflow-y: scroll;
    height: 85%;
    margin: 20px 40px;
    width: calc(100% - 140px);
  }

  @media (max-width: 475px) {
    width: calc(100% - 90px);
    margin: 20px 15px 0;
  }
`;

const TopSection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .icon {
    width: 50px;
    height: 50px;
    margin-right: 5px;
    color: ${(props) => props.theme.accent};
  }

  h2 {
    width: 100%;
    color: ${(props) => props.theme.main};
    border-bottom: 1px solid ${(props) => props.theme.accent};
    font-size: 35px;
    font-weight: 700;
    margin-left: 10px;
    padding: 5px;
  }
`;

const SubHeading = styled.div`
  margin: 15px 0;
  h3 {
    color: ${(props) => props.theme.main};
    font-size: 30px;
    width: 100%;
    border-bottom: 1px solid ${(props) => props.theme.accent};
    font-size: 25px;
    padding: 5px;
  }

  p {
    line-height: 25px;
  }

  li {
    margin: 15px 0;
    line-height: 25px;
  }
`;

const PrivacyPolicy = ({ themeCurrent }) => {
  return (
    <>
      <NavBar themeCurrent={themeCurrent} />
      <MainContainer
        themeCurrent={themeCurrent}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 1.2, delay: 0.2 }}
      >
        <TopSection>
          <FontAwesomeIcon icon={faLock} className="icon" />
          <h2>Privacy Policy</h2>
        </TopSection>

        <p>
          At The Social Scoop, accessible from thesocialscoop.netlify.app, one
          of our main priorities is the privacy of our visitors. This Privacy
          Policy document contains types of information that is collected and
          recorded by The Social Scoop and how we use it.
        </p>

        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us.
        </p>

        <p>
          This Privacy Policy applies only to our online activities and is valid
          for visitors to our website with regards to the information that they
          shared and/or collect in The Social Scoop. This policy is not
          applicable to any information collected offline or via channels other
          than this website.
        </p>

        <SubHeading>
          <h3>Consent</h3>

          <p>
            By using our website, you hereby consent to our Privacy Policy and
            agree to its terms.
          </p>
        </SubHeading>

        <SubHeading>
          <h3>Information we collect</h3>

          <p>
            The personal information that you are asked to provide, is only used
            for the purpose of setting up and maintaining your profile.
          </p>
          <p>
            If you contact us directly, we may receive additional information
            about you such as your name, email address, phone number, the
            contents of the message and/or attachments you may send us, and any
            other information you may choose to provide.
          </p>
          <p>
            When you register for an Account, we may ask for your email, name,
            and Profile Photo.
          </p>
        </SubHeading>

        <SubHeading>
          <h3>How we use your information</h3>

          <p>
            We use the information we collect in various ways, including to:{" "}
          </p>

          <ul>
            <li>Provide, operate, and maintain our user base</li>
            <li>
              Communicate with you, including for customer service, to provide
              you with updates and other information relating to the website.
            </li>
            <li>Send you emails</li>
            <li>Find and prevent fraud</li>
          </ul>
        </SubHeading>

        <SubHeading>
          <h3>Security</h3>

          <p>
            We have in place appropriate technical and security measures to
            prevent unauthorized or unlawful access to or accidental loss of or
            destruction or damage to your information. When we collect data
            through the website, we collect your personal details on a secure
            server. We use firewalls on our servers. When we collect payment
            card details electronically, we use encryption by using Secure
            Socket Layer (SSL) coding. Whilst we are unable to guarantee 100%
            security, this makes it hard for a hacker to decrypt your details.
            You are strongly recommended not to send full credit or debit card
            details in unencrypted electronic communications with us. We
            maintain physical, electronic and procedural safeguards in
            connection with the collection, storage and disclosure of your
            information. Our security procedures mean that we may occasionally
            request proof of identity before we disclose personal information to
            you. You are responsible for protecting against unauthorized access
            to your password and to your computer.
          </p>
        </SubHeading>

        <SubHeading>
          <h3>Advertising Partners Privacy Policies</h3>

          <p>
            Note that The Social Scoop does not show advertisements to its users
            and has no third-party advertising partners. The user data is
            completely secure and is not used for any form of advertising
          </p>
        </SubHeading>

        <SubHeading>
          <h3>Third Party Privacy Policies</h3>

          <p>
            The Social Scoop's Privacy Policy does not apply to other
            advertisers or websites.{" "}
          </p>
        </SubHeading>
        <SubHeading>
          <h3>Disclaimer</h3>

          <p>
            The Social Scoop shall not be responsible for indirect,
            consequential loss or claims, damages that you may suffer due to the
            loss of any information submitted by you on this website including
            but not limited to the information with respect to your credit card,
            debit card, bank details or representations made by any advertisers
            and sponsors on this website. You accept sole responsibility and
            risk associated with the use and results of this website material,
            irrespective of the purpose to which such use or results are
            applied.{" "}
          </p>
        </SubHeading>

        <SubHeading>
          <h3>CCPA Privacy Rights (Do Not Sell My Personal Information)</h3>

          <p>
            Under the CCPA, among other rights, California consumers have the
            right to:
          </p>
          <p>
            Request that a business that collects a consumer's personal data
            disclose the categories and specific pieces of personal data that a
            business has collected about consumers.
          </p>
          <p>
            Request that a business delete any personal data about the consumer
            that a business has collected.
          </p>
          <p>
            Request that a business that sells a consumer's personal data, not
            sell the consumer's personal data.
          </p>
          <p>
            If you make a request, we have one month to respond to you. If you
            would like to exercise any of these rights, please contact us.
          </p>
        </SubHeading>

        <SubHeading>
          <h3>GDPR Data Protection Rights</h3>

          <p>
            We would like to make sure you are fully aware of all of your data
            protection rights. Every user is entitled to the following:
          </p>
          <ul>
            <li>
              The right to access – You have the right to request copies of your
              personal data. We may charge you a small fee for this service.
            </li>
            <li>
              The right to rectification – You have the right to request that we
              correct any information you believe is inaccurate. You also have
              the right to request that we complete the information you believe
              is incomplete.
            </li>
            <li>
              The right to erasure – You have the right to request that we erase
              your personal data, under certain conditions.
            </li>
            <li>
              The right to restrict processing – You have the right to request
              that we restrict the processing of your personal data, under
              certain conditions.
            </li>
            <li>
              The right to object to processing – You have the right to object
              to our processing of your personal data, under certain conditions.
            </li>
            <li>
              The right to data portability – You have the right to request that
              we transfer the data that we have collected to another
              organization, or directly to you, under certain conditions.
            </li>
          </ul>
          <p>
            If you make a request, we have one month to respond to you. If you
            would like to exercise any of these rights, please contact us.
          </p>
        </SubHeading>

        <SubHeading>
          <h3>Children's Information</h3>

          <p>
            Another part of our priority is adding protection for children while
            using the internet. We encourage parents and guardians to observe,
            participate in, and/or monitor and guide their online activity.
          </p>

          <p>
            The Social Scoop does not knowingly collect any Personal
            Identifiable Information from children under the age of 13. If you
            think that your child provided this kind of information on our
            website, we strongly encourage you to contact us immediately and we
            will do our best efforts to promptly remove such information from
            our records.
          </p>
        </SubHeading>
      </MainContainer>
    </>
  );
};

export default PrivacyPolicy;
