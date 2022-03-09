const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const pkg = require('./package.json');

const port = process.env.port || process.env.PORT || 5000;

const apiRoot = '/api';

// configure app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: /http:\/\/localhost/ }));
app.options('*', cors());


// our sample database

const db = {
  'nico': {
    'user': 'nico',
    'currency': 'euro',
    'balance': 100,
    'description': 'some blabla',
    'transaction': []
  }
}

// Configure routes
const router = express.Router();

router.get('/', (req, res) => {
  return res.send(`${pkg.description} v${pkg.version}`);
});

router.get('/accounts/:user', (req, res) => {
  const user = req.params.user;
  const account = db[user];

  if (!account){
    return res
      .status(404)
      .json({error: 'user does not exist'});
  }
  return res.json(account);
})


router.post('/accounts', (req, res) => {
  const body = req.body;
  // validate required values
  if (!body.user || !body.currency) {
    return res
      .status(404)
      .json({error: 'user and currency are required'});
  }
  // check account doesn't exist
  if (db[body.user]) {
    return res
      .status(404)
      .json({error: 'account already exists'});
  }
  // check balance is a number
  let balance = body.balance;
  if (balance && typeof(balance) !== 'number') {
    balance = parseFloat(balance);
    if (isNaN(balance)) {
      return res
      .status(404)
      .json({error: 'balance must be a number'});
    }
  }
  
  // now - if previous condition are ok - we can crezate the account

  const account = {
    user: body.user,
    currency: body.currency,
    currency: body.currency,
    description: body.description || `${body.user}'s account`,
    balance: balance || 0,
    transactions: []
  }

  db[account.user] = account

  // return the new account
  return res
    .status(201)
    .json(account);
})

// update
router.put('/accounts/:user', (req, res) => {
  const body = req.body;
  const user = req.params.user;
  const account = db[user]

  if (!account) {
    return res
      .status(404)
      .json({error: 'user not found'});
  }

  // validate only certain items editabme
  if(body.user || body.balance || body.transactions) {
    return res
      .status(400)
      .json({error: 'can only edit currency and description'});
  }

  if (body.description) {
    account.description = body.description;
  }
  if (body.currency) {
    account.currency = body.currency;
  }

  return res
    .status(201)
    .json(account)

})


router.delete('/accounts/:user', (req, res) => {
  const user = req.params.user;
  const account = db[user]

  if (!account) {
    return res
      .status(400)
      .json({error: 'user not found'});
  }

  delete db[user];
    return res
      .status(204);
})


// register all routes 
app.use(apiRoot, router);

app.listen(port, () => {
  console.log(('server up !!'));
})
