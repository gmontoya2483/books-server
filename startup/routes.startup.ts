import ServerClass from "../classes/server.class";
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet';

import error from "../middlewares/error.middleware";
const log_request = require('../middlewares/log_request.middleware');
const authorized = require('../middlewares/auth.middleware');
const validated = require('../middlewares/validated.middleware');

import mensajes from "../routes/example.route";
import users from "../routes/users.route"
import auth from "../routes/auth.route"
import uploads from "../routes/upload.route"
import countries from "../routes/country.route"
import communities from "../routes/community.route"
import me from "../routes/me.route"
import me_following from "../routes/me.following.route"
import me_follower from "../routes/me.follower.route"
import me_community from "../routes/me.community.route"
import me_token from "../routes/me.token.route"
import me_img from "../routes/me.img.route"
import img from "../routes/img.route"


module.exports = function(server: ServerClass){

    // Helmet
    server.app.use(helmet());

    // BodyParser
    server.app.use( bodyParser.urlencoded({ extended: true}));
    server.app.use(bodyParser.json());

    // CORS
    server.app.use( cors({origin: true, credentials: true }));

    // Routes
    server.app.use('/api/example', mensajes);
    server.app.use('/api/users', [log_request], users);
    server.app.use('/api/auth', [log_request], auth);
    server.app.use('/api/uploads', uploads);
    server.app.use('/api/countries', [log_request, authorized, validated] ,countries);
    server.app.use('/api/communities', [log_request, authorized, validated], communities);

    server.app.use('/api/me', [log_request, authorized, validated], me);
    server.app.use('/api/me/following', [log_request, authorized, validated],me_following);
    server.app.use('/api/me/followers', [log_request, authorized, validated], me_follower);
    server.app.use('/api/me/community',[log_request, authorized, validated], me_community);
    server.app.use('/api/me/token',[log_request, authorized, validated], me_token);
    server.app.use('/api/me/img', [log_request, authorized, validated], me_img);


    server.app.use('/api/img', img);

    // Error Middleware
    server.app.use(error);

}
