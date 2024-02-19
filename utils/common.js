import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const  validateInputs=(...values)=>{
    for (let value of values) {
        if (value === undefined || value === null) {
            return true; // Validation failed
        }
    }
    return false; // Validation passed for all values
}

export const hashPassword=(password)=>{
    return bcrypt.hashSync(password, 10);
}

export const comparePassword=(password, hashedPassword)=>{
    return bcrypt.compareSync(password, hashedPassword);
}

export const GenSign=async(payload,secret)=>{
    try {
        return await jwt.sign(payload,secret,{expiresIn:"30d"});
    } catch (error) {
        return error;
    }
}

export const ValidateSign=async(token,secret)=>{
    try {
        const payload=await jwt.verify(token,secret);
        return payload;
    } catch (error) {
        return error;
    }
}

export const imageCategory={
    avatar:"avatar",
    cover:"cover",
    media:"media"
}

export const getImageName = (imagename = "") => {
    return Date.now().toString() + imagename;
  };