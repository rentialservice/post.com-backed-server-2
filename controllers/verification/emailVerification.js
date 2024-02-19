import { User } from "../../sequelize.js";
import { sendOtpToEmail } from "../../utils/utils.js";


export const sendOtp = async (req, res, next) =>{

    // check if user exists
    const ExistingUser = await User.findOne({
      where: { email:req.body.email },
    });

    if(ExistingUser){
        res.status(400).send({
            message : "User already registered, please login...!"
        })
    }else{
        const otpToken = await sendOtpToEmail(req, res, next); 

        res.status(201).send({
            message : "otp sent successfully",
            otpToken:otpToken
        })
    }

    
}



 
