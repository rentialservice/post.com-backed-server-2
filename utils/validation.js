import Joi from "joi";

export const addUserValidation = (data) => {
  const schema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    dob: Joi.date().required(),
  }).options({ abortEarly: false });

  const { error, value } = schema.validate(data);
  return { error, value };
};

export const addTweetValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    text: Joi.string().required(),
    categories: Joi.array().items(Joi.string()).required(),
    media: Joi.object().optional(),
    resource_type: Joi.string().optional(),
  }).options({ abortEarly: false });

  const { error, value } = schema.validate(data);
  return { error, value };
};


export const addRetweetValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    tweetId: Joi.string().required(),
  }).options({ abortEarly: false });

  const { error, value } = schema.validate(data);
  return { error, value };
};

export const bookmarkValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    tweetId: Joi.string().required(),
  }).options({ abortEarly: false });

  const { error, value } = schema.validate(data);
  return { error, value };
};

export function extractHashtags(tweetContent) {
  const regex = /#(\w+)/g;
  return (tweetContent.match(regex) || []).map((match) => match.slice(1));
}

export function extractTaggedUsers(tweetContent) {
  const regex = /@(\w+)/g;
  return (tweetContent.match(regex) || []).map((match) => match.slice(1));
}

export function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function validatePassword(password) {
  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}
