function Root() {
  setSubject(`Multiple items sold to ${variable("client_name")}!`);

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
          <h1>Wow batch sale!</h1>
          <p>
            {variable("client_name")} bought {variable("items_sold")} items!
          </p>
        </div>
      </body>
    </html>
  );
}

export default Root;
