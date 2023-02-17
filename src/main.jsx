import React, { useContext } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './Screens/App';
import Login from './Screens/Login';
import Register from './Screens/Register';
import { GlobalProvider } from './Screens/GlobalContext';
import Dashboad from './Screens/Dashboad';
import CoinDetails from './Screens/CoinDetails';
import AddCoin from './Screens/AddCoin';
import Profile from './Screens/Profile';
import MyCoins from './Screens/MyCoins';
import MyOrders from './Screens/MyOrders';
import AccountSettings from './Screens/AccountSettings';
import ChangePassword from './Screens/ChangePassword';
import Advertise from './Screens/Advertise';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children : [
      {
        path: "/login",
        element : <Login />,
      },
      {
        path: "/register",
        element : <Register />
      },
      {
        path: "/",
        element : <Dashboad />
      },
      {
        path: "coin/:name",
        element : <CoinDetails />
      },
      {
        path: "add-coin",
        element : <AddCoin />
      },
      {
        path: "profile/:name",
        element : <Profile />
      },
      {
        path: "my-fav",
        element : <Dashboad />
      },
      {
        path: "my-coins",
        element : <MyCoins />
      },
      {
        path: "my-orders",
        element : <MyOrders />
      },
      {
        path: "account-settings",
        element : <AccountSettings />
      },
      {
        path: "password",
        element : <ChangePassword />
      },
      {
        path: "advertise",
        element : <Advertise />
      },
    ]
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <GlobalProvider>
    <RouterProvider router={router} />
  </GlobalProvider>
  </React.StrictMode>,
)