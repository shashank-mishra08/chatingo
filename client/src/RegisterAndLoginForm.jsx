import {useContext, useState} from "react";
import axios from "./api.js";
import {UserContext} from "./UserContext.jsx";
import './app.css'; // Assuming you have a CSS file for styles



export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');

  // niche wale line ka kya use hai?
  // useContext hook se UserContext se values ko access karte hain
  // setUsername aur setId functions ko use karte hain user ke login ya registration ke baad
  // taaki hum user ka username aur ID context mein set kar sakein
  // isse humara app globally user ke data ko access kar sakta hai bina props
  // drilling ke
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);

// =================================  HANDLE SUBMIT FUNCTION =========================================
  // handleSubmit function ko form ke submit hone par call kiya jata hai
  // is function mein hum user ke input ko server par bhejte hain
  // aur agar registration ya login successful hota hai toh user ko success message dikhate hain
  // aur agar error aata hai toh user ko error message dikhate hain
  // is function mein hum axios ka use karte hain server se request bhejne ke liye
  // aur response ko handle karne ke liye
  // event.preventDefault() se form ka default submit behavior rok dete hain
  // taaki page reload na ho
  async function handleSubmit(event) {
    event.preventDefault();
  // •	Ye ternary condition decide karti hai ki user register kar raha hai ya login.
	// •	Agar mode "register" hai → toh 'register' API hit hoga.
	// •	Nahi toh 'login' API.
       const url = isLoginOrRegister === 'register' ? '/register' : '/login';
    
    try{
      const {data} = await axios.post(url, {username,password});  
    setLoggedInUsername(username);
    setId(data.id);
    setErrorMessage(''); // Reset error message on success
    alert(`${isLoginOrRegister === 'register' ? 'Registered' : 'Logged in'} successfully!`);

    }
  catch(error) {
      // Server se jo error aaya, usse alert me dikhaate hain
    if (error.response && error.response.data && error.response.data.error) {
      alert("❌ " + error.response.data.error);  // eg: username taken, invalid credentials
    } else {
      alert("⚠️ Something went wrong. Try again later.");
      setErrorMessage("⚠️ Something went wrong. Try again later.");
    }
    
  }

//     {
//   data: {
//     id: '123',
//     username: 'shashank'
//   },
//   status: 200,
//   headers: {...}
// }
    
    // console.log('Response:', data);
    // Agar registration ya login successful ho jata hai, toh hum username aur id ko context mein set karte hain
    // setLoggedInUsername(username);
    // setId(data.id);
    // Aur user ko success message dikhate hain
    // alert(`${isLoginOrRegister === 'register' ? 'Registered' : 'Logged in'} successfully!`);
    // Agar error aata hai toh hum error ko console mein print karte hain aur user ko alert karte hain
    // console.error('Error during registration/login:', error);
    // alert('An error occurred. Please try again.');
  }

  console.log('Sending to server:', {username, password});
// =================================  HANDLE SUBMIT FUNCTION =========================================

  // return ke upar ham apne react function component ka naam likhte hain
  // aur return ke andar ham apne component ka JSX likhte hain
  // JSX ek syntax hai jo HTML aur JavaScript ko combine karta hai
  // JSX ko React ke components mein use kiya jata hai

  return (
    <div className="bg-blue-50 h-screen flex items-center">
    {/* this form for registering user */}
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>


        <input value={username}
               onChange={event => setUsername(event.target.value)}
               type="text" 
               placeholder="Enter Your Username"
               className="block w-full rounded-lg  p-3 mb-4 border border-gray-300 focus:border-blue-500
               shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500  focus:ring-opacity-50
               transition-all duration-300 ease-in-out text-gray-800 font-medium
               "
              />


        <input value={password}
               onChange={event => setPassword(event.target.value)}
               type="password"
               placeholder="Enter Your Password"
               className="block w-full rounded-lg  p-3 mb-4 border border-gray-300 focus:border-blue-500
               shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500  focus:ring-opacity-50
               transition-all duration-300 ease-in-out text-gray-800 font-medium
               "
              />
{/* =================================================== */}
              

        <button className="bg-blue-500 text-white block w-full rounded-sm p-2 border-rounded-lg
               hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
 
{/* ye text ke baad wale button ke liye hai */}
        <div className="text-center mt-2">
          {isLoginOrRegister === 'register' && (
            <div>
              Already a member ?
              <button className="ml-2 text-green-600" onClick={() => setIsLoginOrRegister('login')}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login' && (
            <div>
              Dont have an account ?
              <button className="ml-1 text-green-500" onClick={() => setIsLoginOrRegister('register')}>
                Register
              </button>
            </div>
          )}
        </div>


      </form>
    </div>
  );
}