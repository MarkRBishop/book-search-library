const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }) 
            }
            throw AuthenticationError;
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const validPw = await user.isCorrectPassword(password)

            if (!validPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);

            return { token, user }
        },
        addNewUser: async (parent, { username, email, password }) => {
             const user = await User.create({ username, email, password });
             const token = signToken(user);
             return { token, user };
        },
        saveBook: async (parent,  saveBookContent, context ) => {
            const user = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: saveBookContent.book }},
                { new: true }
            )

            if (!user) {
                throw AuthenticationError;
            }

            return user;
        },
        removeBook: async (parent, {bookId}, context ) => {
          if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId } } },
              { new: true }
            );
            return updatedUser;
          }
          throw new Error('You need to be logged in!');
        }
    }
}

module.exports = resolvers;
