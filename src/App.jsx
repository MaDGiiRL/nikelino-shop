import Routing from "./routes/Routing";
import SessionProvider from "./context/SessionProvider";
export default function App() {
  return (
    <SessionProvider>
      <Routing />
    </SessionProvider>
  );
}
