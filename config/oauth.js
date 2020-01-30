const passport = require('passport')
const { Strategy } = require('openid-client')
const { Issuer } = require('openid-client')
var OidcStrategy = require('passport-openidconnect').Strategy

passport.use(
    new OidcStrategy(
        {
            // authorizationURL: 'http://192.168.4.140:7050/connect/authorize',
            // tokenURL: 'http://192.168.4.140:7050/connect/token',
            // clientID: 'cjournal-web',
            // clientSecret: 'i3m0c78ko9cojdqjq706e5u4',
            // callbackURL: 'http://localhost:3333/api/oauth/callback',
            issuer: `http://217.197.236.242:7050`,
            authorizationURL: `http://217.197.236.242:7050/connect/authorize`,
            tokenURL: `http://217.197.236.242:7050/connect/token`,
            userInfoURL: `http://217.197.236.242:7050/connect/userinfo`,
            clientID: `cjournal-web`,
            clientSecret: `i3m0c78ko9cojdqjq706e5u4`,
            callbackURL: 'http://localhost:3333/api/oauth/callback',
            scope: `openid email offline_access`,
        },
        (issuer, sub, profile, accessToken, refreshToken, done) => {
            return done(null, profile)
        },
    ),
)

passport.serializeUser((user, next) => {
    next(null, user)
})

passport.deserializeUser((obj, next) => {
    next(null, obj)
})
