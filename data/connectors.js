import Sequelize from 'sequelize';
import casual from 'casual';
import Mongoose from 'mongoose';
import _ from 'lodash';

//MongoDB =========================================================
Mongoose.Promise = global.Promise;

const mongo = Mongoose.connect('mongodb://localhost/views', {
  useMongoClient: true
});

const ViewSchema = Mongoose.Schema({
    postId: Number,
    views: Number,
  });

const View = Mongoose.model('views', ViewSchema);
//=================================================================

//SQLLite =========================================================
const db = new Sequelize('blog', null, null, {
    dialect: 'sqlite',
    storage: './blog.sqlite',
});

const AuthorModel = db.define('author', {
    firstName: { type: Sequelize.STRING },
    lastName: { type: Sequelize.STRING },
});

const PostModel = db.define('post', {
    title: { type: Sequelize.STRING },
    text: { type: Sequelize.STRING },
});
AuthorModel.hasMany(PostModel);
PostModel.belongsTo(AuthorModel);
//=================================================================

// create mock data with a seed, so we always get the same randoms
casual.seed(123);
db.sync({ force: true }).then(() => {
    _.times(10, () => {
        return AuthorModel.create({
            firstName: casual.first_name,
            lastName: casual.last_name,
        }).then((author) => {
            _.times(3, () => {
                return author.createPost({
                    title: `A post by ${author.firstName} - ` + casual.title,
                    text: casual.sentences(3),
                }).then((post) => {
                    return View.update(
                        { postId: post.id },
                        { views: casual.integer(0, 100) },
                        { upsert: true });
                });
            });
        });
    });
});

//SQLLite
const Author = db.models.author;
const Post = db.models.post;


export { Author, Post, View };