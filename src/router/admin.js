module.exports = function (app) {
    var Admin = require('../controllers/Admin');

    const { check } = require('express-validator');
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;

    function generateAccessToken(key) {
        // expires after half and hour (1800 seconds = 30 minutes)
        const accessToken = jwt.sign({ mobile: key }, JWT_SECRET, { expiresIn: '31000000s' });
        return accessToken;
    }
    
    function authenticateToken(req, res, next) {
        // Gather the jwt access token from the request header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[0];

        //console.log(authHeader.split(' '));
        if (token == null) return res.sendStatus(401) // if there isn't any token
    
        jwt.verify(token, process.env.JWT_SECRET, (err, mobile) => {
          if (err) return res.sendStatus(401)
          req.token = generateAccessToken(mobile);
          next() // pass the execution off to whatever request the client intended
        })
    }

    app

    /// Create User ///
    .post('/admin/create-user', [
        check('full_name').trim().isLength({ min: 1 }).withMessage('Enter full name'),
        check('mobile').trim().isLength({ min: 1 }).withMessage('Enter mobile number'),
        check('email').trim().isLength({ min: 1 }).withMessage('Enter email address').isEmail().withMessage('Invalid email address'),
        check('password').trim().isLength({ min: 1 }).withMessage('Enter password')
    ], Admin.create_user)
    
    /// Login User ///

    .post('/admin/login', [
        check('email').trim().isLength({ min: 1 }).withMessage('Enter email address').isEmail().withMessage('Invalid email address'),
        check('password').trim().isLength({ min: 1 }).withMessage('Enter password')
    ], Admin.login)

    /// Create Post ///

    .post('/admin/create-post', [
        check('user').trim().isLength({ min: 1 }).withMessage('Enter user id'),
        check('title').trim().isLength({ min: 1 }).withMessage('Enter title'),
        check('details').trim().isLength({ min: 1 }).withMessage('Enter details')
    ], authenticateToken, Admin.add_post)

    .post('/admin/post-list', [
    ], Admin.post_list)

    .post('/admin/single-post', [
    ], Admin.single_post)

    .post('/admin/update-post', [
        check('id').trim().isLength({ min: 1 }).withMessage('Enter post id'),
        check('user').trim().isLength({ min: 1 }).withMessage('Enter user id')
    ], Admin.update_post)

    .post('/admin/delete-post', [
        check('id').trim().isLength({ min: 1 }).withMessage('Enter post id'),
        check('user').trim().isLength({ min: 1 }).withMessage('Enter user id')
    ], Admin.delete_post)

    /// Start Comment

    .post('/admin/create-comment', [
        check('user').trim().isLength({ min: 1 }).withMessage('Enter user id'),
        check('comment').trim().isLength({ min: 1 }).withMessage('Enter comment'),
        check('post').trim().isLength({ min: 1 }).withMessage('Enter post id')
    ],authenticateToken, Admin.add_comment)
}