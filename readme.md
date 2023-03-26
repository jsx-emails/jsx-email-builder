# JSX Email Builder

JSX Email Builder is a tool for building HTML emails using JSX. It does this by compiling JSX to HTML and then inlining the CSS. No more writing HTML emails by hand!

Your templates will look like this:

```jsx
// imports comes here

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

## Prerequisites

- Node.js 16 or higher

  make sure you have the latest version of Node.js installed. You can check your version by running `node -v` in your terminal.

- NPM 8 or higher

  make sure you have the latest version of NPM installed. You can check your version by running `npm -v` in your terminal.

## Add to an existing project

If you already have a project, you can add JSX Email Builder to it by running the following command:

```bash
# Using npm:
npm install --save-dev jsx-email-builder

# Using yarn:
yarn add --dev jsx-email-builder

# Using pnpm:
pnpm add --save-dev jsx-email-builder
```

Then add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "jsx-email-builder dev",
    "build": "jsx-email-builder build"
  }
}
```

## Create a new project

If you don't have a project yet, you can create one by running the following command:

```bash
npx jsx-email-builder init my-project

# or optionally, you can specify the project directory and the templates directory:
npx jsx-email-builder init my-project --projectDir ../projects/my-project --templatesDir templates
```

aliases: `new`, `create`

This will create a new project in the `my-project` directory. It will also create a `templates` directory with some example templates. Feel free to delete or modify these templates.

## Run your project

```bash
jsx-email-builder dev
```

aliases: `start`, `serve`

This will start a development server that will watch your templates and recompile them when they change. By default, it will run on port 3000, but you can change this by passing the `--port` flag. To view your templates, go to `http://localhost:3000/` in your browser.

## Build your project

```bash
jsx-email-builder build
```

aliases: `compile`

This will compile all of your JSX email templates into HTML files.
