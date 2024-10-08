const bcrypt = require('bcrypt')
const User = require('../Model/User')
const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.PostSignup = (req, res, next) => {
    const { name, email, password } = req.body;

    User.findOne({where:{ 'email': email }})
        .then(existingUser => {
            if (existingUser) {
                return res.status(200).json({ success: false, message: 'This email already has an account' });
            }

            
            bcrypt.hash(password, 10, async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false, message: 'Signup failed err',err  });
                }

                const user = await User.create({
                    name: name,
                    email: email,
                    password: result,
                    

                });

                if(user) {
                    console.log(user)
                        return res.status(200).json({ success: true, message: 'register successful' });
                    }
                   else {
                        
                        return res.status(500).json({ success: false, message: 'register failed save'});
                    }
            });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ success: false, message: 'register failed' ,err});
        });
};

exports.PostLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Email is', email,password);

        const user = await User.findOne( {where:{ 'email': email }} );

        if (user) {
            const result = await bcrypt.compare(password, user.password);
            if (result === true) {
                console.log(user)
                return res.status(200).json({
                    success: true,
                    message: "Logged In Successfully",
                    playerName : user.name,
                    token: generateAccesstoken(user.id, user.email)
                });
            } else {
                return res.status(401).json({success:false,message: 'User not authorized'});
            }
        } else {
            return res.status(404).send({success:false,message:'User not Found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

    

    
        
function generateAccesstoken(id,email){
    const secretKey = process.env.Token_SecretKey;
    console.log(secretKey);

    return jwt.sign({userId : id , Email:email},secretKey)
}