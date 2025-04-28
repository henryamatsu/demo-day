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
  
  // PREFERNCES SECTION =========================
  app.get('/preferences', isLoggedIn, function(req, res) {    
    db.collection('users').find({_id: req.user._id}).toArray((err, result) => {

      if (err) return console.log(err)
      res.render('preferences.ejs', {
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

// User Preferences routes ===============================================================
    app.put('/getUserData', async (req, res) => {
      try {
        const user = await db.collection('users').findOne({_id: req.user._id});
        res.json(user);
      }
      catch (err) {
        console.log(err);
        res.send(err);
      }
    });

    app.post('/updatePreferences', async (req, res) => {
      try {
        const userId = app.locals.ObjectId(req.body._id);
  
        const frequency = req.body.frequency;
        const grade1 = req.body.grade1 ? true : false;
        const grade2 = req.body.grade2 ? true : false;
        const grade3 = req.body.grade3 ? true : false;
  
        await db.collection('users').findOneAndUpdate({_id: userId}, {
          $set: {
            "local.preferences.frequency": frequency,
            "local.preferences.grades.grade1": grade1,
            "local.preferences.grades.grade2": grade2,
            "local.preferences.grades.grade3": grade3
          }
        }, {
          sort: {_id: -1},
          upsert: true
        });
  
        res.send();  
      }
      catch (err) {
        console.log(err);
        res.send(err);
      }
    }) 

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
