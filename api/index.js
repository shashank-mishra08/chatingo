const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');  
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const ws = require('ws');
const fs = require('fs');
const { error } = require('console');
// const { error } = require('console');
// ================== 1. Environment Variables Setup =========================
// dotenv package ko use karke environment variables ko load karte hain
// Ye variables .env file se aate hain, jisme sensitive information hoti hai jaise database URL, JWT secret, etc.
// Ye variables process.env object me store hote hain,
// jisse hum application ke kisi bhi part me access kar sakte hain.
// Isse humare code me sensitive information hardcode nahi hoti, jo security ke liye accha hai.
// dotenv ko import karte hain aur config function ko call karte hain,
// jisse .env file se variables load ho jate hain process.env me.
// dotenv ko import karte hain aur config function ko call karte hain,
dotenv.config();
console.log(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
console.log(jwtSecret);
const bcryptSalt = bcrypt.genSaltSync(10);
console.log(bcryptSalt); 


// ================== 2. MongoDB Connection Setup =========================
// Mongoose ko import karte hain, jo MongoDB ke saath interact karne ke liye use hota hai.
// Mongoose ko connect karte hain MongoDB ke URL se,
// jo process.env.MONGO_URL se aata hai.
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
// ===================================================

//============= 🟩 3. Express App Init + Middleware===========
// ek Express.js application ka setup hai
// Isme middleware aur ek helper function hai jo user data nikalne ke liye banaya gaya hai
//  bina iske login, file upload, frontend se data bhejna lena — sab fail ho jaata.

// Yeh code:
// 	•	Express app initialize kar raha hai
// 	•	Middleware attach kar raha hai (middlewares = request ke beech wale helpers)
// 	•	Static files serve kar raha hai (jaise uploaded images)
// 	•	Cookies read kar raha hai
// 	•	CORS allow kar raha hai (taaki frontend connect ho paye)
// 	•	JWT token se user ka data extract karne ka helper function bana raha hai


const app = express();
app.use('/uploads', express.static(__dirname + '/uploads'));
// Ye middleware har incoming request body ko JSON me parse karta hai.
// Isse hum request body me JSON data ko easily access kar sakte hain.
// Ye middleware cookies ko parse karta hai, taaki hum request me cookies ko access kar sake
app.use(express.json());
// Ye cookie ko parse karta hai — taaki tu req.cookies.token use kar sake.
// 🧠 JWT token browser me HTTP-only cookie me save hota hai
// Aur har request ke sath cookie bhejta hai — is line ke bina tu read hi nahi kar paayega token ko.
app.use(cookieParser());
// Ye CORS allow karta hai — taaki frontend (React app) backend se connect kar sake.

// 📦 Tu jab browser me localhost:3000 pe React chala raha hai
// Aur server localhost:4040 pe hai — to dono alag domains hai

// 🧠 By default, browser block kar deta hai aisi cross-domain requests.
// Ye line likhne se React backend se freely baat kar paata hai.
app.use(cors({
  origin:process.env.CORS_ORIGIN.split(','), // React app ka URL
  credentials: true, // Cookies ko allow karta hai
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  // isme humne origin me sirf localhost:5173 diya hai, kyuki
  // humara React app wahi pe run ho raha hai. Agar production me deploy karte
  // hain, to yahan production URL dena padega.
  // Agar tu production me deploy karega, to yahan production URL dena padega
  // Jaise: origin: ['https://your-production-domain.com']
  // Agar tu multiple origins allow karna chahta hai, to unhe array me dal sakta hai
  // Jaise: origin: ['http://localhost:5173', 'https://your-production-domain.com']
//  isme humne origin me sirf localhost:5173 diya hai, kyuki
  // humara React app wahi pe run ho raha hai
  
}));

// ================== 4. Helper Function to Get User Data from Request =========================
// Ye function request se JWT token nikalta hai
// Aur us token ko verify karke user ka data return karta hai.
// Agar token nahi hai ya invalid hai, to ye error throw karta hai.
// Is function ko har route me use kar sakte hain jahan user data chahiye
// Isse code reusable ho jaata hai aur har route me bar-bar token verify karne ki zarurat nahi padti.
// Is function ko async banaya gaya hai taaki hum await use kar sakein
// Aur promise return kare taaki hum easily handle kar sakein.
// Is function ko use karne se humein har route me user data mil jaata hai
// Aur hum easily user-specific operations kar sakte hain jaise messages fetch karna,
// profile data fetch karna, etc.
// Is function ko use karne se code clean aur maintainable ho jaata hai
// Aur humein har route me bar-bar token verify karne ki zarurat nahi padti.
// Is function ko use karne se hum easily user authentication aur authorization handle kar sakte hain
// Is function ko use karne se humein har route me user data mil jaata
// Aur hum easily user-specific operations kar sakte hain jaise messages fetch karna,
// profile data fetch karna, etc.
// Is function ko use karne se code clean aur maintainable ho jaata hai
// Aur humein har route me bar-bar token verify karne ki zarurat nahi padti.
// Is function ko use karne se hum easily user authentication aur authorization handle kar sakte hain
// Is function ko use karne se humein har route me user data mil jaata
// Aur hum easily user-specific operations kar sakte hain jaise messages fetch karna,
// profile data fetch karna, etc.

// ✅ Helper function to extract user data from JWT token in cookie
// 🔐 Used to secure routes and know which user is making the request

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    // ✅ Read the token from cookie
    const token = req.cookies?.token;

    if (token) {
      // ✅ Decode and verify the JWT token
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) {
          // ❌ Token invalid
          console.error('Token verification failed:', err);
          return reject('Invalid token');
        }

        // ✅ Token valid → send userData
        resolve(userData);
      });
    } else {
      // ❌ No token found
      reject('No token');
    }
  });
}

