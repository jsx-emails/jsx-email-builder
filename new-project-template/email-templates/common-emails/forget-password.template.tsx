function Root() {
  setSubject(`Link to reset your password`);

  return (
    <html>
      <head></head>
      <body>
        <div
          style={{
            fontSize: 12,
          }}
        >
          <h1>{variable("name")} Lost your password?</h1>
          <p>No worries, we got you covered.</p>
          <p>
            {variable("name")}, click the link below to reset your password.
            {variable("emoji")}
          </p>
        </div>
      </body>
    </html>
  );
}

export default Root;
