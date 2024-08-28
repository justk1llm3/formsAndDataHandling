// controllers/usersController.js
const usersStorage = require("../storages/usersStorage");

exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

exports.usersCreatePost = (req, res) => {
  const { firstName, lastName, email } = req.body;
  usersStorage.addUser({ firstName, lastName, email });
  res.redirect("/");
};
// This just shows the new stuff we're adding to the existing contents
const { body, validationResult } = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
  body("firstName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
  body("lastName").trim()
    .isAlpha().withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`Last name ${lengthErr}`),
  body("email").trim()
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),  // Optional: to normalize the email address
];


// We can pass an entire array of middleware validations to our controller.
exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user",
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email } = req.body;
    usersStorage.addUser({ firstName, lastName, email });
    res.redirect("/");
  }
];
exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);
  res.render("updateUser", {
    title: "Update user",
    user: user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user",
        user: user,
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email } = req.body;
    usersStorage.updateUser(req.params.id, { firstName, lastName, email });
    res.redirect("/");
  }
];
exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect("/");
};

exports.searchUser = (req, res) => {
  const { name, email } = req.query;

  let filteredUsers = usersStorage.getUsers();

  if (name) {
    const lowerCaseName = name.toLowerCase();
    filteredUsers = filteredUsers.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        fullName.includes(lowerCaseName) || 
        user.firstName.toLowerCase().includes(lowerCaseName) || 
        user.lastName.toLowerCase().includes(lowerCaseName)
      );
    });
  }

  if (email) {
    filteredUsers = filteredUsers.filter(user =>
      user.email.toLowerCase().includes(email.toLowerCase())
    );
  }

  res.render('search', { users: filteredUsers });
};