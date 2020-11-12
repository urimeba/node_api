const moongose = require('mongoose');
const Schema = moongose.Schema;

const postSchema = new Schema({
        title: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    { timestamps: true }
);

module.exports = moongose.model('Post', postSchema);