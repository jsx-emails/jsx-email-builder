function Root() {
  setSubject(`We are preselling ${variable("project_name")}!`);

  return (
    <html>
      <head></head>
      <body>
        <div
          style={{
            color: "red",
            backgroundColor: "pink",
            fontSize: 12,
            border: "1px solid black",
          }}
        >
          <h1>Pre-sale</h1>
          <p>We are currently in pre-sale</p>
        </div>
      </body>
    </html>
  );
}

export default Root;
