const { jwtAuthMiddleware } = require('../jwt')
const User = require('./../models/user')
const express = require('express')
const router = express.Router()

router.post('/signup',async(req, res) => {
    try{
        const data = req.body

        const newUser = new User(data);

        const response = await newUser.save()
        console.log('data saved')

        const payload = {
            id: response.id,
            username: response.username
        }
        console.log(JSON.stringify(payload))
        const token = generateToken(payload)
        console.log("Token is: ",token)


        res.status(200).json({response: response, token: token})
    }catch(error){
        console.error("There is some error ")
    }
})


router.post('/login',async(req,res)=> {
        try{
            const {aadharCardNumber, password} = req.body;

            const user = await User. findOne({aadharCardNumber:  aadharCardNumber})

            if(!user || !(await user.comparePassword(password))){
                return res.status(401).json({error: 'Invalid userName or password'}) 
            }

            const payload = {
                id: user.id,
                username: user.username
            }
            const token = generateToken(payload)


            res.json(token)
        }catch(error){
            console.error("There is some error in login")
            res.status(500).json({error: 'Internal Server Error'})
        }
})

router.get('/profile/password', jwtAuthMiddleware, async(req,res)=> {
    try{
      const userId = req.user.userId
      const {currentPassword, newPassword} = req.body;

      const user = await User.findById(userId)

      if(!(await user.comparePassword(currentPassword))){
        return res.status(401).json({error: "Invalid Username or password"})
      }

      user.password = newPassword
      await user.save()

      console.log('Password updated!')
      res.status(200).json({ message: 'Password updated' });
    }catch(error){
        console.log("Error:",error)
        res.status(500).json({error: "Internal Server Error"})
            
    }
})

module.exports = router;
 