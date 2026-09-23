import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Connecting to Codelens API...");

  useEffect(() => {
    fetch("http://localhost:5001")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage("Could not connect to Codelens API");
      });
  }, []);

  return (
    <div>
      <h1>Codelens</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;