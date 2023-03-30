import EmailTemplate from "../components/email-template/email-template";
import Header from "../components/template-header/template-header";
import Footer from "../components/template-header/template-header";
import Body from "../components/template-body/template-body";
import generalTranslations from "../translations/general";
import clientTranslations from "./translations/client";

function Root() {
  addTrans(generalTranslations);
  addTrans(clientTranslations);

  setSubject(`Welcome ${variable("client_name")}!`);

  return (
    <EmailTemplate>
      <Header>Hello from JSX Email Builder</Header>
      <Body>
        <p>
          {variable("client_name") +
            `! We're so excited to have you on board. We hope you enjoy your time here.`}
        </p>
        <p>{`My name is ${variable("firstName")}.`}</p>
        <article>
          <p>
            {{
              trans: {
                text: `I am a <b>${variable("occupancy")}</b>.`,
                options: { count: 2 },
              },
            }}
          </p>
        </article>
      </Body>
      <Footer>Creating email templates never been so easy!</Footer>
    </EmailTemplate>
  );
}

export default Root;
