const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');

const app = express();
const fs = require('fs');
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculate-service' },
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }
const add= (n1,n2) => {
    return n1+n2;
}
const subtract= (n1,n2) => {
  return n1-n2;
}
const multiply= (n1,n2) => {
  return n1*n2;
}
const divide= (n1,n2) => {
  return n1/n2;
}

// middleware
app.use(express.json());
app.use(passport.initialize());

// sample users array
const users = [
  {
    id: 1,
    username: 'vaishali',
    password: '1234'
  },
  {
    id: 2,
    username: 'rahul',
    password: '5678'
  }
];

// generate JWT token
function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'default_secret';

  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });

  return token;
}

// configure passport local strategy
passport.use(new LocalStrategy(
  function (username, password, done) {
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return done(null, false, { message: 'Incorrect username or password' });
    }

    const token = generateToken(user);

    return done(null, user, token);
  }
));

// login endpoint
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, token) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Failed to authenticate user',
        user: user
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      return res.json({ token });
    });
  })(req, res);
});

app.get("/add", passport.authenticate('local', { session: false }), (req,res)=>{
  try{
  const n1= parseFloat(req.query.n1);
  const n2=parseFloat(req.query.n2);
  if(isNaN(n1)) {
      logger.error("n1 is incorrectly defined");
      throw new Error("n1 incorrectly defined");
      
  }
  if(isNaN(n2)) {
      logger.error("n2 is incorrectly defined");
      throw new Error("n2 incorrectly defined");
  }
  
  if (n1 === NaN || n2 === NaN) {
      console.log()
      throw new Error("Parsing Error");
  }
  logger.info('Parameters '+n1+' and '+n2+' received for addition');
  const result = add(n1,n2);
  res.status(200).json({statuscocde:200, data: result }); 
  } catch(error) { 
      console.error(error)
      res.status(500).json({statuscocde:500, msg: error.toString() })
    }
});

// // protected endpoint
// app.get('/add', passport.authenticate('local', { session: false }), (req, res) => {
//   const { num1, num2 } = req.query;
//   const sum = Number(num1) + Number(num2);

//   res.json({ result: sum });
// });

// start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