// =======================================================================================================
//  yahin par saare routes define kr diye hain iske liye koi alag se folder nahi banaya gaya hai
app.get('/test', (req,res) => {
  res.json('wow yaar shashank yaar, its working');
});

// Yeh code ek API endpoint hai jo messages fetch karta hai do users ke beech,

// ✅ GET /messages/:userId
// 🔹 Returns all messages between the logged-in user and the target user
// 🔐 Token is validated using helper function

app.get('/messages/:userId', async (req, res) => {
  try {
    // ✅ Step 1: Get target userId from URL params
    const { userId } = req.params;

    // ✅ Step 2: Get logged-in user's info from token
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;

    // ✅ Step 3: Fetch all messages between the two users (both directions)
    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 }); // oldest first
    console.log("sdsd", messages);  

    // ✅ Step 4: Return message list
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});
// ====================GET /people -- Saare users ki list return karta hai==========================
// GET /people: Saare users ki list (sirf _id aur username) return karta hai.
// ✅ GET /people
// 🔹 Returns list of all registered users with only their _id and username
// 🔹 This route is useful for showing contacts in sidebar/chat list

// ✅ GET /people
// 🔹 Returns list of all registered users with only their _id and username
// 🔹 This route is useful for showing contacts in sidebar/chat list
app.get('/people', async (req, res) => {
  try {
    // ✅ MongoDB query:
    // - {} means: no filters, fetch all users
    // - { _id: 1, username: 1 } means: only include _id and username in result
    const users = await User.find({}, { _id: 1, username: 1 });

    // ✅ Send the users as JSON response
    console.log(`[GET /people] ✅ Found ${users.length} users`);
    res.status(200).json({
      message: 'Users fetched successfully',
      count: users.length,
      users: users
    });
  } catch (err) {
    // 🛑 Error handling: log and return error response
    console.error('[GET /people] ❌ Error fetching users:', err.message);

    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'Something went wrong while retrieving user list. Please try again later.'
    });
  }
});
// =========================================================================================================





// // ==============================profile wala part start========================================================
// 💡 Optional Improvement:
//	•	🔐 Add JWT verification using middleware or helper (like getUserDataFromRequest) to make it protected route.

//	•	🛡️ Only authenticated users should access this route
//  GET /profile: JWT token se authenticated user ka data return karta hai.
// ✅ GET /profile
// 🔹 Returns the currently logged-in user's data (from token)
//🧠 Iska kaam:

