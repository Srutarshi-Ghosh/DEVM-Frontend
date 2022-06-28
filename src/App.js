import "./App.css";
import Login from "./Pages/Login";
import GetStarted from "./Pages/GetStarted";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VotingPage from "./Pages/VotingPage";
import { NotificationProvider } from "web3uikit";
import Verify from "./Pages/Verify";
import { RecoilRoot } from "recoil";

function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <NotificationProvider>
          <Router>
            <div>
              <Routes>
                <Route path="/vote" element={<VotingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/" index element={<GetStarted />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </RecoilRoot>
    </div>
  );
}

export default App;
