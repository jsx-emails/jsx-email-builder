# JSX Email Builder

JSX Email Builder is a tool for building HTML emails using JSX. It does this by compiling JSX to HTML and then inlining the CSS. No more writing HTML emails by hand!

Your templates will look like this:

```jsx
// imports come here

function Root() {
  return (
    <EmailTemplate>
      <Header>My Company</Header>
      <Body>
        <SubHeader>Welcome to My Company!</SubHeader>
        <Main>
          <Paragraph>
            We're so excited to have you on board. We hope you enjoy your time
            here.
          </Paragraph>
          <Button href="https://mycompany.com">Visit My Company</Button>
        </Main>
      </Body>
    </EmailTemplate>
  );
}
```

## Features

### Translations

Jsx email builder uses [i18next](https://www.i18next.com/) for translations so all the power of i18next is at your disposal.

## Prerequisites

- Node.js 16 or higher

  make sure you have the latest version of Node.js installed. You can check your version by running `node -v` in your terminal.

- NPM 8 or higher

  make sure you have the latest version of NPM installed. You can check your version by running `npm -v` in your terminal.

## Create a new project

If you don't have a project yet, you can create one by running the following command:

```bash
npx jsx-email-builder@latest init my-project
```

Or optionally, you can specify the project directory and the templates directory:

```bash
npx jsx-email-builder@latest init my-project --projectDir ../projects --templatesDir templates
```

aliases: `new`, `create`

This will create a new project in the `my-project` directory. It will also create a `templates` directory with some example templates. Feel free to delete or modify these templates.

Now it's time to install the dependencies:

```bash
npm install
```

or

```bash
yarn install
```

## Run your project

```bash
npm run start
```

Or using yarn:

```bash
yarn start
```

This will start a development server that will watch your templates and recompile them when they change. By default, it will run on port 3000, but you can change this by passing the `--port` flag. To view your templates, go to `http://localhost:3000/` in your browser.

## Build your project

```bash
npm run build
```

Or using yarn:

```bash
yarn build
```

This will compile all of your JSX email templates into HTML files.