//✅ Sirf CURRENT logged-in user ka data (userId, username) return karta hai
//❌ Saare users ka data nahi deta — wo /people route ka kaam hota hai

// Iska kaam:
// 🔐 GET /profile ka real use kya hai?
// 	1.	Login ke baad frontend ko pata chale user kaun hai
// 	•	Jaise hi user login karta hai, JWT token save hota hai cookie me
// 	•	Frontend fir /profile route ko call karta hai to JWT se verify karke backend user ka id aur username de deta hai
// 	•	Isse React frontend ko pata chalta hai:
// 👉 “Oh! Shashank login hai!”
// 	2.	Refresh karne ke baad bhi login bana rahe
// 	•	Agar user refresh kare page ko, frontend local state to reset ho jaati hai
// 	•	Is route ko call karke backend se fir se confirm kar lete hain ki user logged in hai ya nahi
// 	3.	Protected routes banane me kaam aata hai
// 	•	Jaise kisi route pe sirf logged-in user ko access dena ho (e.g., /messages/:userId)
// 	•	Pehle /profile se verify kar lete hain ki user kaun hai
// front-end me iska use:
// useEffect(() => {
//   axios.get('/profile').then(response => {
//     setId(response.data.userId);
//     setUsername(response.data.username);
//   });
// }, []);
app.get('/profile', (req, res) => {
  try {
    const token = req.cookies?.token;

    // Step 1: Token missing
    if (!token) {
      console.warn('[PROFILE] ❌ No token provided in cookies');
      return res.status(401).json({ error: 'Authentication required. Please login.' });
    }

    // Step 2: Token exists, now verify it
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) {
        console.error('[PROFILE] ❌ JWT verification failed:', err.message);
        return res.status(403).json({ error: 'Session expired or invalid. Please login again.' });
      }

      // Step 3: Valid token → send user data
      console.log(`[PROFILE] ✅ Token verified for user: ${userData.username} (${userData.userId})`);
      res.status(200).json({
        message: 'User is authenticated.',
        user: userData
      });
    });
  } catch (error) {
    console.error('[PROFILE] ❌ Unexpected error:', error.message);
    res.status(500).json({ error: 'Something went wrong on the server. Please try again later.' });
  }
});
// ==============================profile wala part end========================================================





// ==================== LOGIN WALA PART ======================================

app.post('/login', async (req,res) => {
  const {username, password} = req.body;
  // 1. ✅ Input validation
  if (!username || !password) {
    console.log('Username and password are required');
    console.error('Username and password are required');
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try{
     const foundUser = await User.findOne({username});
     console.log('Found user:', foundUser);

    //  2. ✅ Check if user exists
    // Agar user nahi mila to foundUser null hoga
    // Agar user mila to foundUser me user ka data hoga
     if (!foundUser) {
      // 2. ✅ User not found
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials, user not found-vivek' });
    }

    // 3. ✅ Compare password
    // Agar foundUser hai to password check karte hain
    // bcrypt.compareSync() function ko use karke password ko hash ke sath compare karte hain
    // Agar password match nahi hota to passOk false hoga
    // Agar password match hota hai to passOk true hoga
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
         if (!passOk) {
          console.log('Invalid password', password, foundUser.password);
      return res.status(401).json({ error: 'Invalid credentials, tumne galat password diya hai' });
    }
    // 4. ✅ Create token
    if (passOk) {
      console.log('Password is correct, creating token');
      // jwt.sign() function ko use karke token create karte hain
      // Ye function 3 arguments leta hai:
      // 1. Payload: Jo data token me store karna hai (userId, username)
      // 2. Secret: Jo secret key use karni hai token sign karne ke liye (jwtSecret)
      // 3. Options: Jo options set karne hain token ke liye (expiresIn)
      // 4. Callback: Jo function call hoga jab token create ho jayega
      // 5. ✅ Set cookie and respond
      // Ye function token ko create karta hai aur callback function me token ko return karta hai
      // Agar token create karne me error aata hai to err variable me error aayega
      // Agar token create ho jata hai to token variable me token aayega
      // Iske baad hum token ko cookie me set karte hain aur response me user data bhejte hain  
      jwt.sign({userId:foundUser._id,username}, 
        jwtSecret, 
        {expiresIn: '1d'}, // optional block hota hai ye 
        (err, token) => {
          if (err) {
          console.error('JWT error:', err);
          return res.status(500).json({ error: 'Token generation failed' });
        }
        // 5. ✅ Set cookie and respond
        res.cookie('token', token, {sameSite:'none', secure:true, httpOnly:true, maxAge: 1*24*60*60*1000, }).status(200).json({
          id: foundUser._id,
          username: foundUser.username,
          message: "User logged in successfully ✅",
        });
      });
    }
  }
 }catch(err){
    console.error("there is somenting wrong in login section", err)
    // Agar koi error aata hai to console me error print karte hain
    res.status(500).json({error:'internal server error'})

  }   
  
});

