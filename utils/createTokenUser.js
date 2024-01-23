const createTokenUser = (user) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  return { name: fullName, userId: user._id, role: user.role };
};

module.exports = createTokenUser;
