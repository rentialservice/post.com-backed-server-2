import jwt from 'jsonwebtoken';

export const signJwt = (user) => {
  const token = jwt.sign(user, process.env.SECRET_KEY);
  return token;
};

export const verifyJwt = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) return res.status(403).json({ error: 'Forbidden' });
  const bearerToken = bearerHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(bearerToken, process.env.SECRET_KEY);
    req.decoded = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: 'Forbidden' });
  }
};
