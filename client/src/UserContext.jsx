//🔹 UserContext: Yeh app ka context hai jisme globally logged-in user ka data store hota hai (like username, id)
// Yeh code ek React Context ka setup hai, jo ek chat app ke liye banaya gaya hai. Iska kaam hai logged-in user ka data (jaise username aur ID) ko globally store karna aur app ke kisi bhi component mein easily access karne ke liye provide karna. Yeh ek tarah ka global container hai, jisse tumhe props drilling (bar-bar props pass karna) se bachne mein madad milti hai.

import {createContext, useEffect, useState} from "react";
import axios from "axios";

// global container jisme user ka data rakha jayega...
// Taaki app ke kisi bhi component mein user ka data easily access ya update kar sakein bina props drilling ke...
// Chat app mein user ka data (jaise username, ID) har jagah chahiye, jaise messages mein naam dikhane ke liye...
export const UserContext = createContext({});


// Yeh ek functional component hai jo context ko provide karta hai. {children} prop se yeh apne andar nested components ko render karta hai...
// Context ke values (username, ID, aur unke setters) ko app ke components tak pahunchata hai.
export function UserContextProvider({children}) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  useEffect(() => {
    // idhar ham axios ka use kyun kar rahe hain
    // axios ek library hai jo HTTP requests (jaise GET, POST) banane ke liye use hoti hai.
    //  Yahan iska use server se user ka data fetch karne ke liye hoga.
    axios.get('/profile').then(response => {
      if (response.data.user) {
        setId(response.data.user.userId);
        setUsername(response.data.user.username);
      }
    }).catch(error => {
      console.error("Failed to fetch profile:", error);
      // Handle error if needed, e.g., redirect to login
    });
  }, []);
  return (
    <UserContext.Provider value={{username, setUsername, id, setId}}>
      {children}
    </UserContext.Provider>
  );
}