// =======================login wala part end==================================================












// ==================LOG-OUT WALA PART====================================================
  // User jab logout kare, to:
	// •	Token delete ho jaaye
	// •	Frontend me bhi username / id reset ho jaaye
	// •	WebSocket disconnect ho jaaye (optional)
app.post('/logout', (req,res) => {
  res.cookie('token',
     '', // Cookie ko empty string set kiya, taaki token delete ho jaaye
         {maxAge: 0, // Cookie ko turant expire kar diya
         httpOnly:true, // 🍪 Prevent JS access to cookie
         sameSite:'none',
         secure:true}).json({message: 'Logged out successfully ✅'});
});


	// •	Token ko basically empty string se replace kar diya gaya
	// •	Frontend pe browser se token hat gaya, to GET /profile next time fail karega
  //========================= LOG-OUT WALA PART END====================================================


  //===================== Here the user will REGISTER =======================================================================
  // we used to create ye api wala route alag se but here simultaneously created

  app.post('/register', async (req,res) => {
  console.log('Received:', req.body);
  // request ki body me se username aur password nikal liya
  const {username,password} = req.body;
  // 1. ✅ Input validation
  if (!username || !password || username.length < 3 || password.length < 6) {
  const errorMessage = 'Username must be at least 3 characters and password at least 6 characters.';

  console.log(errorMessage);    // ✅ Will show in terminal
  console.error(errorMessage);  // ✅ Will show in terminal as red

  return res.status(400).json({ error: errorMessage }); // ✅ Will show in Postman or frontend
}

  try {

    // 2. ✅ Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Username already taken');
      // Agar username already exist karta hai, to 409 Conflict status code bhej do
      // Ye status code indicate karta hai ki request valid hai, lekin server ne conflict detect kiya hai
      // Is case me, username already exist karta hai, to user ko error message bhej do
      // 409 Conflict: Resource already exists
      return res.status(409).json({ error: 'Username already taken'});
    }
   
    //  3. ✅ Hash the password, jo password mila usko ab hash karna hoga, and iske liye we use bcrypt.
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    //  4. ✅ Create user
    const createdUser = await User.create({
      username:username,
      password:hashedPassword,
    });
     // jwt.verify(token, secret, options, callback)
    // the information that you want inside your jwt... 
    //  5. ✅ Create JWT token with expiry
    jwt.sign( { userId: createdUser._id, username }, jwtSecret, { expiresIn: '1d' }, // ⏰ Optional: Token valid for 7 days 
      (err, token) => {
        if (err) {
          console.error('JWT error:', err);
          return res.status(500).json({ error: 'Token generation failed' });
        }
        // // 6. ✅ Send token in cookie and response
      res.cookie('token', token, {sameSite:'none', secure:true, httpOnly: true, // 🍪 Prevent JS access to cookie
            maxAge: 7 * 24 * 60 * 60 * 1000 }).status(201).json({
           id: createdUser._id,
            username: createdUser.username,
            message: 'User registered successfully ✅',
      });

    });
  } catch(error) {
    console.error("Registration error", error )
    res.status(500).json({error: 'internal server error'});
  }
});

// ================= REGISTER WALA PART END =========================================================



// ================== 5. Start the Server and WebSocket =========================


// Ye code server ko start karta hai aur WebSocket server ko bhi initialize karta hai
// Ye code server ko 4040 port pe sunta hai
const server =app.listen(4040, () => console.log("Server running on port 4040"));


