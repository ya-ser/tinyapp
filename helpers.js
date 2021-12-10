const getUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.hasOwnProperty("email") && user.email === email) {
      //checking if user has email in the first place and seeing if that email is equal to the one we're passing in the for loop
      return user;
    }
  }
  return null;
};

module.exports = { getUserByEmail };