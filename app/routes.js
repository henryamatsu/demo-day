module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('users').find({_id: req.user._id}).toArray((err, result) => {

          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : result[0]
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// pizza routes ===============================================================
    app.put('/orderPizza', async (req, res) => {
      try {
        const userId = req.app.locals.ObjectId(req.body._id);
        const user = await db.collection('users').findOne({_id: userId});
        const pastOrders = user.local.pastOrders || [];
        const newOrder = req.body.toppings;

        if (checkForNewPizza(newOrder, pastOrders)) {
          pastOrders.push(req.body.toppings);
        }

        if (pastOrders.length > 3) {
          pastOrders.shift();
        }
          
        await db.collection('users').findOneAndUpdate({_id:userId}, {
          $set: {
            "local.pastOrders": pastOrders,
          }
        }, {
          sort: {_id: -1},
          upsert: true
        })

        res.json({pastOrders});
      }
      catch (err) {
        console.log(err);
        res.send(err);
      }
    })

    app.put("/getPastOrders", async (req,res) => {
      try {
        const userId = req.app.locals.ObjectId(req.body._id);
        const user = await db.collection('users').findOne({_id: userId});
        const pastOrders = user.local.pastOrders || [];
  
        res.json({pastOrders});  
      }
      catch(err) {
        console.log(err);
        res.send(err);
      }
    });

    function checkForNewPizza(newOrder, pastOrders) {
      const orderChecker = new Set();

      pastOrders.forEach(order => {
        orderChecker.add(order.join());
      });

      return !orderChecker.has(newOrder.join());
    }

    app.get ('/getPastPizzas', async (req,res) => {})

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