// Ye code WebSocket server ko initialize karta hai
const wss = new ws.WebSocketServer({server});
wss.on('connection', (connection, req) => {
  console.log('New connection established', connection);
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
      }));
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();

    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 2000);

  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });

  // read username and id form the cookie for this connection
  // Ye code request se cookie nikalta hai aur JWT token ko verify karta hai
  // Agar token valid hai to userId aur username ko connection object me store karta hai
  // Agar token invalid hai to connection object me userId aur username nahi set hota
  // Isse hum WebSocket connection ke sath user data attach kar sakte hain

  const cookies = req.headers.cookie;
  if (cookies) {
    // cookies string se token cookie nikaal rahe hain
    const tokenCookieString = cookies.split(';').find(str => str.trim().startsWith('token='));
    // Agar token cookie mil gayi to usse split kar ke token nikaal rahe hain
    // aisa karne se humein token cookie ka value milta hai
    // use kya hai iska, ye hai ki hum WebSocket connection ke sath user data attach kar sakein
    if (tokenCookieString) {
      // tokenCookieString ko '=' se tod rahe hain
      // Aur agar token cookie string me '=' hai to usse split kar ke token nikaal rahe hain
      const parts = tokenCookieString.split('=');
      // parts[1] me token hota hai, agar cookie string me token hai
      const token = parts.length > 1 ? parts[1] : null;

      try {
      // Agar token hai to usse verify kar rahe hain
      // verify karke kya hoga
      // Ye hoga ki agar token valid hai to userData me userId aur username mil jayega
      // Agar token invalid hai to error throw hoga
      if (token) {
        // jwt.verify(token, secret, options, callback)
        // 	•	callback → jab verification ho jaata hai, ye function call hota hai
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const {userId, username} = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
     }
      catch(err){
        console.log("token not found");

      }


    }
  }


// ====================================================================================================

  connection.on('message', async (message) => {
    // Client se message string format me aata hai (text form me, not object).
	  //	Pehle message.toString() kar ke string me convert kiya.
	  //  Fir JSON.parse() se usse JavaScript object bana liya.
    const messageData = JSON.parse(message.toString());
    //  Object destructuring ka use karke 3 values nikaali:
		//  recipient → Jise message bhejna hai (userId)
		//  text → Message ka content
		//  file → Agar image ya file bheji gayi hai to wo yahan aayegi
    const {recipient, text, file} = messageData;

    let filename = null;
    if (file) {
      //  File ka size log kar raha hai. file.data me base64 string hoti hai.
      console.log('size', file.data.length);
      // File name ko . ke base pe tod diya (example: "hello.jpg" → ["hello", "jpg"])
      const parts = file.name.split('.');
      // Last part liya, jo file extension hota hai (e.g., "jpg")
      const ext = parts[parts.length - 1].toLowerCase();
      // Tune file ka extension seedha client se liya hai (file.name.split('.')). Yeh dangerous ho sakta hai kyunki koi bhi malicious file bhej sakta hai (jaise .exe ya .php). Isse server pe attack ho sakta hai.
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']; // Jo extensions allow karna
      // Ek unique filename bana liya using timestamp + extension:, 📌 Example: 1719845673948.jpg
      filename = Date.now() + '.'+ext;
      // File kaha save hogi server pe, uska full path banaya: 📍 Example: /home/user/project/uploads/1719845673948.jpg
      const path = __dirname + '/uploads/' + filename;
      // dekhte hain isko baad me
          const base64Data = file.data.split(',')[1];
          const bufferData = Buffer.from(base64Data, 'base64');
       // File ko server ke uploads folder me likh diya.
	    // fs.writeFile() Node.js ka method hai
	   // File save hone ke baad console me log kiya
      // File save karte waqt error handle karo
      fs.writeFile(path, bufferData, (err) => {
        if (err) {
          console.error('File save karne me dikkat hui:', err);
          return; // Yahan error client ko bhi bhej sakte ho agar chaho
        }
        console.log('File saved ho gaya:' + path);
      });
    }
    // 🧠 Safety check: message me ya to text ho ya file ho AND recipient hona chahiye tabhi aage ka code chale.
    if (recipient && (text || file)) {
      // 🧠 Message ko database (MongoDB) me store kiya using Message model.
    try {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
        console.log('Message database me save ho gaya');
    } catch (err) {
        console.error('Database me message save karne me error:', err);
        return; // Yahan bhi client ko error bhej sakte ho
      }
      console.log('created message');

      //  🧠 Sab connected clients ka array banaya.
      [...wss.clients]
      // 🧠 Sirf us client ko dhunda jiska userId === recipient hai — matlab jisko message bhejna hai.
        .filter(c => c.userId === recipient)
        // 🧠 Us client ko message send kar diya in this format:
        //   {
        //   "text": "Hello!",
        //   "sender": "currentUserId",
        //   "recipient": "user456",
        //  "file": "abc.jpg",
        //  "_id": "mongoId123"
        //   }
        .forEach(c => c.send(JSON.stringify({
          text,
          sender:connection.userId,
          recipient,
          file: file ? filename : null,
          _id: message._id,
        })));
    }
  });

  // notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});













// 🔥 Perfect bhai!
// Chalo ab getUserDataFromRequest() ko ek reusable middleware me convert karte hain — isse har baar bar-bar await getUserDataFromRequest(req) likhne ki zarurat nahi padegi.

// ⸻

// ✅ Middleware Version of getUserDataFromRequest()

// ⸻

// 🔧 Step 1: Create a new file: middlewares/authMiddleware.js

// const jwt = require('jsonwebtoken');

// const authMiddleware = (jwtSecret) => {
//   return (req, res, next) => {
//     const token = req.cookies?.token;

//     if (!token) {
//       return res.status(401).json({ error: 'Unauthorized: No token provided' });
//     }

//     jwt.verify(token, jwtSecret, {}, (err, userData) => {
//       if (err) {
//         return res.status(403).json({ error: 'Forbidden: Invalid token' });
//       }

//       // ✅ Attach user data to req object
//       req.user = userData;
//       next();
//     });
//   };
// };

// module.exports = authMiddleware;


// ⸻

// 🧠 What this does:
// 	•	JWT ko decode karta hai
// 	•	Agar valid token hai → req.user = { userId, username }
// 	•	next() bolkar route ke handler ko allow karta hai
// 	•	Agar token invalid hai → return with error

// ⸻

// 🔧 Step 2: Use in your server file

// At the top:

// const authMiddleware = require('./middlewares/authMiddleware');

// Use in routes like this:

// app.get('/messages/:userId', authMiddleware(jwtSecret), async (req, res) => {
//   const { userId } = req.params;
//   const ourUserId = req.user.userId;

//   const messages = await Message.find({
//     sender: { $in: [userId, ourUserId] },
//     recipient: { $in: [userId, ourUserId] },
//   }).sort({ createdAt: 1 });

//   res.json(messages);
// });


// ⸻

// ✅ Now your route looks much cleaner:
// 	•	Token validation ho gaya
// 	•	req.user me verified info aa gaya
// 	•	Code reusable ho gaya ✅

// ⸻

// 🔁 You can use this middleware in:

// app.get('/profile', authMiddleware(jwtSecret), (req, res) => {
//   res.json(req.user); // { userId, username }
// });

// app.get('/people', authMiddleware(jwtSecret), async (req, res) => {
//   const users = await User.find({}, { _id: 1, username: 1 });
//   res.json(users);
// });


// ⸻

// 🧠 Bonus Tip: Apply middleware to group of routes

// If all routes after login need auth, you can group them:

// app.use(authMiddleware(jwtSecret)); // all routes below this line will be protected


// ⸻

// ✅ Summary:

// Old Way (Function)	New Way (Middleware)
// Manually calling await getUserDataFromRequest()	Auto handle with authMiddleware()
// Extra try-catch in every route	Built-in error handling in middleware
// Repeated logic everywhere	DRY (Don’t Repeat Yourself)
// Less secure (can forget to verify)	Guaranteed protection


// ⸻

// Tu ready hai bhai production-grade code likhne ke 💪
// Next bol: “Chat history delete endpoint bana bhai” ya
// “Frontend auth flow explain kar”
// Mai ready hoon 🚀